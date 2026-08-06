import '../lib/polyfills';

import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import Header from '../components/Header';
import { AppProviders } from '../providers/AppProviders';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '../lib/pwa';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('jm-theme');var mode=(stored==='light'||stored==='dark')?stored:'dark';var root=document.documentElement;root.setAttribute('data-theme',mode);}catch(e){}})();`;

// Must match the Vite `base`. vite-plugin-pwa emits these at the build root.
const base = (import.meta.env.VITE_BASE ?? '/brotherhood/').replace(
  /\/?$/,
  '/',
);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        name: 'theme-color',
        content: '#0b0e14',
      },
      {
        name: 'description',
        content:
          'BrotherHood — manage the FI Jetton: issue, transfer, burn, invite, vote and administer TEP-74 tokens on TON.',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        title: 'BrotherHood',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: `${base}manifest.webmanifest`,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${base}favicon.svg`,
      },
      {
        rel: 'apple-touch-icon',
        href: `${base}apple-touch-icon.png`,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function PwaRegister() {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (registered) return;
    setRegistered(true);
    void registerServiceWorker();
  }, [registered]);

  return null;
}

function NotFound() {
  return (
    <main className="flex-1 max-w-240 w-full mx-auto px-6 pt-9 pb-15 max-sm:px-4 max-sm:pt-6 max-sm:pb-12">
      <div className="rounded-2xl border p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          404
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          This URL doesn't match a route.
        </p>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-full bg-brand-gradient px-5 text-sm font-bold text-white"
        >
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(229,77,94,0.3)]">
        <AppProviders>
          <div className="min-h-full flex flex-col">
            <div className="grid-background" aria-hidden="true" />
            <Header />
            {children}
          </div>
        </AppProviders>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  );
}
