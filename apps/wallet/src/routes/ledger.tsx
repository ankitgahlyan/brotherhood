import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const LedgerScreen = lazy(() =>
  import('@/features/ledger').then((m) => ({
    default: m.LedgerScreen,
  })),
);

export const Route = createFileRoute('/ledger')({
  component: () => (
    <ProtectedRoute>
      <Suspense fallback={<RouteFallback />}>
        <LedgerScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
