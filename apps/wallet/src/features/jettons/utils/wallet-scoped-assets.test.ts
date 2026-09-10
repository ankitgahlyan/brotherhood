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
});
