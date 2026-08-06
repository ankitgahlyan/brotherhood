import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

import './start-router-register';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { getContext } from './integrations/tanstack-query/root-provider';

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context,
    // Match the Vite `base`. TanStack Router treats `basepath` as the URL
    // prefix for every route/link. Keep it in sync with VITE_BASE
    // (default `/brotherhood/` for the GitHub Pages project site).
    basepath: import.meta.env.VITE_BASE ?? '/brotherhood/',
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
