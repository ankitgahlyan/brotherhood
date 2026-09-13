/**
 * Tests for Tracked Addresses Storage, Off-Chain Derivation, and Hydration Flow
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Address } from '@ton/core';
import {
  saveCurrentSelectedWallet,
  getCurrentSelectedWallet,
  calculateBaseAddresses,
  initializeOrGetTrackedAddresses,
  loadTrackedAddresses,
  addInvitedToCircle,
  addInvitedToRing,
  addPersonalJettons,
  getAllTrackedAddressesList,
  getTrackedAddressesByCategory,
} from './tracked-addresses-storage';
import {
  CONTRACT_CODE_HASHES,
  normalizeCodeHash,
  detectKnownType,
} from './account-state-hydrator';
import { extractInvitedAndLocationFromFiWallet } from './use-tracked-contract-addresses';

// Mock localStorage for test environment
const storageMock = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => storageMock.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageMock.set(key, value);
  },
  removeItem: (key: string) => {
    storageMock.delete(key);
  },
  clear: () => {
    storageMock.clear();
  },
  key: (index: number) => Array.from(storageMock.keys())[index] ?? null,
  length: 0,
} as unknown as Storage;

describe('Tracked Addresses Storage & Flow', () => {
  beforeEach(() => {
    storageMock.clear();
  });

  it('saves and retrieves current selected wallet', () => {
    const testOwner = Address.parse(
      '0:1111111111111111111111111111111111111111111111111111111111111111',
    );
    saveCurrentSelectedWallet(testOwner);
    expect(getCurrentSelectedWallet()).toBe(testOwner.toString());
  });

  it('calculates 5 base addresses off-chain correctly', () => {
    const testOwner = Address.parse(
      '0:2222222222222222222222222222222222222222222222222222222222222222',
    );
    const base = calculateBaseAddresses(testOwner);

    expect(base.owner).toBe(testOwner.toString());
    expect(typeof base.fi).toBe('string');
    expect(typeof base.fiWallet).toBe('string');
    expect(typeof base.personal).toBe('string');
    expect(typeof base.personalWallet).toBe('string');

    // Total 5 addresses
    const unique = new Set(Object.values(base));
    expect(unique.size).toBe(5);
  });

  it('initializes and loads tracked addresses JSON in localStorage', () => {
    const testOwner = Address.parse(
      '0:3333333333333333333333333333333333333333333333333333333333333333',
    );
    const initial = initializeOrGetTrackedAddresses(testOwner);

    expect(initial.base.owner).toBe(testOwner.toString());
    expect(initial.circle.invited).toEqual([]);
    expect(initial.ring.invited).toEqual([]);

    const loaded = loadTrackedAddresses(testOwner);
    expect(loaded).not.toBeNull();
    expect(loaded?.base.fiWallet).toBe(initial.base.fiWallet);
  });

  it('adds circle invites and location cell, then ring invites', () => {
    const testOwner = Address.parse(
      '0:4444444444444444444444444444444444444444444444444444444444444444',
    );
    initializeOrGetTrackedAddresses(testOwner);

    const invite1 = Address.parse(
      '0:5555555555555555555555555555555555555555555555555555555555555555',
    );
    const invite2 = Address.parse(
      '0:6666666666666666666666666666666666666666666666666666666666666666',
    );

    const updatedCircle = addInvitedToCircle(
      testOwner,
      [invite1, invite2],
      '881f1d4887fffff',
    );
    expect(updatedCircle.circle.invited).toContain(invite1.toString());
    expect(updatedCircle.circle.invited).toContain(invite2.toString());
    expect(updatedCircle.circle.location).toBeDefined();

    const ringInvite1 = Address.parse(
      '0:7777777777777777777777777777777777777777777777777777777777777777',
    );
    const updatedRing = addInvitedToRing(testOwner, [ringInvite1]);
    expect(updatedRing.ring.invited).toContain(ringInvite1.toString());

    // Personal Jettons
    const personalJetton1 = Address.parse(
      '0:8888888888888888888888888888888888888888888888888888888888888888',
    );
    const updatedWithPersonal = addPersonalJettons(testOwner, [
      personalJetton1,
    ]);
    expect(updatedWithPersonal.personalJettons).toContain(
      personalJetton1.toString(),
    );

    // Category lists
    const baseList = getTrackedAddressesByCategory(updatedWithPersonal, 'base');
    expect(baseList.length).toBe(5);

    const personalList = getTrackedAddressesByCategory(
      updatedWithPersonal,
      'personalJettons',
    );
    expect(personalList).toContain(personalJetton1.toString());

    const circleList = getTrackedAddressesByCategory(
      updatedWithPersonal,
      'circle',
    );
    expect(circleList).toContain(invite1.toString());

    const allList = getAllTrackedAddressesList(updatedWithPersonal);
    expect(allList.length).toBe(5 + 1 + 2 + 1 + 1); // 5 base + 1 personalJetton + 2 circle + 1 location + 1 ring
  });

  it('detects known contract types by code hash and interfaces', () => {
    expect(CONTRACT_CODE_HASHES.walletV5R1).toBeDefined();

    // Matching hash directly
    const detectedWalletV5 = detectKnownType(CONTRACT_CODE_HASHES.walletV5R1);
    expect(detectedWalletV5).toBe('walletV5R1');

    const detectedFiWallet = detectKnownType(CONTRACT_CODE_HASHES.fiWallet);
    expect(detectedFiWallet).toBe('fiWallet');

    // Matching interface fallback
    const detectedFromInterface = detectKnownType(undefined, ['wallet_v5r1']);
    expect(detectedFromInterface).toBe('walletV5R1');

    // Normalizing hex hash to base64
    const hexHash = Buffer.from(
      CONTRACT_CODE_HASHES.fiMinter,
      'base64',
    ).toString('hex');
    expect(normalizeCodeHash(hexHash)).toBe(CONTRACT_CODE_HASHES.fiMinter);
    expect(detectKnownType(hexHash)).toBe('fiMinter');
  });

  it('extracts invited and location from FiWallet store mock', () => {
    const mockStore = {
      $: 'FiWalletStore',
      maps: {
        ref: {
          invited: {
            keys: () => [
              Address.parse(
                '0:8888888888888888888888888888888888888888888888888888888888888888',
              ),
            ],
          },
        },
      },
      profile: {
        ref: {
          h3Cell: '881f1d4887fffff',
        },
      },
    };

    const extracted = extractInvitedAndLocationFromFiWallet(mockStore);
    expect(extracted.invited.length).toBe(1);
    expect(extracted.h3Cell).toBe('881f1d4887fffff');
  });

  it('correctly prioritizes V5 code hash over caller fiWallet hint', () => {
    const v5Hash = 'IINLe3KxEhR+Gy+0V7hOdNGjDwT3N9T2KmaOlVLSty8=';
    const detected = detectKnownType(v5Hash);
    expect(detected).toBe('walletV5R1');
  });

  it('correctly serializes and revives Dictionaries and Arrays without data corruption', async () => {
    const { serializeForStorage, deserializeFromStorage } =
      await import('./contract-cache');
    const mockAddr = Address.parse(
      '0:8888888888888888888888888888888888888888888888888888888888888888',
    );
    const mockDict = {
      keys: () => [mockAddr],
      get: (k: Address) => (k.equals(mockAddr) ? 1000n : undefined),
    };

    const payload = {
      items: [1, 2, 'three'],
      invited: mockDict,
    };

    const serialized = serializeForStorage(payload);
    // Ensure array was not mangled into empty dictionary object
    expect(serialized).toContain('"items":[1,2,"three"]');
    expect(serialized).toContain('"__type":"Dictionary"');

    const revived = deserializeFromStorage<typeof payload>(serialized);
    expect(revived.items).toEqual([1, 2, 'three']);
    expect(typeof revived.invited.keys).toBe('function');
    expect(typeof revived.invited.get).toBe('function');
    const keys = revived.invited.keys();
    expect(keys.length).toBe(1);
    expect(revived.invited.get(keys[0])).toBe(1000n);
  });

  it('deduplicates concurrent in-flight batch hydration requests', async () => {
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    const addr =
      '0:8888888888888888888888888888888888888888888888888888888888888888';

    // Dispatch two concurrent hydration calls for the exact same address
    const p1 = batchHydrateUniversal([addr], 'testnet');
    const p2 = batchHydrateUniversal([addr], 'testnet');

    // Both should refer to the exact same Promise instance while in flight
    expect(p1).toBe(p2);

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe(res2);
    expect(res1.totalRequested).toBe(1);
  }, 15000);

  it('format-insensitively deduplicates mixed address representations in batchHydrateUniversal', async () => {
    const { batchHydrateUniversal } = await import('./account-state-hydrator');
    const addr = Address.parse(
      '0:8888888888888888888888888888888888888888888888888888888888888888',
    );

    const bounceable = addr.toString({ bounceable: true, urlSafe: true });
    const nonBounceable = addr.toString({ bounceable: false, urlSafe: true });
    const rawStr = addr.toRawString();

    // Pass the exact same contract under 4 different formats (bounceable, non-bounceable, raw, Address instance)
    const res = await batchHydrateUniversal(
      [bounceable, nonBounceable, rawStr, addr, bounceable],
      'testnet',
    );

    // Should collapse all 5 entries to exactly 1 requested contract
    expect(res.totalRequested).toBe(1);

    // In-flight batch keys must match when requesting with another format
    const p1 = batchHydrateUniversal([bounceable], 'testnet');
    const p2 = batchHydrateUniversal([nonBounceable], 'testnet');
    expect(p1).toBe(p2);
    await Promise.all([p1, p2]);
  }, 15000);

  it('enforces strict cross-group exclusion and deduplication across base, circle, ring, and personalJettons', () => {
    const testOwner = Address.parse(
      '0:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    );
    const initial = initializeOrGetTrackedAddresses(testOwner);
    const baseFi = initial.base.fi;
    const baseFiWallet = initial.base.fiWallet;

    // 1. Trying to add a base address to circle, ring, or personalJettons must be rejected
    const afterCircle = addInvitedToCircle(testOwner, [baseFi, baseFiWallet]);
    expect(afterCircle.circle.invited).not.toContain(baseFi);
    expect(afterCircle.circle.invited).not.toContain(baseFiWallet);

    const afterRing = addInvitedToRing(testOwner, [baseFi]);
    expect(afterRing.ring.invited).not.toContain(baseFi);

    const afterPersonal = addPersonalJettons(testOwner, [baseFiWallet]);
    expect(afterPersonal.personalJettons).not.toContain(baseFiWallet);

    // 2. Add a new address to circle
    const circleMember = Address.parse(
      '0:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    );
    const withCircle = addInvitedToCircle(testOwner, [circleMember]);
    expect(withCircle.circle.invited).toContain(circleMember.toString());

    // 3. Trying to add that circle address to ring or personalJettons must be rejected
    const ringAttempt = addInvitedToRing(testOwner, [circleMember]);
    expect(ringAttempt.ring.invited).not.toContain(circleMember.toString());

    const personalAttempt = addPersonalJettons(testOwner, [circleMember]);
    expect(personalAttempt.personalJettons).not.toContain(
      circleMember.toString(),
    );

    // 4. Add a new address to ring
    const ringMember = Address.parse(
      '0:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    );
    const withRing = addInvitedToRing(testOwner, [ringMember]);
    expect(withRing.ring.invited).toContain(ringMember.toString());

    // 5. Trying to add ring address to circle or personalJettons must be rejected
    const circleAttempt = addInvitedToCircle(testOwner, [ringMember]);
    expect(circleAttempt.circle.invited).not.toContain(ringMember.toString());

    const personalAttempt2 = addPersonalJettons(testOwner, [ringMember]);
    expect(personalAttempt2.personalJettons).not.toContain(
      ringMember.toString(),
    );

    // 6. Add a new address to personalJettons
    const personalMinter = Address.parse(
      '0:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    );
    const withPersonal = addPersonalJettons(testOwner, [personalMinter]);
    expect(withPersonal.personalJettons).toContain(personalMinter.toString());

    // 7. Trying to add personal jetton address to circle or ring must be rejected
    const circleAttempt2 = addInvitedToCircle(testOwner, [personalMinter]);
    expect(circleAttempt2.circle.invited).not.toContain(
      personalMinter.toString(),
    );

    const ringAttempt2 = addInvitedToRing(testOwner, [personalMinter]);
    expect(ringAttempt2.ring.invited).not.toContain(personalMinter.toString());

    // 8. Deduplicates repeated addresses in input array
    const extra1 = Address.parse(
      '0:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );
    const withDedupe = addInvitedToRing(testOwner, [
      extra1,
      extra1,
      extra1.toString(),
    ]);
    const matches = withDedupe.ring.invited.filter(
      (a) => a === extra1.toString(),
    );
    expect(matches.length).toBe(1);
  });
});
