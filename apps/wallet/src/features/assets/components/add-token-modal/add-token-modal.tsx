/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { Address, Cell } from '@ton/core';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Copy,
  Eye,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Search,
  Shield,
  User,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@demo/wallet-core';

import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { useExplorer, getExplorerAddressUrl } from '@/core/explorer';
import {
  formatLargeValue,
  formatTonAddress,
  sameAddress,
  toDecimal,
} from '@/core/utils';
import { getCountryByCode } from '@/lib/brotherhood/countries';
import { getH3ViewerUrl, normalizeH3Cell } from '@/core/utils/h3';
import { useAddressUsernameResolution } from '@/core/hooks/use-address-username-resolution';
import { calculateLocationAddress } from '@/features/city-network/hooks/use-cities';
import { parseOnchainMetadataCell } from '@/lib/brotherhood/jettonContent';
import {
  batchHydrateUniversal,
  computePersonalWalletAddress,
  detectKnownType,
  getCachedRawAccountState,
  type KnownContractType,
} from '@/lib/brotherhood/account-state-hydrator';
import { getFiWalletAddress, isZeroAddress } from '@/lib/brotherhood/ton';
import { type Network } from '@/lib/brotherhood/config';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InspectorTab =
  'overview' | 'fiwallet' | 'pt-minter' | 'pt-wallet' | 'location';

interface InspectedEntityBundle {
  inputTypeLabel: string;
  ownerAddress: Address;
  ownerBalanceNano: bigint;
  ownerStatus: string;
  fiWalletAddress: Address;
  fiWalletBalanceNano: bigint;
  fiWalletStore: any | null;
  ptMinterAddress: Address | null;
  ptMinterBalanceNano: bigint;
  ptMinterStore: any | null;
  ptMeta: {
    name?: string;
    symbol?: string;
    description?: string;
    image?: string;
  };
  ptWalletAddress: Address | null;
  ptWalletBalanceNano: bigint;
  ptWalletStore: any | null;
  h3Cell: string;
  countryCode: number;
  locationAddress: Address | null;
  locationBalanceNano: bigint;
  locationStore: any | null;
  username: string;
}

function readUsernameFromCell(cell?: Cell | null): string {
  if (!cell) return '';
  try {
    const slice = cell.beginParse();
    if (slice.remainingBits === 0 && slice.remainingRefs === 0) return '';
    return slice.loadStringTail().replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    address: currentWalletAddress,
    savedWallets,
    activeWalletId,
    addWatchOnlyWallet,
    switchWallet,
  } = useWallet();
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const net: Network =
    activeWallet?.network === 'mainnet' ? 'mainnet' : 'testnet';
  const { explorer } = useExplorer();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [isInspecting, setIsInspecting] = useState(false);
  const [isAddingWatch, setIsAddingWatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bundle, setBundle] = useState<InspectedEntityBundle | null>(null);

  const resolution = useAddressUsernameResolution({
    value: query,
    onChange: setQuery,
    enabled: Boolean(isOpen && query.trim()),
  });

  const resolvedTargetString =
    resolution.resolvedAddress ||
    resolution.resolvedDnsAddress ||
    (resolution.isDirectAddress ? resolution.trimmed : null);

  const handleReset = () => {
    setQuery('');
    setActiveTab('overview');
    setIsInspecting(false);
    setIsAddingWatch(false);
    setErrorMessage(null);
    setBundle(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetStr = resolvedTargetString || query.trim();
    if (!targetStr || isInspecting) return;

    let parsedInput: Address;
    try {
      parsedInput = Address.parse(targetStr);
    } catch {
      setErrorMessage(
        resolution.isResolving
          ? 'Still resolving domain/username on-chain… please wait a moment.'
          : 'Enter a valid TON address, .bro domain, or @username.',
      );
      return;
    }

    setIsInspecting(true);
    setErrorMessage(null);

    try {
      // Step 1: Hydrate the input address to detect what kind of contract/wallet it is
      const step1 = await batchHydrateUniversal([parsedInput], net, {
        force: true,
      });
      const canonInput = parsedInput.toString();
      const rawAcc1 = getCachedRawAccountState(parsedInput, net);
      const detectedType: KnownContractType | null = detectKnownType(
        rawAcc1?.code_hash,
        rawAcc1?.interfaces,
      );
      const store1 = step1.decodedStores?.[canonInput] ?? null;

      let ownerAddress: Address = parsedInput;
      let inputTypeLabel = 'Wallet Address';
      let knownPtMinter: Address | null = null;
      let knownPtWallet: Address | null = null;
      let knownLocation: Address | null = null;

      if (detectedType === 'fiWallet' && store1?.owner) {
        ownerAddress =
          store1.owner instanceof Address
            ? store1.owner
            : Address.parse(String(store1.owner));
        inputTypeLabel = 'FiWallet Contract';
      } else if (detectedType === 'personalMinter') {
        inputTypeLabel = 'Personal Token Minter';
        knownPtMinter = parsedInput;
        if (store1?.adminAddress && !isZeroAddress(store1.adminAddress)) {
          ownerAddress =
            store1.adminAddress instanceof Address
              ? store1.adminAddress
              : Address.parse(String(store1.adminAddress));
        }
      } else if (detectedType === 'personalWallet') {
        inputTypeLabel = 'Personal Token Wallet';
        knownPtWallet = parsedInput;
        if (store1?.owner && !isZeroAddress(store1.owner)) {
          ownerAddress =
            store1.owner instanceof Address
              ? store1.owner
              : Address.parse(String(store1.owner));
        }
        if (store1?.minterAddress && !isZeroAddress(store1.minterAddress)) {
          knownPtMinter =
            store1.minterAddress instanceof Address
              ? store1.minterAddress
              : Address.parse(String(store1.minterAddress));
        }
      } else if (detectedType === 'location') {
        inputTypeLabel = 'City Location Contract';
        knownLocation = parsedInput;
        setActiveTab('location');
      } else if (resolution.resolvedDnsAddress) {
        inputTypeLabel = `.bro Domain (${query.trim()})`;
      } else if (resolution.resolvedUsername) {
        inputTypeLabel = `@${resolution.resolvedUsername}`;
      }

      // Step 2: Derive FiWallet for ownerAddress and hydrate Owner + FiWallet + known PT Minter
      const fiWalletAddress = getFiWalletAddress(ownerAddress, net);
      const step2Addresses: Address[] = [ownerAddress, fiWalletAddress];
      const step2KnownTypes: Record<string, KnownContractType> = {
        [ownerAddress.toString()]: 'walletV5R1',
        [fiWalletAddress.toString()]: 'fiWallet',
      };
      if (knownPtMinter) {
        step2Addresses.push(knownPtMinter);
        step2KnownTypes[knownPtMinter.toString()] = 'personalMinter';
      }
      if (knownLocation) {
        step2Addresses.push(knownLocation);
        step2KnownTypes[knownLocation.toString()] = 'location';
      }

      const step2 = await batchHydrateUniversal(step2Addresses, net, {
        knownTypes: step2KnownTypes,
        force: true,
      });
      const fiStore =
        step2.decodedStores?.[fiWalletAddress.toString()] ??
        (detectedType === 'fiWallet' ? store1 : null);

      // Extract PT Minter & H3 Cell from FiWallet if present
      const fiPersonalMinterRaw =
        fiStore?.addresses?.ref?.trustedJettonAddrs?.ref
          ?.personalJettonMinter ?? null;
      const ptMinterAddress: Address | null =
        knownPtMinter ??
        (fiPersonalMinterRaw && !isZeroAddress(fiPersonalMinterRaw)
          ? fiPersonalMinterRaw instanceof Address
            ? fiPersonalMinterRaw
            : Address.parse(String(fiPersonalMinterRaw))
          : null);

      const h3CellNum: bigint | undefined =
        fiStore?.others?.ref?.h3Cell ??
        (detectedType === 'location' ? store1?.h3Cell : undefined);
      const h3CellStr =
        h3CellNum && h3CellNum > 0n
          ? normalizeH3Cell(h3CellNum.toString(16))
          : '';
      const countryCode = Number(fiStore?.others?.ref?.country ?? 0);
      const username = readUsernameFromCell(fiStore?.others?.ref?.username);

      const locationAddress: Address | null =
        knownLocation ??
        (h3CellStr ? calculateLocationAddress(h3CellStr) : null);

      // Step 3: Hydrate PT Minter, PT Wallet (for current user or inspected owner), and Location
      const step3Addresses: Address[] = [];
      const step3KnownTypes: Record<string, KnownContractType> = {};
      let derivedPtWallet: Address | null = knownPtWallet;
      if (ptMinterAddress) {
        step3Addresses.push(ptMinterAddress);
        step3KnownTypes[ptMinterAddress.toString()] = 'personalMinter';
        try {
          const holderOwner = currentWalletAddress
            ? Address.parse(currentWalletAddress)
            : ownerAddress;
          derivedPtWallet =
            knownPtWallet ??
            computePersonalWalletAddress(
              ptMinterAddress,
              holderOwner,
              ownerAddress,
            );
          step3Addresses.push(derivedPtWallet);
          step3KnownTypes[derivedPtWallet.toString()] = 'personalWallet';
        } catch {
          /* ignore */
        }
      }
      if (locationAddress) {
        step3Addresses.push(locationAddress);
        step3KnownTypes[locationAddress.toString()] = 'location';
      }

      const step3 =
        step3Addresses.length > 0
          ? await batchHydrateUniversal(step3Addresses, net, {
              knownTypes: step3KnownTypes,
              force: true,
            })
          : null;

      const allStores = {
        ...(step1.decodedStores ?? {}),
        ...(step2.decodedStores ?? {}),
        ...(step3?.decodedStores ?? {}),
      };
      const allBalances = {
        ...(step1.balances ?? {}),
        ...(step2.balances ?? {}),
        ...(step3?.balances ?? {}),
      };

      const getBal = (addr: Address | null): bigint => {
        if (!addr) return 0n;
        const b =
          allBalances[addr.toString()] ??
          getCachedRawAccountState(addr, net)?.balance;
        try {
          return b ? BigInt(b) : 0n;
        } catch {
          return 0n;
        }
      };

      const ptMinterStore = ptMinterAddress
        ? (allStores[ptMinterAddress.toString()] ?? null)
        : null;
      const ptMeta = parseOnchainMetadataCell(
        ptMinterStore?.metadataUri ?? ptMinterStore?.content,
      );
      const ptWalletStore = derivedPtWallet
        ? (allStores[derivedPtWallet.toString()] ?? null)
        : null;
      const locationStore = locationAddress
        ? (allStores[locationAddress.toString()] ?? null)
        : null;
      const ownerRaw = getCachedRawAccountState(ownerAddress, net);

      setBundle({
        inputTypeLabel,
        ownerAddress,
        ownerBalanceNano: getBal(ownerAddress),
        ownerStatus: ownerRaw?.status || 'uninit',
        fiWalletAddress,
        fiWalletBalanceNano: getBal(fiWalletAddress),
        fiWalletStore: fiStore,
        ptMinterAddress,
        ptMinterBalanceNano: getBal(ptMinterAddress),
        ptMinterStore,
        ptMeta,
        ptWalletAddress: derivedPtWallet,
        ptWalletBalanceNano: getBal(derivedPtWallet),
        ptWalletStore,
        h3Cell:
          h3CellStr ||
          (locationStore?.h3Cell
            ? normalizeH3Cell(BigInt(locationStore.h3Cell).toString(16))
            : ''),
        countryCode,
        locationAddress,
        locationBalanceNano: getBal(locationAddress),
        locationStore,
        username,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to inspect on-chain entity details.',
      );
    } finally {
      setIsInspecting(false);
    }
  };

  const isAlreadySavedWallet = useMemo(() => {
    if (!bundle) return false;
    const ownerStr = bundle.ownerAddress.toString();
    return savedWallets.some(
      (w) => w.network === net && sameAddress(w.address, ownerStr),
    );
  }, [bundle, savedWallets, net]);

  const handleAddWatchOnly = async () => {
    if (!bundle || isAddingWatch) return;
    setIsAddingWatch(true);
    try {
      const ownerFriendly = formatTonAddress(bundle.ownerAddress, {
        isContract: false,
        network: net,
        shorten: false,
      });
      const label = bundle.username
        ? `@${bundle.username}`
        : resolution.resolvedUsername
          ? `@${resolution.resolvedUsername}`
          : query.trim().endsWith('.bro')
            ? query.trim()
            : undefined;
      const walletId = await addWatchOnlyWallet(ownerFriendly, label, net);
      await switchWallet(walletId);
      toast.success(
        `Added ${label || 'Watch-Only Wallet'} (Read-Only, Sending Disabled)`,
      );
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add Watch-Only wallet');
    } finally {
      setIsAddingWatch(false);
    }
  };

  const renderAddressRow = (
    label: string,
    addr: Address | null,
    isContract = true,
  ) => {
    if (!addr) return null;
    const str = formatTonAddress(addr, {
      isContract,
      network: net,
      shorten: false,
    });
    const short = formatTonAddress(addr, {
      isContract,
      network: net,
      shorten: true,
      count: 6,
    });
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-b-0 text-xs">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-mono text-foreground truncate" title={str}>
            {short}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(str, label)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title={`Copy ${label}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <a
            href={getExplorerAddressUrl(net, str, explorer)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="View on Explorer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  };

  const tabs: Array<{ id: InspectorTab; label: string; icon: React.FC<any> }> =
    [
      { id: 'overview', label: 'Overview', icon: User },
      { id: 'fiwallet', label: 'FiWallet', icon: Shield },
      { id: 'pt-minter', label: 'PT Minter', icon: Coins },
      { id: 'pt-wallet', label: 'PT Wallet', icon: Wallet },
      { id: 'location', label: 'Location', icon: MapPin },
    ];

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className="px-2 max-w-md w-full h-[88dvh] max-h-[88dvh] sm:h-[85vh] sm:max-h-[85vh] flex flex-col overflow-hidden"
    >
      <Modal.Header onClose={handleClose} className="shrink-0">
        <Modal.Title className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span>Lookup & Watch-Only Wallet</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="space-y-4 overflow-y-auto min-h-0 flex-1">
        <p className="text-xs text-muted-foreground">
          Enter any TON address, <span className="font-mono">.bro</span> domain,
          or <span className="font-mono">@username</span> to inspect its
          FiWallet, PT Minter, PT Wallet, and Location, or add it as a
          Watch-Only wallet.
        </p>

        <form onSubmit={handleInspect} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              id="universal-entity-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Address, .bro domain, or @username…"
              className="flex-1 min-w-0 bg-secondary/50 border border-border/70 rounded-xl px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              autoFocus
              data-testid="entity-lookup-input"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isInspecting || resolution.isResolving}
              className="shrink-0 flex items-center gap-1.5 cursor-pointer"
              data-testid="entity-lookup-submit"
            >
              {isInspecting || resolution.isResolving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Inspect</span>
            </Button>
          </div>

          {resolvedTargetString && !bundle && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-mono">
                Resolved: {resolvedTargetString}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 font-medium">{errorMessage}</div>
            </div>
          )}
        </form>

        {bundle && (
          <div className="space-y-3 pt-1">
            {/* Category Chips */}
            <div
              role="tablist"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
            >
              {tabs.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                    data-testid={`inspector-tab-${t.id}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Details Panel */}
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-2 text-xs">
              {activeTab === 'overview' && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">
                      Detected Input
                    </span>
                    <span className="font-semibold text-primary">
                      {bundle.inputTypeLabel}
                    </span>
                  </div>
                  {bundle.username && (
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Username</span>
                      <span className="font-semibold text-foreground">
                        @{bundle.username}
                      </span>
                    </div>
                  )}
                  {renderAddressRow('Owner Wallet', bundle.ownerAddress, false)}
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">GRAM Balance</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatLargeValue(
                        String(toDecimal(bundle.ownerBalanceNano, 9)),
                        4,
                      )}{' '}
                      GRAM
                    </span>
                  </div>
                  {renderAddressRow('FiWallet', bundle.fiWalletAddress, true)}
                  {bundle.ptMinterAddress &&
                    renderAddressRow('PT Minter', bundle.ptMinterAddress, true)}
                  {bundle.locationAddress &&
                    renderAddressRow('Location', bundle.locationAddress, true)}
                </>
              )}

              {activeTab === 'fiwallet' && (
                <>
                  {renderAddressRow(
                    'FiWallet Address',
                    bundle.fiWalletAddress,
                    true,
                  )}
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-foreground">
                      {bundle.fiWalletStore
                        ? bundle.fiWalletStore.active
                          ? 'Active Member'
                          : 'Initialized (Inactive)'
                        : 'Not Deployed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">FI Balance</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatLargeValue(
                        String(
                          toDecimal(
                            bundle.fiWalletStore?.jettonBalance ?? 0n,
                            9,
                          ),
                        ),
                        4,
                      )}{' '}
                      FI
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Debt</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatLargeValue(
                        String(toDecimal(bundle.fiWalletStore?.debt ?? 0n, 9)),
                        4,
                      )}{' '}
                      FI
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Votes</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {String(bundle.fiWalletStore?.votes ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Contract GRAM</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatLargeValue(
                        String(toDecimal(bundle.fiWalletBalanceNano, 9)),
                        4,
                      )}{' '}
                      GRAM
                    </span>
                  </div>
                </>
              )}

              {activeTab === 'pt-minter' && (
                <>
                  {bundle.ptMinterAddress ? (
                    <>
                      {renderAddressRow(
                        'PT Minter',
                        bundle.ptMinterAddress,
                        true,
                      )}
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Token</span>
                        <span className="font-semibold text-foreground">
                          {bundle.ptMeta.name || 'Personal Token'} (
                          {bundle.ptMeta.symbol || 'PT'})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">
                          Total Supply
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatLargeValue(
                            String(
                              toDecimal(
                                bundle.ptMinterStore?.totalSupply ?? 0n,
                                9,
                              ),
                            ),
                            2,
                          )}{' '}
                          {bundle.ptMeta.symbol || 'PT'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                          Minter GRAM
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatLargeValue(
                            String(toDecimal(bundle.ptMinterBalanceNano, 9)),
                            4,
                          )}{' '}
                          GRAM
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      No Personal Token Minter linked to this account.
                    </div>
                  )}
                </>
              )}

              {activeTab === 'pt-wallet' && (
                <>
                  {bundle.ptWalletAddress ? (
                    <>
                      {renderAddressRow(
                        'PT Wallet',
                        bundle.ptWalletAddress,
                        true,
                      )}
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">
                          Token Balance
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatLargeValue(
                            String(
                              toDecimal(
                                bundle.ptWalletStore?.jettonBalance ?? 0n,
                                9,
                              ),
                            ),
                            4,
                          )}{' '}
                          {bundle.ptMeta.symbol || 'PT'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                          Contract Status
                        </span>
                        <span className="font-semibold text-foreground">
                          {bundle.ptWalletStore ? 'Deployed' : 'Not Deployed'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      No Personal Token Wallet available.
                    </div>
                  )}
                </>
              )}

              {activeTab === 'location' && (
                <>
                  {bundle.h3Cell || bundle.locationAddress ? (
                    <>
                      {renderAddressRow(
                        'Location Contract',
                        bundle.locationAddress,
                        true,
                      )}
                      {bundle.h3Cell && (
                        <div className="flex items-center justify-between py-1 border-b border-border/50">
                          <span className="text-muted-foreground">H3 Cell</span>
                          <a
                            href={getH3ViewerUrl(bundle.h3Cell)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>{bundle.h3Cell}</span>
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {bundle.countryCode > 0 && (
                        <div className="flex items-center justify-between py-1 border-b border-border/50">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-semibold text-foreground">
                            {getCountryByCode(bundle.countryCode).flag}{' '}
                            {getCountryByCode(bundle.countryCode).name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                          Cell Members
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {bundle.locationStore?.memberCount !== undefined
                            ? String(bundle.locationStore.memberCount)
                            : '0'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      No H3 Location configured for this account.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Watch-Only Wallet Action */}
            <Button
              type="button"
              onClick={handleAddWatchOnly}
              disabled={isAddingWatch || isAlreadySavedWallet}
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
              data-testid="add-watch-only-wallet-btn"
            >
              {isAddingWatch ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Watch-Only Wallet…</span>
                </>
              ) : isAlreadySavedWallet ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Already in Your Wallets</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Add as Watch-Only Wallet</span>
                </>
              )}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal.Container>
  );
};
