import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Staking } from '@/features/staking';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/staking')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Staking />
    </ProtectedRoute>
  ),
});
