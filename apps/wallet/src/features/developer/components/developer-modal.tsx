import React, { useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useDragControls,
  type PanInfo,
} from 'framer-motion';
import { DeveloperScreen } from './developer-screen';
import { useHistoryBack } from '@/core/hooks/use-history-back';
import {
  disableTelegramSwipeToClose,
  enableTelegramSwipeToClose,
} from '@/core/lib/telegram';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dragControls = useDragControls();

  // Register with Unified Back Stack (Tier 1 modal dismiss)
  useHistoryBack({
    isActive: isOpen,
    onBack: onClose,
  });

  // Lock Telegram vertical swipe-to-close while modal is open
  useEffect(() => {
    if (!isOpen) return undefined;

    disableTelegramSwipeToClose();
    return () => {
      enableTelegramSwipeToClose();
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // If dragged down far enough or fast enough, dismiss
    if (info.offset.y > 100 || info.velocity.y > 350) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dev-modal-container"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.8 }}
          onDragEnd={handleDragEnd}
          className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden"
        >
          <DeveloperScreen
            onClose={onClose}
            isModal
            onDragStart={(e) => dragControls.start(e)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
