import React from 'react';
import { Modal } from '@/core/components/ui/modal';
import { NetworkSettingsPanel } from '@/features/developer/components/network-settings-panel';

interface SettingsApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsApiKeysModal: React.FC<SettingsApiKeysModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title>Network & API Providers</Modal.Title>
      </Modal.Header>

      <Modal.Body className="pb-4">
        <NetworkSettingsPanel onSaved={onClose} />
      </Modal.Body>
    </Modal.Container>
  );
};
