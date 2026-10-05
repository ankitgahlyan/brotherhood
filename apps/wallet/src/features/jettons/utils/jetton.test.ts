/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import { isFiJetton } from './jetton';
import { FI_ADDRESS } from '@/lib/brotherhood/config';

describe('isFiJetton', () => {
  it('returns false when only symbol is provided without FI_ADDRESS', () => {
    expect(isFiJetton({ symbol: 'FI' })).toBe(false);
    expect(isFiJetton({ symbol: 'fi' })).toBe(false);
    expect(isFiJetton({ info: { symbol: 'FI' } })).toBe(false);
  });

  it('returns true when address matches FI_ADDRESS', () => {
    expect(isFiJetton({ address: FI_ADDRESS })).toBe(true);
  });

  it('returns false for non-FI jettons or null/undefined', () => {
    expect(isFiJetton(null)).toBe(false);
    expect(isFiJetton(undefined)).toBe(false);
    expect(isFiJetton({ symbol: 'USDT' })).toBe(false);
    expect(isFiJetton({ symbol: 'TON' })).toBe(false);
  });
});
