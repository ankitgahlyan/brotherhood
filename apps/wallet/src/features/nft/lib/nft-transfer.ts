/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Address, beginCell, type Cell, toNano } from '@ton/core';

export const NFT_TRANSFER_GAS = toNano('0.08');

export interface BuildNftTransferOptions {
  queryId?: bigint;
  newOwner: Address;
  responseDestination?: Address;
  forwardAmount?: bigint;
}

/**
 * Builds the standard TEP-62 transfer message body for NFT items and .bro DNS items.
 * Opcode: 0x5fcc3d14 (TransferOwnership)
 */
export function buildNftTransferBody({
  queryId = 0n,
  newOwner,
  responseDestination,
  forwardAmount = toNano('0.01'),
}: BuildNftTransferOptions): Cell {
  return beginCell()
    .storeUint(0x5fcc3d14, 32)
    .storeUint(queryId, 64)
    .storeAddress(newOwner)
    .storeAddress(responseDestination ?? newOwner)
    .storeBit(0) // customPayload: null
    .storeCoins(forwardAmount)
    .storeBit(0) // forwardPayload: inline empty
    .endCell();
}
