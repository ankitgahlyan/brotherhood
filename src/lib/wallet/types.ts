import type { Address, Cell, StateInit, WalletContractV5R1 } from '@ton/ton';
import type { KeyPair } from '@ton/crypto';

export interface StoredWallet {
  id: string;
  name: string;
  address: string;
  encryptedMnemonic: string;
  salt: string;
  iv: string;
  workchain: number;
  version: 'v5r1';
  createdAt: number;
}

export interface UnlockedWallet {
  stored: StoredWallet;
  mnemonic: string[];
  keyPair: KeyPair;
  walletContract: WalletContractV5R1;
}

export interface SendTransactionParams {
  to: string | Address;
  value: bigint;
  body?: Cell;
  bounce?: boolean;
  stateInit?: StateInit;
}
