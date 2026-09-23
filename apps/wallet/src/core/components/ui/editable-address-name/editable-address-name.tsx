/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Pencil, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletStore } from '@demo/wallet-core';
import { useFormatAddress, sameAddress } from '@/core/utils/formatters';
import {
  useContactBookStore,
  normalizeContactAddress,
} from '@/core/storage/useContactBookStore';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';

export interface EditableAddressNameProps {
  address?: string;
  network?: string;
  showEditButton?: boolean;
  truncate?: boolean;
  className?: string;
  textClassName?: string;
  onNameUpdated?: (name: string) => void;
}

export const EditableAddressName: React.FC<EditableAddressNameProps> = ({
  address = '',
  network = 'testnet',
  showEditButton = true,
  truncate = true,
  className = '',
  textClassName = '',
  onNameUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputNotes, setInputNotes] = useState('');

  const { formatWalletAddress } = useFormatAddress();

  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const myAddress = activeWallet?.address;

  const isSelf = Boolean(
    address && myAddress && sameAddress(address, myAddress),
  );

  const rawKey = address ? normalizeContactAddress(address) : '';

  // Reactively subscribe to contact for this address
  const contact = useContactBookStore((state) => {
    const net = network || 'testnet';
    return state.contactsByNetwork[net]?.[rawKey];
  });

  const setCustomName = useContactBookStore((state) => state.setCustomName);
  const removeCustomName = useContactBookStore(
    (state) => state.removeCustomName,
  );

  if (!address) {
    return (
      <span className={`text-muted-foreground ${textClassName}`}>Unknown</span>
    );
  }

  let displayName = formatWalletAddress(address, truncate);
  let isCustom = false;
  let hasName = false;

  if (isSelf) {
    displayName = 'My Account (Self)';
  } else if (contact?.customName) {
    displayName = `@${contact.customName}`;
    isCustom = true;
    hasName = true;
  } else if (contact?.onChainUsername) {
    displayName = `@${contact.onChainUsername}`;
    hasName = true;
  }

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInputName(contact?.customName || contact?.onChainUsername || '');
    setInputNotes(contact?.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim().replace(/^@+/, '');
    if (cleanName) {
      setCustomName(
        address,
        cleanName,
        inputNotes.trim() || undefined,
        network,
      );
      toast.success(`Saved @${cleanName} for contact`);
      onNameUpdated?.(cleanName);
    } else {
      removeCustomName(address, network);
      toast.success('Restored default name');
    }
    setIsModalOpen(false);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    removeCustomName(address, network);
    toast.success('Restored default name');
    setIsModalOpen(false);
  };

  return (
    <>
      <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        <span
          className={`truncate font-medium ${
            isCustom
              ? 'text-primary font-semibold'
              : hasName
                ? 'text-foreground'
                : 'text-foreground/90 font-mono text-xs'
          } ${textClassName}`}
          title={address}
        >
          {displayName}
        </span>

        {showEditButton && !isSelf && (
          <button
            type="button"
            onClick={handleOpenEdit}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shrink-0 cursor-pointer"
            title="Edit contact name"
            aria-label="Edit contact name"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </span>

      {isModalOpen && (
        <Modal.Container
          isOpened={isModalOpen}
          onOpenChange={(open) => !open && setIsModalOpen(false)}
          className="max-w-sm w-full p-5 rounded-3xl bg-card border border-border"
        >
          <Modal.Header
            onClose={() => setIsModalOpen(false)}
            className="pb-2 border-b border-border/40"
          >
            <Modal.Title className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Contact Name</span>
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={handleSave} className="space-y-4 pt-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Nickname / Username
              </label>
              <input
                type="text"
                placeholder="e.g. Alice Work"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                This custom name will be displayed across the wallet.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Binance deposit address"
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-1">
              <div className="text-[11px] text-muted-foreground font-mono bg-secondary/50 p-2 rounded-xl break-all">
                {address}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {contact?.customName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
              <div className="flex-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Modal.Container>
      )}
    </>
  );
};
