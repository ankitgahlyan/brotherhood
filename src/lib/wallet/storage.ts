export const WALLET_STORE_KEY = 'brotherhood_wallet_store';
export const PASSWORD_HASH_KEY = 'brotherhood_password_hash';
export const ACTIVE_WALLET_ID_KEY = 'brotherhood_active_wallet_id';

export interface SavedWallet {
  id: string;
  name: string;
  address: string;
  publicKey: string; // hex string
  encryptedMnemonic: string; // base64 string
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

/**
 * Retrieves list of saved wallets from localStorage
 */
export function getSavedWallets(): SavedWallet[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WALLET_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as SavedWallet[];
    }
    return [];
  } catch (error) {
    console.error('Failed to parse saved wallets from localStorage:', error);
    return [];
  }
}

/**
 * Saves or updates a wallet in localStorage
 */
export function saveWallet(wallet: SavedWallet): SavedWallet[] {
  if (typeof localStorage === 'undefined') return [];
  const current = getSavedWallets();
  const existingIdx = current.findIndex((w) => w.id === wallet.id);

  let updated: SavedWallet[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = wallet;
  } else {
    updated = [...current, wallet];
  }

  try {
    localStorage.setItem(WALLET_STORE_KEY, JSON.stringify(updated));
    if (!getActiveWalletId()) {
      setActiveWalletId(wallet.id);
    }
  } catch (error) {
    console.error('Failed to save wallet to localStorage:', error);
  }

  return updated;
}

/**
 * Removes a wallet by ID from localStorage
 */
export function removeWallet(id: string): SavedWallet[] {
  if (typeof localStorage === 'undefined') return [];
  const current = getSavedWallets();
  const updated = current.filter((w) => w.id !== id);

  try {
    localStorage.setItem(WALLET_STORE_KEY, JSON.stringify(updated));
    if (getActiveWalletId() === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveWalletId(nextId);
    }
  } catch (error) {
    console.error('Failed to remove wallet from localStorage:', error);
  }

  return updated;
}

/**
 * Retrieves a single wallet by ID
 */
export function getWalletById(id: string): SavedWallet | undefined {
  return getSavedWallets().find((w) => w.id === id);
}

/**
 * Retrieves active wallet ID from localStorage
 */
export function getActiveWalletId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACTIVE_WALLET_ID_KEY);
}

/**
 * Sets active wallet ID in localStorage
 */
export function setActiveWalletId(id: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_WALLET_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_WALLET_ID_KEY);
  }
}

/**
 * Retrieves stored password hash from localStorage
 */
export function getPasswordHash(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(PASSWORD_HASH_KEY);
}

/**
 * Saves password hash to localStorage
 */
export function setPasswordHash(hash: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (hash) {
    localStorage.setItem(PASSWORD_HASH_KEY, hash);
  } else {
    localStorage.removeItem(PASSWORD_HASH_KEY);
  }
}

/**
 * Clears wallet store and authentication credentials from localStorage
 */
export function clearWalletStore(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(WALLET_STORE_KEY);
  localStorage.removeItem(PASSWORD_HASH_KEY);
  localStorage.removeItem(ACTIVE_WALLET_ID_KEY);
}
