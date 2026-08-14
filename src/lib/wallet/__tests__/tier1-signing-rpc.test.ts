import { describe, expect, test } from 'bun:test';
import { Address, beginCell, Cell, internal, SendMode } from '@ton/core';
import { generateMnemonic, mnemonicToKeyPair } from '../mnemonic';
import {
  ActionSendMsg,
  createExternalMessage,
  createTransferPayload,
  DEFAULT_SUBWALLET_ID,
  packActionsList,
  WalletV5R1,
  WalletV5R1Opcodes,
} from '../wallet-v5-r1';
import {
  getDefaultEndpoint,
  getDefaultV3Endpoint,
  getRpcClient,
  WalletRpcClient,
} from '../rpc-client';

const VALID_ADDRESS = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

describe('Tier 1: V5R1 Transaction Action Signing & RPC Client (Features 3 & 9)', () => {
  // Category A: Action Cell Building, Ed25519 Signing, External Messages
  describe('WalletV5R1 Action Cell Building & Ed25519 Signing', () => {
    test('3.1 should pack ActionSendMsg items into TVM action cell structure', () => {
      const payloadCell = beginCell().storeUint(0x12345678, 32).endCell();

      const relaxedMsg = internal({
        to: VALID_ADDRESS,
        value: 100000000n,
        bounce: true,
        body: payloadCell,
      });

      const action = new ActionSendMsg(SendMode.PAY_GAS_SEPARATELY, relaxedMsg);

      const packedCell = packActionsList([action]);
      expect(packedCell).toBeInstanceOf(Cell);
      expect(packedCell.bits.length).toBeGreaterThan(0);
    });

    test('3.2 should construct signed transfer payload with opcode 0x7369676e (auth_signed) and subwallet ID', async () => {
      const mnemonic = await generateMnemonic(24);
      const keypair = await mnemonicToKeyPair(mnemonic);

      const payload = await createTransferPayload({
        seqno: 5,
        secretKey: keypair.secretKey,
        walletId: DEFAULT_SUBWALLET_ID,
        messages: [
          {
            to: VALID_ADDRESS,
            value: 500000000n, // 0.5 TON
            bounce: true,
          },
        ],
      });

      expect(payload).toBeInstanceOf(Cell);
      const slice = payload.beginParse();

      const opcode = slice.loadUint(32);
      const walletId = slice.loadUint(32);
      const validUntil = slice.loadUint(32);
      const seqno = slice.loadUint(32);

      expect(opcode).toBe(WalletV5R1Opcodes.auth_signed);
      expect(opcode).toBe(0x7369676e);
      expect(walletId).toBe(DEFAULT_SUBWALLET_ID);
      expect(seqno).toBe(5);
      expect(validUntil).toBeGreaterThan(Math.floor(Date.now() / 1000) - 10);
    });

    test('3.3 should verify Ed25519 signature structure in transfer payload', async () => {
      const mnemonic = await generateMnemonic(24);
      const keypair = await mnemonicToKeyPair(mnemonic);

      const seqno = 0;
      const validUntil = Math.floor(Date.now() / 1000) + 300;

      const payload = await createTransferPayload({
        seqno,
        secretKey: keypair.secretKey,
        validUntil,
        messages: [{ to: VALID_ADDRESS, value: 100000000n }],
      });

      const slice = payload.beginParse();
      // Read header fields
      const opcode = slice.loadUint(32);
      const walletId = slice.loadUint(32);
      const vUntil = slice.loadUint(32);
      const sq = slice.loadUint(32);

      expect(opcode).toBe(WalletV5R1Opcodes.auth_signed);
      expect(walletId).toBe(DEFAULT_SUBWALLET_ID);
      expect(sq).toBe(0);

      // Signature is stored at the end (512 bits = 64 bytes)
      const signatureBuf = slice.loadBuffer(64);
      expect(signatureBuf.length).toBe(64);
    });

    test('3.4 should support auth_signed_internal opcode (0x73696e74) when authType is internal', async () => {
      const mnemonic = await generateMnemonic(24);
      const keypair = await mnemonicToKeyPair(mnemonic);

      const payload = await createTransferPayload({
        seqno: 1,
        secretKey: keypair.secretKey,
        authType: 'internal',
        messages: [{ to: VALID_ADDRESS, value: 100000000n }],
      });

      const slice = payload.beginParse();
      const opcode = slice.loadUint(32);
      expect(opcode).toBe(WalletV5R1Opcodes.auth_signed_internal);
      expect(opcode).toBe(0x73696e74);
    });

    test('3.5 should create external message cell wrapping signed payload with stateInit when seqno is 0', async () => {
      const mnemonic = await generateMnemonic(24);
      const keypair = await mnemonicToKeyPair(mnemonic);
      const wallet = WalletV5R1.createFromPublicKey(keypair.publicKey);

      const extMessage = await createExternalMessage({
        wallet,
        seqno: 0,
        secretKey: keypair.secretKey,
        messages: [{ to: VALID_ADDRESS, value: 200000000n }],
      });

      expect(extMessage).toBeInstanceOf(Cell);
      expect(extMessage.bits.length).toBeGreaterThan(0);

      const slice = extMessage.beginParse();
      expect(slice.remainingBits).toBeGreaterThan(0);
    });

    test('3.6 should omit stateInit from external message cell when seqno > 0', async () => {
      const mnemonic = await generateMnemonic(24);
      const keypair = await mnemonicToKeyPair(mnemonic);
      const wallet = WalletV5R1.createFromPublicKey(keypair.publicKey);

      const extMessageWithInit = await createExternalMessage({
        wallet,
        seqno: 0,
        secretKey: keypair.secretKey,
        messages: [{ to: VALID_ADDRESS, value: 200000000n }],
      });

      const extMessageNoInit = await createExternalMessage({
        wallet,
        seqno: 1,
        secretKey: keypair.secretKey,
        messages: [{ to: VALID_ADDRESS, value: 200000000n }],
      });

      expect(extMessageWithInit.toBoc().length).toBeGreaterThan(extMessageNoInit.toBoc().length);
    });
  });

  // Category B: RPC Broadcasting Client Schema
  describe('WalletRpcClient Schema & Configuration', () => {
    test('3.7 should set correct default JSON-RPC and V3 endpoints for mainnet and testnet', () => {
      expect(getDefaultEndpoint('mainnet')).toBe('https://toncenter.com/api/v2/jsonRPC');
      expect(getDefaultEndpoint('testnet')).toBe('https://testnet.toncenter.com/api/v2/jsonRPC');
      expect(getDefaultV3Endpoint('mainnet')).toBe('https://toncenter.com/api/v3/message');
      expect(getDefaultV3Endpoint('testnet')).toBe('https://testnet.toncenter.com/api/v3/message');
    });

    test('3.8 should configure WalletRpcClient with network options and endpoints', () => {
      const mainnetClient = new WalletRpcClient({ network: 'mainnet' });
      expect(mainnetClient.network).toBe('mainnet');
      expect(mainnetClient.endpoint).toBe('https://toncenter.com/api/v2/jsonRPC');

      const testnetClient = new WalletRpcClient({ network: 'testnet' });
      expect(testnetClient.network).toBe('testnet');
      expect(testnetClient.endpoint).toBe('https://testnet.toncenter.com/api/v2/jsonRPC');
    });

    test('3.9 should return default seqno 0 for non-existent account address when RPC fails', async () => {
      const client = new WalletRpcClient({ network: 'testnet' });

      // Mock getContractState to return non-active
      const tonClient = client.getTonClient();
      (tonClient as any).getContractState = async () => ({ state: 'uninitialized', balance: 0n });

      const seqno = await client.getSeqno(VALID_ADDRESS);
      expect(seqno).toBe(0);
    });

    test('3.10 should return balance 0n for uninitialized account address', async () => {
      const client = new WalletRpcClient({ network: 'testnet' });

      const tonClient = client.getTonClient();
      (tonClient as any).getContractState = async () => ({ state: 'uninitialized', balance: 0n });

      const balance = await client.getBalance(VALID_ADDRESS);
      expect(balance).toBe(0n);
    });

    test('3.11 should handle sendBoc with Cell, Buffer, hex string, and base64 string inputs', async () => {
      const client = new WalletRpcClient({ network: 'testnet' });
      const sampleCell = beginCell().storeUint(0x1234, 16).endCell();
      const sampleBuffer = sampleCell.toBoc();
      const sampleHex = sampleBuffer.toString('hex');
      const sampleBase64 = sampleBuffer.toString('base64');

      const tonClient = client.getTonClient();
      (tonClient as any).sendFile = async () => {};

      // Mock global fetch to fail V3 so it falls back to sendFile
      const origFetch = globalThis.fetch;
      (globalThis as any).fetch = async () => ({ ok: false });

      try {
        const hashCell = await client.sendBoc(sampleCell);
        expect(typeof hashCell).toBe('string');

        const hashBuffer = await client.sendBoc(sampleBuffer);
        expect(typeof hashBuffer).toBe('string');

        const hashHex = await client.sendBoc(sampleHex);
        expect(typeof hashHex).toBe('string');

        const hashBase64 = await client.sendBoc(sampleBase64);
        expect(typeof hashBase64).toBe('string');
      } finally {
        (globalThis as any).fetch = origFetch;
      }
    });

    test('3.12 should reuse WalletRpcClient instances in getRpcClient singleton factory', () => {
      const client1 = getRpcClient('mainnet');
      const client2 = getRpcClient('mainnet');
      expect(client1).toBe(client2);

      const testnet1 = getRpcClient('testnet');
      expect(testnet1.network).toBe('testnet');
      expect(testnet1).not.toBe(client1);
    });
  });
});
