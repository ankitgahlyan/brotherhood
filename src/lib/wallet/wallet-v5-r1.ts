import {
  Address,
  beginCell,
  Cell,
  contractAddress,
  Dictionary,
  external,
  internal,
  loadStateInit,
  MessageRelaxed,
  SendMode,
  storeMessage,
  storeMessageRelaxed,
  type Contract,
} from '@ton/core';
import { sign } from '@ton/crypto';

/**
 * Default subwallet ID for Wallet V5R1 (0x7f000001 = 2147483409)
 */
export const DEFAULT_SUBWALLET_ID = 2147483409;

/**
 * Opcode definitions for Wallet V5R1 smart contract
 */
export const WalletV5R1Opcodes = {
  action_send_msg: 0x0ec3c86d,
  action_set_code: 0xad4de08e,
  action_extended_set_data: 0x1ff8ea0b,
  action_extended_add_extension: 0x02,
  action_extended_remove_extension: 0x03,
  action_extended_set_signature_auth_allowed: 0x04,
  auth_extension: 0x6578746e,
  auth_signed: 0x7369676e,
  auth_signed_internal: 0x73696e74,
} as const;

/**
 * Compiled BOC bytecode hex for Wallet V5R1
 */
export const WalletV5R1CodeBoc =
  'b5ee9c7201021401000281000114ff00f4a413f4bcf2c80b01020120020302014804050102f20e02dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120060702012008090019be5f0f6a2684080a0eb90fa02c02016e0a0b0201480c0d0019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00017b325fb51341c75c875c2c7e00011b262fb513435c28020011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0';

/**
 * Parsed Wallet V5R1 Code Cell
 */
export const WalletV5R1CodeCell = Cell.fromBoc(
  Buffer.from(WalletV5R1CodeBoc, 'hex'),
)[0];

export interface WalletV5Config {
  signatureAllowed?: boolean;
  seqno?: number;
  walletId?: number;
  publicKey: Buffer | bigint;
  extensions?: Dictionary<bigint, bigint>;
}

/**
 * Serializes Wallet V5R1 storage state config into initial data Cell
 */
export function walletV5ConfigToCell(config: WalletV5Config): Cell {
  const pubKeyBigInt =
    typeof config.publicKey === 'bigint'
      ? config.publicKey
      : BigInt('0x' + config.publicKey.toString('hex'));

  return beginCell()
    .storeBit(config.signatureAllowed ?? true)
    .storeUint(config.seqno ?? 0, 32)
    .storeUint(config.walletId ?? DEFAULT_SUBWALLET_ID, 32)
    .storeUint(pubKeyBigInt, 256)
    .storeDict(
      config.extensions ?? Dictionary.empty(),
      Dictionary.Keys.BigUint(256),
      Dictionary.Values.BigInt(1),
    )
    .endCell();
}

/**
 * Outbound message action for Wallet V5R1
 */
export class ActionSendMsg {
  public static readonly tag = WalletV5R1Opcodes.action_send_msg;
  public readonly tag = ActionSendMsg.tag;

  constructor(
    public readonly mode: SendMode | number,
    public readonly outMsg: MessageRelaxed,
  ) {}

  public serialize(): Cell {
    let msgToStore = this.outMsg;
    if (msgToStore.info && msgToStore.info.type === 'internal') {
      const info = msgToStore.info as Record<string, any>;
      const forwardFee = info.forwardFee ?? info.fwdFee ?? 0n;
      const ihrFee = info.ihrFee ?? 0n;
      const createdLt = info.createdLt ?? 0n;
      const createdAt = info.createdAt ?? 0;

      let value = info.value;
      if (typeof value === 'number' || typeof value === 'bigint') {
        value = { coins: BigInt(value) };
      } else if (value && typeof value === 'object' && 'coins' in value) {
        value = { coins: BigInt(value.coins), other: value.other };
      }

      msgToStore = {
        ...msgToStore,
        info: {
          ...info,
          forwardFee,
          ihrFee,
          createdLt,
          createdAt,
          value,
        } as any,
      };
    }

    return beginCell()
      .storeUint(this.tag, 32)
      .storeUint(this.mode | SendMode.IGNORE_ERRORS, 8)
      .storeRef(beginCell().store(storeMessageRelaxed(msgToStore)).endCell())
      .endCell();
  }
}

function packActionsListOut(actions: ActionSendMsg[]): Cell {
  if (actions.length === 0) {
    return beginCell().endCell();
  }
  const [action, ...rest] = actions;
  return beginCell()
    .storeRef(packActionsListOut(rest))
    .storeSlice(action.serialize().beginParse())
    .endCell();
}

/**
 * Packs an array of outbound actions into TVM action cell structure for V5R1
 */
export function packActionsList(actions: ActionSendMsg[]): Cell {
  let builder = beginCell();
  if (actions.length === 0) {
    builder = builder.storeUint(0, 1);
  } else {
    builder = builder.storeMaybeRef(
      packActionsListOut(actions.slice().reverse()),
    );
  }
  // No extended actions in standard transfer
  builder = builder.storeUint(0, 1);
  return builder.endCell();
}

/**
 * Wallet V5R1 Contract class
 */
export class WalletV5R1 implements Contract {
  readonly address: Address;
  readonly init?: { code: Cell; data: Cell };
  readonly subwalletId: number;
  readonly publicKey: Buffer;

  constructor(
    address: Address,
    init?: { code: Cell; data: Cell },
    subwalletId: number = DEFAULT_SUBWALLET_ID,
    publicKey: Buffer = Buffer.alloc(32),
  ) {
    this.address = address;
    this.init = init;
    this.subwalletId = subwalletId;
    this.publicKey = publicKey;
  }

  static createFromAddress(address: Address): WalletV5R1 {
    return new WalletV5R1(address);
  }

  static createFromConfig(config: WalletV5Config, workchain = 0): WalletV5R1 {
    const data = walletV5ConfigToCell(config);
    const init = { code: WalletV5R1CodeCell, data };
    const address = contractAddress(workchain, init);

    let pubBuf: Buffer;
    if (typeof config.publicKey === 'bigint') {
      const hex = config.publicKey.toString(16).padStart(64, '0');
      pubBuf = Buffer.from(hex, 'hex');
    } else {
      pubBuf = config.publicKey;
    }

    return new WalletV5R1(
      address,
      init,
      config.walletId ?? DEFAULT_SUBWALLET_ID,
      pubBuf,
    );
  }

  static createFromPublicKey(
    publicKey: Buffer,
    subwalletId: number = DEFAULT_SUBWALLET_ID,
    workchain = 0,
  ): WalletV5R1 {
    return WalletV5R1.createFromConfig(
      {
        publicKey,
        walletId: subwalletId,
        seqno: 0,
        signatureAllowed: true,
      },
      workchain,
    );
  }
}

export interface TransferMessageParams {
  to: Address | string;
  value: bigint;
  body?: Cell | string;
  bounce?: boolean;
  stateInit?: Cell | string;
}

export interface CreateTransferPayloadOptions {
  seqno: number;
  walletId?: number;
  secretKey: Buffer;
  messages: TransferMessageParams[];
  validUntil?: number;
  authType?: 'external' | 'internal';
  sendMode?: SendMode | number;
}

/**
 * Builds and signs a transfer cell payload for Wallet V5R1
 */
export async function createTransferPayload(
  options: CreateTransferPayloadOptions,
): Promise<Cell> {
  const subwalletId = options.walletId ?? DEFAULT_SUBWALLET_ID;
  const authType = options.authType ?? 'external';
  const opcode =
    authType === 'internal'
      ? WalletV5R1Opcodes.auth_signed_internal
      : WalletV5R1Opcodes.auth_signed;

  const validUntil = options.validUntil ?? Math.floor(Date.now() / 1000) + 300;

  const sendMode = options.sendMode ?? SendMode.PAY_GAS_SEPARATELY;

  const actions: ActionSendMsg[] = options.messages.map((msg) => {
    const toAddress =
      typeof msg.to === 'string' ? Address.parse(msg.to) : msg.to;

    let bodyCell = beginCell().endCell();
    if (msg.body) {
      if (typeof msg.body === 'string') {
        bodyCell = Cell.fromBase64(msg.body);
      } else {
        bodyCell = msg.body;
      }
    }

    let initData;
    if (msg.stateInit) {
      if (typeof msg.stateInit === 'string') {
        initData = loadStateInit(Cell.fromBase64(msg.stateInit).asSlice());
      } else {
        initData = loadStateInit(msg.stateInit.asSlice());
      }
    }

    const relaxed = internal({
      to: toAddress,
      value: msg.value,
      bounce: msg.bounce ?? true,
      body: bodyCell,
      init: initData,
    });

    return new ActionSendMsg(sendMode, relaxed);
  });

  const actionsCell = packActionsList(actions);

  const payload = beginCell()
    .storeUint(opcode, 32)
    .storeUint(subwalletId, 32)
    .storeUint(validUntil, 32)
    .storeUint(options.seqno, 32)
    .storeSlice(actionsCell.beginParse())
    .endCell();

  const signature = sign(payload.hash(), options.secretKey);

  return beginCell()
    .storeSlice(payload.beginParse())
    .storeBuffer(signature)
    .endCell();
}

export interface CreateExternalMessageOptions extends CreateTransferPayloadOptions {
  wallet: WalletV5R1;
}

/**
 * Creates an external message Cell wrapping a signed transfer payload for submission
 */
export async function createExternalMessage(
  options: CreateExternalMessageOptions,
): Promise<Cell> {
  const body = await createTransferPayload(options);

  const ext = external({
    to: options.wallet.address,
    init: options.seqno === 0 ? options.wallet.init : undefined,
    body,
  });

  return beginCell().store(storeMessage(ext)).endCell();
}
