import { describe, it, expect, beforeEach } from 'bun:test';
import { createWalletStore } from '@demo/wallet-core';
import type { NFT } from '@ton/walletkit';

const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, val: string) => {
    storageMock[key] = val;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k of Object.keys(storageMock)) delete storageMock[k];
  },
};

(globalThis as any).localStorage = mockLocalStorage;
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = { localStorage: mockLocalStorage };
} else {
  (globalThis.window as any).localStorage = mockLocalStorage;
}

describe('Wallet Scoped Assets Tracking', () => {
  let store: ReturnType<typeof createWalletStore>;

  beforeEach(() => {
    mockLocalStorage.clear();
    globalThis.localStorage?.clear?.();
    store = createWalletStore({
      enableDevtools: false,
    });
  });

  it('tracks jettons and nfts per wallet address and scopes active view', () => {
    const wallet1 = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9q';
    const wallet2 = '0QBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAC9q';

    const jetton1: any = {
      address: 'EQTestJetton1',
      name: 'Test 1',
      symbol: 'T1',
      decimals: '9',
      decimalsNumber: 9,
      balance: '1000',
      walletAddress: 'EQWalletJetton1',
    };

    const jetton2: any = {
      address: 'EQTestJetton2',
      name: 'Test 2',
      symbol: 'T2',
      decimals: '9',
      decimalsNumber: 9,
      balance: '5000',
      walletAddress: 'EQWalletJetton2',
    };

    const nft1: NFT = {
      address: 'EQNft1',
      index: 1,
      owner: { address: wallet1 },
      collection: { address: 'EQCollection' },
    } as any;

    // Simulate store state for wallet 1 active
    (store.setState as any)((state: any) => {
      state.walletManagement.address = wallet1;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.savedWallets = [
        { id: 'w1', address: wallet1, name: 'Wallet 1' } as any,
        { id: 'w2', address: wallet2, name: 'Wallet 2' } as any,
      ];
      state.jettons.jettonsByAddress[wallet1] = [jetton1];
      state.nfts.nftsByAddress[wallet1] = [nft1];
      state.nfts.userNfts = [nft1];
    });

    expect(
      (store.getState().jettons.jettonsByAddress[wallet1] as any)[0].symbol,
    ).toBe('T1');
    expect(store.getState().jettons.jettonsByAddress[wallet1]).toHaveLength(1);
    expect(store.getState().nfts.userNfts).toHaveLength(1);

    // Now populate wallet 2 data into jettonsByAddress
    (store.setState as any)((state: any) => {
      state.jettons.jettonsByAddress[wallet2] = [jetton2];
      state.nfts.nftsByAddress[wallet2] = [];
    });

    // Active view lookup should still show wallet 1 assets
    expect(
      (store.getState().getJettonByAddress('EQTestJetton1') as any)?.symbol,
    ).toBe('T1');

    // Simulate switching to wallet 2 in state
    const savedWallet2 = store
      .getState()
      .walletManagement.savedWallets.find((w) => w.id === 'w2')!;
    (store.setState as any)((state: any) => {
      state.walletManagement.activeWalletId = 'w2';
      state.walletManagement.address = savedWallet2.address;
      state.nfts.userNfts =
        state.nfts.nftsByAddress[savedWallet2.address] ?? [];
    });

    // Active view must now find wallet 2's assets via getJettonByAddress
    expect(store.getState().jettons.jettonsByAddress[wallet2]).toHaveLength(1);
    expect(
      (store.getState().jettons.jettonsByAddress[wallet2] as any)[0].symbol,
    ).toBe('T2');
    expect(store.getState().nfts.userNfts).toHaveLength(0);

    // Both wallets' data is still preserved in jettonsByAddress
    expect(store.getState().jettons.jettonsByAddress[wallet1]).toHaveLength(1);
    expect(store.getState().jettons.jettonsByAddress[wallet2]).toHaveLength(1);

    // Stream balance update for active wallet
    store.getState().updateJettonBalanceFromStream('EQWalletJetton2', '6000');
    expect(store.getState().jettons.jettonsByAddress[wallet2][0].balance).toBe(
      '6000',
    );
    // Wallet 1 balance unchanged
    expect(store.getState().jettons.jettonsByAddress[wallet1][0].balance).toBe(
      '1000',
    );
  });

  it('loadUserJettons loads jettons for all saved wallets in 1 single call and partitions by walletAddress', async () => {
    const wallet1 = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9q';
    const wallet2 = '0QBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAC9q';

    const jettonW1: any = {
      address: 'EQTestJetton1',
      walletAddress: 'EQWalletJetton1',
      ownerAddress: wallet1,
      balance: '100',
      info: { name: 'J1', symbol: 'J1', description: '' },
      decimalsNumber: 9,
      isVerified: false,
      prices: [],
    };

    const jettonW2: any = {
      address: 'EQTestJetton2',
      walletAddress: 'EQWalletJetton2',
      ownerAddress: wallet2,
      balance: '200',
      info: { name: 'J2', symbol: 'J2', description: '' },
      decimalsNumber: 9,
      isVerified: false,
      prices: [],
    };

    let requestedOwnerAddress: any = null;
    let callCount = 0;

    const mockClient = {
      jettonsByOwnerAddress: async (req: any) => {
        callCount++;
        requestedOwnerAddress = req.ownerAddress;
        return {
          jettons: [jettonW1, jettonW2],
          addressBook: {},
        };
      },
    };

    (store.setState as any)((state: any) => {
      state.walletManagement.address = wallet1;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.savedWallets = [
        {
          id: 'w1',
          address: wallet1,
          name: 'Wallet 1',
          network: 'testnet',
        } as any,
        {
          id: 'w2',
          address: wallet2,
          name: 'Wallet 2',
          network: 'testnet',
        } as any,
      ];
      state.walletCore.walletKit = {
        getApiClient: () => mockClient,
      };
      state.walletManagement.currentWallet = {
        getClient: () => mockClient,
      };
    });

    await store.getState().loadUserJettons();

    // Must be exactly 1 call
    expect(callCount).toBe(1);
    // Must contain both saved wallet addresses
    expect(requestedOwnerAddress).toEqual([wallet1, wallet2]);

    // Check partitioned storage
    const state = store.getState();
    expect(state.jettons.jettonsByAddress[wallet1]).toHaveLength(1);
    expect(state.jettons.jettonsByAddress[wallet1][0].walletAddress).toBe(
      'EQWalletJetton1',
    );

    expect(state.jettons.jettonsByAddress[wallet2]).toHaveLength(1);
    expect(state.jettons.jettonsByAddress[wallet2][0].walletAddress).toBe(
      'EQWalletJetton2',
    );
  });

  it('removeWallet cleans up jettonsByAddress and nftsByAddress', () => {
    const wallet1 = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9q';
    const wallet2 = '0QBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAC9q';

    (store.setState as any)((state: any) => {
      state.walletManagement.address = wallet1;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.savedWallets = [
        { id: 'w1', address: wallet1, name: 'Wallet 1' } as any,
        { id: 'w2', address: wallet2, name: 'Wallet 2' } as any,
      ];
      state.jettons.jettonsByAddress = {
        [wallet1]: [{ address: 'J1' } as any],
        [wallet2]: [{ address: 'J2' } as any],
      };
      state.nfts.nftsByAddress = {
        [wallet1]: [{ address: 'N1' } as any],
        [wallet2]: [{ address: 'N2' } as any],
      };
    });

    // Remove wallet2
    store.getState().removeWallet('w2');

    const state = store.getState();
    expect(state.jettons.jettonsByAddress[wallet2]).toBeUndefined();
    expect(state.nfts.nftsByAddress[wallet2]).toBeUndefined();
    expect(state.jettons.jettonsByAddress[wallet1]).toBeDefined();
    expect(state.nfts.nftsByAddress[wallet1]).toBeDefined();
  });

  it('persists eventsByAddress in localStorage, caps at 20, and restores on rehydration', async () => {
    const wallet1 = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9q';
    const wallet2 = '0QBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAC9q';

    // Create 60 dummy events for wallet1 with BigInt values
    const dummyEventsW1 = Array.from({ length: 60 }, (_, i) => ({
      eventId: `ev-w1-${i}`,
      account: { address: wallet1 },
      actions: [
        {
          type: 'TonTransfer',
          TonTransfer: {
            sender: { address: wallet1 },
            recipient: { address: wallet2 },
            amount: 1000000000n * BigInt(i + 1),
          },
        },
      ],
    }));

    const dummyEventsW2 = Array.from({ length: 10 }, (_, i) => ({
      eventId: `ev-w2-${i}`,
      account: { address: wallet2 },
      actions: [
        {
          type: 'SmartContractExec',
          SmartContractExec: {
            executor: { address: wallet2 },
            contract: { address: wallet1 },
            tonAttached: 500000000n,
            operation: '0x1234',
            payload: '',
          },
        },
      ],
    }));

    (store.setState as any)((state: any) => {
      state.walletManagement.address = wallet1;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.savedWallets = [
        { id: 'w1', address: wallet1, name: 'Wallet 1' } as any,
        { id: 'w2', address: wallet2, name: 'Wallet 2' } as any,
      ];
      state.walletManagement.eventsByAddress = {
        [wallet1]: dummyEventsW1,
        [wallet2]: dummyEventsW2,
      };
      state.walletManagement.events = dummyEventsW1.slice(0, 10);
      state.walletManagement.confirmedTraceIds = ['trace-1', 'trace-2'];
      state.walletManagement.confirmedExternalHashes = ['hash-1', 'hash-2'];
    });

    // Check localStorage persistence
    const persistedRaw = localStorage.getItem('bro-store');
    expect(persistedRaw).not.toBeNull();
    const parsed = JSON.parse(persistedRaw!);

    expect(parsed.state.walletManagement.eventsByAddress).toBeDefined();
    // Must be capped at 20 for wallet 1
    expect(parsed.state.walletManagement.eventsByAddress[wallet1]).toHaveLength(
      20,
    );
    // Wallet 2 has 10
    expect(parsed.state.walletManagement.eventsByAddress[wallet2]).toHaveLength(
      10,
    );
    // Confirmed trace IDs & hashes persisted
    expect(parsed.state.walletManagement.confirmedTraceIds).toEqual([
      'trace-1',
      'trace-2',
    ]);
    expect(parsed.state.walletManagement.confirmedExternalHashes).toEqual([
      'hash-1',
      'hash-2',
    ]);

    // Create a fresh store to test rehydration from this localStorage
    const newStore = createWalletStore({ enableDevtools: false });
    const rehydratedState = newStore.getState();

    expect(
      rehydratedState.walletManagement.eventsByAddress[wallet1],
    ).toHaveLength(20);
    expect(
      (rehydratedState.walletManagement.eventsByAddress[wallet1][0] as any)
        .actions[0].TonTransfer.amount,
    ).toBe(1000000000n);
    expect(
      (rehydratedState.walletManagement.eventsByAddress[wallet2][0] as any)
        .actions[0].SmartContractExec.tonAttached,
    ).toBe(500000000n);
    expect(
      rehydratedState.walletManagement.eventsByAddress[wallet2],
    ).toHaveLength(10);
    expect(rehydratedState.walletManagement.events).toHaveLength(20);
    expect(
      (rehydratedState.walletManagement.events[0] as any).actions[0].TonTransfer
        .amount,
    ).toBe(1000000000n);
    expect(rehydratedState.walletManagement.confirmedTraceIds).toEqual([
      'trace-1',
      'trace-2',
    ]);
    expect(rehydratedState.walletManagement.confirmedExternalHashes).toEqual([
      'hash-1',
      'hash-2',
    ]);
  });
});
