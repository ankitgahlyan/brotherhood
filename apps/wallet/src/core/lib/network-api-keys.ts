/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const STORAGE_KEY_TESTNET_TONCENTER =
  'brotherhood_api_key_testnet_toncenter';
export const STORAGE_KEY_TESTNET_TONAPI = 'brotherhood_api_key_testnet_tonapi';
export const STORAGE_KEY_TESTNET_PROVIDER = 'brotherhood_api_provider_testnet';

export const API_KEYS_UPDATED_EVENT = 'brotherhood:api-keys-updated';

export type ApiKeyType = 'toncenter' | 'tonapi';
export type TestnetProvider = 'toncenter' | 'tonapi' | 'orbs';

let cachedOrbsEndpoint: string | null = null;
let orbsEndpointPromise: Promise<string> | null = null;

export async function getOrbsHttpEndpoint(
  network: 'testnet' | 'mainnet' = 'testnet',
): Promise<string> {
  if (cachedOrbsEndpoint) return cachedOrbsEndpoint;
  if (!orbsEndpointPromise) {
    orbsEndpointPromise = (async () => {
      try {
        const { getHttpEndpoint } = await import('@orbs-network/ton-access');
        const endpoint = await getHttpEndpoint({ network });
        cachedOrbsEndpoint = endpoint;
        return endpoint;
      } catch (err) {
        console.warn(
          '[Orbs] Failed to fetch decentralized RPC endpoint, falling back to public toncenter:',
          err,
        );
        return network === 'mainnet'
          ? 'https://toncenter.com/api/v2/jsonRPC'
          : 'https://testnet.toncenter.com/api/v2/jsonRPC';
      } finally {
        orbsEndpointPromise = null;
      }
    })();
  }
  return orbsEndpointPromise;
}

export function getCustomApiKey(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER
      : STORAGE_KEY_TESTNET_TONAPI;
  const val = localStorage.getItem(key);
  return val && val.trim() ? val.trim() : null;
}

export function setCustomApiKey(
  type: ApiKeyType,
  _network: 'testnet' = 'testnet',
  val: string | null,
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const key =
    type === 'toncenter'
      ? STORAGE_KEY_TESTNET_TONCENTER
      : STORAGE_KEY_TESTNET_TONAPI;

  if (val && val.trim()) {
    localStorage.setItem(key, val.trim());
  } else {
    localStorage.removeItem(key);
  }

  notifyApiKeysUpdated();
}

export function getTestnetApiProvider(): TestnetProvider {
  if (typeof window === 'undefined' || !window.localStorage) return 'toncenter';
  const val = localStorage.getItem(STORAGE_KEY_TESTNET_PROVIDER);
  if (val === 'tonapi' || val === 'orbs') return val;
  return 'toncenter';
}

export function setTestnetApiProvider(provider: TestnetProvider): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.setItem(STORAGE_KEY_TESTNET_PROVIDER, provider);
  notifyApiKeysUpdated();
}

export function notifyApiKeysUpdated(): void {
  if (
    typeof window !== 'undefined' &&
    typeof window.dispatchEvent === 'function' &&
    typeof CustomEvent === 'function'
  ) {
    window.dispatchEvent(new CustomEvent(API_KEYS_UPDATED_EVENT));
  }
}
