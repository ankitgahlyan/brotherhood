import React, { useState } from 'react';
import { ChevronDown, Lock, Sparkles, Unlock, Wallet } from 'lucide-react';
import { CreateWalletModal } from './CreateWalletModal';
import { ImportWalletModal } from './ImportWalletModal';
import { WalletSwitcherModal } from './WalletSwitcherModal';
import { useAppWallet } from '@/providers/WalletContext';

export const WalletSelector: React.FC = () => {
  const { activeWallet, unlockedWallet, balance } = useAppWallet();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const formatBalance = (b: bigint | null) => {
    if (b === null) return '0.00 TON';
    const num = Number(b) / 1e9;
    return `${num.toFixed(3)} TON`;
  };

  const formatAddr = (addrStr: string) => {
    if (!addrStr) return '';
    return `${addrStr.slice(0, 4)}...${addrStr.slice(-4)}`;
  };

  if (!activeWallet) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create TON Wallet</span>
        </button>

        <CreateWalletModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
        <ImportWalletModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSwitcherOpen(true)}
        className="inline-flex items-center gap-2.5 bg-stone-900/90 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-500/50 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-stone-200 font-mono">
            {formatAddr(activeWallet.address)}
          </span>
        </div>

        <div className="h-3 w-[1px] bg-stone-800" />

        <span className="font-mono text-amber-300 font-medium">
          {formatBalance(balance)}
        </span>

        {unlockedWallet ? (
          <span title="Wallet unlocked"><Unlock className="w-3 h-3 text-green-400" /></span>
        ) : (
          <span title="Wallet locked"><Lock className="w-3 h-3 text-amber-500" /></span>
        )}

        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      <WalletSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenImport={() => setIsImportOpen(false)}
      />

      <CreateWalletModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ImportWalletModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
};
