import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import {
  getBiometricStatus,
  isBiometricsAvailable,
  setupBiometrics,
  authenticateBiometrics,
  clearBiometrics,
} from './index';

describe('Biometrics & Fingerprint Lock Module', () => {
  const origWindow = (globalThis as any).window;
  const origNavigator = (globalThis as any).navigator;
  const origLocalStorage = (globalThis as any).localStorage;
  const origPublicKeyCredential = (globalThis as any).PublicKeyCredential;

  beforeEach(() => {
    // Reset globals
    const mockLocalStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      },
    };

    const baseWindow = origWindow || {};
    (globalThis as any).window = {
      ...baseWindow,
      Telegram: undefined,
      PublicKeyCredential: undefined,
      localStorage: mockLocalStorage,
      location: { hostname: 'localhost' },
      navigator: { ...(origNavigator || {}) },
      addEventListener: baseWindow.addEventListener || (() => {}),
      removeEventListener: baseWindow.removeEventListener || (() => {}),
      dispatchEvent: baseWindow.dispatchEvent || (() => true),
    };
    (globalThis as any).localStorage = mockLocalStorage;
  });

  afterEach(() => {
    (globalThis as any).window = origWindow;
    (globalThis as any).navigator = origNavigator;
    (globalThis as any).localStorage = origLocalStorage;
    (globalThis as any).PublicKeyCredential = origPublicKeyCredential;
  });

  it('reports unavailable when no biometrics/webauthn in environment', async () => {
    const available = await isBiometricsAvailable();
    expect(available).toBe(false);

    const status = await getBiometricStatus();
    expect(status.supported).toBe(false);
    expect(status.enrolled).toBe(false);
  });

  it('delegates to WebAuthn when running in Web browser', async () => {
    const mockCred = {
      isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
    };
    (globalThis as any).window.PublicKeyCredential = mockCred;
    (globalThis as any).PublicKeyCredential = mockCred;

    const mockNavigator = {
      credentials: {
        create: async () => ({
          rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        }),
        get: async () => ({
          id: 'test-assertion',
        }),
      },
    };
    (globalThis as any).window.navigator = mockNavigator;
    (globalThis as any).navigator = mockNavigator;

    const available = await isBiometricsAvailable();
    expect(available).toBe(true);

    const setupResult = await setupBiometrics('my-secret-key');
    expect(setupResult).toBe(true);

    const status = await getBiometricStatus();
    expect(status.supported).toBe(true);
    expect(status.enrolled).toBe(true);

    const unlocked = await authenticateBiometrics();
    expect(unlocked).toBe('my-secret-key');

    await clearBiometrics();
    const statusAfterClear = await getBiometricStatus();
    expect(statusAfterClear.enrolled).toBe(false);
  });

  it('delegates to Telegram BiometricManager in TWA environment', async () => {
    let savedToken = '';
    const mockBiometricManager = {
      isInited: true,
      isBiometricAvailable: true,
      biometricType: 'finger' as const,
      isAccessGranted: true,
      isBiometricTokenSaved: false,
      init: (cb?: () => void) => cb && cb(),
      requestAccess: (_params: any, cb: (granted: boolean) => void) => cb(true),
      updateBiometricToken: (
        token: string,
        cb?: (success: boolean) => void,
      ) => {
        savedToken = token;
        mockBiometricManager.isBiometricTokenSaved = Boolean(token);
        if (cb) cb(true);
      },
      authenticate: (
        _params: any,
        cb: (success: boolean, token?: string) => void,
      ) => {
        cb(true, savedToken);
      },
      openSettings: () => {},
    };

    (globalThis as any).window.Telegram = {
      WebApp: {
        platform: 'ios',
        BiometricManager: mockBiometricManager,
      },
    };

    const available = await isBiometricsAvailable();
    expect(available).toBe(true);

    const setupResult = await setupBiometrics('twa-secret-pin');
    expect(setupResult).toBe(true);
    expect(mockBiometricManager.isBiometricTokenSaved).toBe(true);

    const status = await getBiometricStatus();
    expect(status.supported).toBe(true);
    expect(status.enrolled).toBe(true);
    expect(status.biometricType).toBe('finger');

    const authResult = await authenticateBiometrics();
    expect(authResult).toBe('twa-secret-pin');

    await clearBiometrics();
    expect(mockBiometricManager.isBiometricTokenSaved).toBe(false);
  });
});
