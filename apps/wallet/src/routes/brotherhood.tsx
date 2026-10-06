import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const BrotherhoodScreen = lazyRoute(() =>
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
