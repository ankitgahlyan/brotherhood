/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { toast } from 'sonner';
import { Address } from '@ton/core';
import { Base64ToHex } from '@ton/walletkit';
import { useWalletStore, type NetworkType } from '@demo/wallet-core';

export type AddressNetwork = NetworkType;

/**
 * Normalizes any TON address into standard userfriendly representation.
 * - Testnet User Wallet: `0Q...` (testOnly: true, bounceable: false)
 * - Testnet Smart Contract: `kQ...` (testOnly: true, bounceable: true)
 * - Mainnet User Wallet: `UQ...` (testOnly: false, bounceable: false)
 * - Mainnet Smart Contract: `EQ...` (testOnly: false, bounceable: true)
 */
export function normalizeAddress(
  address: string,
  bounceable = false,
  network: AddressNetwork = 'testnet',
): string | null {
  try {
    return Address.parse(address).toString({
      urlSafe: true,
      bounceable,
      testOnly: network === 'testnet',
    });
  } catch {
    return null;
  }
}

export function shortenAddress(
  addr?: string,
  count = 4,
  bounceable = false,
  network: AddressNetwork = 'testnet',
): string {
  if (!addr) return '';
  const normalized = normalizeAddress(addr, bounceable, network) ?? addr;
  return normalized.length <= count * 2
    ? normalized
    : `${normalized.slice(0, count)}...${normalized.slice(-count)}`;
}

export interface FormatTonAddressOptions {
  isContract?: boolean;
  network?: AddressNetwork;
  shorten?: boolean;
  count?: number;
}

/**
 * Format any TON address string or Address instance with explicit contract/wallet semantics
 */
export function formatTonAddress(
  address: Address | string | null | undefined,
  options?: FormatTonAddressOptions,
): string {
  if (!address) return '';
  const str = typeof address === 'string' ? address : address.toString();
  const isContract = options?.isContract ?? false;
  const network = options?.network ?? 'testnet';
  const count = options?.count ?? 4;

  if (options?.shorten) {
    return shortenAddress(str, count, isContract, network);
  }
  return normalizeAddress(str, isContract, network) ?? str;
}

/**
 * Copies a TON address to clipboard formatted according to network and contract semantics.
 */
export async function copyTonAddress(
  address: Address | string | null | undefined,
  options?: {
    isContract?: boolean;
    network?: AddressNetwork;
    feedbackMessage?: string;
  },
): Promise<boolean> {
  if (!address) return false;
  const isContract = options?.isContract ?? false;
  const network = options?.network ?? 'testnet';
  const formatted = formatTonAddress(address, {
    isContract,
    network,
    shorten: false,
  });
  if (!formatted) return false;
  try {
    await navigator.clipboard.writeText(formatted);
    const msg =
      options?.feedbackMessage ??
      (isContract ? 'Contract address copied' : 'Address copied');
    toast.success(msg);
    return true;
  } catch {
    toast.error('Failed to copy address');
    return false;
  }
}

/**
 * Hook providing reactive address formatters aligned with currently connected wallet network
 */
export function useFormatAddress() {
  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const activeWalletId = useWalletStore(
    (state) => state.walletManagement.activeWalletId,
  );
  const activeWallet = savedWallets.find((w) => w.id === activeWalletId);
  const network: AddressNetwork = activeWallet?.network || 'testnet';

  return {
    network,
    formatAddress: (
      address: Address | string | null | undefined,
      options?: { isContract?: boolean; shorten?: boolean; count?: number },
    ) => formatTonAddress(address, { ...options, network }),
    formatWalletAddress: (
      address: Address | string | null | undefined,
      shorten = false,
      count = 4,
    ) =>
      formatTonAddress(address, {
        isContract: false,
        network,
        shorten,
        count,
      }),
    formatContractAddress: (
      address: Address | string | null | undefined,
      shorten = false,
      count = 4,
    ) =>
      formatTonAddress(address, {
        isContract: true,
        network,
        shorten,
        count,
      }),
    copyWalletAddress: async (
      address: Address | string | null | undefined,
      feedbackMessage?: string,
    ) =>
      copyTonAddress(address, {
        isContract: false,
        network,
        feedbackMessage,
      }),
    copyContractAddress: async (
      address: Address | string | null | undefined,
      feedbackMessage?: string,
    ) =>
      copyTonAddress(address, {
        isContract: true,
        network,
        feedbackMessage: feedbackMessage ?? 'Contract address copied',
      }),
  };
}

/**
 * Compare two TON addresses for equality (handles different formats: 0:xxx, EQxxx, UQxxx, 0Qxxx, kQxxx)
 */
export function sameAddress(a: string, b: string): boolean {
  if (!a || !b) return a === b;
  try {
    return Address.parse(a).equals(Address.parse(b));
  } catch {
    return a === b;
  }
}

/**
 * Formats a Unix timestamp (in seconds) to a localized date/time string
 * @param timestampSeconds - Unix timestamp in seconds
 * @returns Formatted date/time string
 */
export const formatTimestamp = (timestampSeconds: number): string => {
  return new Date(timestampSeconds * 1000).toLocaleString();
};

type ExplorerNetwork = 'mainnet' | 'testnet' | 'tetra';

function getTonviewerHost(network: ExplorerNetwork): string {
  if (network === 'testnet') return 'testnet.tonviewer.com';
  if (network === 'tetra') return 'tetra.tonviewer.com';
  return 'tonviewer.com';
}

function toHexHash(hash: string): string {
  if (/^(0x)?[0-9a-fA-F]+$/.test(hash)) {
    return hash.startsWith('0x') ? hash.slice(2) : hash;
  }
  try {
    const hex = Base64ToHex(hash);
    return hex.startsWith('0x') ? hex.slice(2) : hex;
  } catch {
    return hash;
  }
}

export function getTonviewerTxUrl(
  network: ExplorerNetwork,
  hash: string,
): string {
  return `https://${getTonviewerHost(network)}/transaction/${toHexHash(hash)}`;
}

/**
 * Formats a human-readable amount for compact display, mirroring the appkit-react
 * widget formatter (`formatLargeValue` from `@ton/appkit`): abbreviates large values
 * (M/B/T) and otherwise truncates to `decimals` fractional digits with locale
 * thousands separators. Expects a decimal amount, not nanoton.
 */
export const formatLargeValue = (
  amount: string,
  decimals: number = 2,
  minimumFractionDigits: number = 0,
): string => {
  const cleanAmount = amount.toString().replace(/\s/g, '');
  const intPart = cleanAmount.split('.')[0] || '0';

  // 13+ integer digits (>= 1e12) => trillions, e.g. "1.23T"
  if (intPart.length > 12) {
    return `${(Number(intPart.slice(0, -10)) / 100).toLocaleString('en-US')}T`;
  }
  // 10+ integer digits (>= 1e9) => billions, e.g. "1.23B"
  if (intPart.length > 9) {
    return `${(Number(intPart.slice(0, -7)) / 100).toLocaleString('en-US')}B`;
  }
  // 7+ integer digits (>= 1e6) => millions, e.g. "1.23M"
  if (intPart.length > 6) {
    return `${(Number(intPart.slice(0, -4)) / 100).toLocaleString('en-US')}M`;
  }

  const value = parseFloat(cleanAmount);
  if (isNaN(value)) {
    return '0';
  }

  const factor = Math.pow(10, decimals);
  const truncated = Math.floor(value * factor) / factor;

  return truncated.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: decimals,
  });
};
