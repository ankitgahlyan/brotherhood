/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState } from 'react';
import { Check, ArrowUpRight, ArrowDownLeft, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { useWalletStore } from '@demo/wallet-core';
import { useFormatAddress, sameAddress } from '@/core/utils/formatters';
import {
  getCachedUsername,
  saveUsernameAddressMapping,
} from '@/features/send/lib/contact-storage';
import { Modal } from '@/core/components/ui/modal/modal';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';

import type {
  TransactionRowModel,
  TransactionRowStatus,
} from '../../utils/map-transaction-row';
import { ExplorerChoiceModal } from '../explorer-choice-modal';

const StatusBadge: React.FC<{ status: TransactionRowStatus }> = ({
  status,
}) => {
  const base =
    'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background';

  if (status === 'success') {
    return (
      <span className={`${base} bg-emerald-500`}>
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className={`${base} bg-red-500`}>
        <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className={`${base} bg-card`} title="Pending">
      <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
    </span>
  );
};

/** Single transaction list item. Reused by the dashboard preview and the full history page. */
export const TransactionRow: React.FC<TransactionRowModel> = ({
  id,
  txHash,
  network = 'testnet',
  explorerUrl,
  title,
  subtitleId,
  counterpartyAddress,
  failureReason,
  amount,
  isOutgoing,
  status,
  date,
}) => {
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const hashForModal =
    txHash || (id.startsWith('pending-') ? id.replace('pending-', '') : id);

  const startPressTimer = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsChoiceModalOpen(true);
    }, 500);
  };

  const clearPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Right-click on desktop triggers the explorer choice modal
    if (hashForModal) {
      e.preventDefault();
      setIsChoiceModalOpen(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressRef.current = false;
      return;
    }
  };

  const { formatWalletAddress } = useFormatAddress();
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const myAddress = activeWallet?.address;

  // Resolve counterparty representation
  let counterpartyLabel = subtitleId;
  let showEditButton = false;
  let cachedName: string | null = null;

  if (counterpartyAddress) {
    if (myAddress && sameAddress(counterpartyAddress, myAddress)) {
      counterpartyLabel = 'self';
    } else {
      cachedName = getCachedUsername(counterpartyAddress, network);
      if (cachedName) {
        counterpartyLabel = `@${cachedName}`;
      } else {
        counterpartyLabel = formatWalletAddress(counterpartyAddress, true);
      }
      showEditButton = true;
    }
  }

  const handleOpenEditName = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingName(cachedName || '');
    setIsEditNameOpen(true);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterpartyAddress) return;
    const clean = editingName.trim().replace(/^@+/, '');
    if (clean) {
      saveUsernameAddressMapping(clean, counterpartyAddress, network);
      toast.success(`Saved @${clean} for address`);
    }
    setIsEditNameOpen(false);
  };

  const content = (
    <>
      <span className="relative w-10 h-10 rounded-full bg-secondary/80 border border-border/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
        {isOutgoing ? (
          <div className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />
          </div>
        )}
        <StatusBadge status={status} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {title}
        </div>
        {status === 'failed' && failureReason ? (
          <div className="text-xs text-red-500 font-medium truncate">
            {failureReason}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span className="truncate">{counterpartyLabel}</span>
            {showEditButton && (
              <button
                type="button"
                onClick={handleOpenEditName}
                className="opacity-60 hover:opacity-100 hover:text-foreground transition-opacity p-0.5"
                title="Save contact name"
                aria-label="Save contact name"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div
          className={`text-sm font-semibold ${isOutgoing ? 'text-red-500' : 'text-emerald-500'}`}
        >
          {amount}
        </div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </>
  );

  const rowClassName =
    'flex items-center gap-3 py-2 -mx-1 px-2 rounded-xl select-none cursor-pointer hover:bg-secondary/60 active:scale-[0.98] transition-all';

  return (
    <>
      {explorerUrl ? (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onTouchStart={startPressTimer}
          onTouchEnd={clearPressTimer}
          onTouchMove={clearPressTimer}
          onTouchCancel={clearPressTimer}
          onMouseDown={startPressTimer}
          onMouseUp={clearPressTimer}
          onMouseLeave={clearPressTimer}
          className={`${rowClassName} hover:bg-secondary/50 transition-colors`}
        >
          {content}
        </a>
      ) : (
        <div
          onContextMenu={handleContextMenu}
          onTouchStart={startPressTimer}
          onTouchEnd={clearPressTimer}
          onTouchMove={clearPressTimer}
          onTouchCancel={clearPressTimer}
          onMouseDown={startPressTimer}
          onMouseUp={clearPressTimer}
          onMouseLeave={clearPressTimer}
          className={rowClassName}
        >
          {content}
        </div>
      )}

      {isChoiceModalOpen && (
        <ExplorerChoiceModal
          isOpen={isChoiceModalOpen}
          onClose={() => setIsChoiceModalOpen(false)}
          txHash={hashForModal}
          network={network}
        />
      )}

      {isEditNameOpen && (
        <Modal.Container
          isOpened={isEditNameOpen}
          onOpenChange={setIsEditNameOpen}
        >
          <Modal.Header onClose={() => setIsEditNameOpen(false)}>
            <Modal.Title>Save Contact Name</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleSaveName}>
            <Modal.Body className="space-y-4">
              <div className="text-xs text-muted-foreground font-mono break-all">
                {counterpartyAddress}
              </div>
              <Input.Container>
                <Input.Field>
                  <Input.Input
                    type="text"
                    placeholder="e.g. Alice or @alice"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                </Input.Field>
              </Input.Container>
            </Modal.Body>
            <Modal.Footer>
              <Button type="submit" className="w-full">
                Save Contact
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Container>
      )}
    </>
  );
};
