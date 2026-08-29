import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SendTransaction } from '@/features/send';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/send')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <SendTransaction />
        </ProtectedRoute>
    ),
});
