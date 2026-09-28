import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/core/components/shared/not-found';

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL || '/',
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
});

if (typeof window !== 'undefined') {
  (window as any).router = router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
