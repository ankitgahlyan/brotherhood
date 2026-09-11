import { Address, Cell } from '@ton/core';
import { FossFiWallet, FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { FossFi, FiStore } from '@wrappers/FossFi.gen';
import { PersonalMinter, PersonalStore } from '@wrappers/Personal.gen';
import {
  PersonalWalletStore,
  PersonalWallet,
} from '@wrappers/PersonalWallet.gen';
import { Location, LocationStore } from '@wrappers/Location.gen';
import { Lottery, LotteryStorage } from '@wrappers/Lottery.gen';
import { Poll, PollStore } from '@wrappers/Poll.gen';
import {
  setContractCache,
  getNormalizedContractCacheKey,
} from './contract-cache';
import { rateLimitedFetch } from './rate-limiter';
import { toncenterApiKey, type Network } from './ton';
import { network as defaultNetwork } from './config';

export const CONTRACT_CODE_HASHES = {
  fiWallet: FossFiWallet.CodeCell.hash().toString('base64'),
  fiMinter: FossFi.CodeCell.hash().toString('base64'),
  personalMinter: PersonalMinter.CodeCell.hash().toString('base64'),
  personalWallet: PersonalWallet.CodeCell.hash().toString('base64'),
  location: Location.CodeCell.hash().toString('base64'),
  lottery: Lottery.CodeCell.hash().toString('base64'),
  poll: Poll.CodeCell.hash().toString('base64'),
} as const;

export const CURRENT_FI_WALLET_CODE_HASH = CONTRACT_CODE_HASHES.fiWallet;

export interface RawAccountStateItem {
  address: string;
  account_state_hash?: string;
  balance?: string;
  extra_currencies?: Record<string, string>;
  status?: string; // 'active' | 'uninitialized' | 'frozen'
  last_transaction_hash?: string;
  last_transaction_lt?: string;
  data_hash?: string;
  code_hash?: string;
  data_boc?: string;
  code_boc?: string;
}

export interface UniversalHydrateResult {
  totalRequested: number;
  hydrated: number;
  outdatedAccounts: string[];
  failedAddresses: string[];
}

const toncenterV3 = {
  mainnet: 'https://toncenter.com/api/v3',
  testnet: 'https://testnet.toncenter.com/api/v3',
};

/**
 * Fetch raw account states from Toncenter v3 /api/v3/accountStates
 * Chunked into batches of up to 30 addresses per GET request, fetched in parallel.
 */
export async function batchFetchAccountStates(
  addresses: (Address | string)[],
  net: Network = defaultNetwork,
  chunkSize = 30,
): Promise<RawAccountStateItem[]> {
  if (!addresses || addresses.length === 0) return [];

  const rawAddresses = addresses.map((a) =>
    typeof a === 'string' ? a : a.toString(),
  );

  const base = toncenterV3[net === 'mainnet' ? 'mainnet' : 'testnet'];
  const apiKey = toncenterApiKey(net);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const chunks: string[][] = [];
  for (let i = 0; i < rawAddresses.length; i += chunkSize) {
    chunks.push(rawAddresses.slice(i, i + chunkSize));
  }

  const chunkPromises = chunks.map(async (chunk) => {
    const searchParams = new URLSearchParams();
    for (const addr of chunk) {
      searchParams.append('address', addr);
    }
    searchParams.append('include_boc', 'true');

    const url = `${base}/accountStates?${searchParams.toString()}`;

    try {
      const res = await rateLimitedFetch(url, { headers });
      if (!res.ok) {
        console.warn(
          `[batchFetchAccountStates] HTTP ${res.status} for chunk of ${chunk.length} addresses`,
        );
        return [];
      }
      const data = await res.json();
      if (Array.isArray(data?.accounts)) {
        return data.accounts as RawAccountStateItem[];
      }
      return [];
    } catch (err) {
      console.warn(
        '[batchFetchAccountStates] Failed to fetch accountStates chunk:',
        err,
      );
      return [];
    }
  });

  const chunkResults = await Promise.all(chunkPromises);
  return chunkResults.flat();
}

/**
 * In-Memory TL-B Parsers for contract states
 */
export function deserializeFiWalletDataBoc(
  dataBoc: string,
): FiWalletStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return FiWalletStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeFiMinterDataBoc(dataBoc: string): FiStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return FiStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePersonalStoreDataBoc(
  dataBoc: string,
): PersonalStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PersonalStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePersonalWalletDataBoc(
  dataBoc: string,
): PersonalWalletStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PersonalWalletStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeLocationDataBoc(
  dataBoc: string,
): LocationStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return LocationStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializeLotteryDataBoc(
  dataBoc: string,
): LotteryStorage | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return LotteryStorage.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

export function deserializePollDataBoc(dataBoc: string): PollStore | null {
  try {
    const cell = Cell.fromBase64(dataBoc);
    return PollStore.fromSlice(cell.beginParse());
  } catch {
    return null;
  }
}

/**
 * Computes personal wallet address deterministically off-chain using PersonalWallet.fromStorage
 */
export function computePersonalWalletAddress(
  personalMinter: Address,
  owner: Address,
  adminAddress: Address,
): Address {
  const wallet = PersonalWallet.fromStorage(
    {
      owner,
      deployer: adminAddress,
      minterAddress: personalMinter,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: owner },
    },
  );
  return wallet.address;
}

/**
 * Universal Contract Hydration
 * Hydrates contract states into IndexedDB in chunks of 30.
 * Automatically tries appropriate in-memory fromSlice parsers.
 * Marks outdated contracts without wasting RPC calls.
 */
export async function batchHydrateUniversal(
  addresses: (Address | string)[],
  net: Network = defaultNetwork,
  options?: {
    knownTypes?: Record<
      string,
      | 'fiWallet'
      | 'personalMinter'
      | 'personalWallet'
      | 'location'
      | 'lottery'
      | 'poll'
      | 'fiMinter'
    >;
  },
): Promise<UniversalHydrateResult> {
  const result: UniversalHydrateResult = {
    totalRequested: addresses.length,
    hydrated: 0,
    outdatedAccounts: [],
    failedAddresses: [],
  };

  if (!addresses || addresses.length === 0) return result;

  const accounts = await batchFetchAccountStates(addresses, net, 30);
  const accountMap = new Map<string, RawAccountStateItem>();

  for (const acc of accounts) {
    try {
      const parsedAddr = Address.parse(acc.address).toString();
      accountMap.set(parsedAddr, acc);
    } catch {
      accountMap.set(acc.address, acc);
    }
  }

  for (const addrInput of addresses) {
    let parsedAddress: Address;
    let standardAddrStr: string;

    try {
      parsedAddress =
        typeof addrInput === 'string' ? Address.parse(addrInput) : addrInput;
      standardAddrStr = parsedAddress.toString();
    } catch {
      result.failedAddresses.push(String(addrInput));
      continue;
    }

    const rawAcc = accountMap.get(standardAddrStr);
    if (!rawAcc || rawAcc.status !== 'active' || !rawAcc.data_boc) {
      result.failedAddresses.push(standardAddrStr);
      continue;
    }

    const knownType = options?.knownTypes?.[standardAddrStr];
    const expectedHash = knownType ? CONTRACT_CODE_HASHES[knownType] : null;
    const isCodeHashOutdated =
      Boolean(rawAcc.code_hash && expectedHash) &&
      rawAcc.code_hash !== expectedHash;

    const cacheKey = getNormalizedContractCacheKey(net, parsedAddress);

    let decodedStore: any = null;

    if (knownType === 'location') {
      decodedStore = deserializeLocationDataBoc(rawAcc.data_boc);
    } else if (knownType === 'personalMinter') {
      decodedStore = deserializePersonalStoreDataBoc(rawAcc.data_boc);
    } else if (knownType === 'personalWallet') {
      decodedStore = deserializePersonalWalletDataBoc(rawAcc.data_boc);
    } else if (knownType === 'lottery') {
      decodedStore = deserializeLotteryDataBoc(rawAcc.data_boc);
    } else if (knownType === 'poll') {
      decodedStore = deserializePollDataBoc(rawAcc.data_boc);
    } else if (knownType === 'fiMinter') {
      decodedStore = deserializeFiMinterDataBoc(rawAcc.data_boc);
    } else if (knownType === 'fiWallet') {
      decodedStore = deserializeFiWalletDataBoc(rawAcc.data_boc);
    } else {
      // Auto-detect by attempting parsers
      decodedStore =
        deserializeFiWalletDataBoc(rawAcc.data_boc) ||
        deserializeLocationDataBoc(rawAcc.data_boc) ||
        deserializePersonalStoreDataBoc(rawAcc.data_boc) ||
        deserializePersonalWalletDataBoc(rawAcc.data_boc) ||
        deserializeLotteryDataBoc(rawAcc.data_boc) ||
        deserializePollDataBoc(rawAcc.data_boc) ||
        deserializeFiMinterDataBoc(rawAcc.data_boc);
    }

    if (!decodedStore) {
      // If decoding fails, check if code_hash indicates an outdated contract schema
      if (isCodeHashOutdated) {
        result.outdatedAccounts.push(standardAddrStr);
      }
      result.failedAddresses.push(standardAddrStr);
      continue;
    }

    if (isCodeHashOutdated) {
      result.outdatedAccounts.push(standardAddrStr);
    }

    await setContractCache(cacheKey, decodedStore).catch(() => {});
    result.hydrated++;
  }

  return result;
}
