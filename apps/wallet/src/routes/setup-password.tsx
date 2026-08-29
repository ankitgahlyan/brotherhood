import { createFileRoute } from '@tanstack/react-router';
import { SetupPasswordScreen } from '@/features/auth';

export const Route = createFileRoute('/setup-password')({
  component: SetupPasswordScreen,
});
