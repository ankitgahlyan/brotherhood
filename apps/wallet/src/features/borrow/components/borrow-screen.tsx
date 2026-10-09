/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  HandCoins,
  Search,
  Pin,
  PinOff,
  Coins,
  ShieldCheck,
  TrendingUp,
  Clock,
  Calendar,
  Percent,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatUnits } from '@ton/walletkit';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  useExplorer,
  getExplorerAddressUrl,
} from '@/core/explorer/use-explorer';
import { formatMaturityDate } from '@/features/swap/hooks/use-ecosystem-swap';
import { useNowSeconds } from '@/core/hooks';
import { MemberGuard, useIsNetworkMember } from '@/features/brotherhood';
import { useBorrowTokens } from '../hooks/use-borrow-tokens';
import { useBorrowTerms } from '../hooks/use-borrow-terms';

export const BorrowScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatContractAddress } = useFormatAddress();
  const { explorer } = useExplorer();
  const { canOperate } = useIsNetworkMember();
  const nowSec = useNowSeconds();

  const {
    tokens,
    selectedTokenId,
    setSelectedTokenId,
    selectedToken,
    searchToken,
    isSearching,
    searchError,
    pinToken,
    unpinToken,
  } = useBorrowTokens(network);

  const [searchInput, setSearchInput] = useState('');

  // Form input states
  const [amountInput, setAmountInput] = useState('');
  const [cutoffDaysInput, setCutoffDaysInput] = useState('');
  const [maturityDaysInput, setMaturityDaysInput] = useState('');
  const [multiplierInput, setMultiplierInput] = useState('');

  const borrowTermsManager = useBorrowTerms({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    token: selectedToken,
    amount: amountInput,
    cutoffDays: cutoffDaysInput,
    maturityDays: maturityDaysInput,
    multiplier: multiplierInput,
    onSuccess: () => {
      setAmountInput('');
      setCutoffDaysInput('');
      setMaturityDaysInput('');
      setMultiplierInput('');
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      void searchToken(searchInput.trim());
    }
  };

  const isDefaultPinned =
    selectedToken.id === 'FI' || selectedToken.id === 'RESERVE';

  // Compute active on-chain rules for display
  const activeNeed =
    selectedToken.kind === 'fi'
      ? (selectedToken.fiCreditNeed ?? 0n)
      : (selectedToken.creditInfo?.creditNeed ?? 0n);

  const activeCutoff =
    selectedToken.kind === 'fi'
      ? (selectedToken.fiCreditCutoff ?? 0)
      : Number(selectedToken.creditInfo?.creditCutoff ?? 0);

  const activeMaturity =
    selectedToken.kind === 'fi'
      ? (selectedToken.fiCreditMaturity ?? 0)
      : Number(selectedToken.creditInfo?.creditMaturity ?? 0);

  const activeMultiplier =
    selectedToken.kind === 'fi'
      ? (selectedToken.fiMultiplier ?? 1.0).toFixed(3)
      : selectedToken.creditInfo && selectedToken.creditInfo.multiplier > 0
        ? (Number(selectedToken.creditInfo.multiplier) / 1000).toFixed(3)
        : '1.000';

  return (
    <NewLayout>
      <div className="space-y-4 px-4 pb-24 pt-2">
        <ScreenHeader title="Borrow Terms" />

        <MemberGuard title="Borrow Terms">
          {/* Quick-Select Token Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Target Currency / Token
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {tokens.map((tok) => {
                const isSelected = tok.id === selectedTokenId;
                return (
                  <button
                    key={tok.id}
                    type="button"
                    onClick={() => {
                      setSelectedTokenId(tok.id);
                      setAmountInput('');
                      setCutoffDaysInput('');
                      setMaturityDaysInput('');
                      setMultiplierInput('');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-card hover:bg-secondary/60 border-border text-foreground'
                    }`}
                  >
                    {tok.kind === 'fi' ? (
                      <Coins className="w-3.5 h-3.5 text-blue-500" />
                    ) : tok.kind === 'reserve' ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <HandCoins className="w-3.5 h-3.5 text-purple-500" />
                    )}
                    <span>{tok.symbol}</span>
                    {tok.isPinned &&
                      tok.id !== 'FI' &&
                      tok.id !== 'RESERVE' && (
                        <span className="text-[10px] text-muted-foreground">
                          📌
                        </span>
                      )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Token by Domain / Username / Address */}
          <form onSubmit={handleSearchSubmit} className="space-y-1">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search token by @username, .bro domain, or address..."
                className="w-full pl-9 pr-20 py-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <Button
                type="submit"
                size="sm"
                loading={isSearching}
                className="absolute right-1 text-xs py-1 px-3 h-7"
              >
                Resolve
              </Button>
            </div>
            {searchError && (
              <p className="text-[11px] text-destructive pl-1">{searchError}</p>
            )}
          </form>

          {/* Selected Token Overview Card */}
          <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center flex-shrink-0 text-amber-500">
                  {selectedToken.kind === 'fi' ? (
                    <Coins className="w-5 h-5 text-blue-500" />
                  ) : selectedToken.kind === 'reserve' ? (
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  ) : (
                    <HandCoins className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground leading-tight flex items-center gap-2">
                    {selectedToken.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                      {selectedToken.symbol}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedToken.kind === 'fi'
                      ? 'Network Standard Currency (FossFI)'
                      : selectedToken.kind === 'reserve'
                        ? 'Treasury Reserve Currency'
                        : selectedToken.domain
                          ? `Issuer: ${selectedToken.domain}`
                          : 'Peer Personal Token'}
                  </p>
                </div>
              </div>

              {!isDefaultPinned && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (selectedToken.isPinned) {
                      unpinToken(selectedToken.id);
                    } else {
                      pinToken(selectedToken);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  {selectedToken.isPinned ? (
                    <>
                      <PinOff className="w-3.5 h-3.5 mr-1" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5 mr-1" /> Pin Token
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Wallet & On-Chain Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl break-all">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-muted-foreground text-[11px]">
                    Your Wallet ({selectedToken.symbol})
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      selectedToken.isDeployed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {selectedToken.isDeployed ? '✓ Active' : '⚠ Undeployed'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-medium text-foreground">
                    {selectedToken.userWalletAddress
                      ? formatContractAddress(selectedToken.userWalletAddress)
                      : 'Not computed'}
                  </span>
                  {selectedToken.userWalletAddress && (
                    <CopyButton
                      address={selectedToken.userWalletAddress}
                      type="contract"
                      size="xs"
                    />
                  )}
                </div>
              </div>

              <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl break-all">
                <span className="text-muted-foreground text-[11px] block mb-0.5">
                  Token Minter Contract
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-medium text-foreground">
                    {selectedToken.minterAddress
                      ? formatContractAddress(selectedToken.minterAddress)
                      : 'Protocol Minter'}
                  </span>
                  {selectedToken.minterAddress && (
                    <div className="flex items-center gap-1">
                      <CopyButton
                        address={selectedToken.minterAddress}
                        type="contract"
                        size="xs"
                      />
                      <a
                        href={getExplorerAddressUrl(
                          network,
                          selectedToken.minterAddress,
                          explorer,
                          'jetton-master',
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Undeployed Wallet Warning Banner */}
          {!selectedToken.isDeployed && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Wallet Not Yet Onboarded
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You have not yet held or received {selectedToken.symbol}{' '}
                    tokens on this wallet. Acquire tokens via Swap or direct
                    transfer to initialize your wallet contract before setting
                    borrowing terms.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/swap')}
                className="shrink-0 text-xs gap-1.5"
              >
                Go to Swap <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Active Rules Summary Card */}
          {selectedToken.isDeployed && (
            <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <HandCoins className="w-4.5 h-4.5 text-amber-500" />
                  Active Borrowing Terms
                </h3>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    activeNeed > 0n
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-muted-foreground bg-secondary/50 border-border/50'
                  }`}
                >
                  {activeNeed > 0n ? 'Credit Open' : 'Credit Closed'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When active, other members can lend you {selectedToken.symbol}{' '}
                via the Swap screen, receiving your minted tokens as debt IOUs.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary" /> Target Need
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums block">
                    {activeNeed > 0n
                      ? `${formatUnits(activeNeed.toString(), 9)} ${selectedToken.symbol}`
                      : 'Inactive (0 Need)'}
                  </span>
                </div>

                <div className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Percent className="w-3 h-3 text-amber-500" /> Multiplier
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums block">
                    {activeMultiplier}x
                  </span>
                </div>

                <div className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" /> Deadline
                  </span>
                  <span className="text-xs font-semibold text-foreground block">
                    {activeCutoff > 0
                      ? formatMaturityDate(activeCutoff)
                      : 'Open (No cutoff)'}
                  </span>
                </div>

                <div className="p-2.5 bg-secondary/40 border border-border/50 rounded-xl space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" /> Maturity Lock
                  </span>
                  <span className="text-xs font-semibold text-foreground block">
                    {activeMaturity > 0
                      ? formatMaturityDate(activeMaturity)
                      : 'Instant (No Lock)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lifetime Settlement Stats for Personal Tokens */}
          {selectedToken.isDeployed && selectedToken.creditInfo && (
            <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm space-y-3">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Lifetime Credit & Settlement Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-secondary/30 border border-border/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">
                    Total Credit Received
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums mt-0.5 block">
                    {formatUnits(
                      selectedToken.creditInfo.totalCreditReceived.toString(),
                      9,
                    )}{' '}
                    {selectedToken.symbol}
                  </span>
                </div>
                <div className="p-2.5 bg-secondary/30 border border-border/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">
                    Total Payback Settled
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
                    {formatUnits(
                      selectedToken.creditInfo.totalPaybackSettled.toString(),
                      9,
                    )}{' '}
                    {selectedToken.symbol}
                  </span>
                </div>
                <div className="p-2.5 bg-secondary/30 border border-border/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">
                    Payback Shortfall
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums mt-0.5 block ${
                      selectedToken.creditInfo.totalPaybackShortfall > 0n
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatUnits(
                      selectedToken.creditInfo.totalPaybackShortfall.toString(),
                      9,
                    )}{' '}
                    {selectedToken.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Configure Form */}
          {selectedToken.isDeployed && (
            <div className="bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm space-y-3.5">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                Configure {selectedToken.symbol} Loan Requirement
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Credit Need Amount ({selectedToken.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder={
                      activeNeed > 0n
                        ? `Current: ${(Number(activeNeed) / 1e9).toString()} (0 to close)`
                        : 'e.g. 500 (Set to 0 to close credit)'
                    }
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="borrow-credit-amount"
                  />
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Max amount of {selectedToken.symbol} you wish to borrow.
                  </span>
                  {borrowTermsManager.amountValidationError && (
                    <span className="text-[11px] text-destructive block mt-0.5">
                      {borrowTermsManager.amountValidationError}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Funding Deadline (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={cutoffDaysInput}
                      onChange={(e) => setCutoffDaysInput(e.target.value)}
                      placeholder={
                        activeCutoff > 0
                          ? `Current: ${Math.max(0, Math.round((activeCutoff - nowSec) / 86400))} days`
                          : 'e.g. 7 (0 for none)'
                      }
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="borrow-credit-cutoff"
                    />
                    <span className="text-[11px] text-muted-foreground block mt-1">
                      Days until lending closes.
                    </span>
                    {borrowTermsManager.cutoffValidationError && (
                      <span className="text-[11px] text-destructive block mt-0.5">
                        {borrowTermsManager.cutoffValidationError}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Loan Maturity (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maturityDaysInput}
                      onChange={(e) => setMaturityDaysInput(e.target.value)}
                      placeholder={
                        activeMaturity > 0
                          ? `Current: ${Math.max(0, Math.round((activeMaturity - nowSec) / 86400))} days`
                          : 'e.g. 30 (0 for instant)'
                      }
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="borrow-credit-maturity"
                    />
                    <span className="text-[11px] text-muted-foreground block mt-1">
                      Days lock before payback is allowed.
                    </span>
                    {borrowTermsManager.maturityValidationError && (
                      <span className="text-[11px] text-destructive block mt-0.5">
                        {borrowTermsManager.maturityValidationError}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Multiplier Ratio (x)
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={multiplierInput}
                      onChange={(e) => setMultiplierInput(e.target.value)}
                      placeholder={`Current: ${activeMultiplier}x`}
                      className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="borrow-credit-multiplier"
                    />
                    <span className="text-[11px] text-muted-foreground block mt-1">
                      1.000 = 1:1 parity (1000 fixed-point).
                    </span>
                    {borrowTermsManager.multiplierValidationError && (
                      <span className="text-[11px] text-destructive block mt-0.5">
                        {borrowTermsManager.multiplierValidationError}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => borrowTermsManager.updateBorrowTerms()}
                    disabled={!canOperate || borrowTermsManager.isDisabled}
                    loading={borrowTermsManager.isSending}
                    fullWidth
                    data-testid="borrow-credit-submit"
                  >
                    Update {selectedToken.symbol} Borrowing Terms
                  </Button>
                </div>
              </div>
            </div>
          )}
        </MemberGuard>
      </div>
    </NewLayout>
  );
};
