/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Store
export { createWalletStore } from './store/createWalletStore';
export type { CreateWalletStoreOptions } from './store/createWalletStore';
export {
  getSessionPassword,
  setSessionPassword,
  SESSION_PASSWORD_KEY,
} from './store/slices/authSlice';

// Storages
export {
  AsyncStorageAdapter,
  ExtensionStorageAdapter,
  LocalStorageAdapter,
} from './adapters/storage';

// Provider
export { WalletProvider, WalletStoreContext } from './providers/WalletProvider';
export type { WalletProviderProps } from './providers/WalletProvider';

// Hooks
export {
  useWalletStore,
  useWalletStoreApi,
  useWalletKit,
  useAuth,
  useWallet,
  useTonConnect,
  useTransactionRequests,
  useSignDataRequests,
  useSignMessageRequests,
  useDisconnectEvents,
  useNfts,
  useJettons,
  useRates,
  useSwap,
  useStaking,
  useGasless,
  useBrotherhood,
} from './hooks/useWalletStore';
export {
  createBrotherhoodSlice,
  normalizeAddressByNetwork,
  EMPTY_CIRCLE,
  EMPTY_RING,
} from './store/slices/brotherhoodSlice';
export {
  useFormattedTonBalance,
  useFormattedAmount,
} from './hooks/useFormattedBalance';
export { useWalletInitialization } from './hooks/useWalletInitialization';
export type { WalletInitializationState } from './hooks/useWalletInitialization';
export { useShallow } from 'zustand/react/shallow';

// Types
export type {
  AppState,
  AuthSlice,
  WalletCoreSlice,
  WalletManagementSlice,
  TonConnectSlice,
  JettonsSlice,
  NftsSlice,
  RatesSlice,
  RateEntry,
  SwapSlice,
  StakingSlice,
  GaslessSlice,
  GaslessState,
  GaslessQuoteRequest,
  BrotherhoodSlice,
  BrotherhoodMemberData,
} from './types/store';

export type {
  SavedWallet,
  AuthState,
  PreviewTransaction,
  DisconnectNotification,
  QueuedRequest,
  QueuedRequestData,
  RequestQueue,
  LedgerConfig,
  WalletKitConfig,
  CreateLedgerTransportFunction,
} from './types/wallet';

// Utils (optional exports)
export * from './utils';
