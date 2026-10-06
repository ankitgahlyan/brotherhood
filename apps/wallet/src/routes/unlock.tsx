import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const UnlockScreen = lazyRoute(() =>
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
