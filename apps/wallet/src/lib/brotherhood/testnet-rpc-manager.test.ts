import { describe, expect, it } from 'bun:test';
import {
  TestnetRpcManager,
  PUBLIC_TESTNET_TONCENTER_RPC,
} from './testnet-rpc-manager';
import {
  getProviderQueue,
  resetRateLimiterQueues,
  detectApiKey,
} from './rate-limiter';

describe('TestnetRpcManager', () => {
  it('defaults strictly to official Toncenter RPC without hardcoded local or ngrok candidates', () => {
    const manager = TestnetRpcManager.getInstance();
    manager.setCustomEndpoint(null);
    const candidates = manager.getCandidates();
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toBe(PUBLIC_TESTNET_TONCENTER_RPC);
  });

  it('correctly configures custom endpoint as priority 1 with official fallback', () => {
    const manager = TestnetRpcManager.getInstance();
    const customUrl = 'http://localhost:8081/api/v2/jsonRPC';
    manager.setCustomEndpoint(customUrl);

    const candidates = manager.getCandidates();
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toBe(customUrl);
    expect(candidates[1]).toBe(PUBLIC_TESTNET_TONCENTER_RPC);
    expect(manager.getActiveEndpoint()).toBe(customUrl);

    // Clean up
    manager.setCustomEndpoint(null);
  });

  it('correctly identifies custom vs official endpoints', () => {
    const manager = TestnetRpcManager.getInstance();
    expect(
      manager.isCustomEndpoint('http://localhost:8081/api/v2/jsonRPC'),
    ).toBe(true);
    expect(
      manager.isCustomEndpoint(
        'https://my-ngrok-subdomain.ngrok-free.app/api/v2/jsonRPC',
      ),
    ).toBe(true);
    expect(manager.isCustomEndpoint(PUBLIC_TESTNET_TONCENTER_RPC)).toBe(false);
  });

  it('fails over to official Toncenter when custom endpoint is marked failed', () => {
    const manager = TestnetRpcManager.getInstance();
    const customUrl = 'http://127.0.0.1:8081/api/v2/jsonRPC';
    manager.setCustomEndpoint(customUrl);

    expect(manager.getActiveEndpoint()).toBe(customUrl);

    // Fail custom endpoint
    const fallback = manager.markEndpointFailed(customUrl);
    expect(fallback).toBe(PUBLIC_TESTNET_TONCENTER_RPC);
    expect(manager.getActiveEndpoint()).toBe(PUBLIC_TESTNET_TONCENTER_RPC);

    // Further failures stay at official fallback
    const next = manager.markEndpointFailed(fallback);
    expect(next).toBe(PUBLIC_TESTNET_TONCENTER_RPC);

    // Resetting to primary restores priority 1
    manager.resetToPrimary();
    expect(manager.getActiveEndpoint()).toBe(customUrl);

    // Clean up
    manager.setCustomEndpoint(null);
  });
});

describe('Isolated Provider Rate Limiter', () => {
  it('creates separate queue instances for toncenter and tonapi', () => {
    resetRateLimiterQueues();
    const toncenterQueue = getProviderQueue('toncenter');
    const tonapiQueue = getProviderQueue('tonapi');

    expect(toncenterQueue).not.toBe(tonapiQueue);
    expect(toncenterQueue.name).toBe('toncenter');
    expect(tonapiQueue.name).toBe('tonapi');
  });

  it('detects API key from explicit param, header, or query param', () => {
    expect(detectApiKey(undefined, undefined, 'my-secret-key')).toBe(true);
    expect(detectApiKey(undefined, undefined, '')).toBe(false);

    expect(
      detectApiKey('https://testnet.toncenter.com', {
        'X-API-Key': 'valid-key',
      }),
    ).toBe(true);

    expect(
      detectApiKey('https://testnet.tonapi.io', {
        Authorization: 'Bearer my-token',
      }),
    ).toBe(true);

    expect(
      detectApiKey('https://testnet.toncenter.com/api/v2/jsonRPC?api_key=test'),
    ).toBe(true);

    expect(
      detectApiKey(
        'https://testnet.toncenter.com/api/v2/jsonRPC',
        {},
        undefined,
        {
          checkEnv: false,
        },
      ),
    ).toBe(false);
  });
});
