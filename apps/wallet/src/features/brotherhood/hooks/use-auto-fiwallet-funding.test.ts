import { describe, it, expect, beforeEach, mock } from 'bun:test';
import type { Wallet } from '@ton/walletkit';
import {
  autoFundUnderfundedFiWallets,
  resetFundedFiWalletsCacheForTests,
  FUNDING_AMOUNT_NANO,
} from './use-auto-fiwallet-funding';

// Mock sonner toast
mock.module('sonner', () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
    info: mock(() => {}),
  },
}));

describe('autoFundUnderfundedFiWallets', () => {
  beforeEach(() => {
    resetFundedFiWalletsCacheForTests();
  });

  const createMockWallet = (balanceNano: bigint) => {
    const singleTxCalls: any[] = [];
    const multiTxCalls: any[] = [];
    const sentTxs: any[] = [];

    const mockWallet = {
      getAddress: () => 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
      getBalance: async () => balanceNano.toString(),
      createTransferTonTransaction: async (params: any) => {
        singleTxCalls.push(params);
        return { type: 'single', params };
      },
      createTransferMultiTonTransaction: async (params: any) => {
        multiTxCalls.push(params);
        return { type: 'multi', params };
      },
      sendTransaction: async (tx: any) => {
        sentTxs.push(tx);
        return { normalizedHash: 'mock_tx_hash_123', boc: 'mock_boc' };
      },
    } as unknown as Wallet;

    return { mockWallet, singleTxCalls, multiTxCalls, sentTxs };
  };

  it('skips funding when wallet is null or not provided', async () => {
    const result = await autoFundUnderfundedFiWallets({
      wallet: null,
      isUnlocked: true,
      savedWallets: [
        { address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c' },
      ],
    });

    expect(result.attempted).toBe(false);
    expect(result.skippedReason).toBe('no_wallet');
  });

  it('skips funding when wallet is locked', async () => {
    const { mockWallet } = createMockWallet(10_000_000_000n);
    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: false,
      savedWallets: [
        { address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c' },
      ],
    });

    expect(result.attempted).toBe(false);
    expect(result.skippedReason).toBe('wallet_locked');
  });

  it('skips funding when active wallet cannot preserve the 0.5 TON reserve', async () => {
    // 2 TON needed + 0.5 TON reserve + 0.05 TON fee = 2.55 TON minimum
    // Provide only 1.5 TON
    const { mockWallet, sentTxs } = createMockWallet(1_500_000_000n);
    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      savedWallets: [
        { address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c' },
      ],
    });

    expect(result.attempted).toBe(false);
    expect(result.skippedReason).toBe('insufficient_active_balance');
    expect(sentTxs.length).toBe(0);
  });

  it('funds 1 underfunded FiWallet using single transaction', async () => {
    // Active wallet has 10 TON
    const { mockWallet, singleTxCalls, multiTxCalls, sentTxs } =
      createMockWallet(10_000_000_000n);
    const targetAddr = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqq23W612bOoqTtU';

    const mockFetch = async () => ({
      accounts: [
        {
          address: targetAddr,
          balance: '500000000', // 0.5 TON (< 2 TON)
          status: 'active',
        },
      ],
      addressBook: {},
      metadata: {},
    });

    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [targetAddr],
      fetchAccountStatesFn: mockFetch as any,
    });

    expect(result.attempted).toBe(true);
    expect(result.fundedCount).toBe(1);
    expect(result.fundedAddresses).toContain(targetAddr);
    expect(singleTxCalls.length).toBe(1);
    expect(singleTxCalls[0].transferAmount).toBe(
      FUNDING_AMOUNT_NANO.toString(),
    );
    expect(multiTxCalls.length).toBe(0);
    expect(sentTxs.length).toBe(1);
  });

  it('funds multiple underfunded FiWallets using multi-message transaction', async () => {
    // Active wallet has 10 TON
    const { mockWallet, singleTxCalls, multiTxCalls, sentTxs } =
      createMockWallet(10_000_000_000n);

    const addr1 = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqq23W612bOoqTtU';
    const addr2 = 'EQC_1zgw2SxDqAabD02r3Jve889y_g_Pz11n499999999999';

    const mockFetch = async () => ({
      accounts: [
        {
          address: addr1,
          balance: '1000000000', // 1 TON (< 2 TON)
          status: 'active',
        },
        {
          address: addr2,
          balance: '0', // 0 TON (< 2 TON)
          status: 'uninit',
        },
      ],
      addressBook: {},
      metadata: {},
    });

    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [addr1, addr2],
      fetchAccountStatesFn: mockFetch as any,
    });

    expect(result.attempted).toBe(true);
    expect(result.fundedCount).toBe(2);
    expect(multiTxCalls.length).toBe(1);
    expect(multiTxCalls[0].length).toBe(2);
    expect(sentTxs.length).toBe(1);
  });

  it('does not re-fund addresses already funded in the current session', async () => {
    const { mockWallet, sentTxs } = createMockWallet(10_000_000_000n);
    const targetAddr = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqq23W612bOoqTtU';

    const mockFetch = async () => ({
      accounts: [
        {
          address: targetAddr,
          balance: '100000000',
          status: 'active',
        },
      ],
      addressBook: {},
      metadata: {},
    });

    // First run funds it
    const res1 = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [targetAddr],
      fetchAccountStatesFn: mockFetch as any,
    });
    expect(res1.fundedCount).toBe(1);
    expect(sentTxs.length).toBe(1);

    // Second run skips because of session deduplication
    const res2 = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [targetAddr],
      fetchAccountStatesFn: mockFetch as any,
    });
    expect(res2.fundedCount).toBe(0);
    expect(res2.skippedReason).toBe('no_candidates');
    expect(sentTxs.length).toBe(1); // No new tx sent
  });

  it('skips funding if all FiWallets already have at least 2 TON', async () => {
    const { mockWallet, sentTxs } = createMockWallet(10_000_000_000n);
    const targetAddr = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqq23W612bOoqTtU';

    const mockFetch = async () => ({
      accounts: [
        {
          address: targetAddr,
          balance: '2500000000', // 2.5 TON (>= 2 TON)
          status: 'active',
        },
      ],
      addressBook: {},
      metadata: {},
    });

    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [targetAddr],
      fetchAccountStatesFn: mockFetch as any,
    });

    expect(result.attempted).toBe(true);
    expect(result.fundedCount).toBe(0);
    expect(result.skippedReason).toBe('all_sufficiently_funded');
    expect(sentTxs.length).toBe(0);
  });

  it('caps number of funded recipients to what active balance allows while reserving 0.5 TON', async () => {
    // Active wallet has 3.0 TON
    // Reserve is 0.5 TON -> available is 2.5 TON
    // Cost per recipient is 2.05 TON -> can afford only 1 recipient!
    const { mockWallet, singleTxCalls, multiTxCalls, sentTxs } =
      createMockWallet(3_000_000_000n);

    const addr1 = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqq23W612bOoqTtU';
    const addr2 = 'EQC_1zgw2SxDqAabD02r3Jve889y_g_Pz11n499999999999';

    const mockFetch = async () => ({
      accounts: [
        { address: addr1, balance: '0', status: 'uninit' },
        { address: addr2, balance: '0', status: 'uninit' },
      ],
      addressBook: {},
      metadata: {},
    });

    const result = await autoFundUnderfundedFiWallets({
      wallet: mockWallet,
      isUnlocked: true,
      extraFiWallets: [addr1, addr2],
      fetchAccountStatesFn: mockFetch as any,
    });

    expect(result.attempted).toBe(true);
    expect(result.fundedCount).toBe(1); // Capped at 1
    expect(sentTxs.length).toBe(1);
    expect(singleTxCalls.length).toBe(1);
  });
});
