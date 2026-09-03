/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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
