import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { FI_ADDRESS, DEFAULT_NETWORK, type Network } from './config';
import { FossFi } from '@wrappers/FossFi.gen';
import { FossFiWallet } from '@wrappers/FossFiWallet.gen';
import { getContractCache, setContractCache, getNormalizedContractCacheKey } from './contract-cache';
import { TONCENTER_MAINNET_URL, TONCENTER_TESTNET_URL } from '../../config';
import { getGlobal } from '../../global';
import { resetTonCoreClients } from '../../api/chains/ton/util/tonCore';

const clients: Record<string, TonClient> = {};

export function getTonClient(network: Network = DEFAULT_NETWORK): TonClient {
  const global = getGlobal();
  const isDirect = Boolean(global?.settings?.isDirectTestnetApi);
  const customUrl = network === 'testnet' ? global?.settings?.customToncenterTestnetUrl?.trim() : undefined;
  const customKey = network === 'testnet' ? global?.settings?.customToncenterTestnetKey?.trim() : undefined;
  // Only route directly if direct mode is enabled AND a key or custom URL is configured
  const hasDirectConfig = Boolean(customKey) || Boolean(customUrl);
  const shouldUseDirect = isDirect && hasDirectConfig;

  const clientKey = `${network}:${shouldUseDirect ? 'direct' : 'proxy'}:${customUrl || ''}:${customKey || ''}`;

  if (!clients[clientKey]) {
    let endpoint: string;
    if (customUrl) {
      endpoint = `${customUrl.replace(/\/+$/, '')}/api/v2/jsonRPC`;
    } else if (shouldUseDirect) {
      endpoint = network === 'mainnet'
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    } else {
      const base = network === 'mainnet' ? TONCENTER_MAINNET_URL : TONCENTER_TESTNET_URL;
      endpoint = `${base.replace(/\/+$/, '')}/api/v2/jsonRPC`;
    }

    clients[clientKey] = new TonClient({
      endpoint,
      apiKey: customKey || undefined,
    });
  }
  return clients[clientKey];
}

export function resetTonClients(): void {
  for (const k of Object.keys(clients)) {
    delete clients[k];
  }
  resetTonCoreClients();
}

export async function getFiWalletAddress(
  ownerAddress: Address,
  net: Network = DEFAULT_NETWORK,
): Promise<Address> {
  const minterAddress = Address.parse(FI_ADDRESS);
  const cacheKey = `fiWalletAddress:${net}:${minterAddress.toString()}:${ownerAddress.toString()}`;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return Address.parse(cached);
      } catch {
        /* pass */
      }
    }
  }

  const client = getTonClient(net);
  const result = await client.runMethod(minterAddress, 'get_wallet_address', [
    {
      type: 'slice',
      cell: beginCell().storeAddress(ownerAddress).endCell(),
    },
  ]);
  const addr = result.stack.readAddress();

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(cacheKey, addr.toString());
  }

  return addr;
}

export async function checkIsContractDeployed(
  address: Address,
  net: Network = DEFAULT_NETWORK,
): Promise<boolean> {
  try {
    const client = getTonClient(net);
    const state = await client.getContractState(address);
    return state.state === 'active';
  } catch {
    return false;
  }
}

export async function getFiMinterState(net: Network = DEFAULT_NETWORK) {
  const minterAddress = Address.parse(FI_ADDRESS);
  const client = getTonClient(net);
  const contract = client.open(FossFi.fromAddress(minterAddress));
  return contract.getMinterDataAll();
}

export async function getFiWalletStateByAddress(
  walletAddr: Address,
  net: Network = DEFAULT_NETWORK,
) {
  const client = getTonClient(net);
  const contract = client.open(FossFiWallet.fromAddress(walletAddr));
  return contract.getWalletDataAll();
}

export async function getFiWalletState(
  ownerAddress: Address,
  net: Network = DEFAULT_NETWORK,
) {
  const isDeployed = await checkIsContractDeployed(Address.parse(FI_ADDRESS), net);
  if (!isDeployed) return null;

  const walletAddr = await getFiWalletAddress(ownerAddress, net);
  const isWalletDeployed = await checkIsContractDeployed(walletAddr, net);
  if (!isWalletDeployed) {
    return {
      isDeployed: false,
      walletAddress: walletAddr,
      data: null,
    };
  }

  const data = await getFiWalletStateByAddress(walletAddr, net);
  return {
    isDeployed: true,
    walletAddress: walletAddr,
    data,
  };
}
