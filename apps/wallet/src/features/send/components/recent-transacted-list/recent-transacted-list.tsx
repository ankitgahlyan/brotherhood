/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Check, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRecentTransacted,
  removeRecentTransacted,
  clearAllRecentTransacted,
  type RecentTransactedMember,
} from '../../lib/contact-storage';

interface RecentTransactedListProps {
  network: string;
  onSelectMember: (member: { address: string; username?: string }) => void;
}

export const RecentTransactedList: React.FC<RecentTransactedListProps> = ({
  network,
  onSelectMember,
}) => {
  const [recent, setRecent] = useState<RecentTransactedMember[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const reload = useCallback(() => {
    setRecent(getRecentTransacted(network));
  }, [network]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleDelete = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    removeRecentTransacted(address, network);
    reload();
    toast.info('Removed from recent contacts');
  };

  const handleClearAll = () => {
    clearAllRecentTransacted(network);
    reload();
    toast.info('Recent contacts cleared');
  };

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Recent Transacted Members ({recent.length})
        </h4>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          data-testid="clear-all-recent-transacted"
        >
          Clear All
        </button>
      </div>

      <div
        className="space-y-2 max-h-70 overflow-y-auto pr-0.5"
        data-testid="recent-transacted-list"
      >
        {recent.map((item) => (
          <div
            key={item.address}
            onClick={() => onSelectMember(item)}
            className="group flex flex-col gap-1.5 p-3 bg-white hover:bg-gray-50/80 border border-gray-200/70 hover:border-blue-300 rounded-xl cursor-pointer transition-all shadow-xs"
            role="button"
            tabIndex={0}
            data-testid={`recent-member-${item.address}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-sm text-foreground">
                  {item.username ? `@${item.username}` : 'No username set'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, item.address)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                  title="Copy address"
                  aria-label="Copy address"
                >
                  {copiedAddress === item.address ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item.address)}
                  className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove from recent"
                  aria-label="Remove from recent"
                  data-testid={`delete-recent-${item.address}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground break-all pl-9">
              <span className="select-all">{item.address}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
