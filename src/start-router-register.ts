/* eslint-disable */
// TanStack Start router registration.
//
// tsr normally emits this augmentation into `routeTree.gen.ts` for Start
// projects, but this repo's router is created with `createTanStackRouter` in
// `src/router.tsx` (file-router, no `createStart`), so the generator does not
// emit it. Without it, TypeScript does not recognize the `server.handlers`
// route option used by `src/routes/api.chat.ts`. Mirrors the block TanStack
// generates for Start apps verbatim.
import type { createStart } from '@tanstack/react-start';
import type { getRouter } from './router';

declare module '@tanstack/react-start' {
  interface Register {
    ssr: true;
    router: Awaited<ReturnType<typeof getRouter>>;
  }
}
