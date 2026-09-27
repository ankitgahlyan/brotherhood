import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const DnsScreen = lazy(() =>
  import('@/features/dns').then((m) => ({
    default: m.DnsScreen,
  })),
);

export const Route = createFileRoute('/dns')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <DnsScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
