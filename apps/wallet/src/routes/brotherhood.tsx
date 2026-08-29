import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BrotherhoodScreen } from '@/features/brotherhood';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/brotherhood')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <BrotherhoodScreen />
    </ProtectedRoute>
  ),
});
