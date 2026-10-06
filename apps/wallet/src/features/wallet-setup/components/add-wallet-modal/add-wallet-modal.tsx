/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Fingerprint, KeyRound, Plus, Usb } from 'lucide-react';
import { toast } from 'sonner';

import { useNavigate } from '@/core/routing';
import { usePasskeyWallets } from '@/core/security/use-passkey-wallets';
import { Modal } from '@/core/components/ui/modal';
import { OptionRow } from '@/core/components/ui/option-row';

export type AddWalletMode = 'create' | 'import' | 'ledger';

const OPTIONS: {
  mode: AddWalletMode;
  title: string;
  subtitle: string;
  Icon: typeof KeyRound;
}[] = [
  {
    mode: 'create',
    title: 'New wallet',
    subtitle: 'Generate a new recovery phrase',
    Icon: Plus,
  },
  {
    mode: 'import',
    title: 'Recovery phrase',
    subtitle: 'Import with 12 or 24 words',
    Icon: KeyRound,
  },
  {
    mode: 'ledger',
    title: 'Ledger',
    subtitle: 'Connect a hardware wallet',
    Icon: Usb,
  },
];

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chosen way to add a wallet. */
  onSelect: (mode: AddWalletMode) => void;
  /** Optional callback fired after Passkey wallets are restored. */
  onPasskeyRestored?: () => void;
}

/** Wallet picker: create a fresh wallet, import a recovery phrase, restore from Passkey, or connect a Ledger. */
export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onPasskeyRestored,
}) => {
  const navigate = useNavigate();
  const { isSupported, isInsecureContext, isRestoring, restoreFromPasskey } =
    usePasskeyWallets();

  const handlePasskeyRestore = async () => {
    if (isInsecureContext) {
      toast.error(
        'Passkeys require a secure connection (HTTPS). On mobile browsers, please access via HTTPS or use Telegram.',
      );
      return;
    }
    try {
      const result = await restoreFromPasskey();
      if (!result) return;
      if (result.importedCount > 0) {
        toast.success(
          result.importedCount === 1
            ? 'Wallet restored from Passkey'
            : `Restored ${result.importedCount} wallets from Passkey`,
        );
      } else {
        toast.info('Wallet is already imported — switched to wallet');
      }
      onClose();
      onPasskeyRestored?.();
      navigate('/wallet', { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to restore wallet from Passkey',
      );
    }
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title>Add wallet</Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-3 gap-2">
        {OPTIONS.slice(0, 2).map(({ mode, title, subtitle, Icon }) => (
          <OptionRow
            key={mode}
            testId={`add-wallet-${mode}`}
            icon={<Icon className="w-7 h-7" strokeWidth={1.8} />}
            title={title}
            subtitle={subtitle}
            disabled={isRestoring}
            onClick={() => onSelect(mode)}
          />
        ))}
        {(isSupported || isInsecureContext) && (
          <OptionRow
            testId="add-wallet-passkey"
            icon={<Fingerprint className="w-7 h-7" strokeWidth={1.8} />}
            title="Passkey"
            subtitle={
              isRestoring
                ? 'Restoring from mobile keystore…'
                : 'Restore from mobile keystore'
            }
            loading={isRestoring}
            disabled={isRestoring}
            onClick={() => {
              void handlePasskeyRestore();
            }}
          />
        )}
        {OPTIONS.slice(2).map(({ mode, title, subtitle, Icon }) => (
          <OptionRow
            key={mode}
            testId={`add-wallet-${mode}`}
            icon={<Icon className="w-7 h-7" strokeWidth={1.8} />}
            title={title}
            subtitle={subtitle}
            disabled={isRestoring}
            onClick={() => onSelect(mode)}
          />
        ))}
      </Modal.Body>
    </Modal.Container>
  );
};
