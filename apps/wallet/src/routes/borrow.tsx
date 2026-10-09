import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const BorrowScreen = lazyRoute(() =>
  import('@/features/borrow').then((m) => ({
    default: m.BorrowScreen,
  })),
);

export const Route = createFileRoute('/borrow')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <BorrowScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
