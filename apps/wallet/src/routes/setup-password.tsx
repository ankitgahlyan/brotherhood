import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const SetupPasswordScreen = lazy(() =>
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
