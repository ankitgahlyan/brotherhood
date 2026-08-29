import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CityNetworkScreen } from '@/features/city-network';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/city-network')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <CityNetworkScreen />
        </ProtectedRoute>
    ),
});
