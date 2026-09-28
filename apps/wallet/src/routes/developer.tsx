import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const DeveloperScreen = lazy(() =>
  import('@/features/developer').then((m) => ({
    default: m.DeveloperScreen,
  })),
);

export const Route = createFileRoute('/developer')({
  component: () => (
    <Suspense fallback={<RouteFallback />}>
      <DeveloperScreen />
    </Suspense>
  ),
});
