import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const WelcomeScreen = lazyRoute(() =>
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
