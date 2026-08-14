/**
 * Client-side Web Crypto AES-GCM encryption & decryption helpers for wallet seed phrases.
 */

const DEFAULT_PASSCODE = 'brotherhood-default-local-passcode-key-v1';

async function getEncryptionKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode || DEFAULT_PASSCODE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(
  text: string,
  passcode: string = DEFAULT_PASSCODE
): Promise<{ ciphertext: string; salt: string; iv: string }> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await getEncryptionKey(passcode, salt);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    encoder.encode(text)
  );

  const ciphertext = Buffer.from(encryptedBuffer).toString('base64');
  const saltHex = Buffer.from(salt).toString('hex');
  const ivHex = Buffer.from(iv).toString('hex');

  return { ciphertext, salt: saltHex, iv: ivHex };
}

export async function decryptText(
  ciphertext: string,
  saltHex: string,
  ivHex: string,
  passcode: string = DEFAULT_PASSCODE
): Promise<string> {
  const decoder = new TextDecoder();
  const salt = new Uint8Array(Buffer.from(saltHex, 'hex'));
  const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
  const encryptedBuffer = new Uint8Array(Buffer.from(ciphertext, 'base64'));

  const key = await getEncryptionKey(passcode, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    encryptedBuffer
  );

  return decoder.decode(decryptedBuffer);
}

// ─── Compat API (used by test suite and wallet index) ─────────────────────────

/**
 * Binary format: [16-byte salt][12-byte IV][ciphertext...]
 * Encoded as base64.
 */
export const SimpleEncryption = {
  async encrypt(plaintext: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getEncryptionKey(password, salt);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      encoder.encode(plaintext)
    );

    const combined = new Uint8Array(16 + 12 + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, 16);
    combined.set(new Uint8Array(encryptedBuffer), 28);

    return Buffer.from(combined).toString('base64');
  },

  async decrypt(encoded: string, password: string): Promise<string> {
    const decoder = new TextDecoder();
    const buffer = Buffer.from(encoded, 'base64');

    if (buffer.length < 28) {
      throw new Error('Invalid encrypted payload size');
    }

    const salt = new Uint8Array(buffer.buffer, 0, 16);
    const iv = new Uint8Array(buffer.buffer, 16, 12);
    const ciphertext = new Uint8Array(buffer.buffer, 28);

    const key = await getEncryptionKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      ciphertext
    );

    return decoder.decode(decrypted);
  },
};

/** Generate a random 16-byte salt as base64 string. */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(salt).toString('base64');
}

/** Compute a SHA-256 hex hash of a password. */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hashBuffer).toString('hex');
}

/** Verify a password against a stored SHA-256 hex hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}
