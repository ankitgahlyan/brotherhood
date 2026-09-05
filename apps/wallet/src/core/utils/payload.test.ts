import { describe, expect, it } from 'bun:test';
import { beginCell } from '@ton/core';
import {
  decodePayload,
  decodeTextCommentPayload,
  getPayloadMessageName,
} from './payload';

describe('payload decoding', () => {
  it('decodes text comment payload', () => {
    const cell = beginCell()
      .storeUint(0, 32)
      .storeStringTail('Hello Brotherhood')
      .endCell();
    const base64 = cell.toBoc().toString('base64');

    expect(decodeTextCommentPayload(base64)).toBe('Hello Brotherhood');

    const decoded = decodePayload(base64);
    expect(decoded).not.toBeNull();
    expect(decoded?.isComment).toBe(true);
    expect(decoded?.comment).toBe('Hello Brotherhood');
    expect(decoded?.messageName).toBe('Text Comment');
    expect(getPayloadMessageName(base64)).toBe('Comment: “Hello Brotherhood”');
  });

  it('decodes Jetton Transfer opcode', () => {
    const cell = beginCell().storeUint(0x0f8a7ea5, 32).endCell();
    const base64 = cell.toBoc().toString('base64');

    const decoded = decodePayload(base64);
    expect(decoded).not.toBeNull();
    expect(decoded?.isComment).toBe(false);
    expect(decoded?.opcode).toBe(0x0f8a7ea5);
    expect(decoded?.messageName).toBe('Jetton Transfer');
    expect(getPayloadMessageName(base64)).toBe('Jetton Transfer');
  });

  it('decodes Brotherhood Cast Vote opcode', () => {
    const cell = beginCell().storeUint(0x000010f1, 32).endCell();
    const base64 = cell.toBoc().toString('base64');

    const decoded = decodePayload(base64);
    expect(decoded).not.toBeNull();
    expect(decoded?.isComment).toBe(false);
    expect(decoded?.opcode).toBe(0x000010f1);
    expect(decoded?.messageName).toBe('Cast Vote');
  });

  it('decodes Brotherhood Buy Credit opcode', () => {
    const cell = beginCell().storeUint(0x00001147, 32).endCell();
    const base64 = cell.toBoc().toString('base64');

    const decoded = decodePayload(base64);
    expect(decoded).not.toBeNull();
    expect(decoded?.isComment).toBe(false);
    expect(decoded?.opcode).toBe(0x00001147);
    expect(decoded?.messageName).toBe('Buy Credit (Personal Token)');
  });

  it('handles unknown opcode gracefully with hex representation', () => {
    const cell = beginCell().storeUint(0x1234abcd, 32).endCell();
    const base64 = cell.toBoc().toString('base64');

    const decoded = decodePayload(base64);
    expect(decoded).not.toBeNull();
    expect(decoded?.isComment).toBe(false);
    expect(decoded?.opcode).toBe(0x1234abcd);
    expect(decoded?.messageName).toBe('Contract Call (0x1234abcd)');
  });

  it('handles null / empty / invalid payload without throwing', () => {
    expect(decodePayload(undefined)).toBeNull();
    expect(decodePayload('')).toBeNull();
    expect(decodePayload('invalid_boc')).toEqual({
      isComment: false,
      messageName: 'Contract Message',
    });
  });
});
