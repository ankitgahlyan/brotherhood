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
  ownerAddress: Address,
  inviteeAddress: Address,
  gasAmount = toNano('0.05'),
): FiMessage {
  const payload = ActInvite.toCell(
    ActInvite.create({
      queryId: 0n,
      invitee: inviteeAddress,
      sendExcessesTo: ownerAddress,
    }),
  );
  return {
    toAddress: fiWalletAddress.toString(),
    amount: gasAmount,
    payload,
  };
}
