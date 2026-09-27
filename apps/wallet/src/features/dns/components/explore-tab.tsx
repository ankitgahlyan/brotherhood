/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from 'react';
import { Address, toNano } from '@ton/core';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { Button } from '@/core/components/ui/button';
import { TxButton } from '@/core/components/ui/tx-button';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import type { Network } from '@/lib/brotherhood/config';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { useDomainLookup } from '../hooks/use-domain-lookup';
import { useDnsTransaction, DNS_GAS } from '../hooks/use-dns-transaction';
import { useDnsStore } from '../store/dns-store';
import {
  buildDeployDnsDomainBody,
  buildDnsBidRequestBody,
  buildFinalizeAuctionBody,
  broTierPrice,
  broFiStartingBid,
  broFiRenewalFee,
  broFiTierLabel,
  BRO_FIXED_TON_FEE,
  BRO_COLLECTION_RESOLVER,
  deriveDnsItemAddress,
} from '../lib/dns-bodies';
import { TON_DNS_ZONES } from '@/core/lib/dns';

interface ExploreTabProps {
  network: Network;
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

function formatCountdown(targetSec: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = targetSec - now;
  if (diff <= 0) return 'Ending now';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${diff % 60}s`;
}

function formatExpiry(expiresAt: number): string {
  const date = new Date(expiresAt * 1000);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ExploreTab: React.FC<ExploreTabProps> = ({ network }) => {
  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [bidInput, setBidInput] = useState('');
  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();
  const { formatWalletAddress } = useFormatAddress();
  const addDomain = useDnsStore((s) => s.addDomain);

  const lookupNet = network;
  const lookup = useDomainLookup(submittedQuery, lookupNet as Network);

  const { send, isSending, error } = useDnsTransaction(
    currentWallet,
    walletKit,
  );

  const handleSearch = useCallback(() => {
    setSubmittedQuery(inputValue.trim());
    setBidInput('');
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  const handleRegister = useCallback(async () => {
    if (!address || !lookup.nftAddress) return;

    const query = submittedQuery.trim().toLowerCase();
    const bare = query.includes('.') ? query.split('.')[0] : query;

    if (lookup.zoneSuffix === 'bro' && lookup.fiStartingBid) {
      const fiWalletAddress = getFiWalletAddress(
        Address.parse(address),
        lookupNet,
      );
      const payload = buildDnsBidRequestBody(
        BigInt(Date.now()),
        bare,
        lookup.fiStartingBid,
        Address.parse(BRO_COLLECTION_RESOLVER),
      );
      await send([
        {
          toAddress: fiWalletAddress.toString(),
          amount: toNano('1.05'),
          payload,
        },
      ]);
    } else {
      const price = broTierPrice(bare.length);
      const gasBuffer = DNS_GAS.REGISTER_GAS_BUFFER;
      const totalAmount = price + gasBuffer;
      const payload = buildDeployDnsDomainBody(bare);
      await send([
        {
          toAddress: BRO_COLLECTION_RESOLVER,
          amount: totalAmount,
          payload,
        },
      ]);
    }

    // Optimistic store update
    addDomain(
      {
        name: bare,
        zone: lookup.zoneSuffix ?? 'bro',
        nftAddress: deriveDnsItemAddress(
          Address.parse(BRO_COLLECTION_RESOLVER),
          bare,
          lookupNet === 'testnet',
        ),
        registeredAt: Math.floor(Date.now() / 1000),
        lastFillUpTime: Math.floor(Date.now() / 1000),
      },
      lookupNet as Network,
    );

    setSubmittedQuery('');
    setInputValue('');
  }, [address, lookup, submittedQuery, send, addDomain, lookupNet]);

  const handlePlaceBid = useCallback(async () => {
    if (!address || !lookup.nftAddress) return;
    const query = submittedQuery.trim().toLowerCase();
    const bare = query.includes('.') ? query.split('.')[0] : query;
    const fiBidAmount = bidInput.trim()
      ? toNano(bidInput.trim())
      : (lookup.minNextBid ?? 0n);
    if (fiBidAmount <= 0n) return;

    const fiWalletAddress = getFiWalletAddress(
      Address.parse(address),
      lookupNet,
    );
    const payload = buildDnsBidRequestBody(
      BigInt(Date.now()),
      bare,
      fiBidAmount,
      Address.parse(BRO_COLLECTION_RESOLVER),
    );
    await send([
      {
        toAddress: fiWalletAddress.toString(),
        amount: toNano('1.05'),
        payload,
      },
    ]);
    setBidInput('');
  }, [address, lookup, submittedQuery, bidInput, send, lookupNet]);

  const handleFinalize = useCallback(async () => {
    if (!address || !lookup.nftAddress) return;
    const payload = buildFinalizeAuctionBody(BigInt(Date.now()));
    await send([
      {
        toAddress: lookup.nftAddress,
        amount: toNano('0.6'),
        payload,
      },
    ]);
  }, [address, lookup, send]);

  const getZoneLabel = () => {
    if (!lookup.zoneSuffix) return null;
    return (
      <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
        .{lookup.zoneSuffix}
      </span>
    );
  };

  const renderResultCard = () => {
    if (lookup.status === 'idle') return null;

    if (lookup.status === 'resolving') {
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl animate-pulse">
          <div className="h-4 bg-muted rounded w-2/3 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      );
    }

    if (lookup.status === 'invalid') {
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl">
          <p className="text-sm text-muted-foreground">
            Invalid domain format. Use lowercase letters, digits, or hyphens.
          </p>
        </div>
      );
    }

    if (lookup.status === 'mainnet-only') {
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">{submittedQuery}</span>
            {getZoneLabel()}
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
            Mainnet only
          </span>
          <p className="text-xs text-muted-foreground mt-2">
            This zone is only available on mainnet. Switch your wallet network
            to register.
          </p>
        </div>
      );
    }

    if (lookup.status === 'available') {
      const isBro = lookup.zoneSuffix === 'bro';
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">
                {submittedQuery.includes('.')
                  ? submittedQuery
                  : `${submittedQuery}.bro`}
              </span>
              {getZoneLabel()}
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              ✓ Available
            </span>
          </div>
          {isBro && lookup.fiStartingBid ? (
            <div className="text-xs text-muted-foreground space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex justify-between">
                <span>Starting bid</span>
                <span className="font-semibold text-foreground">
                  {formatFi(lookup.fiStartingBid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fixed TON fee</span>
                <span className="font-medium text-foreground">
                  1.0 TON (0.5 treasury + 0.5 gas)
                </span>
              </div>
              {lookup.fiRenewalFee && (
                <div className="flex justify-between">
                  <span>Annual renewal</span>
                  <span className="font-medium text-foreground">
                    {formatFi(lookup.fiRenewalFee)} / year
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Auction duration</span>
                <span>7 Days (English auction)</span>
              </div>
            </div>
          ) : (
            lookup.price !== undefined && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Registration fee</span>
                  <span className="font-medium text-foreground">
                    {formatNano(lookup.price)}
                  </span>
                </div>
                {lookup.renewalFee !== undefined && (
                  <div className="flex justify-between">
                    <span>Annual renewal</span>
                    <span className="font-medium text-foreground">
                      {formatNano(lookup.renewalFee)}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
          <TxButton
            fullWidth
            disabled={!address || isSending}
            loading={isSending}
            onAction={handleRegister}
            actionLabel={isBro ? 'Start 7-Day Auction' : 'Register Domain'}
            completeLabel={isBro ? 'Auction Started!' : 'Registered!'}
          >
            {isBro ? 'Start 7-Day Auction' : 'Register'}
          </TxButton>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      );
    }

    if (lookup.status === 'in-auction') {
      const minBidNano = lookup.minNextBid ?? 0n;
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">
                {submittedQuery.includes('.')
                  ? submittedQuery
                  : `${submittedQuery}.bro`}
              </span>
              {getZoneLabel()}
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold animate-pulse">
              🔥 Active Auction
            </span>
          </div>

          <div className="text-xs text-muted-foreground space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <div className="flex justify-between">
              <span>Current highest bid</span>
              <span className="font-semibold text-foreground">
                {lookup.currentBid ? formatFi(lookup.currentBid) : '0 FI'}
              </span>
            </div>
            {lookup.maxBidAddress && (
              <div className="flex justify-between items-center">
                <span>Highest bidder</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-foreground">
                    {formatWalletAddress(lookup.maxBidAddress, true, 4)}
                  </span>
                  <CopyButton address={lookup.maxBidAddress} />
                </div>
              </div>
            )}
            {lookup.auctionEndTime && (
              <div className="flex justify-between">
                <span>Time remaining</span>
                <span className="font-medium text-amber-600">
                  {formatCountdown(lookup.auctionEndTime)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Min outbid increment</span>
              <span className="font-medium text-foreground">
                +5% ({formatFi(minBidNano)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fixed fee</span>
              <span className="font-medium text-foreground">1.0 TON</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">
              Your Bid (FI tokens)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={(Number(minBidNano) / 1e9).toString()}
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-12"
              />
              <span className="absolute right-3 top-2 text-xs font-semibold text-muted-foreground">
                FI
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Must be at least {formatFi(minBidNano)}. Fixed 1.0 TON fee is
              charged alongside bid.
            </p>
          </div>

          <TxButton
            fullWidth
            disabled={!address || isSending}
            loading={isSending}
            onAction={handlePlaceBid}
            actionLabel="Place Outbid"
            completeLabel="Bid Placed!"
          >
            Place Bid
          </TxButton>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      );
    }

    if (lookup.status === 'auction-ended') {
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">
                {submittedQuery.includes('.')
                  ? submittedQuery
                  : `${submittedQuery}.bro`}
              </span>
              {getZoneLabel()}
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold">
              🏆 Auction Ended
            </span>
          </div>

          <div className="text-xs text-muted-foreground space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
            {lookup.winner && (
              <div className="flex justify-between items-center">
                <span>Auction winner</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-foreground">
                    {formatWalletAddress(lookup.winner, true, 4)}
                  </span>
                  <CopyButton address={lookup.winner} />
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span>Winning bid</span>
              <span className="font-semibold text-foreground">
                {lookup.currentBid ? formatFi(lookup.currentBid) : '0 FI'}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The 7-day auction period has elapsed. Finalizing assigns the domain
            NFT to the winner and permanently burns the winning FI bid.
          </p>

          <TxButton
            fullWidth
            disabled={!address || isSending}
            loading={isSending}
            onAction={handleFinalize}
            actionLabel="Claim & Finalize Domain"
            completeLabel="Finalized!"
          >
            Claim & Finalize Domain
          </TxButton>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      );
    }

    if (lookup.status === 'expired') {
      return (
        <div className="mt-3 p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">
                {submittedQuery.includes('.')
                  ? submittedQuery
                  : `${submittedQuery}.bro`}
              </span>
              {getZoneLabel()}
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold">
              ⚠ Expired
            </span>
          </div>
          {lookup.owner && (
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Previous owner</span>
              <div className="flex items-center gap-1">
                <span className="font-mono">
                  {formatWalletAddress(lookup.owner, true, 4)}
                </span>
                <CopyButton address={lookup.owner} />
              </div>
            </div>
          )}
          {lookup.expiresAt && (
            <p className="text-xs text-muted-foreground">
              Expired on {formatExpiry(lookup.expiresAt)}. Available for
              re-registration.
            </p>
          )}
          {lookup.price !== undefined && (
            <p className="text-xs text-muted-foreground">
              Fee:{' '}
              <span className="font-medium text-foreground">
                {formatNano(lookup.price)}
              </span>
            </p>
          )}
          <TxButton
            fullWidth
            disabled={!address || isSending}
            loading={isSending}
            onAction={handleRegister}
            actionLabel="Register Domain"
            completeLabel="Registered!"
          >
            Register Now
          </TxButton>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      );
    }

    // taken
    return (
      <div className="mt-3 p-4 bg-card border border-border rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">
              {submittedQuery.includes('.')
                ? submittedQuery
                : `${submittedQuery}.bro`}
            </span>
            {getZoneLabel()}
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
            Taken
          </span>
        </div>
        {lookup.owner && (
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Owner</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">
                {formatWalletAddress(lookup.owner, true, 4)}
              </span>
              <CopyButton address={lookup.owner} />
            </div>
          </div>
        )}
        {lookup.expiresAt && (
          <p className="text-xs text-muted-foreground">
            Expires: {formatExpiry(lookup.expiresAt)}
          </p>
        )}
        {lookup.nftAddress && (
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>NFT contract</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">
                {formatWalletAddress(lookup.nftAddress, true, 4)}
              </span>
              <CopyButton address={lookup.nftAddress} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-card border border-border rounded-2xl">
        <h3 className="font-semibold text-sm mb-3">Search Domains</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="alice  or  alice.bro  or  alice.ton"
            className="flex-1 min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="dns-explore-search-input"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="shrink-0"
          >
            Search
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Plain handles (without a dot) try <strong>.bro</strong> first, then{' '}
          <strong>.ton</strong>.
        </p>
      </div>

      {renderResultCard()}

      <div className="p-4 bg-card border border-border rounded-2xl">
        <h3 className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide">
          Supported Zones
        </h3>
        <div className="space-y-2">
          {TON_DNS_ZONES.map((zone) => {
            const canReg =
              zone.suffixes[0] === 'bro' || lookupNet === 'mainnet';
            return (
              <div
                key={zone.suffixes[0]}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium">.{zone.suffixes[0]}</span>{' '}
                  <span className="text-muted-foreground">
                    {zone.collectionName}
                  </span>
                </div>
                {canReg ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                    ✓ Registerable
                  </span>
                ) : (
                  <span className="text-amber-500 text-[10px]">
                    Mainnet only
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
