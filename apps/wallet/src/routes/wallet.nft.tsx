import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const NftsScreen = lazy(() =>
  import('@/features/nft').then((m) => ({
    default: m.NftsScreen,
  })),
);

export const Route = createFileRoute('/wallet/nft')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <NftsScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
