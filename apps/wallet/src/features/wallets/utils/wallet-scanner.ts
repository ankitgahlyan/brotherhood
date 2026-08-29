/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Signer, WalletV5R1Adapter, WalletV4R2Adapter } from '@ton/walletkit';
import type { ITonWalletKit } from '@ton/walletkit';
import type { NetworkType } from '@demo/wallet-core';
import { getChainNetwork } from '@demo/wallet-core';

export interface DiscoveredWalletVersion {
    id: string;
    version: 'v5r1' | 'v4r2';
    subwalletId?: number;
    versionLabel: string;
    address: string;
    balanceNano: bigint;
    balanceFormatted: string;
    status: string;
    hasActivity: boolean;
    eventCount: number;
}

export async function scanMnemonicWallets(params: {
    mnemonic: string[];
    network: NetworkType;
    walletKit: ITonWalletKit | null;
}): Promise<DiscoveredWalletVersion[]> {
    const { mnemonic, network, walletKit } = params;
    if (!walletKit) {
        throw new Error('WalletKit not initialized');
    }

    const chainNetwork = getChainNetwork(network);
    const client = walletKit.getApiClient(chainNetwork);

    const domain =
        network === 'tetra'
            ? {
                  type: 'l2' as const,
                  globalId: 662387,
              }
            : undefined;

    const signer = await Signer.fromMnemonic(mnemonic, { type: 'ton' });

    // Derive v5r1 testnet walletId (2147483645)
    const v5TestnetAdapter = await WalletV5R1Adapter.create(signer, {
        client,
        network: chainNetwork,
        walletId: 2147483645,
        domain,
    });
    const v5TestnetAddress = v5TestnetAdapter.getAddress();

    // Derive v5r1 mainnet walletId (2147483409)
    const v5MainnetAdapter = await WalletV5R1Adapter.create(signer, {
        client,
        network: chainNetwork,
        walletId: 2147483409,
        domain,
    });
    const v5MainnetAddress = v5MainnetAdapter.getAddress();

    // Derive v4r2 adapter
    const v4Adapter = await WalletV4R2Adapter.create(signer, {
        client,
        network: chainNetwork,
        domain,
    });
    const v4Address = v4Adapter.getAddress();

    // Query on-chain account states and events
    const [states, v5TestnetEvents, v5MainnetEvents, v4Events] = await Promise.all([
        client.getAccountStates([v5TestnetAddress, v5MainnetAddress, v4Address]).catch(() => null),
        client.getEvents({ account: v5TestnetAddress, limit: 1 }).catch(() => null),
        client.getEvents({ account: v5MainnetAddress, limit: 1 }).catch(() => null),
        client.getEvents({ account: v4Address, limit: 1 }).catch(() => null),
    ]);

    const v5TestnetBal = BigInt(states?.[v5TestnetAddress]?.balance ?? '0');
    const v5MainnetBal = BigInt(states?.[v5MainnetAddress]?.balance ?? '0');
    const v4Bal = BigInt(states?.[v4Address]?.balance ?? '0');

    const v5TestnetEvCount = v5TestnetEvents?.events?.length ?? 0;
    const v5MainnetEvCount = v5MainnetEvents?.events?.length ?? 0;
    const v4EvCount = v4Events?.events?.length ?? 0;

    return [
        {
            id: 'v5r1_testnet',
            version: 'v5r1',
            subwalletId: 2147483645,
            versionLabel: 'W5 (Testnet WalletID: 2147483645)',
            address: v5TestnetAddress,
            balanceNano: v5TestnetBal,
            balanceFormatted: (Number(v5TestnetBal) / 1e9).toFixed(4),
            status: states?.[v5TestnetAddress]?.status ?? 'uninit',
            hasActivity: v5TestnetBal > 0n || states?.[v5TestnetAddress]?.status === 'active' || v5TestnetEvCount > 0,
            eventCount: v5TestnetEvCount,
        },
        {
            id: 'v5r1_mainnet',
            version: 'v5r1',
            subwalletId: 2147483409,
            versionLabel: 'W5 (Mainnet WalletID: 2147483409)',
            address: v5MainnetAddress,
            balanceNano: v5MainnetBal,
            balanceFormatted: (Number(v5MainnetBal) / 1e9).toFixed(4),
            status: states?.[v5MainnetAddress]?.status ?? 'uninit',
            hasActivity: v5MainnetBal > 0n || states?.[v5MainnetAddress]?.status === 'active' || v5MainnetEvCount > 0,
            eventCount: v5MainnetEvCount,
        },
        {
            id: 'v4r2',
            version: 'v4r2',
            versionLabel: 'Wallet V4R2 (Standard)',
            address: v4Address,
            balanceNano: v4Bal,
            balanceFormatted: (Number(v4Bal) / 1e9).toFixed(4),
            status: states?.[v4Address]?.status ?? 'uninit',
            hasActivity: v4Bal > 0n || states?.[v4Address]?.status === 'active' || v4EvCount > 0,
            eventCount: v4EvCount,
        },
    ];
}
