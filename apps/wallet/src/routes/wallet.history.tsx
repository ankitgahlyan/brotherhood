import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { HistoryScreen } from '@/features/transactions';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/wallet/history')({
  component: () => (
    <ProtectedRoute requiresWallet>
      <HistoryScreen />
    </ProtectedRoute>
  ),
});
