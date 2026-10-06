import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const UnlockScreen = lazy(() =>
  import('@/features/auth').then((m) => ({
    default: m.UnlockScreen,
  })),
);

export const Route = createFileRoute('/unlock')({
  component: () => (
    <Suspense fallback={<RouteFallback />}>
      <UnlockScreen />
    </Suspense>
  ),
});
