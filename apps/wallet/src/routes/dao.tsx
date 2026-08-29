import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DaoScreen } from '@/features/dao';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/dao')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <DaoScreen />
        </ProtectedRoute>
    ),
});
