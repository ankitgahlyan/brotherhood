import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const SendTransaction = lazyRoute(() =>
  import('@/features/send').then((m) => ({
    default: m.SendTransaction,
  })),
);

export const Route = createFileRoute('/send')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <SendTransaction />
      </Suspense>
    </ProtectedRoute>
  ),
});
