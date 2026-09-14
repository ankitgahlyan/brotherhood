/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Buffer } from 'buffer';
import { Cell } from '@ton/core';

export const KNOWN_OPCODES: Record<number, string> = {
  // Standard Jetton & NFT Opcodes (TEP-74, TEP-64, TEP-89)
  0x0f8a7ea5: 'AskToTransfer',
  0x7362d09c: 'TransferNotificationForRecipient',
  0x178d4519: 'InternalTransferStep',
  0xd53276db: 'ReturnExcessesBack',
  0x595f07bc: 'AskToBurn',
  0x7bdd97de: 'NotifyMinter',
  0x2c76b972: 'RequestWalletAddress',
  0xd1735466: 'ResponseWalletAddress',
  0x5fcc3d14: 'NftTransfer',
  0x05138d91: 'OwnershipAssigned',
  0x6f89f5e3: 'GetStaticData',
  0x8b771735: 'ReportStaticData',
  0x1f0453e0: 'NftDestroy',

  // Brotherhood Group 1: Governance & Admin
  0x00001001: 'MintNewJettons',
  0x00001002: 'ChangeMinterAdmin',
  0x00001003: 'ClaimMinterAdmin',
  0x00001004: 'DropMinterAdmin',
  0x00001005: 'ChangeMinterMetadata',
  0x00001006: 'Upgrade',
  0x00001007: 'TopUpTons',
  0x00001008: 'RequestUpgradeCode',
  0x00001009: 'ApproveUpgrade',
  0x0000100a: 'RejectUpgrade',
  0x0000100b: 'HotUpgrade',
  0x0000100c: 'ChangeDaoAddress',
  0x0000100d: 'ExecuteDaoProposal',
  0x0000100e: 'RequestTotalAccounts',
  0x0000100f: 'ResponseTotalAccounts',
  0x00001010: 'InitDaoProxy',
  0x00001011: 'PushUpgradeCode',

  // Brotherhood Group 2: Account Lifecycle & Onboarding
  0x00001051: 'ActInvite',
  0x00001052: 'InternalInvite',
  0x00001053: 'InternalInviteApproval',
  0x00001054: 'InformMinterInviteInternal',
  0x00001055: 'DeActivateCircleRing',
  0x00001056: 'DeActivateCircleRingInternal',
  0x00001057: 'RequestUpgrade',
  0x00001058: 'ActDestroyAccount',
  0x00001059: 'Destroy',
  0x0000105a: 'ActCloseAccount',
  0x0000105b: 'AuthorityCloseAccount',

  // Brotherhood Group 3: Profile & Location Indexing
  0x000010a1: 'ChangeProfile',
  0x000010a2: 'ChangeLocation',
  0x000010a3: 'InformMinterChangeLocation',
  0x000010a4: 'LocationAddMember',
  0x000010a5: 'LocationRemoveMember',
  0x000010a8: 'ChangeCountry',

  // Brotherhood Group 4: Social, Voting, & DAO
  0x000010f1: 'ActVote',
  0x000010f2: 'ActUnvote',
  0x000010f3: 'VotingAction',
  0x000010f4: 'ActDispatchAuthorityAction',
  0x000010f5: 'AuthorityAction',
  0x000010f6: 'SetStatus',
  0x000010f7: 'TransferByAuthority',
  0x000010fa: 'ActSubmitProposal',
  0x000010fb: 'InitPoll',
  0x000010fc: 'ActVoteProposal',
  0x000010fd: 'VoteProposalChild',
  0x000010fe: 'VoteProposal',
  0x000010ff: 'CleanupProposalVotes',

  // Brotherhood Group 5: Economy, Allowances, & Credit
  0x00001141: 'ActClaimWeeklyGrant',
  0x00001142: 'ActPayEmi',
  0x00001143: 'SetAllowance',
  0x00001144: 'SpendAllowance',
  0x00001145: 'AskGoldCoinsTransfer',
  0x00001146: 'InternalGoldCoinsTransfer',
  0x00001147: 'BuyCredit',
  0x00001148: 'Payback',
  0x00001149: 'ActSetPersonalJetton',
  0x0000114a: 'SetLoanRequirement',
  0x0000114b: 'RepayDebt',
  0x0000114c: 'SetCreditMultiplier',
  0x0000114d: 'TriggerDefaultEmi',
  0x0000114e: 'TriggerDecay',

  // Brotherhood Group 6: Mini-Apps, Lottery & Follow
  0x00001191: 'ActJoinLottery',
  0x00001192: 'RequestState',
  0x00001193: 'ProvideState',
  0x00001194: 'CustomPayloadMsg',
  0x00001198: 'EnterLottery',
  0x00001199: 'LotteryWin',
  0x0000119a: 'DrawWinner',
  0x0000119b: 'UpgradeLotteryCode',
  0x00001200: 'Unfollow',
  0x00001201: 'InitFollow',
  0x00001204: 'SettleDeath',
  0x00001205: 'Follow',
  0x00001206: 'RequestFollow',
  0x00001207: 'RequestUnfollow',
  0x00001208: 'FollowRevertedNotification',
  0x00001209: 'UnfollowRevertedNotification',
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
