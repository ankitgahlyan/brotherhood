import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const SendTransaction = lazy(() =>
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
