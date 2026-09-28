/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { Address, beginCell } from '@ton/core';
import {
  isTonChainDns,
  encodeDomain,
  parseSmartContractAddressRecord,
  parseNextResolverRecord,
  resolveAddressByDomain,
  clearDnsCache,
  getDnsDomainZone,
} from './dns';

describe('TON DNS Library (TEP-81)', () => {
  beforeEach(() => {
    clearDnsCache();
  });

  describe('isTonChainDns', () => {
    it('identifies brotherhood .bro domains', () => {
      expect(isTonChainDns('alice.bro')).toBe(true);
      expect(isTonChainDns('ALICE.BRO')).toBe(true);
      expect(isTonChainDns('x.bro')).toBe(true);
      expect(isTonChainDns('sub.alice.bro')).toBe(true);
    });

    it('rejects other non-.bro zones (.ton, .t.me, .vip, .grm)', () => {
      expect(isTonChainDns('alice.ton')).toBe(false);
      expect(isTonChainDns('durov.t.me')).toBe(false);
      expect(isTonChainDns('founder.vip')).toBe(false);
      expect(isTonChainDns('community.grm')).toBe(false);
    });

    it('rejects regular TON addresses', () => {
      expect(
        isTonChainDns('UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4'),
      ).toBe(false);
      expect(
        isTonChainDns(
          '0:7ca5a6e2e5c8e390c507c3f308d5f992383c26703b3064e432a677322bf9b705',
        ),
      ).toBe(false);
      expect(
        isTonChainDns('EQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3EBw'),
      ).toBe(false);
    });

    it('rejects unsupported domains, emails, and invalid formats', () => {
      expect(isTonChainDns('google.com')).toBe(false);
      expect(isTonChainDns('ton.org')).toBe(false);
      expect(isTonChainDns('alice@ton')).toBe(false);
      expect(isTonChainDns('.bro')).toBe(false);
      expect(isTonChainDns('')).toBe(false);
      expect(isTonChainDns('   ')).toBe(false);
      expect(isTonChainDns('justaword')).toBe(false);
    });
  });

  describe('getDnsDomainZone', () => {
    it('correctly splits base name from zone suffix for .bro', () => {
      const matchBro = getDnsDomainZone('alice.bro');
      expect(matchBro).toBeDefined();
      expect(matchBro?.base).toBe('alice');
      expect(matchBro?.zone.collectionName).toBe('Brotherhood Domains (.bro)');
      expect(matchBro?.zone.isRenewable).toBe(true);

      const matchTon = getDnsDomainZone('alice.ton');
      expect(matchTon).toBeUndefined();
    });
  });

  describe('encodeDomain', () => {
    it('encodes a simple single-part domain correctly according to TEP-81', () => {
      expect(encodeDomain('tolya')).toBe('tolya\0');
    });

    it('encodes subdomains in reverse label order with null terminators', () => {
      expect(encodeDomain('sub.alice')).toBe('alice\0sub\0');
    });

    it('throws error when domain has empty component', () => {
      expect(() => encodeDomain('.alice.')).toThrow(
        'domain name cannot have an empty component',
      );
    });
  });

  describe('parseSmartContractAddressRecord', () => {
    const testTarget = Address.parse(
      'UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4',
    );

    it('parses valid dns_smc_address record (tag 0x9fd3)', () => {
      const cell = beginCell()
        .storeUint(0x9fd3, 16)
        .storeAddress(testTarget)
        .storeUint(0, 8)
        .endCell();

      const parsed = parseSmartContractAddressRecord(cell);
      expect(parsed).toBeDefined();
      expect(parsed?.toRawString()).toBe(testTarget.toRawString());
    });

    it('throws for cell without valid tag', () => {
      const cell = beginCell()
        .storeUint(0x1234, 16)
        .storeAddress(testTarget)
        .endCell();
      expect(() => parseSmartContractAddressRecord(cell)).toThrow();
    });
  });

  describe('parseNextResolverRecord', () => {
    const nextResolver = Address.parse(
      'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG',
    );

    it('parses valid dns_next_resolver record (tag 0xba93)', () => {
      const cell = beginCell()
        .storeUint(0xba93, 16)
        .storeAddress(nextResolver)
        .endCell();

      const parsed = parseNextResolverRecord(cell);
      expect(parsed).toBeDefined();
      expect(parsed?.toRawString()).toBe(nextResolver.toRawString());
    });

    it('throws for incorrect tag', () => {
      const cell = beginCell()
        .storeUint(0x9fd3, 16)
        .storeAddress(nextResolver)
        .endCell();

      expect(() => parseNextResolverRecord(cell)).toThrow();
    });
  });

  describe('resolveAddressByDomain', () => {
    it('caches resolved addresses in memory to avoid redundant calls', async () => {
      const testAddr = Address.parse(
        'UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4',
      );
      let callCount = 0;

      const mockClient = {
        callGetMethod: async (
          _addr: Address,
          _method: string,
          params: any[],
        ) => {
          callCount++;
          // Get the bit length of the domain passed in
          const domainSlice = params[0].cell.asSlice();
          const totalBits = domainSlice.remainingBits;

          const walletRecordCell = beginCell()
            .storeUint(0x9fd3, 16)
            .storeAddress(testAddr)
            .storeUint(0, 8)
            .endCell();

          return {
            gas_used: 100,
            exit_code: 0,
            stack: {
              readNumber: () => totalBits, // full domain resolved
              readCell: () => walletRecordCell,
            },
          } as any;
        },
      };

      const result1 = await resolveAddressByDomain(
        'alice.bro',
        'mainnet',
        undefined,
        mockClient as any,
      );
      expect(result1).toBeDefined();
      expect(result1).toBe(
        testAddr.toString({ bounceable: false, testOnly: false }),
      );
      expect(callCount).toBe(1);

      // Second call within TTL should hit cache
      const result2 = await resolveAddressByDomain(
        'alice.bro',
        'mainnet',
        undefined,
        mockClient as any,
      );
      expect(result2).toBe(
        testAddr.toString({ bounceable: false, testOnly: false }),
      );
      expect(callCount).toBe(1); // No new network call!
    });

    it('returns undefined if client throws an error (e.g. exit code -13 domain not found)', async () => {
      const mockClient = {
        callGetMethod: async () => {
          throw new Error('TVM execution failed with exit code -13');
        },
      };

      const result = await resolveAddressByDomain(
        'nonexistent.bro',
        'mainnet',
        undefined,
        mockClient as any,
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined if domain format is not a supported TON DNS zone', async () => {
      const resultGoogle = await resolveAddressByDomain(
        'google.com',
        'mainnet',
      );
      expect(resultGoogle).toBeUndefined();

      const resultTon = await resolveAddressByDomain('alice.ton', 'mainnet');
      expect(resultTon).toBeUndefined();
    });
  });
});
