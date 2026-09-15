/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import { getH3ViewerUrl, isValidH3Cell, normalizeH3Cell } from './h3';

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

describe('isValidH3Cell', () => {
  it('returns true for valid 15-character hex cells starting with 8', () => {
    expect(isValidH3Cell('882681a339fffff')).toBe(true);
    expect(isValidH3Cell('8828308281fffff')).toBe(true);
    expect(isValidH3Cell('8A28308281FFFFF')).toBe(true);
    expect(isValidH3Cell('  882681a339fffff  ')).toBe(true);
  });

  it('returns true for 16-character hex cells with leading zero (08...) ', () => {
    expect(isValidH3Cell('0882681a339fffff')).toBe(true);
  });

  it('returns false for null, undefined, or empty string', () => {
    expect(isValidH3Cell(null)).toBe(false);
    expect(isValidH3Cell(undefined)).toBe(false);
    expect(isValidH3Cell('')).toBe(false);
    expect(isValidH3Cell('   ')).toBe(false);
  });

  it('returns false for invalid prefix or length', () => {
    // Starts with 7 instead of 8
    expect(isValidH3Cell('782681a339fffff')).toBe(false);
    // Too short
    expect(isValidH3Cell('882681a339ffff')).toBe(false);
    // Too long
    expect(isValidH3Cell('882681a339fffffff')).toBe(false);
    // Non-hex characters
    expect(isValidH3Cell('882681a339ffffz')).toBe(false);
    expect(isValidH3Cell('hello-world-123')).toBe(false);
  });
});

describe('normalizeH3Cell', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeH3Cell('  882681A339FFFFF  ')).toBe('882681a339fffff');
  });

  it('strips leading 0 from 16-character format', () => {
    expect(normalizeH3Cell('0882681A339FFFFF')).toBe('882681a339fffff');
  });

  it('returns empty string for null or undefined', () => {
    expect(normalizeH3Cell(null)).toBe('');
    expect(normalizeH3Cell(undefined)).toBe('');
  });
});
