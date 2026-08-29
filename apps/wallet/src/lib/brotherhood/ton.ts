import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { QueryClient } from '@tanstack/react-query';
import { FI_ADDRESS, network, type Network } from './config';
import { FossFiWallet } from '@/contracts/brotherhood/FossFiWallet.gen';
import { PersonalMinter } from '@/contracts/brotherhood/Personal.gen';
import { PersonalWallet } from '@/contracts/brotherhood/PersonalWallet.gen';
// import { Addresses, FiWalletStore, NomInAddrs, ReportInfo, TimeStamps, TrustedAddrs } from '@/contracts/brotherhood/FossFiWallet.gen';

export type { Network } from './config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes: keep data fresh to prevent frequent API calls
      gcTime: 30 * 60 * 1000, // 30 minutes in memory cache
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
    clients[network] = new TonClient({
      endpoint,
      apiKey: toncenterApiKey(network),
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

export async function getFiWalletAddress(ownerAddress: Address, _network?: Network): Promise<Address> {
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
  let delay = 1000;
  for (let i = 0; i <= maxRetries; i++) {
    const res = await fetch(url, init);
    if (res.status === 429 && i < maxRetries) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    return res;
  }
  throw new Error('Max retries exceeded');
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

export async function getFiWalletState(owner: Address) {
  return getTonClient(network)
    .open(FossFiWallet.fromAddress(await getWalletAddress(owner)))
    .getWalletDataAll();
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

// The Personal Token minter an issuer pointed its FI wallet at, or null if none.
export async function getPersonalMinterForIssuer(
  issuerOwner: Address,
): Promise<Address | null> {
  const issuerWalletAddr = await getWalletAddress(issuerOwner);
  const state = await getTonClient(network)
    .open(FossFiWallet.fromAddress(issuerWalletAddr))
    .getWalletDataAll();
  return state.addresses.ref.trustedJettonAddrs.ref.personalJettonMinter;
}

// The Personal Token wallet a buyer owns on the given minter.
export async function getPersonalWalletAddress(
  personalMinter: Address,
  owner: Address,
): Promise<Address> {
  return getTonClient(network)
    .open(PersonalMinter.fromAddress(personalMinter))
    .getWalletAddress(owner);
}

// The raw balance (nano) a buyer holds on the given Personal Token minter.
export async function getPersonalWalletBalance(
  personalMinter: Address,
  owner: Address,
): Promise<bigint> {
  const walletAddr = await getPersonalWalletAddress(personalMinter, owner);
  const state = await getTonClient(network)
    .open(PersonalWallet.fromAddress(walletAddr))
    .getWalletData();
  return state.jettonBalance;
}
