import { createFileRoute } from '@tanstack/react-router';
import { UnlockScreen } from '@/features/auth';

export const Route = createFileRoute('/unlock')({
    component: UnlockScreen,
});
