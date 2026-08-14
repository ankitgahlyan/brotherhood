import { useEffect, useState, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  TonConnectUIProvider,
  THEME,
  useTonConnectUI,
} from '@tonconnect/ui-react';

import { queryClient } from '../lib/ton';
import { themeStore, useTheme, type Theme } from '../lib/theme';

const manifestUrl =
  'https://ankitgahlyan.github.io/brotherhood/tonconnect-manifest.json';

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
  return themeStore.state === 'light' ? THEME.LIGHT : THEME.DARK;
}

function TonConnectThemeSync() {
  const theme: Theme = useTheme();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    // The `uiOptions` property is a public setter (not plain data): assigning
    // it invokes TonConnect's internal merge + notify path and must be called
    // for the theme to be applied. React Compiler forbids raw writes to
    // hook-returned objects, so scope the intentional setter call here.
    // eslint-disable-next-line react-compiler/react-compiler
    tonConnectUI.uiOptions = {
      uiPreferences: {
        theme: theme === 'light' ? THEME.LIGHT : THEME.DARK,
      },
      analytics: { mode: 'off' },
      actionsConfiguration: {
        twaReturnUrl: 'https://t.me/fossfiBot',
      },
    };
  }, [theme, tonConnectUI]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [initialTheme] = useState(readInitialTheme);

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        uiPreferences={{
          theme: initialTheme,
          colorsSet: { [THEME.DARK]: darkColors, [THEME.LIGHT]: lightColors },
        }}
      >
        <TonConnectThemeSync />
        {children}
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
