import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const HistoryScreen = lazy(() =>
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
