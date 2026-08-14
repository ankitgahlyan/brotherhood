# Scope: Milestone 1 — Wallet Core & Cryptography Infrastructure

## Architecture
Milestone 1 builds the foundational Wallet Core and Crypto Infrastructure layer (`src/lib/wallet/`) supporting TON `WalletV5R1`.

Components:
1. `wallet-v5-r1.ts`: WalletV5R1 contract instantiation (workchain 0, subwallet ID `2147483409`), config cell serializer, transfer cell builder (`0x7369676e`), Ed25519 signature payload construction, external message formatting.
2. `mnemonic.ts`: 12 and 24 word mnemonic seed generation via `@ton/crypto` (`mnemonicNew`), validation, keypair derivation via `@ton/crypto` (`mnemonicToWalletKey`) and `@scure/bip39`.
3. `crypto.ts`: Web Crypto AES-GCM encryption/decryption (`SimpleEncryption`) with PBKDF2-SHA512 key derivation (100,000 iterations, 16-byte salt, 12-byte IV), and password hash verification (`SHA-256(password + 'wallet_salt')`).
4. `storage.ts`: Client `localStorage` credential persistence schema (`brotherhood_wallet_store`, schema v2: `SavedWallet` array with base64 `encryptedMnemonic`).
5. `rpc-client.ts`: Direct BOC submission via `TonClient` (`sendBoc` / `/api/v3/message`), seqno fetching, and balance queries.
6. `index.ts`: Unified API export for downstream consumers (M2 WalletContext, M3 Direct Transaction Engine).

## Interface Contracts

```ts
export interface SavedWallet {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  encryptedMnemonic: string;
  walletType: 'mnemonic';
  version: 'v5r1';
  network: 'mainnet' | 'testnet';
  createdAt: number;
}

export interface WalletCredentials {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  encryptedMnemonic: string;
  network: 'mainnet' | 'testnet';
  createdAt: number;
}

export interface ActiveWalletState {
  wallet: WalletCredentials | null;
  secretKey: Buffer | null;
  isUnlocked: boolean;
  balance: bigint;
  subwalletId: number;
  contractAddress: Address;
}

export interface WalletCoreAPI {
  generateMnemonic(): Promise<string[]>;
  validateMnemonic(mnemonic: string[]): boolean;
  deriveWalletV5R1(mnemonic: string[], network?: 'mainnet' | 'testnet'): Promise<{
    address: Address;
    publicKey: Buffer;
    secretKey: Buffer;
    subwalletId: number;
  }>;
  encryptMnemonic(mnemonic: string[], password: string): Promise<string>;
  decryptMnemonic(encrypted: string, password: string): Promise<string[]>;
}
```

## Work Items
| # | File | Scope | Status |
|---|------|-------|--------|
| 1 | `src/lib/wallet/wallet-v5-r1.ts` | WalletV5R1 contract & adapter | PLANNED |
| 2 | `src/lib/wallet/mnemonic.ts` | Mnemonic generation & derivation | PLANNED |
| 3 | `src/lib/wallet/crypto.ts` | AES-GCM & PBKDF2-SHA512 encryption | PLANNED |
| 4 | `src/lib/wallet/storage.ts` | LocalStorage wallet persistence | PLANNED |
| 5 | `src/lib/wallet/rpc-client.ts` | TonClient RPC submission & state queries | PLANNED |
| 6 | `src/lib/wallet/index.ts` | Unified exports | PLANNED |
