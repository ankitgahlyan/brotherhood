/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { z } from 'zod';

const envSchema = z.object({
  VITE_BRIDGE_URL: z
    .string()
    .url()
    .catch('https://connect.ton.org/bridge')
    .default('https://connect.ton.org/bridge'),
  VITE_TON_API_PROVIDER: z
    .enum(['tonapi', 'toncenter'])
    .catch('toncenter')
    .default('toncenter'),
  VITE_TON_API_KEY: z.string().default(''),
  VITE_TON_API_TESTNET_KEY: z.string().default(''),
  VITE_TON_API_TETRA_KEY: z.string().default(''),
  VITE_CUSTOM_TON_TESTNET_RPC: z.string().default(''),
  VITE_DISABLE_NETWORK_SEND: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  VITE_DISABLE_MANIFEST_DOMAIN_CHECK: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  VITE_DISABLE_HTTP_BRIDGE: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  VITE_DISABLE_AUTO_POPUP: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  VITE_DISABLE_AUTO_EMULATION: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
});

const parsedEnv = envSchema.safeParse(import.meta.env ?? {});
const envData = parsedEnv.success
  ? parsedEnv.data
  : {
      VITE_BRIDGE_URL: 'https://connect.ton.org/bridge',
      VITE_TON_API_PROVIDER: 'toncenter' as const,
      VITE_TON_API_KEY: '',
      VITE_TON_API_TESTNET_KEY: '',
      VITE_TON_API_TETRA_KEY: '',
      VITE_CUSTOM_TON_TESTNET_RPC: '',
      VITE_DISABLE_NETWORK_SEND: false,
      VITE_DISABLE_MANIFEST_DOMAIN_CHECK: false,
      VITE_DISABLE_HTTP_BRIDGE: false,
      VITE_DISABLE_AUTO_POPUP: false,
      VITE_DISABLE_AUTO_EMULATION: false,
    };

export const ENV_BRIDGE_URL = envData.VITE_BRIDGE_URL;
export const ENV_TON_API_PROVIDER = envData.VITE_TON_API_PROVIDER;
export const ENV_TON_API_KEY_MAINNET = envData.VITE_TON_API_KEY;
export const ENV_TON_API_KEY_TESTNET = envData.VITE_TON_API_TESTNET_KEY;
export const ENV_TON_API_KEY_TETRA = envData.VITE_TON_API_TETRA_KEY;

export const ENV_CUSTOM_TON_TESTNET_RPC = envData.VITE_CUSTOM_TON_TESTNET_RPC;

export const DISABLE_NETWORK_SEND = envData.VITE_DISABLE_NETWORK_SEND;
export const DISABLE_MANIFEST_DOMAIN_CHECK =
  envData.VITE_DISABLE_MANIFEST_DOMAIN_CHECK;
export const DISABLE_HTTP_BRIDGE = envData.VITE_DISABLE_HTTP_BRIDGE;
export const DISABLE_AUTO_POPUP = envData.VITE_DISABLE_AUTO_POPUP;
export const DISABLE_AUTO_EMULATION = envData.VITE_DISABLE_AUTO_EMULATION;
