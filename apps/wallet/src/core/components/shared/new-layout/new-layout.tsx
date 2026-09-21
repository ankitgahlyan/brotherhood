import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { BottomNav } from '../bottom-nav';
import { ScreenSwipeContainer } from '../screen-swipe-container';
import { useScrollDirection } from '@/core/hooks';

interface NewLayoutProps {
  header?: React.ReactNode;
  hideUniversalHeader?: boolean;
  hideBottomNav?: boolean;
  children: React.ReactNode;
}

export const NewLayout: React.FC<NewLayoutProps> = ({
  header,
  hideUniversalHeader = false,
  hideBottomNav = false,
  children,
}) => {
  const isBarsVisible = useScrollDirection();

  return (
    <ScreenSwipeContainer>
      <div className="min-h-screen bg-background text-foreground select-none pt-[var(--tg-safe-area-top,0px)] pb-[var(--tg-safe-area-bottom,0px)]">
        <div className="max-w-md mx-auto">
          <div
            className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
              isBarsVisible ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            {!hideUniversalHeader && <DashboardHeader />}
            {header}
          </div>
          <main className={`px-4 ${hideBottomNav ? 'pb-6' : 'pb-24'}`}>
            {children}
          </main>
          {!hideBottomNav && <BottomNav isVisible={isBarsVisible} />}
        </div>
      </div>
    </ScreenSwipeContainer>
  );
};
