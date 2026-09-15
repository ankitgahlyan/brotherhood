import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const Swap = lazy(() =>
  import('@/features/swap').then((m) => ({
    default: m.Swap,
  })),
);

export const Route = createFileRoute('/swap')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <Swap />
      </Suspense>
    </ProtectedRoute>
  ),
});
