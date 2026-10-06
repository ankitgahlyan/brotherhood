import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const LedgerScreen = lazyRoute(() =>
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
