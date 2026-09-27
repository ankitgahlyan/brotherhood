/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Address, beginCell, Builder, Cell } from '@ton/core';
import { DnsItem } from '@wrappers/DnsItem.gen';
import { DnsCategory, dnsCategoryToBigInt } from '@/core/lib/dns';

// ─── Pricing & Timing (re-exported from centralized config.ts) ───────────────

export {
  AUCTION_END_DURATION_SEC,
  AUCTION_PROLONGATION_SEC,
  AUCTION_START_DURATION_SEC,
  AUCTION_START_TIME,
  BRO_COLLECTION_ADDRESS,
  BRO_COLLECTION_RESOLVER,
  BRO_FIXED_TON_FEE,
  broFiRenewalFee,
  broFiStartingBid,
  broFiTierLabel,
  broRenewalFee,
  BRO_TREASURY_ADDRESS,
  BRO_TREASURY_TON_FEE,
  broTierLabel,
  broTierPrice,
  DNS_GAS,
  MIN_TONS_FOR_STORAGE,
  ONE_DAY_SEC,
  ONE_MONTH_SEC,
  ONE_YEAR_SEC,
  RESERVATION_PERIOD_SEC,
} from '@/lib/brotherhood/config';

// ─── Domain encoding ─────────────────────────────────────────────────────────

/**
 * Encodes a bare domain name (e.g. "alice") into the cell bytes that the
 * DnsCollection contract reads via readDomainFromComment().
 *
 * The contract reads the body slice bits directly (not a text comment prefix),
 * so we just store ASCII bytes into a builder cell.
 */
function encodeDomainCell(name: string): Cell {
  const lower = name.toLowerCase();
  const b = beginCell();
  for (let i = 0; i < lower.length; i++) {
    b.storeUint(lower.charCodeAt(i), 8);
  }
  return b.endCell();
}

/**
 * Computes the domain item index (sha256 of the domain cell), mirroring
 * `domain.hash()` in Tolk (cell hash = sha256 of the BOC representation).
 */
export function domainItemIndex(name: string): bigint {
  const cell = encodeDomainCell(name);
  return BigInt('0x' + cell.hash().toString('hex'));
}

/**
 * Derives the DnsItem NFT address off-chain, given the .bro collection address
 * and the bare domain name (no TLD).
 */
export function deriveDnsItemAddress(
  collectionAddress: Address,
  domainName: string,
  testOnly = false,
): string {
  const index = domainItemIndex(domainName);
  const item = DnsItem.fromStorage({ index, collectionAddress });
  return item.address.toString({ bounceable: true, testOnly });
}

// ─── Message body builders ────────────────────────────────────────────────────

/**
 * Builds the body for DeployDnsDomain (opcode 0x00000000).
 * The domain name is appended as raw ASCII bytes after the opcode.
 *
 * Contract reads: `readDomainFromComment(mutate msg.payload)` which reads
 * all remaining bits/refs from the payload slice.
 */
export function buildDeployDnsDomainBody(domainName: string): Cell {
  const lower = domainName.toLowerCase();
  const b = beginCell().storeUint(0x00000000, 32);
  for (let i = 0; i < lower.length; i++) {
    b.storeUint(lower.charCodeAt(i), 8);
  }
  return b.endCell();
}

/**
 * Builds the body for FillUp (opcode 0x370fec51).
 */
export function buildFillUpBody(queryId: bigint): Cell {
  return beginCell().storeUint(0x370fec51, 32).storeUint(queryId, 64).endCell();
}

/**
 * Builds the body for ChangeDnsRecord (opcode 0x4eb1f0f9).
 * For the wallet record, key = sha256BigInt(DnsCategory.Wallet).
 * valueCell: the smart-contract-address record cell (0x9fd3 prefix + address),
 * or null to delete the record.
 */
export function buildChangeDnsRecordBody(
  key: bigint,
  valueCell: Cell | null,
): Cell {
  const b = beginCell()
    .storeUint(0x4eb1f0f9, 32)
    .storeUint(0n, 64) // queryId
    .storeUint(key, 256);

  if (valueCell !== null) {
    b.storeRef(valueCell);
  }
  return b.endCell();
}

/**
 * Builds the wallet DNS record value cell (TEP-81 smart-contract-address record).
 * Prefix 0x9fd3 (2 bytes), followed by MsgAddress.
 */
export function buildWalletDnsRecordCell(walletAddress: Address): Cell {
  return beginCell()
    .storeUint(0x9f, 8)
    .storeUint(0xd3, 8)
    .storeAddress(walletAddress)
    .endCell();
}

/**
 * The sha256 key for the DNS wallet category — mirrors dnsCategoryToBigInt(DnsCategory.Wallet).
 */
export function walletDnsKey(): bigint {
  return dnsCategoryToBigInt(DnsCategory.Wallet);
}

/**
 * Builds the body for WithdrawFees (opcode 0x59a3c821).
 */
export function buildWithdrawFeesBody(
  queryId: bigint,
  amount: bigint,
  recipient: Address,
): Cell {
  return beginCell()
    .storeUint(0x59a3c821, 32)
    .storeUint(queryId, 64)
    .storeCoins(amount)
    .storeAddress(recipient)
    .endCell();
}

/**
 * Builds the body for MintDomainFor (opcode 0x2c159bf4).
 * Domain name appended as ASCII bytes in payload (same as DeployDnsDomain).
 */
export function buildMintDomainForBody(
  queryId: bigint,
  targetOwner: Address,
  domainName: string,
): Cell {
  const lower = domainName.toLowerCase();
  const b: Builder = beginCell()
    .storeUint(0x2c159bf4, 32)
    .storeUint(queryId, 64)
    .storeAddress(targetOwner);

  for (let i = 0; i < lower.length; i++) {
    b.storeUint(lower.charCodeAt(i), 8);
  }
  return b.endCell();
}

/**
 * Builds the body for DnsBidRequest (opcode 0x62696430) sent to user's FossFiWallet.
 */
export function buildDnsBidRequestBody(
  queryId: bigint,
  domainName: string,
  fiBidAmount: bigint,
  collectionAddress: Address,
): Cell {
  const domainCell = encodeDomainCell(domainName);
  return beginCell()
    .storeUint(0x62696430, 32)
    .storeUint(queryId, 64)
    .storeRef(domainCell)
    .storeCoins(fiBidAmount)
    .storeAddress(collectionAddress)
    .endCell();
}

/**
 * Builds the body for FinalizeAuction (opcode 0x66696e61) sent to DnsItem.
 */
export function buildFinalizeAuctionBody(queryId: bigint): Cell {
  return beginCell().storeUint(0x66696e61, 32).storeUint(queryId, 64).endCell();
}

/**
 * Builds the body for DnsRenewRequest (opcode 0x72656e30) sent to user's FossFiWallet.
 */
export function buildDnsRenewRequestBody(
  queryId: bigint,
  itemAddress: Address,
  fiAmount: bigint,
): Cell {
  return beginCell()
    .storeUint(0x72656e30, 32)
    .storeUint(queryId, 64)
    .storeAddress(itemAddress)
    .storeCoins(fiAmount)
    .endCell();
}
