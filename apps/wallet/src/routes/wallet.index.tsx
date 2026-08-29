import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { WalletDashboard } from '@/features/dashboard';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/wallet/')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <WalletDashboard />
        </ProtectedRoute>
    ),
});
