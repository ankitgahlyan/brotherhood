/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE?: string;
  readonly VITE_BRIDGE_URL?: string;
  readonly VITE_TON_API_KEY?: string;
  readonly VITE_TONCENTER_TESTNET_API_KEY?: string;
  readonly VITE_TONCENTER_MAINNET_API_KEY?: string;
  readonly TONCENTER_TESTNET_API_KEY?: string;
  readonly TONCENTER_MAINNET_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@fontsource-variable/inter';
