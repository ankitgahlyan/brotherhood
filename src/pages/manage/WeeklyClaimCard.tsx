import { useState, useEffect } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { buildClaimWeeklyGrantBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import type { Network } from './common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusAlert } from '../DeployPage';

const ACTIVATION_WAIT = 604800; // 7 days in seconds
const MAX_CLAIM_PERIOD = 63072000; // 2 years in seconds

export function WeeklyClaimCard({
  fiWalletState,
  ownerAddress,
  network,
  tonConnectUI,
  onSuccess,
}: {
  fiWalletState: FiWalletStore | null;
  ownerAddress: Address | null;
  network: Network;
  tonConnectUI: TonConnectUI;
  onSuccess?: () => void;
}) {
  const { sendTransaction, loading, status } = useSendFiTransaction(
    tonConnectUI,
    network,
  );
  const [now, setNow] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!ownerAddress || !fiWalletState) return null;

  const timestamps = fiWalletState.timestamps?.ref;
  const accountInit = timestamps ? Number(timestamps.accountInit) : 0;
  const lastClaim = timestamps ? Number(timestamps.lastClaim) : 0;

  // Claim rules per contract:
  // 1. now > accountInit + ACTIVATION_WAIT (account must be older than 1 week)
  // 2. now < accountInit + MAX_CLAIM_PERIOD (within 2 years from init)
  // 3. now > lastClaim + ACTIVATION_WAIT (at least 1 week since last claim)
  const isPastActivation =
    accountInit > 0 && now > accountInit + ACTIVATION_WAIT;
  const isWithinMaxPeriod =
    accountInit === 0 || now < accountInit + MAX_CLAIM_PERIOD;
  const isCooledDown = lastClaim === 0 || now > lastClaim + ACTIVATION_WAIT;

  const isEligible =
    fiWalletState.active &&
    isPastActivation &&
    isWithinMaxPeriod &&
    isCooledDown;

  let nextClaimTime = 0;
  if (!isPastActivation && accountInit > 0) {
    nextClaimTime = accountInit + ACTIVATION_WAIT;
  } else if (!isCooledDown && lastClaim > 0) {
    nextClaimTime = lastClaim + ACTIVATION_WAIT;
  }

  const secondsRemaining = Math.max(0, nextClaimTime - now);

  function formatTimeRemaining(totalSec: number): string {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

  async function handleClaim() {
    if (!ownerAddress) return;
    const body = buildClaimWeeklyGrantBody({
      sendExcessesTo: ownerAddress,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.2'),
          payload: body,
        },
      ],
      successMessage: 'Weekly grant of 11,111 FI claimed successfully!',
      fallbackError: 'Failed to claim weekly grant',
      onSuccess: () => {
        if (onSuccess) {
          setTimeout(onSuccess, 4000);
        }
      },
    });
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Gift className="size-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold">
                Weekly Claim
              </div>
              <div className="text-xs text-muted-foreground">
                11,111 FI recurring grant
              </div>
            </div>
          </div>
          {isEligible ? (
            <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/20">
              <CheckCircle2 className="size-3 mr-1" />
              Available
            </Badge>
          ) : !isWithinMaxPeriod ? (
            <Badge variant="outline" className="text-muted-foreground">
              Period Ended
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 font-mono text-[11px]">
              <Clock className="size-3" />
              {formatTimeRemaining(secondsRemaining)}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Members are endowed with 11,111 FI every week for 2 years as
          trust-based community issuance.
        </p>

        {!isPastActivation && accountInit > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
            <span>
              New accounts must wait 7 days after onboarding before claiming
              their first weekly grant.
            </span>
          </div>
        )}

        <Button
          variant="brand"
          className="w-full h-10 font-bold text-xs uppercase tracking-wider"
          disabled={!isEligible || loading}
          onClick={handleClaim}
        >
          {loading ? (
            <>
              <span className="spinner" /> Claiming...
            </>
          ) : isEligible ? (
            <>
              <Gift className="size-4 mr-1.5" />
              Claim 11,111 FI
            </>
          ) : (
            `Next Claim in ${formatTimeRemaining(secondsRemaining)}`
          )}
        </Button>

        {status && <StatusAlert type={status.type} message={status.message} />}
      </CardContent>
    </Card>
  );
}
