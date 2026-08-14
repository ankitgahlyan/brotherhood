import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Address, TonClient } from '@ton/ton';
import {
  createWallet,
  getActiveWalletId,
  getStoredWallets,
  importWallet,
  saveStoredWallets,
  sendWalletTransaction,
  setActiveWalletId,
  unlockWallet,
} from '@/lib/wallet/wallet-service';
import type {
  SendTransactionParams,
  StoredWallet,
  UnlockedWallet,
} from '@/lib/wallet/types';

interface WalletContextType {
  wallets: StoredWallet[];
  activeWallet: StoredWallet | null;
  unlockedWallet: UnlockedWallet | null;
  balance: bigint | null;
  isUnlocked: boolean;
  isInitializing: boolean;
  error: string | null;
  client: TonClient;
  createNewWallet: (name?: string, passcode?: string) => Promise<{ stored: StoredWallet; mnemonic: string[] }>;
  importNewWallet: (mnemonic: string[], name?: string, passcode?: string) => Promise<{ stored: StoredWallet; mnemonic: string[] }>;
  unlockActiveWallet: (passcode?: string) => Promise<boolean>;
  lockWallet: () => void;
  selectActiveWallet: (id: string) => void;
  deleteWallet: (id: string) => void;
  sendTransaction: (params: SendTransactionParams) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const DEFAULT_RPC = 'https://testnet.toncenter.com/api/v2/jsonRPC';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<StoredWallet[]>([]);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [unlockedWallet, setUnlockedWallet] = useState<UnlockedWallet | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => {
    const apiKey = import.meta.env.VITE_TONCENTER_TESTNET_API_KEY;
    return new TonClient({
      endpoint: DEFAULT_RPC,
      apiKey: apiKey || undefined,
    });
  }, []);

  // Load stored wallets on initial mount
  useEffect(() => {
    try {
      const stored = getStoredWallets();
      setWallets(stored);
      const activeId = getActiveWalletId();
      if (activeId && stored.some((w) => w.id === activeId)) {
        setActiveWalletIdState(activeId);
      } else if (stored.length > 0) {
        setActiveWalletIdState(stored[0].id);
        setActiveWalletId(stored[0].id);
      }
    } catch (err) {
      console.error('Failed to load local wallets:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const activeWallet = useMemo(() => {
    return wallets.find((w) => w.id === activeWalletId) || null;
  }, [wallets, activeWalletId]);

  const refreshBalance = useCallback(async () => {
    if (!activeWallet) {
      setBalance(null);
      return;
    }
    try {
      const addr = Address.parse(activeWallet.address);
      const b = await client.getBalance(addr);
      setBalance(b);
    } catch (err) {
      console.warn('Failed to fetch wallet balance:', err);
    }
  }, [activeWallet, client]);

  // Unlock active wallet automatically with default key or passcode
  const unlockActiveWallet = useCallback(
    async (passcode?: string): Promise<boolean> => {
      if (!activeWallet) return false;
      try {
        setError(null);
        const unlocked = await unlockWallet(activeWallet, passcode);
        setUnlockedWallet(unlocked);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unlock failed';
        setError(msg);
        return false;
      }
    },
    [activeWallet]
  );

  // Auto-unlock with default passcode when active wallet changes if not unlocked yet
  useEffect(() => {
    if (activeWallet && (!unlockedWallet || unlockedWallet.stored.id !== activeWallet.id)) {
      unlockActiveWallet();
      refreshBalance();
    }
  }, [activeWallet, unlockActiveWallet, refreshBalance, unlockedWallet]);

  const lockWallet = useCallback(() => {
    setUnlockedWallet(null);
  }, []);

  const selectActiveWallet = useCallback((id: string) => {
    setActiveWalletIdState(id);
    setActiveWalletId(id);
    setUnlockedWallet(null);
  }, []);

  const deleteWallet = useCallback(
    (id: string) => {
      const updated = wallets.filter((w) => w.id !== id);
      setWallets(updated);
      saveStoredWallets(updated);
      if (activeWalletId === id) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        setActiveWalletIdState(nextId);
        setActiveWalletId(nextId);
        setUnlockedWallet(null);
      }
    },
    [wallets, activeWalletId]
  );

  const handleCreateNewWallet = useCallback(
    async (name?: string, passcode?: string) => {
      const result = await createWallet(name, passcode);
      const updated = getStoredWallets();
      setWallets(updated);
      setActiveWalletIdState(result.stored.id);
      await unlockWallet(result.stored, passcode).then((unlocked) => setUnlockedWallet(unlocked));
      return result;
    },
    []
  );

  const handleImportNewWallet = useCallback(
    async (mnemonic: string[], name?: string, passcode?: string) => {
      const result = await importWallet(mnemonic, name, passcode);
      const updated = getStoredWallets();
      setWallets(updated);
      setActiveWalletIdState(result.stored.id);
      await unlockWallet(result.stored, passcode).then((unlocked) => setUnlockedWallet(unlocked));
      return result;
    },
    []
  );

  const sendTransaction = useCallback(
    async (params: SendTransactionParams): Promise<void> => {
      if (!unlockedWallet) {
        throw new Error('Wallet is locked. Please unlock your wallet before sending transactions.');
      }
      await sendWalletTransaction(unlockedWallet, params, client);
      setTimeout(() => refreshBalance(), 2000);
    },
    [unlockedWallet, client, refreshBalance]
  );

  const value = useMemo(
    () => ({
      wallets,
      activeWallet,
      unlockedWallet,
      balance,
      isUnlocked: !!unlockedWallet,
      isInitializing,
      error,
      client,
      createNewWallet: handleCreateNewWallet,
      importNewWallet: handleImportNewWallet,
      unlockActiveWallet,
      lockWallet,
      selectActiveWallet,
      deleteWallet,
      sendTransaction,
      refreshBalance,
    }),
    [
      wallets,
      activeWallet,
      unlockedWallet,
      balance,
      isInitializing,
      error,
      client,
      handleCreateNewWallet,
      handleImportNewWallet,
      unlockActiveWallet,
      lockWallet,
      selectActiveWallet,
      deleteWallet,
      sendTransaction,
      refreshBalance,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useAppWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useAppWallet must be used within a WalletProvider');
  }
  return context;
}
