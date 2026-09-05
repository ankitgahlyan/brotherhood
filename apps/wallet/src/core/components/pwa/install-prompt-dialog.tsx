import React, { useState } from 'react';
import {
  AppWindow,
  Globe,
  Share2,
  Check,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
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

type StepView =
  'choose' | 'ios-standalone' | 'shortcut-instructions' | 'success';

export const InstallPromptDialog: React.FC<InstallPromptDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    deferredPrompt,
    isStandalone,
    isIos,
    installStandalone,
    configureBrowserShortcut,
    dismissPrompt,
    getShortcutInstructions,
  } = usePwaInstall();

  const [currentStep, setCurrentStep] = useState<StepView>('choose');

  const handleInstallStandalone = async () => {
    if (deferredPrompt) {
      const res = await installStandalone();
      if (res.success) {
        setCurrentStep('success');
      }
    } else if (isIos) {
      setCurrentStep('ios-standalone');
    } else {
      // Manual desktop or unsupported
      setCurrentStep('ios-standalone');
    }
  };

  const handleSelectBrowserShortcut = () => {
    configureBrowserShortcut();
    setCurrentStep('shortcut-instructions');
  };

  const handleDismiss = () => {
    dismissPrompt();
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep('choose');
    }, 300);
  };

  const shortcutInstructions = getShortcutInstructions();

  return (
    <ModalContainer
      isOpened={open}
      onOpenChange={(val) => {
        if (!val) handleDismiss();
        else onOpenChange(true);
      }}
      className="p-0 overflow-hidden bg-card border-border"
    >
      <ModalHeader
        onClose={handleDismiss}
        onBack={
          currentStep !== 'choose' ? () => setCurrentStep('choose') : undefined
        }
      >
        <ModalTitle className="text-lg font-bold flex items-center gap-2">
          {currentStep === 'choose' && (
            <>
              <Sparkles className="w-5 h-5 text-primary" />
              Add BrotherHood
            </>
          )}
          {currentStep === 'ios-standalone' && 'Install as App'}
          {currentStep === 'shortcut-instructions' &&
            shortcutInstructions.title}
          {currentStep === 'success' && 'Installed Successfully'}
        </ModalTitle>
      </ModalHeader>

      <div className="px-5 pb-6 space-y-4">
        {/* Step: Choose Option */}
        {currentStep === 'choose' && (
          <>
            <p className="text-sm text-muted-foreground">
              Select whether you want to install BrotherHood as a standalone
              native-like app or add a convenient browser shortcut.
            </p>

            <div className="space-y-3 pt-1">
              {/* Option 1: Standalone App */}
              <div
                onClick={handleInstallStandalone}
                className="group relative rounded-xl p-4 border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AppWindow className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">
                        Standalone App (Recommended)
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        App Mode
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Opens in its own dedicated window without browser URL bars
                      or tabs. Faster loading and gesture navigation.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-primary">
                      <span>
                        {deferredPrompt
                          ? 'Install App Now'
                          : isIos
                            ? 'Show iOS Steps'
                            : 'Install Standalone'}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Browser Shortcut */}
              <div
                onClick={handleSelectBrowserShortcut}
                className="group relative rounded-xl p-4 border border-border bg-card/60 hover:bg-muted/60 hover:border-border/80 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">
                        Browser Shortcut
                      </h4>
                      <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Browser Mode
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Opens inside your web browser. Keeps your browser address
                      bar, bookmarking, and multi-tab workflow intact.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-foreground">
                      <span>Configure Browser Shortcut</span>
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isStandalone && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>
                  You are currently running BrotherHood in standalone app mode.
                </span>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Maybe Later
              </Button>
            </div>
          </>
        )}

        {/* Step: iOS Standalone Instructions */}
        {currentStep === 'ios-standalone' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <span className="text-xs text-foreground leading-relaxed pt-0.5">
                  Tap the <strong className="text-foreground">Share</strong>{' '}
                  button{' '}
                  <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-primary" />{' '}
                  in your Safari browser bar.
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <span className="text-xs text-foreground leading-relaxed pt-0.5">
                  Scroll down the action sheet and select{' '}
                  <strong className="text-foreground">
                    "Add to Home Screen"
                  </strong>
                  .
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <span className="text-xs text-foreground leading-relaxed pt-0.5">
                  Tap <strong className="text-foreground">Add</strong> in the
                  top-right corner. It will launch in full standalone mode!
                </span>
              </div>
            </div>

            <Button onClick={handleDismiss} className="w-full cursor-pointer">
              Got it
            </Button>
          </div>
        )}

        {/* Step: Browser Shortcut Instructions */}
        {currentStep === 'shortcut-instructions' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Browser mode activated! Your web manifest was switched so it
                opens in your regular browser.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              {shortcutInstructions.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-foreground leading-relaxed pt-0.5">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={handleDismiss} className="w-full cursor-pointer">
              Done
            </Button>
          </div>
        )}

        {/* Step: Success */}
        {currentStep === 'success' && (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm">
              App Ready!
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              BrotherHood has been installed to your home screen or application
              launcher.
            </p>
            <Button
              onClick={handleDismiss}
              className="w-full mt-2 cursor-pointer"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </ModalContainer>
  );
};
