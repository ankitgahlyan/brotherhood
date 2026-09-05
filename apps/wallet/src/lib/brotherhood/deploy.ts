import { Address, beginCell, Cell, toNano } from '@ton/core';
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
} from '@wrappers/FossFi.gen';
import {
  AskToBurn,
  AskToTransfer,
  ActInvite,
  ActRequestUpgrade,
  ActSetPersonalJetton,
  ActUnvote,
  ActVote,
  BuyCredit,
  Destroy,
  SetAllowance,
  SpendAllowance,
} from '@wrappers/FossFiWallet.gen';
import { DaoProxy } from '@wrappers/DaoProxy.gen';
import { PersonalMinter } from '@wrappers/Personal.gen';
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
}): Cell {
  const {
    toAddress,
    jettonAmount,
    forwardTonAmount,
    totalTonAmount,
    queryId = 0n,
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
          version: 0n, // todo: need fix? for further/future mints
          transferInitiator: toAddress,
          sendExcessesTo: null,
          forwardTonAmount,
          forwardPayload: PayloadInline.create({
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
  const content = await buildOnchainMetadata(metadata);
  return ChangeMinterMetadata.toCell(
    ChangeMinterMetadata.create({ queryId, newMetadata: content }),
  );
}

// Deploy a Personal Token minter backed by the issuer's FI wallet.
// PersonalStore layout: totalSupply (coins), fiJettonAddress, adminAddress, metadataUri.
// The metadata cell uses the Tolk-exact OnchainMetadataReply layout so a
// frontend-deployed minter is byte-identical to one from the Tolk scripts.
export async function buildPersonalMinterDeploy(params: {
  issuerWallet: Address;
  adminAddress: Address;
  metadata: JettonMetadata;
}) {
  const content = await buildTolkOnchainMetadata(params.metadata);

  const minter = PersonalMinter.fromStorage({
    totalSupply: 0n,
    fiJettonAddress: params.issuerWallet,
    adminAddress: params.adminAddress,
    metadataUri: content,
  });

  return {
    contractAddress: minter.address,
    stateInit: minter.init!,
  };
}

// Compute the expected personal token wallet address for a user on a given minter.
export function getExpectedPersonalWalletAddress(params: {
  personalMinter: Address;
  owner: Address;
  adminAddress?: Address;
}): Address {
  return PersonalWallet.fromStorage(
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
): Cell {
  return AskToBurn.toCell(
    AskToBurn.create({
      queryId,
      jettonAmount: amount,
      sendExcessesTo: responseAddress ?? null,
      customPayload: null,
    }),
  );
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
}): Cell {
  const { transferRecipient, amount, responseAddress, queryId = 0n } = params;
  return BuyCredit.toCell(
    BuyCredit.create({
      queryId,
      jettonAmount: amount,
      transferRecipient,
      sendExcessesTo: responseAddress,
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

export function buildRequestUpgradeBody(): Cell {
  return ActRequestUpgrade.toCell(ActRequestUpgrade.create());
}

export function buildTopUpTonsBody(): Cell {
  return TopUpTons.toCell(TopUpTons.create());
}

export function buildApproveUpgradeBody(): Cell {
  return ApproveUpgrade.toCell(ApproveUpgrade.create());
}

export function buildRejectUpgradeBody(): Cell {
  return RejectUpgrade.toCell(RejectUpgrade.create());
}

export function buildSetAllowanceBody(params: {
  grantee: Address;
  amount: bigint;
  queryId?: bigint;
}): Cell {
  const { grantee, amount, queryId = 0n } = params;
  return SetAllowance.toCell(SetAllowance.create({ queryId, grantee, amount }));
}

export function buildSpendAllowanceBody(params: {
  amount: bigint;
  receiver: Address;
  sendExcessesTo: Address;
  queryId?: bigint;
}): Cell {
  const { amount, receiver, sendExcessesTo, queryId = 0n } = params;
  return SpendAllowance.toCell(
    SpendAllowance.create({ queryId, amount, receiver, sendExcessesTo }),
  );
}
