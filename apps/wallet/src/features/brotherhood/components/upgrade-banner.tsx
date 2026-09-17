/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { useFormatAddress } from '@/core/utils/formatters';
import { Button } from '@/core/components/ui/button';
import { useFiMinterState } from '@/lib/brotherhood/queries';
import { useFiAccount } from '../hooks/use-fi-account';
import { useRequestUpgrade } from '../hooks/use-request-upgrade';

export const UpgradeBanner: React.FC = () => {
  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();
  const { network } = useFormatAddress();
  const account = useFiAccount(address ?? null);
  const minter = useFiMinterState();
  const minterVersion = minter.data ? Number(minter.data.walletVersion) : null;

  const upgrade = useRequestUpgrade({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
    minterVersion,
  });

  if (!upgrade.hasUpgradeAvailable) return null;

  return (
    <div
      className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-700 dark:text-amber-400 flex justify-between items-center gap-3 shadow-xs"
      data-testid="main-upgrade-banner"
    >
      <div>
        <span className="font-semibold flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500/30" />
          <span>Contract Upgrade Available</span>
        </span>
        <span className="text-[11px] text-muted-foreground block mt-0.5">
          Your wallet is on{' '}
          <span className="font-semibold text-foreground">
            v{upgrade.walletVersion}
          </span>
          . Latest version is{' '}
          <span className="font-semibold text-foreground">
            v{upgrade.minterVersion}
          </span>
          .
        </span>
      </div>
      <Button
        size="sm"
        variant="primary"
        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
        onClick={() => upgrade.send()}
        disabled={upgrade.isDisabled}
        loading={upgrade.isSending}
        data-testid="main-upgrade-submit"
      >
        Upgrade to v{upgrade.minterVersion}
      </Button>
    </div>
  );
};
