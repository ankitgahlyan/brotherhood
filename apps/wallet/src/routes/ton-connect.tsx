import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const TonConnectRoute = lazy(() =>
  import('@/features/ton-connect').then((m) => ({
    default: m.TonConnectRoute,
  })),
);

export const Route = createFileRoute('/ton-connect')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <TonConnectRoute />
      </Suspense>
    </ProtectedRoute>
  ),
});
