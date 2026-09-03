/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import { getH3ViewerUrl } from './h3';

describe('getH3ViewerUrl', () => {
  it('returns default satellite viewer URL when h3Cell is null or undefined', () => {
    expect(getH3ViewerUrl(null)).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite',
    );
    expect(getH3ViewerUrl(undefined)).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite',
    );
  });

  it('returns default satellite viewer URL when h3Cell is empty string or only whitespace', () => {
    expect(getH3ViewerUrl('')).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite',
    );
    expect(getH3ViewerUrl('   ')).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite',
    );
  });

  it('returns deep-link URL with h3 param, lockRes=1, and layer=satellite', () => {
    expect(getH3ViewerUrl('882681a339fffff')).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?h3=882681a339fffff&lockRes=1&layer=satellite',
    );
  });

  it('trims whitespace and encodes special characters', () => {
    expect(getH3ViewerUrl('  8828308281fffff  ')).toBe(
      'https://ankitgahlyan.github.io/h3-viewer/?h3=8828308281fffff&lockRes=1&layer=satellite',
    );
  });
});
