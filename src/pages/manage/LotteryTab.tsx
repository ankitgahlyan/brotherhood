import { useState } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { buildJoinLotteryBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { WalletRequired, type Network } from './common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusAlert } from '../DeployPage';
import { Dices, Trophy, Sparkles, AlertCircle, Ticket } from 'lucide-react';

export function LotteryTab({
  fiWalletState,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  fiWalletState: FiWalletStore | null;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess?: () => void;
}) {
  const { sendTransaction, loading, status } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  async function handleJoinLottery() {
    if (!ownerAddress) return;

    const body = buildJoinLotteryBody();
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.2'),
          payload: body,
        },
      ],
      successMessage: 'Entered lottery pool! 10 FI entry amount contributed.',
      fallbackError: 'Failed to enter lottery',
      onSuccess: () => {
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Dices className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">BrotherHood Lottery</h3>
                <p className="text-xs text-muted-foreground">
                  Decentralized cryptographic prize pool game
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono text-xs px-3 py-1">
              <Ticket className="size-3.5 mr-1 text-primary" />
              10 FI / Ticket
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Accounts pay a 10 FI entry to join the active lottery pool. Once the reveal
            deadline is reached, a winner is selected cryptographically through on-chain
            randomness and receives the entire accumulated prize pot.
          </p>

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="p-3.5 rounded-xl bg-secondary/60 border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Entry Fee
              </div>
              <div className="font-display text-xl font-bold mt-1 text-foreground">
                10 FI
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/60 border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Mechanism
              </div>
              <div className="font-display text-base font-bold mt-1 text-primary flex items-center gap-1.5">
                <Sparkles className="size-4" />
                Commit-Reveal PRNG
              </div>
            </div>
          </div>

          <Button
            variant="brand"
            className="w-full h-12 rounded-full font-bold text-sm uppercase tracking-wider"
            disabled={loading || (fiWalletState?.jettonBalance || 0n) < toNano('10')}
            onClick={handleJoinLottery}
          >
            {loading ? (
              <>
                <span className="spinner" /> Entering Pool...
              </>
            ) : (
              <>
                <Trophy className="size-4 mr-2" />
                Enter Lottery Pool (10 FI)
              </>
            )}
          </Button>

          {(fiWalletState?.jettonBalance || 0n) < toNano('10') && (
            <p className="text-xs text-warning flex items-center justify-center gap-1">
              <AlertCircle className="size-3.5 shrink-0" />
              Insufficient FI balance to join lottery (10 FI required).
            </p>
          )}
        </CardContent>
      </Card>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
