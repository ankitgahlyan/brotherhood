/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Resolves a public asset path against Vite's configured BASE_URL.
 * Supports leading slashes or clean names, ensuring correct routing whether
 * hosted at root `/` or under a sub-path like `/brotherhood/`.
 */
export const assetUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.endsWith('/') ? base : `${base}/`}${cleanPath}`;
};
