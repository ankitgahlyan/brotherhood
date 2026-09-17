/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { getNetworkLabel } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/popover';
import { formatTonAddress, copyTonAddress } from '@/core/utils/formatters';
import { removeTrackedAddresses } from '@/lib/brotherhood/tracked-addresses-storage';

const networkBadgeClass = (network: SavedWallet['network']): string => {
  if (network === 'mainnet')
    return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  if (network === 'tetra')
    return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  return 'bg-primary/10 text-primary border border-primary/20';
};

const handleCopy = async (wallet: SavedWallet, event: React.MouseEvent) => {
  event.stopPropagation();
  await copyTonAddress(wallet.address, {
    isContract: false,
    network: wallet.network,
  });
};

interface WalletRowProps {
  wallet: SavedWallet;
  isActive: boolean;
  onSelect: () => void;
  /** Omit both to render a select-only row (no "⋯" management menu). */
  onRename?: (id: string, name: string) => void;
  onRemove?: (id: string) => void;
}

export const WalletRow: React.FC<WalletRowProps> = ({
  wallet,
  isActive,
  onSelect,
  onRename,
  onRemove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(wallet.name);

  const hasActions = Boolean(onRename || onRemove);

  const startRename = () => {
    setDraftName(wallet.name);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const saveRename = () => {
    const next = draftName.trim();
    if (next && next !== wallet.name) onRename?.(wallet.id, next);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRename();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="flex-1 min-w-0 text-base font-bold text-foreground bg-secondary border border-border rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={saveRename}
          className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 flex-shrink-0 transition-colors"
          aria-label="Save name"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary flex-shrink-0 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex items-center gap-3 px-2 py-3 rounded-2xl cursor-pointer transition-colors ${
        isActive
          ? 'bg-secondary/90 border border-border/80 shadow-xs'
          : 'hover:bg-secondary/60 border border-transparent'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive
            ? 'bg-primary/15 text-primary'
            : 'bg-secondary text-muted-foreground'
        }`}
      >
        <Wallet className="w-5 h-5" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-bold text-foreground truncate">
            {wallet.name}
          </span>
          <span
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${networkBadgeClass(wallet.network)}`}
          >
            {getNetworkLabel(wallet.network)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => handleCopy(wallet, e)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-full"
          aria-label="Copy address"
        >
          <span className="font-mono truncate">
            {formatTonAddress(wallet.address, {
              isContract: false,
              network: wallet.network,
              shorten: true,
              count: 6,
            })}
          </span>
          <Copy className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
        </button>
      </div>

      {hasActions && (
        <Popover
          open={menuOpen}
          onOpenChange={(open) => {
            setMenuOpen(open);
            if (!open) setConfirmingDelete(false);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            className="w-44 p-1 bg-card border border-border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmingDelete ? (
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Delete this wallet? This can’t be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 text-sm font-medium text-foreground rounded-lg py-1.5 hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (wallet.address) {
                        removeTrackedAddresses(wallet.address);
                      }
                      onRemove?.(wallet.id);
                    }}
                    className="flex-1 text-sm font-semibold text-destructive-foreground bg-destructive rounded-lg py-1.5 hover:bg-destructive/90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                {onRename && (
                  <button
                    type="button"
                    onClick={startRename}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                    Rename
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
