import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { BottomNav } from '../bottom-nav';
import { ScreenSwipeContainer } from '../screen-swipe-container';
import { useScrollDirection } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { usePreferences } from '@demo/wallet-core';

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
  const { surfaceStyle, isGlass, resolvedTheme } = useTheme();
  const { animationLevel } = usePreferences();

  const enableSvgRefraction =
    (surfaceStyle === 'glass_hybrid' || surfaceStyle === 'glass_tilt') &&
    animationLevel !== 'none';
  const isAnimatedOrbs = animationLevel === 'full';
  const isOled = resolvedTheme === 'oled';

  return (
    <div className="relative min-h-screen bg-background text-foreground select-none pt-(--tg-safe-area-top,0px) pb-(--tg-safe-area-bottom,0px) flex flex-col overflow-x-clip">
      {/* Shared SVG Optical Refraction Filters for Hybrid & Interactive 3D Liquid Glass */}
      {enableSvgRefraction && (
        <svg
          className="pointer-events-none fixed w-0 h-0 opacity-0"
          width="0"
          height="0"
          aria-hidden="true"
        >
          <defs>
            <filter
              id="liquid-glass-refract"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.016 0.02"
                numOctaves="2"
                seed="4"
                result="noise"
              />
              <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softNoise"
                scale="11"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter
              id="liquid-droplet-refract"
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.028"
                numOctaves="1"
                seed="9"
                result="wave"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="wave"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="B"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Ambient Background Light Field for Liquid Glass */}
      {isGlass && (
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          {isOled ? (
            /* OLED Mode: Keep canvas pure #000000 with only a tight localized under-hero glow */
            <div className="mx-auto max-w-md relative h-full">
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-56 h-24 rounded-full bg-primary/18 blur-3xl" />
            </div>
          ) : (
            /* Soft Daylight, Warm Paper & Midnight: Palette-driven ambient aurora orbs */
            <div className="mx-auto max-w-md relative h-full">
              <div
                className={`absolute -top-8 -left-10 w-60 h-60 rounded-full bg-primary/20 blur-3xl ${
                  isAnimatedOrbs ? 'liquid-ambient-orb-1' : ''
                }`}
              />
              <div
                className={`absolute top-44 -right-12 w-64 h-64 rounded-full bg-chart-2/16 blur-3xl ${
                  isAnimatedOrbs ? 'liquid-ambient-orb-2' : ''
                }`}
              />
              <div className="absolute bottom-14 left-1/4 w-52 h-40 rounded-full bg-chart-3/12 blur-3xl" />
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 max-w-md mx-auto w-full flex-1 flex flex-col @container">
        <div
          className={`sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
            isGlass
              ? 'bg-background/70 backdrop-blur-xl border-b border-border/40'
              : 'bg-background/95 backdrop-blur-md'
          } ${isBarsVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
          {!hideUniversalHeader && <DashboardHeader />}
          {header}
        </div>
        <ScreenSwipeContainer>
          <main
            className={`px-4 flex-1 flex flex-col min-w-0 ${
              hideBottomNav ? 'pb-6' : 'pb-28'
            }`}
          >
            {children}
          </main>
        </ScreenSwipeContainer>
        {!hideBottomNav && <BottomNav isVisible={isBarsVisible} />}
      </div>
    </div>
  );
};
