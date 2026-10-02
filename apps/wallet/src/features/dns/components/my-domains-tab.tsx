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
import {
  clearDomainResolutionCache,
  detectSocialPlatform,
} from '@/core/lib/dns';
import type { Network } from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import {
  useMyDomains,
  isDomainExpired,
  domainExpirySeconds,
  domainAuctionSecondsLeft,
} from '../hooks/use-my-domains';
import { clearDomainLookupCache } from '../hooks/use-domain-lookup';
import { useDnsTransaction, DNS_GAS } from '../hooks/use-dns-transaction';
import { useDnsStore } from '../store/dns-store';
import {
  buildChangeDnsRecordBody,
  buildWalletDnsRecordCell,
  buildTextDnsRecordCell,
  buildDnsRenewRequestBody,
  buildFinalizeAuctionBody,
  buildDestroyContractBody,
  walletDnsKey,
  contactUriDnsKey,
  channelDescriptionDnsKey,
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
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m ${seconds % 60}s`;
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

  const { domains, isRefreshing, refresh } = useMyDomains(network, address);
  const updateDomain = useDnsStore((s) => s.updateDomain);
  const removeDomain = useDnsStore((s) => s.removeDomain);
  const { send, isSending, error } = useDnsTransaction(
    currentWallet,
    walletKit,
  );

  // Per-domain inline DNS record draft values (empty by default; existing on-chain values shown as placeholders)
  const [recordDrafts, setRecordDrafts] = useState<Record<string, string>>({});
  const [contactDrafts, setContactDrafts] = useState<Record<string, string>>(
    {},
  );
  const [channelDrafts, setChannelDrafts] = useState<Record<string, string>>(
    {},
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [sendingFor, setSendingFor] = useState<string | null>(null);

  const schedulePostTxRefresh = useCallback(() => {
    void refresh();
    setTimeout(() => {
      void refresh();
    }, 4500);
  }, [refresh]);

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
        updateDomain(
          nftAddress,
          { lastFillUpTime: Math.floor(Date.now() / 1000) },
          network,
        );
        clearDomainResolutionCache();
        clearDomainLookupCache();
        schedulePostTxRefresh();
      } finally {
        setSendingFor(null);
      }
    },
    [address, network, schedulePostTxRefresh, send, updateDomain],
  );

  const handleSaveChanges = useCallback(
    async (nftAddress: string) => {
      const walletInput = (recordDrafts[nftAddress] ?? '').trim();
      const contactInput = (contactDrafts[nftAddress] ?? '').trim();
      const channelInput = (channelDrafts[nftAddress] ?? '').trim();

      if (!walletInput && !contactInput && !channelInput) return;

      const messages: {
        toAddress: string;
        amount: bigint;
        payload: ReturnType<typeof buildChangeDnsRecordBody>;
      }[] = [];
      const optimisticPatch: {
        walletRecord?: string;
        contactLink?: string;
        channelLink?: string;
      } = {};

      if (walletInput) {
        let parsedWallet: Address;
        try {
          parsedWallet = Address.parse(walletInput);
        } catch {
          setValidationErrors((prev) => ({
            ...prev,
            [nftAddress]: 'Invalid TON wallet address',
          }));
          return;
        }
        const normalizedAddr = parsedWallet.toString({
          bounceable: false,
          testOnly: network === 'testnet',
        });
        const valueCell = buildWalletDnsRecordCell(parsedWallet);
        messages.push({
          toAddress: nftAddress,
          amount: DNS_GAS.CHANGE_RECORD,
          payload: buildChangeDnsRecordBody(walletDnsKey(), valueCell),
        });
        optimisticPatch.walletRecord = normalizedAddr;
      }

      if (contactInput) {
        const valueCell = buildTextDnsRecordCell(contactInput);
        messages.push({
          toAddress: nftAddress,
          amount: DNS_GAS.CHANGE_RECORD,
          payload: buildChangeDnsRecordBody(contactUriDnsKey(), valueCell),
        });
        optimisticPatch.contactLink = contactInput;
      }

      if (channelInput) {
        const valueCell = buildTextDnsRecordCell(channelInput);
        messages.push({
          toAddress: nftAddress,
          amount: DNS_GAS.CHANGE_RECORD,
          payload: buildChangeDnsRecordBody(
            channelDescriptionDnsKey(),
            valueCell,
          ),
        });
        optimisticPatch.channelLink = channelInput;
      }

      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[nftAddress];
        return next;
      });
      setSendingFor(nftAddress);

      try {
        await send(messages);
        updateDomain(nftAddress, optimisticPatch, network);
        clearDomainResolutionCache();
        clearDomainLookupCache();
        setRecordDrafts((prev) => {
          const next = { ...prev };
          delete next[nftAddress];
          return next;
        });
        setContactDrafts((prev) => {
          const next = { ...prev };
          delete next[nftAddress];
          return next;
        });
        setChannelDrafts((prev) => {
          const next = { ...prev };
          delete next[nftAddress];
          return next;
        });
        schedulePostTxRefresh();
      } catch (e: unknown) {
        console.warn('[MyDomainsTab] batch save records error:', e);
      } finally {
        setSendingFor(null);
      }
    },
    [
      recordDrafts,
      contactDrafts,
      channelDrafts,
      network,
      schedulePostTxRefresh,
      send,
      updateDomain,
    ],
  );

  const handleClearSingleRecord = useCallback(
    async (nftAddress: string, category: 'wallet' | 'uri' | 'description') => {
      setSendingFor(nftAddress);
      try {
        const key =
          category === 'wallet'
            ? walletDnsKey()
            : category === 'uri'
              ? contactUriDnsKey()
              : channelDescriptionDnsKey();
        const payload = buildChangeDnsRecordBody(key, null);
        await send([
          {
            toAddress: nftAddress,
            amount: DNS_GAS.CHANGE_RECORD,
            payload,
          },
        ]);
        updateDomain(
          nftAddress,
          category === 'wallet'
            ? { walletRecord: undefined }
            : category === 'uri'
              ? { contactLink: undefined }
              : { channelLink: undefined },
          network,
        );
        clearDomainResolutionCache();
        clearDomainLookupCache();
        schedulePostTxRefresh();
      } finally {
        setSendingFor(null);
      }
    },
    [network, schedulePostTxRefresh, send, updateDomain],
  );

  const handleFinalizeAuction = useCallback(
    async (nftAddress: string) => {
      setSendingFor(nftAddress);
      try {
        const payload = buildFinalizeAuctionBody(BigInt(Date.now()));
        await send([
          {
            toAddress: nftAddress,
            amount: toNano('0.6'),
            payload,
          },
        ]);
        updateDomain(
          nftAddress,
          {
            isAuctionActive: false,
            isAuctionEnded: false,
            hasOwner: true,
          },
          network,
        );
        clearDomainResolutionCache();
        clearDomainLookupCache();
        schedulePostTxRefresh();
      } finally {
        setSendingFor(null);
      }
    },
    [network, schedulePostTxRefresh, send, updateDomain],
  );

  const handleDestroyDomain = useCallback(
    async (nftAddress: string) => {
      if (!address) return;
      setSendingFor(nftAddress);
      try {
        const payload = buildDestroyContractBody(
          BigInt(Date.now()),
          Address.parse(address),
        );
        await send([
          {
            toAddress: nftAddress,
            amount: toNano('0.05'),
            payload,
          },
        ]);
        removeDomain(nftAddress, network);
        clearDomainResolutionCache();
        clearDomainLookupCache();
        schedulePostTxRefresh();
      } finally {
        setSendingFor(null);
      }
    },
    [address, network, removeDomain, schedulePostTxRefresh, send],
  );

  if (domains.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">My Domains</h3>
          <RefreshButton
            onRefresh={() => {
              void refresh();
            }}
            testId="my-domains-refresh"
          />
        </div>
        <div className="p-6 text-center bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">🌐</p>
          <p className="font-semibold text-sm">
            {isRefreshing ? 'Checking on-chain domains…' : 'No domains yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Search for a domain in the Explore tab to register your first{' '}
            <strong>.bro</strong> handle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">My Domains</h3>
        <RefreshButton
          onRefresh={() => {
            void refresh();
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
        const isLiveAuctionActive =
          !domain.hasOwner &&
          Boolean(
            (domain.isAuctionActive || domain.auctionEndTime) &&
            auctionSecondsLeft > 0,
          );
        const isLiveAuctionEnded =
          !domain.hasOwner &&
          Boolean(
            domain.isAuctionEnded ||
            (domain.auctionEndTime && auctionSecondsLeft <= 0),
          );
        const isThisSending = sendingFor === domain.nftAddress || isSending;
        const charCount = domain.name.length;
        const canManageDomain =
          !domain.isOutdated &&
          !isLiveAuctionActive &&
          !isLiveAuctionEnded &&
          domain.hasOwner !== false;

        const walletDraft = recordDrafts[domain.nftAddress] ?? '';
        const contactDraft = contactDrafts[domain.nftAddress] ?? '';
        const channelDraft = channelDrafts[domain.nftAddress] ?? '';
        const hasPendingChanges = Boolean(
          walletDraft.trim() || contactDraft.trim() || channelDraft.trim(),
        );

        const activeContactBadge = detectSocialPlatform(
          contactDraft.trim() || domain.contactLink,
        );
        const activeChannelBadge = detectSocialPlatform(
          channelDraft.trim() || domain.channelLink,
        );
        const localError = validationErrors[domain.nftAddress];

        return (
          <div
            key={domain.nftAddress}
            className="p-4 bg-card border border-border rounded-2xl space-y-3.5"
          >
            {/* Domain header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-base truncate">
                  {domain.name}.{domain.zone}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <span>
                    {domain.nftAddress.slice(0, 4)}…
                    {domain.nftAddress.slice(-4)}
                  </span>
                  <CopyButton address={domain.nftAddress} />
                </div>
                {domain.isOutdated && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    Transferred
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                  isLiveAuctionActive
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : isLiveAuctionEnded
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : expired
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : secondsLeft < 30 * 86400
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isLiveAuctionActive
                  ? `Auction (${formatDuration(auctionSecondsLeft)})`
                  : isLiveAuctionEnded
                    ? 'Auction Ended'
                    : expired
                      ? 'Expired'
                      : `${formatDuration(secondsLeft)} left`}
              </span>
            </div>

            {/* Actions */}
            {!domain.isOutdated && (
              <>
                {isLiveAuctionActive && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-medium">Active 5-Minute Auction</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Once the auction ends and is finalized, you can configure
                      wallet and social contact records.
                    </p>
                  </div>
                )}

                {isLiveAuctionEnded && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400">
                      <p className="font-medium">Auction Completed!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Finalize the auction to claim domain ownership and burn
                        the winning FI bid.
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
                      actionLabel="Finalize Domain (0.6 TON)"
                      completeLabel="Finalized!"
                    >
                      Finalize Domain (0.6 TON)
                    </TxButton>
                  </div>
                )}

                {canManageDomain && (
                  <div className="space-y-3 pt-1 border-t border-border/60">
                    {/* Unified DNS Records Form (existing values shown as placeholders like Profile tab) */}
                    <div className="space-y-2.5">
                      {/* 1. Wallet Record */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">
                            Wallet Address
                          </span>
                          <div className="flex items-center gap-2">
                            {domain.walletRecord && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <CopyButton address={domain.walletRecord} />
                                <button
                                  type="button"
                                  disabled={isThisSending}
                                  onClick={() =>
                                    void handleClearSingleRecord(
                                      domain.nftAddress,
                                      'wallet',
                                    )
                                  }
                                  className="text-rose-500 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                            {address &&
                              walletDraft !== address &&
                              domain.walletRecord !== address && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRecordDrafts((prev) => ({
                                      ...prev,
                                      [domain.nftAddress]: address,
                                    }))
                                  }
                                  className="text-[11px] text-primary hover:underline cursor-pointer"
                                >
                                  Use my wallet
                                </button>
                              )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={walletDraft}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecordDrafts((prev) => ({
                              ...prev,
                              [domain.nftAddress]: val,
                            }));
                            if (localError) {
                              setValidationErrors((prev) => {
                                const next = { ...prev };
                                delete next[domain.nftAddress];
                                return next;
                              });
                            }
                          }}
                          placeholder={
                            domain.walletRecord ||
                            address ||
                            'Wallet address (0Q… / UQ…)'
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          data-testid={`dns-record-input-${domain.nftAddress}`}
                        />
                      </div>

                      {/* 2. Contact Link (uri) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">
                            Contact Link (ThatsApp, Briar, Telegram…)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {activeContactBadge && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {activeContactBadge.icon}{' '}
                                {activeContactBadge.label}
                              </span>
                            )}
                            {domain.contactLink && (
                              <>
                                <CopyButton address={domain.contactLink} />
                                <button
                                  type="button"
                                  disabled={isThisSending}
                                  onClick={() =>
                                    void handleClearSingleRecord(
                                      domain.nftAddress,
                                      'uri',
                                    )
                                  }
                                  className="text-[11px] text-rose-500 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={contactDraft}
                          onChange={(e) =>
                            setContactDrafts((prev) => ({
                              ...prev,
                              [domain.nftAddress]: e.target.value,
                            }))
                          }
                          placeholder={
                            domain.contactLink ||
                            'simplex:/... or briar://... or https://t.me/...'
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          data-testid={`dns-contact-input-${domain.nftAddress}`}
                        />
                      </div>

                      {/* 3. Channel / Group Link (description) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">
                            Channel / Group Link
                          </span>
                          <div className="flex items-center gap-1.5">
                            {activeChannelBadge && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                📢 {activeChannelBadge.label}
                              </span>
                            )}
                            {domain.channelLink && (
                              <>
                                <CopyButton address={domain.channelLink} />
                                <button
                                  type="button"
                                  disabled={isThisSending}
                                  onClick={() =>
                                    void handleClearSingleRecord(
                                      domain.nftAddress,
                                      'description',
                                    )
                                  }
                                  className="text-[11px] text-rose-500 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={channelDraft}
                          onChange={(e) =>
                            setChannelDrafts((prev) => ({
                              ...prev,
                              [domain.nftAddress]: e.target.value,
                            }))
                          }
                          placeholder={
                            domain.channelLink ||
                            'SimpleX group, Briar forum, t.me channel…'
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          data-testid={`dns-channel-input-${domain.nftAddress}`}
                        />
                      </div>

                      {localError && (
                        <p className="text-xs text-rose-500 font-medium">
                          {localError}
                        </p>
                      )}

                      <TxButton
                        size="sm"
                        className="w-full"
                        disabled={!hasPendingChanges || isThisSending}
                        loading={
                          isThisSending && sendingFor === domain.nftAddress
                        }
                        onAction={() => handleSaveChanges(domain.nftAddress)}
                        actionLabel={
                          hasPendingChanges ? 'Update Records' : 'No Changes'
                        }
                        completeLabel="Updated!"
                      >
                        {hasPendingChanges ? 'Update Records' : 'No Changes'}
                      </TxButton>
                    </div>

                    {/* Compact Footer: Renew & Destroy side-by-side */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                      <TxButton
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        disabled={isThisSending}
                        loading={
                          isThisSending && sendingFor === domain.nftAddress
                        }
                        onAction={() =>
                          handleRenewFi(domain.nftAddress, charCount)
                        }
                        actionLabel={`Renew (${formatFi(broFiRenewalFee(charCount))})`}
                        completeLabel="Renewed!"
                      >
                        Renew ({formatFi(broFiRenewalFee(charCount))})
                      </TxButton>
                      <TxButton
                        size="sm"
                        variant="danger"
                        className="w-full"
                        disabled={isThisSending}
                        loading={
                          isThisSending && sendingFor === domain.nftAddress
                        }
                        onAction={() => handleDestroyDomain(domain.nftAddress)}
                        actionLabel="Destroy Domain"
                        completeLabel="Destroyed!"
                      >
                        Destroy Domain
                      </TxButton>
                    </div>
                  </div>
                )}
              </>
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
