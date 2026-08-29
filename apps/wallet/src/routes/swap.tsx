import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Swap } from '@/features/swap';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/swap')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <Swap />
    </ProtectedRoute>
  ),
});
