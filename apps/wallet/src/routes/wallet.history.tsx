import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const HistoryScreen = lazyRoute(() =>
  import('@/features/transactions').then((m) => ({
    default: m.HistoryScreen,
  })),
);

export const Route = createFileRoute('/wallet/history')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <HistoryScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
