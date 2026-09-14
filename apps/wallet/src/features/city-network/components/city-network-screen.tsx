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
import { ExternalLink } from 'lucide-react';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { getH3ViewerUrl } from '@/core/utils/h3';
import { openTelegramProfile } from '@/core/utils/telegram';
import { MemberGuard, ActivationBanner } from '@/features/brotherhood';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useMemberProfiles } from '@/features/brotherhood/hooks/use-member-profiles';
import { SyncStatusButton } from '@/features/dashboard/components/sync-status-button';

import { useLocationByH3Cell } from '../hooks/use-cities';
import { useLocationMembers } from '../hooks/use-city-members';

export const CityNetworkScreen: React.FC = () => {
  const navigate = useNavigate();
  const { network, formatContractAddress } = useFormatAddress();
  const { address } = useWallet();
  const account = useFiAccount(address ?? null);

  // Connected wallet's H3 cell from fiwallet state
  const myH3Cell = account.data?.h3Cell || '';

  // Spatial Cell Input & Query
  const [h3CellInput, setH3CellInput] = useState('');
  const [hasInitializedH3, setHasInitializedH3] = useState(false);

  // Verify Member Tool
  const [verifyLocationAddr, setVerifyLocationAddr] = useState('');
  const [targetMember, setTargetMember] = useState('');

  // Prefill H3 cell with connected wallet's cell once loaded
  useEffect(() => {
    if (myH3Cell && !hasInitializedH3) {
      setH3CellInput(myH3Cell);
      setHasInitializedH3(true);
    }
  }, [myH3Cell, hasInitializedH3]);

  // Queries
  const locationByH3Query = useLocationByH3Cell(h3CellInput);

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

  // Member profiles hydration
  const rawMembers = locationByH3Query.data?.members || [];
  const memberProfilesQuery = useMemberProfiles(rawMembers, network);
  const profiles = memberProfilesQuery.data || {};

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
                    href={getH3ViewerUrl(h3CellInput)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    <span>Viewer</span> ↗
                  </a>
                  {myH3Cell && h3CellInput !== myH3Cell && (
                    <button
                      type="button"
                      onClick={() => setH3CellInput(myH3Cell)}
                      className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Reset to My Cell
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={h3CellInput}
                onChange={(e) => setH3CellInput(e.target.value)}
                placeholder="H3 Spatial Index (e.g. 8828308281fffff)"
                className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="city-location-input"
              />
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
              <Button
                size="sm"
                variant="secondary"
                onClick={() => locationByH3Query.refetch()}
                disabled={locationByH3Query.isLoading}
              >
                Refresh
              </Button>
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

                {locationByH3Query.data.minterAddress && (
                  <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                    <span className="text-muted-foreground block text-[10px]">
                      Minter Address
                    </span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-foreground text-[11px] break-all">
                        {formatContractAddress(
                          locationByH3Query.data.minterAddress,
                        )}
                      </span>
                      <CopyButton
                        address={locationByH3Query.data.minterAddress}
                        type="contract"
                        size="xs"
                      />
                    </div>
                  </div>
                )}

                {/* Registered Members List */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-foreground">
                      Registered Members (
                      {locationByH3Query.data.members.length})
                    </h4>
                    {myH3Cell === h3CellInput && myH3Cell !== '' && (
                      <span className="text-[10px] text-muted-foreground">
                        Your Cell
                      </span>
                    )}
                  </div>

                  {locationByH3Query.data.members.length > 0 ? (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {locationByH3Query.data.members.map((m) => {
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
                        const profile =
                          profiles[m] ||
                          (() => {
                            try {
                              const normalized = formatTonAddress(
                                Address.parse(m),
                                { isContract: true, network },
                              );
                              return profiles[normalized];
                            } catch {
                              return undefined;
                            }
                          })();
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
                                  onClick={() => openTelegramProfile(username)}
                                  className="inline-flex items-center gap-0.5 font-medium text-blue-500 hover:underline shrink-0 text-[11px] cursor-pointer"
                                  title={`Open @${username} on Telegram`}
                                >
                                  <span>@{username}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              ) : null}
                              <span className="font-mono text-foreground break-all text-[11px]">
                                {formatContractAddress(m)}
                              </span>
                              {isYou && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <CopyButton address={m} type="contract" size="xs" />
                          </div>
                        );
                      })}
                    </div>
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
                {h3CellInput
                  ? 'Calculating location contract address…'
                  : 'Enter an H3 spatial cell index above to inspect.'}
              </p>
            )}
          </div>

          {/* Verify Member Status Tool */}
          <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
            <h3 className="font-semibold text-base mb-1">
              Verify Member in Location
            </h3>
            <p className="text-xs text-muted-foreground">
              Check if an address is registered on-chain in this location
              contract.
            </p>
            <div className="space-y-2">
              <InputScan
                value={verifyLocationAddr}
                onChange={setVerifyLocationAddr}
                placeholder={`Location Contract Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
                data-testid="city-manage-citymap-addr"
              />
              <InputScan
                value={targetMember}
                onChange={setTargetMember}
                placeholder={`Target Member Address (${network === 'mainnet' ? 'UQ...' : '0Q...'})`}
                data-testid="city-manage-target-member"
              />
            </div>
            <div className="space-y-2 pt-1">
              <Button
                onClick={() => locationMembersQuery.refetch()}
                disabled={!verifyLocationAddr || !targetMember}
                fullWidth
                data-testid="city-manage-register-submit"
              >
                Check Membership Status
              </Button>
              {locationMembersQuery.isTargetMember !== null && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    locationMembersQuery.isTargetMember
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}
                >
                  {locationMembersQuery.isTargetMember
                    ? 'Address is an active member in this location!'
                    : 'Address is NOT a member in this location.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
