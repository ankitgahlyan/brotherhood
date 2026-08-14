import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  generateSalt,
  hashPassword,
  SimpleEncryption,
  verifyPassword,
} from '../crypto';
import {
  ACTIVE_WALLET_ID_KEY,
  clearWalletStore,
  getActiveWalletId,
  getPasswordHash,
  getSavedWallets,
  getWalletById,
  PASSWORD_HASH_KEY,
  removeWallet,
  SavedWallet,
  saveWallet,
  setActiveWalletId,
  setPasswordHash,
  WALLET_STORE_KEY,
} from '../storage';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Tier 1: AES-GCM Crypto & LocalStorage Persistence (Features 2 & 6)', () => {
  // Category A: Web Crypto AES-GCM, PBKDF2-SHA512, Password Hashing
  describe('AES-GCM Crypto & Password Security', () => {
    test('2.1 should encrypt plaintext data and produce base64 string containing salt (16B) + IV (12B)', async () => {
      const plaintext = 'apple city dance earth forest giant heavy ice jungle kingdom lemon mountain';
      const password = 'StrongPassword123!';

      const encrypted = await SimpleEncryption.encrypt(plaintext, password);
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(40);

      // Decoded buffer length must be >= 16 (salt) + 12 (iv) + ciphertext
      const buffer = Buffer.from(encrypted, 'base64');
      expect(buffer.length).toBeGreaterThanOrEqual(28 + plaintext.length);
    });

    test('2.2 should decrypt valid AES-GCM base64 payload back to exact original plaintext', async () => {
      const originalText = '24 word seed phrase containing confidential user backup secret words';
      const password = 'MySecurePassword#2026';

      const encrypted = await SimpleEncryption.encrypt(originalText, password);
      const decrypted = await SimpleEncryption.decrypt(encrypted, password);

      expect(decrypted).toBe(originalText);
    });

    test('2.3 should throw error when attempting to decrypt with incorrect password', async () => {
      const originalText = 'secret data';
      const password = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';

      const encrypted = await SimpleEncryption.encrypt(originalText, password);
      expect(
        SimpleEncryption.decrypt(encrypted, wrongPassword)
      ).rejects.toThrow();
    });

    test('2.4 should generate random 16-byte base64 salt', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(typeof salt1).toBe('string');
      expect(Buffer.from(salt1, 'base64').length).toBe(16);
      expect(salt1).not.toBe(salt2);
    });

    test('2.5 should compute deterministic SHA-256 password hash and verify correctly', async () => {
      const password = 'UserMasterPassword';
      const hash = await hashPassword(password);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // 256 bits = 64 hex chars

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBeTrue();

      const isInvalid = await verifyPassword('IncorrectMasterPassword', hash);
      expect(isInvalid).toBeFalse();
    });

    test('2.6 should fail decryption on malformed or truncated payload', async () => {
      const password = 'Password123';
      const truncatedBase64 = Buffer.from(new Uint8Array(10)).toString('base64'); // Only 10 bytes (< 28)

      expect(
        SimpleEncryption.decrypt(truncatedBase64, password)
      ).rejects.toThrow('Invalid encrypted payload size');
    });
  });

  // Category B: LocalStorage Persistence & Schema Management
  describe('LocalStorage Wallet Persistence', () => {
    let origLocalStorage: any;

    beforeEach(() => {
      origLocalStorage = (globalThis as any).localStorage;
      (globalThis as any).localStorage = new LocalStorageMock();
    });

    afterEach(() => {
      (globalThis as any).localStorage = origLocalStorage;
    });

    test('2.7 should save and retrieve a SavedWallet object in localStorage', () => {
      const wallet: SavedWallet = {
        id: 'wallet_1700000000_abc123',
        name: 'Main Wallet',
        address: 'EQA1234567890abcdefghijklmnopqrstuvwxyz123456789',
        publicKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        encryptedMnemonic: 'base64EncryptedMnemonicString==',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: 1700000000,
      };

      const updatedList = saveWallet(wallet);
      expect(updatedList.length).toBe(1);
      expect(updatedList[0]).toEqual(wallet);

      const retrieved = getSavedWallets();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0]).toEqual(wallet);

      const singleRetrieved = getWalletById(wallet.id);
      expect(singleRetrieved).toEqual(wallet);
    });

    test('2.8 should automatically set initial active wallet ID when saving first wallet', () => {
      const wallet: SavedWallet = {
        id: 'wallet_first',
        name: 'First Wallet',
        address: 'EQFirst123',
        publicKey: '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
        encryptedMnemonic: 'enc1',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: Date.now(),
      };

      expect(getActiveWalletId()).toBeNull();
      saveWallet(wallet);
      expect(getActiveWalletId()).toBe('wallet_first');
    });

    test('2.9 should update existing wallet in localStorage when saving with identical ID', () => {
      const wallet: SavedWallet = {
        id: 'wallet_to_update',
        name: 'Old Name',
        address: 'EQOldAddress',
        publicKey: '00',
        encryptedMnemonic: 'enc1',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: 1000,
      };

      saveWallet(wallet);

      const updatedWallet: SavedWallet = {
        ...wallet,
        name: 'New Updated Name',
      };

      const newList = saveWallet(updatedWallet);
      expect(newList.length).toBe(1);
      expect(newList[0].name).toBe('New Updated Name');
    });

    test('2.10 should remove a wallet by ID and reassign active wallet if active wallet was removed', () => {
      const w1: SavedWallet = {
        id: 'w1',
        name: 'W1',
        address: 'EQ1',
        publicKey: '11',
        encryptedMnemonic: 'enc1',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: 1,
      };
      const w2: SavedWallet = {
        id: 'w2',
        name: 'W2',
        address: 'EQ2',
        publicKey: '22',
        encryptedMnemonic: 'enc2',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: 2,
      };

      saveWallet(w1);
      saveWallet(w2);
      setActiveWalletId('w1');

      const remaining = removeWallet('w1');
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('w2');
      expect(getActiveWalletId()).toBe('w2');
    });

    test('2.11 should clear all wallet store keys upon calling clearWalletStore()', () => {
      const w1: SavedWallet = {
        id: 'w1',
        name: 'W1',
        address: 'EQ1',
        publicKey: '11',
        encryptedMnemonic: 'enc1',
        walletType: 'mnemonic',
        version: 'v5r1',
        network: 'mainnet',
        createdAt: 1,
      };

      saveWallet(w1);
      setPasswordHash('stored_hash_123');
      setActiveWalletId('w1');

      expect(getSavedWallets().length).toBe(1);
      expect(getPasswordHash()).toBe('stored_hash_123');
      expect(getActiveWalletId()).toBe('w1');

      clearWalletStore();

      expect(getSavedWallets()).toEqual([]);
      expect(getPasswordHash()).toBeNull();
      expect(getActiveWalletId()).toBeNull();
    });

    test('2.12 should handle corrupted JSON in localStorage gracefully returning empty array', () => {
      localStorage.setItem(WALLET_STORE_KEY, 'invalid{json:corrupted');
      const wallets = getSavedWallets();
      expect(wallets).toEqual([]);
    });
  });
});
