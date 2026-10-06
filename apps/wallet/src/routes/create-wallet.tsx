import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  RouteFallback,
  lazyRoute,
} from '@/core/components/shared/route-fallback';

const CreateWalletScreen = lazyRoute(() =>
  import('@/features/wallet-setup').then((m) => ({
    default: m.CreateWalletScreen,
  })),
);

export const Route = createFileRoute('/create-wallet')({
  component: () => (
    <ProtectedRoute>
      <Suspense fallback={<RouteFallback />}>
        <CreateWalletScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
