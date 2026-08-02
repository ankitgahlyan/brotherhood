import { useState, useEffect, useCallback } from 'react';

type Page = 'create' | 'manage';

interface Route {
  page: Page;
  isTestnet: boolean;
  address: string | null;
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function normalizePath(pathname: string): string {
  if (basePath && basePath !== '/' && pathname.startsWith(basePath)) {
    const stripped = pathname.slice(basePath.length);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function parseRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get('p');
  const routeTarget = redirectPath
    ? new URL(redirectPath, 'https://example.com')
    : null;
  const path = normalizePath(routeTarget?.pathname ?? window.location.pathname);
  const routeParams = routeTarget?.searchParams ?? params;
  const isTestnet = routeParams.get('testnet') === 'true';
  const address = routeParams.get('address') || null;

  if (path === '/manage') return { page: 'manage', isTestnet, address };
  return { page: 'create', isTestnet, address: null };
}

function buildUrl(page: Page, testnet: boolean, address?: string | null) {
  const path = page === 'manage' ? '/manage' : '/create';
  const params = new URLSearchParams();
  if (testnet) params.set('testnet', 'true');
  if (page === 'manage' && address) params.set('address', address);
  const search = params.toString();
  const url = search ? `${path}?${search}` : path;

  return basePath && basePath !== '/' ? `${basePath}${url}` : url;
}

function push(url: string) {
  if (window.location.pathname + window.location.search !== url) {
    history.pushState(null, '', url);
    window.dispatchEvent(new Event('routechange'));
  }
}

function replace(url: string) {
  if (window.location.pathname + window.location.search !== url) {
    history.replaceState(null, '', url);
    window.dispatchEvent(new Event('routechange'));
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const update = () => setRoute(parseRoute());
    window.addEventListener('popstate', update);
    window.addEventListener('routechange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('routechange', update);
    };
  }, []);

  const go = useCallback(
    (page: Page) => {
      push(buildUrl(page, route.isTestnet));
    },
    [route.isTestnet],
  );

  const setTestnet = useCallback(
    (testnet: boolean) => {
      push(buildUrl(route.page, testnet, route.address));
    },
    [route.page, route.address],
  );

  const setAddress = useCallback(
    (address: string) => {
      replace(buildUrl('manage', route.isTestnet, address));
    },
    [route.isTestnet],
  );

  return {
    page: route.page,
    network: 'testnet' as 'mainnet' | 'testnet',
    // network: (route.isTestnet ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet',
    address: route.address,
    go,
    setTestnet,
    setAddress,
  };
}
