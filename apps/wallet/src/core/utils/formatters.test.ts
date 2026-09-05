import { describe, expect, it } from 'bun:test';
import { Address } from '@ton/core';
import {
  formatTonAddress,
  normalizeAddress,
  shortenAddress,
} from './formatters';

describe('address formatters', () => {
  // A testnet address: 0:0000000000000000000000000000000000000000000000000000000000000000
  const zeroRaw = '0:0000000000000000000000000000000000000000000000000000000000000000';
  const sampleAddr = Address.parseRaw(zeroRaw);

  it('formats testnet wallet address as 0Q...', () => {
    const formatted = formatTonAddress(sampleAddr, {
      isContract: false,
      network: 'testnet',
    });
    expect(formatted.startsWith('0Q')).toBe(true);
  });

  it('formats testnet contract address as kQ...', () => {
    const formatted = formatTonAddress(sampleAddr, {
      isContract: true,
      network: 'testnet',
    });
    expect(formatted.startsWith('kQ')).toBe(true);
  });

  it('formats mainnet wallet address as UQ...', () => {
    const formatted = formatTonAddress(sampleAddr, {
      isContract: false,
      network: 'mainnet',
    });
    expect(formatted.startsWith('UQ')).toBe(true);
  });

  it('formats mainnet contract address as EQ...', () => {
    const formatted = formatTonAddress(sampleAddr, {
      isContract: true,
      network: 'mainnet',
    });
    expect(formatted.startsWith('EQ')).toBe(true);
  });

  it('shortens addresses correctly', () => {
    const shortened = shortenAddress(zeroRaw, 4, false, 'testnet');
    expect(shortened.startsWith('0Q')).toBe(true);
    expect(shortened).toContain('...');
    expect(shortened.length).toBe(11); // 4 + 3 + 4
  });

  it('normalizes addresses according to network and bounceable flag', () => {
    const testnetAddr = normalizeAddress(zeroRaw, false, 'testnet');
    expect(testnetAddr?.startsWith('0Q')).toBe(true);

    const mainnetAddr = normalizeAddress(zeroRaw, false, 'mainnet');
    expect(mainnetAddr?.startsWith('UQ')).toBe(true);
  });
});
