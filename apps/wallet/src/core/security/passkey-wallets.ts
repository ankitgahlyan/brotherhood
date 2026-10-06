/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';
import type { NetworkType } from '@demo/wallet-core';

import {
  authenticateTelegramBiometrics,
  initTelegramBiometrics,
  saveTelegramBiometricsPassword,
} from '../lib/telegram';
import {
  PASSKEY_BACKED_UP_RECORDS_KEY,
  TELEGRAM_BUNDLE_CACHE_KEY,
  base64ToBuffer,
  bufferToBase64,
  enrollBiometricVaultWithCredentialId,
  formatTelegramBiometricToken,
  hasTelegramBiometricManager,
  isBiometricsSupported,
  isSecureContextAvailable,
  notifyBiometricsChanged,
  parseTelegramBiometricToken,
} from './biometrics';

export const PASSKEY_RECORD_BYTES = 64;
const RECORD_MAGIC = 0x42; // 'B'
const RECORD_VERSION = 0x10; // v1

const FLAG_MAINNET = 0x01;
const FLAG_V4R2 = 0x02;
const FLAG_SIGNER = 0x04;
const FLAG_WORDS_12 = 0x08;

const WORD_TO_INDEX = new Map<string, number>(
  englishWordlist.map((word, index) => [word, index]),
);

export interface PasskeyWalletPayload {
  mnemonic: string[];
  name: string;
  network: NetworkType;
  version?: 'v5r1' | 'v4r2';
  subwalletId?: number;
  interfaceType?: 'mnemonic' | 'signer';
}

export interface SavePasskeyResult {
  savedCount: number;
  usedLargeBlob: boolean;
}

export interface RestorePasskeyResult {
  wallets: PasskeyWalletPayload[];
  credentialId?: string;
  vaultPassword?: string;
}

function computeRecordChecksum(record: Uint8Array): number {
  let hash = 0x97;
  for (let i = 0; i < PASSKEY_RECORD_BYTES; i++) {
    if (i === 6) continue;
    hash = Math.imul(hash ^ record[i], 0x01000193) & 0xff;
  }
  return hash;
}

function getWalletKey(wallet: PasskeyWalletPayload): string {
  const normalizedWords = wallet.mnemonic
    .map((w) => w.trim().toLowerCase())
    .join(' ');
  const resolvedSubwalletId =
    wallet.subwalletId ??
    (wallet.network === 'testnet' ? 2147483645 : 2147483409);
  return `${normalizedWords}:${wallet.network}:${resolvedSubwalletId}`;
}

/**
 * Generates a cryptographically strong random local password for passwordless Passkey restore.
 */
export function generateRandomVaultPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return bufferToBase64(bytes);
}

/**
 * Encodes a single 12- or 24-word wallet + metadata into a 64-byte WebAuthn userHandle record.
 *
 * Byte layout (64 bytes total):
 * - [0]:     Magic byte (0x42 = 'B')
 * - [1]:     Version nibble (0x10) | flags (network, version, interfaceType, 12-word flag)
 * - [2..5]:  subwalletId (Uint32 big-endian)
 * - [6]:     Checksum byte over [0..5] and [7..63]
 * - [7..39]: 33 bytes (264 bits) of 11-bit BIP-39 word indices
 * - [40..63]: 24 bytes of UTF-8 wallet name (zero-padded)
 */
export function encodePasskeyWalletRecord(
  wallet: PasskeyWalletPayload,
): Uint8Array {
  const words = wallet.mnemonic
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
  if (words.length !== 12 && words.length !== 24) {
    throw new Error(
      `Passkey backup requires a 12 or 24-word recovery phrase (received ${words.length} words)`,
    );
  }

  const record = new Uint8Array(PASSKEY_RECORD_BYTES);
  record[0] = RECORD_MAGIC;

  let flags = RECORD_VERSION;
  if (wallet.network === 'mainnet') flags |= FLAG_MAINNET;
  if (wallet.version === 'v4r2') flags |= FLAG_V4R2;
  if (wallet.interfaceType === 'signer') flags |= FLAG_SIGNER;
  if (words.length === 12) flags |= FLAG_WORDS_12;
  record[1] = flags;

  const resolvedSubwalletId =
    wallet.subwalletId ??
    (wallet.network === 'testnet' ? 2147483645 : 2147483409);
  const view = new DataView(
    record.buffer,
    record.byteOffset,
    record.byteLength,
  );
  view.setUint32(2, resolvedSubwalletId >>> 0, false);

  let bitPos = 0;
  for (let i = 0; i < words.length; i++) {
    const idx = WORD_TO_INDEX.get(words[i]);
    if (idx === undefined) {
      throw new Error(`Word "${words[i]}" is not a valid BIP-39 English word`);
    }
    for (let b = 10; b >= 0; b--) {
      const bit = (idx >> b) & 1;
      const byteIndex = 7 + (bitPos >> 3);
      const bitOffset = 7 - (bitPos & 7);
      if (bit) {
        record[byteIndex] |= 1 << bitOffset;
      }
      bitPos++;
    }
  }

  const cleanName = wallet.name.trim() || 'Wallet';
  const nameSlice = record.subarray(40, 64);
  new TextEncoder().encodeInto(cleanName, nameSlice);

  record[6] = computeRecordChecksum(record);
  return record;
}

/**
 * Decodes a 64-byte record back into a PasskeyWalletPayload, or returns null if invalid.
 */
export function decodePasskeyWalletRecord(
  input: ArrayBuffer | Uint8Array,
): PasskeyWalletPayload | null {
  const record = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (record.byteLength !== PASSKEY_RECORD_BYTES) {
    return null;
  }
  if (record[0] !== RECORD_MAGIC) {
    return null;
  }
  const flags = record[1];
  if ((flags & 0xf0) !== RECORD_VERSION) {
    return null;
  }
  if (record[6] !== computeRecordChecksum(record)) {
    return null;
  }

  const network: NetworkType =
    (flags & FLAG_MAINNET) !== 0 ? 'mainnet' : 'testnet';
  const version: 'v5r1' | 'v4r2' = (flags & FLAG_V4R2) !== 0 ? 'v4r2' : 'v5r1';
  const interfaceType: 'mnemonic' | 'signer' =
    (flags & FLAG_SIGNER) !== 0 ? 'signer' : 'mnemonic';
  const wordCount = (flags & FLAG_WORDS_12) !== 0 ? 12 : 24;

  const view = new DataView(
    record.buffer,
    record.byteOffset,
    record.byteLength,
  );
  const subwalletId = view.getUint32(2, false);

  const mnemonic: string[] = [];
  let bitPos = 0;
  for (let i = 0; i < wordCount; i++) {
    let idx = 0;
    for (let b = 10; b >= 0; b--) {
      const byteIndex = 7 + (bitPos >> 3);
      const bitOffset = 7 - (bitPos & 7);
      const bit = (record[byteIndex] >> bitOffset) & 1;
      idx = (idx << 1) | bit;
      bitPos++;
    }
    const word = englishWordlist[idx];
    if (!word) {
      return null;
    }
    mnemonic.push(word);
  }

  const nameBytes = record.subarray(40, 64);
  let nameLen = 0;
  while (nameLen < nameBytes.length && nameBytes[nameLen] !== 0) {
    nameLen++;
  }
  const decodedName =
    new TextDecoder().decode(nameBytes.subarray(0, nameLen)).trim() || 'Wallet';

  return {
    mnemonic,
    name: decodedName,
    network,
    version,
    subwalletId,
    interfaceType,
  };
}

/**
 * Concatenates multiple 64-byte wallet records into a binary bundle for WebAuthn largeBlob or Telegram token storage.
 */
export function encodePasskeyWalletBundle(
  wallets: readonly PasskeyWalletPayload[],
): Uint8Array {
  const unique: PasskeyWalletPayload[] = [];
  const seen = new Set<string>();
  for (const w of wallets) {
    const key = getWalletKey(w);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(w);
    }
  }

  const bundle = new Uint8Array(unique.length * PASSKEY_RECORD_BYTES);
  unique.forEach((wallet, index) => {
    const record = encodePasskeyWalletRecord(wallet);
    bundle.set(record, index * PASSKEY_RECORD_BYTES);
  });
  return bundle;
}

/**
 * Decodes a binary bundle (1 or more 64-byte records) into deduplicated PasskeyWalletPayload items.
 */
export function decodePasskeyWalletBundle(
  input: ArrayBuffer | Uint8Array | null | undefined,
): PasskeyWalletPayload[] {
  if (!input) return [];
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0 || bytes.byteLength % PASSKEY_RECORD_BYTES !== 0) {
    return [];
  }

  const wallets: PasskeyWalletPayload[] = [];
  const seen = new Set<string>();
  const count = bytes.byteLength / PASSKEY_RECORD_BYTES;

  for (let i = 0; i < count; i++) {
    const slice = bytes.subarray(
      i * PASSKEY_RECORD_BYTES,
      (i + 1) * PASSKEY_RECORD_BYTES,
    );
    const decoded = decodePasskeyWalletRecord(slice);
    if (decoded) {
      const key = getWalletKey(decoded);
      if (!seen.has(key)) {
        seen.add(key);
        wallets.push(decoded);
      }
    }
  }

  return wallets;
}

function getBackedUpRecordSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(PASSKEY_BACKED_UP_RECORDS_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw) as string[];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function markRecordBackedUp(recordId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getBackedUpRecordSet();
    set.add(recordId);
    localStorage.setItem(
      PASSKEY_BACKED_UP_RECORDS_KEY,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // ignore storage quota errors
  }
}

function formatPasskeyLabel(
  wallet: PasskeyWalletPayload,
  totalInBundle = 1,
): string {
  const netTag = wallet.network === 'mainnet' ? 'Mainnet' : 'Testnet';
  if (totalInBundle > 1) {
    return `BrotherHood (${wallet.name} + ${totalInBundle - 1} more • ${netTag})`;
  }
  return `BrotherHood: ${wallet.name} (${netTag})`;
}

async function createDiscoverableWalletPasskey(
  wallet: PasskeyWalletPayload,
  label: string,
  requestLargeBlob: boolean,
): Promise<{
  credential: PublicKeyCredential;
  recordBase64: string;
  largeBlobSupported: boolean;
}> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const recordBytes = encodePasskeyWalletRecord(wallet);
  const recordBase64 = bufferToBase64(recordBytes);

  const publicKeyOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'BrotherHood Wallet',
    },
    user: {
      id: recordBytes as BufferSource,
      name: label,
      displayName: label,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'required',
      requireResidentKey: true,
    },
    timeout: 60000,
    ...(requestLargeBlob
      ? {
          extensions: {
            largeBlob: { support: 'preferred' },
          } as AuthenticationExtensionsClientInputs,
        }
      : {}),
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey registration was not completed');
  }

  const extResults = credential.getClientExtensionResults() as {
    largeBlob?: { supported?: boolean };
  };

  return {
    credential,
    recordBase64,
    largeBlobSupported: Boolean(extResults?.largeBlob?.supported),
  };
}

/**
 * Saves one or more mnemonic wallets into the mobile OS Passkey keystore (or Telegram BiometricManager inside TWA).
 *
 * Strategy:
 * 1. Inside Telegram Mini App: packs up to 11 wallets into a compact binary bundle stored inside
 *    Telegram's hardware-backed BiometricManager token alongside the vault password.
 * 2. On Web / PWA: creates a discoverable Passkey with the primary wallet's 64-byte record in `user.id`
 *    (supported on 100% of mobile keystores in 1 tap). If multiple wallets are provided, tries WebAuthn
 *    `largeBlob` first, and falls back to storing 1 compact 64-byte Passkey per independent wallet.
 */
export async function saveWalletsToPasskey(
  wallets: readonly PasskeyWalletPayload[],
  vaultPassword?: string,
): Promise<SavePasskeyResult> {
  const validWallets = wallets.filter(
    (w) => w.mnemonic.length === 12 || w.mnemonic.length === 24,
  );
  if (validWallets.length === 0) {
    throw new Error('No mnemonic wallets available to back up to Passkey');
  }

  if (!isSecureContextAvailable() && !hasTelegramBiometricManager()) {
    throw new Error('Passkeys require a secure connection (HTTPS).');
  }

  const supported = await isBiometricsSupported();
  if (!supported) {
    throw new Error('Passkeys are not supported on this device');
  }

  // Telegram Mini App hardware keystore path
  if (hasTelegramBiometricManager()) {
    await initTelegramBiometrics();
    const maxTgWallets = validWallets.slice(0, 11);
    const bundleBytes = encodePasskeyWalletBundle(maxTgWallets);
    const bundleBase64 = bufferToBase64(bundleBytes);
    try {
      localStorage.setItem(TELEGRAM_BUNDLE_CACHE_KEY, bundleBase64);
    } catch {
      // ignore storage errors
    }
    const effectivePassword = vaultPassword || generateRandomVaultPassword();
    const token = formatTelegramBiometricToken(effectivePassword, bundleBase64);
    const saved = await saveTelegramBiometricsPassword(
      token,
      'Backup BrotherHood Wallets to Keystore',
    );
    if (!saved) {
      return { savedCount: 0, usedLargeBlob: false };
    }
    notifyBiometricsChanged();
    return { savedCount: maxTgWallets.length, usedLargeBlob: true };
  }

  try {
    const primaryWallet = validWallets[0];
    const primaryLabel = formatPasskeyLabel(primaryWallet, validWallets.length);

    const { credential, recordBase64, largeBlobSupported } =
      await createDiscoverableWalletPasskey(
        primaryWallet,
        primaryLabel,
        validWallets.length > 1,
      );

    markRecordBackedUp(recordBase64);

    if (vaultPassword) {
      await enrollBiometricVaultWithCredentialId(
        bufferToBase64(credential.rawId),
        vaultPassword,
      );
    }

    if (validWallets.length === 1) {
      return { savedCount: 1, usedLargeBlob: false };
    }

    // Try writing all wallets into WebAuthn largeBlob if supported by the authenticator
    if (largeBlobSupported) {
      try {
        const bundleBytes = encodePasskeyWalletBundle(validWallets);
        const writeChallenge = crypto.getRandomValues(new Uint8Array(32));
        const writeAssertion = (await navigator.credentials.get({
          publicKey: {
            challenge: writeChallenge,
            allowCredentials: [
              {
                type: 'public-key',
                id: credential.rawId,
              },
            ],
            userVerification: 'preferred',
            timeout: 60000,
            extensions: {
              largeBlob: {
                write: bundleBytes,
              },
            } as AuthenticationExtensionsClientInputs,
          },
        })) as PublicKeyCredential | null;

        const writeExt = writeAssertion?.getClientExtensionResults() as
          { largeBlob?: { written?: boolean } } | undefined;
        if (writeExt?.largeBlob?.written) {
          for (const w of validWallets) {
            markRecordBackedUp(bufferToBase64(encodePasskeyWalletRecord(w)));
          }
          return { savedCount: validWallets.length, usedLargeBlob: true };
        }
      } catch (blobErr) {
        console.warn(
          '[Passkey] largeBlob write unsupported or skipped, falling back to per-wallet Passkeys:',
          blobErr,
        );
      }
    }

    // Fallback when largeBlob is unsupported (e.g. Android Google Password Manager):
    // Save each remaining wallet in its own 64-byte Passkey user.id
    let savedCount = 1;
    const backedUpSet = getBackedUpRecordSet();

    for (let i = 1; i < validWallets.length; i++) {
      const nextWallet = validWallets[i];
      const nextRecordBase64 = bufferToBase64(
        encodePasskeyWalletRecord(nextWallet),
      );
      if (backedUpSet.has(nextRecordBase64)) {
        savedCount++;
        continue;
      }
      const nextLabel = formatPasskeyLabel(nextWallet, 1);
      const nextRes = await createDiscoverableWalletPasskey(
        nextWallet,
        nextLabel,
        false,
      );
      markRecordBackedUp(nextRes.recordBase64);
      savedCount++;
    }

    return { savedCount, usedLargeBlob: false };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'NotAllowedError' || err.name === 'AbortError')
    ) {
      return { savedCount: 0, usedLargeBlob: false };
    }
    throw err;
  }
}

/**
 * Prompts the mobile OS Passkey picker (or Telegram BiometricManager) and decodes all stored wallet phrases.
 */
export async function restoreWalletsFromPasskey(): Promise<RestorePasskeyResult | null> {
  if (!isSecureContextAvailable() && !hasTelegramBiometricManager()) {
    throw new Error('Passkeys require a secure connection (HTTPS).');
  }

  if (hasTelegramBiometricManager()) {
    await initTelegramBiometrics();
    const rawToken = await authenticateTelegramBiometrics(
      'Restore BrotherHood Wallets from Keystore',
    );
    if (!rawToken) return null;

    const { password, bundleBase64 } = parseTelegramBiometricToken(rawToken);
    const resolvedBundle =
      bundleBase64 ||
      (typeof window !== 'undefined'
        ? localStorage.getItem(TELEGRAM_BUNDLE_CACHE_KEY)
        : null);

    if (!resolvedBundle) {
      throw new Error(
        'No wallet backup found in Telegram Keystore. Please back up your wallets in Settings first.',
      );
    }

    const wallets = decodePasskeyWalletBundle(base64ToBuffer(resolvedBundle));
    if (wallets.length === 0) {
      throw new Error('Telegram Keystore backup could not be decoded.');
    }

    return {
      wallets,
      vaultPassword: password || undefined,
    };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    let assertion: PublicKeyCredential | null = null;

    try {
      assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: 'preferred',
          timeout: 60000,
          extensions: {
            largeBlob: { read: true },
          } as AuthenticationExtensionsClientInputs,
        },
      })) as PublicKeyCredential | null;
    } catch (extErr) {
      // Some older mobile authenticators reject unknown extensions; retry without largeBlob
      if (
        extErr instanceof Error &&
        (extErr.name === 'NotAllowedError' || extErr.name === 'AbortError')
      ) {
        throw extErr;
      }
      assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: 'preferred',
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;
    }

    if (!assertion) {
      return null;
    }

    const response = assertion.response as AuthenticatorAssertionResponse;
    const extResults = assertion.getClientExtensionResults() as {
      largeBlob?: { blob?: ArrayBuffer };
    };

    const combinedWallets: PasskeyWalletPayload[] = [];
    const seenKeys = new Set<string>();

    if (extResults?.largeBlob?.blob) {
      for (const w of decodePasskeyWalletBundle(extResults.largeBlob.blob)) {
        const key = getWalletKey(w);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combinedWallets.push(w);
        }
      }
    }

    if (response.userHandle) {
      const fromHandle = decodePasskeyWalletRecord(response.userHandle);
      if (fromHandle) {
        const key = getWalletKey(fromHandle);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combinedWallets.push(fromHandle);
        }
      }
    }

    if (combinedWallets.length === 0) {
      throw new Error(
        'Selected Passkey only contains an unlock token, not a recovery phrase. Please choose a BrotherHood wallet backup Passkey or back up your wallets in Settings.',
      );
    }

    for (const w of combinedWallets) {
      markRecordBackedUp(bufferToBase64(encodePasskeyWalletRecord(w)));
    }

    return {
      wallets: combinedWallets,
      credentialId: bufferToBase64(assertion.rawId),
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'NotAllowedError' || err.name === 'AbortError')
    ) {
      return null;
    }
    throw err;
  }
}
