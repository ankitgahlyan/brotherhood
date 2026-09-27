/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from 'react';
import { Address, toNano } from '@ton/core';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { TxButton } from '@/core/components/ui/tx-button';
import { CopyButton } from '@/core/components/ui/copy-button';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import type { Network } from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import {
  useMyDomains,
  isDomainExpired,
  domainExpirySeconds,
  domainAuctionSecondsLeft,
} from '../hooks/use-my-domains';
import { useDnsTransaction, DNS_GAS } from '../hooks/use-dns-transaction';
import {
  buildFillUpBody,
  buildChangeDnsRecordBody,
  buildWalletDnsRecordCell,
  buildDnsRenewRequestBody,
  buildFinalizeAuctionBody,
  walletDnsKey,
  broRenewalFee,
  broFiRenewalFee,
} from '../lib/dns-bodies';

interface MyDomainsTabProps {
  network: Network;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const days = Math.floor(seconds / 86400);
  if (days >= 365) return `${Math.floor(days / 365)}y ${days % 365}d`;
  if (days >= 30) return `${Math.floor(days / 30)}mo`;
  return `${days}d`;
}

function formatNano(nano: bigint): string {
  const ton = Number(nano) / 1e9;
  return ton % 1 === 0 ? `${ton} TON` : `${ton.toFixed(2)} TON`;
}

function formatFi(nano: bigint): string {
  const fi = Number(nano) / 1e9;
  return fi % 1 === 0
    ? `${fi.toLocaleString()} FI`
    : `${fi.toLocaleString(undefined, { maximumFractionDigits: 2 })} FI`;
}

export const MyDomainsTab: React.FC<MyDomainsTabProps> = ({ network }) => {
  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();

  const { domains, isRefreshing } = useMyDomains(network, address);
  const { send, isSending, error } = useDnsTransaction(
    currentWallet,
    walletKit,
  );

  // Per-domain DNS record edit state
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [recordValue, setRecordValue] = useState('');
  const [sendingFor, setSendingFor] = useState<string | null>(null);

  const handleRenew = useCallback(
    async (nftAddress: string, charCount: number) => {
      setSendingFor(nftAddress);
      try {
        const fee = broRenewalFee(charCount);
        const amount = fee + DNS_GAS.FILLUP_GAS_BUFFER;
        const payload = buildFillUpBody(BigInt(Date.now()));
        await send([{ toAddress: nftAddress, amount, payload }]);
      } finally {
        setSendingFor(null);
      }
    },
    [send],
  );

  const handleRenewFi = useCallback(
    async (nftAddress: string, charCount: number) => {
      if (!address) return;
      setSendingFor(nftAddress);
      try {
        const fee = broFiRenewalFee(charCount);
        const fiWalletAddress = getFiWalletAddress(
          Address.parse(address),
          network,
        );
        const payload = buildDnsRenewRequestBody(
          BigInt(Date.now()),
          Address.parse(nftAddress),
          fee,
        );
        await send([
          {
            toAddress: fiWalletAddress.toString(),
            amount: toNano('0.15'),
            payload,
          },
        ]);
      } finally {
        setSendingFor(null);
      }
    },
    [address, network, send],
  );

  const handleSetRecord = useCallback(
    async (nftAddress: string) => {
      if (!recordValue.trim()) return;
      setSendingFor(nftAddress);
      try {
        const walletAddr = Address.parse(recordValue.trim());
        const valueCell = buildWalletDnsRecordCell(walletAddr);
        const key = walletDnsKey();
        const payload = buildChangeDnsRecordBody(key, valueCell);
        await send([
          {
            toAddress: nftAddress,
            amount: DNS_GAS.CHANGE_RECORD,
            payload,
          },
        ]);
        setEditingRecord(null);
        setRecordValue('');
      } catch (e: unknown) {
        // validation error — keep form open
        console.warn('[MyDomainsTab] set record error:', e);
      } finally {
        setSendingFor(null);
      }
    },
    [recordValue, send],
  );

  const handleFinalizeAuction = useCallback(
    async (nftAddress: string) => {
      setSendingFor(nftAddress);
      try {
        const payload = buildFinalizeAuctionBody(BigInt(Date.now()));
        await send([
          {
            toAddress: nftAddress,
            amount: toNano('0.5'),
            payload,
          },
        ]);
      } finally {
        setSendingFor(null);
      }
    },
    [send],
  );

  const handleClearRecord = useCallback(
    async (nftAddress: string) => {
      setSendingFor(nftAddress);
      try {
        const key = walletDnsKey();
        const payload = buildChangeDnsRecordBody(key, null);
        await send([
          {
            toAddress: nftAddress,
            amount: DNS_GAS.CHANGE_RECORD,
            payload,
          },
        ]);
      } finally {
        setSendingFor(null);
      }
    },
    [send],
  );

  if (domains.length === 0) {
    return (
      <div className="p-6 text-center bg-card border border-border rounded-2xl">
        <p className="text-4xl mb-3">🌐</p>
        <p className="font-semibold text-sm">No domains yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Search for a domain in the Explore tab to register your first{' '}
          <strong>.bro</strong> handle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">My Domains</h3>
        <RefreshButton
          onRefresh={() => {
            /* refresh triggered by useMyDomains via interval */
          }}
          testId="my-domains-refresh"
        />
      </div>

      {isRefreshing && (
        <p className="text-xs text-muted-foreground">
          Refreshing on-chain state…
        </p>
      )}

      {domains.map((domain) => {
        const expired = isDomainExpired(domain);
        const secondsLeft = domainExpirySeconds(domain);
        const auctionSecondsLeft = domainAuctionSecondsLeft(domain);
        const isThisSending = sendingFor === domain.nftAddress || isSending;
        const charCount = domain.name.length;
        const renewalFee = broRenewalFee(charCount);
        const isEditing = editingRecord === domain.nftAddress;

        return (
          <div
            key={domain.nftAddress}
            className="p-4 bg-card border border-border rounded-2xl space-y-3"
          >
            {/* Domain header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-base truncate">
                  {domain.name}.{domain.zone}
                </span>
                {domain.isOutdated && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    Transferred
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  domain.isAuctionActive
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : domain.isAuctionEnded && !domain.hasOwner
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : expired
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : secondsLeft < 30 * 86400
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {domain.isAuctionActive
                  ? `Auction Active (${formatDuration(auctionSecondsLeft)})`
                  : domain.isAuctionEnded && !domain.hasOwner
                    ? 'Auction Ended'
                    : expired
                      ? 'Expired'
                      : `Expires in ${formatDuration(secondsLeft)}`}
              </span>
            </div>

            {/* NFT address */}
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>NFT contract</span>
              <div className="flex items-center gap-1">
                <span className="font-mono">
                  {domain.nftAddress.slice(0, 6)}…{domain.nftAddress.slice(-4)}
                </span>
                <CopyButton address={domain.nftAddress} />
              </div>
            </div>

            {/* Current DNS wallet record */}
            {domain.walletRecord && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>DNS wallet</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">
                    {domain.walletRecord.slice(0, 6)}…
                    {domain.walletRecord.slice(-4)}
                  </span>
                  <CopyButton address={domain.walletRecord} />
                </div>
              </div>
            )}

            {/* Actions */}
            {!domain.isOutdated && (
              <>
                {domain.isAuctionActive && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-medium">Active 7-Day Auction</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      This domain is in its initial auction period. Once the
                      auction ends and is finalized, domain ownership is granted
                      and you can link wallet records.
                    </p>
                  </div>
                )}

                {domain.isAuctionEnded && !domain.hasOwner && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400">
                      <p className="font-medium">Auction Completed!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        The 7-day bidding window has closed. Finalize the
                        auction to assign domain ownership to the winner and
                        burn the winning FI bid.
                      </p>
                    </div>
                    <TxButton
                      size="sm"
                      className="w-full"
                      disabled={isThisSending}
                      loading={
                        isThisSending && sendingFor === domain.nftAddress
                      }
                      onAction={() => handleFinalizeAuction(domain.nftAddress)}
                      actionLabel="Finalize Domain (0.5 TON)"
                      completeLabel="Finalized!"
                    >
                      Finalize Domain
                    </TxButton>
                  </div>
                )}

                {!domain.isAuctionActive &&
                  (domain.hasOwner || !domain.isAuctionEnded) && (
                    <div className="flex gap-2">
                      <TxButton
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        disabled={isThisSending}
                        loading={
                          isThisSending && sendingFor === domain.nftAddress
                        }
                        onAction={() =>
                          domain.zone === 'bro'
                            ? handleRenewFi(domain.nftAddress, charCount)
                            : handleRenew(domain.nftAddress, charCount)
                        }
                        actionLabel={
                          domain.zone === 'bro'
                            ? `Renew (${formatFi(broFiRenewalFee(charCount))}/yr)`
                            : `Renew (${formatNano(renewalFee)}/yr)`
                        }
                        completeLabel="Renewed!"
                      >
                        Renew
                      </TxButton>
                      <TxButton
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        disabled={isThisSending}
                        onAction={() => {
                          setEditingRecord(
                            isEditing ? null : domain.nftAddress,
                          );
                          setRecordValue(domain.walletRecord ?? '');
                        }}
                        actionLabel="Set DNS Record"
                      >
                        {isEditing ? 'Cancel' : 'Set DNS Record'}
                      </TxButton>
                    </div>
                  )}
              </>
            )}

            {/* DNS record form */}
            {isEditing && (
              <div className="space-y-2 pt-1 border-t border-border/60">
                <p className="text-xs text-muted-foreground font-medium">
                  Set wallet address DNS record
                </p>
                <input
                  type="text"
                  value={recordValue}
                  onChange={(e) => setRecordValue(e.target.value)}
                  placeholder="Wallet address (EQ…)"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  data-testid={`dns-record-input-${domain.nftAddress}`}
                />
                <div className="flex gap-2">
                  <TxButton
                    size="sm"
                    className="flex-1"
                    disabled={!recordValue.trim() || isThisSending}
                    loading={isThisSending}
                    onAction={() => handleSetRecord(domain.nftAddress)}
                    actionLabel="Save DNS Record"
                    completeLabel="Saved!"
                  >
                    Save
                  </TxButton>
                  {domain.walletRecord && (
                    <TxButton
                      size="sm"
                      variant="danger"
                      disabled={isThisSending}
                      onAction={() => handleClearRecord(domain.nftAddress)}
                      actionLabel="Clear DNS Record"
                    >
                      Clear
                    </TxButton>
                  )}
                </div>
              </div>
            )}

            {error && sendingFor === domain.nftAddress && (
              <p className="text-xs text-rose-500">{error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
