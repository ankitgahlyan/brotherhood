import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const Swap = lazyRoute(() =>
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
