import { TonClient } from '@ton/ton';
import { Address, Dictionary } from '@ton/core';
import { QueryClient } from '@tanstack/react-query';
import { FI_ADDRESS, network, type Network } from './config';
import { FossFi } from '@wrappers/FossFi.gen';
import {
  Addresses,
  FossFiWallet,
  Maps,
  NomInAddrs,
  ProfileInfo,
  ReportInfo,
  SocialMaps,
  TimeStamps,
  TrustedAddrs,
} from '@wrappers/FossFiWallet.gen';
import { PersonalMinter, OnchainMetadataReply } from '@wrappers/Personal.gen';
import { PersonalWallet } from '@wrappers/PersonalWallet.gen';
import {
  rateLimitedFetch,
  createTonClientAxiosAdapter,
  resetRateLimiterQueues,
} from './rate-limiter';
import { testnetRpcManager } from './testnet-rpc-manager';
import {
  getContractCache,
  setContractCache,
  getNormalizedContractCacheKey,
} from './contract-cache';
import { computePersonalWalletAddress } from './account-state-hydrator';
import { sha256 } from './jettonContent';

export type { Network } from './config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Never consider queries stale automatically; manual refresh only
      gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days in memory cache
      refetchOnWindowFocus: false, // Prevent refetches when switching windows/tabs
      refetchOnMount: false, // Prevent refetches when re-mounting components if cached
      refetchOnReconnect: false, // Prevent auto refetching on network reconnect
      retry: 1, // Limit retries to 1 to prevent spamming
    },
  },
});

import {
  getCustomApiKey,
  getTestnetApiProvider,
  getOrbsHttpEndpoint,
  API_KEYS_UPDATED_EVENT,
} from '@/core/lib/network-api-keys';
import { baseFiWalletCodeCell } from './base-fi-wallet-code';

const clients: Record<string, TonClient> = {};

export function toncenterApiKey(network: Network): string | undefined {
  if (network === 'testnet') {
    const customKey = getCustomApiKey('toncenter', 'testnet');
    if (customKey) return customKey;
  }

  const key =
    network === 'mainnet'
      ? import.meta.env.VITE_TONCENTER_MAINNET_API_KEY ||
        import.meta.env.TONCENTER_MAINNET_API_KEY
      : import.meta.env.VITE_TONCENTER_TESTNET_API_KEY ||
        import.meta.env.TONCENTER_TESTNET_API_KEY;
  return key && typeof key === 'string' && key.trim() ? key.trim() : undefined;
}

export function resetTonClients(): void {
  for (const k of Object.keys(clients)) {
    delete clients[k];
  }
}

async function syncActiveRpcEndpoint() {
  const provider = getTestnetApiProvider();
  if (provider === 'orbs') {
    try {
      const orbsEndpoint = await getOrbsHttpEndpoint('testnet');
      testnetRpcManager.setCustomEndpoint(orbsEndpoint);
    } catch {
      testnetRpcManager.setCustomEndpoint(null);
    }
  } else {
    testnetRpcManager.setCustomEndpoint(null);
  }
}

// Initial sync
if (typeof window !== 'undefined') {
  syncActiveRpcEndpoint().catch(() => {});
  window.addEventListener(API_KEYS_UPDATED_EVENT, () => {
    syncActiveRpcEndpoint().finally(() => {
      resetTonClients();
      resetRateLimiterQueues();
    });
  });
}

function toncenterApiHeaders(network: Network): HeadersInit | undefined {
  const apiKey = toncenterApiKey(network);
  return apiKey ? { 'X-API-Key': apiKey } : undefined;
}

export function getTonClient(network: Network): TonClient {
  if (!clients[network]) {
    const endpoint =
      network === 'mainnet'
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : testnetRpcManager.getActiveEndpoint();
    const apiKey = toncenterApiKey(network);
    clients[network] = new TonClient({
      endpoint,
      httpAdapter: createTonClientAxiosAdapter({
        apiKey,
        network: network === 'mainnet' ? 'mainnet' : 'testnet',
      }) as any,
    });
  }
  return clients[network]!;
}

export function getDeterministicWalletStorageKey(
  net: Network,
  minter: Address | string,
  owner: Address | string,
): string {
  const minterStr = typeof minter === 'string' ? minter : minter.toString();
  const ownerStr = typeof owner === 'string' ? owner : owner.toString();
  return `deterministic_wallet:${net}:${minterStr}:${ownerStr}`;
}

export function getCachedDeterministicWalletAddress(
  net: Network,
  minter: Address | string,
  owner: Address | string,
): Address | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key = getDeterministicWalletStorageKey(net, minter, owner);
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return Address.parse(val);
    } catch {
      /* pass */
    }
  }
  return null;
}

export function setCachedDeterministicWalletAddress(
  net: Network,
  minter: Address | string,
  owner: Address | string,
  walletAddress: Address | string,
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const key = getDeterministicWalletStorageKey(net, minter, owner);
  const addrStr =
    typeof walletAddress === 'string'
      ? walletAddress
      : walletAddress.toString();
  localStorage.setItem(key, addrStr);
}

export function getFiWalletAddress(
  owner: Address,
  net: Network = network,
): Address {
  const minterAddress = Address.parse(FI_ADDRESS);
  const cached = getCachedDeterministicWalletAddress(net, minterAddress, owner);
  if (cached) {
    return cached;
  }

  /**
   * Computes Brotherhood FI wallet address deterministically off-chain
   * using baseFiWalletCodeCell and initial empty storage schema.
   */
  const emptyFiWalletStore = {
    profile: { ref: ProfileInfo.create({}) },
    timestamps: { ref: TimeStamps.create({}) },
    addresses: {
      ref: Addresses.create({
        owner,
        nomInAddrs: { ref: NomInAddrs.create({}) },
        trustedJettonAddrs: {
          ref: TrustedAddrs.create({
            minterAddr: Address.parse(FI_ADDRESS),
            authorisedAccs: Dictionary.empty(),
          }),
        },
      }),
    },
    maps: {
      ref: Maps.create({
        invited: Dictionary.empty(),
        allowances: Dictionary.empty(),
        social: { ref: SocialMaps.create({ votedFor: Dictionary.empty() }) },
        reportInfo: { ref: ReportInfo.create({ reports: Dictionary.empty() }) },
      }),
    },
  };

  const wallet = FossFiWallet.fromStorage(emptyFiWalletStore, {
    overrideContractCode: baseFiWalletCodeCell,
    toShard: { fixedPrefixLength: 8, closeTo: owner },
  });
  const offchainAddr = wallet.address;

  setCachedDeterministicWalletAddress(net, minterAddress, owner, offchainAddr);
  return offchainAddr;
}

export async function checkIsContractDeployed(
  address: Address,
  net: Network = network,
): Promise<boolean> {
  const normalizedKey = getNormalizedContractCacheKey(net, address);
  const cached = await getContractCache<any>(normalizedKey);
  return Boolean(cached && cached.data);
}

export interface JettonMasterInfo {
  totalSupply: bigint;
  mintable: boolean;
  adminAddress: Address | null;
  metadata: {
    name?: string;
    symbol?: string;
    decimals?: string;
    description?: string;
    image?: string;
  };
}

const toncenterV3 = {
  mainnet: 'https://toncenter.com/api/v3',
  testnet: 'https://testnet.toncenter.com/api/v3',
};

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  maxRetries = 4,
): Promise<Response> {
  const res = await rateLimitedFetch(url, init, { maxRetries });
  if (!res.ok) throw new Error(`Toncenter API error: ${res.status}`);
  return res;
}

export async function fetchJettonMaster(): Promise<JettonMasterInfo> {
  const base = toncenterV3[network === 'mainnet' ? 'mainnet' : 'testnet'];
  const res = await fetchWithRetry(
    `${base}/jetton/masters?address=${encodeURIComponent(FI_ADDRESS)}&limit=1&offset=0`,
    { headers: toncenterApiHeaders(network) },
  );
  if (!res.ok) throw new Error(`Toncenter API error: ${res.status}`);

  const json = await res.json();
  const masters = json.jetton_masters;
  if (!masters || masters.length === 0) {
    throw new Error('Jetton not found');
  }

  const master = masters[0];
  const rawAddr = master.address as string;

  const metaEntry = json.metadata?.[rawAddr]?.token_info?.[0];

  let adminAddr: Address | null = null;
  try {
    if (master.admin_address) {
      adminAddr = Address.parse(master.admin_address);
    }
  } catch {
    /* addr_none */
  }

  return {
    totalSupply: BigInt(master.total_supply),
    mintable: master.mintable,
    adminAddress: adminAddr,
    metadata: {
      name: metaEntry?.name || undefined,
      symbol: metaEntry?.symbol || undefined,
      decimals:
        metaEntry?.extra?.decimals ||
        master.jetton_content?.decimals ||
        undefined,
      description: metaEntry?.description || undefined,
      image: metaEntry?.image || undefined,
    },
  };
}

export async function fetchWalletBalance(ownerAddress: Address) {
  const walletAddr = await getFiWalletAddress(ownerAddress);
  const normalizedKey = getNormalizedContractCacheKey(network, walletAddr);

  // 1. Check if normalized contract cache already has FiWalletStateData
  const cached = await getContractCache<FiWalletStateData>(normalizedKey);
  if (cached && cached.data && typeof cached.data.jettonBalance === 'bigint') {
    return cached.data.jettonBalance;
  }

  // 2. Try fetching unified FiWallet state to populate contract cache
  try {
    const state = await getFiWalletState(ownerAddress);
    if (state && typeof state.jettonBalance === 'bigint') {
      return state.jettonBalance;
    }
  } catch {
    // Contract call failed or not deployed; fallback to Toncenter v3 HTTP
  }

  // 3. Fallback: Toncenter v3 HTTP
  const base = toncenterV3[network === 'mainnet' ? 'mainnet' : 'testnet'];
  const res = await fetchWithRetry(
    `${base}/jetton/wallets?address=${encodeURIComponent(walletAddr.toString())}&limit=1&offset=0`,
    { headers: toncenterApiHeaders(network) },
  );
  if (!res.ok) throw new Error(`Toncenter API error: ${res.status}`);

  const json = await res.json();
  const wallets = json.jetton_wallets;
  if (!wallets || wallets.length === 0) {
    throw new Error('JettonWallet not found');
  }

  return BigInt(wallets[0].balance);
}

export async function getFiWalletStateRaw(
  owner: Address,
  net: Network = network,
) {
  const walletAddr = await getFiWalletAddress(owner, net);
  return getTonClient(net)
    .open(FossFiWallet.fromAddress(walletAddr))
    .getWalletDataAll();
}

export type FiWalletStateData = Awaited<ReturnType<typeof getFiWalletStateRaw>>;

/**
 * Unified state accessor for a user's FiWallet.
 * Resolves the deterministic contract address and normalizes storage
 * under `contract_state:${net}:${walletAddr}`.
 */
export async function getFiWalletState(
  owner: Address,
  options: { forceFresh?: boolean; net?: Network } = {},
): Promise<FiWalletStateData> {
  const net = options.net ?? network;
  const walletAddr = getFiWalletAddress(owner, net);
  return getFiWalletStateByContractAddress(walletAddr, net, options);
}

export async function getFiWalletStateByContractAddress(
  contractAddress: Address,
  net: Network = network,
  options: { forceFresh?: boolean } = {},
) {
  const normalizedKey = getNormalizedContractCacheKey(net, contractAddress);

  if (!options.forceFresh) {
    const cached = await getContractCache<any>(normalizedKey);
    if (cached && cached.data) {
      // If cached data is a FiWallet, return it
      if (
        cached.data.$ === 'FiWalletStore' ||
        cached.data.addresses?.ref?.owner
      ) {
        return cached.data as FiWalletStateData;
      }
      // If the address is an owner wallet (e.g. WalletV5R1), redirect to its off-chain computed FiWallet
      if (
        cached.data.signatureAllowed !== undefined ||
        cached.data.walletId !== undefined
      ) {
        const actualFiWalletAddr = getFiWalletAddress(contractAddress, net);
        return getFiWalletStateByContractAddress(
          actualFiWalletAddr,
          net,
          options,
        );
      }
    }
  }

  // Fast In-Memory Deserialization via Toncenter v3 /accountStates
  let hydrateResult: any = null;
  try {
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    // Let batchHydrateUniversal auto-detect the true contract type by bytecode hash
    hydrateResult = await batchHydrateUniversal([contractAddress], net);
    const hydrated = await getContractCache<any>(normalizedKey);
    if (hydrated && hydrated.data) {
      if (
        hydrated.data.$ === 'FiWalletStore' ||
        hydrated.data.addresses?.ref?.owner
      ) {
        return hydrated.data as FiWalletStateData;
      }
      // If the address turned out to be an owner wallet, redirect to its FiWallet
      if (
        hydrated.data.signatureAllowed !== undefined ||
        hydrated.data.walletId !== undefined
      ) {
        const actualFiWalletAddr = getFiWalletAddress(contractAddress, net);
        return getFiWalletStateByContractAddress(
          actualFiWalletAddr,
          net,
          options,
        );
      }
    }
  } catch (err) {
    console.debug(
      '[getFiWalletStateByContractAddress] in-memory batch hydration skipped:',
      err,
    );
  }

  // Zero Getter Fallback Rule: If the account was detected as outdated or failed deserialization,
  // do not run on-chain get-methods that will fail or throttle.
  const addrString = contractAddress.toString();
  if (
    hydrateResult?.outdatedAccounts?.includes(addrString) ||
    hydrateResult?.failedAddresses?.includes(addrString)
  ) {
    const cached = await getContractCache<any>(normalizedKey);
    if (cached?.data) {
      return cached.data as FiWalletStateData;
    }
    throw new Error(
      `FiWallet ${addrString} is inactive or using outdated code`,
    );
  }

  const cached = await getContractCache<any>(normalizedKey);
  return (cached?.data as FiWalletStateData) ?? null;
}

export async function getFiMinterState() {
  const minterAddr = Address.parse(FI_ADDRESS);
  const normalizedKey = getNormalizedContractCacheKey(network, minterAddr);

  // Check normalized cache first
  const cached = await getContractCache<any>(normalizedKey);
  if (cached && cached.data) {
    return cached.data;
  }

  // Try fast in-memory batch hydration
  try {
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    await batchHydrateUniversal([minterAddr], network, {
      knownTypes: { [minterAddr.toString()]: 'fiMinter' },
    });
    const hydrated = await getContractCache<any>(normalizedKey);
    if (hydrated && hydrated.data) {
      return hydrated.data;
    }
  } catch (err) {
    console.debug('[getFiMinterState] in-memory batch hydration skipped:', err);
  }

  const finalCached = await getContractCache<any>(normalizedKey);
  return finalCached?.data ?? null;
}

export interface AllowanceEntry {
  grantee: Address;
  amount: bigint;
}

// The allowances a wallet has granted, as a stable array (sorted by address).
export function listAllowances(state: {
  maps: {
    ref: { allowances: import('@ton/core').Dictionary<Address, bigint> };
  };
}): AllowanceEntry[] {
  const entries = state.maps.ref.allowances;
  return entries
    .keys()
    .map((grantee) => ({ grantee, amount: entries.get(grantee)! }))
    .sort((a, b) => a.grantee.toString().localeCompare(b.grantee.toString()));
}

export async function getCircle(
  invitedList: Address[],
  options?: { forceFresh?: boolean; net?: Network },
) {
  const net = options?.net ?? network;
  const promises = invitedList.map((addr) =>
    getFiWalletStateByContractAddress(addr, net, options),
  );
  return Promise.all(promises);
}

export const CONTRACT_ZERO_ADDRESS_BOUNCEABLE =
  'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
export const RAW_ZERO_ADDRESS =
  '0:0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_ADDRESS = Address.parse(CONTRACT_ZERO_ADDRESS_BOUNCEABLE);

export function isZeroAddress(
  address: Address | string | null | undefined,
): boolean {
  if (!address) return true;
  try {
    const addr = typeof address === 'string' ? Address.parse(address) : address;
    return (
      addr.equals(ZERO_ADDRESS) ||
      addr.toRawString() === RAW_ZERO_ADDRESS ||
      addr.hash.every((byte) => byte === 0)
    );
  } catch {
    return true;
  }
}

// The Personal Token minter an issuer pointed its FI wallet at, or null if none.
// Reads from unified FiWallet state accessor to avoid duplicate network calls.
export async function getPersonalMinterForIssuer(
  issuerOwner: Address,
  options?: { forceFresh?: boolean },
): Promise<Address | null> {
  const state = await getFiWalletState(issuerOwner, options);
  const minter =
    state?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonMinter;
  return minter && !isZeroAddress(minter) ? minter : null;
}

// The Personal Token wallet an issuer registered on its FI wallet, or null if none.
// Reads from unified FiWallet state accessor to avoid duplicate network calls.
export async function getPersonalWalletForIssuer(
  issuerOwner: Address,
  options?: { forceFresh?: boolean },
): Promise<Address | null> {
  const state = await getFiWalletState(issuerOwner, options);
  const wallet =
    state?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonWallet;
  return wallet && !isZeroAddress(wallet) ? wallet : null;
}

// The Personal Token wallet a buyer owns on the given minter.
export async function getPersonalWalletAddress(
  personalMinter: Address,
  owner: Address,
  net: Network = network,
): Promise<Address> {
  if (isZeroAddress(personalMinter)) {
    throw new Error('Personal minter is zero address');
  }

  const cached = getCachedDeterministicWalletAddress(
    net,
    personalMinter,
    owner,
  );
  if (cached) {
    return cached;
  }

  // Fast off-chain derivation if minter store is in cache
  const normalizedKey = getNormalizedContractCacheKey(net, personalMinter);
  const minterCache = await getContractCache<any>(normalizedKey);
  const adminAddress = minterCache?.data?.adminAddress;
  if (adminAddress) {
    try {
      const offchainAddr = computePersonalWalletAddress(
        personalMinter,
        owner,
        adminAddress,
      );
      setCachedDeterministicWalletAddress(
        net,
        personalMinter,
        owner,
        offchainAddr,
      );
      return offchainAddr;
    } catch {
      /* fallback to RPC */
    }
  }

  const fallbackAddr = computePersonalWalletAddress(
    personalMinter,
    owner,
    owner,
  );
  setCachedDeterministicWalletAddress(net, personalMinter, owner, fallbackAddr);
  return fallbackAddr;
}

// The raw balance (nano) a buyer holds on the given Personal Token minter.
export async function getPersonalWalletBalance(
  personalMinter: Address,
  owner: Address,
): Promise<bigint> {
  if (isZeroAddress(personalMinter)) return 0n;
  try {
    const walletAddr = await getPersonalWalletAddress(personalMinter, owner);
    if (!walletAddr || isZeroAddress(walletAddr)) return 0n;
    const normalizedKey = getNormalizedContractCacheKey(network, walletAddr);
    const cached = await getContractCache<any>(normalizedKey);
    return cached?.data?.jettonBalance ?? 0n;
  } catch {
    return 0n;
  }
}

export async function getFiMinterTotalAccounts(): Promise<bigint> {
  const minterAddr = Address.parse(FI_ADDRESS);
  const normalizedKey = getNormalizedContractCacheKey(network, minterAddr);
  const cached = await getContractCache<any>(normalizedKey);
  if (cached?.data?.totalAccounts !== undefined) {
    return BigInt(cached.data.totalAccounts);
  }
  return 0n;
}

export interface PersonalMinterDetails {
  totalSupply: bigint;
  fiJettonAddress: Address;
  adminAddress: Address;
  mintable?: boolean;
}

export async function getPersonalMinterDetails(
  personalMinter: Address,
): Promise<PersonalMinterDetails | null> {
  if (isZeroAddress(personalMinter)) return null;

  const normalizedKey = getNormalizedContractCacheKey(network, personalMinter);
  const cached = await getContractCache<any>(normalizedKey);
  if (cached?.data?.adminAddress) {
    return {
      totalSupply: cached.data.totalSupply ?? 0n,
      fiJettonAddress: cached.data.fiJettonAddress || cached.data.issuerWallet,
      adminAddress: cached.data.adminAddress,
      mintable: true,
    };
  }
  return null;
}

export async function isPersonalMinterContract(
  address: Address,
): Promise<boolean> {
  if (isZeroAddress(address)) return false;

  const normalizedKey = getNormalizedContractCacheKey(network, address);
  const cached = await getContractCache<any>(normalizedKey);
  return Boolean(cached?.data?.adminAddress);
}

export interface PersonalTokenMetadata {
  name?: string;
  symbol?: string;
  image?: string;
  description?: string;
}

export async function fetchPersonalTokenMetadata(
  minterAddress: Address,
): Promise<PersonalTokenMetadata> {
  const addrStr = minterAddress.toString();
  try {
    const { getMetadataCache } = await import('./contract-cache');
    const cachedMeta = await getMetadataCache(addrStr);
    if (cachedMeta?.token_info?.[0]) {
      const info = cachedMeta.token_info[0];
      return {
        name: info.name,
        symbol: info.symbol,
        image: info.image,
        description: info.description,
      };
    }
  } catch {
    /* ignore */
  }
  return {};
}

export async function isPersonalWalletContract(
  address: Address,
): Promise<{ owner: Address; minterAddress: Address; balance: bigint } | null> {
  if (isZeroAddress(address)) return null;
  const normalizedKey = getNormalizedContractCacheKey(network, address);
  const cached = await getContractCache<any>(normalizedKey);
  if (cached?.data && cached.data.owner && cached.data.minterAddress) {
    return {
      owner: cached.data.owner,
      minterAddress: cached.data.minterAddress,
      balance: cached.data.jettonBalance ?? 0n,
    };
  }
  return null;
}

export interface DiscoveredPersonalToken {
  minterAddress: string;
  walletAddress: string;
  balance: bigint;
  name?: string;
  symbol?: string;
  image?: string;
  description?: string;
}

export async function discoverPersonalTokensForWallet(
  ownerAddress: Address,
): Promise<DiscoveredPersonalToken[]> {
  const candidateMinters = new Set<string>();
  const client = getTonClient(network);

  // 1. Check user's own registered personal minter from FI wallet & network members
  try {
    const fiState = await getFiWalletState(ownerAddress);
    const ownMinter =
      fiState?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonMinter;
    if (ownMinter && !isZeroAddress(ownMinter)) {
      candidateMinters.add(ownMinter.toString());
    }

    // Check connected circle members from FI wallet
    const invitedMap = fiState?.maps?.ref?.invited;
    if (invitedMap) {
      let invitedAddrs: Address[] = [];
      if (typeof invitedMap.keys === 'function') {
        const k = invitedMap.keys();
        invitedAddrs = Array.isArray(k) ? k : Array.from(k);
      } else if (Array.isArray(invitedMap)) {
        invitedAddrs = invitedMap.map((entry: any) =>
          Array.isArray(entry) ? entry[0] : entry?.address || entry,
        );
      }
      invitedAddrs = invitedAddrs.slice(0, 20);
      await Promise.all(
        invitedAddrs.map(async (circleContractAddr) => {
          try {
            const memberState = await getFiWalletStateByContractAddress(
              circleContractAddr,
              network,
            );
            const mPersonalMinter =
              memberState?.addresses?.ref?.trustedJettonAddrs?.ref
                ?.personalJettonMinter;
            if (mPersonalMinter && !isZeroAddress(mPersonalMinter)) {
              candidateMinters.add(mPersonalMinter.toString());
            }
          } catch {
            // ignore
          }
        }),
      );
    }
  } catch (err) {
    console.warn('[discoverPersonalTokens] Error reading FI wallet:', err);
  }

  // 2. Query Toncenter V3 for any jetton wallets owned by user
  try {
    const base = toncenterV3[network === 'mainnet' ? 'mainnet' : 'testnet'];
    const res = await fetchWithRetry(
      `${base}/jetton/wallets?owner_address=${encodeURIComponent(ownerAddress.toString())}&limit=50&offset=0`,
      { headers: toncenterApiHeaders(network) },
    );
    if (res.ok) {
      const json = await res.json();
      const wallets = json.jetton_wallets || [];
      for (const w of wallets) {
        if (w.jetton) {
          candidateMinters.add(w.jetton);
        }
      }
    }
  } catch (err) {
    console.warn(
      '[discoverPersonalTokens] Error querying Toncenter jetton wallets:',
      err,
    );
  }

  // 3. Scan recent account transactions (inspecting senders, notifications, and destinations)
  try {
    const txs = await client.getTransactions(ownerAddress, { limit: 50 });
    for (const tx of txs) {
      // Check inMessage
      if (tx.inMessage && tx.inMessage.info?.type === 'internal') {
        const src = tx.inMessage.info.src;
        if (src && !isZeroAddress(src)) {
          const slice = tx.inMessage.body.beginParse();
          // If opcode is TransferNotificationForRecipient (0x7362d09c), src is a PersonalWallet
          if (
            slice.remainingBits >= 32 &&
            slice.preloadUint(32) === 0x7362d09c
          ) {
            const pw = await isPersonalWalletContract(src);
            if (pw?.minterAddress) {
              candidateMinters.add(pw.minterAddress.toString());
            }
          } else {
            const pw = await isPersonalWalletContract(src);
            if (pw?.minterAddress) {
              candidateMinters.add(pw.minterAddress.toString());
            } else {
              const isMinter = await isPersonalMinterContract(src);
              if (isMinter) candidateMinters.add(src.toString());
            }
          }
        }
      }

      // Check outMessages (Dictionary<number, Message> in @ton/core)
      const outMsgs = tx.outMessages
        ? typeof tx.outMessages.values === 'function'
          ? tx.outMessages.values()
          : Array.isArray(tx.outMessages)
            ? tx.outMessages
            : Object.values(tx.outMessages)
        : [];

      for (const out of outMsgs) {
        if (out && out.info?.type === 'internal') {
          const dest = out.info.dest;
          if (dest && !isZeroAddress(dest)) {
            const pw = await isPersonalWalletContract(dest);
            if (pw?.minterAddress) {
              candidateMinters.add(pw.minterAddress.toString());
            } else {
              const isMinter = await isPersonalMinterContract(dest);
              if (isMinter) candidateMinters.add(dest.toString());
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[discoverPersonalTokens] Error scanning transactions:', err);
  }

  // 4. Verify candidate minters, check balance > 0n, and fetch metadata
  const discovered: DiscoveredPersonalToken[] = [];
  await Promise.all(
    Array.from(candidateMinters).map(async (minterStr) => {
      try {
        const minterAddr = Address.parse(minterStr);
        const isMinter = await isPersonalMinterContract(minterAddr);
        if (!isMinter) return;

        const balance = await getPersonalWalletBalance(
          minterAddr,
          ownerAddress,
        );
        if (balance <= 0n) return;

        const walletAddr = await getPersonalWalletAddress(
          minterAddr,
          ownerAddress,
        );
        const meta = await fetchPersonalTokenMetadata(minterAddr);

        discovered.push({
          minterAddress: minterAddr.toString(),
          walletAddress: walletAddr.toString(),
          balance,
          name: meta.name,
          symbol: meta.symbol,
          image: meta.image,
          description: meta.description,
        });
      } catch (err) {
        console.warn(
          `[discoverPersonalTokens] Failed checking minter ${minterStr}:`,
          err,
        );
      }
    }),
  );

  return discovered;
}
