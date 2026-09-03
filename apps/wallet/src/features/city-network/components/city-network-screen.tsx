/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet } from '@demo/wallet-core';
import { Address } from '@ton/core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import { getH3ViewerUrl } from '@/core/utils/h3';
import { MemberGuard, ActivationBanner } from '@/features/brotherhood';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

import {
  useLocation,
  useLocationByH3Cell,
  calculateLocationAddress,
} from '../hooks/use-cities';
import { useLocationMembers } from '../hooks/use-city-members';

type Tab = 'cities' | 'city-detail' | 'register-city' | 'manage-member';

export const CityNetworkScreen: React.FC = () => {
  const navigate = useNavigate();
  const { network, formatContractAddress } = useFormatAddress();
  const { address } = useWallet();
  const account = useFiAccount(address ?? null);

  const [activeTab, setActiveTab] = useState<Tab>('cities');

  // Connected wallet's H3 cell from fiwallet state
  const myH3Cell = account.data?.h3Cell || '';

  // Tab 1: H3 Cell Input & Query
  const [h3CellInput, setH3CellInput] = useState('');
  const [hasInitializedH3, setHasInitializedH3] = useState(false);

  // Tab 2: Raw Contract Address Lookup
  const [locationAddrInput, setLocationAddrInput] = useState('');

  // Tab 3: Calculate / Deploy Tool
  const [minterAddrInput, setMinterAddrInput] = useState(FI_ADDRESS);
  const [calcH3CellInput, setCalcH3CellInput] = useState('');

  // Tab 4: Verify Member
  const [verifyLocationAddr, setVerifyLocationAddr] = useState('');
  const [targetMember, setTargetMember] = useState('');

  // Prefill Tab 1 with connected wallet's H3 cell once loaded
  useEffect(() => {
    if (myH3Cell && !hasInitializedH3) {
      setH3CellInput(myH3Cell);
      setHasInitializedH3(true);
    }
  }, [myH3Cell, hasInitializedH3]);

  // Queries
  const locationByH3Query = useLocationByH3Cell(h3CellInput);
  const rawLocationQuery = useLocation(locationAddrInput);
  const locationMembersQuery = useLocationMembers(
    verifyLocationAddr || locationAddrInput,
    targetMember,
  );

  // Calculated address preview in Tab 3
  const calculatedTab3Address = React.useMemo(() => {
    if (!minterAddrInput || !calcH3CellInput.trim()) return null;
    try {
      const minter = Address.parse(minterAddrInput);
      return calculateLocationAddress(calcH3CellInput.trim(), minter).toString();
    } catch {
      return null;
    }
  }, [minterAddrInput, calcH3CellInput]);

  const isCalculateEnabled = Boolean(minterAddrInput && calcH3CellInput.trim());

  return (
    <MemberGuard title="Location & Spatial Network">
      <NewLayout
        header={
          <ScreenHeader
            title="Location & Spatial Network"
            onBack={() => navigate('/wallet')}
          />
        }
      >
        <div className="space-y-4">
          <ActivationBanner />

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
            {(
              [
                'cities',
                'city-detail',
                'register-city',
                'manage-member',
              ] as Tab[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid={`city-tab-${tab}`}
              >
                {tab === 'cities'
                  ? 'Location Info'
                  : tab === 'city-detail'
                    ? 'Members'
                    : tab === 'register-city'
                      ? 'Calculate'
                      : 'Verify'}
              </button>
            ))}
          </div>

          {/* Tab 1: Location Info (H3 Spatial Cell Driven) */}
          {activeTab === 'cities' && (
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
                      {formatContractAddress(
                        locationByH3Query.calculatedAddress,
                      )}
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
                        Registered Members ({locationByH3Query.data.members.length})
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
                          return (
                            <div
                              key={m}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded-xl border border-border/50 text-xs gap-2"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-foreground break-all text-[11px]">
                                  {formatContractAddress(m)}
                                </span>
                                {isYou && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                              <CopyButton
                                address={m}
                                type="contract"
                                size="xs"
                              />
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
          )}

          {/* Tab 2: Raw Address Lookup */}
          {activeTab === 'city-detail' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Location Contract Address Lookup
              </h3>
              <InputScan
                value={locationAddrInput}
                onChange={setLocationAddrInput}
                placeholder={`Location Contract Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
                className="mb-2"
                data-testid="city-citymap-input"
              />

              <div className="flex justify-between items-center my-2">
                <span className="text-xs font-semibold text-foreground">
                  Contract Details
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => rawLocationQuery.refetch()}
                  disabled={rawLocationQuery.isLoading}
                >
                  Refresh
                </Button>
              </div>

              {rawLocationQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">
                  Querying location contract…
                </p>
              ) : rawLocationQuery.location ? (
                <div className="space-y-3">
                  {rawLocationQuery.location.h3Cell && (
                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">
                          H3 Spatial Cell
                        </span>
                        <a
                          href={getH3ViewerUrl(rawLocationQuery.location.h3Cell)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-semibold text-blue-500 hover:underline text-xs"
                        >
                          {rawLocationQuery.location.h3Cell} ↗
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        Indexed Members
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {rawLocationQuery.location.memberCount ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        Contract Version
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {rawLocationQuery.location.version ?? 0}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-xs text-foreground pt-1">
                    Registered Members ({rawLocationQuery.location.members.length})
                  </h4>
                  {rawLocationQuery.location.members.length > 0 ? (
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {rawLocationQuery.location.members.map((m) => (
                        <div
                          key={m}
                          className="flex items-center justify-between p-2 bg-secondary/50 rounded-xl border border-border/50 text-xs gap-2"
                        >
                          <span className="font-mono text-foreground break-all text-[11px]">
                            {formatContractAddress(m)}
                          </span>
                          <CopyButton address={m} type="contract" size="xs" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No members registered in this location contract.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {locationAddrInput
                    ? 'No data found for this location address.'
                    : 'Enter a location contract address above.'}
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Calculate Location Address */}
          {activeTab === 'register-city' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Calculate Location Address
              </h3>
              <p className="text-xs text-muted-foreground">
                Derive the deterministic StateInit and address for any H3 cell using 8-bit shard depth matching the Minter.
              </p>
              <div className="space-y-2">
                <InputScan
                  value={minterAddrInput}
                  onChange={setMinterAddrInput}
                  placeholder={`Minter Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
                  data-testid="city-register-location-addr"
                />
                <input
                  type="text"
                  value={calcH3CellInput}
                  onChange={(e) => setCalcH3CellInput(e.target.value)}
                  placeholder="H3 Spatial Index (e.g. 8828308281fffff)"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="city-register-city-name"
                />
              </div>

              {calculatedTab3Address && (
                <div className="p-3 bg-secondary/50 border border-border/70 rounded-xl space-y-1.5 text-xs">
                  <span className="text-muted-foreground text-[10px] font-medium block">
                    Calculated Location Contract Address
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-foreground text-[11px] break-all">
                      {formatContractAddress(calculatedTab3Address)}
                    </span>
                    <CopyButton
                      address={calculatedTab3Address}
                      type="contract"
                      size="xs"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setH3CellInput(calcH3CellInput.trim());
                  setActiveTab('cities');
                }}
                disabled={!isCalculateEnabled}
                fullWidth
                data-testid="city-register-city-submit"
              >
                Inspect in Location Info
              </Button>
            </div>
          )}

          {/* Tab 4: Verify Member Status */}
          {activeTab === 'manage-member' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Verify Member in Location
              </h3>
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
          )}
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
