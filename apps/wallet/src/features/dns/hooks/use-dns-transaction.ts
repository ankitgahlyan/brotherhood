/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toNano } from '@ton/core';
import { useBrotherhoodTransaction } from '@/features/brotherhood/hooks/use-brotherhood-transaction';
import type { Wallet } from '@ton/walletkit';
import type { ITonWalletKit } from '@ton/walletkit';

export const DNS_GAS = {
  /** Per-domain registration: caller should add tier price on top */
  REGISTER_GAS_BUFFER: toNano('1'),
  /** Renewal: caller should add renewal fee on top */
  FILLUP_GAS_BUFFER: toNano('1'),
  /** ChangeDnsRecord */
  CHANGE_RECORD: toNano('0.5'),
  /** WithdrawFees to treasury */
  WITHDRAW: toNano('0.1'),
  /** MintDomainFor */
  MINT_FOR: toNano('1.0'),
} as const;

export function useDnsTransaction(
  wallet: Wallet | null | undefined,
  walletKit: ITonWalletKit | null,
) {
  return useBrotherhoodTransaction(wallet, walletKit);
}
