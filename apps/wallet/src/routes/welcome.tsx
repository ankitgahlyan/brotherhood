import { createFileRoute } from '@tanstack/react-router';
import { WelcomeScreen } from '@/features/wallet-setup';

export const Route = createFileRoute('/welcome')({
    component: WelcomeScreen,
});
