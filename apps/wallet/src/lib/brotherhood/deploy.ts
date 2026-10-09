import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LocationCredit } from '@wrappers/LocationCredit.gen';
import { CREDIT_PROXY_ADDRESS, DAO_PROXY_ADDRESS, FI_ADDRESS } from './config';
import {
  FossFi,
  MintNewJettons,
  InternalTransferStep,
  ChangeMinterAdmin,
  ChangeMinterMetadata,
  PayloadInline,
  PayloadInRef,
  FiCodes,
  TopUpTons,
  ApproveUpgrade,
  RejectUpgrade,
  RequestUpgradeCode,
} from '@wrappers/FossFi.gen';
import {
  AskToBurn,
  AskToTransfer,
  ActInvite,
  ActSetPersonalJetton,
  ActUnvote,
  ActVote,
  BuyCredit,
  Destroy,
  SetLoanRequirement,
  SetPocketMoney,
  SpendPocketMoney,
  OneTimePocketMoney,
  FixedRecurringPocketMoney,
  OpenRecurringPocketMoney,
  PocketMoney,
  FixedRecurringConfig,
  OpenRecurringConfig,
  RequestDeferredPayment,
  ActCancelDeferredPayment,
  ActClaimDeferredPayment,
  ToggleDeferredPayment,
} from '@wrappers/FossFiWallet.gen';

export {
  OneTimePocketMoney,
  FixedRecurringPocketMoney,
  OpenRecurringPocketMoney,
  PocketMoney,
  FixedRecurringConfig,
  OpenRecurringConfig,
};
import { Holding } from '@wrappers/Holding.gen';
import { DaoProxy } from '@wrappers/DaoProxy.gen';
import { BasePersonalMinter, BasePersonalWallet } from '@wrappers';
import { PersonalMinter, Upgrade } from '@wrappers/PersonalMinter.gen';
import { PersonalWallet } from '@wrappers/PersonalWallet.gen';
import {
  buildOnchainMetadata,
  buildTolkOnchainMetadata,
  type JettonMetadata,
} from './jettonContent';

export function parseUnits(amount: string, decimals: number): bigint {
  const [whole = '', fracRaw = ''] = amount.split('.');
  const frac = fracRaw.slice(0, decimals).padEnd(decimals, '0');
  return BigInt(whole + frac);
}

export async function buildDeployMessage(params: {
  metadata: JettonMetadata;
  ownerAddress: Address;
  mintAmount: bigint;
}) {
  const content = await buildOnchainMetadata(params.metadata);

  const daoProxy = DaoProxy.fromStorage({
    adminAddress: params.ownerAddress,
  });

  const minter = FossFi.fromStorage({
    adminAddress: params.ownerAddress,
    daoAddress: daoProxy.address,
    metadata: content,
    others: {
      ref: FiCodes.create({
        lotteryCode: Cell.EMPTY,
        latestFiWalletCode: Cell.EMPTY,
      }),
    },
  });

  const mintBody = buildMintBody({
    toAddress: params.ownerAddress,
    jettonAmount: params.mintAmount,
    forwardTonAmount: toNano('0.02'),
    totalTonAmount: toNano('0.05'),
  });

  return {
    contractAddress: minter.address,
    stateInit: minter.init!,
    mintBody,
  };
}

export function buildMintBody(params: {
  toAddress: Address;
  jettonAmount: bigint;
  forwardTonAmount: bigint;
  totalTonAmount: bigint;
  queryId?: bigint;
  latestWalletCode?: Cell | null;
  forwardPayload?: Cell | null;
}): Cell {
  const {
    toAddress,
    jettonAmount,
    forwardTonAmount,
    totalTonAmount,
    queryId = 0n,
    latestWalletCode = null,
    forwardPayload = null,
  } = params;

  return MintNewJettons.toCell(
    MintNewJettons.create({
      queryId,
      mintRecipient: toAddress,
      tonAmount: totalTonAmount,
      internalTransferMsg: {
        ref: InternalTransferStep.create({
          queryId,
          jettonAmount,
          version: 0n,
          transferInitiator: toAddress,
          sendExcessesTo: null,
          forwardTonAmount,
          latestWalletCode,
          forwardPayload: forwardPayload
            ? PayloadInRef.create({
                value: { ref: forwardPayload.beginParse() },
              })
            : PayloadInline.create({
                value: beginCell().asSlice(),
              }),
        }),
      },
    }),
  );
}

export function buildChangeAdminBody(newAdmin: Address, queryId = 0n): Cell {
  return ChangeMinterAdmin.toCell(
    ChangeMinterAdmin.create({ queryId, newAdminAddress: newAdmin }),
  );
}

export async function buildChangeContentBody(
  metadata: JettonMetadata,
  queryId = 0n,
): Promise<Cell> {
  const content = await buildTolkOnchainMetadata(metadata);
  return ChangeMinterMetadata.toCell(
    ChangeMinterMetadata.create({ queryId, newMetadata: content }),
  );
}

// Deploy a Personal Token minter backed by the issuer's FI wallet using the deterministic BasePersonalMinter proxy.
export function getPersonalMinter(params: {
  issuerWallet: Address;
  adminAddress: Address;
}) {
  const minter = BasePersonalMinter.fromStorage(
    {
      fiJettonAddress: params.issuerWallet,
      adminAddress: params.adminAddress,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: params.adminAddress },
    },
  );

  return {
    contractAddress: minter.address,
    stateInit: {
      ...minter.init!,
      splitDepth: 8,
    },
  };
}

export async function buildChangeMetadataBody(
  metadata: JettonMetadata,
): Promise<Cell> {
  const content = await buildTolkOnchainMetadata(metadata);
  return ChangeMinterMetadata.toCell(
    ChangeMinterMetadata.create({
      queryId: 0n,
      newMetadata: content,
    }),
  );
}

// Compute the expected personal token wallet address for a user on a given minter.
export function getExpectedPersonalWalletAddress(params: {
  personalMinter: Address;
  owner: Address;
  adminAddress?: Address;
}): Address {
  return BasePersonalWallet.fromStorage(
    {
      owner: params.owner,
      deployer: params.adminAddress ?? params.owner,
      minterAddress: params.personalMinter,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: params.owner },
    },
  ).address;
}

// The unified ActSetPersonalJetton signal that points the issuer's FI wallet
// at both its Personal Token minter and its Personal Token wallet in a single message.
export function buildSetPersonalJettonBody(params: {
  personalMinter: Address;
  personalWallet: Address;
}): Cell {
  const { personalMinter, personalWallet } = params;
  return ActSetPersonalJetton.toCell(
    ActSetPersonalJetton.create({
      personalJettonMinter: personalMinter,
      personalJettonWallet: personalWallet,
    }),
  );
}

// Backward compatibility alias for single-minter callers
export function buildPointPersonalMinterBody(params: {
  personalMinter: Address;
  personalWallet?: Address;
  ownerAddress?: Address;
}): Cell {
  const personalWallet =
    params.personalWallet ??
    (params.ownerAddress
      ? getExpectedPersonalWalletAddress({
          personalMinter: params.personalMinter,
          owner: params.ownerAddress,
        })
      : params.personalMinter);
  return buildSetPersonalJettonBody({
    personalMinter: params.personalMinter,
    personalWallet,
  });
}

export function buildBurnBody(
  amount: bigint,
  responseAddress?: Address | null,
  queryId = 0n,
  customPayload: Cell | null = null,
): Cell {
  return AskToBurn.toCell(
    AskToBurn.create({
      queryId,
      jettonAmount: amount,
      sendExcessesTo: responseAddress ?? null,
      customPayload,
    }),
  );
}

export function buildSwapTargetPayload(targetOwner: Address): Cell {
  return beginCell().storeAddress(targetOwner).endCell();
}

export function buildTransferBody(params: {
  toAddress: Address;
  amount: bigint;
  responseAddress: Address;
  forwardTonAmount?: bigint;
  forwardPayload?: Cell | null;
  queryId?: bigint;
}): Cell {
  const {
    toAddress,
    amount,
    responseAddress,
    forwardTonAmount = 0n,
    forwardPayload = null,
    queryId = 0n,
  } = params;

  const payload = forwardPayload
    ? PayloadInRef.create({ value: { ref: forwardPayload.beginParse() } })
    : PayloadInline.create({ value: beginCell().asSlice() });

  return AskToTransfer.toCell(
    AskToTransfer.create({
      queryId,
      jettonAmount: amount,
      transferRecipient: toAddress,
      sendExcessesTo: responseAddress,
      customPayload: null,
      forwardTonAmount,
      forwardPayload: payload,
    }),
  );
}

export function buildInviteBody(params: {
  transferRecipient: Address;
  username?: string;
  h3Cell?: string;
  country?: number | bigint;
  queryId?: bigint;
}): Cell {
  const {
    transferRecipient,
    username = '',
    h3Cell = '',
    country = 0,
    queryId = 0n,
  } = params;
  return ActInvite.toCell(
    ActInvite.create({
      queryId,
      transferRecipient,
      username,
      h3Cell,
      country: BigInt(country),
    }),
  );
}

export function buildBuyCreditBody(params: {
  transferRecipient: Address;
  amount: bigint;
  responseAddress: Address;
  queryId?: bigint;
  creditProxyAddress?: Address | null;
  h3Cell?: string | null;
}): Cell {
  const {
    transferRecipient,
    amount,
    responseAddress,
    queryId = 0n,
    creditProxyAddress = null,
    h3Cell = null,
  } = params;
  return BuyCredit.toCell(
    BuyCredit.create({
      queryId,
      jettonAmount: amount,
      transferRecipient,
      sendExcessesTo: responseAddress,
      creditProxyAddress,
      h3Cell,
    }),
  );
}

export function calculateLocationCreditAddress(params: {
  h3Cell: string;
  proxyAddress?: Address;
  adminAddress?: Address;
}): Address {
  const proxyAddr = params.proxyAddress ?? Address.parse(CREDIT_PROXY_ADDRESS);
  const adminAddr = params.adminAddress ?? Address.parse(DAO_PROXY_ADDRESS);
  const locCredit = LocationCredit.fromStorage(
    {
      h3Cell: params.h3Cell,
      proxyAddress: proxyAddr,
      adminAddress: adminAddr,
      entryCount: 0n,
      entries: Dictionary.empty(),
      version: 1n,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: proxyAddr },
    },
  );
  return locCredit.address;
}

export function buildSetLoanRequirementBody(params: {
  amount?: bigint | null;
  maturityDate?: bigint | null;
  cutoffDate?: bigint | null;
  multiplier?: bigint | null;
  queryId?: bigint;
  creditProxyAddress?: Address | null;
  h3Cell?: string | null;
}): Cell {
  return SetLoanRequirement.toCell(
    SetLoanRequirement.create({
      queryId: params.queryId ?? 0n,
      amount: params.amount ?? null,
      maturityDate: params.maturityDate ?? null,
      cutoffDate: params.cutoffDate ?? null,
      multiplier: params.multiplier ?? null,
      creditProxyAddress: params.creditProxyAddress ?? null,
      h3Cell: params.h3Cell ?? null,
    }),
  );
}

export function buildVoteBody(params: {
  transferRecipient: Address;
  count?: number | bigint;
}): Cell {
  const { transferRecipient, count = 1 } = params;
  return ActVote.toCell(
    ActVote.create({
      transferRecipient,
      count: BigInt(count),
    }),
  );
}

export function buildUnvoteBody(params: {
  transferRecipient: Address;
  count?: number | bigint;
}): Cell {
  const { transferRecipient, count = 1 } = params;
  return ActUnvote.toCell(
    ActUnvote.create({
      transferRecipient,
      count: BigInt(count),
    }),
  );
}

export function buildDestroyBody(): Cell {
  return Destroy.toCell(Destroy.create());
}

export function buildRequestUpgradeBody(targetAddress?: Address): Cell {
  return RequestUpgradeCode.toCell(
    RequestUpgradeCode.create({ targetAddress: targetAddress ?? null }),
  );
}

export function buildPersonalUpgradeBody(params: {
  walletUpgrade: boolean;
  walletVersion?: bigint;
  sender: Address;
}): Cell {
  return Upgrade.toCell(
    Upgrade.create({
      walletUpgrade: params.walletUpgrade,
      walletVersion: params.walletVersion ?? 1n,
      sender: params.sender,
      newCode: params.walletUpgrade
        ? PersonalWallet.CodeCell
        : PersonalMinter.CodeCell,
    }),
  );
}

export function buildTopUpTonsBody(
  latestFiWalletCode: Cell | null = null,
): Cell {
  return TopUpTons.toCell(TopUpTons.create({ latestFiWalletCode }));
}

export function buildApproveUpgradeBody(): Cell {
  return ApproveUpgrade.toCell(ApproveUpgrade.create());
}

export function buildRejectUpgradeBody(): Cell {
  return RejectUpgrade.toCell(RejectUpgrade.create());
}

export function buildSetPocketMoneyBody(params: {
  grantee: Address;
  unrestricted?: boolean | null;
  oneTime?: {
    remaining: bigint;
    startTime?: bigint;
    validUntil?: bigint;
  } | null;
  fixedRecurring?: {
    limit: bigint;
    period: bigint;
    startTime?: bigint;
    validUntil: bigint;
  } | null;
  openRecurring?: {
    limit: bigint;
    period?: bigint;
    startTime?: bigint;
  } | null;
  queryId?: bigint;
}): Cell {
  const {
    grantee,
    unrestricted = null,
    oneTime = null,
    fixedRecurring = null,
    openRecurring = null,
    queryId = 0n,
  } = params;
  return SetPocketMoney.toCell(
    SetPocketMoney.create({
      queryId,
      grantee,
      unrestricted,
      oneTime: oneTime
        ? OneTimePocketMoney.create({
            remaining: oneTime.remaining,
            startTime: oneTime.startTime ?? 0n,
            validUntil: oneTime.validUntil ?? 0n,
          })
        : null,
      fixedRecurring: fixedRecurring
        ? FixedRecurringConfig.create({
            limit: fixedRecurring.limit,
            period: fixedRecurring.period,
            startTime: fixedRecurring.startTime ?? 0n,
            validUntil: fixedRecurring.validUntil,
          })
        : null,
      openRecurring: openRecurring
        ? OpenRecurringConfig.create({
            limit: openRecurring.limit,
            period: openRecurring.period ?? 0n,
            startTime: openRecurring.startTime ?? 0n,
          })
        : null,
    }),
  );
}

export function buildSetAllowanceBody(params: {
  grantee: Address;
  amount: bigint;
  period?: bigint;
  startTime?: bigint;
  validUntil?: bigint;
  mode?: 'openRecurring' | 'fixedRecurring' | 'oneTime' | 'unrestricted';
  queryId?: bigint;
}): Cell {
  const {
    grantee,
    amount,
    period = 0n,
    startTime = 0n,
    validUntil = 0n,
    mode = 'openRecurring',
    queryId = 0n,
  } = params;

  if (mode === 'unrestricted') {
    return buildSetPocketMoneyBody({
      grantee,
      unrestricted: amount > 0n,
      queryId,
    });
  }
  if (mode === 'oneTime') {
    return buildSetPocketMoneyBody({
      grantee,
      oneTime: { remaining: amount, startTime, validUntil },
      queryId,
    });
  }
  if (mode === 'fixedRecurring') {
    return buildSetPocketMoneyBody({
      grantee,
      fixedRecurring: { limit: amount, period, startTime, validUntil },
      queryId,
    });
  }
  return buildSetPocketMoneyBody({
    grantee,
    unrestricted: amount === 0n ? false : null,
    openRecurring: { limit: amount, period, startTime },
    queryId,
  });
}

export function buildSpendPocketMoneyBody(params: {
  amount: bigint;
  receiver: Address;
  sendExcessesTo: Address;
  queryId?: bigint;
}): Cell {
  const { amount, receiver, sendExcessesTo, queryId = 0n } = params;
  return SpendPocketMoney.toCell(
    SpendPocketMoney.create({ queryId, amount, receiver, sendExcessesTo }),
  );
}

export const buildSpendAllowanceBody = buildSpendPocketMoneyBody;

export function buildRequestDeferredPaymentBody(params: {
  payer: Address;
  amount: bigint;
  queryId?: bigint;
}): Cell {
  const { payer, amount, queryId = 0n } = params;
  return RequestDeferredPayment.toCell(
    RequestDeferredPayment.create({ queryId, payer, amount }),
  );
}

export function buildCancelDeferredPaymentBody(params: {
  holdingAddress: Address;
  queryId?: bigint;
}): Cell {
  const { holdingAddress, queryId = 0n } = params;
  return ActCancelDeferredPayment.toCell(
    ActCancelDeferredPayment.create({ queryId, holdingAddress }),
  );
}

export function buildClaimDeferredPaymentBody(params: {
  holdingAddress: Address;
  queryId?: bigint;
}): Cell {
  const { holdingAddress, queryId = 0n } = params;
  return ActClaimDeferredPayment.toCell(
    ActClaimDeferredPayment.create({ queryId, holdingAddress }),
  );
}

export function calculateHoldingAddress(params: {
  payer: Address;
  payee: Address;
  amount: bigint;
  queryId: bigint;
}): Address {
  const holding = Holding.fromStorage(
    {
      payer: params.payer,
      payee: params.payee,
      amount: params.amount,
      queryId: params.queryId,
      createdAt: 0n,
    },
    {
      toShard: { fixedPrefixLength: 8, closeTo: params.payer },
    },
  );
  return holding.address;
}

export function buildToggleDeferredPaymentBody(params: {
  enabled: boolean;
  queryId?: bigint;
}): Cell {
  const { enabled, queryId = 0n } = params;
  return ToggleDeferredPayment.toCell(
    ToggleDeferredPayment.create({ queryId, enabled }),
  );
}
