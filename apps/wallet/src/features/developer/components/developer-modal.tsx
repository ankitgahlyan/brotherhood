import React, { useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { DeveloperScreen } from './developer-screen';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  const handleDragEnd = (_: any, info: PanInfo) => {
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Draggable handle bar at the very top for slide-down gesture */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            className="w-full pt-2 pb-1.5 flex flex-col items-center bg-background border-b border-border/40 cursor-grab active:cursor-grabbing select-none flex-shrink-0 touch-none"
            aria-label="Drag down to close"
          >
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
            <span className="text-[10px] text-muted-foreground/60 tracking-wider uppercase mt-1">
              Drag down to close
            </span>
          </motion.div>

          {/* Fullscreen content area */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="flex-1 overflow-y-auto flex flex-col"
          >
            <DeveloperScreen onClose={onClose} isModal />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
