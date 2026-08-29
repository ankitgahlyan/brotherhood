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

import { useFiAccount } from '../hooks/use-fi-account';
import { useFiTransfer } from '../hooks/use-fi-transfer';
import { useFiBurn } from '../hooks/use-fi-burn';
import { useWeeklyClaim } from '../hooks/use-weekly-claim';
import { useInviteMember } from '../hooks/use-invite-member';
import { useVote } from '../hooks/use-vote';
import { useBuyCredit } from '../hooks/use-buy-credit';
import { useRepayDebt } from '../hooks/use-repay-debt';
import { useSetAllowance } from '../hooks/use-set-allowance';
import { useSpendAllowance } from '../hooks/use-spend-allowance';
import { useGoldTransfer } from '../hooks/use-gold-transfer';
import { useProfile } from '../hooks/use-profile';
import { useAuthorityActions } from '../hooks/use-authority-actions';

type Tab =
    | 'account'
    | 'transfer'
    | 'burn'
    | 'claim'
    | 'invite'
    | 'vote'
    | 'credit'
    | 'allowance'
    | 'gold'
    | 'profile'
    | 'authority';

export const BrotherhoodScreen: React.FC = () => {
    const navigate = useNavigate();
    const walletKit = useWalletKit();
    const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
    const network = savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

    const [activeTab, setActiveTab] = useState<Tab>('account');

    // Forms state
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [invitee, setInvitee] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteCity, setInviteCity] = useState('');
    const [inviteCityLetter, setInviteCityLetter] = useState(0);
    const [targetAddress, setTargetAddress] = useState('');
    const [isUnvote, setIsUnvote] = useState(false);
    const [grantee, setGrantee] = useState('');
    const [granter, setGranter] = useState('');
    const [goldRecipient, setGoldRecipient] = useState('');
    const [goldAmount, setGoldAmount] = useState(1);
    const [profileUsername, setProfileUsername] = useState('');
    const [profileCity, setProfileCity] = useState('');
    const [profileCityLetter, setProfileCityLetter] = useState(0);
    const [authTarget, setAuthTarget] = useState('');
    const [authStatus, setAuthStatus] = useState(0);

    // Hooks
    const account = useFiAccount(address ?? null);
    const transfer = useFiTransfer({ wallet: currentWallet, walletKit, walletAddress: address ?? null, recipient, amount, network });
    const burn = useFiBurn({ wallet: currentWallet, walletKit, walletAddress: address ?? null, amount, network });
    const claim = useWeeklyClaim({ wallet: currentWallet, walletKit, walletAddress: address ?? null, network });
    const invite = useInviteMember({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        invitee,
        username: inviteUsername,
        city: inviteCity,
        cityLetter: inviteCityLetter,
        network,
    });
    const vote = useVote({ wallet: currentWallet, walletKit, walletAddress: address ?? null, targetAddress, isUnvote, network });
    const credit = useBuyCredit({ wallet: currentWallet, walletKit, walletAddress: address ?? null, recipient, amount, network });
    const repay = useRepayDebt({ wallet: currentWallet, walletKit, walletAddress: address ?? null, amount, network });
    const setAllowance = useSetAllowance({ wallet: currentWallet, walletKit, walletAddress: address ?? null, grantee, amount, network });
    const spendAllowance = useSpendAllowance({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        granterAddress: granter,
        receiver: recipient,
        amount,
        network,
    });
    const gold = useGoldTransfer({ wallet: currentWallet, walletKit, walletAddress: address ?? null, recipient: goldRecipient, amount: goldAmount, network });
    const profile = useProfile({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        username: profileUsername,
        city: profileCity,
        cityLetter: profileCityLetter,
        network,
    });
    const authority = useAuthorityActions({
        wallet: currentWallet,
        walletKit,
        walletAddress: address ?? null,
        targetAddress: authTarget,
        newStatus: authStatus,
        network,
    });

    const isAuthority = account.data?.isAuthorityAccount ?? false;

    return (
        <NewLayout header={<ScreenHeader title="BrotherHood (FossFi)" onBack={() => navigate('/wallet')} />}>
            <div className="space-y-4">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                    {(
                        [
                            'account',
                            'transfer',
                            'burn',
                            'claim',
                            'invite',
                            'vote',
                            'credit',
                            'allowance',
                            'gold',
                            'profile',
                            ...(isAuthority ? ['authority'] : []),
                        ] as Tab[]
                    ).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-2.5 py-1.5 rounded-md capitalize transition-colors ${
                                activeTab === tab ? 'bg-white shadow text-black' : 'text-gray-600 hover:text-black'
                            }`}
                            data-testid={`brotherhood-tab-${tab}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Account Dashboard */}
                {activeTab === 'account' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-2">Member Account Details</h3>
                        {account.isLoading ? (
                            <p className="text-gray-500">Loading on-chain account state…</p>
                        ) : account.data ? (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Username</span>
                                    <span className="font-medium">{account.data.username || 'Not set'}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">City</span>
                                    <span className="font-medium">{account.data.city || 'Not set'}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">FI Balance</span>
                                    <span className="font-medium">{(Number(account.data.jettonBalance) / 1e9).toFixed(4)} FI</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Gold Coins</span>
                                    <span className="font-medium">{account.data.goldCoins}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Received Votes</span>
                                    <span className="font-medium">{account.data.receivedVotes.toString()}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Connections</span>
                                    <span className="font-medium">{account.data.connections}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Status</span>
                                    <span className="font-medium">
                                        {account.data.active ? 'Active' : 'Inactive'} ({account.data.status})
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 block">Authority Account</span>
                                    <span className="font-medium">{account.data.isAuthorityAccount ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No FossFi account initialized for this wallet address.</p>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => account.refetch()} fullWidth>
                            Refresh Account Data
                        </Button>
                    </div>
                )}

                {/* Transfer FI */}
                {activeTab === 'transfer' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Transfer FI Tokens</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Recipient Address</label>
                            <InputScan
                                value={recipient}
                                onChange={setRecipient}
                                placeholder="0Q..."
                                data-testid="brotherhood-transfer-recipient"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Amount (FI)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-transfer-amount"
                            />
                        </div>
                        <Button
                            onClick={() => transfer.send()}
                            disabled={transfer.isDisabled}
                            loading={transfer.isSending}
                            fullWidth
                            data-testid="brotherhood-transfer-submit"
                        >
                            Send FI Transfer
                        </Button>
                    </div>
                )}

                {/* Burn FI */}
                {activeTab === 'burn' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Burn FI Tokens</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Amount to Burn (FI)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-burn-amount"
                            />
                        </div>
                        <Button
                            onClick={() => burn.send()}
                            disabled={burn.isDisabled}
                            loading={burn.isSending}
                            fullWidth
                            data-testid="brotherhood-burn-submit"
                        >
                            Burn FI
                        </Button>
                    </div>
                )}

                {/* Weekly Claim */}
                {activeTab === 'claim' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm text-center">
                        <h3 className="font-semibold text-base mb-1">Claim Weekly Grant (UBI)</h3>
                        <p className="text-xs text-gray-500 mb-3">
                            Members are entitled to claim their weekly FI grant token allocation.
                        </p>
                        <Button
                            onClick={() => claim.send()}
                            disabled={claim.isDisabled}
                            loading={claim.isSending}
                            fullWidth
                            data-testid="brotherhood-claim-submit"
                        >
                            Claim Weekly Grant
                        </Button>
                    </div>
                )}

                {/* Invite Member */}
                {activeTab === 'invite' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Invite New Member</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Invitee Wallet Address</label>
                            <InputScan
                                value={invitee}
                                onChange={setInvitee}
                                placeholder="0Q..."
                                data-testid="brotherhood-invite-recipient"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                                placeholder="alice"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-invite-username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                value={inviteCity}
                                onChange={(e) => setInviteCity(e.target.value)}
                                placeholder="London"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-invite-city"
                            />
                        </div>
                        <Button
                            onClick={() => invite.send()}
                            disabled={invite.isDisabled}
                            loading={invite.isSending}
                            fullWidth
                            data-testid="brotherhood-invite-submit"
                        >
                            Send Invite
                        </Button>
                    </div>
                )}

                {/* Vote / Unvote */}
                {activeTab === 'vote' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Trust Graph Voting</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Target Member Address</label>
                            <InputScan
                                value={targetAddress}
                                onChange={setTargetAddress}
                                placeholder="0Q..."
                                data-testid="brotherhood-vote-target"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                id="unvote-check"
                                checked={isUnvote}
                                onChange={(e) => setIsUnvote(e.target.checked)}
                            />
                            <label htmlFor="unvote-check">Unvote (remove trust endorsement)</label>
                        </div>
                        <Button
                            onClick={() => vote.send()}
                            disabled={vote.isDisabled}
                            loading={vote.isSending}
                            fullWidth
                            data-testid="brotherhood-vote-submit"
                        >
                            {isUnvote ? 'Unvote Member' : 'Vote for Member'}
                        </Button>
                    </div>
                )}

                {/* Buy Credit & Repay Debt */}
                {activeTab === 'credit' && (
                    <div className="space-y-4 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Buy Credit</h3>
                            <InputScan
                                value={recipient}
                                onChange={setRecipient}
                                placeholder="Borrower Address (EQ...)"
                                data-testid="brotherhood-credit-recipient"
                            />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Credit Amount (FI)"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-credit-amount"
                            />
                            <Button
                                onClick={() => credit.send()}
                                disabled={credit.isDisabled}
                                loading={credit.isSending}
                                fullWidth
                                data-testid="brotherhood-credit-submit"
                            >
                                Buy Credit
                            </Button>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Repay Debt</h3>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Repayment Amount (FI)"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-repay-amount"
                            />
                            <Button
                                onClick={() => repay.send()}
                                disabled={repay.isDisabled}
                                loading={repay.isSending}
                                fullWidth
                                data-testid="brotherhood-repay-submit"
                            >
                                Repay Debt
                            </Button>
                        </div>
                    </div>
                )}

                {/* Allowances */}
                {activeTab === 'allowance' && (
                    <div className="space-y-4 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Grant Allowance</h3>
                            <InputScan
                                value={grantee}
                                onChange={setGrantee}
                                placeholder="Grantee Address (0Q...)"
                                data-testid="brotherhood-grantee-address"
                            />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Allowance Amount (FI)"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-allowance-amount"
                            />
                            <Button
                                onClick={() => setAllowance.send()}
                                disabled={setAllowance.isDisabled}
                                loading={setAllowance.isSending}
                                fullWidth
                                data-testid="brotherhood-grant-allowance-submit"
                            >
                                Grant Allowance
                            </Button>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Spend Allowance</h3>
                            <InputScan
                                value={granter}
                                onChange={setGranter}
                                placeholder="Granter Address (0Q...)"
                                data-testid="brotherhood-granter-address"
                            />
                            <InputScan
                                value={recipient}
                                onChange={setRecipient}
                                placeholder="Receiver Address (0Q...)"
                                data-testid="brotherhood-spend-receiver"
                            />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount to Spend (FI)"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-spend-amount"
                            />
                            <Button
                                onClick={() => spendAllowance.send()}
                                disabled={spendAllowance.isDisabled}
                                loading={spendAllowance.isSending}
                                fullWidth
                                data-testid="brotherhood-spend-allowance-submit"
                            >
                                Spend Allowance
                            </Button>
                        </div>
                    </div>
                )}

                {/* Gold Coins */}
                {activeTab === 'gold' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Transfer Gold Coins</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Recipient Address</label>
                            <InputScan
                                value={goldRecipient}
                                onChange={setGoldRecipient}
                                placeholder="0Q..."
                                data-testid="brotherhood-gold-recipient"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Number of Gold Coins</label>
                            <input
                                type="number"
                                value={goldAmount}
                                onChange={(e) => setGoldAmount(parseInt(e.target.value) || 0)}
                                placeholder="1"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-gold-amount"
                            />
                        </div>
                        <Button
                            onClick={() => gold.send()}
                            disabled={gold.isDisabled}
                            loading={gold.isSending}
                            fullWidth
                            data-testid="brotherhood-gold-submit"
                        >
                            Transfer Gold Coins
                        </Button>
                    </div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                    <div className="space-y-3 bg-white p-4 border rounded-xl shadow-sm text-sm">
                        <h3 className="font-semibold text-base mb-1">Update Member Profile</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">New Username</label>
                            <input
                                type="text"
                                value={profileUsername}
                                onChange={(e) => setProfileUsername(e.target.value)}
                                placeholder="bob"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-profile-username"
                            />
                            <Button
                                onClick={() => profile.updateUsername()}
                                disabled={profile.isDisabled || !profileUsername}
                                loading={profile.isSending}
                                fullWidth
                                data-testid="brotherhood-update-username-submit"
                            >
                                Update Username
                            </Button>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">New City</label>
                            <input
                                type="text"
                                value={profileCity}
                                onChange={(e) => setProfileCity(e.target.value)}
                                placeholder="Tokyo"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-profile-city"
                            />
                            <Button
                                onClick={() => profile.updateCity()}
                                disabled={profile.isDisabled || !profileCity}
                                loading={profile.isSending}
                                fullWidth
                                data-testid="brotherhood-update-city-submit"
                            >
                                Update City
                            </Button>
                        </div>
                    </div>
                )}

                {/* Authority Panel */}
                {activeTab === 'authority' && isAuthority && (
                    <div className="space-y-4 bg-white p-4 border rounded-xl shadow-sm text-sm border-amber-200 bg-amber-50/20">
                        <h3 className="font-semibold text-base text-amber-900 mb-1">Authority Actions</h3>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Set Account Status</label>
                            <input
                                type="number"
                                value={authStatus}
                                onChange={(e) => setAuthStatus(parseInt(e.target.value) || 0)}
                                placeholder="0 = active, 1 = suspended, 2 = review"
                                className="w-full p-2 border rounded-lg text-xs"
                                data-testid="brotherhood-authority-status-input"
                            />
                            <Button
                                onClick={() => authority.setStatus()}
                                disabled={authority.isDisabled}
                                loading={authority.isSending}
                                fullWidth
                                data-testid="brotherhood-authority-set-status-submit"
                            >
                                Set Account Status
                            </Button>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Close Member Account</label>
                            <InputScan
                                value={authTarget}
                                onChange={setAuthTarget}
                                placeholder="Target Address (0Q...)"
                                data-testid="brotherhood-authority-target"
                            />
                            <Button
                                variant="secondary"
                                onClick={() => authority.closeAccount()}
                                disabled={authority.isDisabled || !authTarget}
                                loading={authority.isSending}
                                fullWidth
                                data-testid="brotherhood-authority-close-submit"
                            >
                                Close Account (Authority)
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </NewLayout>
    );
};
