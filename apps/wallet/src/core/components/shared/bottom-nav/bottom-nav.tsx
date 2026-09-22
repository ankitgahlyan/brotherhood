/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from '@/core/routing';
import { Wallet, Coins, Sparkles, Building2, Vote, Ticket } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export const ECOSYSTEM_NAV_ITEMS: NavItem[] = [
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    path: '/wallet',
  },
  {
    id: 'brotherhood',
    label: 'Fi',
    icon: Coins,
    path: '/brotherhood',
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: Sparkles,
    path: '/personal-jetton',
  },
  {
    id: 'city',
    label: 'Cities',
    icon: Building2,
    path: '/city-network',
  },
  {
    id: 'dao',
    label: 'DAO',
    icon: Vote,
    path: '/dao',
  },
  {
    id: 'lottery',
    label: 'Lottery',
    icon: Ticket,
    path: '/lottery',
  },
];

interface BottomNavProps {
  isVisible?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isVisible = true }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  const getIsActive = (item: NavItem) => {
    if (item.path === '/wallet') {
      return (
        pathname === '/' ||
        pathname === '/wallet' ||
        pathname.startsWith('/wallet/')
      );
    }
    return pathname.startsWith(item.path);
  };

  // Scroll active tab into view horizontally if needed
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [pathname]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/70 select-none pb-[var(--tg-safe-area-bottom,0px)] transition-transform duration-300 ease-in-out no-swipe ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-label="Bottom Navigation"
      data-swipe-ignore="true"
    >
      <div className="max-w-md mx-auto flex items-center gap-1 px-2 py-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity">
        {ECOSYSTEM_NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex-1 min-w-[54px] shrink-0 snap-center flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-primary scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
              aria-label={item.label}
              data-testid={`bottom-nav-${item.id}`}
            >
              <div
                className={`relative flex items-center justify-center w-9 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-primary/15' : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight leading-tight truncate w-full text-center transition-all ${
                  isActive ? 'font-bold text-foreground' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
