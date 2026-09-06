/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AddWalletModal } from '../add-wallet-modal';
import type { AddWalletMode } from '../add-wallet-modal';

export type CreateWalletMode = AddWalletMode;

/**
 * @deprecated Use {@link AddWalletModal} instead.
 */
export const CreateWalletModal = AddWalletModal;
