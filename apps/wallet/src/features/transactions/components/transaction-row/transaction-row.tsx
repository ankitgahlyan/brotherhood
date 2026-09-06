/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState } from 'react';
import { Check, MinusCircle, PlusCircle, X } from 'lucide-react';

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
  network,
  explorerUrl,
  title,
  subtitleId,
  amount,
  isOutgoing,
  status,
  date,
}) => {
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const hashForModal = txHash || (id.startsWith('pending-') ? id.replace('pending-', '') : id);

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

  const content = (
    <>
      <span className="relative w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        {isOutgoing ? (
          <MinusCircle
            className="w-6 h-6 text-muted-foreground"
            strokeWidth={2}
          />
        ) : (
          <PlusCircle
            className="w-6 h-6 text-muted-foreground"
            strokeWidth={2}
          />
        )}
        <StatusBadge status={status} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {title}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {subtitleId}
        </div>
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
    'flex items-center gap-3 py-2 -mx-1 px-1 rounded-xl select-none cursor-pointer';

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

      <ExplorerChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        txHash={hashForModal}
        network={network}
      />
    </>
  );
};

