import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const WelcomeScreen = lazy(() =>
  import('@/features/wallet-setup').then((m) => ({
    default: m.WelcomeScreen,
  })),
);

export const Route = createFileRoute('/welcome')({
  component: () => (
    <Suspense fallback={<RouteFallback />}>
      <WelcomeScreen />
    </Suspense>
  ),
});
