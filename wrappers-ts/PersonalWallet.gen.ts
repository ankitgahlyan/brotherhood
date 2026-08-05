// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a PersonalWallet contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type RemainingBitsAndRefs = c.Slice

type StoreCallback<T> = (obj: T, b: c.Builder) => void
type LoadCallback<T> = (s: c.Slice) => T

export type CellRef<T> = {
    ref: T
}

function makeCellFrom<T>(self: T, storeFn_T: StoreCallback<T>): c.Cell {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}

function loadAndCheckPrefix32(s: c.Slice, expected: number, structName: string): void {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}

function formatPrefix(prefixNum: number, prefixLen: number): string {
    return prefixLen % 4 ? `0b${prefixNum.toString(2).padStart(prefixLen, '0')}` : `0x${prefixNum.toString(16).padStart(prefixLen / 4, '0')}`;
}

function loadAndCheckPrefix(s: c.Slice, expected: number, prefixLen: number, structName: string): void {
    let prefix = s.loadUint(prefixLen);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected ${formatPrefix(expected, prefixLen)}, got ${formatPrefix(prefix, prefixLen)}`);
    }
}

function lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}

function throwNonePrefixMatch(fieldPath: string): never {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}

function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}

function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}

function storeTolkRemaining(v: RemainingBitsAndRefs, b: c.Builder): void {
    b.storeSlice(v);
}

function loadTolkRemaining(s: c.Slice): RemainingBitsAndRefs {
    let rest = s.clone();
    s.loadBits(s.remainingBits);
    while (s.remainingRefs) {
        s.loadRef();
    }
    return rest;
}

function storeTolkNullable<T>(v: T | null, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    if (v === null) {
        b.storeUint(0, 1);
    } else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}

// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//

class StackReader {
    constructor(private tuple: c.TupleItem[]) {
    }

    static fromGetMethod(expectedN: number, getMethodResult: { stack: c.TupleReader }): StackReader {
        let tuple = [] as c.TupleItem[];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }

    private popExpecting<ItemT>(itemType: string): ItemT {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item as ItemT;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }

    private popCellLike(): c.Cell {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }

    readBigInt(): bigint {
        return this.popExpecting<c.TupleItemInt>('int').value;
    }

    readBoolean(): boolean {
        return this.popExpecting<c.TupleItemInt>('int').value !== 0n;
    }

    readCell(): c.Cell {
        return this.popCellLike();
    }

    readSlice(): c.Slice {
        return this.popCellLike().beginParse();
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint10 = bigint
type uint64 = bigint

/**
 > type ForwardPayloadRemainder = RemainingBitsAndRefs
 */
export type ForwardPayloadRemainder = RemainingBitsAndRefs

export const ForwardPayloadRemainder = {
    fromSlice(s: c.Slice): ForwardPayloadRemainder {
        return loadTolkRemaining(s);
    },
    store(self: ForwardPayloadRemainder, b: c.Builder): void {
        storeTolkRemaining(self, b);
    },
    toCell(self: ForwardPayloadRemainder): c.Cell {
        return makeCellFrom<ForwardPayloadRemainder>(self, ForwardPayloadRemainder.store);
    }
}

/**
 > struct JettonWalletDataReply {
 >     jettonBalance: coins
 >     ownerAddress: address
 >     minterAddress: address
 >     jettonWalletCode: cell
 > }
 */
export interface JettonWalletDataReply {
    readonly $: 'JettonWalletDataReply'
    jettonBalance: coins
    ownerAddress: c.Address
    minterAddress: c.Address
    jettonWalletCode: c.Cell
}

export const JettonWalletDataReply = {
    create(args: {
        jettonBalance: coins
        ownerAddress: c.Address
        minterAddress: c.Address
        jettonWalletCode: c.Cell
    }): JettonWalletDataReply {
        return {
            $: 'JettonWalletDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): JettonWalletDataReply {
        return {
            $: 'JettonWalletDataReply',
            jettonBalance: s.loadCoins(),
            ownerAddress: s.loadAddress(),
            minterAddress: s.loadAddress(),
            jettonWalletCode: s.loadRef(),
        }
    },
    store(self: JettonWalletDataReply, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeAddress(self.ownerAddress);
        b.storeAddress(self.minterAddress);
        b.storeRef(self.jettonWalletCode);
    },
    toCell(self: JettonWalletDataReply): c.Cell {
        return makeCellFrom<JettonWalletDataReply>(self, JettonWalletDataReply.store);
    }
}

/**
 > struct (0b0) PayloadInline {
 >     value: RemainingBitsAndRefs
 > }
 */
export interface PayloadInline {
    readonly $: 'PayloadInline'
    value: RemainingBitsAndRefs
}

export const PayloadInline = {
    PREFIX: 0b0,

    create(args: {
        value: RemainingBitsAndRefs
    }): PayloadInline {
        return {
            $: 'PayloadInline',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInline {
        loadAndCheckPrefix(s, 0b0, 1, 'PayloadInline');
        return {
            $: 'PayloadInline',
            value: loadTolkRemaining(s),
        }
    },
    store(self: PayloadInline, b: c.Builder): void {
        b.storeUint(0b0, 1);
        storeTolkRemaining(self.value, b);
    },
    toCell(self: PayloadInline): c.Cell {
        return makeCellFrom<PayloadInline>(self, PayloadInline.store);
    }
}

/**
 > struct (0b1) PayloadInRef {
 >     value: Cell<RemainingBitsAndRefs>
 > }
 */
export interface PayloadInRef {
    readonly $: 'PayloadInRef'
    value: CellRef<RemainingBitsAndRefs>
}

export const PayloadInRef = {
    PREFIX: 0b1,

    create(args: {
        value: CellRef<RemainingBitsAndRefs>
    }): PayloadInRef {
        return {
            $: 'PayloadInRef',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInRef {
        loadAndCheckPrefix(s, 0b1, 1, 'PayloadInRef');
        return {
            $: 'PayloadInRef',
            value: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
        }
    },
    store(self: PayloadInRef, b: c.Builder): void {
        b.storeUint(0b1, 1);
        storeCellRef<RemainingBitsAndRefs>(self.value, b, storeTolkRemaining);
    },
    toCell(self: PayloadInRef): c.Cell {
        return makeCellFrom<PayloadInRef>(self, PayloadInRef.store);
    }
}

/**
 > struct (0x7362d09c) TransferNotificationForRecipient {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferInitiator: address
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface TransferNotificationForRecipient {
    readonly $: 'TransferNotificationForRecipient'
    queryId: uint64
    jettonAmount: coins
    transferInitiator: c.Address
    forwardPayload: PayloadInline | PayloadInRef
}

export const TransferNotificationForRecipient = {
    PREFIX: 0x7362d09c,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        forwardPayload: PayloadInline | PayloadInRef
    }): TransferNotificationForRecipient {
        return {
            $: 'TransferNotificationForRecipient',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferNotificationForRecipient {
        loadAndCheckPrefix32(s, 0x7362d09c, 'TransferNotificationForRecipient');
        return {
            $: 'TransferNotificationForRecipient',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferInitiator: s.loadAddress(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('TransferNotificationForRecipient.forwardPayload'),
        }
    },
    store(self: TransferNotificationForRecipient, b: c.Builder): void {
        b.storeUint(0x7362d09c, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferInitiator);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: TransferNotificationForRecipient): c.Cell {
        return makeCellFrom<TransferNotificationForRecipient>(self, TransferNotificationForRecipient.store);
    }
}

/**
 > struct (0x178d4519) InternalTransferStep {
 >     queryId: uint64
 >     jettonAmount: coins
 >     version: uint10
 >     transferredAsCredit: bool
 >     transferInitiator: address
 >     sendExcessesTo: address?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface InternalTransferStep {
    readonly $: 'InternalTransferStep'
    queryId: uint64
    jettonAmount: coins
    version: uint10
    transferredAsCredit: boolean /* = false */
    transferInitiator: c.Address
    sendExcessesTo: c.Address | null
    forwardTonAmount: coins
    forwardPayload: PayloadInline | PayloadInRef
}

export const InternalTransferStep = {
    PREFIX: 0x178d4519,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }): InternalTransferStep {
        return {
            $: 'InternalTransferStep',
            transferredAsCredit: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalTransferStep {
        loadAndCheckPrefix32(s, 0x178d4519, 'InternalTransferStep');
        return {
            $: 'InternalTransferStep',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            version: s.loadUintBig(10),
            transferredAsCredit: s.loadBoolean(),
            transferInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('InternalTransferStep.forwardPayload'),
        }
    },
    store(self: InternalTransferStep, b: c.Builder): void {
        b.storeUint(0x178d4519, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeUint(self.version, 10);
        b.storeBit(self.transferredAsCredit);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: InternalTransferStep): c.Cell {
        return makeCellFrom<InternalTransferStep>(self, InternalTransferStep.store);
    }
}

/**
 > struct (0xd53276db) ReturnExcessesBack {
 >     queryId: uint64
 > }
 */
export interface ReturnExcessesBack {
    readonly $: 'ReturnExcessesBack'
    queryId: uint64
}

export const ReturnExcessesBack = {
    PREFIX: 0xd53276db,

    create(args: {
        queryId: uint64
    }): ReturnExcessesBack {
        return {
            $: 'ReturnExcessesBack',
            ...args
        }
    },
    fromSlice(s: c.Slice): ReturnExcessesBack {
        loadAndCheckPrefix32(s, 0xd53276db, 'ReturnExcessesBack');
        return {
            $: 'ReturnExcessesBack',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ReturnExcessesBack, b: c.Builder): void {
        b.storeUint(0xd53276db, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ReturnExcessesBack): c.Cell {
        return makeCellFrom<ReturnExcessesBack>(self, ReturnExcessesBack.store);
    }
}

/**
 > struct (0x7bdd97de) NotifyMinter {
 >     queryId: uint64
 >     jettonAmount: coins
 >     burnInitiator: address
 >     sendExcessesTo: address?
 > }
 */
export interface NotifyMinter {
    readonly $: 'NotifyMinter'
    queryId: uint64
    jettonAmount: coins
    burnInitiator: c.Address
    sendExcessesTo: c.Address | null
}

export const NotifyMinter = {
    PREFIX: 0x7bdd97de,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }): NotifyMinter {
        return {
            $: 'NotifyMinter',
            ...args
        }
    },
    fromSlice(s: c.Slice): NotifyMinter {
        loadAndCheckPrefix32(s, 0x7bdd97de, 'NotifyMinter');
        return {
            $: 'NotifyMinter',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            burnInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: NotifyMinter, b: c.Builder): void {
        b.storeUint(0x7bdd97de, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.burnInitiator);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: NotifyMinter): c.Cell {
        return makeCellFrom<NotifyMinter>(self, NotifyMinter.store);
    }
}

/**
 > struct PriWalletStore {
 >     jettonBalance: coins
 >     owner: address
 >     deployer: address
 >     minterAddress: address
 > }
 */
export interface PriWalletStore {
    readonly $: 'PriWalletStore'
    jettonBalance: coins /* = 0 */
    owner: c.Address
    deployer: c.Address
    minterAddress: c.Address
}

export const PriWalletStore = {
    create(args: {
        jettonBalance?: coins /* = 0 */
        owner: c.Address
        deployer: c.Address
        minterAddress: c.Address
    }): PriWalletStore {
        return {
            $: 'PriWalletStore',
            jettonBalance: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PriWalletStore {
        return {
            $: 'PriWalletStore',
            jettonBalance: s.loadCoins(),
            owner: s.loadAddress(),
            deployer: s.loadAddress(),
            minterAddress: s.loadAddress(),
        }
    },
    store(self: PriWalletStore, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeAddress(self.owner);
        b.storeAddress(self.deployer);
        b.storeAddress(self.minterAddress);
    },
    toCell(self: PriWalletStore): c.Cell {
        return makeCellFrom<PriWalletStore>(self, PriWalletStore.store);
    }
}

// ————————————————————————————————————————————
//    class PersonalWallet
//

interface ExtraSendOptions {
    bounce?: boolean                    // default: false
    sendMode?: SendMode                 // default: SendMode.PAY_GAS_SEPARATELY
    extraCurrencies?: c.ExtraCurrency   // default: empty dict
}

interface DeployedAddrOptions {
    workchain?: number                  // default: 0 (basechain)
    toShard?: { fixedPrefixLength: number; closeTo: c.Address }
    overrideContractCode?: c.Cell
}

function calculateDeployedAddress(code: c.Cell, data: c.Cell, options: DeployedAddrOptions): c.Address {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();

    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }

    return new c.Address(options.workchain ?? 0, addrHash);
}

export class PersonalWallet implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECDwEAA2IAART/APSkE/S88sgLAQIBYgIDAr7Q7aLt+/iRjjTTHzHXLCC8aijMltM/MfoAMI4R1ywj3uy+9JLyP+HTPzH6ADDi7UTQ+gACoMgB+gLOye1U4CDtRND6ACD6SPpIMfpIMATXLCC8aijM4w/IWPoCzsntVAQFAgEgDQ4C6jUE0z/6ANMKMfpI+lD6APiSUAnHBY5J+JLtRND6ADH6SDH6SPpIMPgqJsjPhCD6UhP6UvpSyXgmVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBfLgSt9RY6AmlhBIUHZfBeMNIm6SbCLjDgYHAl7XLCB8U/UsjqPXLCLK+D3kjhcxMwLXLCabkKxkMZEymIQPA8cAE/L04uMNAeMNAQgJAFbIz5HNi0JyJc8LP1AE+gIS+lIWzsnIz4UIF/pSUAT6AnHPC2oVzMmAEfsAAG74l/gnbxCi+C+ggHCCANrAghAJZgGAcPg3tgly+wLIz4UIE/pSghDVMnbbzwuOE8s/yYEAgvsAAMI1+Jf4OSBugTWFWOMEcYEConD4OAFw+DaggSqvcPg2oLzysPiSIccF8uBJBNM/+gD6UDBTQb7yr1FBocjPke92X3oTyz8B+gIV+lIS+lTJyM+FiBP6UnHPC24SzMmAUPsAAf41BNM/+gD6SPpQ9AH6ACD0BAFukTCR0eIj+kQw8tFN+Jf4k3D4OiNyceME+DkgboFNDiLjBCFugShkWAPjBFAjqCWggHCCANuIcPg8oAFw+DagAXD4NqCAcIIA2sCCEAlmAYBw+DegvPKw+JIqxwXy4ElTdL7yr1F0ocgh+gInCgH+zxbJ7VT4kiTHBVNJxwWxjjdbNDQ1+JL4klAExwVYbeMEyM+R73ZfehLLP1AE+gL6UhL6VMnIz4WIEvpScc8LbszJgFD7ANsx4DjtRND6ADH6SDH6SPpIMPgqJcjPhCD6UhP6UvpSyXgpbrOUOYsICd/Iz5BeNRRmGMs/UAb6AgsBhonPFhr6UhL6VAH6AhXOycjPiYgBVHJzyM+DywTPhaDMzPkWhPewBoALJdckNBPOFMv3gRUNzwt5FcwSzBPMyYBQ+wAMAAMAEAAjv9gXaiaH0AfSR9JBj9JBh8FUAB2+t2dqJofQB9JH0kfSRow=');

    static Errors = {
        'Errors.BalanceError': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new PersonalWallet(address);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async getPersonalWalletState(provider: ContractProvider): Promise<PriWalletStore> {
        const r = StackReader.fromGetMethod(4, await provider.get('get_personal_wallet_state', []));
        return ({
            $: 'PriWalletStore',
            jettonBalance: r.readBigInt(),
            owner: r.readSlice().loadAddress(),
            deployer: r.readSlice().loadAddress(),
            minterAddress: r.readSlice().loadAddress(),
        });
    }

    async getWalletData(provider: ContractProvider): Promise<JettonWalletDataReply> {
        const r = StackReader.fromGetMethod(4, await provider.get('get_wallet_data', []));
        return ({
            $: 'JettonWalletDataReply',
            jettonBalance: r.readBigInt(),
            ownerAddress: r.readSlice().loadAddress(),
            minterAddress: r.readSlice().loadAddress(),
            jettonWalletCode: r.readCell(),
        });
    }
}
