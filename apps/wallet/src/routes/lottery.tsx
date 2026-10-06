import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const LotteryScreen = lazyRoute(() =>
  import('@/features/lottery').then((m) => ({
    default: m.LotteryScreen,
  })),
);

export const Route = createFileRoute('/lottery')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <LotteryScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
