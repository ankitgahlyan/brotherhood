import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const CityNetworkScreen = lazy(() =>
  import('@/features/city-network').then((m) => ({
    default: m.CityNetworkScreen,
  })),
);

export const Route = createFileRoute('/city-network')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <CityNetworkScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
