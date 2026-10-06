import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const WalletDashboard = lazyRoute(() =>
  import('@/features/dashboard').then((m) => ({
    default: m.WalletDashboard,
  })),
);

export const Route = createFileRoute('/wallet/')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <WalletDashboard />
      </Suspense>
    </ProtectedRoute>
  ),
});
