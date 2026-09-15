import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const BrotherhoodScreen = lazy(() =>
  import('@/features/brotherhood').then((m) => ({
    default: m.BrotherhoodScreen,
  })),
);

export const Route = createFileRoute('/brotherhood')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <BrotherhoodScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
