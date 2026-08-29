import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { TonConnectRoute } from '@/features/ton-connect';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/ton-connect')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <TonConnectRoute />
    </ProtectedRoute>
  ),
});
