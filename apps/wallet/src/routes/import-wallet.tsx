import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ImportWalletScreen } from '@/features/wallet-setup';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/import-wallet')({
  component: () => (
    <ProtectedRoute>
      <ImportWalletScreen />
    </ProtectedRoute>
  ),
});
