import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/core/components/shared/not-found';

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL || '/',
  defaultPreload: 'viewport',
  defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
