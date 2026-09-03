/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const BIOMETRIC_VAULT_KEY = 'brotherhood_biometric_vault';

interface BiometricVaultData {
  credentialId: string;
  encryptedPassword: string;
  salt: string;
  iv: string;
}

// Utility base64url <-> ArrayBuffer converters
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if the current browser/device supports WebAuthn platform authenticators (Fingerprint, TouchID, FaceID, Windows Hello).
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (
      typeof window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
    ) {
      return false;
    }
    const available =
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
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
 * Register a platform biometric credential (WebAuthn) and store the password in the encrypted vault.
 */
export async function registerBiometrics(
  password: string,
  username = 'BrotherHood Wallet',
): Promise<boolean> {
  if (!password) return false;
  const supported = await isBiometricsSupported();
  if (!supported) {
    throw new Error('Biometrics not supported on this device');
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
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Biometric registration was not completed');
    }

    const credIdString = bufferToBase64(credential.rawId);
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

    localStorage.setItem(BIOMETRIC_VAULT_KEY, JSON.stringify(vaultData));
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
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
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
      (err.name === 'NotAllowedError' || err.name === 'AbortError')
    ) {
      // User cancelled prompt
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
  localStorage.removeItem(BIOMETRIC_VAULT_KEY);
}
