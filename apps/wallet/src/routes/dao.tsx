import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const DaoScreen = lazy(() =>
  import('@/features/dao').then((m) => ({
    default: m.DaoScreen,
  })),
);

export const Route = createFileRoute('/dao')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <DaoScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
