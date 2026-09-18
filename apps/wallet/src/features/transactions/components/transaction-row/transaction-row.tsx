/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState } from 'react';
import {
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Pencil,
  FileCode2,
  ArrowLeftRight,
  Flame,
  Wand2,
  Coins,
  Settings,
  FileText,
} from 'lucide-react';
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
import { TransactionInfoModal } from '../transaction-info-modal';

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
      <span className={`${base} bg-rose-500`}>
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

interface ActionIconConfig {
  icon: React.ReactNode;
  bgClass: string;
}

function getActionIcon(
  rawType?: string,
  title?: string,
  isOutgoing?: boolean,
): ActionIconConfig {
  const combined = `${rawType ?? ''} ${title ?? ''}`.toLowerCase();

  if (combined.includes('swap')) {
    return {
      icon: <ArrowLeftRight className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400',
    };
  }
  if (combined.includes('burn')) {
    return {
      icon: <Flame className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-rose-500/15 text-rose-500',
    };
  }
  if (combined.includes('mint')) {
    return {
      icon: <Wand2 className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-purple-500/15 text-purple-500 dark:text-purple-400',
    };
  }
  if (combined.includes('stake') || combined.includes('earn')) {
    return {
      icon: <Coins className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
    };
  }
  if (
    combined.includes('smartcontract') ||
    combined.includes('contractdeploy') ||
    combined.includes('act') ||
    combined.includes('call') ||
    combined.includes('vote')
  ) {
    return {
      icon: <Settings className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-primary/15 text-primary',
    };
  }

  if (isOutgoing) {
    return {
      icon: <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />,
      bgClass: 'bg-rose-500/15 text-rose-500',
    };
  }

  return {
    icon: <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />,
    bgClass: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
  };
}

/** Single transaction list item styled after wallet-v2 Activity items. */
export const TransactionRow: React.FC<TransactionRowModel> = (props) => {
  const {
    id,
    txHash,
    network = 'testnet',
    title,
    subtitleId,
    counterpartyAddress,
    failureReason,
    amount,
    isOutgoing,
    status,
    date,
    rawType,
    comment,
    timestamp,
  } = props;

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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
    // Wallet-v2 behavior: clicking opens in-app transaction details
    setIsDetailsModalOpen(true);
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

  const { icon, bgClass } = getActionIcon(rawType, title, isOutgoing);

  // Time format (HH:mm) from timestamp
  const timeString = timestamp
    ? new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : date;

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={startPressTimer}
        onTouchEnd={clearPressTimer}
        onTouchMove={clearPressTimer}
        onTouchCancel={clearPressTimer}
        onMouseDown={startPressTimer}
        onMouseUp={clearPressTimer}
        onMouseLeave={clearPressTimer}
        className="group relative flex items-center gap-3.5 py-2.5 px-3 rounded-2xl cursor-pointer select-none hover:bg-secondary/60 active:scale-[0.985] transition-all border border-transparent hover:border-border/40"
      >
        {/* Left: Action Icon with Status Badge */}
        <span className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${bgClass}`}
          >
            {icon}
          </div>
          <StatusBadge status={status} />
        </span>

        {/* Middle: Title, Counterparty/Time, Comment Preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5">
            {status === 'failed' && failureReason ? (
              <span className="text-rose-500 font-medium truncate">
                {failureReason}
              </span>
            ) : (
              <>
                <span className="truncate">
                  {isOutgoing ? 'to ' : 'from '}
                  {counterpartyLabel}
                </span>
                {showEditButton && (
                  <button
                    type="button"
                    onClick={handleOpenEditName}
                    className="opacity-40 hover:opacity-100 hover:text-foreground transition-opacity p-0.5 shrink-0 cursor-pointer"
                    title="Edit contact name"
                    aria-label="Edit contact name"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                )}
                <span className="text-muted-foreground/60 select-none">∙</span>
                <span className="shrink-0">{timeString}</span>
              </>
            )}
          </div>

          {/* Comment / Memo Preview */}
          {comment && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 truncate mt-0.5 italic">
              <FileText className="w-2.5 h-2.5 shrink-0 not-italic opacity-60" />
              <span className="truncate">"{comment}"</span>
            </div>
          )}
        </div>

        {/* Right: Crypto Amount */}
        <div className="text-right flex-shrink-0 pl-1">
          <div
            className={`text-sm font-semibold tracking-tight ${
              status === 'failed'
                ? 'text-muted-foreground line-through'
                : isOutgoing
                  ? 'text-rose-500'
                  : 'text-emerald-500'
            }`}
          >
            {amount}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal (Wallet-v2 In-App Flow) */}
      {isDetailsModalOpen && (
        <TransactionInfoModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          transaction={props}
        />
      )}

      {/* Long-Press / Right-Click Explorer Choice Modal */}
      {isChoiceModalOpen && (
        <ExplorerChoiceModal
          isOpen={isChoiceModalOpen}
          onClose={() => setIsChoiceModalOpen(false)}
          txHash={hashForModal}
          network={network}
        />
      )}

      {/* Edit Contact Name Modal */}
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
