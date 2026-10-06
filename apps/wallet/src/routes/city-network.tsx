import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const CityNetworkScreen = lazyRoute(() =>
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
