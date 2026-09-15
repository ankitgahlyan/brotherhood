import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import { RouteFallback } from '@/core/components/shared/route-fallback';

const PersonalJettonScreen = lazy(() =>
  import('@/features/personal-jetton').then((m) => ({
    default: m.PersonalJettonScreen,
  })),
);

export const Route = createFileRoute('/personal-jetton')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Suspense fallback={<RouteFallback />}>
        <PersonalJettonScreen />
      </Suspense>
    </ProtectedRoute>
  ),
});
