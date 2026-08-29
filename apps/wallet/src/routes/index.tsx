import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useWalletStore, useWallet } from '@demo/wallet-core';

function IndexComponent() {
    const isPasswordSet = useWalletStore((state) => state.auth.isPasswordSet);
    const isUnlocked = useWalletStore((state) => state.auth.isUnlocked);
    const { hasWallet } = useWallet();

    if (!isPasswordSet) return <Navigate to="/welcome" replace />;
    if (!isUnlocked) return <Navigate to="/unlock" replace />;
    if (!hasWallet) return <Navigate to="/welcome" replace />;
    return <Navigate to="/wallet" replace />;
}

export const Route = createFileRoute('/')({
    component: IndexComponent,
});
