import { describe, expect, it } from 'bun:test';
import {
  TestnetRpcManager,
  LOCAL_TESTNET_RPC,
  DEFAULT_NGROK_TESTNET_RPC,
  PUBLIC_TESTNET_TONCENTER_RPC,
} from './testnet-rpc-manager';

describe('TestnetRpcManager', () => {
  it('initializes candidates in correct priority order', () => {
    const manager = TestnetRpcManager.getInstance();
    const candidates = manager.getCandidates();
    expect(candidates).toHaveLength(3);
    expect(candidates[0]).toBe(LOCAL_TESTNET_RPC);
    expect(candidates[1]).toBe(DEFAULT_NGROK_TESTNET_RPC);
    expect(candidates[2]).toBe(PUBLIC_TESTNET_TONCENTER_RPC);
  });

  it('correctly identifies custom vs public endpoints', () => {
    const manager = TestnetRpcManager.getInstance();
    expect(manager.isCustomEndpoint(LOCAL_TESTNET_RPC)).toBe(true);
    expect(manager.isCustomEndpoint(DEFAULT_NGROK_TESTNET_RPC)).toBe(true);
    expect(manager.isCustomEndpoint(PUBLIC_TESTNET_TONCENTER_RPC)).toBe(false);
  });

  it('fails over to public endpoint when markEndpointFailed is called', () => {
    const manager = TestnetRpcManager.getInstance();

    // Initial endpoint is priority 1 or 2
    const first = manager.getActiveEndpoint();
    const second = manager.markEndpointFailed(first);
    expect(second).not.toBe(first);

    // Failing second should lead to public Toncenter
    const third = manager.markEndpointFailed(second);
    expect(third).toBe(PUBLIC_TESTNET_TONCENTER_RPC);

    // Further failures stay at fallback
    const fourth = manager.markEndpointFailed(third);
    expect(fourth).toBe(PUBLIC_TESTNET_TONCENTER_RPC);
  });
});
