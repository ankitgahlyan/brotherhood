import React, { useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import { MnemonicGrid } from './MnemonicGrid';
import { useAppWallet } from '@/providers/WalletContext';

interface WalletSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
  onOpenImport: () => void;
}

export const WalletSwitcherModal: React.FC<WalletSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenCreate,
  onOpenImport,
}) => {
  const {
    wallets,
    activeWallet,
    unlockedWallet,
    selectActiveWallet,
    deleteWallet,
    balance,
  } = useAppWallet();

  const [showSeed, setShowSeed] = useState(false);

  if (!isOpen) return null;

  const formatBalance = (b: bigint | null) => {
    if (b === null) return '... TON';
    const num = Number(b) / 1e9;
    return `${num.toFixed(4)} TON`;
  };

  const formatAddr = (addrStr: string) => {
    if (!addrStr) return '';
    return `${addrStr.slice(0, 6)}...${addrStr.slice(-6)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-amber-500/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-100 text-lg">
                Wallet Manager
              </h3>
              <p className="text-xs text-stone-400">
                Manage local in-app TON wallets (V5R1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreate();
              }}
              className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-medium text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenImport();
              }}
              className="flex items-center justify-center gap-2 p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-200 font-medium text-xs transition-all"
            >
              <Plus className="w-4 h-4 text-stone-400" />
              <span>Import Seed Phrase</span>
            </button>
          </div>

          {/* Wallet List */}
          <div>
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Saved Wallets ({wallets.length})
            </h4>

            {wallets.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-800 rounded-xl">
                <p className="text-sm text-stone-400 mb-2">No wallets created yet</p>
                <p className="text-xs text-stone-600">
                  Create or import a seed phrase to interact with smart contracts.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {wallets.map((w) => {
                  const isActive = activeWallet?.id === w.id;

                  return (
                    <div
                      key={w.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-stone-900/50 border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div
                        onClick={() => selectActiveWallet(w.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-100 text-sm">
                            {w.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            V5R1
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-stone-400">
                          <span>{formatAddr(w.address)}</span>
                          {isActive && (
                            <span className="text-amber-300 font-medium">
                              {formatBalance(balance)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {wallets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteWallet(w.id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Remove wallet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Wallet Seed View */}
          {activeWallet && unlockedWallet && (
            <div className="pt-3 border-t border-stone-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">
                  Active Wallet Seed Phrase
                </span>
                <button
                  type="button"
                  onClick={() => setShowSeed(!showSeed)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {showSeed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide Mnemonic
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Reveal Mnemonic
                    </>
                  )}
                </button>
              </div>

              {showSeed && (
                <MnemonicGrid mnemonic={unlockedWallet.mnemonic} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
