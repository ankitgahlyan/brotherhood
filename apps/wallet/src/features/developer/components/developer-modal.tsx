import React from 'react';
import { Modal } from '@/core/components/ui/modal';
import { DeveloperScreen } from './developer-screen';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-4xl h-[92vh] flex flex-col p-0 overflow-hidden"
    >
      <DeveloperScreen onClose={onClose} isModal />
    </Modal.Container>
  );
};
