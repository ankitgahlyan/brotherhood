import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const Staking = lazyRoute(() =>
  import('@/features/staking').then((m) => ({
    default: m.Staking,
  })),
);

export const Route = createFileRoute('/staking')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <Staking />
      </Suspense>
    </ProtectedRoute>
  ),
});
