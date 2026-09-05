import React, { useState } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePwaInstall } from '@/core/hooks/use-pwa-install';
import { InstallPromptDialog } from './install-prompt-dialog';

export const PwaInstallBanner: React.FC = () => {
  const { isStandalone, isDismissed, isInstalled, dismissPrompt } =
    usePwaInstall();
  const [dialogOpen, setDialogOpen] = useState(false);

  // If already running standalone or installed or dismissed by user, don't show the floating banner
  if (isStandalone || isDismissed || isInstalled) {
    return (
      <InstallPromptDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    );
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
        <div className="flex items-center justify-between gap-3 p-3 bg-card/95 backdrop-blur-md border border-primary/20 shadow-xl shadow-black/20 rounded-2xl">
          <div
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground truncate">
                Install BrotherHood
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                Choose standalone app or browser shortcut
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dismiss banner"
              className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <InstallPromptDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
