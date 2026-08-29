import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LotteryScreen } from '@/features/lottery';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/lottery')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <LotteryScreen />
        </ProtectedRoute>
    ),
});
