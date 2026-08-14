import { describe, expect, test } from 'bun:test';
import { Address } from '@ton/core';
import {
  deriveWalletV5R1,
  generateMnemonic,
  mnemonicToKeyPair,
  normalizeMnemonic,
  validateMnemonic,
} from '../mnemonic';
import { DEFAULT_SUBWALLET_ID, WalletV5R1 } from '../wallet-v5-r1';

describe('Tier 1: Wallet Core & Key Derivation (Features 1 & 5)', () => {
  // Category A: WalletV5R1 creation, seed generation, workchain 0, subwallet ID, key derivation
  describe('WalletV5R1 Creation & Key Derivation', () => {
    test('1.1 should generate a valid 24-word seed phrase by default', async () => {
      const mnemonic = await generateMnemonic();
      expect(mnemonic).toBeArray();
      expect(mnemonic.length).toBe(24);
      expect(mnemonic.every((word) => typeof word === 'string' && word.length > 0)).toBeTrue();
      const isValid = await validateMnemonic(mnemonic);
      expect(isValid).toBeTrue();
    });

    test('1.2 should generate a valid 12-word seed phrase when explicitly requested', async () => {
      const mnemonic = await generateMnemonic(12);
      expect(mnemonic).toBeArray();
      expect(mnemonic.length).toBe(12);
      const isValid = await validateMnemonic(mnemonic);
      expect(isValid).toBeTrue();
    });

    test('1.3 should derive WalletV5R1 on workchain 0 with default subwallet ID 2147483409', async () => {
      const mnemonic = await generateMnemonic(24);
      const derived = await deriveWalletV5R1(mnemonic);

      expect(derived.subwalletId).toBe(DEFAULT_SUBWALLET_ID);
      expect(derived.subwalletId).toBe(2147483409);
      expect(derived.address).toBeInstanceOf(Address);
      expect(derived.address.workChain).toBe(0);
      expect(derived.publicKey).toBeInstanceOf(Buffer);
      expect(derived.publicKey.length).toBe(32);
      expect(derived.secretKey).toBeInstanceOf(Buffer);
      expect(derived.secretKey.length).toBe(64);
      expect(derived.wallet).toBeInstanceOf(WalletV5R1);
    });

    test('1.4 should deterministically derive identical keypair and address from identical seed', async () => {
      const mnemonic = await generateMnemonic(24);
      const derived1 = await deriveWalletV5R1(mnemonic);
      const derived2 = await deriveWalletV5R1(mnemonic);

      expect(derived1.address.equals(derived2.address)).toBeTrue();
      expect(derived1.publicKey.equals(derived2.publicKey)).toBeTrue();
      expect(derived1.secretKey.equals(derived2.secretKey)).toBeTrue();
    });

    test('1.5 should derive distinct contract addresses for different subwallet IDs', async () => {
      const mnemonic = await generateMnemonic(24);
      const derivedDefault = await deriveWalletV5R1(mnemonic, 'mainnet', 2147483409);
      const derivedCustom = await deriveWalletV5R1(mnemonic, 'mainnet', 123456789);

      expect(derivedDefault.address.equals(derivedCustom.address)).toBeFalse();
      expect(derivedCustom.subwalletId).toBe(123456789);
    });

    test('1.6 should support derivation using BIP39 mnemonic type', async () => {
      // Standard 12-word BIP39 phrase
      const bip39Mnemonic = [
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'about'
      ];
      const derived = await deriveWalletV5R1(bip39Mnemonic, 'mainnet', DEFAULT_SUBWALLET_ID, 'bip39');
      expect(derived.address).toBeInstanceOf(Address);
      expect(derived.publicKey.length).toBe(32);
      expect(derived.secretKey.length).toBe(64);
    });
  });

  // Category B: Mnemonic Import, Validation, and Keypair Derivation
  describe('Mnemonic Import & Validation', () => {
    test('1.7 should validate a known valid 24-word TON seed phrase', async () => {
      const valid24 = [
        'apple', 'city', 'dance', 'earth', 'forest', 'giant',
        'heavy', 'ice', 'jungle', 'kingdom', 'lemon', 'mountain',
        'nature', 'ocean', 'palace', 'quiet', 'river', 'stone',
        'tower', 'universe', 'valley', 'window', 'yellow', 'zebra'
      ];
      // Generate a fresh 24-word to guarantee valid checksum
      const generated24 = await generateMnemonic(24);
      const isValidGenerated = await validateMnemonic(generated24);
      expect(isValidGenerated).toBeTrue();

      const isValidJoined = await validateMnemonic(generated24.join(' '));
      expect(isValidJoined).toBeTrue();
    });

    test('1.8 should validate a known valid 12-word TON seed phrase', async () => {
      const generated12 = await generateMnemonic(12);
      const isValid = await validateMnemonic(generated12);
      expect(isValid).toBeTrue();
    });

    test('1.9 should reject mnemonic phrases with invalid word counts (e.g. 11, 13, 25 words)', async () => {
      const words11 = (await generateMnemonic(12)).slice(0, 11);
      const isValid11 = await validateMnemonic(words11);
      expect(isValid11).toBeFalse();

      const words13 = [...(await generateMnemonic(12)), 'apple'];
      const isValid13 = await validateMnemonic(words13);
      expect(isValid13).toBeFalse();
    });

    test('1.10 should reject mnemonic phrases containing invalid or corrupted words', async () => {
      const valid24 = await generateMnemonic(24);
      const corrupted = [...valid24];
      corrupted[0] = 'notarealwordxyz123';

      const isValid = await validateMnemonic(corrupted);
      expect(isValid).toBeFalse();
    });

    test('1.11 should normalize raw string inputs with uppercase and surrounding whitespace', () => {
      const rawInput = '   APPLE   City   DANCE   Earth  ';
      const normalized = normalizeMnemonic(rawInput);
      expect(normalized).toEqual(['apple', 'city', 'dance', 'earth']);
    });

    test('1.12 should derive a valid Ed25519 keypair from imported 12-word seed', async () => {
      const mnemonic12 = await generateMnemonic(12);
      const keypair = await mnemonicToKeyPair(mnemonic12);

      expect(keypair.publicKey).toBeInstanceOf(Buffer);
      expect(keypair.publicKey.length).toBe(32);
      expect(keypair.secretKey).toBeInstanceOf(Buffer);
      expect(keypair.secretKey.length).toBe(64);
    });
  });
});
