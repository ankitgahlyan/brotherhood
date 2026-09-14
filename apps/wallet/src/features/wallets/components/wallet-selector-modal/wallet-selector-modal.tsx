/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { Plus } from 'lucide-react';
import { useWallet } from '@demo/wallet-core';

import { toast } from 'sonner';

import { WalletRow } from '../wallet-row';
import { WalletUnlockModal } from '../wallet-unlock-modal';

import { Modal } from '@/core/components/ui/modal';
import { AddWalletModal, WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { AddWalletMode } from '@/features/wallet-setup';

interface WalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({
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
      onClose();
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
    } else {
      onClose();
    }
  };

  // Already authenticated here — go straight to the chosen setup screen, no password step.
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
        className="px-2"
      >
        <Modal.Header onClose={onClose}>
          <Modal.Title>Wallets</Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-2 pb-2">
          {savedWallets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No wallets yet
            </p>
          ) : (
            savedWallets.map((wallet) => (
              <WalletRow
                key={wallet.id}
                wallet={wallet}
                isActive={wallet.id === activeWalletId}
                onSelect={() => handleSelect(wallet.id)}
                onRename={renameWallet}
                onRemove={removeWallet}
              />
            ))
          )}
        </Modal.Body>

        <Modal.Footer className="items-center">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-base font-semibold px-4 py-2 rounded-full hover:scale-[1.03] active:scale-[0.97] transition-transform"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Add wallet
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
