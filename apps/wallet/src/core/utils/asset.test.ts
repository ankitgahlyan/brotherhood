/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import { assetUrl } from './asset';

describe('assetUrl', () => {
  it('resolves relative paths with base URL', () => {
    const result = assetUrl('ton.svg');
    expect(result).toMatch(/ton\.svg$/);
  });

  it('handles leading slash without double slashes', () => {
    const result = assetUrl('/gram.svg');
    expect(result).not.toContain('//gram.svg');
    expect(result).toMatch(/gram\.svg$/);
  });
});
