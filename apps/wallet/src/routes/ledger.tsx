import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LedgerScreen } from '@/features/ledger';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/ledger')({
  component: () => (
    <ProtectedRoute>
      <LedgerScreen />
    </ProtectedRoute>
  ),
});
