import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createWalletStore,
  getSessionPassword,
  setSessionPassword,
  SESSION_PASSWORD_KEY,
} from '@demo/wallet-core';

const mockStore = new Map<string, string>();
const mockSessionStorage = {
  getItem: (key: string) => mockStore.get(key) || null,
  setItem: (key: string, value: string) => mockStore.set(key, String(value)),
  removeItem: (key: string) => mockStore.delete(key),
  clear: () => mockStore.clear(),
};

describe('Wallet Switching & Session Authentication', () => {
  beforeEach(() => {
    (globalThis as any).sessionStorage = mockSessionStorage;
    mockStore.clear();
  });

  it('getSessionPassword and setSessionPassword manage sessionStorage safely', () => {
    expect(getSessionPassword()).toBeUndefined();
    setSessionPassword('TestPass123!');
    expect(getSessionPassword()).toBe('TestPass123!');
    setSessionPassword(undefined);
    expect(getSessionPassword()).toBeUndefined();
  });

  it('loadAllWallets gracefully no-ops when currentPassword is not set', async () => {
    const store = createWalletStore({ enableDevtools: false });
    expect(store.getState().auth.currentPassword).toBeUndefined();

    // Must not throw "User not authenticated"
    await expect(store.getState().loadAllWallets()).resolves.toBeUndefined();
  });

  it('switchWallet allows switching to a wallet already loaded in WalletKit without currentPassword', async () => {
    const store = createWalletStore({ enableDevtools: false });
    const wallet1Addr =
      '0:94d1c009db43c5ecc5fd08b05c8d40b0e99c0e7d88a5d6288a59765e78195fbf';
    const wallet2Addr =
      '0:1111111111111111111111111111111111111111111111111111111111111111';

    const mockKitWallet2: any = {
      getWalletId: () => 'kit_w2',
      getAddress: () => wallet2Addr,
      getPublicKey: () => 'pubkey_2',
      getBalance: async () => 1000000000n,
      getNetwork: () => ({ chainId: -3 }),
    };

    // Mock walletKit with getWallet and getWallets
    const mockWalletKit: any = {
      getWallet: (id: string) => (id === 'kit_w2' ? mockKitWallet2 : undefined),
      getWallets: () => [mockKitWallet2],
      addWallet: async () => mockKitWallet2,
    };

    (store.setState as any)((state: any) => {
      state.auth.currentPassword = undefined; // No password in memory!
      state.walletCore.walletKit = mockWalletKit;
      state.walletManagement.isStreamingConnected = true; // prevent startWebSocketStreaming network calls
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.address = wallet1Addr;
      state.walletManagement.savedWallets = [
        { id: 'w1', address: wallet1Addr, name: 'Wallet 1' },
        {
          id: 'w2',
          address: wallet2Addr,
          name: 'Wallet 2',
          kitWalletId: 'kit_w2',
        },
      ];
    });

    // Should switch to w2 successfully because kitWalletId is in walletKit
    await expect(store.getState().switchWallet('w2')).resolves.toBeUndefined();
    expect(store.getState().walletManagement.activeWalletId).toBe('w2');
    expect(store.getState().walletManagement.address).toBe(wallet2Addr);
  });

  it('switchWallet falls back to address match in WalletKit when kitWalletId is missing', async () => {
    const store = createWalletStore({ enableDevtools: false });
    const wallet1Addr =
      '0:94d1c009db43c5ecc5fd08b05c8d40b0e99c0e7d88a5d6288a59765e78195fbf';
    const wallet2Addr =
      '0:1111111111111111111111111111111111111111111111111111111111111111';

    const mockKitWallet2: any = {
      getWalletId: () => 'resolved_kit_id_2',
      getAddress: () => wallet2Addr,
      getPublicKey: () => 'pubkey_2',
      getBalance: async () => 2000000000n,
      getNetwork: () => ({ chainId: -3 }),
    };

    const mockWalletKit: any = {
      getWallet: () => undefined, // not found by stale ID
      getWallets: () => [mockKitWallet2],
    };

    (store.setState as any)((state: any) => {
      state.auth.currentPassword = undefined;
      state.walletCore.walletKit = mockWalletKit;
      state.walletManagement.isStreamingConnected = true;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.address = wallet1Addr;
      state.walletManagement.savedWallets = [
        { id: 'w1', address: wallet1Addr, name: 'Wallet 1' },
        {
          id: 'w2',
          address: wallet2Addr,
          name: 'Wallet 2',
          kitWalletId: 'stale_id',
        },
      ];
    });

    await store.getState().switchWallet('w2');
    expect(store.getState().walletManagement.activeWalletId).toBe('w2');
    expect(store.getState().walletManagement.savedWallets[1].kitWalletId).toBe(
      'resolved_kit_id_2',
    );
  });

  it('switchWallet throws User not authenticated when wallet needs decryption and password is not available', async () => {
    const store = createWalletStore({ enableDevtools: false });
    const mockWalletKit: any = {
      getWallet: () => undefined,
      getWallets: () => [],
    };

    (store.setState as any)((state: any) => {
      state.auth.currentPassword = undefined;
      state.walletCore.walletKit = mockWalletKit;
      state.walletManagement.activeWalletId = 'w1';
      state.walletManagement.savedWallets = [
        { id: 'w1', address: '0:1', name: 'Wallet 1' },
        {
          id: 'w2',
          address: '0:2',
          name: 'Wallet 2',
          encryptedMnemonic: 'enc_data',
        },
      ];
    });

    await expect(store.getState().switchWallet('w2')).rejects.toThrow(
      'User not authenticated',
    );
  });
});
