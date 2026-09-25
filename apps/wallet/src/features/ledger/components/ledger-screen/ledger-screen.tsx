/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from '@/core/routing';
import { Minus, Plus } from 'lucide-react';
import { useAuth, useWallet, generateWalletName } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';

/** Dedicated screen for connecting a Ledger hardware wallet. */
export const LedgerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createLedgerWallet } = useTonWallet();
  const {
    ledgerAccountNumber,
    setLedgerAccountNumber,
    setUseWalletInterfaceType,
  } = useAuth();
  const { savedWallets } = useWallet();

  const defaultName = useMemo(
    () => generateWalletName(savedWallets, 'ledger'),
    [savedWallets],
  );

  const [walletName, setWalletName] = useState('');
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setIsLoading(true);
    try {
      setUseWalletInterfaceType('ledger');
      await createLedgerWallet(network, walletName.trim() || defaultName);
      navigate('/wallet', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <Button fullWidth onClick={handleConnect} disabled={isLoading}>
      {isLoading ? 'Connecting…' : 'Connect'}
    </Button>
  );

  return (
    <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
      <div className="px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Connect Ledger</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Connect your Ledger hardware wallet to continue.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <NetworkSelector value={network} onChange={setNetwork} compact />
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-medium text-foreground block">
              Wallet name
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={defaultName}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              data-testid="wallet-name-input"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Account</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setLedgerAccountNumber(
                    Math.max(0, (ledgerAccountNumber || 0) - 1),
                  )
                }
                disabled={(ledgerAccountNumber || 0) === 0}
                aria-label="Decrease account"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-base font-semibold tabular-nums text-foreground">
                {ledgerAccountNumber || 0}
              </span>
              <button
                type="button"
                onClick={() =>
                  setLedgerAccountNumber((ledgerAccountNumber || 0) + 1)
                }
                aria-label="Increase account"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-amber-500 mb-2">
            Before you continue:
          </h3>
          <ul className="text-sm text-amber-500/90 flex flex-col gap-1 list-disc pl-5">
            <li>Connect Ledger via USB</li>
            <li>Unlock it with your PIN</li>
            <li>Open the TON app</li>
          </ul>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </CenteredScreen>
  );
};
