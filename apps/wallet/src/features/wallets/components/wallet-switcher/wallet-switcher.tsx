/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { getNetworkLabel } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';

import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('WalletSwitcher');

interface WalletSwitcherProps {
    savedWallets: SavedWallet[];
    activeWalletId?: string;
    onSwitchWallet: (walletId: string) => void;
    onRemoveWallet: (walletId: string) => void;
    onRenameWallet: (walletId: string, newName: string) => void;
    onUpdateWalletType?: (walletId: string, newType: 'signer' | 'mnemonic' | 'ledger') => void;
    compact?: boolean;
}

export const WalletSwitcher: React.FC<WalletSwitcherProps> = ({
    savedWallets,
    activeWalletId,
    onSwitchWallet,
    onRemoveWallet,
    onRenameWallet,
    onUpdateWalletType: _onUpdateWalletType,
    compact = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [showDetailsWalletId, setShowDetailsWalletId] = useState<string | null>(null);

    const activeWallet = savedWallets.find((w) => w.id === activeWalletId);

    const handleStartEdit = (wallet: SavedWallet) => {
        setEditingWalletId(wallet.id);
        setEditingName(wallet.name);
    };

    const handleSaveEdit = () => {
        if (editingWalletId && editingName.trim()) {
            onRenameWallet(editingWalletId, editingName.trim());
            setEditingWalletId(null);
            setEditingName('');
        }
    };

    const handleCancelEdit = () => {
        setEditingWalletId(null);
        setEditingName('');
    };

    const handleRemove = (walletId: string) => {
        if (confirm('Are you sure you want to remove this wallet? This action cannot be undone.')) {
            onRemoveWallet(walletId);
            if (savedWallets.length <= 1) {
                setIsExpanded(false);
            }
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const formatWalletType = (type: string) => {
        const typeMap: Record<string, string> = {
            mnemonic: 'Mnemonic',
            signer: 'Signer',
            ledger: 'Ledger Hardware',
        };
        return typeMap[type] || type;
    };

    if (savedWallets.length === 0) {
        return null;
    }

    return (
        <div
            className={
                compact ? 'overflow-hidden' : 'bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden'
            }
        >
            {/* Active Wallet Display */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between hover:bg-secondary/60 transition-colors ${
                    compact ? 'px-0 py-1' : 'px-4 py-3'
                }`}
            >
                <div className={`flex items-center space-x-3 ${compact ? 'min-w-0 flex-1' : ''}`}>
                    {!compact && (
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                        </div>
                    )}
                    <div className={`text-left min-w-0 flex-1 ${compact ? 'truncate' : ''}`}>
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-foreground">
                                {activeWallet?.name || 'No Wallet Selected'}
                            </p>
                            {activeWallet && (
                                <span
                                    className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                        activeWallet.network === 'mainnet'
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : activeWallet.network === 'tetra'
                                              ? 'bg-purple-500/10 text-purple-500'
                                              : 'bg-blue-500/10 text-blue-500'
                                    }`}
                                >
                                    {getNetworkLabel(activeWallet.network)}
                                </span>
                            )}
                        </div>
                        {!compact && (
                            <p className="text-xs text-muted-foreground">
                                {activeWallet ? formatAddress(activeWallet.address) : 'Select a wallet'}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {savedWallets.length > 1 && !compact && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary border border-border/50 rounded-full">
                            {savedWallets.length} wallets
                        </span>
                    )}
                    <svg
                        className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Wallet List */}
            {isExpanded && (
                <div className="border-t border-border">
                    <div className="max-h-96 overflow-y-auto">
                        {savedWallets.map((wallet) => {
                            const isActive = wallet.id === activeWalletId;
                            const isEditing = editingWalletId === wallet.id;

                            return (
                                <div
                                    key={wallet.id}
                                    className={`px-4 py-3 border-b border-border/60 last:border-b-0 ${
                                        isActive ? 'bg-blue-500/10' : 'hover:bg-secondary/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {isEditing ? (
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="flex-1 px-2 py-1 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit();
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="p-1 text-emerald-500 hover:text-emerald-600"
                                                        title="Save"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1 text-muted-foreground hover:text-foreground"
                                                        title="Cancel"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                                                    <span
                                                        className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                                            wallet.network === 'mainnet'
                                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                                : wallet.network === 'tetra'
                                                                  ? 'bg-purple-500/10 text-purple-500'
                                                                  : 'bg-blue-500/10 text-blue-500'
                                                        }`}
                                                    >
                                                        {getNetworkLabel(wallet.network)}
                                                    </span>
                                                    {isActive && (
                                                        <span className="text-xs text-blue-500 font-medium">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground font-mono mb-1">
                                                {formatAddress(wallet.address)}
                                            </p>
                                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                                <button
                                                    onClick={() =>
                                                        setShowDetailsWalletId(
                                                            showDetailsWalletId === wallet.id ? null : wallet.id,
                                                        )
                                                    }
                                                    className="hover:text-blue-500 transition-colors flex items-center space-x-1"
                                                >
                                                    <span className="capitalize">
                                                        {formatWalletType(wallet.walletInterfaceType)}
                                                    </span>
                                                    <svg
                                                        className={`w-3 h-3 transition-transform ${
                                                            showDetailsWalletId === wallet.id ? 'rotate-180' : ''
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </button>
                                                <span>•</span>
                                                <span>Created {formatDate(wallet.createdAt)}</span>
                                            </div>

                                            {/* Wallet Details */}
                                            {showDetailsWalletId === wallet.id && (
                                                <div className="mt-3 pt-3 border-t border-border">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-foreground">
                                                                Interface Type:
                                                            </span>
                                                            <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary border border-border/50 rounded-lg">
                                                                {formatWalletType(wallet.walletInterfaceType)}
                                                            </span>
                                                        </div>
                                                        {wallet.ledgerConfig && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-foreground">
                                                                    Ledger Account:
                                                                </span>
                                                                <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary border border-border/50 rounded-lg">
                                                                    #{wallet.ledgerConfig.accountIndex}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-foreground">
                                                                Full Address:
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono break-all bg-secondary/70 border border-border/50 p-2 rounded-xl">
                                                            {wallet.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="flex items-center space-x-1 ml-2">
                                                {!isActive && (
                                                    <button
                                                        onClick={() => {
                                                            log.info(`Switching to wallet ${wallet.id}`);
                                                            onSwitchWallet(wallet.id);
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Switch to this wallet"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStartEdit(wallet)}
                                                    className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Rename wallet"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(wallet.id)}
                                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Remove wallet"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add New Wallet Button */}
                    <div className="p-3 bg-secondary/40 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">
                            Create or import a new wallet from the setup page
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
