import { describe, it, expect, beforeEach } from 'bun:test';
import { createWalletStore } from '@demo/wallet-core';
import type { NFT } from '@ton/walletkit';

describe('Wallet Scoped Assets Tracking', () => {
  let store: ReturnType<typeof createWalletStore>;

  beforeEach(() => {
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
      state.jettons.userJettons = [jetton1];
      state.nfts.nftsByAddress[wallet1] = [nft1];
      state.nfts.userNfts = [nft1];
    });

    expect((store.getState().jettons.userJettons as any)[0].symbol).toBe('T1');
    expect(store.getState().jettons.userJettons).toHaveLength(1);
    expect(store.getState().nfts.userNfts).toHaveLength(1);

    // Now populate wallet 2 data into jettonsByAddress
    (store.setState as any)((state: any) => {
      state.jettons.jettonsByAddress[wallet2] = [jetton2];
      state.nfts.nftsByAddress[wallet2] = [];
    });

    // Active view should still show wallet 1 assets
    expect((store.getState().jettons.userJettons as any)[0].symbol).toBe('T1');

    // Simulate switching to wallet 2 in state
    const savedWallet2 = store
      .getState()
      .walletManagement.savedWallets.find((w) => w.id === 'w2')!;
    (store.setState as any)((state: any) => {
      state.walletManagement.activeWalletId = 'w2';
      state.walletManagement.address = savedWallet2.address;
      state.jettons.userJettons =
        state.jettons.jettonsByAddress[savedWallet2.address] ?? [];
      state.nfts.userNfts =
        state.nfts.nftsByAddress[savedWallet2.address] ?? [];
    });

    // Active view must now switch to wallet 2's assets
    expect(store.getState().jettons.userJettons).toHaveLength(1);
    expect((store.getState().jettons.userJettons as any)[0].symbol).toBe('T2');
    expect(store.getState().nfts.userNfts).toHaveLength(0);

    // Both wallets' data is still preserved in jettonsByAddress
    expect(store.getState().jettons.jettonsByAddress[wallet1]).toHaveLength(1);
    expect(store.getState().jettons.jettonsByAddress[wallet2]).toHaveLength(1);

    // Stream balance update for active wallet
    store.getState().updateJettonBalanceFromStream('EQWalletJetton2', '6000');
    expect(store.getState().jettons.userJettons[0].balance).toBe('6000');
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

    // Active wallet is wallet1, so userJettons matches wallet1
    expect(state.jettons.userJettons).toHaveLength(1);
    expect(state.jettons.userJettons[0].walletAddress).toBe('EQWalletJetton1');
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

  it('persists eventsByAddress in localStorage, caps at 50, and restores on rehydration', async () => {
    const wallet1 = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9q';
    const wallet2 = '0QBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAC9q';

    // Create 60 dummy events for wallet1
    const dummyEventsW1 = Array.from({ length: 60 }, (_, i) => ({
      eventId: `ev-w1-${i}`,
      account: { address: wallet1 },
      actions: [],
    }));

    const dummyEventsW2 = Array.from({ length: 10 }, (_, i) => ({
      eventId: `ev-w2-${i}`,
      account: { address: wallet2 },
      actions: [],
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
    const persistedRaw = localStorage.getItem('demo-wallet-store');
    expect(persistedRaw).not.toBeNull();
    const parsed = JSON.parse(persistedRaw!);

    expect(parsed.state.walletManagement.eventsByAddress).toBeDefined();
    // Must be capped at 50 for wallet 1
    expect(parsed.state.walletManagement.eventsByAddress[wallet1]).toHaveLength(
      50,
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
    ).toHaveLength(50);
    expect(
      rehydratedState.walletManagement.eventsByAddress[wallet2],
    ).toHaveLength(10);
    expect(rehydratedState.walletManagement.events).toHaveLength(50);
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
