/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import {
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  ArrowLeftRight,
  Flame,
  Wand2,
  Coins,
  Settings,
  FileText,
} from 'lucide-react';

import { EditableAddressName } from '@/core/components/ui/editable-address-name';

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
    combined.includes('admin') ||
    combined.includes('governance') ||
    combined.includes('contract') ||
    combined.includes('config')
  ) {
    return {
      icon: <Settings className="w-4 h-4" strokeWidth={2.2} />,
      bgClass: 'bg-blue-500/15 text-blue-500 dark:text-blue-400',
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
    bgClass: 'bg-emerald-500/15 text-emerald-500',
  };
}

export const TransactionRow: React.FC<TransactionRowModel> = (props) => {
  const {
    id,
    txHash,
    network = 'testnet',
    title,
    subtitleId,
    counterpartyAddress,
    amount,
    isOutgoing,
    status,
    date,
    failureReason,
    rawType,
    comment,
    timestamp,
  } = props;

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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

  const handleClick = (e?: React.SyntheticEvent) => {
    if (e && isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressRef.current = false;
      return;
    }
    // Clicking opens in-app transaction details
    setIsDetailsModalOpen(true);
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
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onTouchStart={startPressTimer}
        onTouchEnd={clearPressTimer}
        onTouchMove={clearPressTimer}
        onMouseDown={startPressTimer}
        onMouseUp={clearPressTimer}
        onMouseLeave={clearPressTimer}
        onContextMenu={handleContextMenu}
        className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/50 active:bg-muted/80 transition-colors text-left group select-none cursor-pointer border border-transparent hover:border-border/40"
      >
        {/* Left: Action Icon + Status Badge */}
        <span className="relative flex-shrink-0 mr-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass} transition-transform group-hover:scale-105`}
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
                <span className="truncate inline-flex items-center gap-1">
                  <span>{isOutgoing ? 'to ' : 'from '}</span>
                  {counterpartyAddress ? (
                    <EditableAddressName
                      address={counterpartyAddress}
                      network={network}
                      showEditButton={true}
                      truncate={true}
                    />
                  ) : (
                    <span>{subtitleId}</span>
                  )}
                </span>
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

      {/* Transaction Details Modal */}
      {isDetailsModalOpen && (
        <TransactionInfoModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          transaction={props}
        />
      )}

      {/* Long-press / Right-click Explorer Choice Modal */}
      {isChoiceModalOpen && hashForModal && (
        <ExplorerChoiceModal
          isOpen={isChoiceModalOpen}
          onClose={() => setIsChoiceModalOpen(false)}
          txHash={hashForModal}
          network={network}
        />
      )}
    </>
  );
};
