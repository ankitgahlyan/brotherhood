import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const AssetsScreen = lazyRoute(() =>
  import('@/features/assets').then((m) => ({
    default: m.AssetsScreen,
  })),
);

export const Route = createFileRoute('/wallet/assets')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <AssetsScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
