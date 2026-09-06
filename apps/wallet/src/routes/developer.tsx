import { createFileRoute } from '@tanstack/react-router';
import { DeveloperScreen } from '@/features/developer';

export const Route = createFileRoute('/developer')({
  component: DeveloperScreen,
});
