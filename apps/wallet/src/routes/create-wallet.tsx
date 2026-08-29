import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CreateWalletScreen } from '@/features/wallet-setup';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/create-wallet')({
    component: () => (
        <ProtectedRoute>
            <CreateWalletScreen />
        </ProtectedRoute>
    ),
});
