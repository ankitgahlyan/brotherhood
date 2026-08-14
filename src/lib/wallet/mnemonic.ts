import {
  deriveEd25519Path,
  keyPairFromSeed,
  mnemonicNew,
  mnemonicToWalletKey,
  mnemonicValidate,
} from '@ton/crypto';
import { mnemonicToSeed } from '@scure/bip39';
import { Address } from '@ton/core';
import { DEFAULT_SUBWALLET_ID, WalletV5R1 } from './wallet-v5-r1';

export type MnemonicType = 'ton' | 'bip39';

/**
 * Normalizes input string or string[] into an array of words
 */
export function normalizeMnemonic(mnemonic: string[] | string): string[] {
  if (Array.isArray(mnemonic)) {
    return mnemonic.map((w) => w.trim().toLowerCase()).filter(Boolean);
  }
  return mnemonic.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Generates a new 12 or 24-word TON mnemonic seed
 */
export async function generateMnemonic(
  wordsCount: 12 | 24 = 24,
): Promise<string[]> {
  return mnemonicNew(wordsCount);
}

/**
 * Validates a 12 or 24-word mnemonic seed
 */
export async function validateMnemonic(
  mnemonic: string[] | string,
): Promise<boolean> {
  const words = normalizeMnemonic(mnemonic);
  if (words.length !== 12 && words.length !== 24) {
    return false;
  }
  try {
    return await mnemonicValidate(words);
  } catch {
    return false;
  }
}

export interface KeyPair {
  publicKey: Buffer;
  secretKey: Buffer;
}

/**
 * Derives Ed25519 keypair from a mnemonic using TON seed or BIP39 + SLIP-0010/BIP-0044 path m/44'/607'/0'
 */
export async function mnemonicToKeyPair(
  mnemonic: string[] | string,
  mnemonicType: MnemonicType = 'ton',
): Promise<KeyPair> {
  const words = normalizeMnemonic(mnemonic);

  if (words.length !== 12 && words.length !== 24) {
    throw new Error(
      `Invalid mnemonic length: expected 12 or 24 words, got ${words.length}`,
    );
  }

  if (mnemonicType === 'ton') {
    const key = await mnemonicToWalletKey(words);
    return {
      publicKey: Buffer.from(key.publicKey),
      secretKey: Buffer.from(key.secretKey),
    };
  }

  if (mnemonicType === 'bip39') {
    const seed = await mnemonicToSeed(words.join(' '));
    const TON_DERIVATION_PATH = [44, 607, 0];
    const seedContainer = await deriveEd25519Path(
      Buffer.from(seed),
      TON_DERIVATION_PATH,
    );
    const keyPair = keyPairFromSeed(seedContainer.subarray(0, 32));
    return {
      publicKey: Buffer.from(keyPair.publicKey),
      secretKey: Buffer.from(keyPair.secretKey),
    };
  }

  throw new Error(`Unsupported mnemonic type: ${mnemonicType}`);
}

export interface DerivedWalletV5R1 {
  address: Address;
  publicKey: Buffer;
  secretKey: Buffer;
  subwalletId: number;
  wallet: WalletV5R1;
}

/**
 * Derives a Wallet V5R1 address and contract instance from a mnemonic
 */
export async function deriveWalletV5R1(
  mnemonic: string[] | string,
  _network: 'mainnet' | 'testnet' = 'mainnet',
  subwalletId: number = DEFAULT_SUBWALLET_ID,
  mnemonicType: MnemonicType = 'ton',
): Promise<DerivedWalletV5R1> {
  const keyPair = await mnemonicToKeyPair(mnemonic, mnemonicType);
  const wallet = WalletV5R1.createFromPublicKey(
    keyPair.publicKey,
    subwalletId,
    0,
  );

  return {
    address: wallet.address,
    publicKey: keyPair.publicKey,
    secretKey: keyPair.secretKey,
    subwalletId,
    wallet,
  };
}
