import { describe, it, expect } from 'bun:test';
import {
  isBocString,
  truncateBocString,
  sanitizeBocFields,
  repairTruncatedJson,
  tryParseOrRepairJson,
  safeStringifyJson,
} from './json-boc-sanitizer';

describe('JSON & BoC Sanitizer', () => {
  it('correctly identifies TON BoC strings and distinguishes them from TON addresses and hashes', () => {
    // TON base64 BoC
    expect(isBocString('te6cckEBAQEAAwAA...')).toBe(true);
    expect(isBocString('te6cgkEBAQEAAAAA')).toBe(true);

    // TON hex BoC
    expect(isBocString('b5ee9c7201010101000200000004')).toBe(true);
    expect(isBocString('B5EE9C7201010101000200000004')).toBe(true);

    // Key-name based
    expect(isBocString('AQIDBAUGBwgJCgsMDQ4PEA==', 'data_boc')).toBe(true);
    expect(isBocString('AQIDBAUGBwgJCgsMDQ4PEA==', 'code_boc')).toBe(true);
    expect(isBocString('AQIDBAUGBwgJCgsMDQ4PEA==', 'boc')).toBe(true);

    // TON addresses MUST NOT be treated as BoCs
    expect(
      isBocString('EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx'),
    ).toBe(false);
    expect(
      isBocString(
        '0:b777777777777777777777777777777777777777777777777777777777777771',
      ),
    ).toBe(false);
    expect(
      isBocString(
        'EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx',
        'address',
      ),
    ).toBe(false);

    // Hashes and keys should not be treated as BoC unless having explicit BoC prefix
    expect(
      isBocString(
        'c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3',
        'code_hash',
      ),
    ).toBe(false);
    expect(
      isBocString(
        'c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3e9c5f3',
        'last_transaction_hash',
      ),
    ).toBe(false);
  });

  it('truncates BoC strings to just 2-3 characters followed by ...', () => {
    expect(truncateBocString('te6cckEBAQEAAwAA...')).toBe('te6...');
    expect(truncateBocString('b5ee9c7201010101000200000004')).toBe('b5e...');
    expect(truncateBocString('  te6xyz  ')).toBe('te6...');
  });

  it('sanitizes deeply nested objects and arrays by replacing BoCs with 2-3 chars while preserving addresses', () => {
    const raw = {
      address: 'EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx',
      balance: '1000000000',
      code_boc: 'te6cckEBAQEAAwAA...',
      data_boc: 'te6ccgEBAQEAAgAA...',
      account_state_hash: '3949392039203920',
      nested: [
        {
          boc: 'te6cc_nested_blob...',
          recipient: 'EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx',
        },
      ],
    };

    const sanitized = sanitizeBocFields(raw) as any;
    expect(sanitized.address).toBe(
      'EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx',
    );
    expect(sanitized.balance).toBe('1000000000');
    expect(sanitized.code_boc).toBe('te6...');
    expect(sanitized.data_boc).toBe('te6...');
    expect(sanitized.nested[0].boc).toBe('te6...');
    expect(sanitized.nested[0].recipient).toBe(
      'EQB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxGx',
    );
  });

  it('repairs truncated JSON payloads accurately', () => {
    // Cut off inside a string literal
    const cutInString = '{"status": "ok", "items": [{"id": 1, "boc": "te6cc';
    const repaired1 = repairTruncatedJson(cutInString);
    expect(repaired1).not.toBeNull();
    const parsed1 = JSON.parse(repaired1!);
    expect(parsed1.status).toBe('ok');
    expect(parsed1.items[0].id).toBe(1);

    // Cut off with trailing comma
    const cutTrailingComma = '{"status": "ok", "items": [1, 2, ';
    const repaired2 = repairTruncatedJson(cutTrailingComma);
    expect(repaired2).not.toBeNull();
    const parsed2 = JSON.parse(repaired2!);
    expect(parsed2.items).toEqual([1, 2]);

    // Cut off with trailing colon
    const cutTrailingColon = '{"status": "ok", "details":';
    const repaired3 = repairTruncatedJson(cutTrailingColon);
    expect(repaired3).not.toBeNull();
    const parsed3 = JSON.parse(repaired3!);
    expect(parsed3.details).toBeNull();
  });

  it('tryParseOrRepairJson successfully parses valid and cut-off JSON', () => {
    // Valid JSON
    const valid = '{"ok": true, "result": [1, 2, 3]}';
    expect(tryParseOrRepairJson(valid)).toEqual({
      ok: true,
      result: [1, 2, 3],
    });

    // Truncated JSON
    const truncated =
      '{"ok": true, "result": [{"addr": "EQ...", "code_boc": "te6cc';
    const parsed = tryParseOrRepairJson(truncated) as any;
    expect(parsed).not.toBeNull();
    expect(parsed.ok).toBe(true);
    expect(parsed.result[0].addr).toBe('EQ...');

    // Non-JSON returns null
    expect(tryParseOrRepairJson('502 Bad Gateway')).toBeNull();
    expect(tryParseOrRepairJson('<html>error</html>')).toBeNull();
  });

  it('safeStringifyJson produces valid JSON without mid-string clipping', () => {
    const hugeArray = Array.from({ length: 100 }, (_, i) => ({
      index: i,
      data: `item_${i}`,
    }));
    const data = { status: 'success', items: hugeArray };

    const output = safeStringifyJson(data, 1000);
    expect(output.length).toBeLessThan(1500);
    const reParsed = JSON.parse(output);
    expect(reParsed.status).toBe('success');
    expect(Array.isArray(reParsed.items)).toBe(true);
  });
});
