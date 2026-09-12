/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { WalletProvider } from '@demo/wallet-core';
import type { WalletKitConfig } from '@demo/wallet-core';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from '@/lib/brotherhood/ton';
import {
  DISABLE_AUTO_EMULATION,
  DISABLE_HTTP_BRIDGE,
  DISABLE_MANIFEST_DOMAIN_CHECK,
  DISABLE_NETWORK_SEND,
  ENV_BRIDGE_URL,
  ENV_TON_API_KEY_MAINNET,
  ENV_TON_API_KEY_TESTNET,
  ENV_TON_API_KEY_TETRA,
  ENV_TON_API_PROVIDER,
} from '@/core/lib/env';

import {
  getCustomApiKey,
  getTestnetApiProvider,
  API_KEYS_UPDATED_EVENT,
} from '@/core/lib/network-api-keys';
import { useTrackedAddressesSync } from '@/core/hooks/use-tracked-addresses-sync';

import './App.css';
import './storePatch';

function TrackedAddressesSyncMount() {
  useTrackedAddressesSync();
  return null;
}

/**
 * Creates a Ledger transport for web using WebHID API
 * This is used for connecting to Ledger hardware wallets via USB
 */
const createWebLedgerTransport = () => TransportWebHID.create();

function getActiveWalletKitConfig(): WalletKitConfig {
  const provider = getTestnetApiProvider();
  const customToncenter = getCustomApiKey('toncenter', 'testnet');
  const customTonApi = getCustomApiKey('tonapi', 'testnet');

  const activeTestnetKey =
    provider === 'tonapi'
      ? customTonApi || ENV_TON_API_KEY_TESTNET
      : customToncenter || ENV_TON_API_KEY_TESTNET;

  return {
    disableHttpBridge: DISABLE_HTTP_BRIDGE,
    disableNetworkSend: DISABLE_NETWORK_SEND,
    disableManifestDomainCheck: DISABLE_MANIFEST_DOMAIN_CHECK,
    bridgeUrl: ENV_BRIDGE_URL,
    tonApiProvider: provider === 'tonapi' ? 'tonapi' : ENV_TON_API_PROVIDER,
    tonApiKeyMainnet: ENV_TON_API_KEY_MAINNET,
    tonApiKeyTestnet: activeTestnetKey,
    tonApiKeyTetra: ENV_TON_API_KEY_TETRA,
    createLedgerTransport: createWebLedgerTransport,
    disableAutoEmulation: DISABLE_AUTO_EMULATION,
  };
}

export function App() {
  const [configKey, setConfigKey] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setConfigKey((k) => k + 1);
    };
    window.addEventListener(API_KEYS_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(API_KEYS_UPDATED_EVENT, handleUpdate);
  }, []);

  // Re-read config whenever configKey updates
  const config = getActiveWalletKitConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider
        key={configKey}
        storage={localStorage}
        walletKitConfig={config}
        enableDevtools={true}
      >
        <TrackedAddressesSyncMount />
        <RouterProvider router={router} />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
