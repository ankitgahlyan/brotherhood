import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from '@/core/components/ui/sonner';
import { useWalletDataUpdater } from '@/core/hooks/use-wallet-data-updater';
import { useReceivedToasts } from '@/features/notifications';
import { useWalletStore } from '@demo/wallet-core';
import { LoaderCircle } from '@/core/components/ui/loader-circle';
import { Button } from '@/core/components/ui/button';
import { GlobalRequestModals } from '@/features/ton-connect';

function RootComponent() {
  const isWalletKitInitialized = useWalletStore(
    (state) => state.walletCore.isWalletKitInitialized,
  );
  const initializationError = useWalletStore(
    (state) => state.walletCore.initializationError,
  );

  useWalletDataUpdater();
  useReceivedToasts();

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

  if (!isWalletKitInitialized) {
    return <LoaderCircle />;
  }

  return (
    <>
      <Outlet />
      <GlobalRequestModals />
      <Toaster />
      {process.env.NODE_ENV === 'development' && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
