import { useState, useEffect, useCallback } from 'react';
import { isTelegramEnvironment } from '@/core/lib/telegram';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY_DISMISSED = 'brotherhood-pwa-install-dismissed';
const DISMISSAL_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface InstallInstruction {
  title: string;
  steps: string[];
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalIsInstalled = false;
const stateListeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of stateListeners) {
    listener();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    globalIsInstalled = true;
    notifyListeners();
  });
}

function getInitialDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedTimestamp) {
      const timestamp = parseInt(dismissedTimestamp, 10);
      if (Date.now() - timestamp < DISMISSAL_EXPIRY_MS) {
        return true;
      }
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    }
  } catch {
    // Ignore localStorage errors
  }
  return false;
}

export function detectStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.VITE_APP_TARGET === 'twa' || isTelegramEnvironment()) {
    return true;
  }
  const isStandaloneMedia =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  const isIosStandalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  const isAndroidTwa =
    typeof document !== 'undefined' &&
    document.referrer.startsWith('android-app://');
  return isStandaloneMedia || isIosStandalone || isAndroidTwa;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(() => globalDeferredPrompt);
  const [isStandalone, setIsStandalone] =
    useState<boolean>(detectStandaloneMode);
  const [isDismissed, setIsDismissed] = useState<boolean>(getInitialDismissed);
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => globalIsInstalled || detectStandaloneMode(),
  );

  const isIos =
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid =
    typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const isMobile = isIos || isAndroid;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncGlobalState = () => {
      const standaloneNow = detectStandaloneMode();
      setDeferredPrompt(globalDeferredPrompt);
      setIsStandalone(standaloneNow);
      if (globalIsInstalled || standaloneNow) {
        setIsInstalled(true);
      }
    };

    stateListeners.add(syncGlobalState);
    syncGlobalState();

    const mqlStandalone = window.matchMedia('(display-mode: standalone)');
    const mqlOverlay = window.matchMedia(
      '(display-mode: window-controls-overlay)',
    );
    const handleMediaChange = () => {
      syncGlobalState();
    };
    mqlStandalone.addEventListener('change', handleMediaChange);
    mqlOverlay.addEventListener('change', handleMediaChange);

    return () => {
      stateListeners.delete(syncGlobalState);
      mqlStandalone.removeEventListener('change', handleMediaChange);
      mqlOverlay.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const installStandalone = useCallback(async (): Promise<{
    success: boolean;
    outcome: 'accepted' | 'dismissed' | 'unsupported';
  }> => {
    const promptEvent = globalDeferredPrompt ?? deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          globalDeferredPrompt = null;
          globalIsInstalled = true;
          notifyListeners();
          return { success: true, outcome: 'accepted' };
        }
        return { success: false, outcome: 'dismissed' };
      } catch (err) {
        console.error('Error invoking PWA install prompt:', err);
        return { success: false, outcome: 'unsupported' };
      }
    }

    return { success: false, outcome: 'unsupported' };
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
    } catch {
      // Ignore
    }
  }, []);

  const resetDismissal = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    } catch {
      // Ignore
    }
  }, []);

  const getInstallInstructions = useCallback((): InstallInstruction => {
    if (isIos) {
      return {
        title: 'Install on iOS Safari',
        steps: [
          'Tap the Share button (square with arrow pointing up) in the Safari toolbar.',
          'Scroll down the menu and tap "Add to Home Screen".',
          'Tap "Add" in the top-right corner to launch BrotherHood as a standalone app.',
        ],
      };
    }

    if (isAndroid) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the browser menu button (three vertical dots ⋮) in the top-right corner.',
          'Tap "Install app" (or "Add to Home screen").',
          'Confirm by tapping "Install" in the prompt.',
        ],
      };
    }

    return {
      title: 'Install Desktop App',
      steps: [
        'Click the Install icon (monitor with down arrow) on the right side of your browser address bar.',
        'Or open your browser menu (⋮) and select "Install BrotherHood Wallet" / "Cast, save, and share → Install page as app".',
      ],
    };
  }, [isIos, isAndroid]);

  return {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isDismissed,
    isInstallable: !isStandalone && !isInstalled,
    isIos,
    isAndroid,
    isMobile,
    installStandalone,
    dismissPrompt,
    resetDismissal,
    getInstallInstructions,
  };
}
