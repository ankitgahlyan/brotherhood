import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/ton';
import { WalletProvider } from './WalletContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>{children}</WalletProvider>
    </QueryClientProvider>
  );
}
