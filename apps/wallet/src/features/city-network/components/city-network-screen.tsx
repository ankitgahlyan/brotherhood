/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import { MemberGuard, ActivationBanner } from '@/features/brotherhood';

import { useLocation } from '../hooks/use-cities';
import { useLocationMembers } from '../hooks/use-city-members';

type Tab = 'cities' | 'city-detail' | 'register-city' | 'manage-member';

export const CityNetworkScreen: React.FC = () => {
  const navigate = useNavigate();
  const { network, formatContractAddress } = useFormatAddress();

  const [activeTab, setActiveTab] = useState<Tab>('cities');

  const [locationAddrInput, setLocationAddrInput] = useState('');
  const [cityMapAddrInput, setCityMapAddrInput] = useState('');
  const [minterAddrInput, setMinterAddrInput] = useState('');
  const [h3CellInput, setH3CellInput] = useState('');
  const [targetMember, setTargetMember] = useState('');

  const locationQuery = useLocation(locationAddrInput);
  const locationMembersQuery = useLocationMembers(
    cityMapAddrInput,
    targetMember,
  );

  const isCalculateEnabled = Boolean(minterAddrInput && h3CellInput);

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

          {/* Location Info */}
          {activeTab === 'cities' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-base">
                  Location Contract Inspector
                </h3>
                {locationAddrInput && (
                  <CopyButton
                    address={locationAddrInput}
                    type="contract"
                    size="xs"
                  />
                )}
              </div>
              <InputScan
                value={locationAddrInput}
                onChange={setLocationAddrInput}
                placeholder={`Location Contract Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
                className="mb-2"
                data-testid="city-location-input"
              />

              <div className="flex justify-between items-center my-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Spatial Cell Details
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => locationQuery.refetch()}
                >
                  Refresh
                </Button>
              </div>

              {locationQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">
                  Querying location contract…
                </p>
              ) : locationQuery.location ? (
                <div className="space-y-2">
                  <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                    <span className="text-muted-foreground block text-[10px]">
                      H3 Spatial Cell
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {locationQuery.location.h3Cell || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        Indexed Members
                      </span>
                      <span className="font-semibold text-foreground">
                        {locationQuery.location.memberCount ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        Contract Version
                      </span>
                      <span className="font-semibold text-foreground">
                        {locationQuery.location.version ?? 0}
                      </span>
                    </div>
                  </div>
                  {locationQuery.location.minterAddress && (
                    <div className="p-2.5 border border-border/60 rounded-xl bg-secondary/50 text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        Minter Address
                      </span>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span className="font-mono text-foreground text-[11px] break-all">
                          {formatContractAddress(
                            locationQuery.location.minterAddress,
                          )}
                        </span>
                        <CopyButton
                          address={locationQuery.location.minterAddress}
                          type="contract"
                          size="xs"
                        />
                      </div>
                    </div>
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

          {/* Location Members */}
          {activeTab === 'city-detail' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Location Members List
              </h3>
              <InputScan
                value={cityMapAddrInput}
                onChange={setCityMapAddrInput}
                placeholder="Location Contract Address (0Q...)"
                className="mb-2"
                data-testid="city-citymap-input"
              />

              {locationMembersQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">
                  Querying location members…
                </p>
              ) : (
                <div className="space-y-2">
                  {locationMembersQuery.h3Cell && (
                    <div className="bg-secondary/50 border border-border/50 p-2.5 rounded-xl text-xs">
                      <span className="text-muted-foreground block text-[10px]">
                        H3 Cell
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {locationMembersQuery.h3Cell}
                      </span>
                    </div>
                  )}

                  <h4 className="font-semibold text-xs text-foreground pt-1">
                    Registered Members ({locationMembersQuery.members.length})
                  </h4>
                  {locationMembersQuery.members.length > 0 ? (
                    <div className="space-y-1">
                      {locationMembersQuery.members.map((m) => (
                        <div
                          key={m}
                          className="p-2 bg-secondary/50 rounded-xl border border-border/50 text-xs font-mono text-foreground break-all"
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No members registered in this location contract.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Calculate Location */}
          {activeTab === 'register-city' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Calculate Location Cell
              </h3>
              <div className="space-y-2">
                <InputScan
                  value={minterAddrInput}
                  onChange={setMinterAddrInput}
                  placeholder={`Minter Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
                  data-testid="city-register-location-addr"
                />
                <input
                  type="text"
                  value={h3CellInput}
                  onChange={(e) => setH3CellInput(e.target.value)}
                  placeholder="H3 Spatial Index (e.g. 882681a339fffff)"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="city-register-city-name"
                />
              </div>
              <Button
                onClick={() => {
                  setLocationAddrInput(minterAddrInput);
                  setActiveTab('cities');
                }}
                disabled={!isCalculateEnabled}
                fullWidth
                data-testid="city-register-city-submit"
              >
                Inspect Location
              </Button>
            </div>
          )}

          {/* Verify Member Status */}
          {activeTab === 'manage-member' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Verify Member in Location
              </h3>
              <div className="space-y-2">
                <InputScan
                  value={cityMapAddrInput}
                  onChange={setCityMapAddrInput}
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
                  disabled={!cityMapAddrInput || !targetMember}
                  fullWidth
                  data-testid="city-manage-register-submit"
                >
                  Check Membership Status
                </Button>
                {locationMembersQuery.isTargetMember !== null && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${locationMembersQuery.isTargetMember ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}
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
