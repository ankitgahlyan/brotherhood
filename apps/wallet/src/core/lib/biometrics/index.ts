/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  isTelegramEnvironment,
  getRawTelegramWebApp,
  initTelegramBiometrics,
  isTelegramBiometricsAvailable,
  saveTelegramBiometricsPassword,
  authenticateTelegramBiometrics,
} from '../telegram/telegram-adapter';

const WEBAUTHN_STORAGE_KEY = 'brotherhood_webauthn_credential';
const RP_NAME = 'BrotherHood Wallet';

export interface BiometricStatus {
  supported: boolean;
  enrolled: boolean;
  biometricType: 'finger' | 'face' | 'webauthn' | 'unknown';
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getPublicKeyCredential(): any {
  if (typeof window !== 'undefined' && (window as any).PublicKeyCredential) {
    return (window as any).PublicKeyCredential;
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).PublicKeyCredential
  ) {
    return (globalThis as any).PublicKeyCredential;
  }
  return undefined;
}

/**
 * Check if WebAuthn is available in standard Web browser.
 * NEVER called inside Telegram WebView.
 */
export async function isWebAuthnAvailable(): Promise<boolean> {
  const Cred = getPublicKeyCredential();
  if (!Cred) {
    return false;
  }
  try {
    if (Cred.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await Cred.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if biometrics is available in current environment.
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (isTelegramEnvironment()) {
    return isTelegramBiometricsAvailable();
  }
  return isWebAuthnAvailable();
}

/**
 * Get comprehensive biometrics status across TWA and Web.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  if (isTelegramEnvironment()) {
    const rawApp = getRawTelegramWebApp();
    const bm = rawApp?.BiometricManager;
    if (bm && !bm.isInited) {
      await initTelegramBiometrics();
    }
    const available = Boolean(bm?.isBiometricAvailable);
    const enrolled = Boolean(
      available && bm?.isAccessGranted && bm?.isBiometricTokenSaved,
    );
    const type = bm?.biometricType ?? 'unknown';
    return {
      supported: available,
      enrolled,
      biometricType: type === 'finger' || type === 'face' ? type : 'unknown',
    };
  }

  const supported = await isWebAuthnAvailable();
  const stored =
    typeof window !== 'undefined'
      ? window.localStorage?.getItem(WEBAUTHN_STORAGE_KEY)
      : typeof globalThis !== 'undefined'
        ? (globalThis as any).localStorage?.getItem(WEBAUTHN_STORAGE_KEY)
        : null;
  return {
    supported,
    enrolled: supported && Boolean(stored),
    biometricType: supported ? 'webauthn' : 'unknown',
  };
}

/**
 * Enroll / set up biometric credential.
 * Saves an encrypted key/token or registers WebAuthn credential.
 */
export async function setupBiometrics(secret: string): Promise<boolean> {
  if (isTelegramEnvironment()) {
    return saveTelegramBiometricsPassword(secret, 'BrotherHood Wallet');
  }

  const Cred = getPublicKeyCredential();
  const nav =
    typeof window !== 'undefined'
      ? window.navigator
      : (globalThis as any).navigator;

  if (!Cred || !nav?.credentials?.create) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const hostname =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'localhost';

  const credential = (await nav.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: RP_NAME,
        id: hostname,
      },
      user: {
        id: userId,
        name: 'BrotherHood User',
        displayName: 'BrotherHood User',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    return false;
  }

  const credentialId = bufferToBase64(credential.rawId);
  const storage =
    typeof window !== 'undefined'
      ? window.localStorage
      : (globalThis as any).localStorage;

  storage?.setItem(
    WEBAUTHN_STORAGE_KEY,
    JSON.stringify({
      id: credentialId,
      secret,
    }),
  );

  return true;
}

/**
 * Authenticate using biometrics (TWA BiometricManager or WebAuthn assertion).
 * Returns the unlocked secret/token or null on failure.
 */
export async function authenticateBiometrics(
  reason = 'Unlock BrotherHood Wallet',
): Promise<string | null> {
  if (isTelegramEnvironment()) {
    return authenticateTelegramBiometrics(reason);
  }

  const Cred = getPublicKeyCredential();
  const nav =
    typeof window !== 'undefined'
      ? window.navigator
      : (globalThis as any).navigator;
  const storage =
    typeof window !== 'undefined'
      ? window.localStorage
      : (globalThis as any).localStorage;

  if (!Cred || !nav?.credentials?.get || !storage) {
    return null;
  }

  const stored = storage.getItem(WEBAUTHN_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const { id, secret } = JSON.parse(stored);
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const rawId = base64ToBuffer(id);

    const assertion = await nav.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            type: 'public-key',
            id: rawId,
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    if (assertion) {
      return secret ?? 'authenticated';
    }
  } catch (err) {
    console.error('WebAuthn authentication failed', err);
  }

  return null;
}

/**
 * Remove biometrics registration.
 */
export async function clearBiometrics(): Promise<void> {
  if (isTelegramEnvironment()) {
    await saveTelegramBiometricsPassword('');
    return;
  }
  const storage =
    typeof window !== 'undefined'
      ? window.localStorage
      : (globalThis as any).localStorage;
  storage?.removeItem(WEBAUTHN_STORAGE_KEY);
}
