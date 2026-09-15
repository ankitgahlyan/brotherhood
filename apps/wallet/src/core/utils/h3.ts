/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const H3_CELL_REGEX = /^0?8[0-9a-fA-F]{14}$/;

/**
 * Checks whether a given string is a valid H3 hexagon cell index.
 * Standard H3 cell index representations are 15 hexadecimal characters starting with '8'
 * (or 16 characters with leading zero '08').
 */
export function isValidH3Cell(h3Cell?: string | null): boolean {
  if (!h3Cell) return false;
  const clean = h3Cell.trim();
  return H3_CELL_REGEX.test(clean);
}

/**
 * Normalizes an H3 cell index to canonical 15-character lowercase hex string.
 */
export function normalizeH3Cell(h3Cell?: string | null): string {
  if (!h3Cell) return '';
  const clean = h3Cell.trim().toLowerCase();
  if (clean.length === 16 && clean.startsWith('0')) {
    return clean.slice(1);
  }
  return clean;
}

/**
 * Generate a canonical deep-link URL to the H3 satellite viewer.
 *
 * @param h3Cell Optional H3 hexagonal cell index
 * @returns Deep-link URL with lockRes=1 and layer=satellite
 */
export function getH3ViewerUrl(h3Cell?: string | null): string {
  const clean = h3Cell?.trim();
  if (!clean) {
    return 'https://ankitgahlyan.github.io/h3-viewer/?lockRes=1&layer=satellite';
  }
  return `https://ankitgahlyan.github.io/h3-viewer/?h3=${encodeURIComponent(clean)}&lockRes=1&layer=satellite`;
}
