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
import { Compass, Globe, ShieldCheck, type LucideIcon } from 'lucide-react';
import { ScrollableTabBar } from '@/core/components/ui/tabs';
import { ExploreTab } from './explore-tab';
import { MyDomainsTab } from './my-domains-tab';
import { AdminTab } from './admin-tab';

type Tab = 'explore' | 'my-domains' | 'admin';

const VALID_TABS: Tab[] = ['explore', 'my-domains', 'admin'];
const DNS_TAB_CONFIG: Record<
  Tab,
  {
    label: string;
    icon: LucideIcon | React.ComponentType<{ className?: string }>;
    activeColorClass?: string;
  }
> = {
  explore: {
    label: 'Explore',
    icon: Compass,
    activeColorClass:
      'bg-card text-cyan-500 font-semibold border border-border shadow-xs',
  },
  'my-domains': {
    label: 'My Domains',
    icon: Globe,
    activeColorClass:
      'bg-card text-blue-500 font-semibold border border-border shadow-xs',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    activeColorClass:
      'bg-card text-purple-500 font-semibold border border-border shadow-xs',
  },
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
          <ScrollableTabBar
            tabs={tabs.map((tab) => ({
              id: tab,
              label: DNS_TAB_CONFIG[tab].label,
              icon: DNS_TAB_CONFIG[tab].icon,
              testId: `dns-tab-${tab}`,
              activeColorClass: DNS_TAB_CONFIG[tab].activeColorClass,
            }))}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as Tab)}
          />
        }
      >
        {activeTab === 'explore' && <ExploreTab network={network} />}
        {activeTab === 'my-domains' && <MyDomainsTab network={network} />}
        {activeTab === 'admin' && isTreasury && <AdminTab network={network} />}
      </SwipeableSubTabs>
    </NewLayout>
  );
};
