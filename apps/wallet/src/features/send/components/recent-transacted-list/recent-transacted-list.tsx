/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Copy, Trash2, Check, User } from 'lucide-react';
import { toast } from 'sonner';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import { EditableAddressName } from '@/core/components/ui/editable-address-name';

interface RecentTransactedListProps {
  network: string;
  onSelectMember: (member: { address: string; username?: string }) => void;
}

export const RecentTransactedList: React.FC<RecentTransactedListProps> = ({
  network,
  onSelectMember,
}) => {
  const recent = useContactBookStore(
    (state) => state.recentByNetwork[network] || [],
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleDelete = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    useContactBookStore.setState((state) => {
      const net = network || 'testnet';
      const current = state.recentByNetwork[net] || [];
      return {
        recentByNetwork: {
          ...state.recentByNetwork,
          [net]: current.filter(
            (item) => item.address.toLowerCase() !== address.toLowerCase(),
          ),
        },
      };
    });
    toast.info('Removed from recent contacts');
  };

  const handleClearAll = () => {
    useContactBookStore.setState((state) => {
      const net = network || 'testnet';
      return {
        recentByNetwork: {
          ...state.recentByNetwork,
          [net]: [],
        },
      };
    });
    toast.info('Recent contacts cleared');
  };

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Recent Transacted Members ({recent.length})
        </h4>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
          data-testid="clear-all-recent-transacted"
        >
          Clear All
        </button>
      </div>

      <div
        className="flex flex-col gap-2 max-h-70 overflow-y-auto pr-0.5"
        data-testid="recent-transacted-list"
      >
        {recent.map((item) => (
          <div
            key={item.address}
            onClick={() => onSelectMember(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMember(item);
              }
            }}
            className="group flex flex-col gap-1.5 p-3 bg-card hover:bg-secondary/60 border border-border/80 hover:border-primary/50 rounded-xl cursor-pointer transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            role="button"
            tabIndex={0}
            aria-label={`Select member ${item.username ? `@${item.username}` : item.address}`}
            data-testid={`recent-member-${item.address}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <EditableAddressName
                  address={item.address}
                  network={network}
                  showEditButton={true}
                  truncate={false}
                  className="font-semibold text-sm truncate"
                />
              </div>

              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, item.address)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Copy address"
                  aria-label="Copy address"
                >
                  {copiedAddress === item.address ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item.address)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
