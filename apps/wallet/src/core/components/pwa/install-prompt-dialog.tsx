import React from 'react';
import { AppWindow, Share2, Download } from 'lucide-react';
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
} from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { usePwaInstall } from '@/core/hooks/use-pwa-install';

interface InstallPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstallPromptDialog: React.FC<InstallPromptDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    deferredPrompt,
    isIos,
    installStandalone,
    dismissPrompt,
    getInstallInstructions,
  } = usePwaInstall();

  const handleClose = () => {
    dismissPrompt();
    onOpenChange(false);
  };

  const handleInstallClick = async () => {
    const res = await installStandalone();
    if (res.success) {
      onOpenChange(false);
    }
  };

  const instructions = getInstallInstructions();

  return (
    <ModalContainer
      isOpened={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
        else onOpenChange(true);
      }}
      className="p-0 overflow-hidden bg-card border-border"
    >
      <ModalHeader onClose={handleClose}>
        <ModalTitle className="text-lg font-bold flex items-center gap-2">
          <AppWindow className="w-5 h-5 text-primary" />
          {deferredPrompt ? 'Install BrotherHood' : instructions.title}
        </ModalTitle>
      </ModalHeader>

      <div className="px-5 pb-6 space-y-4">
        {deferredPrompt ? (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Install BrotherHood as a standalone app for instant launch from
              your home screen or desktop without browser toolbars.
            </p>
            <Button
              onClick={handleInstallClick}
              className="w-full cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Follow these steps to install BrotherHood in standalone mode:
            </p>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              {instructions.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-foreground leading-relaxed pt-0.5">
                    {isIos && idx === 0 ? (
                      <>
                        Tap the{' '}
                        <strong className="text-foreground">Share</strong>{' '}
                        button{' '}
                        <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-primary" />{' '}
                        in the Safari toolbar.
                      </>
                    ) : (
                      step
                    )}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={handleClose} className="w-full cursor-pointer">
              Got it
            </Button>
          </div>
        )}
      </div>
    </ModalContainer>
  );
};
