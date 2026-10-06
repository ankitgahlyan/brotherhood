import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const ImportWalletScreen = lazyRoute(() =>
  import('@/features/wallet-setup').then((m) => ({
    default: m.ImportWalletScreen,
  })),
);

export const Route = createFileRoute('/import-wallet')({
  component: () => (
    <ProtectedRoute>
      <Suspense fallback={<RouteFallback />}>
        <ImportWalletScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
