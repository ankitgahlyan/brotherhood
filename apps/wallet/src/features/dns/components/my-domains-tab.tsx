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

  // Per-domain inline DNS record draft values
  const [recordDrafts, setRecordDrafts] = useState<Record<string, string>>({});
  const [contactDrafts, setContactDrafts] = useState<Record<string, string>>(
    {},
  );
  const [channelDrafts, setChannelDrafts] = useState<Record<string, string>>(
    {},
  );
  const [sendingFor, setSendingFor] = useState<string | null>(null);

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
        clearDomainResolutionCache();
        clearDomainLookupCache();
        void refresh();
      } finally {
        setSendingFor(null);
      }
    },
    [address, network, refresh, send],
  );

  const handleSetRecord = useCallback(
    async (nftAddress: string, rawInput: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;
      setSendingFor(nftAddress);
      try {
        const walletAddr = Address.parse(trimmed);
        const normalizedAddr = walletAddr.toString();
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
        updateDomain(nftAddress, { walletRecord: normalizedAddr }, network);
        clearDomainResolutionCache();
        clearDomainLookupCache();
        setRecordDrafts((prev) => {
          const next = { ...prev };
          delete next[nftAddress];
          return next;
        });
        void refresh();
      } catch (e: unknown) {
        console.warn('[MyDomainsTab] set record error:', e);
      } finally {
        setSendingFor(null);
      }
    },
    [network, refresh, send, updateDomain],
  );

  const handleSetTextRecord = useCallback(
    async (
      nftAddress: string,
      category: 'uri' | 'description',
      rawInput: string,
    ) => {
      const trimmed = rawInput.trim();
      setSendingFor(nftAddress);
      try {
        const key =
          category === 'uri' ? contactUriDnsKey() : channelDescriptionDnsKey();
        const valueCell = trimmed ? buildTextDnsRecordCell(trimmed) : null;
        const payload = buildChangeDnsRecordBody(key, valueCell);
        await send([
          {
            toAddress: nftAddress,
            amount: DNS_GAS.CHANGE_RECORD,
            payload,
          },
        ]);
        updateDomain(
          nftAddress,
          category === 'uri'
            ? { contactLink: trimmed || undefined }
            : { channelLink: trimmed || undefined },
          network,
        );
        clearDomainResolutionCache();
        clearDomainLookupCache();
        if (category === 'uri') {
          setContactDrafts((prev) => {
            const next = { ...prev };
            delete next[nftAddress];
            return next;
          });
        } else {
          setChannelDrafts((prev) => {
            const next = { ...prev };
            delete next[nftAddress];
            return next;
          });
        }
        void refresh();
      } catch (e: unknown) {
        console.warn('[MyDomainsTab] set text record error:', e);
      } finally {
        setSendingFor(null);
      }
    },
    [network, refresh, send, updateDomain],
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
        clearDomainResolutionCache();
        clearDomainLookupCache();
        void refresh();
      } finally {
        setSendingFor(null);
      }
    },
    [refresh, send],
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
        updateDomain(nftAddress, { walletRecord: undefined }, network);
        clearDomainResolutionCache();
        clearDomainLookupCache();
        setRecordDrafts((prev) => {
          const next = { ...prev };
          delete next[nftAddress];
          return next;
        });
        void refresh();
      } finally {
        setSendingFor(null);
      }
    },
    [network, refresh, send, updateDomain],
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
        void refresh();
      } finally {
        setSendingFor(null);
      }
    },
    [address, network, refresh, removeDomain, send],
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
        const isThisSending = sendingFor === domain.nftAddress || isSending;
        const charCount = domain.name.length;
        const canManageDomain =
          !domain.isOutdated &&
          !domain.isAuctionActive &&
          (domain.hasOwner || !domain.isAuctionEnded);
        const currentRecordInput =
          recordDrafts[domain.nftAddress] ??
          domain.walletRecord ??
          address ??
          '';
        const currentContactInput =
          contactDrafts[domain.nftAddress] ?? domain.contactLink ?? '';
        const currentChannelInput =
          channelDrafts[domain.nftAddress] ?? domain.channelLink ?? '';

        const detectedContact = detectSocialPlatform(currentContactInput);
        const detectedChannel = detectSocialPlatform(currentChannelInput);
        const savedContactInfo = detectSocialPlatform(domain.contactLink);
        const savedChannelInfo = detectSocialPlatform(domain.channelLink);

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

            {/* Current Social Contact Link */}
            {domain.contactLink && savedContactInfo && (
              <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                <span className="shrink-0">
                  {savedContactInfo.icon} {savedContactInfo.label}
                </span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-mono truncate max-w-[180px]">
                    {domain.contactLink}
                  </span>
                  <CopyButton address={domain.contactLink} />
                </div>
              </div>
            )}

            {/* Current Channel / Group Link */}
            {domain.channelLink && savedChannelInfo && (
              <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                <span className="shrink-0">
                  📢 {savedChannelInfo.label} Channel
                </span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-mono truncate max-w-[180px]">
                    {domain.channelLink}
                  </span>
                  <CopyButton address={domain.channelLink} />
                </div>
              </div>
            )}

            {/* Actions */}
            {!domain.isOutdated && (
              <>
                {domain.isAuctionActive && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-medium">Active 5-Minute Auction</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      This domain is in its initial auction period. Once the
                      auction ends and is finalized, domain ownership is granted
                      and you can link wallet and social contact records.
                    </p>
                  </div>
                )}

                {domain.isAuctionEnded && !domain.hasOwner && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400">
                      <p className="font-medium">Auction Completed!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        The 5-minute bidding window has closed. Finalize the
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
                      actionLabel="Finalize Domain (0.6 TON)"
                      completeLabel="Finalized!"
                    >
                      Finalize Domain
                    </TxButton>
                  </div>
                )}

                {canManageDomain && (
                  <>
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
                      actionLabel={`Renew (${formatFi(broFiRenewalFee(charCount))}/yr)`}
                      completeLabel="Renewed!"
                    >
                      Renew
                    </TxButton>

                    {/* Inline DNS wallet record form */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <p className="text-xs text-muted-foreground font-medium">
                        Wallet address DNS record
                      </p>
                      <input
                        type="text"
                        value={currentRecordInput}
                        onChange={(e) =>
                          setRecordDrafts((prev) => ({
                            ...prev,
                            [domain.nftAddress]: e.target.value,
                          }))
                        }
                        placeholder="Wallet address (EQ…)"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        data-testid={`dns-record-input-${domain.nftAddress}`}
                      />
                      <div className="flex gap-2">
                        <TxButton
                          size="sm"
                          className="flex-1"
                          disabled={!currentRecordInput.trim() || isThisSending}
                          loading={
                            isThisSending && sendingFor === domain.nftAddress
                          }
                          onAction={() =>
                            handleSetRecord(
                              domain.nftAddress,
                              currentRecordInput,
                            )
                          }
                          actionLabel="Save Wallet Record"
                          completeLabel="Saved!"
                        >
                          Save Wallet
                        </TxButton>
                        {domain.walletRecord && (
                          <TxButton
                            size="sm"
                            variant="danger"
                            disabled={isThisSending}
                            onAction={() =>
                              handleClearRecord(domain.nftAddress)
                            }
                            actionLabel="Clear Wallet Record"
                          >
                            Clear
                          </TxButton>
                        )}
                      </div>
                    </div>

                    {/* Inline Social / Contact Link (uri) form */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium">
                          Social / Contact Link (ThatsApp, Telegram, Facebook…)
                        </p>
                        {detectedContact && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {detectedContact.icon} {detectedContact.label}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentContactInput}
                        onChange={(e) =>
                          setContactDrafts((prev) => ({
                            ...prev,
                            [domain.nftAddress]: e.target.value,
                          }))
                        }
                        placeholder="simplex:/?... or https://t.me/... or https://facebook.com/..."
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        data-testid={`dns-contact-input-${domain.nftAddress}`}
                      />
                      <div className="flex gap-2">
                        <TxButton
                          size="sm"
                          className="flex-1"
                          disabled={
                            !currentContactInput.trim() || isThisSending
                          }
                          loading={
                            isThisSending && sendingFor === domain.nftAddress
                          }
                          onAction={() =>
                            handleSetTextRecord(
                              domain.nftAddress,
                              'uri',
                              currentContactInput,
                            )
                          }
                          actionLabel="Save Contact Link"
                          completeLabel="Saved!"
                        >
                          Save Contact Link
                        </TxButton>
                        {domain.contactLink && (
                          <TxButton
                            size="sm"
                            variant="danger"
                            disabled={isThisSending}
                            onAction={() =>
                              handleSetTextRecord(domain.nftAddress, 'uri', '')
                            }
                            actionLabel="Clear Contact Link"
                          >
                            Clear
                          </TxButton>
                        )}
                      </div>
                    </div>

                    {/* Inline Channel / Group Link (description) form */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium">
                          Channel / Group Link (optional)
                        </p>
                        {detectedChannel && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            📢 {detectedChannel.label}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentChannelInput}
                        onChange={(e) =>
                          setChannelDrafts((prev) => ({
                            ...prev,
                            [domain.nftAddress]: e.target.value,
                          }))
                        }
                        placeholder="Group or channel link (SimpleX group, t.me channel, etc.)"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        data-testid={`dns-channel-input-${domain.nftAddress}`}
                      />
                      <div className="flex gap-2">
                        <TxButton
                          size="sm"
                          className="flex-1"
                          disabled={
                            !currentChannelInput.trim() || isThisSending
                          }
                          loading={
                            isThisSending && sendingFor === domain.nftAddress
                          }
                          onAction={() =>
                            handleSetTextRecord(
                              domain.nftAddress,
                              'description',
                              currentChannelInput,
                            )
                          }
                          actionLabel="Save Channel Link"
                          completeLabel="Saved!"
                        >
                          Save Channel Link
                        </TxButton>
                        {domain.channelLink && (
                          <TxButton
                            size="sm"
                            variant="danger"
                            disabled={isThisSending}
                            onAction={() =>
                              handleSetTextRecord(
                                domain.nftAddress,
                                'description',
                                '',
                              )
                            }
                            actionLabel="Clear Channel Link"
                          >
                            Clear
                          </TxButton>
                        )}
                      </div>
                    </div>

                    {/* Destroy domain item contract and recover TON */}
                    <div className="pt-2 border-t border-border/60">
                      <TxButton
                        size="sm"
                        variant="danger"
                        className="w-full"
                        disabled={isThisSending}
                        loading={
                          isThisSending && sendingFor === domain.nftAddress
                        }
                        onAction={() => handleDestroyDomain(domain.nftAddress)}
                        actionLabel="Destroy Domain & Recover TON"
                        completeLabel="Destroyed!"
                      >
                        Destroy Domain & Recover TON
                      </TxButton>
                    </div>
                  </>
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
