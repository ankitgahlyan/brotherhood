/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { Plus, Wallet } from 'lucide-react';
import { useWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { WalletRow } from '@/features/wallets/components/wallet-row';
import { WalletUnlockModal } from '@/features/wallets/components/wallet-unlock-modal';
import { Modal } from '@/core/components/ui/modal';
import { AddWalletModal, WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { AddWalletMode } from '@/features/wallet-setup';

interface SettingsWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsWalletsModal: React.FC<SettingsWalletsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    savedWallets,
    activeWalletId,
    switchWallet,
    renameWallet,
    removeWallet,
  } = useWallet();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);

  const pendingWallet = savedWallets.find((w) => w.id === pendingWalletId);

  const performSwitch = async (walletId: string) => {
    try {
      await switchWallet(walletId);
      toast.success('Switched wallet successfully');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to switch wallet';
      if (
        msg.includes('User not authenticated') ||
        msg.includes('Cannot load wallets')
      ) {
        setPendingWalletId(walletId);
        setIsUnlockOpen(true);
      } else {
        toast.error(msg);
      }
    }
  };

  const handleSelect = async (walletId: string) => {
    if (walletId !== activeWalletId) {
      await performSwitch(walletId);
    }
  };

  const handleAddSelect = (mode: AddWalletMode) => {
    setIsAddOpen(false);
    onClose();
    navigate(WALLET_SETUP_ROUTE[mode]);
  };

  return (
    <>
      <Modal.Container
        isOpened={isOpen && !isAddOpen && !isUnlockOpen}
        onOpenChange={(open) => !open && onClose()}
        className="max-w-md flex flex-col p-0 overflow-hidden"
      >
        <Modal.Header onClose={onClose}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <Modal.Title>Manage Wallets</Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {savedWallets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No wallets available
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-secondary/40 overflow-hidden">
              {savedWallets.map((wallet) => (
                <WalletRow
                  key={wallet.id}
                  wallet={wallet}
                  isActive={wallet.id === activeWalletId}
                  onSelect={() => handleSelect(wallet.id)}
                  onRename={renameWallet}
                  onRemove={removeWallet}
                />
              ))}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="justify-center p-4 border-t border-border">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md w-full cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add New Wallet
          </button>
        </Modal.Footer>
      </Modal.Container>

      <AddWalletModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSelect={handleAddSelect}
      />

      <WalletUnlockModal
        isOpen={isUnlockOpen}
        onClose={() => {
          setIsUnlockOpen(false);
          setPendingWalletId(null);
        }}
        targetWalletName={pendingWallet?.name}
        onSuccess={() => {
          if (pendingWalletId) {
            void performSwitch(pendingWalletId);
          }
        }}
      />
    </>
  );
};
