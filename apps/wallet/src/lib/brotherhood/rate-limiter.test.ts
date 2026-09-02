/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import {
  detectApiKey,
  ToncenterQueue,
} from './rate-limiter';

describe('detectApiKey', () => {
  it('detects explicit API key parameter', () => {
    expect(detectApiKey(undefined, undefined, 'my-secret-key')).toBe(true);
    expect(detectApiKey(undefined, undefined, '   ')).toBe(false);
    expect(detectApiKey(undefined, undefined, '')).toBe(false);
  });

  it('detects x-api-key in Headers object', () => {
    const headers = new Headers();
    headers.set('X-API-Key', 'test-key-123');
    expect(detectApiKey(undefined, headers, undefined, { checkEnv: false })).toBe(true);
  });

  it('detects x-api-key in plain header object', () => {
    expect(detectApiKey(undefined, { 'X-API-Key': 'key' }, undefined, { checkEnv: false })).toBe(true);
    expect(detectApiKey(undefined, { 'x-api-key': 'key' }, undefined, { checkEnv: false })).toBe(true);
    expect(detectApiKey(undefined, { 'content-type': 'application/json' }, undefined, { checkEnv: false })).toBe(false);
  });

  it('detects api_key in URL query param', () => {
    expect(
      detectApiKey('https://toncenter.com/api/v2/jsonRPC?api_key=custom_key', undefined, undefined, { checkEnv: false }),
    ).toBe(true);
    expect(
      detectApiKey('https://toncenter.com/api/v2/jsonRPC', undefined, undefined, { checkEnv: false }),
    ).toBe(false);
  });
});

describe('ToncenterQueue', () => {
  it('queues and dispatches requests with ~100ms spacing when API key is present', async () => {
    const queue = new ToncenterQueue();
    const timestamps: number[] = [];

    const p1 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      return 1;
    }, true);

    const p2 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      return 2;
    }, true);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(timestamps.length).toBe(2);
    const diff = timestamps[1] - timestamps[0];
    // Should be at least ~90ms apart (accounting for timer jitter)
    expect(diff).toBeGreaterThanOrEqual(80);
  });

  it('queues and dispatches requests with ~1000ms spacing when NO API key is present', async () => {
    const queue = new ToncenterQueue();
    const timestamps: number[] = [];

    const p1 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      return 'a';
    }, false);

    const p2 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      return 'b';
    }, false);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe('a');
    expect(r2).toBe('b');
    expect(timestamps.length).toBe(2);
    const diff = timestamps[1] - timestamps[0];
    // Should be at least ~900ms apart
    expect(diff).toBeGreaterThanOrEqual(900);
  });

  it('pauses and respects backoff when 429 is recorded', async () => {
    const queue = new ToncenterQueue();
    const timestamps: number[] = [];

    const p1 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      queue.record429(300); // 300ms backoff
      return 'first';
    }, true);

    const p2 = queue.enqueue(async () => {
      timestamps.push(Date.now());
      return 'second';
    }, true);

    await Promise.all([p1, p2]);
    const diff = timestamps[1] - timestamps[0];
    expect(diff).toBeGreaterThanOrEqual(280);
  });
});
