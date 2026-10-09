/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { PersonalCreditInfo } from '@wrappers/PersonalWallet.gen';

export type BorrowTokenKind = 'fi' | 'reserve' | 'custom';

export interface BorrowToken {
  id: string;
  kind: BorrowTokenKind;
  symbol: string;
  name: string;
  icon?: string;
  ownerAddress: string;
  minterAddress: string;
  userWalletAddress: string;
  isDeployed: boolean;
  creditInfo?: PersonalCreditInfo | null;
  // FI specific fallback fields
  fiCreditNeed?: bigint;
  fiCreditCutoff?: number;
  fiCreditMaturity?: number;
  fiMultiplier?: number;
  isPinned: boolean;
  username?: string;
  domain?: string;
}

export interface PinnedTokenStorageEntry {
  id: string;
  kind: BorrowTokenKind;
  symbol: string;
  name: string;
  icon?: string;
  ownerAddress: string;
  minterAddress: string;
  username?: string;
  domain?: string;
}
