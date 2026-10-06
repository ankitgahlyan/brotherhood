import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const SetupPasswordScreen = lazyRoute(() =>
  import('@/features/auth').then((m) => ({
    default: m.SetupPasswordScreen,
  })),
);

export const Route = createFileRoute('/setup-password')({
  component: () => (
    <Suspense fallback={<RouteFallback />}>
      <SetupPasswordScreen />
    </Suspense>
  ),
});
