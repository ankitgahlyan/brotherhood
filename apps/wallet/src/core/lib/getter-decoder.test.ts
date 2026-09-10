import { describe, expect, it } from 'bun:test';
import { beginCell, Address } from '@ton/core';
import {
  decodeGetterResponse,
  parseRawStack,
  decodeContractGetter,
} from './getter-decoder';

describe('getter-decoder', () => {
  const testOwner = Address.parse(
    '0:0000000000000000000000000000000000000000000000000000000000000000',
  );
  const testMinter = Address.parse(
    '0:1111111111111111111111111111111111111111111111111111111111111111',
  );

  describe('parseRawStack', () => {
    it('parses number, cell, null, and tuple stack items', () => {
      const cell = beginCell().storeUint(123, 32).endCell();
      const boc = cell.toBoc().toString('base64');

      const raw = [
        { type: 'num', value: '1000' },
        { type: 'num', value: '0x20' },
        { type: 'cell', value: boc },
        { type: 'null' },
      ];

      const tuple = parseRawStack(raw);
      expect(tuple.length).toBe(4);
      expect(tuple[0]).toEqual({ type: 'int', value: 1000n });
      expect(tuple[1]).toEqual({ type: 'int', value: 32n });
      expect(tuple[2].type).toBe('cell');
      expect(tuple[3]).toEqual({ type: 'null' });
    });
  });

  describe('decodeContractGetter', () => {
    it('decodes Personal Minter get_state', () => {
      const tuple = [
        { type: 'int' as const, value: 5000n },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testMinter).endCell(),
        },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testOwner).endCell(),
        },
        { type: 'null' as const },
      ];

      const decoded = decodeContractGetter('get_state', tuple);
      expect(decoded).not.toBeNull();
      expect(decoded?.structName).toBe('PersonalStore');
      expect((decoded?.data as Record<string, unknown>).totalSupply).toBe(
        '5000',
      );
      expect((decoded?.data as Record<string, unknown>).adminAddress).toBe(
        testOwner.toString(),
      );
    });

    it('decodes Personal Wallet get_personal_wallet_state', () => {
      const tuple = [
        { type: 'int' as const, value: 2500n },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testOwner).endCell(),
        },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testOwner).endCell(),
        },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testMinter).endCell(),
        },
      ];

      const decoded = decodeContractGetter('get_personal_wallet_state', tuple);
      expect(decoded).not.toBeNull();
      expect(decoded?.structName).toBe('PersonalWalletStore');
      expect((decoded?.data as Record<string, unknown>).jettonBalance).toBe(
        '2500',
      );
    });

    it('decodes get_wallet_data', () => {
      const walletCode = beginCell().storeUint(1, 8).endCell();

      const tuple = [
        { type: 'int' as const, value: 9999n },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testOwner).endCell(),
        },
        {
          type: 'slice' as const,
          cell: beginCell().storeAddress(testMinter).endCell(),
        },
        { type: 'cell' as const, cell: walletCode },
      ];

      const decoded = decodeContractGetter('get_wallet_data', tuple);
      expect(decoded).not.toBeNull();
      expect(decoded?.structName).toBe('JettonWalletDataReply');
      expect((decoded?.data as Record<string, unknown>).jettonBalance).toBe(
        '9999',
      );
    });
  });

  describe('decodeGetterResponse', () => {
    it('decodes full JSON-RPC response given request method', () => {
      const requestJson = JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'runGetMethod',
        params: {
          address: testOwner.toString(),
          method: 'get_wallet_data',
          stack: [],
        },
      });

      const walletCode = beginCell().storeUint(1, 8).endCell();
      const ownerSlice = beginCell().storeAddress(testOwner).endCell();
      const minterSlice = beginCell().storeAddress(testMinter).endCell();

      const responseJson = JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        result: {
          exit_code: 0,
          gas_used: 1250,
          stack: [
            { type: 'num', value: '42000' },
            { type: 'slice', value: ownerSlice.toBoc().toString('base64') },
            { type: 'slice', value: minterSlice.toBoc().toString('base64') },
            { type: 'cell', value: walletCode.toBoc().toString('base64') },
          ],
        },
      });

      const decoded = decodeGetterResponse(requestJson, responseJson);
      expect(decoded).not.toBeNull();
      expect(decoded?.structName).toBe('JettonWalletDataReply');
      expect(decoded?.data.jettonBalance).toBe('42000');
      expect(decoded?.data._meta).toEqual({
        method: 'get_wallet_data',
        exitCode: 0,
        gasUsed: 1250,
      });
    });

    it('falls back to GenericTvmStack when method is unknown', () => {
      const responseJson = JSON.stringify({
        exit_code: 0,
        gas_used: 500,
        stack: [
          { type: 'num', value: '123' },
          { type: 'num', value: '456' },
        ],
      });

      const decoded = decodeGetterResponse(null, responseJson);
      expect(decoded).not.toBeNull();
      expect(decoded?.structName).toBe('GenericTvmStack');
      expect(decoded?.data.stack).toEqual(['123', '456']);
    });

    it('returns null for non-stack JSON responses', () => {
      const responseJson = JSON.stringify({ ok: true, status: 'synced' });
      expect(decodeGetterResponse(null, responseJson)).toBeNull();
    });
  });
});
