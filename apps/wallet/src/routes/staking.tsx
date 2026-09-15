import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const Staking = lazy(() =>
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
