/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from '@/core/routing';
import { useWallet } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { SwipeableSubTabs } from '@/core/components/shared/swipeable-sub-tabs';
import { sameAddress } from '@/core/utils/formatters';
import { BRO_TREASURY_ADDRESS, type Network } from '@/lib/brotherhood/config';
import { ExploreTab } from './explore-tab';
import { MyDomainsTab } from './my-domains-tab';
import { AdminTab } from './admin-tab';

type Tab = 'explore' | 'my-domains' | 'admin';

const VALID_TABS: Tab[] = ['explore', 'my-domains', 'admin'];
const TAB_LABELS: Record<Tab, string> = {
  explore: 'Explore',
  'my-domains': 'My Domains',
  admin: 'Admin',
};

export const DnsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, savedWallets, activeWalletId } = useWallet();

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const isTreasury = useMemo(() => {
    if (!address) return false;
    try {
      return sameAddress(address, BRO_TREASURY_ADDRESS);
    } catch {
      return false;
    }
  }, [address]);

  const activeTab = useMemo<Tab>(() => {
    const params = new URLSearchParams(location.search as string);
    const requested = params.get('tab') as Tab;
    if (requested && VALID_TABS.includes(requested)) return requested;
    return 'explore';
  }, [location.search]);

  const setActiveTab = (tab: Tab) => {
    navigate({ to: '/dns', search: { tab }, replace: true });
  };

  const tabs: Tab[] = isTreasury
    ? ['explore', 'my-domains', 'admin']
    : ['explore', 'my-domains'];

  return (
    <NewLayout
      header={
        <ScreenHeader title="Domains" onBack={() => navigate('/wallet')} />
      }
    >
      <SwipeableSubTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        stickyTabBar={
          <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid={`dns-tab-${tab}`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        }
      >
        {activeTab === 'explore' && <ExploreTab network={network} />}
        {activeTab === 'my-domains' && <MyDomainsTab network={network} />}
        {activeTab === 'admin' && isTreasury && <AdminTab network={network} />}
      </SwipeableSubTabs>
    </NewLayout>
  );
};
