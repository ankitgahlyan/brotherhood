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
import { NotFound } from '@/core/components/shared/not-found';
import { RouteErrorFallback } from '@/core/components/shared/route-error-fallback';
import { initTelegramSdk, isTelegramEnvironment } from '@/core/lib/telegram';
import {
  registerRouterBack,
  notifyRouterNavigation,
} from '@/core/lib/back-stack';

const GlobalRequestModals = React.lazy(() =>
  import('@/features/ton-connect').then((m) => ({
    default: m.GlobalRequestModals,
  })),
);

const PwaInstallBanner = React.lazy(() =>
  import('@/core/components/pwa').then((m) => ({
    default: m.PwaInstallBanner,
  })),
);

const FloatingDevButton = React.lazy(() =>
  import('@/features/developer/components/floating-dev-button').then((m) => ({
    default: m.FloatingDevButton,
  })),
);

function extractEmbeddedTonLink(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(
    /(?:web\+tonconnect|web\+ton|tonconnect|ton|tc):\/\/[^\s"'<>]+/i,
  );
  if (match) {
    return match[0];
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('tonconnect-')) {
    return trimmed;
  }
  return null;
}

function captureLaunchTonLinkFromWindow(): string {
  if (typeof window === 'undefined') return '';
  if (window.location.pathname.endsWith('/ton-connect')) return '';

  const sp = new URLSearchParams(window.location.search);
  const directCandidate =
    extractEmbeddedTonLink(sp.get('tonlink')) ||
    extractEmbeddedTonLink(sp.get('tonconnect')) ||
    extractEmbeddedTonLink(sp.get('url')) ||
    extractEmbeddedTonLink(sp.get('text')) ||
    extractEmbeddedTonLink(sp.get('title'));

  let candidateUrl = '';
  if (directCandidate) {
    candidateUrl = directCandidate;
  } else if (sp.get('v') && sp.get('id') && sp.get('r')) {
    candidateUrl = window.location.href;
  } else if (sp.get('startapp') || sp.get('tgWebAppStartParam')) {
    candidateUrl = window.location.href;
  }

  if (candidateUrl) {
    for (const key of [
      'tonlink',
      'tonconnect',
      'url',
      'text',
      'title',
      'v',
      'id',
      'r',
      'ret',
      'startapp',
      'tgWebAppStartParam',
    ]) {
      sp.delete(key);
    }
    const nextSearch = sp.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    try {
      window.history.replaceState(window.history.state, '', nextUrl);
    } catch {
      /* ignore history state errors */
    }
  }

  return candidateUrl;
}

let pendingInitialLaunchLink =
  typeof window !== 'undefined' ? captureLaunchTonLinkFromWindow() : '';

function RootComponent() {
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

  // Process external launch deep links (PWA share_target, protocol_handlers, TMA start_param, or ?v=2&id=...&r=...)
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

    const tgStartParam = (
      window as unknown as {
        Telegram?: {
          WebApp?: { initDataUnsafe?: { start_param?: string } };
        };
      }
    ).Telegram?.WebApp?.initDataUnsafe?.start_param;

    let candidateUrl =
      pendingInitialLaunchLink || captureLaunchTonLinkFromWindow();
    pendingInitialLaunchLink = '';

    if (
      !candidateUrl &&
      tgStartParam &&
      (tgStartParam.startsWith('tonconnect-') ||
        tgStartParam.startsWith('ton://') ||
        tgStartParam.startsWith('tc://'))
    ) {
      candidateUrl = tgStartParam;
    }

    if (candidateUrl) {
      hasProcessedLaunchLinkRef.current = true;
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
      <Outlet />
      <React.Suspense fallback={null}>
        <GlobalRequestModals />
      </React.Suspense>
      {!isTma && (
        <React.Suspense fallback={null}>
          <PwaInstallBanner />
        </React.Suspense>
      )}
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
