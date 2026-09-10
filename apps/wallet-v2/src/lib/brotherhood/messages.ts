import { Address, toNano } from '@ton/core';
import {
  ActPayEmi,
  RepayDebt,
  ActClaimWeeklyGrant,
  SetAllowance,
  SpendAllowance,
  ActInvite,
} from '@wrappers/FossFiWallet.gen';
import type { FiMessage } from './transactions';

export function buildPayEmiMessage(
  fiWalletAddress: Address,
  ownerAddress: Address,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = ActPayEmi.toCell(
    ActPayEmi.create({ queryId: 0n, sendExcessesTo: ownerAddress }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildRepayDebtMessage(
  fiWalletAddress: Address,
  ownerAddress: Address,
  amountNano: bigint,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = RepayDebt.toCell(
    RepayDebt.create({ queryId: 0n, amount: amountNano, sendExcessesTo: ownerAddress }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildClaimWeeklyGrantMessage(
  fiWalletAddress: Address,
  ownerAddress: Address,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = ActClaimWeeklyGrant.toCell(
    ActClaimWeeklyGrant.create({ queryId: 0n, sendExcessesTo: ownerAddress }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildSetAllowanceMessage(
  fiWalletAddress: Address,
  ownerAddress: Address,
  granteeAddress: Address,
  amount: bigint,
  expireAt: number,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = SetAllowance.toCell(
    SetAllowance.create({
      queryId: 0n,
      grantee: granteeAddress,
      amount,
      expireAt,
      sendExcessesTo: ownerAddress,
    }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildSpendAllowanceMessage(
  fiWalletAddress: Address,
  ownerAddress: Address,
  grantorAddress: Address,
  amount: bigint,
  toAddress: Address,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = SpendAllowance.toCell(
    SpendAllowance.create({
      queryId: 0n,
      grantor: grantorAddress,
      amount,
      toAddress,
      sendExcessesTo: ownerAddress,
    }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildInviteMemberMessage(
  fiWalletAddress: Address,
  params: {
    transferRecipient: Address;
    username: string;
    h3Cell: string;
    country?: bigint;
    gasAmount?: bigint;
  },
): FiMessage {
  const { transferRecipient, username, h3Cell, country = 0n, gasAmount = toNano('0.05') } = params;
  const payload = ActInvite.toCell(
    ActInvite.create({
      queryId: 0n,
      transferRecipient,
      username,
      h3Cell,
      country,
    }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildChangeLocationMessage(
  fiWalletAddress: Address,
  params: {
    h3Cell: string;
    gasAmount?: bigint;
  },
): FiMessage {
  const { ChangeProfile } = require('@wrappers/FossFiWallet.gen');
  const { h3Cell, gasAmount = toNano('0.08') } = params;
  const payload = ChangeProfile.toCell(
    ChangeProfile.create({
      queryId: 0n,
      h3Cell,
    }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildDeployPersonalMinterMessage(params: {
  minterAddress: Address;
  stateInit: any;
  ownerAddress: Address;
  mintAmount: bigint;
  gasAmount?: bigint;
}): FiMessage {
  const {
    minterAddress,
    stateInit,
    ownerAddress,
    mintAmount,
    gasAmount = toNano('0.1'),
  } = params;

  const { buildMintBody } = require('./deploy');
  const { storeStateInit, beginCell } = require('@ton/core');

  const mintPayload = buildMintBody({
    toAddress: ownerAddress,
    jettonAmount: mintAmount,
    forwardTonAmount: toNano('0.02'),
    totalTonAmount: toNano('0.05'),
  });

  const stateInitCell = beginCell()
    .store(storeStateInit(stateInit))
    .endCell();

  return {
    toAddress: minterAddress.toString(),
    amount: gasAmount,
    payload: mintPayload,
    stateInit: stateInitCell,
  };
}

export function buildRegisterPersonalJettonMessage(params: {
  fiWalletAddress: Address;
  personalMinter: Address;
  personalWallet: Address;
  gasAmount?: bigint;
}): FiMessage {
  const {
    fiWalletAddress,
    personalMinter,
    personalWallet,
    gasAmount = toNano('0.05'),
  } = params;
  const { buildSetPersonalJettonBody } = require('./deploy');

  const setBody = buildSetPersonalJettonBody({
    personalMinter,
    personalWallet,
  });

  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload: setBody,
  };
}

export function buildMintPersonalMessage(params: {
  minterAddress: Address;
  recipientAddress: Address;
  jettonAmount: bigint;
  gasAmount?: bigint;
}): FiMessage {
  const {
    minterAddress,
    recipientAddress,
    jettonAmount,
    gasAmount = toNano('0.05'),
  } = params;
  const { buildMintBody } = require('./deploy');

  const payload = buildMintBody({
    toAddress: recipientAddress,
    jettonAmount,
    forwardTonAmount: toNano('0.02'),
    totalTonAmount: toNano('0.05'),
  });

  return {
    toAddress: minterAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildVoteProposalMessage(params: {
  pollAddress: Address;
  voterOwner: Address;
  proposalId: bigint;
  vote: boolean;
  oldVote?: boolean | null;
  gasAmount?: bigint;
}): FiMessage {
  const { VoteProposal } = require('@wrappers/Poll.gen');
  const {
    pollAddress,
    voterOwner,
    proposalId,
    vote,
    oldVote = null,
    gasAmount = toNano('0.05'),
  } = params;

  const payload = VoteProposal.toCell(
    VoteProposal.create({
      queryId: 0n,
      proposalId,
      voterOwner,
      oldVote,
      newVote: vote,
    }),
  );

  return {
    toAddress: pollAddress.toString(),
    amount: gasAmount,
    payload,
  };
}

export function buildEnterLotteryMessage(params: {
  lotteryAddress: Address;
  senderAddress: Address;
  ticketPriceTon?: string;
}): FiMessage {
  const { EnterLottery } = require('@wrappers/Lottery.gen');
  const { lotteryAddress, senderAddress, ticketPriceTon = '1.0' } = params;
  const totalAmount = toNano(ticketPriceTon) + toNano('0.05');

  const payload = EnterLottery.toCell(
    EnterLottery.create({
      sender: senderAddress,
      amount: toNano(ticketPriceTon),
    }),
  );

  return {
    toAddress: lotteryAddress.toString(),
    amount: totalAmount,
    payload,
  };
}

export function buildDrawLotteryWinnerMessage(params: {
  lotteryAddress: Address;
  gasAmount?: bigint;
}): FiMessage {
  const { DrawWinner } = require('@wrappers/Lottery.gen');
  const { lotteryAddress, gasAmount = toNano('0.05') } = params;

  const payload = DrawWinner.toCell(
    DrawWinner.create({
      queryId: 0n,
    }),
  );

  return {
    toAddress: lotteryAddress.toString(),
    amount: gasAmount,
    payload,
  };
}


