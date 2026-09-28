import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const ImportWalletScreen = lazy(() =>
  import('@/features/wallet-setup').then((m) => ({
    default: m.ImportWalletScreen,
  })),
);

export const Route = createFileRoute('/import-wallet')({
  component: () => (
    <Suspense fallback={<RouteFallback />}>
      <ImportWalletScreen />
    </Suspense>
  ),
});
