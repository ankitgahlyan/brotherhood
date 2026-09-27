/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { Address } from '@ton/core';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { TxButton } from '@/core/components/ui/tx-button';
import type { Network } from '@/lib/brotherhood/config';
import { useDnsTransaction, DNS_GAS } from '../hooks/use-dns-transaction';
import { useDnsStore } from '../store/dns-store';
import {
  buildWithdrawFeesBody,
  buildMintDomainForBody,
  deriveDnsItemAddress,
  broTierPrice,
  RESERVATION_PERIOD_SEC,
  BRO_COLLECTION_RESOLVER,
} from '../lib/dns-bodies';

interface AdminTabProps {
  network: Network;
  /** Unix timestamp of collection deployment */
  deploymentTime?: number;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Reservation period ended';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}d ${h}h remaining`;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  network,
  deploymentTime,
}) => {
  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();
  const { send, isSending, error } = useDnsTransaction(
    currentWallet,
    walletKit,
  );
  const addDomain = useDnsStore((s) => s.addDomain);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawRecipient, setWithdrawRecipient] = useState(address ?? '');

  // MintDomainFor state
  const [mintTarget, setMintTarget] = useState('');
  const [mintDomain, setMintDomain] = useState('');

  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const reservationEnd = deploymentTime
    ? deploymentTime + RESERVATION_PERIOD_SEC
    : null;
  const reservationSecsLeft = reservationEnd
    ? Math.max(0, reservationEnd - nowSec)
    : 0;
  const isInReservation = reservationSecsLeft > 0;

  const handleWithdraw = async () => {
    if (!address) return;
    let amountNano: bigint;
    try {
      amountNano = BigInt(Math.round(parseFloat(withdrawAmount) * 1e9));
    } catch {
      return;
    }
    const recipient = withdrawRecipient.trim() || address;
    const recipientAddr = Address.parse(recipient);
    const payload = buildWithdrawFeesBody(
      BigInt(Date.now()),
      amountNano,
      recipientAddr,
    );
    await send([
      {
        toAddress: BRO_COLLECTION_RESOLVER,
        amount: DNS_GAS.WITHDRAW,
        payload,
      },
    ]);
    setWithdrawAmount('');
  };

  const handleMintFor = async () => {
    if (!mintTarget.trim() || !mintDomain.trim()) return;
    const targetAddr = Address.parse(mintTarget.trim());
    const bare = mintDomain
      .trim()
      .toLowerCase()
      .replace(/\.bro$/, '');
    const price = broTierPrice(bare.length);
    const gasBuffer = DNS_GAS.REGISTER_GAS_BUFFER;

    const payload = buildMintDomainForBody(
      BigInt(Date.now()),
      targetAddr,
      bare,
    );
    await send([
      {
        toAddress: BRO_COLLECTION_RESOLVER,
        amount: price + gasBuffer,
        payload,
      },
    ]);

    // Optimistic store add (minted to targetAddr, not current wallet)
    addDomain(
      {
        name: bare,
        zone: 'bro',
        nftAddress: deriveDnsItemAddress(
          Address.parse(BRO_COLLECTION_RESOLVER),
          bare,
          network === 'testnet',
        ),
        registeredAt: nowSec,
        lastFillUpTime: nowSec,
      },
      network,
    );

    setMintDomain('');
    setMintTarget('');
  };

  return (
    <div className="space-y-4">
      {/* Reservation Status */}
      <div className="p-4 bg-card border border-border rounded-2xl space-y-2">
        <h3 className="font-semibold text-sm">Reservation Window</h3>
        <div
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl ${
            isInReservation
              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          <span>{isInReservation ? '🔒' : '✓'}</span>
          <span>
            {isInReservation
              ? formatCountdown(reservationSecsLeft)
              : 'Public registration open'}
          </span>
        </div>
        {deploymentTime && (
          <p className="text-xs text-muted-foreground">
            Collection deployed:{' '}
            {new Date(deploymentTime * 1000).toLocaleString()}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          During the first 30 days only treasury can register domains. After
          that, registration opens to all users.
        </p>
      </div>

      {/* Mint Domain For */}
      <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
        <h3 className="font-semibold text-sm">Mint Domain For</h3>
        <p className="text-xs text-muted-foreground">
          Register a .bro domain on behalf of any address (treasury-only).
        </p>
        <div className="space-y-2">
          <input
            type="text"
            value={mintDomain}
            onChange={(e) => setMintDomain(e.target.value)}
            placeholder="Domain name (e.g. brotherhood)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="admin-mint-domain-input"
          />
          <input
            type="text"
            value={mintTarget}
            onChange={(e) => setMintTarget(e.target.value)}
            placeholder="Target owner address (EQ…)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="admin-mint-target-input"
          />
          {mintDomain.trim() && (
            <p className="text-xs text-muted-foreground">
              Fee:{' '}
              <span className="font-medium text-foreground">
                {Number(
                  broTierPrice(mintDomain.trim().replace(/\.bro$/, '').length),
                ) / 1e9}{' '}
                TON
              </span>{' '}
              + 1 TON gas
            </p>
          )}
          <TxButton
            fullWidth
            disabled={!mintDomain.trim() || !mintTarget.trim() || isSending}
            loading={isSending}
            onAction={handleMintFor}
            actionLabel="Mint Domain For"
            completeLabel="Minted!"
          >
            Mint Domain For
          </TxButton>
        </div>
      </div>

      {/* Withdraw Fees */}
      <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
        <h3 className="font-semibold text-sm">Withdraw Collection Fees</h3>
        <p className="text-xs text-muted-foreground">
          Send collected registration fees from the collection contract to any
          address.
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount (TON)"
              min="0"
              step="0.1"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="admin-withdraw-amount-input"
            />
          </div>
          <input
            type="text"
            value={withdrawRecipient}
            onChange={(e) => setWithdrawRecipient(e.target.value)}
            placeholder={`Recipient (default: ${address ? address.slice(0, 8) + '…' : 'treasury'})`}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="admin-withdraw-recipient-input"
          />
          <TxButton
            fullWidth
            disabled={
              !withdrawAmount || parseFloat(withdrawAmount) <= 0 || isSending
            }
            loading={isSending}
            onAction={handleWithdraw}
            actionLabel="Withdraw Fees"
            completeLabel="Withdrawn!"
          >
            Withdraw
          </TxButton>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 px-1">{error}</p>}
    </div>
  );
};
