import { useState, useEffect, useCallback } from 'react';

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

export interface BrowserInstruction {
  title: string;
  steps: string[];
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'standalone' | 'browser'>(
    'standalone',
  );

  // Platform detection
  const isIos =
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid =
    typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const isMobile = isIos || isAndroid;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as standalone
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const isIosStandalone =
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      const isDisplayStandalone = isStandaloneMedia || isIosStandalone;
      setIsStandalone(isDisplayStandalone);
      if (isDisplayStandalone) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // Check dismissal status
    try {
      const dismissedTimestamp = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (dismissedTimestamp) {
        const timestamp = parseInt(dismissedTimestamp, 10);
        if (Date.now() - timestamp < DISMISSAL_EXPIRY_MS) {
          setIsDismissed(true);
        } else {
          localStorage.removeItem(STORAGE_KEY_DISMISSED);
          setIsDismissed(false);
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const setManifestDisplayMode = useCallback(
    (mode: 'standalone' | 'browser') => {
      setActiveMode(mode);
      if (typeof document === 'undefined') return;

      // Switch manifest link
      let manifestLink = document.querySelector<HTMLLinkElement>(
        'link[rel="manifest"]',
      );
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }

      const base = import.meta.env.BASE_URL || '/';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;

      if (mode === 'browser') {
        manifestLink.href = `${cleanBase}site.browser.webmanifest`;

        // Update mobile capability meta tags to prevent standalone launch
        const appleMeta = document.querySelector<HTMLMetaElement>(
          'meta[name="apple-mobile-web-app-capable"]',
        );
        if (appleMeta) appleMeta.content = 'no';
        const mobileMeta = document.querySelector<HTMLMetaElement>(
          'meta[name="mobile-web-app-capable"]',
        );
        if (mobileMeta) mobileMeta.content = 'no';
      } else {
        manifestLink.href = `${cleanBase}site.webmanifest`;

        const appleMeta = document.querySelector<HTMLMetaElement>(
          'meta[name="apple-mobile-web-app-capable"]',
        );
        if (appleMeta) appleMeta.content = 'yes';
        const mobileMeta = document.querySelector<HTMLMetaElement>(
          'meta[name="mobile-web-app-capable"]',
        );
        if (mobileMeta) mobileMeta.content = 'yes';
      }
    },
    [],
  );

  const installStandalone = useCallback(async (): Promise<{
    success: boolean;
    outcome: 'accepted' | 'dismissed' | 'unsupported';
  }> => {
    setManifestDisplayMode('standalone');

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
          return { success: true, outcome: 'accepted' };
        }
        return { success: false, outcome: 'dismissed' };
      } catch (err) {
        console.error('Error invoking PWA install prompt:', err);
        return { success: false, outcome: 'unsupported' };
      }
    }

    return { success: false, outcome: 'unsupported' };
  }, [deferredPrompt, setManifestDisplayMode]);

  const configureBrowserShortcut = useCallback(() => {
    setManifestDisplayMode('browser');
  }, [setManifestDisplayMode]);

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

  const getShortcutInstructions = useCallback((): BrowserInstruction => {
    if (isIos) {
      return {
        title: 'Add Shortcut on iOS Safari',
        steps: [
          'Tap the Share button (square with arrow pointing up) in Safari navigation bar.',
          'Scroll down and tap "Add to Home Screen".',
          'Confirm the title and tap "Add" at top right.',
          'The shortcut will open directly inside Safari as a browser tab.',
        ],
      };
    }

    if (isAndroid) {
      return {
        title: 'Add Shortcut on Android Chrome',
        steps: [
          'Tap the browser menu button (three vertical dots ⋮) at top right.',
          'Tap "Add to Home screen" (or "Add shortcut").',
          'Confirm and tap "Add".',
          'The shortcut will open in Chrome with full browser tabs and address bar.',
        ],
      };
    }

    return {
      title: 'Add Shortcut on Desktop Browser',
      steps: [
        'Press Ctrl+D (or Cmd+D on Mac) to bookmark this page.',
        'Alternatively, drag the URL lock icon from the address bar to your desktop.',
      ],
    };
  }, [isIos, isAndroid]);

  return {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isDismissed,
    isInstallable: !!deferredPrompt || isIos,
    isIos,
    isAndroid,
    isMobile,
    activeMode,
    installStandalone,
    configureBrowserShortcut,
    dismissPrompt,
    resetDismissal,
    getShortcutInstructions,
  };
}
