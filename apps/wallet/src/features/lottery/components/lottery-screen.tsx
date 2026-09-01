/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  MemberGuard,
  ActivationBanner,
  useIsNetworkMember,
} from '@/features/brotherhood';

import { useLotteryState } from '../hooks/use-lottery-state';
import { useEnterLottery } from '../hooks/use-enter-lottery';
import { useDrawWinner } from '../hooks/use-draw-winner';

export const LotteryScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address } = useWallet();
  const { network } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const [lotteryAddressInput, setLotteryAddressInput] = useState('');

  const state = useLotteryState(lotteryAddressInput, address ?? null);
  const enterLottery = useEnterLottery({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    lotteryAddress: lotteryAddressInput,
  });
  const drawWinner = useDrawWinner({
    wallet: currentWallet,
    walletKit,
    lotteryAddress: lotteryAddressInput,
  });

  return (
    <MemberGuard title="On-Chain Lottery">
      <NewLayout
        header={
          <ScreenHeader
            title="On-Chain Lottery"
            onBack={() => navigate('/wallet')}
          />
        }
      >
        <div className="space-y-4">
          <ActivationBanner />

          {/* Contract Input */}
          <div className="bg-card text-card-foreground p-3 border border-border rounded-2xl shadow-sm text-xs space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-foreground">
                Lottery Contract Address
              </label>
              {lotteryAddressInput && (
                <CopyButton
                  address={lotteryAddressInput}
                  type="contract"
                  size="xs"
                />
              )}
            </div>
            <InputScan
              value={lotteryAddressInput}
              onChange={setLotteryAddressInput}
              placeholder={`Lottery Contract Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
              data-testid="lottery-address-input"
            />
          </div>

          {/* Dashboard / State Card */}
          <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base">Prize Pool & Phase</h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => state.refetch()}
              >
                Refresh
              </Button>
            </div>

            {state.isLoading ? (
              <p className="text-xs text-muted-foreground">
                Querying lottery contract state…
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                  <span className="text-muted-foreground block">
                    Prize Pool
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    {state.prizePool !== null
                      ? (Number(state.prizePool) / 1e9).toFixed(2)
                      : '0.00'}{' '}
                    TON
                  </span>
                </div>
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                  <span className="text-muted-foreground block">
                    Participants
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    {state.participantCount ?? 0}
                  </span>
                </div>
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                  <span className="text-muted-foreground block">
                    Current Phase
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    {state.currentPhase ?? 0}
                  </span>
                </div>
                <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl">
                  <span className="text-muted-foreground block">
                    Your Entry Status
                  </span>
                  <span
                    className={`font-semibold text-xs ${state.isParticipant ? 'text-emerald-500' : 'text-muted-foreground'}`}
                  >
                    {state.isParticipant ? 'Entered' : 'Not Entered'}
                  </span>
                </div>
              </div>
            )}

            {/* Entry Action */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={() => enterLottery.enter()}
                disabled={
                  !canOperate || enterLottery.isDisabled || state.isParticipant
                }
                loading={enterLottery.isSending}
                fullWidth
                data-testid="lottery-enter-button"
              >
                {state.isParticipant ? 'Already Entered' : 'Enter Lottery Pool'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => drawWinner.draw()}
                disabled={!canOperate || drawWinner.isDisabled}
                loading={drawWinner.isSending}
                fullWidth
                data-testid="lottery-draw-button"
              >
                Draw Winner (Authorized)
              </Button>
            </div>
          </div>
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
