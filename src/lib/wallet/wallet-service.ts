import {
  mnemonicNew,
  mnemonicValidate,
  mnemonicToPrivateKey,
} from '@ton/crypto';
import {
  Address,
  internal,
  SendMode,
  TonClient,
  WalletContractV5R1,
} from '@ton/ton';
import { decryptText, encryptText } from './crypto';
import type {
  SendTransactionParams,
  StoredWallet,
  UnlockedWallet,
} from './types';

const STORAGE_WALLETS_KEY = 'brotherhood_saved_wallets';
const STORAGE_ACTIVE_ID_KEY = 'brotherhood_active_wallet_id';

export function getStoredWallets(): StoredWallet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_WALLETS_KEY);
    return raw ? (JSON.parse(raw) as StoredWallet[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredWallets(wallets: StoredWallet[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(wallets));
}

export function getActiveWalletId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
}

export function setActiveWalletId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
  } else {
    localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
  }
}

export async function generateMnemonic(words: 12 | 24 = 24): Promise<string[]> {
  return mnemonicNew(words);
}

export async function validateMnemonic(mnemonic: string[]): Promise<boolean> {
  if (mnemonic.length !== 12 && mnemonic.length !== 24) return false;
  return mnemonicValidate(mnemonic);
}

export async function createWallet(
  name?: string,
  passcode?: string
): Promise<{ stored: StoredWallet; mnemonic: string[] }> {
  const mnemonic = await generateMnemonic(24);
  return importWallet(mnemonic, name, passcode);
}

export async function importWallet(
  mnemonic: string[],
  name?: string,
  passcode?: string
): Promise<{ stored: StoredWallet; mnemonic: string[] }> {
  const isValid = await validateMnemonic(mnemonic);
  if (!isValid) {
    throw new Error('Invalid seed phrase mnemonic. Please check your words.');
  }

  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const walletContract = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain: 0,
  });

  const address = walletContract.address.toString({ testOnly: true });
  const seedString = mnemonic.join(' ');
  const { ciphertext, salt, iv } = await encryptText(seedString, passcode);

  const existing = getStoredWallets();
  const id = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const walletName = name || `Wallet ${existing.length + 1}`;

  const stored: StoredWallet = {
    id,
    name: walletName,
    address,
    encryptedMnemonic: ciphertext,
    salt,
    iv,
    workchain: 0,
    version: 'v5r1',
    createdAt: Date.now(),
  };

  const updated = [...existing, stored];
  saveStoredWallets(updated);
  setActiveWalletId(id);

  return { stored, mnemonic };
}

export async function unlockWallet(
  stored: StoredWallet,
  passcode?: string
): Promise<UnlockedWallet> {
  const seedString = await decryptText(
    stored.encryptedMnemonic,
    stored.salt,
    stored.iv,
    passcode
  );

  const mnemonic = seedString.trim().split(/\s+/);
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const walletContract = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain: stored.workchain || 0,
  });

  return {
    stored,
    mnemonic,
    keyPair,
    walletContract,
  };
}

export async function sendWalletTransaction(
  unlocked: UnlockedWallet,
  params: SendTransactionParams,
  client: TonClient
): Promise<void> {
  const contract = client.open(unlocked.walletContract);
  const seqno = await contract.getSeqno();

  const toAddress =
    typeof params.to === 'string' ? Address.parse(params.to) : params.to;

  const transfer = unlocked.walletContract.createTransfer({
    seqno,
    secretKey: unlocked.keyPair.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [
      internal({
        to: toAddress,
        value: params.value,
        body: params.body,
        bounce: params.bounce ?? true,
        init: params.stateInit,
      }),
    ],
  });

  await contract.send(transfer);
}
