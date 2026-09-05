/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Cell } from '@ton/core';

export const KNOWN_OPCODES: Record<number, string> = {
  // Standard Jetton & NFT Opcodes (TEP-74, TEP-64, TEP-89)
  0x0f8a7ea5: 'Jetton Transfer',
  0x7362d09c: 'Transfer Notification',
  0x178d4519: 'Internal Transfer Step',
  0xd53276db: 'Return Excesses',
  0x595f07bc: 'Burn Jettons',
  0x7bdd97de: 'Burn Notification',
  0x2c76b972: 'Request Wallet Address',
  0xd1735466: 'Response Wallet Address',
  0x5fcc3d14: 'NFT Transfer',
  0x05138d91: 'Ownership Assigned',
  0x6f89f5e3: 'Get Static Data',
  0x8b771735: 'Report Static Data',
  0x1f0453e0: 'NFT Destroy',

  // Brotherhood Group 1: Governance & Admin
  0x00001001: 'Mint New Jettons',
  0x00001002: 'Change Minter Admin',
  0x00001003: 'Claim Minter Admin',
  0x00001004: 'Drop Minter Admin',
  0x00001005: 'Change Minter Metadata',
  0x00001006: 'Upgrade Contract',
  0x00001007: 'Top Up TON',
  0x00001008: 'Request Upgrade Code',
  0x00001009: 'Approve Upgrade',
  0x0000100a: 'Reject Upgrade',
  0x0000100b: 'Hot Upgrade',
  0x0000100c: 'Change DAO Address',
  0x0000100d: 'Execute DAO Proposal',
  0x0000100e: 'Request Total Accounts',
  0x0000100f: 'Response Total Accounts',
  0x00001010: 'Init DAO Proxy',

  // Brotherhood Group 2: Account Lifecycle & Onboarding
  0x00001051: 'Invite Member',
  0x00001052: 'Internal Invite',
  0x00001053: 'Internal Invite Approval',
  0x00001054: 'Inform Minter Invite',
  0x00001055: 'Deactivate Account',
  0x00001056: 'Internal Deactivate',
  0x00001057: 'Request Upgrade',
  0x00001058: 'Destroy Account',
  0x00001059: 'Destroy',
  0x0000105a: 'Close Account',
  0x0000105b: 'Authority Close Account',

  // Brotherhood Group 3: Profile & Location Indexing
  0x000010a1: 'Change Username',
  0x000010a2: 'Change Location',
  0x000010a3: 'Inform Minter Location Change',
  0x000010a4: 'Add Location Member',
  0x000010a5: 'Remove Location Member',
  0x000010a8: 'Change Country',

  // Brotherhood Group 4: Social, Voting, & DAO
  0x000010f1: 'Cast Vote',
  0x000010f2: 'Revoke Vote',
  0x000010f3: 'Forward Voting Action',
  0x000010f4: 'Dispatch Authority Action',
  0x000010f5: 'Authority Action',
  0x000010f6: 'Set Member Status',
  0x000010f7: 'Transfer By Authority',
  0x000010fa: 'Submit DAO Proposal',
  0x000010fb: 'Init DAO Poll',
  0x000010fc: 'Vote on DAO Proposal',
  0x000010fd: 'Forward Proposal Vote',
  0x000010fe: 'Vote Proposal',
  0x000010ff: 'Cleanup Proposal Votes',

  // Brotherhood Group 5: Economy, Allowances, & Credit
  0x00001141: 'Claim Weekly Grant',
  0x00001142: 'Trigger Balance Decay',
  0x00001143: 'Grant Allowance',
  0x00001144: 'Spend Allowance',
  0x00001145: 'Transfer Gold Coins',
  0x00001146: 'Internal Gold Transfer',
  0x00001147: 'Buy Credit (Personal Token)',
  0x00001148: 'Repay Credit (Payback)',
  0x00001149: 'Set Personal Jetton Pointers',
  0x0000114a: 'Set Credit Need',
  0x0000114b: 'Repay Debt',
  0x0000114c: 'Set Credit Multiplier',

  // Brotherhood Group 6: Mini-Apps, Lottery & Follow
  0x00001191: 'Join Lottery',
  0x00001192: 'Request State',
  0x00001193: 'Provide State',
  0x00001194: 'Custom Payload Message',
  0x00001198: 'Enter Lottery',
  0x00001199: 'Lottery Win Notification',
  0x0000119a: 'Draw Lottery Winner',
  0x0000119b: 'Upgrade Lottery Code',
  0x00001200: 'Unfollow Member',
  0x00001201: 'Init Follow',
  0x00001204: 'Settle Follower Death',
  0x00001205: 'Follow Member',
  0x00001206: 'Request Follow',
  0x00001207: 'Request Unfollow',
  0x00001208: 'Follow Reverted Notification',
  0x00001209: 'Unfollow Reverted Notification',
};

export interface DecodedPayload {
  isComment: boolean;
  comment?: string;
  opcode?: number;
  opcodeHex?: string;
  messageName: string;
}

export function decodeTextCommentPayload(payload: string): string | null {
  try {
    const slice = Cell.fromBase64(payload).beginParse();
    if (slice.remainingBits < 32) return null;
    const op = slice.loadUint(32);
    if (op !== 0) return null;
    const text = slice.loadStringTail();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Parses any payload BoC (Base64 or hex) into structured opcode / message name / text comment info.
 */
export function decodePayload(payload?: string): DecodedPayload | null {
  if (!payload || typeof payload !== 'string') return null;
  const trimmed = payload.trim();
  if (!trimmed) return null;

  try {
    let cell: Cell;
    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
      cell = Cell.fromBoc(Buffer.from(trimmed, 'hex'))[0];
    } else {
      cell = Cell.fromBase64(trimmed);
    }
    const slice = cell.beginParse();
    if (slice.remainingBits < 32) {
      return {
        isComment: false,
        messageName: 'Binary Message',
      };
    }
    const op = slice.loadUint(32);
    const opHex = `0x${op.toString(16).padStart(8, '0')}`;

    if (op === 0) {
      try {
        const text = slice.loadStringTail();
        return {
          isComment: true,
          comment: text,
          opcode: 0,
          opcodeHex: '0x00000000',
          messageName: 'Text Comment',
        };
      } catch {
        return {
          isComment: true,
          comment: '',
          opcode: 0,
          opcodeHex: '0x00000000',
          messageName: 'Text Comment',
        };
      }
    }

    const name = KNOWN_OPCODES[op] ?? `Contract Call (${opHex})`;
    return {
      isComment: false,
      opcode: op,
      opcodeHex: opHex,
      messageName: name,
    };
  } catch {
    return {
      isComment: false,
      messageName: 'Contract Message',
    };
  }
}

/**
 * Returns human-readable message name for any payload (e.g. 'Cast Vote', 'Invite Member', 'Comment "Hello"').
 */
export function getPayloadMessageName(payload?: string): string | null {
  const decoded = decodePayload(payload);
  if (!decoded) return null;
  if (decoded.isComment) {
    return decoded.comment ? `Comment: “${decoded.comment}”` : 'Text Comment';
  }
  return decoded.messageName;
}
