/**
 * TON Message Comment Encryption and Decryption for Web & Telegram Mini Apps
 * Reference: SimpleEncryptionV2 (TON Core specification)
 * https://docs.ton.org/v3/documentation/smart-contracts/message-management/internal-messages#encryption-algorithm
 */

import { Address, Builder, Cell } from '@ton/core';
import aesjs from '../lib/aes-js.js';
import { getSharedSecret } from '../lib/noble-ed25519.js';

export const OP_ENCRYPTED_COMMENT = 0x2167da4b;
export const TON_MAX_COMMENT_BYTES = 127;
export const ROOT_BUILDER_BYTES = 39;
export const MAX_CELLS_AMOUNT = 16;

/**
 * Derives HMAC-SHA512 using Web Crypto API.
 */
async function hmacSha512(
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  const hmacAlgo = { name: 'HMAC', hash: 'SHA-512' };
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    key as any,
    hmacAlgo,
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(hmacAlgo, hmacKey, data as any);
  const result = new Uint8Array(signature);
  if (result.length !== 64) {
    throw new Error('HMAC-SHA512 output length mismatch');
  }
  return result;
}

function getAesCbcState(hash: Uint8Array) {
  if (hash.length < 48) {
    throw new Error('AES key/IV hash is too short');
  }
  const key = hash.slice(0, 32);
  const iv = hash.slice(32, 48);
  return new (aesjs as any).ModeOfOperation.cbc(key, iv);
}

function getRandomPrefix(dataLength: number, minPadding: number): Uint8Array {
  const prefixLength = ((minPadding + 15 + dataLength) & -16) - dataLength;
  const prefix = crypto.getRandomValues(new Uint8Array(prefixLength));
  prefix[0] = prefixLength;
  if ((prefixLength + dataLength) % 16 !== 0) {
    throw new Error('Prefix padding calculation error');
  }
  return prefix;
}

function combineSecrets(a: Uint8Array, b: Uint8Array): Promise<Uint8Array> {
  return hmacSha512(a, b);
}

async function encryptDataWithPrefix(
  data: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  if (data.length % 16 !== 0) {
    throw new Error('Data length must be divisible by 16');
  }
  const dataHash = await combineSecrets(salt, data);
  const msgKey = dataHash.slice(0, 16);

  const res = new Uint8Array(data.length + 16);
  res.set(msgKey, 0);

  const cbcStateSecret = await combineSecrets(sharedSecret, msgKey);
  const encrypted = getAesCbcState(cbcStateSecret).encrypt(data);
  res.set(encrypted, 16);

  return res;
}

async function encryptDataImpl(
  data: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const prefix = getRandomPrefix(data.length, 16);
  const combined = new Uint8Array(prefix.length + data.length);
  combined.set(prefix, 0);
  combined.set(data, prefix.length);
  return encryptDataWithPrefix(combined, sharedSecret, salt);
}

export async function encryptData(
  data: Uint8Array,
  myPublicKey: Uint8Array,
  theirPublicKey: Uint8Array,
  privateKey: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const sharedSecret = await (getSharedSecret as any)(
    privateKey,
    theirPublicKey,
  );
  const encrypted = await encryptDataImpl(data, sharedSecret, salt);

  const prefixedEncrypted = new Uint8Array(
    myPublicKey.length + encrypted.length,
  );
  for (let i = 0; i < myPublicKey.length; i++) {
    prefixedEncrypted[i] = theirPublicKey[i] ^ myPublicKey[i];
  }
  prefixedEncrypted.set(encrypted, myPublicKey.length);
  return prefixedEncrypted;
}

export function toBounceableBase64Address(address: Address | string): string {
  const parsed = typeof address === 'string' ? Address.parse(address) : address;
  return parsed.toString({
    urlSafe: true,
    bounceable: true,
    testOnly: false,
  });
}

/**
 * Encrypts a text comment for a recipient using standard TON SimpleEncryptionV2.
 * Returns a 4-byte OpCode.Encrypted (0x2167da4b) prefixed payload.
 */
export async function encryptMessageComment(
  comment: string,
  myPublicKey: Uint8Array,
  theirPublicKey: Uint8Array,
  myPrivateKey: Uint8Array,
  senderAddress: Address | string,
): Promise<Uint8Array> {
  if (!comment || !comment.length) {
    throw new Error('Comment cannot be empty');
  }

  let privKey = myPrivateKey;
  if (privKey.length === 64) {
    privKey = privKey.slice(0, 32);
  }

  const commentBytes = new TextEncoder().encode(comment);
  const salt = new TextEncoder().encode(
    toBounceableBase64Address(senderAddress),
  );

  const encryptedBytes = await encryptData(
    commentBytes,
    myPublicKey,
    theirPublicKey,
    privKey,
    salt,
  );

  const payload = new Uint8Array(encryptedBytes.length + 4);
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(OP_ENCRYPTED_COMMENT, 0);

  payload.set(buffer, 0);
  payload.set(encryptedBytes, 4);

  return payload;
}

async function doDecrypt(
  cbcStateSecret: Uint8Array,
  msgKey: Uint8Array,
  encryptedData: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const decryptedData = getAesCbcState(cbcStateSecret).decrypt(encryptedData);
  const dataHash = await combineSecrets(salt, decryptedData);
  const gotMsgKey = dataHash.slice(0, 16);

  if (msgKey.join(',') !== gotMsgKey.join(',')) {
    throw new Error('Failed to decrypt: hash mismatch');
  }
  const prefixLength = decryptedData[0];
  if (prefixLength > decryptedData.length || prefixLength < 16) {
    throw new Error('Failed to decrypt: invalid prefix size');
  }
  return decryptedData.slice(prefixLength);
}

async function decryptDataImpl(
  encryptedData: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  if (encryptedData.length < 16) {
    throw new Error('Failed to decrypt: data is too small');
  }
  if (encryptedData.length % 16 !== 0) {
    throw new Error('Failed to decrypt: data size is not divisible by 16');
  }
  const msgKey = encryptedData.slice(0, 16);
  const data = encryptedData.slice(16);
  const cbcStateSecret = await combineSecrets(sharedSecret, msgKey);
  return doDecrypt(cbcStateSecret, msgKey, data, salt);
}

export async function decryptData(
  data: Uint8Array,
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  if (data.length < publicKey.length) {
    throw new Error('Failed to decrypt: data is too small');
  }
  const theirPublicKey = new Uint8Array(publicKey.length);
  for (let i = 0; i < publicKey.length; i++) {
    theirPublicKey[i] = data[i] ^ publicKey[i];
  }
  const sharedSecret = await (getSharedSecret as any)(
    privateKey,
    theirPublicKey,
  );
  return decryptDataImpl(data.slice(publicKey.length), sharedSecret, salt);
}

/**
 * Decrypts an encrypted TON comment payload (with or without the 4-byte opcode prefix).
 */
export async function decryptMessageComment(
  encryptedData: Uint8Array,
  myPublicKey: Uint8Array,
  myPrivateKey: Uint8Array,
  senderAddress: Address | string,
): Promise<string> {
  let data = encryptedData;
  // Check if starts with OP_ENCRYPTED_COMMENT (0x2167da4b)
  if (
    data.length >= 4 &&
    data[0] === 0x21 &&
    data[1] === 0x67 &&
    data[2] === 0xda &&
    data[3] === 0x4b
  ) {
    data = data.subarray(4);
  }

  let privKey = myPrivateKey;
  if (privKey.length === 64) {
    privKey = privKey.slice(0, 32);
  }

  const salt = new TextEncoder().encode(
    toBounceableBase64Address(senderAddress),
  );
  const decryptedBytes = await decryptData(data, myPublicKey, privKey, salt);
  return new TextDecoder().decode(decryptedBytes);
}

/**
 * Packs bytes into snake-cell chain.
 */
export function packBytesAsSnakeCell(bytes: Uint8Array): Cell {
  const bytesPerCell = TON_MAX_COMMENT_BYTES;
  const cellCount = Math.ceil(bytes.length / bytesPerCell);
  let headCell: Cell | undefined;

  for (let i = cellCount - 1; i >= 0; i--) {
    const cellOffset = i * bytesPerCell;
    const cellLength = Math.min(bytesPerCell, bytes.length - cellOffset);
    const cellBuffer = Buffer.from(
      bytes.buffer,
      bytes.byteOffset + cellOffset,
      cellLength,
    );

    const nextHeadCell = new Builder().storeBuffer(cellBuffer);
    if (headCell) {
      nextHeadCell.storeRef(headCell);
    }
    headCell = nextHeadCell.endCell();
  }

  return headCell ?? Cell.EMPTY;
}

/**
 * Packs encrypted comment bytes into TON snake cell layout.
 */
export function packBytesAsSnakeForEncryptedData(data: Uint8Array): Cell {
  if (
    data.length >
    ROOT_BUILDER_BYTES + MAX_CELLS_AMOUNT * TON_MAX_COMMENT_BYTES
  ) {
    throw new Error('Encrypted message is too long');
  }

  const rootBuffer = Buffer.from(
    data.subarray(0, Math.min(data.length, ROOT_BUILDER_BYTES)),
  );
  const remainder = data.subarray(ROOT_BUILDER_BYTES);

  const builder = new Builder().storeBuffer(rootBuffer);
  if (remainder.length > 0) {
    builder.storeRef(packBytesAsSnakeCell(remainder));
  }
  return builder.endCell();
}

/**
 * Reads a snake cell chain into a continuous Uint8Array.
 */
export function unpackSnakeCell(cell: Cell): Uint8Array {
  const slices: Uint8Array[] = [];
  let current: Cell | null = cell;

  while (current) {
    const slice = current.beginParse();
    const remainingBits = slice.remainingBits;
    const remainingBytes = Math.floor(remainingBits / 8);
    if (remainingBytes > 0) {
      slices.push(new Uint8Array(slice.loadBuffer(remainingBytes)));
    }
    current = slice.remainingRefs > 0 ? slice.loadRef() : null;
  }

  const totalLength = slices.reduce((acc, s) => acc + s.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const s of slices) {
    result.set(s, offset);
    offset += s.length;
  }
  return result;
}

export function isEncryptedCommentCell(cell: Cell): boolean {
  try {
    const slice = cell.beginParse();
    if (slice.remainingBits >= 32) {
      const op = slice.preloadUint(32);
      return op === OP_ENCRYPTED_COMMENT;
    }
  } catch {
    // Ignore
  }
  return false;
}

export async function tryDecryptComment(
  rawBytesOrBase64: string | Uint8Array | Cell,
  myPublicKey: Uint8Array,
  myPrivateKey: Uint8Array,
  senderAddress: Address | string,
): Promise<string | null> {
  try {
    let bytes: Uint8Array;
    if (rawBytesOrBase64 instanceof Cell) {
      bytes = unpackSnakeCell(rawBytesOrBase64);
    } else if (typeof rawBytesOrBase64 === 'string') {
      try {
        const cell = Cell.fromBase64(rawBytesOrBase64);
        bytes = unpackSnakeCell(cell);
      } catch {
        bytes = Buffer.from(rawBytesOrBase64, 'base64');
      }
    } else {
      bytes = rawBytesOrBase64;
    }

    if (
      bytes.length >= 4 &&
      bytes[0] === 0x21 &&
      bytes[1] === 0x67 &&
      bytes[2] === 0xda &&
      bytes[3] === 0x4b
    ) {
      return await decryptMessageComment(
        bytes,
        myPublicKey,
        myPrivateKey,
        senderAddress,
      );
    }
  } catch {
    // Return null if cannot decrypt
  }
  return null;
}
