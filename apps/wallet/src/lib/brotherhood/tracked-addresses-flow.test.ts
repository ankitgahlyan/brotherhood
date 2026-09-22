/**
 * Tests for Brotherhood Store State, Network-Aware Normalization, and Invitor-Keyed Ring
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Address } from '@ton/core';
import {
  normalizeAddressByNetwork,
  createBrotherhoodSlice,
  type BrotherhoodSlice,
} from '@demo/wallet-core';
import { purgeLegacyTrackedAddressesStorage } from './clean-legacy-storage';
import { extractInvitedAndLocationFromFiWallet } from './use-tracked-contract-addresses';

// Mock localStorage for test environment
const storageMock = new Map<string, string>();
const storageMockInstance = {
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
  get length() {
    return storageMock.size;
  },
} as unknown as Storage;

globalThis.localStorage = storageMockInstance;
if (typeof window !== 'undefined') {
  (window as any).localStorage = storageMockInstance;
}

describe('Brotherhood State & Normalization Flow', () => {
  beforeEach(() => {
    storageMock.clear();
  });

  it('formats wallet and contract addresses according to network (0Q/UQ vs kQ/EQ)', () => {
    const rawAddr =
      '0:1111111111111111111111111111111111111111111111111111111111111111';

    // Testnet: wallet is 0Q (non-bounceable), contract is kQ (bounceable)
    const testnetWallet = normalizeAddressByNetwork(rawAddr, false, 'testnet');
    const testnetContract = normalizeAddressByNetwork(rawAddr, true, 'testnet');
    expect(testnetWallet.startsWith('0Q')).toBe(true);
    expect(testnetContract.startsWith('kQ')).toBe(true);

    // Mainnet: wallet is UQ (non-bounceable), contract is EQ (bounceable)
    const mainnetWallet = normalizeAddressByNetwork(rawAddr, false, 'mainnet');
    const mainnetContract = normalizeAddressByNetwork(rawAddr, true, 'mainnet');
    expect(mainnetWallet.startsWith('UQ')).toBe(true);
    expect(mainnetContract.startsWith('EQ')).toBe(true);
  });

  it('purges legacy tracked_addresses keys from localStorage immediately', () => {
    storageMock.set(
      'tracked_addresses:0:1111',
      JSON.stringify({ base: {}, circle: {} }),
    );
    storageMock.set('current_selected_wallet', '0:1111');
    storageMock.set('brotherhood_tracked_personal_tokens_0:1111', '[]');
    storageMock.set('keep_me_theme', 'dark');

    purgeLegacyTrackedAddressesStorage();

    expect(storageMock.has('tracked_addresses:0:1111')).toBe(false);
    expect(storageMock.has('current_selected_wallet')).toBe(false);
    expect(storageMock.has('brotherhood_tracked_personal_tokens_0:1111')).toBe(
      false,
    );
    expect(storageMock.get('keep_me_theme')).toBe('dark');
  });

  it('initializes and manages brotherhoodSlice per wallet address', () => {
    const state: any = {
      brotherhood: { brotherhoodByAddress: {} },
    };

    const setState = (updater: (s: any) => void) => {
      updater(state);
    };

    const slice = (createBrotherhoodSlice as any)(
      setState,
      () => state,
      {},
    ) as BrotherhoodSlice;

    const walletAddr =
      '0:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const walletKey = normalizeAddressByNetwork(walletAddr, false, 'testnet');

    // 1. Initially uninit/non-member
    slice.setBrotherhoodMemberData(walletAddr, {
      isMember: false,
      circle: [],
      ring: {},
    });

    expect(state.brotherhood.brotherhoodByAddress[walletKey].isMember).toBe(
      false,
    );

    // 2. Set active member and location
    const locContract =
      '0:2222222222222222222222222222222222222222222222222222222222222222';
    slice.setLocationContract(walletAddr, locContract, 'testnet');
    expect(
      state.brotherhood.brotherhoodByAddress[walletKey].location?.startsWith(
        'kQ',
      ),
    ).toBe(true);

    // 3. Add circle invites (capped at 10, deduplicated, formatted kQ)
    const invites = Array.from({ length: 15 }, (_, i) => {
      const hex = i.toString(16).padStart(64, '3');
      return `0:${hex}`;
    });

    const fresh = slice.addCircleInvites(walletAddr, invites, 'testnet');
    expect(fresh.length).toBe(10);
    expect(
      state.brotherhood.brotherhoodByAddress[walletKey].circle.length,
    ).toBe(10);
    expect(
      state.brotherhood.brotherhoodByAddress[walletKey].circle[0].startsWith(
        'kQ',
      ),
    ).toBe(true);

    // 4. Add ring invites under invitor key
    const invitor = state.brotherhood.brotherhoodByAddress[walletKey].circle[0];
    const ringInvites = Array.from({ length: 5 }, (_, i) => {
      const hex = i.toString(16).padStart(64, '4');
      return `0:${hex}`;
    });

    slice.addRingInvites(walletAddr, invitor, ringInvites, 'testnet');

    const ringMap = state.brotherhood.brotherhoodByAddress[walletKey].ring;
    expect(ringMap[invitor]).toBeDefined();
    expect(ringMap[invitor].length).toBe(5);
    expect(ringMap[invitor][0].startsWith('kQ')).toBe(true);

    // 5. Remove wallet cleans up brotherhood state
    slice.removeBrotherhoodWallet(walletAddr);
    expect(state.brotherhood.brotherhoodByAddress[walletKey]).toBeUndefined();
  });

  it('extracts invited members and h3Cell from FiWalletStore properly', () => {
    const mockStore = {
      $: 'FiWalletStore',
      profile: {
        ref: {
          h3Cell: '881f1d4887fffff',
        },
      },
      maps: {
        ref: {
          invited: {
            keys: () => [
              '0:5555555555555555555555555555555555555555555555555555555555555555',
              '0:6666666666666666666666666666666666666666666666666666666666666666',
            ],
          },
        },
      },
    };

    const { invited, h3Cell } =
      extractInvitedAndLocationFromFiWallet(mockStore);
    expect(h3Cell).toBe('881f1d4887fffff');
    expect(invited.length).toBe(2);
  });
});
