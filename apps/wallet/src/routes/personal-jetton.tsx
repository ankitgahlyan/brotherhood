import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/core/routing';
import {
  lazyRoute,
  RouteFallback,
} from '@/core/components/shared/route-fallback';

const PersonalJettonScreen = lazyRoute(() =>
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
