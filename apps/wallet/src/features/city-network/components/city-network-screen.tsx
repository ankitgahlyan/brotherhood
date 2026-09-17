/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet } from '@demo/wallet-core';
import { Address } from '@ton/core';
import { ExternalLink, Loader2, Search, X } from 'lucide-react';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { RefreshButton } from '@/core/components/ui/refresh-button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import {
  useFormatAddress,
  formatTonAddress,
  sameAddress,
} from '@/core/utils/formatters';
import {
  getH3ViewerUrl,
  isValidH3Cell,
  normalizeH3Cell,
} from '@/core/utils/h3';
import { openTelegramProfile } from '@/core/utils/telegram';
import { MemberGuard, ActivationBanner } from '@/features/brotherhood';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useMemberProfiles } from '@/features/brotherhood/hooks/use-member-profiles';
import { getFiWalletAddress } from '@/lib/brotherhood/ton';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';

import { useLocationByH3Cell } from '../hooks/use-cities';
import { useLocationMembers } from '../hooks/use-city-members';

export const CityNetworkScreen: React.FC = () => {
  const navigate = useNavigate();
  const { network, formatContractAddress, formatWalletAddress } =
    useFormatAddress();
  const { address } = useWallet();
  const account = useFiAccount(address ?? null);

  // Connected wallet's H3 cell from fiwallet state
  const myH3Cell = account.data?.h3Cell || '';

  // Spatial Cell Input & Query
  const [h3CellInput, setH3CellInput] = useState('');
  const [queriedH3Cell, setQueriedH3Cell] = useState('');
  const [hasInitializedH3, setHasInitializedH3] = useState(false);

  // Verify Member Tool
  const [verifyLocationAddr, setVerifyLocationAddr] = useState('');
  const [targetMember, setTargetMember] = useState('');

  // Member Search Query
  const [memberSearch, setMemberSearch] = useState('');

  // Prefill H3 cell with connected wallet's cell once loaded
  useEffect(() => {
    if (myH3Cell && !hasInitializedH3) {
      const normalized = normalizeH3Cell(myH3Cell);
      setH3CellInput(normalized);
      if (isValidH3Cell(normalized)) {
        setQueriedH3Cell(normalized);
      }
      setHasInitializedH3(true);
    }
  }, [myH3Cell, hasInitializedH3]);

  // Queries - only executed for confirmed valid H3 cells
  const locationByH3Query = useLocationByH3Cell(queriedH3Cell);

  const isInputValid = isValidH3Cell(h3CellInput);
  const showValidationError = h3CellInput.trim().length > 0 && !isInputValid;

  const handleQueryCell = () => {
    if (!isInputValid) return;
    setQueriedH3Cell(normalizeH3Cell(h3CellInput));
  };

  const handleResetToMyCell = () => {
    if (!myH3Cell) return;
    const normalized = normalizeH3Cell(myH3Cell);
    setH3CellInput(normalized);
    if (isValidH3Cell(normalized)) {
      setQueriedH3Cell(normalized);
    }
  };

  // Auto-populate verify location address with current calculated location if empty
  useEffect(() => {
    if (locationByH3Query.calculatedAddress && !verifyLocationAddr) {
      setVerifyLocationAddr(locationByH3Query.calculatedAddress);
    }
  }, [locationByH3Query.calculatedAddress, verifyLocationAddr]);

  const locationMembersQuery = useLocationMembers(
    verifyLocationAddr || locationByH3Query.calculatedAddress || '',
    targetMember,
  );

  // Member profiles hydration: Location stores member owner addresses.
  // Derive both owner and deterministic FiWallet contract addresses so profiles are resolved.
  const rawMembers = locationByH3Query.data?.members || [];
  const memberLookupAddresses = useMemo(() => {
    const net = network === 'mainnet' ? 'mainnet' : 'testnet';
    const list: string[] = [];
    for (const m of rawMembers) {
      list.push(m);
      try {
        const fiAddr = getFiWalletAddress(Address.parse(m), net);
        list.push(fiAddr.toString());
      } catch {
        /* ignore derivation error */
      }
    }
    return list;
  }, [rawMembers, network]);

  const memberProfilesQuery = useMemberProfiles(memberLookupAddresses, network);
  const profiles = memberProfilesQuery.data || {};

  // Helper to retrieve profile username for a given member address
  const getMemberProfile = (memberAddr: string) => {
    let p = profiles[memberAddr];
    if (p?.username) return p;
    try {
      const net = network === 'mainnet' ? 'mainnet' : 'testnet';
      const fiAddr = getFiWalletAddress(
        Address.parse(memberAddr),
        net,
      ).toString();
      p = profiles[fiAddr] || p;
    } catch {
      /* ignore */
    }
    return p;
  };

  // Filter members by search input (matching username or address)
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return rawMembers;
    return rawMembers.filter((m) => {
      const p = getMemberProfile(m);
      const uname = (p?.username || '').toLowerCase();
      const addrStr = m.toLowerCase();
      const formatted = formatWalletAddress(m).toLowerCase();
      const contractFormatted = formatContractAddress(m).toLowerCase();
      return (
        uname.includes(q) ||
        addrStr.includes(q) ||
        formatted.includes(q) ||
        contractFormatted.includes(q)
      );
    });
  }, [
    rawMembers,
    memberSearch,
    profiles,
    formatWalletAddress,
    formatContractAddress,
    getMemberProfile,
  ]);

  return (
    <MemberGuard title="Location & Spatial Network">
      <NewLayout
        header={
          <ScreenHeader
            title="Location & Spatial Network"
            onBack={() => navigate('/wallet')}
            rightElement={<SyncStatusButton />}
          />
        }
      >
        <div className="space-y-4">
          <ActivationBanner />

          {/* Location Spatial Inspector */}
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h3 className="font-semibold text-base">
                  Location Spatial Inspector
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Query spatial cell metadata and registered members
                </p>
              </div>
              {locationByH3Query.calculatedAddress && (
                <CopyButton
                  address={locationByH3Query.calculatedAddress}
                  type="contract"
                  size="xs"
                />
              )}
            </div>

            {/* H3 Spatial Cell Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  H3 Spatial Cell Index
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={getH3ViewerUrl(queriedH3Cell || h3CellInput)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    <span>Viewer</span> ↗
                  </a>
                  {myH3Cell && h3CellInput !== myH3Cell && (
                    <button
                      type="button"
                      onClick={handleResetToMyCell}
                      className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Reset to My Cell
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={h3CellInput}
                  onChange={(e) => setH3CellInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isInputValid) {
                      handleQueryCell();
                    }
                  }}
                  placeholder="H3 Spatial Index (e.g. 8828308281fffff)"
                  className={`w-full p-2.5 border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    showValidationError
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-border focus:ring-blue-500'
                  }`}
                  data-testid="city-location-input"
                />
                <Button
                  type="button"
                  onClick={handleQueryCell}
                  disabled={!isInputValid || locationByH3Query.isLoading}
                  size="sm"
                  className="shrink-0 px-3.5"
                  data-testid="city-location-query-btn"
                >
                  {locationByH3Query.isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5 mr-1" />
                  )}
                  Query
                </Button>
              </div>
              {showValidationError && (
                <p className="text-[11px] text-destructive">
                  Enter a valid 15-character hex H3 cell (e.g. 882681a339fffff).
                </p>
              )}
            </div>

            {/* Derived Location Contract Address Card */}
            {locationByH3Query.calculatedAddress && (
              <div className="p-3 bg-secondary/50 border border-border/70 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[10px] font-medium">
                    Calculated Location Address (StateInit)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      locationByH3Query.data?.isDeployed
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {locationByH3Query.data?.isDeployed
                      ? 'Active On-Chain'
                      : 'Auto-Deploy on Join'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-foreground text-[11px] break-all">
                    {formatContractAddress(locationByH3Query.calculatedAddress)}
                  </span>
                  <CopyButton
                    address={locationByH3Query.calculatedAddress}
                    type="contract"
                    size="xs"
                  />
                </div>
              </div>
            )}

            {/* Spatial Cell Details & Refresh */}
            <div className="flex justify-between items-center my-2">
              <span className="text-xs font-semibold text-foreground">
                Spatial Cell Details
              </span>
              <RefreshButton
                onRefresh={locationByH3Query.refetch}
                disabled={!queriedH3Cell}
                testId="city-location-refresh-btn"
              />
            </div>

            {locationByH3Query.isLoading ? (
              <p className="text-xs text-muted-foreground">
                Querying location contract getters…
              </p>
            ) : locationByH3Query.data ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                    <span className="text-muted-foreground block text-[10px]">
                      Indexed Members
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {locationByH3Query.data.memberCount}
                    </span>
                  </div>
                  <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                    <span className="text-muted-foreground block text-[10px]">
                      Contract Version
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {locationByH3Query.data.version !== null
                        ? `v${locationByH3Query.data.version}`
                        : 'v0.2.0'}
                    </span>
                  </div>
                </div>

                {/* Registered Members List */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-foreground">
                      Registered Members (
                      {locationByH3Query.data.members.length})
                    </h4>
                    {myH3Cell === queriedH3Cell && myH3Cell !== '' && (
                      <span className="text-[10px] text-muted-foreground">
                        Your Cell
                      </span>
                    )}
                  </div>

                  {/* Real-time Member Search Input */}
                  {rawMembers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Search member by username or address..."
                        className="w-full pl-8 pr-8 py-1.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {memberSearch && (
                        <button
                          type="button"
                          onClick={() => setMemberSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Clear search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {rawMembers.length > 0 ? (
                    filteredMembers.length > 0 ? (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {filteredMembers.map((m) => {
                          let isYou = false;
                          if (address) {
                            try {
                              isYou = Address.parse(m).equals(
                                Address.parse(address),
                              );
                            } catch {
                              /* ignore parse error */
                            }
                          }

                          // Retrieve profile username if hydrated
                          const profile = getMemberProfile(m);
                          const username = profile?.username?.trim();

                          return (
                            <div
                              key={m}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded-xl border border-border/50 text-xs gap-2"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {username ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openTelegramProfile(username)
                                    }
                                    className="inline-flex items-center gap-0.5 font-medium text-blue-500 hover:underline shrink-0 text-[11px] cursor-pointer"
                                    title={`Open @${username} on Telegram`}
                                  >
                                    <span>@{username}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                ) : null}
                                <span className="font-mono text-foreground break-all text-[11px]">
                                  {formatWalletAddress(m)}
                                </span>
                                {isYou && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                              <CopyButton address={m} type="wallet" size="xs" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2 text-center">
                        No members matching &ldquo;{memberSearch}&rdquo;
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground py-1">
                      {locationByH3Query.data.isDeployed
                        ? 'No members registered in this location contract.'
                        : 'This H3 spatial cell has not yet had any members join.'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {queriedH3Cell
                  ? locationByH3Query.isLoading
                    ? 'Loading location contract data…'
                    : 'No data found for this H3 spatial cell.'
                  : 'Enter an H3 spatial cell index above and click Query to inspect.'}
              </p>
            )}
          </div>
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
