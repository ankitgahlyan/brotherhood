/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';

import { useCities } from '../hooks/use-cities';
import { useCityMembers } from '../hooks/use-city-members';
import { useRegisterCity } from '../hooks/use-register-city';
import { useManageMember } from '../hooks/use-manage-member';

type Tab = 'cities' | 'city-detail' | 'register-city' | 'manage-member';

export const CityNetworkScreen: React.FC = () => {
    const navigate = useNavigate();
    const walletKit = useWalletKit();
    const { currentWallet, address } = useWallet();

    const [activeTab, setActiveTab] = useState<Tab>('cities');

    const [locationAddrInput, setLocationAddrInput] = useState('');
    const [cityMapAddrInput, setCityMapAddrInput] = useState('');
    const [newCityName, setNewCityName] = useState('');
    const [targetMember, setTargetMember] = useState('');

    const cities = useCities(locationAddrInput);
    const cityMembers = useCityMembers(cityMapAddrInput);

    const regCity = useRegisterCity({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        locationAddress: locationAddrInput,
        cityName: newCityName,
    });

    const memberMgr = useManageMember({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        cityMapAddress: cityMapAddrInput,
        cityName: newCityName,
        targetMember,
    });

    return (
        <NewLayout header={<ScreenHeader title="City & Location Registry" onBack={() => navigate('/wallet')} />}>
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                    {(['cities', 'city-detail', 'register-city', 'manage-member'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 rounded-md capitalize transition-colors ${
                                activeTab === tab ? 'bg-white shadow text-black' : 'text-gray-600 hover:text-black'
                            }`}
                            data-testid={`city-tab-${tab}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Cities Browser */}
                {activeTab === 'cities' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Regional Location Hub</h3>
                        <InputScan
                            value={locationAddrInput}
                            onChange={setLocationAddrInput}
                            placeholder="Location Hub Address (0Q...)"
                            className="mb-2"
                            data-testid="city-location-input"
                        />

                        <div className="flex justify-between items-center my-2">
                            <span className="text-xs font-medium text-gray-700">Registered Cities</span>
                            <Button size="sm" variant="secondary" onClick={() => cities.refetch()}>
                                Refresh
                            </Button>
                        </div>

                        {cities.isLoading ? (
                            <p className="text-xs text-gray-500">Querying location hub contract…</p>
                        ) : cities.cities.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {cities.cities.map((c) => (
                                    <div key={c.id} className="p-2.5 border rounded-lg bg-gray-50 text-xs">
                                        <span className="font-semibold block">{c.cityName}</span>
                                        <span className="text-gray-400 text-[10px]">ID: {c.id}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                {locationAddrInput ? 'No cities registered under this hub.' : 'Enter a location hub address.'}
                            </p>
                        )}
                    </div>
                )}

                {/* City Detail & Members */}
                {activeTab === 'city-detail' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">CityMap Members</h3>
                        <InputScan
                            value={cityMapAddrInput}
                            onChange={setCityMapAddrInput}
                            placeholder="CityMap Contract Address (0Q...)"
                            className="mb-2"
                            data-testid="city-citymap-input"
                        />

                        {cityMembers.isLoading ? (
                            <p className="text-xs text-gray-500">Querying city map contract…</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="bg-gray-50 p-2.5 rounded-lg text-xs">
                                    <span className="text-gray-500 block">City Name</span>
                                    <span className="font-semibold">{cityMembers.cityName || 'Not loaded'}</span>
                                </div>

                                <h4 className="font-semibold text-xs text-gray-700 pt-1">
                                    Registered Members ({cityMembers.members.length})
                                </h4>
                                {cityMembers.members.length > 0 ? (
                                    <div className="space-y-1">
                                        {cityMembers.members.map((m) => (
                                            <div key={m} className="p-2 bg-gray-50 rounded border text-xs break-all">
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">No members registered in this city map.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Register City */}
                {activeTab === 'register-city' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Register New City</h3>
                        <div className="space-y-2">
                            <InputScan
                                value={locationAddrInput}
                                onChange={setLocationAddrInput}
                                placeholder="Location Hub Address (0Q...)"
                                data-testid="city-register-location-addr"
                            />
                            <input
                                type="text"
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                placeholder="City Name (e.g. Paris)"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="city-register-city-name"
                            />
                        </div>
                        <Button
                            onClick={() => regCity.registerCity()}
                            disabled={regCity.isDisabled}
                            loading={regCity.isSending}
                            fullWidth
                            data-testid="city-register-city-submit"
                        >
                            Register City in Location Hub
                        </Button>
                    </div>
                )}

                {/* Manage Members */}
                {activeTab === 'manage-member' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">City Member Management</h3>
                        <div className="space-y-2">
                            <InputScan
                                value={cityMapAddrInput}
                                onChange={setCityMapAddrInput}
                                placeholder="CityMap Contract Address (0Q...)"
                                data-testid="city-manage-citymap-addr"
                            />
                            <input
                                type="text"
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                placeholder="City Name"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="city-manage-city-name"
                            />
                            <InputScan
                                value={targetMember}
                                onChange={setTargetMember}
                                placeholder="Target Member Address (0Q...)"
                                data-testid="city-manage-target-member"
                            />
                        </div>
                        <div className="space-y-2 pt-1">
                            <Button
                                onClick={() => memberMgr.registerMember()}
                                disabled={memberMgr.isDisabled}
                                loading={memberMgr.isSending}
                                fullWidth
                                data-testid="city-manage-register-submit"
                            >
                                Register Member to City
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => memberMgr.unregisterMember()}
                                disabled={memberMgr.isDisabled}
                                loading={memberMgr.isSending}
                                fullWidth
                                data-testid="city-manage-unregister-submit"
                            >
                                Unregister Member from City
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </NewLayout>
    );
};
