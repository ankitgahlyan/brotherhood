import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PersonalJettonScreen } from '@/features/personal-jetton';
import { ProtectedRoute } from '@/core/routing';

export const Route = createFileRoute('/personal-jetton')({
    component: () => (
        <ProtectedRoute requiresWallet>
            <PersonalJettonScreen />
        </ProtectedRoute>
    ),
});
