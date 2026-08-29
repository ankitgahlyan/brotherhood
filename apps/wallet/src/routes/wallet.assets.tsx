import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AssetsScreen } from '@/features/assets';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/wallet/assets')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <AssetsScreen />
    </ProtectedRoute>
  ),
});
