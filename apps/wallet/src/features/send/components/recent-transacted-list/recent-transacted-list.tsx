/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useCallback } from 'react';
import { Copy, Trash2, Check, User, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRecentTransacted,
  removeRecentTransacted,
  clearAllRecentTransacted,
  saveUsernameAddressMapping,
  type RecentTransactedMember,
} from '../../lib/contact-storage';
import { Modal } from '@/core/components/ui/modal/modal';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';

interface RecentTransactedListProps {
  network: string;
  onSelectMember: (member: { address: string; username?: string }) => void;
}

export const RecentTransactedList: React.FC<RecentTransactedListProps> = ({
  network,
  onSelectMember,
}) => {
  const [recent, setRecent] = useState<RecentTransactedMember[]>(() =>
    getRecentTransacted(network),
  );
  const [prevNetwork, setPrevNetwork] = useState(network);
  if (network !== prevNetwork) {
    setPrevNetwork(network);
    setRecent(getRecentTransacted(network));
  }
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [editingMember, setEditingMember] =
    useState<RecentTransactedMember | null>(null);
  const [editingName, setEditingName] = useState('');

  const reload = useCallback(() => {
    setRecent(getRecentTransacted(network));
  }, [network]);

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

  const handleStartEdit = (
    e: React.MouseEvent,
    item: RecentTransactedMember,
  ) => {
    e.stopPropagation();
    setEditingMember(item);
    setEditingName(item.username || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const clean = editingName.trim().replace(/^@+/, '');
    if (clean) {
      saveUsernameAddressMapping(clean, editingMember.address, network);
      toast.success(`Saved @${clean} for address`);
    }
    setEditingMember(null);
    reload();
  };

  if (recent.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pt-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            Recent Transacted Members ({recent.length})
          </h4>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
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
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {item.username ? `@${item.username}` : 'No username set'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleStartEdit(e, item)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit username"
                    aria-label="Edit username"
                    data-testid={`edit-recent-${item.address}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
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

      <Modal.Container
        isOpened={Boolean(editingMember)}
        onOpenChange={(open) => !open && setEditingMember(null)}
      >
        <Modal.Header onClose={() => setEditingMember(null)}>
          <Modal.Title>Edit Contact Username</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSaveEdit}>
          <Modal.Body className="space-y-4">
            <div className="text-xs text-muted-foreground font-mono break-all">
              {editingMember?.address}
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
              Save Username
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Container>
    </>
  );
};
