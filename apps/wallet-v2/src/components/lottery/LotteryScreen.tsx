import React, { memo, useState, useMemo, useCallback, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import { Address, fromNano } from '@ton/core';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { fetchLotteryState, LotteryStateData } from '../../lib/brotherhood/lottery';
import { buildEnterLotteryMessage, buildDrawLotteryWinnerMessage } from '../../lib/brotherhood/messages';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';

import styles from './LotteryScreen.module.scss';

interface StateProps {
  currentAddress?: string;
  isTestnet?: boolean;
}

function formatTon(nano?: bigint | null): string {
  if (nano === undefined || nano === null) return '0.00';
  return Number(fromNano(nano)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function LotteryScreen({ currentAddress, isTestnet }: StateProps) {
  const [lotteryAddressInput, setLotteryAddressInput] = useState<string>('');
  const [ticketAmount, setTicketAmount] = useState<string>('1.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [lotteryState, setLotteryState] = useState<LotteryStateData | null>(null);

  const loadLottery = useCallback(async () => {
    if (!lotteryAddressInput) return;
    setLoading(true);
    try {
      const data = await fetchLotteryState(
        lotteryAddressInput,
        currentAddress,
        isTestnet ? 'testnet' : 'mainnet',
      );
      setLotteryState(data);
    } catch {
      setLotteryState(null);
    } finally {
      setLoading(false);
    }
  }, [lotteryAddressInput, currentAddress, isTestnet]);

  useEffect(() => {
    if (lotteryAddressInput) {
      loadLottery();
    }
  }, [lotteryAddressInput, loadLottery]);

  const handleBuyTicket = useCallback(() => {
    if (!currentAddress || !lotteryAddressInput) return;
    try {
      const lotteryAddr = Address.parse(lotteryAddressInput);
      const senderAddr = Address.parse(currentAddress);

      const msg = buildEnterLotteryMessage({
        lotteryAddress: lotteryAddr,
        senderAddress: senderAddr,
        ticketPriceTon: ticketAmount || '1.0',
      });

      openFiTransactionModal(msg);
    } catch (err) {
      console.error('Failed to buy lottery ticket', err);
    }
  }, [currentAddress, lotteryAddressInput, ticketAmount]);

  const handleDrawWinner = useCallback(() => {
    if (!lotteryAddressInput) return;
    try {
      const lotteryAddr = Address.parse(lotteryAddressInput);
      const msg = buildDrawLotteryWinnerMessage({
        lotteryAddress: lotteryAddr,
      });

      openFiTransactionModal(msg);
    } catch (err) {
      console.error('Failed to draw winner', err);
    }
  }, [lotteryAddressInput]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lottery Pool</h1>
        <span className={styles.badge}>Fair & Random</span>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Lottery Contract Address</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter Lottery contract address..."
            value={lotteryAddressInput}
            onChange={(e) => setLotteryAddressInput((e.target as HTMLInputElement).value.trim())}
          />
        </div>
        <Button isPrimary onClick={loadLottery} disabled={!lotteryAddressInput || loading}>
          {loading ? 'Fetching Pool...' : 'Load Lottery'}
        </Button>
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <Spinner />
        </div>
      ) : lotteryState ? (
        <>
          <div className={styles.card}>
            <div className={styles.prizeBox}>
              <span className={styles.prizeLabel}>Prize Pool</span>
              <span className={styles.prizeAmount}>{formatTon(lotteryState.prizePool)} TON</span>
            </div>

            <div className={styles.gridStats}>
              <div className={styles.statBox}>
                <span className={styles.label}>Participants</span>
                <span className={styles.statValue}>{lotteryState.participantCount ?? 0}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.label}>Current Phase</span>
                <span className={styles.statValue}>
                  {lotteryState.currentPhase === 0 ? 'Open' : lotteryState.currentPhase === 1 ? 'Drawing' : 'Completed'}
                </span>
              </div>
            </div>

            <div className={styles.row} style={{ marginTop: '0.5rem' }}>
              <span className={styles.label}>Your Ticket Status</span>
              <span className={styles.value} style={{ color: lotteryState.isParticipant ? '#10b981' : 'var(--color-text-secondary)' }}>
                {lotteryState.isParticipant ? '✓ Ticket Entered' : 'Not Participating'}
              </span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Draw Deadline</span>
              <span className={styles.value}>
                {lotteryState.deadline ? new Date(lotteryState.deadline * 1000).toLocaleString() : 'Open'}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Enter Lottery</h2>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Entry Amount (TON)</label>
              <input
                type="number"
                step="0.1"
                className={styles.input}
                value={ticketAmount}
                onChange={(e) => setTicketAmount((e.target as HTMLInputElement).value)}
                placeholder="1.0"
              />
            </div>

            <div className={styles.actions}>
              <Button
                isPrimary
                onClick={handleBuyTicket}
                disabled={!currentAddress || !lotteryAddressInput}
                style={{ flex: 1 }}
              >
                Buy Ticket ({ticketAmount || '1.0'} TON)
              </Button>
              <Button
                isDestructive
                onClick={handleDrawWinner}
                disabled={!lotteryAddressInput}
                style={{ flex: 1 }}
              >
                Trigger Draw
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <p>No active lottery loaded.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Enter a Brotherhood Lottery contract address above to view the prize pool and buy tickets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(
  withGlobal((global: GlobalState): StateProps => {
    const account = selectCurrentAccount(global);
    return {
      currentAddress: account?.address,
      isTestnet: global.settings.isTestnet,
    };
  })(LotteryScreen),
);
