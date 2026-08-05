import { useEffect, useState, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';

import { queryClient } from '../lib/ton';

const manifestUrl =
  'https://ankitgahlyan.github.io/brotherhood/tonconnect-manifest.json';
// 'https://ton-blockchain.github.io/acton/tonconnect-manifest.json';

const darkColors = {
  background: {
    primary: '#0B0E14',
    secondary: '#111520',
    segment: '#1C2230',
    tint: '#111520',
    qr: '#FFFFFF',
  },
  connectButton: { background: '#E54D5E', foreground: '#FFFFFF' },
};

const lightColors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F0F0F5',
    segment: '#FFFFFF',
    tint: '#F0F0F5',
    qr: '#F0F0F5',
  },
  connectButton: { background: '#E54D5E', foreground: '#FFFFFF' },
};

function readInitialTheme() {
  if (typeof window === 'undefined') return THEME.DARK;
  return localStorage.getItem('jm-theme') === 'light'
    ? THEME.LIGHT
    : THEME.DARK;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [initialTheme] = useState(readInitialTheme);

  useEffect(() => {
    const saved = localStorage.getItem('jm-theme');
    document.documentElement.setAttribute(
      'data-theme',
      saved === 'light' ? 'light' : 'dark',
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        uiPreferences={{
          theme: initialTheme,
          colorsSet: { [THEME.DARK]: darkColors, [THEME.LIGHT]: lightColors },
        }}
      >
        {children}
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
