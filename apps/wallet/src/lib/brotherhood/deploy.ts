import {
  Address,
  beginCell,
  Cell,
  Dictionary,
  storeStateInit,
  toNano,
} from '@ton/core';
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
} from '@/contracts/brotherhood/FossFi.gen';
import {
  AskToBurn,
  AskToTransfer,
  ActInvite,
  ActSetPersonalJettonMinter,
  ActUnvote,
  ActVote,
  BuyCredit,
  Destroy,
  SetAllowance,
  SpendAllowance,
} from '@/contracts/brotherhood/FossFiWallet.gen';
import { PersonalMinter } from '@/contracts/brotherhood/Personal.gen';
import { PersonalWallet } from '@/contracts/brotherhood/PersonalWallet.gen';
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

  const minter = FossFi.fromStorage({
    adminAddress: params.ownerAddress,
    metadata: content,
    others: {
      ref: FiCodes.create({
        locationAddrs: Dictionary.empty(),
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
// PriStore layout: totalSupply (coins), fiJettonAddress, adminAddress,
// jettonWalletCode (cell -> ref), metadataUri (cell? -> maybeRef).
// The metadata cell uses the Tolk-exact OnchainMetadataReply layout so a
// frontend-deployed minter is byte-identical to one from the Tolk scripts.
export async function buildPersonalMinterDeploy(params: {
  issuerWallet: Address;
  adminAddress: Address;
  metadata: JettonMetadata;
}) {
  const content = await buildTolkOnchainMetadata(params.metadata);

  const data = beginCell()
    .storeCoins(0n)
    .storeAddress(params.issuerWallet)
    .storeAddress(params.adminAddress)
    .storeRef(PersonalWallet.CodeCell)
    .storeMaybeRef(content)
    .endCell();

  const stateInit = {
    code: PersonalMinter.CodeCell,
    data,
  };
  const contractAddress = new Address(
    0,
    beginCell().store(storeStateInit(stateInit)).endCell().hash(),
  );

  return { contractAddress, stateInit };
}

// The ActSetPersonalJettonMinter signal that points the issuer's FI wallet
// at its Personal Token minter.
export function buildPointPersonalMinterBody(params: {
  personalMinter: Address;
}): Cell {
  const { personalMinter } = params;
  return ActSetPersonalJettonMinter.toCell(
    ActSetPersonalJettonMinter.create({
      transferRecipient: personalMinter,
    }),
  );
}

export function buildBurnBody(
  amount: bigint,
  responseAddress: Address,
  queryId = 0n,
): Cell {
  return AskToBurn.toCell(
    AskToBurn.create({
      queryId,
      jettonAmount: amount,
      sendExcessesTo: responseAddress,
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
  city?: string;
  cityLetter?: number | bigint;
  queryId?: bigint;
}): Cell {
  const {
    transferRecipient,
    username = '',
    city = '',
    cityLetter = 0,
    queryId = 0n,
  } = params;
  return ActInvite.toCell(
    ActInvite.create({
      queryId,
      transferRecipient,
      username,
      city,
      cityLetter: BigInt(cityLetter),
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

export function buildVoteBody(params: { transferRecipient: Address }): Cell {
  const { transferRecipient } = params;
  return ActVote.toCell(
    ActVote.create({
      transferRecipient,
    }),
  );
}

export function buildUnvoteBody(params: { transferRecipient: Address }): Cell {
  const { transferRecipient } = params;
  return ActUnvote.toCell(
    ActUnvote.create({
      transferRecipient,
    }),
  );
}

export function buildDestroyBody(): Cell {
  return Destroy.toCell(Destroy.create());
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
