import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { QueryClient } from '@tanstack/react-query';
import { FI_ADDRESS, network, type Network } from './config';
import { FossFi } from '@wrappers/FossFi.gen';
import { FossFiWallet } from '@wrappers/FossFiWallet.gen';
import { PersonalMinter } from '@wrappers/Personal.gen';
import { PersonalWallet } from '@wrappers/PersonalWallet.gen';
import { rateLimitedFetch, createTonClientAxiosAdapter } from './rate-limiter';
import { getContractCache, setContractCache } from './contract-cache';

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

const clients: Record<string, TonClient> = {};

function toncenterApiKey(network: Network): string | undefined {
  return network === 'mainnet'
    ? import.meta.env.TONCENTER_MAINNET_API_KEY
    : import.meta.env.TONCENTER_TESTNET_API_KEY;
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
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    const apiKey = toncenterApiKey(network);
    clients[network] = new TonClient({
      endpoint,
      apiKey,
      httpAdapter: createTonClientAxiosAdapter({ apiKey }) as any,
    });
  }
  return clients[network]!;
}

export async function getWalletAddress( // todo: calc offchain
  // client: TonClient,
  // minterAddress: Address,
  ownerAddress: Address,
): Promise<Address> {
  // get from local storage
  if (
    localStorage.getItem(
      'fiWalletAddress_' + FI_ADDRESS + ownerAddress.toString(),
    ) != null
  ) {
    return Address.parse(
      localStorage.getItem(
        'fiWalletAddress_' + FI_ADDRESS + ownerAddress.toString(),
      )!,
    );
  } else {
    const client = getTonClient(network);
    const minterAddress = Address.parse(FI_ADDRESS);
    const result = await client.runMethod(minterAddress, 'get_wallet_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);
    const addr = result.stack.readAddress();
    localStorage.setItem(
      'fiWalletAddress_' + FI_ADDRESS + ownerAddress.toString(),
      addr.toString(),
    );
    return addr;
  }
}

export async function getFiWalletAddress(
  ownerAddress: Address,
  _network?: Network,
): Promise<Address> {
  return getWalletAddress(ownerAddress);
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
  const walletAddr = await getWalletAddress(ownerAddress);
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
  const walletAddr = await getWalletAddress(owner);
  return getTonClient(net)
    .open(FossFiWallet.fromAddress(walletAddr))
    .getWalletDataAll();
}

export type FiWalletStateData = Awaited<ReturnType<typeof getFiWalletStateRaw>>;

/**
 * Unified state accessor for a user's FiWallet.
 * Reads from IndexedDB ('fi-wallet-state:<owner>') if present and not forceFresh;
 * otherwise performs getWalletDataAll(), writes to IndexedDB, and returns.
 */
export async function getUnifiedFiWalletState(
  owner: Address,
  options: { forceFresh?: boolean; net?: Network } = {},
): Promise<FiWalletStateData> {
  const cacheKey = `fi-wallet-state:${owner.toString()}`;
  if (!options.forceFresh) {
    const cached = await getContractCache<FiWalletStateData>(cacheKey);
    if (cached && cached.data) {
      return cached.data;
    }
  }

  const fresh = await getFiWalletStateRaw(owner, options.net);
  await setContractCache(cacheKey, fresh);
  return fresh;
}

export async function getFiWalletState(
  owner: Address,
  options?: { forceFresh?: boolean },
) {
  return getUnifiedFiWalletState(owner, options);
}

export async function getFiWalletStateByContractAddress(
  contractAddress: Address,
  net: Network = network,
  options: { forceFresh?: boolean } = {},
) {
  const cacheKey = `fi-wallet-state-by-contract:${net}:${contractAddress.toString()}`;
  if (!options.forceFresh) {
    const cached = await getContractCache<FiWalletStateData>(cacheKey);
    if (cached && cached.data) {
      return cached.data;
    }
  }

  const fresh = await getTonClient(net)
    .open(FossFiWallet.fromAddress(contractAddress))
    .getWalletDataAll();
  await setContractCache(cacheKey, fresh);
  return fresh;
}

export async function getFiMinterState() {
  return getTonClient(network)
    .open(FossFi.fromAddress(Address.parse(FI_ADDRESS)))
    .getJettonDataAll();
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

export async function getCircle(invitedList: Address[]) {
  const client = getTonClient(network);
  const promises = invitedList.map((addr) =>
    client.open(FossFiWallet.fromAddress(addr)).getWalletDataAll(),
  );
  return Promise.all(promises);
}

export function isZeroAddress(address: Address | null | undefined): boolean {
  if (!address) return true;
  return address.hash.every((byte) => byte === 0);
}

// The Personal Token minter an issuer pointed its FI wallet at, or null if none.
// Reads from unified FiWallet state accessor to avoid duplicate network calls.
export async function getPersonalMinterForIssuer(
  issuerOwner: Address,
  options?: { forceFresh?: boolean },
): Promise<Address | null> {
  const state = await getUnifiedFiWalletState(issuerOwner, options);
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
  const state = await getUnifiedFiWalletState(issuerOwner, options);
  const wallet =
    state?.addresses?.ref?.trustedJettonAddrs?.ref?.personalJettonWallet;
  return wallet && !isZeroAddress(wallet) ? wallet : null;
}

// The Personal Token wallet a buyer owns on the given minter.
export async function getPersonalWalletAddress(
  personalMinter: Address,
  owner: Address,
): Promise<Address> {
  if (isZeroAddress(personalMinter)) {
    throw new Error('Personal minter is zero address');
  }
  return getTonClient(network)
    .open(PersonalMinter.fromAddress(personalMinter))
    .getWalletAddress(owner);
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
    const state = await getTonClient(network)
      .open(PersonalWallet.fromAddress(walletAddr))
      .getWalletData();
    return state.jettonBalance;
  } catch {
    return 0n;
  }
}

export async function getFiMinterTotalAccounts(): Promise<bigint> {
  return getTonClient(network)
    .open(FossFi.fromAddress(Address.parse(FI_ADDRESS)))
    .getTotalAccounts();
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
  try {
    const client = getTonClient(network);
    const minter = client.open(PersonalMinter.fromAddress(personalMinter));
    const [state, jettonData] = await Promise.all([
      minter.getState(),
      minter.getJettonData().catch(() => null),
    ]);
    return {
      totalSupply: state.totalSupply,
      fiJettonAddress: state.fiJettonAddress,
      adminAddress: state.adminAddress,
      mintable: jettonData?.mintable,
    };
  } catch (err) {
    console.error(
      `Failed to load personal minter details for ${personalMinter.toString()}:`,
      err,
    );
    return null;
  }
}

export async function isPersonalMinterContract(
  address: Address,
): Promise<boolean> {
  if (isZeroAddress(address)) return false;
  try {
    const client = getTonClient(network);
    const minter = client.open(PersonalMinter.fromAddress(address));
    const state = await minter.getState();
    const fiAddr = Address.parse(FI_ADDRESS);
    return state.fiJettonAddress.equals(fiAddr);
  } catch {
    return false;
  }
}
