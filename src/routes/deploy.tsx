import { createFileRoute } from '@tanstack/react-router';
import { network } from '../lib/config';
import { DeployPage } from '../pages/DeployPage';

export const Route = createFileRoute('/deploy')({
  // Client-only page: rendering happens entirely in the browser (SPA).
  ssr: false,
  component: DeployRoute,
});

function DeployRoute() {
  return <DeployPage network={network} />;
}
