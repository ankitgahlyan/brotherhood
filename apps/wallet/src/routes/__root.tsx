import React from 'react';
import {
  createRootRoute,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from '@/core/components/ui/sonner';
import { useWalletDataUpdater } from '@/core/hooks/use-wallet-data-updater';
import { useReceivedToasts } from '@/features/notifications/hooks/use-received-toasts';
import { useWalletStore } from '@demo/wallet-core';
import { LoaderCircle } from '@/core/components/ui/loader-circle';
import { Button } from '@/core/components/ui/button';
import { GlobalRequestModals } from '@/features/ton-connect';
import { PwaInstallBanner } from '@/core/components/pwa';
import { NotFound } from '@/core/components/shared/not-found';
import { RouteErrorFallback } from '@/core/components/shared/route-error-fallback';
import { initTelegramSdk, isTelegramEnvironment } from '@/core/lib/telegram';
import {
  registerRouterBack,
  notifyRouterNavigation,
} from '@/core/lib/back-stack';

const FloatingDevButton = React.lazy(() =>
  import('@/features/developer/components/floating-dev-button').then((m) => ({
    default: m.FloatingDevButton,
  })),
);

import { motion } from 'framer-motion';
import { useAnimationSettings } from '@/core/motion/motion-provider';

function RootComponent() {
  const { isReduced } = useAnimationSettings();
  const isWalletKitInitialized = useWalletStore(
    (state) => state.walletCore.isWalletKitInitialized,
  );
  const isHydrated = useWalletStore((state) => state.isHydrated);
  const isUnlocked = useWalletStore((state) => state.auth.isUnlocked);
  const handleTonConnectUrl = useWalletStore(
    (state) => state.handleTonConnectUrl,
  );
  const initializationError = useWalletStore(
    (state) => state.walletCore.initializationError,
  );

  const router = useRouter();
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  const hasProcessedLaunchLinkRef = React.useRef(false);

  // Initialize Telegram Mini App SDK (only in TWA build)
  React.useEffect(() => {
    if (import.meta.env.VITE_APP_TARGET === 'twa') {
      initTelegramSdk();
    }
  }, []);

  // Listen for `ton://transfer` links that should open the prefilled `/send` screen
  React.useEffect(() => {
    const onNavigateSend = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          recipient?: string;
          amount?: string;
          token?: string;
          comment?: string;
        }>
      ).detail;
      if (!detail) return;
      const sp = new URLSearchParams();
      if (detail.recipient) sp.set('recipient', detail.recipient);
      if (detail.amount) sp.set('amount', detail.amount);
      if (detail.token) sp.set('token', detail.token);
      if (detail.comment) sp.set('comment', detail.comment);
      const qs = sp.toString();
      notifyRouterNavigation();
      router.navigate({ to: `/send${qs ? `?${qs}` : ''}` as any });
    };
    window.addEventListener('brotherhood_navigate_send', onNavigateSend);
    return () =>
      window.removeEventListener('brotherhood_navigate_send', onNavigateSend);
  }, [router]);

  // Process external launch deep links (TMA start_param, ?url=..., ?tonconnect=..., or ?v=2&id=...&r=...)
  React.useEffect(() => {
    if (
      hasProcessedLaunchLinkRef.current ||
      !isWalletKitInitialized ||
      !isHydrated ||
      !isUnlocked ||
      typeof window === 'undefined'
    ) {
      return;
    }
    if (currentPath.endsWith('/ton-connect')) {
      hasProcessedLaunchLinkRef.current = true;
      return;
    }

    const sp = new URLSearchParams(window.location.search);
    const tgStartParam = (
      window as unknown as {
        Telegram?: {
          WebApp?: { initDataUnsafe?: { start_param?: string } };
        };
      }
    ).Telegram?.WebApp?.initDataUnsafe?.start_param;

    let candidateUrl = '';
    if (sp.get('url') || sp.get('tonconnect')) {
      candidateUrl = window.location.href;
    } else if (sp.get('v') && sp.get('id') && sp.get('r')) {
      candidateUrl = window.location.href;
    } else if (sp.get('startapp') || sp.get('tgWebAppStartParam')) {
      candidateUrl = window.location.href;
    } else if (
      tgStartParam &&
      (tgStartParam.startsWith('tonconnect-') ||
        tgStartParam.startsWith('ton://') ||
        tgStartParam.startsWith('tc://'))
    ) {
      candidateUrl = tgStartParam;
    }

    if (candidateUrl) {
      hasProcessedLaunchLinkRef.current = true;
      // Clean consumed launch parameters from location bar
      if (
        sp.has('url') ||
        sp.has('tonconnect') ||
        (sp.has('v') && sp.has('id') && sp.has('r')) ||
        sp.has('startapp') ||
        sp.has('tgWebAppStartParam')
      ) {
        sp.delete('url');
        sp.delete('tonconnect');
        sp.delete('v');
        sp.delete('id');
        sp.delete('r');
        sp.delete('ret');
        sp.delete('startapp');
        sp.delete('tgWebAppStartParam');
        const nextSearch = sp.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(window.history.state, '', nextUrl);
      }
      void handleTonConnectUrl(candidateUrl).catch(() => {
        /* handled by slice */
      });
    }
  }, [
    isWalletKitInitialized,
    isHydrated,
    isUnlocked,
    currentPath,
    handleTonConnectUrl,
  ]);

  // Sync Router back navigation with Unified Back Stack (Tier 2/3)
  React.useEffect(() => {
    let clean = currentPath.replace(/\/+$/, '') || '/';
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    if (base && base !== '/' && clean.startsWith(base)) {
      clean = clean.slice(base.length) || '/';
    }

    const isRoot =
      clean === '' ||
      clean === '/' ||
      clean === '/wallet' ||
      clean === '/welcome' ||
      clean === '/unlock';

    registerRouterBack(() => {
      try {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.history.back();
        } else {
          router.navigate({ to: '/wallet' as any });
        }
      } catch {
        router.navigate({ to: '/wallet' as any });
      }
    }, isRoot);
  }, [currentPath, router]);

  useWalletDataUpdater();
  useReceivedToasts();

  const isTma = isTelegramEnvironment();

  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-2xl p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Initialization Error
          </h2>
          <p className="text-muted-foreground mb-6">
            Failed to initialize wallet. Please reload the page.
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="w-full cursor-pointer"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isWalletKitInitialized || !isHydrated) {
    return <LoaderCircle />;
  }

  return (
    <>
      {isReduced ? (
        <Outlet />
      ) : (
        <motion.div
          key={currentPath}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="min-h-screen w-full flex flex-col flex-1"
        >
          <Outlet />
        </motion.div>
      )}
      <GlobalRequestModals />
      {!isTma && <PwaInstallBanner />}
      <React.Suspense fallback={null}>
        <FloatingDevButton />
      </React.Suspense>
      <Toaster />
      {(process.env.NODE_ENV === 'development' ||
        import.meta.env.VITE_DEVTOOLS === 'true') && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RouteErrorFallback,
});
