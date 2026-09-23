/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { StateCreator } from 'zustand';
import type {
  Wallet,
  JettonTransfer,
  JettonInfo,
  ITonWalletKit,
  TransactionsUpdate,
  NFT,
  Jetton,
  ConnectionRequestEvent,
  SendTransactionRequestEvent,
  SignDataRequestEvent,
  SignMessageRequestEvent,
  DisconnectionEvent,
  WalletAdapter,
  SwapQuote,
  SwapToken,
  StakingQuote,
  StakingQuoteParams,
  StakingBalance,
  StakingProviderInfo,
  StakeParams,
  UnstakeModes,
  GaslessQuote,
  GaslessSupportedAsset,
  SendTransactionResponse,
} from '@ton/walletkit';

import type { PendingTransaction } from './streaming';
import type {
  AuthState,
  SavedWallet,
  QueuedRequest,
  QueuedRequestData,
  RequestQueue,
  DisconnectNotification,
} from './wallet';
import type { NetworkType } from '../utils/network';

// Auth slice interface
export interface AuthSlice extends AuthState {
  setPassword: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  reset: () => void;
  setPersistPassword: (persist: boolean) => void;
  setHoldToSign: (enabled: boolean) => void;
  setShowFastSend: (enabled: boolean) => void;
  setUseWalletInterfaceType: (
    interfaceType: 'signer' | 'mnemonic' | 'ledger',
  ) => void;
  setLedgerAccountNumber: (accountNumber: number) => void;
}

// Wallet Core slice - WalletKit initialization and instance management
export interface WalletCoreSlice {
  walletCore: {
    walletKit: ITonWalletKit | null;
    isWalletKitInitialized: boolean;
    initializationError: string | null;
  };

  initializeWalletKit: (network?: NetworkType) => Promise<void>;
}

/** Local seqno + timestamp for fast send (prevents duplicate seqno on rapid clicks) */
export type LocalSeqnoEntry = { seqno: number; timestamp: number };

// Wallet Management slice - Wallet CRUD and data
export interface WalletManagementSlice {
  walletManagement: {
    savedWallets: SavedWallet[];
    activeWalletId?: string;
    address?: string;
    balance?: string;
    balancesByAddress: Record<string, string>;
    publicKey?: string;

    // Event history for active wallet and per-address cache
    events: unknown[];
    eventsByAddress: Record<string, unknown[]>;
    associatedAddressesByAddress?: Record<string, string[]>;
    hasNextEvents: boolean;

    /** Pending transactions from WebSocket streaming */
    pendingTransactions: PendingTransaction[];

    /** Trace IDs (trace_id) we've received as confirmed - never mix with trace_external_hash */
    confirmedTraceIds: string[];
    /** External hashes (trace_external_hash_norm) confirmed - never mix with trace_id */
    confirmedExternalHashes: string[];

    currentWallet?: Wallet;
    hasWallet: boolean;
    isAuthenticated: boolean;

    // WebSocket streaming state
    isStreamingConnected: boolean;
  };

  // Multi-wallet actions
  createWallet: (
    mnemonic: string[],
    name?: string,
    version?: 'v5r1',
    network?: NetworkType,
    subwalletId?: number,
  ) => Promise<string>;
  importWallet: (
    mnemonic: string[],
    name?: string,
    version?: 'v5r1',
    network?: NetworkType,
    subwalletId?: number,
  ) => Promise<string>;
  createLedgerWallet: (name?: string, network?: NetworkType) => Promise<string>;
  switchWallet: (walletId: string) => Promise<void>;
  removeWallet: (walletId: string) => void;
  renameWallet: (walletId: string, newName: string) => void;
  loadAllWallets: () => Promise<void>;
  loadSavedWalletsIntoKit: (walletKit: ITonWalletKit) => Promise<void>;
  createAdapterFromSavedWallet: (
    walletKit: ITonWalletKit,
    savedWallet: SavedWallet,
  ) => Promise<WalletAdapter | undefined>;

  // Wallet state actions
  clearWallet: () => void;
  updateBalance: () => Promise<void>;
  setAssociatedAddresses: (
    walletAddress: string,
    associatedAddresses: string[],
  ) => void;

  // WebSocket streaming & optimistic pending actions
  startWebSocketStreaming: () => Promise<void>;
  stopWebSocketStreaming: () => Promise<void>;
  updateWebSocketSubscription: () => Promise<void>;
  handleStreamingTransactions: (update: TransactionsUpdate) => void;
  addPendingTransaction: (pendingTx: PendingTransaction) => void;
  removePendingTransaction: (traceIdOrExternalHash: string) => void;
  clearPendingTransactions: () => void;

  // Events-based history
  // addEvent: (event: unknown) => void;
  loadEvents: (
    limit?: number,
    offset?: number,
    force?: boolean,
    tokenFilter?: string,
    extraAddresses?: string[],
  ) => Promise<void>;

  // Getters
  getDecryptedMnemonic: (walletId?: string) => Promise<string[] | null>;
  getAvailableWallets: () => Wallet[];
  getActiveWallet: () => SavedWallet | undefined;
}

// TON Connect slice - Connection requests, transactions, signing
export interface TonConnectSlice {
  tonConnect: {
    requestQueue: RequestQueue;
    pendingConnectRequestEvent?: ConnectionRequestEvent;
    isConnectModalOpen: boolean;
    pendingTransactionRequestEvent?: SendTransactionRequestEvent;
    isTransactionModalOpen: boolean;
    pendingSignDataRequestEvent?: SignDataRequestEvent;
    isSignDataModalOpen: boolean;
    pendingSignMessageRequestEvent?: SignMessageRequestEvent;
    isSignMessageModalOpen: boolean;
    disconnectedSessions: DisconnectNotification[];
  };

  // TON Connect actions
  handleTonConnectUrl: (url: string) => Promise<void>;
  showConnectRequest: (request: ConnectionRequestEvent) => void;
  approveConnectRequest: (selectedWallet: Wallet) => Promise<void>;
  rejectConnectRequest: (reason?: string) => Promise<void>;
  closeConnectModal: () => void;

  // Transaction request actions
  showTransactionRequest: (request: SendTransactionRequestEvent) => void;
  approveTransactionRequest: () => Promise<{ signedBoc: string } | undefined>;
  rejectTransactionRequest: (reason?: string) => Promise<void>;
  closeTransactionModal: () => void;

  // Sign data request actions
  showSignDataRequest: (request: SignDataRequestEvent) => void;
  approveSignDataRequest: () => Promise<void>;
  rejectSignDataRequest: (reason?: string) => Promise<void>;
  closeSignDataModal: () => void;

  // Sign message request actions
  showSignMessageRequest: (request: SignMessageRequestEvent) => void;
  approveSignMessageRequest: () => Promise<void>;
  rejectSignMessageRequest: (reason?: string) => Promise<void>;
  closeSignMessageModal: () => void;

  // Disconnect event actions
  handleDisconnectEvent: (event: DisconnectionEvent) => void;
  clearDisconnectNotifications: () => void;

  // Queue management
  enqueueRequest: (request: QueuedRequestData) => void;
  processNextRequest: () => void;
  clearExpiredRequests: () => void;
  getCurrentRequest: () => QueuedRequest | undefined;
  clearCurrentRequestFromQueue: () => void;

  // Setup listeners
  setupTonConnectListeners: (walletKit: ITonWalletKit) => void;
}

// Jettons slice interface
export interface JettonsSlice {
  jettons: {
    jettonsByAddress: Record<string, Jetton[]>;
    jettonTransfers: JettonTransfer[];
    popularJettons: JettonInfo[];
    isLoadingJettons: boolean;
    isLoadingTransfers: boolean;
    isLoadingPopular: boolean;
    isRefreshing: boolean;
    error: string | null;
    transferError: string | null;
    lastJettonsUpdate: number;
    lastTransfersUpdate: number;
    lastPopularUpdate: number;
  };

  loadUserJettons: (userAddress?: string, force?: boolean) => Promise<void>;
  refreshJettons: (userAddress?: string) => Promise<void>;
  updateJettonBalanceFromStream: (
    walletAddress: string,
    balance: string,
    decimals?: number,
  ) => void;
  validateJettonAddress: (address: string) => boolean;
  clearJettons: () => void;
  getJettonByAddress: (jettonAddress: string) => Jetton | undefined;
  formatJettonAmount: (amount: string, decimals: number) => string;
}

// NFTs slice interface
export interface NftsSlice {
  nfts: {
    userNfts: NFT[];
    nftsByAddress: Record<string, NFT[]>;
    isLoadingNfts: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastNftsUpdate: number;
    hasMore: boolean;
    offset: number;
  };

  loadUserNfts: (userAddress?: string, limit?: number) => Promise<void>;
  refreshNfts: (userAddress?: string) => Promise<void>;
  loadMoreNfts: (userAddress?: string) => Promise<void>;
  clearNfts: () => void;
  getNftByAddress: (address: string) => NFT | undefined;
  formatNftIndex: (index: string) => string;
}

// Rates slice interface
export interface RateEntry {
  rate: number;
  change24h?: number;
  currency: 'USD';
}

export interface RatesSlice {
  rates: {
    entries: Record<string, RateEntry>;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number;
  };

  loadRates: () => Promise<void>;
  clearRates: () => void;
  getRate: (key: string) => RateEntry | undefined;
}

// Swap slice interface
export interface SwapState {
  fromToken: SwapToken;
  toToken: SwapToken;
  amount: string;
  destinationAddress: string;
  currentQuote: SwapQuote | null;
  isLoadingQuote: boolean;
  isSwapping: boolean;
  error: string | null;
  slippageBps: number;
  isReverseSwap: boolean;
  /** Selected swap provider id (e.g. 'omniston', 'dedust'); quotes are fetched from it. */
  providerId: string;
}

// Staking slice interface
export interface StakingState {
  amount: string;
  providerId: string;
  currentQuote: StakingQuote | null;
  isLoadingQuote: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  error: string | null;
  unstakeMode: UnstakeModes;
  stakedBalance: StakingBalance | null;
  providerInfo: StakingProviderInfo | null;
}

export interface StakingSlice {
  staking: StakingState;

  setStakingAmount: (amount: string) => void;
  setStakingProviderId: (providerId: string) => void;
  setUnstakeMode: (mode: UnstakeModes) => void;
  getStakingQuote: (
    params: Omit<StakingQuoteParams, 'network'>,
  ) => Promise<void>;
  stake: (params: Omit<StakeParams, 'userAddress'>) => Promise<boolean>;
  unstake: (params: Omit<StakeParams, 'userAddress'>) => Promise<boolean>;
  loadStakingData: (userAddress: string) => Promise<void>;
  clearStaking: () => void;
  validateStakingInputs: () => string | null;
}

export interface GaslessState {
  enabled: boolean;
  feeAsset: string | null;
  supportedAssets: GaslessSupportedAsset[];
  relayAddress: string | null;
  currentQuote: GaslessQuote | null;
  isLoadingConfig: boolean;
  isLoadingQuote: boolean;
  isSending: boolean;
  error: string | null;
}

export interface GaslessQuoteRequest {
  recipientAddress: string;
  jettonAddress: string;
  /** Amount to transfer in the jetton's smallest unit. */
  transferAmount: string;
  comment?: string;
}

export interface GaslessSlice {
  gasless: GaslessState;

  setGaslessEnabled: (enabled: boolean) => void;
  setGaslessFeeAsset: (address: string) => void;
  clearGaslessQuote: () => void;
  loadGaslessConfig: () => Promise<void>;
  getGaslessQuote: (params: GaslessQuoteRequest) => Promise<void>;
  sendGasless: () => Promise<SendTransactionResponse>;
  clearGasless: () => void;
}

export interface SwapSlice {
  swap: SwapState;

  setFromToken: (token: SwapToken) => void;
  setToToken: (token: SwapToken) => void;
  setSwapAmount: (amount: string) => void;
  setDestinationAddress: (address: string) => void;
  setIsReverseSwap: (isReverseSwap: boolean) => void;
  setSlippageBps: (slippage: number) => void;
  setSwapProviderId: (providerId: string) => void;
  swapTokens: () => void;
  getSwapQuote: () => Promise<void>;
  executeSwap: () => Promise<boolean>;
  clearSwap: () => void;
  validateSwapInputs: () => string | null;
}

export interface BrotherhoodMemberData {
  isMember: boolean;
  location?: string;
  circle: string[];
  ring: Record<string, string[]>;
}

export interface PendingDeferredPayment {
  id: string; // holdingAddress
  holdingAddress: string;
  queryId: string;
  role: 'payee' | 'payer';
  amount: string;
  counterpartyAddress: string;
  counterpartyUsername?: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'ready_to_claim' | 'claimed' | 'cancelled';
}

export interface BrotherhoodSlice {
  brotherhood: {
    brotherhoodByAddress: Record<string, BrotherhoodMemberData>;
    pendingDeferredByAddress: Record<string, PendingDeferredPayment[]>;
    watchedLocations: string[];
  };

  setBrotherhoodMemberData: (
    walletAddress: string,
    data: Partial<BrotherhoodMemberData>,
  ) => void;
  addCircleInvites: (
    walletAddress: string,
    invites: (string | any)[],
    network?: NetworkType,
  ) => string[];
  addRingInvites: (
    walletAddress: string,
    invitorAddress: string | any,
    invites: (string | any)[],
    network?: NetworkType,
  ) => void;
  setLocationContract: (
    walletAddress: string,
    locationAddress: string | any,
    network?: NetworkType,
  ) => void;
  removeBrotherhoodWallet: (walletAddress: string) => void;
  watchLocation: (locationAddress: string) => void;
  unwatchLocation: (locationAddress: string) => void;
  clearWatchedLocations: () => void;
  addPendingDeferredPayment: (
    walletAddress: string,
    payment: PendingDeferredPayment,
    network?: NetworkType,
  ) => void;
  updatePendingDeferredPayment: (
    walletAddress: string,
    id: string,
    patch: Partial<PendingDeferredPayment>,
    network?: NetworkType,
  ) => void;
  removePendingDeferredPayment: (
    walletAddress: string,
    id: string,
    network?: NetworkType,
  ) => void;
}

export type AnimationLevel = 'none' | 'performance' | 'full';

export interface PreferencesState {
  animationLevel: AnimationLevel;
  /** Whether the user explicitly overrode the detected default */
  isCustomAnimationLevel: boolean;
}

export interface PreferencesSlice {
  preferences: PreferencesState;
  setAnimationLevel: (level: AnimationLevel) => void;
  resetPreferences: () => void;
}

// Combined app state
export interface AppState
  extends
    AuthSlice,
    WalletCoreSlice,
    WalletManagementSlice,
    TonConnectSlice,
    JettonsSlice,
    NftsSlice,
    RatesSlice,
    SwapSlice,
    StakingSlice,
    GaslessSlice,
    BrotherhoodSlice,
    PreferencesSlice {
  isHydrated: boolean;
}

export type PreferencesSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  PreferencesSlice
>;

// Slice creator types
export type AuthSliceCreator = StateCreator<AppState, [], [], AuthSlice>;

export type WalletCoreSliceCreator = StateCreator<
  AppState,
  [],
  [],
  WalletCoreSlice
>;

export type WalletManagementSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  WalletManagementSlice
>;

export type TonConnectSliceCreator = StateCreator<
  AppState,
  [],
  [],
  TonConnectSlice
>;

export type JettonsSliceCreator = StateCreator<AppState, [], [], JettonsSlice>;

export type NftsSliceCreator = StateCreator<AppState, [], [], NftsSlice>;

export type RatesSliceCreator = StateCreator<AppState, [], [], RatesSlice>;

export type SwapSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  SwapSlice
>;

export type StakingSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  StakingSlice
>;

export type GaslessSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  GaslessSlice
>;

export type BrotherhoodSliceCreator = StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  BrotherhoodSlice
>;

// Migration types
export interface MigrationState {
  version: number;
  [key: string]: unknown;
}

export type MigrationFunction = (
  persistedState: unknown,
  version: number,
) => unknown;

export type SetState = {
  (state: AppState | Partial<AppState>): void;
  (updater: (state: AppState) => void): void;
};
