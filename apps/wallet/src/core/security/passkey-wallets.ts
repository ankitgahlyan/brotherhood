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
  readTelegramCloudStorageItem,
  saveTelegramBiometricsPassword,
  writeTelegramCloudStorageItem,
} from '../lib/telegram';
import {
  BIOMETRIC_DISABLED_KEY,
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

const ENCRYPTED_BUNDLES_STORAGE_KEY =
  'brotherhood_passkey_encrypted_bundles_v1';
const TELEGRAM_CLOUD_STORAGE_VAULT_KEY = 'bro_passkey_vault_v1';
const PASSKEY_VAULT_DB_NAME = 'brotherhood_passkey_vault_db';
const PASSKEY_VAULT_STORE_NAME = 'encrypted_bundles';
const PASSKEY_VAULT_DB_KEY = 'bundles_map';
const PASSKEY_VAULT_CACHE_NAME = 'brotherhood-passkey-vault-v1';
const PASSKEY_VAULT_CACHE_URL =
  'https://passkey.brotherhood.local/bundles.json';

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
  backedUpTag?: string;
}

export interface RestorePasskeyResult {
  wallets: PasskeyWalletPayload[];
  credentialId?: string;
  vaultPassword?: string;
}

interface EncryptedBundleEntry {
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: number;
}

type EncryptedBundleMap = Record<string, EncryptedBundleEntry>;

function computeRecordChecksum(record: Uint8Array): number {
  let hash = 0x97;
  for (let i = 0; i < PASSKEY_RECORD_BYTES; i++) {
    if (i === 6) continue;
    hash = Math.imul(hash ^ record[i], 0x01000193) & 0xff;
  }
  return hash;
}

export function getPasskeyWalletKey(wallet: PasskeyWalletPayload): string {
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
 * - [0]:      Magic byte (0x42 = 'B')
 * - [1]:      Version nibble (0x10) | flags (network, version, interfaceType, 12-word flag)
 * - [2..5]:   subwalletId (Uint32 big-endian)
 * - [6]:      Checksum byte over [0..5] and [7..63]
 * - [7..39]:  33 bytes (264 bits) of 11-bit BIP-39 word indices
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
 * Concatenates multiple 64-byte wallet records into a binary bundle.
 */
export function encodePasskeyWalletBundle(
  wallets: readonly PasskeyWalletPayload[],
): Uint8Array {
  const unique: PasskeyWalletPayload[] = [];
  const seen = new Set<string>();
  for (const w of wallets) {
    const key = getPasskeyWalletKey(w);
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
      const key = getPasskeyWalletKey(decoded);
      if (!seen.has(key)) {
        seen.add(key);
        wallets.push(decoded);
      }
    }
  }

  return wallets;
}

/**
 * Computes a one-way SHA-256 lookup tag from theimmutable identity bytes [0..39] of a 64-byte Passkey record
 * (flags + subwalletId + 33-byte packed mnemonic, ignoring wallet name renames).
 */
export async function computePasskeyRecordTag(
  recordBytes: Uint8Array,
): Promise<string> {
  const prefix = new TextEncoder().encode('bro_passkey_tag_v1:');
  const identitySlice = recordBytes.subarray(0, 40);
  const input = new Uint8Array(prefix.byteLength + identitySlice.byteLength);
  input.set(prefix, 0);
  input.set(identitySlice, prefix.byteLength);
  // Zero out checksum byte at index 6 of identitySlice since it depends on name bytes [40..63]
  input[prefix.byteLength + 6] = 0;

  const digest = await crypto.subtle.digest('SHA-256', input);
  return bufferToBase64(new Uint8Array(digest).subarray(0, 16));
}

export async function computeWalletPasskeyTag(
  wallet: PasskeyWalletPayload,
): Promise<string> {
  const record = encodePasskeyWalletRecord(wallet);
  return computePasskeyRecordTag(record);
}

/**
 * Derives an AES-256-GCM key from the immutable 33-byte mnemonic entropy [7..39] inside a Passkey userHandle.
 */
async function deriveBundleKeyFromRecord(
  recordBytes: Uint8Array,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const prefix = new TextEncoder().encode('bro_passkey_bundle_key_v1:');
  const entropySlice = recordBytes.subarray(7, 40);
  const keyMaterial = new Uint8Array(
    prefix.byteLength + entropySlice.byteLength,
  );
  keyMaterial.set(prefix, 0);
  keyMaterial.set(entropySlice, prefix.byteLength);

  const importedMaterial = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function openPasskeyVaultDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(PASSKEY_VAULT_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PASSKEY_VAULT_STORE_NAME)) {
          db.createObjectStore(PASSKEY_VAULT_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readIdbBundleMap(): Promise<EncryptedBundleMap | null> {
  const db = await openPasskeyVaultDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PASSKEY_VAULT_STORE_NAME, 'readonly');
      const store = tx.objectStore(PASSKEY_VAULT_STORE_NAME);
      const req = store.get(PASSKEY_VAULT_DB_KEY);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as EncryptedBundleMap) || null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

async function writeIdbBundleMap(map: EncryptedBundleMap): Promise<void> {
  const db = await openPasskeyVaultDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(PASSKEY_VAULT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PASSKEY_VAULT_STORE_NAME);
      store.put(map, PASSKEY_VAULT_DB_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

async function readCacheStorageBundleMap(): Promise<EncryptedBundleMap | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(PASSKEY_VAULT_CACHE_NAME);
    const res = await cache.match(PASSKEY_VAULT_CACHE_URL);
    if (!res || res.status !== 200) return null;
    const data = (await res.json()) as EncryptedBundleMap;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

async function writeCacheStorageBundleMap(
  map: EncryptedBundleMap,
): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(PASSKEY_VAULT_CACHE_NAME);
    const response = new Response(JSON.stringify(map), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put(PASSKEY_VAULT_CACHE_URL, response);
  } catch {
    // ignore CacheStorage quota errors
  }
}

function mergeEncryptedBundleMaps(
  target: EncryptedBundleMap,
  source: EncryptedBundleMap | null | undefined,
): void {
  if (!source || typeof source !== 'object') return;
  for (const [tag, entry] of Object.entries(source)) {
    if (!entry || typeof entry.ciphertext !== 'string') continue;
    const existing = target[tag];
    if (!existing || (entry.updatedAt ?? 0) >= (existing.updatedAt ?? 0)) {
      target[tag] = entry;
    }
  }
}

async function readEncryptedBundleMap(): Promise<EncryptedBundleMap> {
  const merged: EncryptedBundleMap = {};

  const [fromCache, fromIdb, fromTgCloudRaw] = await Promise.all([
    readCacheStorageBundleMap(),
    readIdbBundleMap(),
    readTelegramCloudStorageItem(TELEGRAM_CLOUD_STORAGE_VAULT_KEY),
  ]);

  mergeEncryptedBundleMaps(merged, fromCache);
  mergeEncryptedBundleMaps(merged, fromIdb);

  if (fromTgCloudRaw) {
    try {
      const parsedTg = JSON.parse(fromTgCloudRaw) as EncryptedBundleMap;
      mergeEncryptedBundleMaps(merged, parsedTg);
    } catch {
      // ignore parse errors
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ENCRYPTED_BUNDLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EncryptedBundleMap;
        mergeEncryptedBundleMaps(merged, parsed);
      }
    } catch {
      // ignore parse errors
    }
  }

  return merged;
}

async function persistEncryptedBundleMap(
  map: EncryptedBundleMap,
): Promise<void> {
  const serialized = JSON.stringify(map);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ENCRYPTED_BUNDLES_STORAGE_KEY, serialized);
    } catch {
      // ignore localStorage quota errors
    }
  }
  await Promise.all([
    writeIdbBundleMap(map),
    writeCacheStorageBundleMap(map),
    writeTelegramCloudStorageItem(TELEGRAM_CLOUD_STORAGE_VAULT_KEY, serialized),
  ]);
}

/**
 * Encrypts the full multi-wallet bundle under every wallet's Passkey record key and persists
 * the encrypted ciphertexts to localStorage, IndexedDB, CacheStorage, and Telegram CloudStorage.
 * Because the AES-256-GCM keys are derived from the 33-byte mnemonic entropy inside each Passkey's
 * userHandle (or Telegram Keystore 64-byte record), the stored ciphertexts can only be decrypted
 * after biometric authentication.
 */
export async function syncEncryptedPasskeyBundles(
  wallets: readonly PasskeyWalletPayload[],
): Promise<void> {
  const validWallets = wallets.filter(
    (w) => w.mnemonic.length === 12 || w.mnemonic.length === 24,
  );
  if (validWallets.length === 0) return;

  if (hasTelegramBiometricManager() && typeof window !== 'undefined') {
    try {
      if (!localStorage.getItem(TELEGRAM_BUNDLE_CACHE_KEY)) {
        const primaryRecord = encodePasskeyWalletRecord(validWallets[0]);
        localStorage.setItem(
          TELEGRAM_BUNDLE_CACHE_KEY,
          bufferToBase64(primaryRecord),
        );
      }
    } catch {
      // ignore storage errors
    }
  }

  const bundleBytes = encodePasskeyWalletBundle(validWallets);
  const map = await readEncryptedBundleMap();
  const now = Date.now();

  for (const wallet of validWallets) {
    const recordBytes = encodePasskeyWalletRecord(wallet);
    const tag = await computePasskeyRecordTag(recordBytes);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveBundleKeyFromRecord(recordBytes, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      bundleBytes as BufferSource,
    );

    map[tag] = {
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(encrypted),
      updatedAt: now,
    };
  }

  await persistEncryptedBundleMap(map);
}

async function decryptPasskeyBundleWithRecord(
  recordBytes: Uint8Array,
): Promise<PasskeyWalletPayload[]> {
  try {
    const tag = await computePasskeyRecordTag(recordBytes);
    const map = await readEncryptedBundleMap();
    const entry = map[tag];
    if (!entry) return [];

    const salt = new Uint8Array(base64ToBuffer(entry.salt));
    const iv = new Uint8Array(base64ToBuffer(entry.iv));
    const ciphertext = base64ToBuffer(entry.ciphertext);
    const key = await deriveBundleKeyFromRecord(recordBytes, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext,
    );
    return decodePasskeyWalletBundle(decrypted);
  } catch {
    return [];
  }
}

export function getBackedUpPasskeyTags(): Set<string> {
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

function markTagBackedUp(tag: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getBackedUpPasskeyTags();
    set.add(tag);
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
    return `BrotherHood: ${wallet.name} (+${totalInBundle - 1} synced • ${netTag})`;
  }
  return `BrotherHood: ${wallet.name} (${netTag})`;
}

async function createDiscoverableWalletPasskey(
  wallet: PasskeyWalletPayload,
  label: string,
): Promise<{
  credential: PublicKeyCredential;
  recordBytes: Uint8Array;
  tag: string;
}> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const recordBytes = encodePasskeyWalletRecord(wallet);
  const tag = await computePasskeyRecordTag(recordBytes);

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
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey registration was not completed');
  }

  return {
    credential,
    recordBytes,
    tag,
  };
}

/**
 * Saves a target wallet into the mobile OS Passkey keystore in a single user-gesture WebAuthn prompt,
 * AND encrypts the full multi-wallet bundle of all `wallets` into IndexedDB + CacheStorage + localStorage
 * + Telegram CloudStorage keyed by every wallet's Passkey userHandle.
 */
export async function saveWalletsToPasskey(
  wallets: readonly PasskeyWalletPayload[],
  vaultPassword?: string,
  targetWalletIndex = 0,
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

  // Telegram Mini App hardware keystore path:
  // Store a fixed-size 64-byte primary record (88 base64 chars) in Telegram BiometricManager
  // so Android Keystore block limits are never exceeded, and persist the AES-256-GCM encrypted
  // multi-wallet bundle in Telegram CloudStorage + IndexedDB + CacheStorage + localStorage.
  if (hasTelegramBiometricManager()) {
    await initTelegramBiometrics();
    const primaryRecordBytes = encodePasskeyWalletRecord(validWallets[0]);
    const primaryRecordBase64 = bufferToBase64(primaryRecordBytes);
    try {
      localStorage.setItem(TELEGRAM_BUNDLE_CACHE_KEY, primaryRecordBase64);
    } catch {
      // ignore storage errors
    }
    await syncEncryptedPasskeyBundles(validWallets);
    const effectivePassword = vaultPassword || generateRandomVaultPassword();
    const token = formatTelegramBiometricToken(
      effectivePassword,
      primaryRecordBase64,
    );
    const saved = await saveTelegramBiometricsPassword(
      token,
      'Backup BrotherHood Wallets to Keystore',
      true,
    );
    if (!saved) {
      return { savedCount: 0, usedLargeBlob: false };
    }
    try {
      localStorage.removeItem(BIOMETRIC_DISABLED_KEY);
    } catch {
      // ignore storage errors
    }
    for (const w of validWallets) {
      markTagBackedUp(await computeWalletPasskeyTag(w));
    }
    notifyBiometricsChanged();
    return {
      savedCount: validWallets.length,
      usedLargeBlob: validWallets.length > 1,
    };
  }

  try {
    const safeIndex = Math.min(
      Math.max(0, targetWalletIndex),
      validWallets.length - 1,
    );
    const targetWallet = validWallets[safeIndex];
    const label = formatPasskeyLabel(targetWallet, validWallets.length);

    // Trigger WebAuthn create immediately inside the user's click gesture
    const { credential, tag } = await createDiscoverableWalletPasskey(
      targetWallet,
      label,
    );

    markTagBackedUp(tag);

    // Persist the AES-256-GCM encrypted bundle of ALL wallets bound to every wallet's Passkey userHandle
    await syncEncryptedPasskeyBundles(validWallets);

    if (vaultPassword) {
      await enrollBiometricVaultWithCredentialId(
        bufferToBase64(credential.rawId),
        vaultPassword,
      );
    }

    return {
      savedCount: validWallets.length,
      usedLargeBlob: validWallets.length > 1,
      backedUpTag: tag,
    };
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
 * Restores both the selected Passkey's 64-byte userHandle wallet AND any multi-wallet bundle encrypted
 * under that Passkey's userHandle in Telegram CloudStorage / IndexedDB / CacheStorage / localStorage.
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

    const rawBytes = new Uint8Array(base64ToBuffer(resolvedBundle));
    const combinedWallets: PasskeyWalletPayload[] = [];
    const seenKeys = new Set<string>();

    const addUniqueWallet = (w: PasskeyWalletPayload) => {
      const key = getPasskeyWalletKey(w);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        combinedWallets.push(w);
      }
    };

    for (const w of decodePasskeyWalletBundle(rawBytes)) {
      addUniqueWallet(w);
    }

    if (rawBytes.byteLength >= PASSKEY_RECORD_BYTES) {
      const primaryRecord = rawBytes.subarray(0, PASSKEY_RECORD_BYTES);
      const fromEncryptedVault =
        await decryptPasskeyBundleWithRecord(primaryRecord);
      for (const w of fromEncryptedVault) {
        addUniqueWallet(w);
      }
    }

    if (combinedWallets.length === 0) {
      throw new Error('Telegram Keystore backup could not be decoded.');
    }

    try {
      localStorage.setItem(TELEGRAM_BUNDLE_CACHE_KEY, resolvedBundle);
      localStorage.removeItem(BIOMETRIC_DISABLED_KEY);
    } catch {
      // ignore storage errors
    }

    for (const w of combinedWallets) {
      markTagBackedUp(await computeWalletPasskeyTag(w));
    }
    notifyBiometricsChanged();

    return {
      wallets: combinedWallets,
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

    const addUniqueWallet = (w: PasskeyWalletPayload) => {
      const key = getPasskeyWalletKey(w);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        combinedWallets.push(w);
      }
    };

    if (response.userHandle) {
      const handleBytes = new Uint8Array(response.userHandle);
      const fromHandle = decodePasskeyWalletRecord(handleBytes);
      if (fromHandle) {
        addUniqueWallet(fromHandle);
        // Decrypt the full multi-wallet bundle unlocked by this Passkey's userHandle
        const fromEncryptedVault =
          await decryptPasskeyBundleWithRecord(handleBytes);
        for (const w of fromEncryptedVault) {
          addUniqueWallet(w);
        }
      }
    }

    if (extResults?.largeBlob?.blob) {
      for (const w of decodePasskeyWalletBundle(extResults.largeBlob.blob)) {
        addUniqueWallet(w);
      }
    }

    if (combinedWallets.length === 0) {
      throw new Error(
        'Selected Passkey only contains an unlock token, not a recovery phrase. Please choose a BrotherHood wallet backup Passkey or back up your wallets in Settings.',
      );
    }

    for (const w of combinedWallets) {
      markTagBackedUp(await computeWalletPasskeyTag(w));
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
