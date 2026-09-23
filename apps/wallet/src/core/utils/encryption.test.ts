import { describe, expect, it } from 'bun:test';
import { keyPairFromSeed, getSecureRandomBytes } from '@ton/crypto';
import {
  encryptMessageComment,
  decryptMessageComment,
  packBytesAsSnakeForEncryptedData,
  unpackSnakeCell,
} from './encryption';

describe('TON Comment Encryption & Decryption', () => {
  it('successfully encrypts and decrypts a comment between two parties', async () => {
    const aliceSeed = await getSecureRandomBytes(32);
    const aliceKey = keyPairFromSeed(aliceSeed);
    const aliceAddress =
      '0:1111111111111111111111111111111111111111111111111111111111111111';

    const bobSeed = await getSecureRandomBytes(32);
    const bobKey = keyPairFromSeed(bobSeed);
    const _bobAddress =
      '0:2222222222222222222222222222222222222222222222222222222222222222';

    const testComment = 'Hello Bob, this is a secret message!';

    // Alice encrypts for Bob
    const encryptedPayload = await encryptMessageComment(
      testComment,
      aliceKey.publicKey,
      bobKey.publicKey,
      aliceKey.secretKey,
      aliceAddress,
    );

    expect(encryptedPayload.length).toBeGreaterThan(4);
    // Opcode prefix 0x2167da4b
    expect(encryptedPayload[0]).toBe(0x21);
    expect(encryptedPayload[1]).toBe(0x67);
    expect(encryptedPayload[2]).toBe(0xda);
    expect(encryptedPayload[3]).toBe(0x4b);

    // Bob decrypts Alice's message
    const decrypted = await decryptMessageComment(
      encryptedPayload,
      bobKey.publicKey,
      bobKey.secretKey,
      aliceAddress,
    );

    expect(decrypted).toBe(testComment);
  });

  it('packs and unpacks encrypted payload into snake cells correctly', async () => {
    const payload = new Uint8Array(150);
    for (let i = 0; i < payload.length; i++) {
      payload[i] = i % 256;
    }

    const cell = packBytesAsSnakeForEncryptedData(payload);
    const unpacked = unpackSnakeCell(cell);

    expect(unpacked).toEqual(payload);
  });
});
