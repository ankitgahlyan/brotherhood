/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  isTelegramBiometricsAvailable,
  isTelegramBiometricsRegistered,
  initTelegramBiometrics,
  saveTelegramBiometricsPassword,
  authenticateTelegramBiometrics,
  clearTelegramBiometrics,
  getRawTelegramWebApp,
  isTelegramEnvironment,
} from '../lib/telegram';

/**
 * Returns true if the app is actually running inside Telegram and the Telegram BiometricManager API
 * is present on window.Telegram.WebApp. Outside Telegram (desktop Chrome, regular browsers),
 * telegram-web-app.js exposes a version 6.0 stub with an inert BiometricManager that does not work.
 */
export function hasTelegramBiometricManager(): boolean {
  if (import.meta.env.VITE_APP_TARGET === 'web') return false;
  return (
    isTelegramEnvironment() && Boolean(getRawTelegramWebApp()?.BiometricManager)
  );
}

const BIOMETRIC_VAULT_KEY = 'brotherhood_biometric_vault';
const BIOMETRIC_DISABLED_KEY = 'brotherhood_biometrics_disabled';
export const TELEGRAM_BUNDLE_CACHE_KEY = 'brotherhood_tg_passkey_bundle';
export const PASSKEY_BACKED_UP_RECORDS_KEY =
  'brotherhood_passkey_backed_up_records';
const TELEGRAM_TOKEN_PREFIX = 'bro1:';
export const BIOMETRICS_CHANGED_EVENT = 'brotherhood:biometrics-changed';

export function notifyBiometricsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BIOMETRICS_CHANGED_EVENT));
  }
}

export function parseTelegramBiometricToken(rawToken: string | null): {
  password: string | null;
  bundleBase64: string | null;
} {
  if (!rawToken) return { password: null, bundleBase64: null };
  if (!rawToken.startsWith(TELEGRAM_TOKEN_PREFIX)) {
    return { password: rawToken, bundleBase64: null };
  }
  const rest = rawToken.slice(TELEGRAM_TOKEN_PREFIX.length);
  const sepIndex = rest.indexOf(':');
  if (sepIndex === -1) {
    try {
      return { password: decodeURIComponent(rest), bundleBase64: null };
    } catch {
      return { password: rest, bundleBase64: null };
    }
  }
  const encodedPassword = rest.slice(0, sepIndex);
  const bundleBase64 = rest.slice(sepIndex + 1) || null;
  try {
    return {
      password: decodeURIComponent(encodedPassword),
      bundleBase64,
    };
  } catch {
    return { password: encodedPassword, bundleBase64 };
  }
}

export function formatTelegramBiometricToken(
  password: string,
  bundleBase64?: string | null,
): string {
  let resolvedBundle = bundleBase64;
  if (resolvedBundle === undefined && typeof window !== 'undefined') {
    try {
      resolvedBundle = localStorage.getItem(TELEGRAM_BUNDLE_CACHE_KEY);
    } catch {
      resolvedBundle = null;
    }
  }
  if (!resolvedBundle) {
    return password;
  }
  const candidate = `${TELEGRAM_TOKEN_PREFIX}${encodeURIComponent(password)}:${resolvedBundle}`;
  return candidate.length <= 1024 ? candidate : password;
}

interface BiometricVaultData {
  credentialId: string;
  encryptedPassword: string;
  salt: string;
  iv: string;
}

// Utility base64 <-> ArrayBuffer converters
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Returns true if the browser execution environment is a Secure Context (HTTPS or localhost).
 */
export function isSecureContextAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.isSecureContext);
}

/**
 * Returns true if the app is accessed on the Web over an insecure context (e.g. plain HTTP on LAN).
 * In this state, WebAuthn and Web Crypto are unavailable.
 */
export function isInsecureWebContext(): boolean {
  if (typeof window === 'undefined') return false;
  if (hasTelegramBiometricManager()) return false;
  return !window.isSecureContext;
}

/**
 * Check if the current browser/device supports WebAuthn platform authenticators or Telegram BiometricManager.
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (hasTelegramBiometricManager()) {
    await initTelegramBiometrics();
    return isTelegramBiometricsAvailable();
  }

  // WebAuthn and Web Crypto require a Secure Context (HTTPS or localhost)
  if (!window.isSecureContext) {
    return false;
  }

  if (!window.PublicKeyCredential || !window.crypto?.subtle) {
    return false;
  }
  try {
    if (
      typeof window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
    ) {
      return false;
    }
    const checkPromise =
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), 1500),
    );
    const available = await Promise.race([checkPromise, timeoutPromise]);
    return Boolean(available);
  } catch {
    return false;
  }
}

/**
 * Check if biometrics is currently registered and enabled on this device.
 */
export function isBiometricsRegistered(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (localStorage.getItem(BIOMETRIC_DISABLED_KEY) === 'true') {
      return false;
    }
  } catch {
    // ignore storage access errors
  }

  if (hasTelegramBiometricManager()) {
    return isTelegramBiometricsRegistered();
  }

  try {
    const raw = localStorage.getItem(BIOMETRIC_VAULT_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as BiometricVaultData;
    return Boolean(data.credentialId && data.encryptedPassword);
  } catch {
    return false;
  }
}

/**
 * Derive an AES-GCM crypto key using PBKDF2 from a salt and local secret.
 */
async function deriveVaultKey(
  salt: Uint8Array,
  credentialId: string,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKeyMaterial = encoder.encode(`brotherhood_vault_${credentialId}`);

  const importedMaterial = await crypto.subtle.importKey(
    'raw',
    baseKeyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt and persist the vault password in localStorage bound to an existing WebAuthn credential ID.
 */
export async function enrollBiometricVaultWithCredentialId(
  credIdString: string,
  password: string,
): Promise<void> {
  if (!credIdString || !password || typeof window === 'undefined') return;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveVaultKey(salt, credIdString);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(password),
  );

  const vaultData: BiometricVaultData = {
    credentialId: credIdString,
    encryptedPassword: bufferToBase64(encrypted),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };

  localStorage.removeItem(BIOMETRIC_DISABLED_KEY);
  localStorage.setItem(BIOMETRIC_VAULT_KEY, JSON.stringify(vaultData));
  notifyBiometricsChanged();
}

/**
 * Register a platform biometric credential (WebAuthn or Telegram BiometricManager) and store the password.
 */
export async function registerBiometrics(
  password: string,
  username = 'BrotherHood Wallet',
): Promise<boolean> {
  if (!password) return false;
  if (!isSecureContextAvailable() && !hasTelegramBiometricManager()) {
    throw new Error('Biometrics requires a secure connection (HTTPS).');
  }
  const supported = await isBiometricsSupported();
  if (!supported) {
    throw new Error('Biometrics not supported on this device');
  }

  if (hasTelegramBiometricManager()) {
    const saved = await saveTelegramBiometricsPassword(
      formatTelegramBiometricToken(password),
      'BrotherHood Wallet',
    );
    if (saved) {
      localStorage.removeItem(BIOMETRIC_DISABLED_KEY);
      notifyBiometricsChanged();
    }
    return saved;
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'BrotherHood Wallet',
        },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'discouraged',
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Biometric registration was not completed');
    }

    const credIdString = bufferToBase64(credential.rawId);
    await enrollBiometricVaultWithCredentialId(credIdString, password);
    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'NotAllowedError' || err.name === 'AbortError')
    ) {
      // User cancelled prompt
      return false;
    }
    console.error('[Biometrics] Registration error:', err);
    throw err;
  }
}

/**
 * Authenticate with platform biometrics (Fingerprint / Face ID / Touch ID) and return the decrypted password.
 */
export async function authenticateBiometrics(): Promise<string | null> {
  if (!isBiometricsRegistered()) {
    return null;
  }

  if (hasTelegramBiometricManager()) {
    const rawToken = await authenticateTelegramBiometrics(
      'Unlock BrotherHood Wallet',
    );
    return parseTelegramBiometricToken(rawToken).password;
  }

  if (!isSecureContextAvailable()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(BIOMETRIC_VAULT_KEY);
    if (!raw) return null;
    const vaultData = JSON.parse(raw) as BiometricVaultData;

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credIdBuffer = base64ToBuffer(vaultData.credentialId);

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            type: 'public-key',
            id: credIdBuffer,
          },
        ],
        userVerification: 'preferred',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return null;
    }

    const salt = new Uint8Array(base64ToBuffer(vaultData.salt));
    const iv = new Uint8Array(base64ToBuffer(vaultData.iv));
    const encryptedBytes = base64ToBuffer(vaultData.encryptedPassword);

    const key = await deriveVaultKey(salt, vaultData.credentialId);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      encryptedBytes,
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'NotAllowedError' ||
        err.name === 'AbortError' ||
        err.name === 'SecurityError')
    ) {
      // User cancelled prompt or transient user activation missing
      return null;
    }
    console.warn('[Biometrics] Authentication failed:', err);
    return null;
  }
}

/**
 * Remove biometrics from this device.
 */
export function clearBiometrics(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BIOMETRIC_DISABLED_KEY, 'true');
    localStorage.removeItem(BIOMETRIC_VAULT_KEY);
    localStorage.removeItem(TELEGRAM_BUNDLE_CACHE_KEY);
  } catch {
    // ignore storage errors
  }
  if (hasTelegramBiometricManager()) {
    void clearTelegramBiometrics();
  }
  notifyBiometricsChanged();
}
