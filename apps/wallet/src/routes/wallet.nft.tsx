import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { NftsScreen } from '@/features/nft';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/wallet/nft')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <NftsScreen />
        </ProtectedRoute>
    ),
});
