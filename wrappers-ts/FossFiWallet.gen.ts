// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a FossFiWallet contract in Tolk.
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

function createDictionaryValue<V>(loadFn_V: LoadCallback<V>, storeFn_V: StoreCallback<V>): c.DictionaryValue<V> {
    return {
        serialize(self: V, b: c.Builder) {
            storeFn_V(self, b);
        },
        parse(s: c.Slice): V {
            const value = loadFn_V(s);
            s.endParse();
            return value;
        }
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

    readSnakeString(): string {
        return this.readCell().beginParse().loadStringTail();
    }

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }

    readWideNullable<T>(stackW: number, readFn_T: (r: StackReader) => T): T | null {
        const slotTypeId = this.tuple[stackW - 1];
        if (slotTypeId?.type !== 'int') {
            throw new Error(`not 'int' on a stack`);
        }
        if (slotTypeId.value === 0n) {
            this.tuple = this.tuple.slice(stackW);
            return null;
        }
        const valueT = readFn_T(this);
        this.tuple.shift();
        return valueT;
    }

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint2 = bigint
type uint4 = bigint
type uint8 = bigint
type uint10 = bigint
type uint16 = bigint
type uint20 = bigint
type uint32 = bigint
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
 > struct (0x0f8a7ea5) AskToTransfer {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferRecipient: address
 >     sendExcessesTo: address?
 >     customPayload: cell?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface AskToTransfer {
    readonly $: 'AskToTransfer'
    queryId: uint64
    jettonAmount: coins
    transferRecipient: c.Address
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null
    forwardTonAmount: coins
    forwardPayload: PayloadInline | PayloadInRef
}

export const AskToTransfer = {
    PREFIX: 0x0f8a7ea5,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }): AskToTransfer {
        return {
            $: 'AskToTransfer',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToTransfer {
        loadAndCheckPrefix32(s, 0x0f8a7ea5, 'AskToTransfer');
        return {
            $: 'AskToTransfer',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferRecipient: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
            forwardTonAmount: s.loadCoins(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('AskToTransfer.forwardPayload'),
        }
    },
    store(self: AskToTransfer, b: c.Builder): void {
        b.storeUint(0x0f8a7ea5, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
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
    toCell(self: AskToTransfer): c.Cell {
        return makeCellFrom<AskToTransfer>(self, AskToTransfer.store);
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
 >     transferInitiator: address
 >     sendExcessesTo: address?
 >     forwardTonAmount: coins
 >     version: uint10
 >     transferredAsCredit: bool
 >     latestWalletCode: cell?
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface InternalTransferStep {
    readonly $: 'InternalTransferStep'
    queryId: uint64
    jettonAmount: coins
    transferInitiator: c.Address
    sendExcessesTo: c.Address | null
    forwardTonAmount: coins
    version: uint10 /* = 0 */
    transferredAsCredit: boolean /* = false */
    latestWalletCode: c.Cell | null /* = null */
    forwardPayload: PayloadInline | PayloadInRef
}

export const InternalTransferStep = {
    PREFIX: 0x178d4519,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        version?: uint10 /* = 0 */
        transferredAsCredit?: boolean /* = false */
        latestWalletCode?: c.Cell | null /* = null */
        forwardPayload: PayloadInline | PayloadInRef
    }): InternalTransferStep {
        return {
            $: 'InternalTransferStep',
            version: 0n,
            transferredAsCredit: false,
            latestWalletCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalTransferStep {
        loadAndCheckPrefix32(s, 0x178d4519, 'InternalTransferStep');
        return {
            $: 'InternalTransferStep',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
            version: s.loadUintBig(10),
            transferredAsCredit: s.loadBoolean(),
            latestWalletCode: s.loadBoolean() ? s.loadRef() : null,
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('InternalTransferStep.forwardPayload'),
        }
    },
    store(self: InternalTransferStep, b: c.Builder): void {
        b.storeUint(0x178d4519, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
        b.storeUint(self.version, 10);
        b.storeBit(self.transferredAsCredit);
        storeTolkNullable<c.Cell>(self.latestWalletCode, b,
            (v,b) => b.storeRef(v)
        );
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
 > struct (0x595f07bc) AskToBurn {
 >     queryId: uint64
 >     jettonAmount: coins
 >     sendExcessesTo: address?
 >     customPayload: cell?
 > }
 */
export interface AskToBurn {
    readonly $: 'AskToBurn'
    queryId: uint64
    jettonAmount: coins
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null
}

export const AskToBurn = {
    PREFIX: 0x595f07bc,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }): AskToBurn {
        return {
            $: 'AskToBurn',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToBurn {
        loadAndCheckPrefix32(s, 0x595f07bc, 'AskToBurn');
        return {
            $: 'AskToBurn',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            sendExcessesTo: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: AskToBurn, b: c.Builder): void {
        b.storeUint(0x595f07bc, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: AskToBurn): c.Cell {
        return makeCellFrom<AskToBurn>(self, AskToBurn.store);
    }
}

/**
 > struct (0x7bdd97de) NotifyMinter {
 >     queryId: uint64
 >     jettonAmount: coins
 >     burnInitiator: address
 >     sendExcessesTo: address?
 >     customPayload: cell?
 > }
 */
export interface NotifyMinter {
    readonly $: 'NotifyMinter'
    queryId: uint64
    jettonAmount: coins
    burnInitiator: c.Address
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null /* = null */
}

export const NotifyMinter = {
    PREFIX: 0x7bdd97de,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
        customPayload?: c.Cell | null /* = null */
    }): NotifyMinter {
        return {
            $: 'NotifyMinter',
            customPayload: null,
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
            customPayload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: NotifyMinter, b: c.Builder): void {
        b.storeUint(0x7bdd97de, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.burnInitiator);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: NotifyMinter): c.Cell {
        return makeCellFrom<NotifyMinter>(self, NotifyMinter.store);
    }
}

/**
 > struct (0x00001001) MintNewJettons {
 >     queryId: uint64
 >     mintRecipient: address
 >     tonAmount: coins
 >     internalTransferMsg: Cell<InternalTransferStep>
 >     tokenMinter: address?
 >     deployer: address?
 > }
 */
export interface MintNewJettons {
    readonly $: 'MintNewJettons'
    queryId: uint64
    mintRecipient: c.Address
    tonAmount: coins
    internalTransferMsg: CellRef<InternalTransferStep>
    tokenMinter: c.Address | null /* = null */
    deployer: c.Address | null /* = null */
}

export const MintNewJettons = {
    PREFIX: 0x00001001,

    create(args: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }): MintNewJettons {
        return {
            $: 'MintNewJettons',
            tokenMinter: null,
            deployer: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): MintNewJettons {
        loadAndCheckPrefix32(s, 0x00001001, 'MintNewJettons');
        return {
            $: 'MintNewJettons',
            queryId: s.loadUintBig(64),
            mintRecipient: s.loadAddress(),
            tonAmount: s.loadCoins(),
            internalTransferMsg: loadCellRef<InternalTransferStep>(s, InternalTransferStep.fromSlice),
            tokenMinter: s.loadMaybeAddress(),
            deployer: s.loadMaybeAddress(),
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x00001001, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.mintRecipient);
        b.storeCoins(self.tonAmount);
        storeCellRef<InternalTransferStep>(self.internalTransferMsg, b, InternalTransferStep.store);
        b.storeAddress(self.tokenMinter);
        b.storeAddress(self.deployer);
    },
    toCell(self: MintNewJettons): c.Cell {
        return makeCellFrom<MintNewJettons>(self, MintNewJettons.store);
    }
}

/**
 > struct (0x00001006) Upgrade {
 >     walletUpgrade: bool
 >     walletVersion: uint10
 >     sender: address
 >     newData: cell?
 >     newCode: cell?
 > }
 */
export interface Upgrade {
    readonly $: 'Upgrade'
    walletUpgrade: boolean /* = true */
    walletVersion: uint10
    sender: c.Address
    newData: c.Cell | null /* = null */
    newCode: c.Cell | null /* = null */
}

export const Upgrade = {
    PREFIX: 0x00001006,

    create(args: {
        walletUpgrade?: boolean /* = true */
        walletVersion: uint10
        sender: c.Address
        newData?: c.Cell | null /* = null */
        newCode?: c.Cell | null /* = null */
    }): Upgrade {
        return {
            $: 'Upgrade',
            walletUpgrade: true,
            newData: null,
            newCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): Upgrade {
        loadAndCheckPrefix32(s, 0x00001006, 'Upgrade');
        return {
            $: 'Upgrade',
            walletUpgrade: s.loadBoolean(),
            walletVersion: s.loadUintBig(10),
            sender: s.loadAddress(),
            newData: s.loadBoolean() ? s.loadRef() : null,
            newCode: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: Upgrade, b: c.Builder): void {
        b.storeUint(0x00001006, 32);
        b.storeBit(self.walletUpgrade);
        b.storeUint(self.walletVersion, 10);
        b.storeAddress(self.sender);
        storeTolkNullable<c.Cell>(self.newData, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<c.Cell>(self.newCode, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: Upgrade): c.Cell {
        return makeCellFrom<Upgrade>(self, Upgrade.store);
    }
}

/**
 > struct (0x00001007) TopUpTons {
 >     latestFiWalletCode: cell?
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
    latestFiWalletCode: c.Cell | null /* = null */
}

export const TopUpTons = {
    PREFIX: 0x00001007,

    create(args: {
        latestFiWalletCode?: c.Cell | null /* = null */
    }): TopUpTons {
        return {
            $: 'TopUpTons',
            latestFiWalletCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0x00001007, 'TopUpTons');
        return {
            $: 'TopUpTons',
            latestFiWalletCode: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0x00001007, 32);
        storeTolkNullable<c.Cell>(self.latestFiWalletCode, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

/**
 > struct (0x00001008) RequestUpgradeCode {
 >     targetAddress: address?
 > }
 */
export interface RequestUpgradeCode {
    readonly $: 'RequestUpgradeCode'
    targetAddress: c.Address | null /* = null */
}

export const RequestUpgradeCode = {
    PREFIX: 0x00001008,

    create(args: {
        targetAddress?: c.Address | null /* = null */
    }): RequestUpgradeCode {
        return {
            $: 'RequestUpgradeCode',
            targetAddress: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestUpgradeCode {
        loadAndCheckPrefix32(s, 0x00001008, 'RequestUpgradeCode');
        return {
            $: 'RequestUpgradeCode',
            targetAddress: s.loadMaybeAddress(),
        }
    },
    store(self: RequestUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00001008, 32);
        b.storeAddress(self.targetAddress);
    },
    toCell(self: RequestUpgradeCode): c.Cell {
        return makeCellFrom<RequestUpgradeCode>(self, RequestUpgradeCode.store);
    }
}

/**
 > struct (0x00001051) ActInvite {
 >     queryId: uint64
 >     transferRecipient: address
 >     username: string
 >     h3Cell: string
 >     country: uint16
 > }
 */
export interface ActInvite {
    readonly $: 'ActInvite'
    queryId: uint64
    transferRecipient: c.Address
    username: string
    h3Cell: string
    country: uint16 /* = 0 */
}

export const ActInvite = {
    PREFIX: 0x00001051,

    create(args: {
        queryId: uint64
        transferRecipient: c.Address
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }): ActInvite {
        return {
            $: 'ActInvite',
            country: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActInvite {
        loadAndCheckPrefix32(s, 0x00001051, 'ActInvite');
        return {
            $: 'ActInvite',
            queryId: s.loadUintBig(64),
            transferRecipient: s.loadAddress(),
            username: s.loadStringRefTail(),
            h3Cell: s.loadStringRefTail(),
            country: s.loadUintBig(16),
        }
    },
    store(self: ActInvite, b: c.Builder): void {
        b.storeUint(0x00001051, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.transferRecipient);
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.h3Cell);
        b.storeUint(self.country, 16);
    },
    toCell(self: ActInvite): c.Cell {
        return makeCellFrom<ActInvite>(self, ActInvite.store);
    }
}

/**
 > struct (0x00001052) InternalInvite {
 >     queryId: uint64
 >     version: uint10
 >     sender: address
 >     invitor: address
 >     latestFiWalletCode: cell
 >     currentStorage: cell?
 >     username: string
 >     h3Cell: string
 >     country: uint16
 > }
 */
export interface InternalInvite {
    readonly $: 'InternalInvite'
    queryId: uint64 /* = 0 */
    version: uint10
    sender: c.Address
    invitor: c.Address
    latestFiWalletCode: c.Cell
    currentStorage: c.Cell | null
    username: string
    h3Cell: string
    country: uint16 /* = 0 */
}

export const InternalInvite = {
    PREFIX: 0x00001052,

    create(args: {
        queryId?: uint64 /* = 0 */
        version: uint10
        sender: c.Address
        invitor: c.Address
        latestFiWalletCode: c.Cell
        currentStorage: c.Cell | null
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }): InternalInvite {
        return {
            $: 'InternalInvite',
            queryId: 0n,
            country: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalInvite {
        loadAndCheckPrefix32(s, 0x00001052, 'InternalInvite');
        return {
            $: 'InternalInvite',
            queryId: s.loadUintBig(64),
            version: s.loadUintBig(10),
            sender: s.loadAddress(),
            invitor: s.loadAddress(),
            latestFiWalletCode: s.loadRef(),
            currentStorage: s.loadBoolean() ? s.loadRef() : null,
            username: s.loadStringRefTail(),
            h3Cell: s.loadStringRefTail(),
            country: s.loadUintBig(16),
        }
    },
    store(self: InternalInvite, b: c.Builder): void {
        b.storeUint(0x00001052, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.version, 10);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeRef(self.latestFiWalletCode);
        storeTolkNullable<c.Cell>(self.currentStorage, b,
            (v,b) => b.storeRef(v)
        );
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.h3Cell);
        b.storeUint(self.country, 16);
    },
    toCell(self: InternalInvite): c.Cell {
        return makeCellFrom<InternalInvite>(self, InternalInvite.store);
    }
}

/**
 > struct (0x00001054) InformMinterInviteInternal {
 >     queryId: uint64
 >     sender: address
 >     invitor: address
 >     username: string
 >     h3Cell: string
 >     country: uint16
 > }
 */
export interface InformMinterInviteInternal {
    readonly $: 'InformMinterInviteInternal'
    queryId: uint64
    sender: c.Address
    invitor: c.Address
    username: string
    h3Cell: string
    country: uint16 /* = 0 */
}

export const InformMinterInviteInternal = {
    PREFIX: 0x00001054,

    create(args: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }): InformMinterInviteInternal {
        return {
            $: 'InformMinterInviteInternal',
            country: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InformMinterInviteInternal {
        loadAndCheckPrefix32(s, 0x00001054, 'InformMinterInviteInternal');
        return {
            $: 'InformMinterInviteInternal',
            queryId: s.loadUintBig(64),
            sender: s.loadAddress(),
            invitor: s.loadAddress(),
            username: s.loadStringRefTail(),
            h3Cell: s.loadStringRefTail(),
            country: s.loadUintBig(16),
        }
    },
    store(self: InformMinterInviteInternal, b: c.Builder): void {
        b.storeUint(0x00001054, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.h3Cell);
        b.storeUint(self.country, 16);
    },
    toCell(self: InformMinterInviteInternal): c.Cell {
        return makeCellFrom<InformMinterInviteInternal>(self, InformMinterInviteInternal.store);
    }
}

/**
 > struct (0x00001055) DeActivateCircleRing {
 >     transferRecipient: address
 >     fundsReceiver: address?
 >     amount: coins
 >     toggleActive: bool
 > }
 */
export interface DeActivateCircleRing {
    readonly $: 'DeActivateCircleRing'
    transferRecipient: c.Address
    fundsReceiver: c.Address | null /* = null */
    amount: coins /* = 0 */
    toggleActive: boolean /* = true */
}

export const DeActivateCircleRing = {
    PREFIX: 0x00001055,

    create(args: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }): DeActivateCircleRing {
        return {
            $: 'DeActivateCircleRing',
            fundsReceiver: null,
            amount: 0n,
            toggleActive: true,
            ...args
        }
    },
    fromSlice(s: c.Slice): DeActivateCircleRing {
        loadAndCheckPrefix32(s, 0x00001055, 'DeActivateCircleRing');
        return {
            $: 'DeActivateCircleRing',
            transferRecipient: s.loadAddress(),
            fundsReceiver: s.loadMaybeAddress(),
            amount: s.loadCoins(),
            toggleActive: s.loadBoolean(),
        }
    },
    store(self: DeActivateCircleRing, b: c.Builder): void {
        b.storeUint(0x00001055, 32);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.fundsReceiver);
        b.storeCoins(self.amount);
        b.storeBit(self.toggleActive);
    },
    toCell(self: DeActivateCircleRing): c.Cell {
        return makeCellFrom<DeActivateCircleRing>(self, DeActivateCircleRing.store);
    }
}

/**
 > struct (0x00001056) DeActivateCircleRingInternal {
 >     version: uint10
 >     fundsReceiver: address?
 >     amount: coins
 >     toggleActive: bool
 > }
 */
export interface DeActivateCircleRingInternal {
    readonly $: 'DeActivateCircleRingInternal'
    version: uint10 /* = 0 */
    fundsReceiver: c.Address | null /* = null */
    amount: coins /* = 0 */
    toggleActive: boolean /* = true */
}

export const DeActivateCircleRingInternal = {
    PREFIX: 0x00001056,

    create(args: {
        version?: uint10 /* = 0 */
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }): DeActivateCircleRingInternal {
        return {
            $: 'DeActivateCircleRingInternal',
            version: 0n,
            fundsReceiver: null,
            amount: 0n,
            toggleActive: true,
            ...args
        }
    },
    fromSlice(s: c.Slice): DeActivateCircleRingInternal {
        loadAndCheckPrefix32(s, 0x00001056, 'DeActivateCircleRingInternal');
        return {
            $: 'DeActivateCircleRingInternal',
            version: s.loadUintBig(10),
            fundsReceiver: s.loadMaybeAddress(),
            amount: s.loadCoins(),
            toggleActive: s.loadBoolean(),
        }
    },
    store(self: DeActivateCircleRingInternal, b: c.Builder): void {
        b.storeUint(0x00001056, 32);
        b.storeUint(self.version, 10);
        b.storeAddress(self.fundsReceiver);
        b.storeCoins(self.amount);
        b.storeBit(self.toggleActive);
    },
    toCell(self: DeActivateCircleRingInternal): c.Cell {
        return makeCellFrom<DeActivateCircleRingInternal>(self, DeActivateCircleRingInternal.store);
    }
}

/**
 > struct (0x00001058) ActDestroyAccount {
 > }
 */
export interface ActDestroyAccount {
    readonly $: 'ActDestroyAccount'
}

export const ActDestroyAccount = {
    PREFIX: 0x00001058,

    create(): ActDestroyAccount {
        return {
            $: 'ActDestroyAccount',
        }
    },
    fromSlice(s: c.Slice): ActDestroyAccount {
        loadAndCheckPrefix32(s, 0x00001058, 'ActDestroyAccount');
        return {
            $: 'ActDestroyAccount',
        }
    },
    store(self: ActDestroyAccount, b: c.Builder): void {
        b.storeUint(0x00001058, 32);
    },
    toCell(self: ActDestroyAccount): c.Cell {
        return makeCellFrom<ActDestroyAccount>(self, ActDestroyAccount.store);
    }
}

/**
 > struct (0x00001059) Destroy {
 > }
 */
export interface Destroy {
    readonly $: 'Destroy'
}

export const Destroy = {
    PREFIX: 0x00001059,

    create(): Destroy {
        return {
            $: 'Destroy',
        }
    },
    fromSlice(s: c.Slice): Destroy {
        loadAndCheckPrefix32(s, 0x00001059, 'Destroy');
        return {
            $: 'Destroy',
        }
    },
    store(self: Destroy, b: c.Builder): void {
        b.storeUint(0x00001059, 32);
    },
    toCell(self: Destroy): c.Cell {
        return makeCellFrom<Destroy>(self, Destroy.store);
    }
}

/**
 > struct (0x000010a1) ChangeProfile {
 >     queryId: uint64
 >     username: string?
 >     h3Cell: string?
 >     country: uint16?
 >     nominee: address?
 > }
 */
export interface ChangeProfile {
    readonly $: 'ChangeProfile'
    queryId: uint64 /* = 0 */
    username: string | null /* = null */
    h3Cell: string | null /* = null */
    country: uint16 | null /* = null */
    nominee: c.Address | null /* = null */
}

export const ChangeProfile = {
    PREFIX: 0x000010a1,

    create(args: {
        queryId?: uint64 /* = 0 */
        username?: string | null /* = null */
        h3Cell?: string | null /* = null */
        country?: uint16 | null /* = null */
        nominee?: c.Address | null /* = null */
    }): ChangeProfile {
        return {
            $: 'ChangeProfile',
            queryId: 0n,
            username: null,
            h3Cell: null,
            country: null,
            nominee: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeProfile {
        loadAndCheckPrefix32(s, 0x000010a1, 'ChangeProfile');
        return {
            $: 'ChangeProfile',
            queryId: s.loadUintBig(64),
            username: s.loadBoolean() ? s.loadStringRefTail() : null,
            h3Cell: s.loadBoolean() ? s.loadStringRefTail() : null,
            country: s.loadBoolean() ? s.loadUintBig(16) : null,
            nominee: s.loadMaybeAddress(),
        }
    },
    store(self: ChangeProfile, b: c.Builder): void {
        b.storeUint(0x000010a1, 32);
        b.storeUint(self.queryId, 64);
        storeTolkNullable<string>(self.username, b,
            (v,b) => b.storeStringRefTail(v)
        );
        storeTolkNullable<string>(self.h3Cell, b,
            (v,b) => b.storeStringRefTail(v)
        );
        storeTolkNullable<uint16>(self.country, b,
            (v,b) => b.storeUint(v, 16)
        );
        b.storeAddress(self.nominee);
    },
    toCell(self: ChangeProfile): c.Cell {
        return makeCellFrom<ChangeProfile>(self, ChangeProfile.store);
    }
}

/**
 > struct (0x000010a3) InformMinterChangeLocation {
 >     queryId: uint64
 >     owner: address
 >     oldH3Cell: string
 >     newH3Cell: string
 > }
 */
export interface InformMinterChangeLocation {
    readonly $: 'InformMinterChangeLocation'
    queryId: uint64
    owner: c.Address
    oldH3Cell: string
    newH3Cell: string
}

export const InformMinterChangeLocation = {
    PREFIX: 0x000010a3,

    create(args: {
        queryId: uint64
        owner: c.Address
        oldH3Cell: string
        newH3Cell: string
    }): InformMinterChangeLocation {
        return {
            $: 'InformMinterChangeLocation',
            ...args
        }
    },
    fromSlice(s: c.Slice): InformMinterChangeLocation {
        loadAndCheckPrefix32(s, 0x000010a3, 'InformMinterChangeLocation');
        return {
            $: 'InformMinterChangeLocation',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            oldH3Cell: s.loadStringRefTail(),
            newH3Cell: s.loadStringRefTail(),
        }
    },
    store(self: InformMinterChangeLocation, b: c.Builder): void {
        b.storeUint(0x000010a3, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeStringRefTail(self.oldH3Cell);
        b.storeStringRefTail(self.newH3Cell);
    },
    toCell(self: InformMinterChangeLocation): c.Cell {
        return makeCellFrom<InformMinterChangeLocation>(self, InformMinterChangeLocation.store);
    }
}

/**
 > struct (0x000010f1) ActVote {
 >     transferRecipient: address
 >     count: uint4
 > }
 */
export interface ActVote {
    readonly $: 'ActVote'
    transferRecipient: c.Address
    count: uint4 /* = 1 */
}

export const ActVote = {
    PREFIX: 0x000010f1,

    create(args: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }): ActVote {
        return {
            $: 'ActVote',
            count: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActVote {
        loadAndCheckPrefix32(s, 0x000010f1, 'ActVote');
        return {
            $: 'ActVote',
            transferRecipient: s.loadAddress(),
            count: s.loadUintBig(4),
        }
    },
    store(self: ActVote, b: c.Builder): void {
        b.storeUint(0x000010f1, 32);
        b.storeAddress(self.transferRecipient);
        b.storeUint(self.count, 4);
    },
    toCell(self: ActVote): c.Cell {
        return makeCellFrom<ActVote>(self, ActVote.store);
    }
}

/**
 > struct (0x000010f2) ActUnvote {
 >     transferRecipient: address
 >     count: uint4
 > }
 */
export interface ActUnvote {
    readonly $: 'ActUnvote'
    transferRecipient: c.Address
    count: uint4 /* = 1 */
}

export const ActUnvote = {
    PREFIX: 0x000010f2,

    create(args: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }): ActUnvote {
        return {
            $: 'ActUnvote',
            count: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActUnvote {
        loadAndCheckPrefix32(s, 0x000010f2, 'ActUnvote');
        return {
            $: 'ActUnvote',
            transferRecipient: s.loadAddress(),
            count: s.loadUintBig(4),
        }
    },
    store(self: ActUnvote, b: c.Builder): void {
        b.storeUint(0x000010f2, 32);
        b.storeAddress(self.transferRecipient);
        b.storeUint(self.count, 4);
    },
    toCell(self: ActUnvote): c.Cell {
        return makeCellFrom<ActUnvote>(self, ActUnvote.store);
    }
}

/**
 > struct (0x000010f3) VotingAction {
 >     version: uint10
 >     positiveVote: bool
 >     count: uint4
 >     sender: address
 >     country: uint16
 > }
 */
export interface VotingAction {
    readonly $: 'VotingAction'
    version: uint10 /* = 0 */
    positiveVote: boolean /* = true */
    count: uint4 /* = 10 */
    sender: c.Address
    country: uint16 /* = 0 */
}

export const VotingAction = {
    PREFIX: 0x000010f3,

    create(args: {
        version?: uint10 /* = 0 */
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
        country?: uint16 /* = 0 */
    }): VotingAction {
        return {
            $: 'VotingAction',
            version: 0n,
            positiveVote: true,
            count: 10n,
            country: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): VotingAction {
        loadAndCheckPrefix32(s, 0x000010f3, 'VotingAction');
        return {
            $: 'VotingAction',
            version: s.loadUintBig(10),
            positiveVote: s.loadBoolean(),
            count: s.loadUintBig(4),
            sender: s.loadAddress(),
            country: s.loadUintBig(16),
        }
    },
    store(self: VotingAction, b: c.Builder): void {
        b.storeUint(0x000010f3, 32);
        b.storeUint(self.version, 10);
        b.storeBit(self.positiveVote);
        b.storeUint(self.count, 4);
        b.storeAddress(self.sender);
        b.storeUint(self.country, 16);
    },
    toCell(self: VotingAction): c.Cell {
        return makeCellFrom<VotingAction>(self, VotingAction.store);
    }
}

/**
 > struct (0x000010f4) ActDispatchAuthorityAction {
 >     transferRecipient: address
 >     fundsReceiver: address?
 >     amount: coins
 >     toggleActive: bool
 > }
 */
export interface ActDispatchAuthorityAction {
    readonly $: 'ActDispatchAuthorityAction'
    transferRecipient: c.Address
    fundsReceiver: c.Address | null /* = null */
    amount: coins /* = 0 */
    toggleActive: boolean /* = true */
}

export const ActDispatchAuthorityAction = {
    PREFIX: 0x000010f4,

    create(args: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }): ActDispatchAuthorityAction {
        return {
            $: 'ActDispatchAuthorityAction',
            fundsReceiver: null,
            amount: 0n,
            toggleActive: true,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActDispatchAuthorityAction {
        loadAndCheckPrefix32(s, 0x000010f4, 'ActDispatchAuthorityAction');
        return {
            $: 'ActDispatchAuthorityAction',
            transferRecipient: s.loadAddress(),
            fundsReceiver: s.loadMaybeAddress(),
            amount: s.loadCoins(),
            toggleActive: s.loadBoolean(),
        }
    },
    store(self: ActDispatchAuthorityAction, b: c.Builder): void {
        b.storeUint(0x000010f4, 32);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.fundsReceiver);
        b.storeCoins(self.amount);
        b.storeBit(self.toggleActive);
    },
    toCell(self: ActDispatchAuthorityAction): c.Cell {
        return makeCellFrom<ActDispatchAuthorityAction>(self, ActDispatchAuthorityAction.store);
    }
}

/**
 > struct (0x000010f5) AuthorityAction {
 >     version: uint10
 >     sender: address
 >     fundsReceiver: address?
 >     amount: coins
 >     toggleActive: bool
 > }
 */
export interface AuthorityAction {
    readonly $: 'AuthorityAction'
    version: uint10 /* = 0 */
    sender: c.Address
    fundsReceiver: c.Address | null /* = null */
    amount: coins /* = 0 */
    toggleActive: boolean /* = true */
}

export const AuthorityAction = {
    PREFIX: 0x000010f5,

    create(args: {
        version?: uint10 /* = 0 */
        sender: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }): AuthorityAction {
        return {
            $: 'AuthorityAction',
            version: 0n,
            fundsReceiver: null,
            amount: 0n,
            toggleActive: true,
            ...args
        }
    },
    fromSlice(s: c.Slice): AuthorityAction {
        loadAndCheckPrefix32(s, 0x000010f5, 'AuthorityAction');
        return {
            $: 'AuthorityAction',
            version: s.loadUintBig(10),
            sender: s.loadAddress(),
            fundsReceiver: s.loadMaybeAddress(),
            amount: s.loadCoins(),
            toggleActive: s.loadBoolean(),
        }
    },
    store(self: AuthorityAction, b: c.Builder): void {
        b.storeUint(0x000010f5, 32);
        b.storeUint(self.version, 10);
        b.storeAddress(self.sender);
        b.storeAddress(self.fundsReceiver);
        b.storeCoins(self.amount);
        b.storeBit(self.toggleActive);
    },
    toCell(self: AuthorityAction): c.Cell {
        return makeCellFrom<AuthorityAction>(self, AuthorityAction.store);
    }
}

/**
 > struct (0x000010f6) SetStatus {
 >     sender: address
 >     status: uint2
 > }
 */
export interface SetStatus {
    readonly $: 'SetStatus'
    sender: c.Address
    status: uint2
}

export const SetStatus = {
    PREFIX: 0x000010f6,

    create(args: {
        sender: c.Address
        status: uint2
    }): SetStatus {
        return {
            $: 'SetStatus',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetStatus {
        loadAndCheckPrefix32(s, 0x000010f6, 'SetStatus');
        return {
            $: 'SetStatus',
            sender: s.loadAddress(),
            status: s.loadUintBig(2),
        }
    },
    store(self: SetStatus, b: c.Builder): void {
        b.storeUint(0x000010f6, 32);
        b.storeAddress(self.sender);
        b.storeUint(self.status, 2);
    },
    toCell(self: SetStatus): c.Cell {
        return makeCellFrom<SetStatus>(self, SetStatus.store);
    }
}

/**
 > struct (0x000010fa) ActSubmitProposal {
 >     queryId: uint64
 >     daoProxyAddress: address
 >     targetMsg: cell
 >     pollCode: cell
 > }
 */
export interface ActSubmitProposal {
    readonly $: 'ActSubmitProposal'
    queryId: uint64
    daoProxyAddress: c.Address
    targetMsg: c.Cell
    pollCode: c.Cell
}

export const ActSubmitProposal = {
    PREFIX: 0x000010fa,

    create(args: {
        queryId: uint64
        daoProxyAddress: c.Address
        targetMsg: c.Cell
        pollCode: c.Cell
    }): ActSubmitProposal {
        return {
            $: 'ActSubmitProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActSubmitProposal {
        loadAndCheckPrefix32(s, 0x000010fa, 'ActSubmitProposal');
        return {
            $: 'ActSubmitProposal',
            queryId: s.loadUintBig(64),
            daoProxyAddress: s.loadAddress(),
            targetMsg: s.loadRef(),
            pollCode: s.loadRef(),
        }
    },
    store(self: ActSubmitProposal, b: c.Builder): void {
        b.storeUint(0x000010fa, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.daoProxyAddress);
        b.storeRef(self.targetMsg);
        b.storeRef(self.pollCode);
    },
    toCell(self: ActSubmitProposal): c.Cell {
        return makeCellFrom<ActSubmitProposal>(self, ActSubmitProposal.store);
    }
}

/**
 > struct (0x000010fb) InitPoll {
 >     queryId: uint64
 > }
 */
export interface InitPoll {
    readonly $: 'InitPoll'
    queryId: uint64 /* = 0 */
}

export const InitPoll = {
    PREFIX: 0x000010fb,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): InitPoll {
        return {
            $: 'InitPoll',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InitPoll {
        loadAndCheckPrefix32(s, 0x000010fb, 'InitPoll');
        return {
            $: 'InitPoll',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: InitPoll, b: c.Builder): void {
        b.storeUint(0x000010fb, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: InitPoll): c.Cell {
        return makeCellFrom<InitPoll>(self, InitPoll.store);
    }
}

/**
 > struct (0x000010fc) ActVoteProposal {
 >     queryId: uint64
 >     pollAddress: address
 >     proposalId: uint64
 >     vote: bool
 >     oldVote: bool?
 > }
 */
export interface ActVoteProposal {
    readonly $: 'ActVoteProposal'
    queryId: uint64
    pollAddress: c.Address
    proposalId: uint64
    vote: boolean
    oldVote: boolean | null /* = null */
}

export const ActVoteProposal = {
    PREFIX: 0x000010fc,

    create(args: {
        queryId: uint64
        pollAddress: c.Address
        proposalId: uint64
        vote: boolean
        oldVote?: boolean | null /* = null */
    }): ActVoteProposal {
        return {
            $: 'ActVoteProposal',
            oldVote: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActVoteProposal {
        loadAndCheckPrefix32(s, 0x000010fc, 'ActVoteProposal');
        return {
            $: 'ActVoteProposal',
            queryId: s.loadUintBig(64),
            pollAddress: s.loadAddress(),
            proposalId: s.loadUintBig(64),
            vote: s.loadBoolean(),
            oldVote: s.loadBoolean() ? s.loadBoolean() : null,
        }
    },
    store(self: ActVoteProposal, b: c.Builder): void {
        b.storeUint(0x000010fc, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.pollAddress);
        b.storeUint(self.proposalId, 64);
        b.storeBit(self.vote);
        storeTolkNullable<boolean>(self.oldVote, b,
            (v,b) => b.storeBit(v)
        );
    },
    toCell(self: ActVoteProposal): c.Cell {
        return makeCellFrom<ActVoteProposal>(self, ActVoteProposal.store);
    }
}

/**
 > struct (0x000010fe) VoteProposal {
 >     queryId: uint64
 >     proposalId: uint64
 >     voterOwner: address
 >     oldVote: bool?
 >     newVote: bool
 > }
 */
export interface VoteProposal {
    readonly $: 'VoteProposal'
    queryId: uint64
    proposalId: uint64
    voterOwner: c.Address
    oldVote: boolean | null /* = null */
    newVote: boolean
}

export const VoteProposal = {
    PREFIX: 0x000010fe,

    create(args: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote?: boolean | null /* = null */
        newVote: boolean
    }): VoteProposal {
        return {
            $: 'VoteProposal',
            oldVote: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): VoteProposal {
        loadAndCheckPrefix32(s, 0x000010fe, 'VoteProposal');
        return {
            $: 'VoteProposal',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
            voterOwner: s.loadAddress(),
            oldVote: s.loadBoolean() ? s.loadBoolean() : null,
            newVote: s.loadBoolean(),
        }
    },
    store(self: VoteProposal, b: c.Builder): void {
        b.storeUint(0x000010fe, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
        b.storeAddress(self.voterOwner);
        storeTolkNullable<boolean>(self.oldVote, b,
            (v,b) => b.storeBit(v)
        );
        b.storeBit(self.newVote);
    },
    toCell(self: VoteProposal): c.Cell {
        return makeCellFrom<VoteProposal>(self, VoteProposal.store);
    }
}

/**
 > struct (0x00001141) ActClaimWeeklyGrant {
 >     queryId: uint64
 >     sendExcessesTo: address?
 > }
 */
export interface ActClaimWeeklyGrant {
    readonly $: 'ActClaimWeeklyGrant'
    queryId: uint64
    sendExcessesTo: c.Address | null
}

export const ActClaimWeeklyGrant = {
    PREFIX: 0x00001141,

    create(args: {
        queryId: uint64
        sendExcessesTo: c.Address | null
    }): ActClaimWeeklyGrant {
        return {
            $: 'ActClaimWeeklyGrant',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActClaimWeeklyGrant {
        loadAndCheckPrefix32(s, 0x00001141, 'ActClaimWeeklyGrant');
        return {
            $: 'ActClaimWeeklyGrant',
            queryId: s.loadUintBig(64),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: ActClaimWeeklyGrant, b: c.Builder): void {
        b.storeUint(0x00001141, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: ActClaimWeeklyGrant): c.Cell {
        return makeCellFrom<ActClaimWeeklyGrant>(self, ActClaimWeeklyGrant.store);
    }
}

/**
 > struct (0x00001142) ActPayEmi {
 >     queryId: uint64
 >     sendExcessesTo: address?
 > }
 */
export interface ActPayEmi {
    readonly $: 'ActPayEmi'
    queryId: uint64 /* = 0 */
    sendExcessesTo: c.Address | null /* = null */
}

export const ActPayEmi = {
    PREFIX: 0x00001142,

    create(args: {
        queryId?: uint64 /* = 0 */
        sendExcessesTo?: c.Address | null /* = null */
    }): ActPayEmi {
        return {
            $: 'ActPayEmi',
            queryId: 0n,
            sendExcessesTo: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActPayEmi {
        loadAndCheckPrefix32(s, 0x00001142, 'ActPayEmi');
        return {
            $: 'ActPayEmi',
            queryId: s.loadUintBig(64),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: ActPayEmi, b: c.Builder): void {
        b.storeUint(0x00001142, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: ActPayEmi): c.Cell {
        return makeCellFrom<ActPayEmi>(self, ActPayEmi.store);
    }
}

/**
 > struct (0x0000114d) TriggerDefaultEmi {
 >     queryId: uint64
 >     sender: address
 > }
 */
export interface TriggerDefaultEmi {
    readonly $: 'TriggerDefaultEmi'
    queryId: uint64 /* = 0 */
    sender: c.Address
}

export const TriggerDefaultEmi = {
    PREFIX: 0x0000114d,

    create(args: {
        queryId?: uint64 /* = 0 */
        sender: c.Address
    }): TriggerDefaultEmi {
        return {
            $: 'TriggerDefaultEmi',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): TriggerDefaultEmi {
        loadAndCheckPrefix32(s, 0x0000114d, 'TriggerDefaultEmi');
        return {
            $: 'TriggerDefaultEmi',
            queryId: s.loadUintBig(64),
            sender: s.loadAddress(),
        }
    },
    store(self: TriggerDefaultEmi, b: c.Builder): void {
        b.storeUint(0x0000114d, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
    },
    toCell(self: TriggerDefaultEmi): c.Cell {
        return makeCellFrom<TriggerDefaultEmi>(self, TriggerDefaultEmi.store);
    }
}

/**
 > struct (0x0000114e) TriggerDecay {
 >     sender: address
 > }
 */
export interface TriggerDecay {
    readonly $: 'TriggerDecay'
    sender: c.Address
}

export const TriggerDecay = {
    PREFIX: 0x0000114e,

    create(args: {
        sender: c.Address
    }): TriggerDecay {
        return {
            $: 'TriggerDecay',
            ...args
        }
    },
    fromSlice(s: c.Slice): TriggerDecay {
        loadAndCheckPrefix32(s, 0x0000114e, 'TriggerDecay');
        return {
            $: 'TriggerDecay',
            sender: s.loadAddress(),
        }
    },
    store(self: TriggerDecay, b: c.Builder): void {
        b.storeUint(0x0000114e, 32);
        b.storeAddress(self.sender);
    },
    toCell(self: TriggerDecay): c.Cell {
        return makeCellFrom<TriggerDecay>(self, TriggerDecay.store);
    }
}

/**
 > struct OneTimePocketMoney {
 >     remaining: coins
 >     startTime: uint32
 >     validUntil: uint32
 > }
 */
export interface OneTimePocketMoney {
    readonly $: 'OneTimePocketMoney'
    remaining: coins
    startTime: uint32 /* = 0 */
    validUntil: uint32 /* = 0 */
}

export const OneTimePocketMoney = {
    create(args: {
        remaining: coins
        startTime?: uint32 /* = 0 */
        validUntil?: uint32 /* = 0 */
    }): OneTimePocketMoney {
        return {
            $: 'OneTimePocketMoney',
            startTime: 0n,
            validUntil: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): OneTimePocketMoney {
        return {
            $: 'OneTimePocketMoney',
            remaining: s.loadCoins(),
            startTime: s.loadUintBig(32),
            validUntil: s.loadUintBig(32),
        }
    },
    store(self: OneTimePocketMoney, b: c.Builder): void {
        b.storeCoins(self.remaining);
        b.storeUint(self.startTime, 32);
        b.storeUint(self.validUntil, 32);
    },
    toCell(self: OneTimePocketMoney): c.Cell {
        return makeCellFrom<OneTimePocketMoney>(self, OneTimePocketMoney.store);
    }
}

/**
 > struct FixedRecurringPocketMoney {
 >     limit: coins
 >     spent: coins
 >     period: uint32
 >     startTime: uint32
 >     validUntil: uint32
 > }
 */
export interface FixedRecurringPocketMoney {
    readonly $: 'FixedRecurringPocketMoney'
    limit: coins
    spent: coins /* = 0 */
    period: uint32
    startTime: uint32 /* = 0 */
    validUntil: uint32
}

export const FixedRecurringPocketMoney = {
    create(args: {
        limit: coins
        spent?: coins /* = 0 */
        period: uint32
        startTime?: uint32 /* = 0 */
        validUntil: uint32
    }): FixedRecurringPocketMoney {
        return {
            $: 'FixedRecurringPocketMoney',
            spent: 0n,
            startTime: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): FixedRecurringPocketMoney {
        return {
            $: 'FixedRecurringPocketMoney',
            limit: s.loadCoins(),
            spent: s.loadCoins(),
            period: s.loadUintBig(32),
            startTime: s.loadUintBig(32),
            validUntil: s.loadUintBig(32),
        }
    },
    store(self: FixedRecurringPocketMoney, b: c.Builder): void {
        b.storeCoins(self.limit);
        b.storeCoins(self.spent);
        b.storeUint(self.period, 32);
        b.storeUint(self.startTime, 32);
        b.storeUint(self.validUntil, 32);
    },
    toCell(self: FixedRecurringPocketMoney): c.Cell {
        return makeCellFrom<FixedRecurringPocketMoney>(self, FixedRecurringPocketMoney.store);
    }
}

/**
 > struct OpenRecurringPocketMoney {
 >     limit: coins
 >     spent: coins
 >     period: uint32
 >     startTime: uint32
 > }
 */
export interface OpenRecurringPocketMoney {
    readonly $: 'OpenRecurringPocketMoney'
    limit: coins
    spent: coins /* = 0 */
    period: uint32 /* = 0 */
    startTime: uint32 /* = 0 */
}

export const OpenRecurringPocketMoney = {
    create(args: {
        limit: coins
        spent?: coins /* = 0 */
        period?: uint32 /* = 0 */
        startTime?: uint32 /* = 0 */
    }): OpenRecurringPocketMoney {
        return {
            $: 'OpenRecurringPocketMoney',
            spent: 0n,
            period: 0n,
            startTime: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): OpenRecurringPocketMoney {
        return {
            $: 'OpenRecurringPocketMoney',
            limit: s.loadCoins(),
            spent: s.loadCoins(),
            period: s.loadUintBig(32),
            startTime: s.loadUintBig(32),
        }
    },
    store(self: OpenRecurringPocketMoney, b: c.Builder): void {
        b.storeCoins(self.limit);
        b.storeCoins(self.spent);
        b.storeUint(self.period, 32);
        b.storeUint(self.startTime, 32);
    },
    toCell(self: OpenRecurringPocketMoney): c.Cell {
        return makeCellFrom<OpenRecurringPocketMoney>(self, OpenRecurringPocketMoney.store);
    }
}

/**
 > struct PocketMoney {
 >     unrestricted: bool
 >     oneTime: OneTimePocketMoney?
 >     fixedRecurring: FixedRecurringPocketMoney?
 >     openRecurring: OpenRecurringPocketMoney?
 > }
 */
export interface PocketMoney {
    readonly $: 'PocketMoney'
    unrestricted: boolean /* = false */
    oneTime: OneTimePocketMoney | null /* = null */
    fixedRecurring: FixedRecurringPocketMoney | null /* = null */
    openRecurring: OpenRecurringPocketMoney | null /* = null */
}

export const PocketMoney = {
    create(args: {
        unrestricted?: boolean /* = false */
        oneTime?: OneTimePocketMoney | null /* = null */
        fixedRecurring?: FixedRecurringPocketMoney | null /* = null */
        openRecurring?: OpenRecurringPocketMoney | null /* = null */
    }): PocketMoney {
        return {
            $: 'PocketMoney',
            unrestricted: false,
            oneTime: null,
            fixedRecurring: null,
            openRecurring: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): PocketMoney {
        return {
            $: 'PocketMoney',
            unrestricted: s.loadBoolean(),
            oneTime: s.loadBoolean() ? OneTimePocketMoney.fromSlice(s) : null,
            fixedRecurring: s.loadBoolean() ? FixedRecurringPocketMoney.fromSlice(s) : null,
            openRecurring: s.loadBoolean() ? OpenRecurringPocketMoney.fromSlice(s) : null,
        }
    },
    store(self: PocketMoney, b: c.Builder): void {
        b.storeBit(self.unrestricted);
        storeTolkNullable<OneTimePocketMoney>(self.oneTime, b, OneTimePocketMoney.store);
        storeTolkNullable<FixedRecurringPocketMoney>(self.fixedRecurring, b, FixedRecurringPocketMoney.store);
        storeTolkNullable<OpenRecurringPocketMoney>(self.openRecurring, b, OpenRecurringPocketMoney.store);
    },
    toCell(self: PocketMoney): c.Cell {
        return makeCellFrom<PocketMoney>(self, PocketMoney.store);
    }
}

/**
 > struct FixedRecurringConfig {
 >     limit: coins
 >     period: uint32
 >     startTime: uint32
 >     validUntil: uint32
 > }
 */
export interface FixedRecurringConfig {
    readonly $: 'FixedRecurringConfig'
    limit: coins
    period: uint32
    startTime: uint32 /* = 0 */
    validUntil: uint32
}

export const FixedRecurringConfig = {
    create(args: {
        limit: coins
        period: uint32
        startTime?: uint32 /* = 0 */
        validUntil: uint32
    }): FixedRecurringConfig {
        return {
            $: 'FixedRecurringConfig',
            startTime: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): FixedRecurringConfig {
        return {
            $: 'FixedRecurringConfig',
            limit: s.loadCoins(),
            period: s.loadUintBig(32),
            startTime: s.loadUintBig(32),
            validUntil: s.loadUintBig(32),
        }
    },
    store(self: FixedRecurringConfig, b: c.Builder): void {
        b.storeCoins(self.limit);
        b.storeUint(self.period, 32);
        b.storeUint(self.startTime, 32);
        b.storeUint(self.validUntil, 32);
    },
    toCell(self: FixedRecurringConfig): c.Cell {
        return makeCellFrom<FixedRecurringConfig>(self, FixedRecurringConfig.store);
    }
}

/**
 > struct OpenRecurringConfig {
 >     limit: coins
 >     period: uint32
 >     startTime: uint32
 > }
 */
export interface OpenRecurringConfig {
    readonly $: 'OpenRecurringConfig'
    limit: coins
    period: uint32 /* = 0 */
    startTime: uint32 /* = 0 */
}

export const OpenRecurringConfig = {
    create(args: {
        limit: coins
        period?: uint32 /* = 0 */
        startTime?: uint32 /* = 0 */
    }): OpenRecurringConfig {
        return {
            $: 'OpenRecurringConfig',
            period: 0n,
            startTime: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): OpenRecurringConfig {
        return {
            $: 'OpenRecurringConfig',
            limit: s.loadCoins(),
            period: s.loadUintBig(32),
            startTime: s.loadUintBig(32),
        }
    },
    store(self: OpenRecurringConfig, b: c.Builder): void {
        b.storeCoins(self.limit);
        b.storeUint(self.period, 32);
        b.storeUint(self.startTime, 32);
    },
    toCell(self: OpenRecurringConfig): c.Cell {
        return makeCellFrom<OpenRecurringConfig>(self, OpenRecurringConfig.store);
    }
}

/**
 > struct (0x00001143) SetPocketMoney {
 >     queryId: uint64
 >     grantee: address
 >     unrestricted: bool?
 >     oneTime: OneTimePocketMoney?
 >     fixedRecurring: FixedRecurringConfig?
 >     openRecurring: OpenRecurringConfig?
 > }
 */
export interface SetPocketMoney {
    readonly $: 'SetPocketMoney'
    queryId: uint64
    grantee: c.Address
    unrestricted: boolean | null /* = null */
    oneTime: OneTimePocketMoney | null /* = null */
    fixedRecurring: FixedRecurringConfig | null /* = null */
    openRecurring: OpenRecurringConfig | null /* = null */
}

export const SetPocketMoney = {
    PREFIX: 0x00001143,

    create(args: {
        queryId: uint64
        grantee: c.Address
        unrestricted?: boolean | null /* = null */
        oneTime?: OneTimePocketMoney | null /* = null */
        fixedRecurring?: FixedRecurringConfig | null /* = null */
        openRecurring?: OpenRecurringConfig | null /* = null */
    }): SetPocketMoney {
        return {
            $: 'SetPocketMoney',
            unrestricted: null,
            oneTime: null,
            fixedRecurring: null,
            openRecurring: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): SetPocketMoney {
        loadAndCheckPrefix32(s, 0x00001143, 'SetPocketMoney');
        return {
            $: 'SetPocketMoney',
            queryId: s.loadUintBig(64),
            grantee: s.loadAddress(),
            unrestricted: s.loadBoolean() ? s.loadBoolean() : null,
            oneTime: s.loadBoolean() ? OneTimePocketMoney.fromSlice(s) : null,
            fixedRecurring: s.loadBoolean() ? FixedRecurringConfig.fromSlice(s) : null,
            openRecurring: s.loadBoolean() ? OpenRecurringConfig.fromSlice(s) : null,
        }
    },
    store(self: SetPocketMoney, b: c.Builder): void {
        b.storeUint(0x00001143, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.grantee);
        storeTolkNullable<boolean>(self.unrestricted, b,
            (v,b) => b.storeBit(v)
        );
        storeTolkNullable<OneTimePocketMoney>(self.oneTime, b, OneTimePocketMoney.store);
        storeTolkNullable<FixedRecurringConfig>(self.fixedRecurring, b, FixedRecurringConfig.store);
        storeTolkNullable<OpenRecurringConfig>(self.openRecurring, b, OpenRecurringConfig.store);
    },
    toCell(self: SetPocketMoney): c.Cell {
        return makeCellFrom<SetPocketMoney>(self, SetPocketMoney.store);
    }
}

/**
 > struct (0x00001144) SpendPocketMoney {
 >     queryId: uint64
 >     amount: coins
 >     receiver: address
 >     sendExcessesTo: address?
 > }
 */
export interface SpendPocketMoney {
    readonly $: 'SpendPocketMoney'
    queryId: uint64
    amount: coins
    receiver: c.Address
    sendExcessesTo: c.Address | null
}

export const SpendPocketMoney = {
    PREFIX: 0x00001144,

    create(args: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }): SpendPocketMoney {
        return {
            $: 'SpendPocketMoney',
            ...args
        }
    },
    fromSlice(s: c.Slice): SpendPocketMoney {
        loadAndCheckPrefix32(s, 0x00001144, 'SpendPocketMoney');
        return {
            $: 'SpendPocketMoney',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            receiver: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: SpendPocketMoney, b: c.Builder): void {
        b.storeUint(0x00001144, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.receiver);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: SpendPocketMoney): c.Cell {
        return makeCellFrom<SpendPocketMoney>(self, SpendPocketMoney.store);
    }
}

/**
 > struct (0x00001145) AskGoldCoinsTransfer {
 >     queryId: uint64
 >     amount: uint32
 >     receiver: address
 >     sendExcessesTo: address?
 > }
 */
export interface AskGoldCoinsTransfer {
    readonly $: 'AskGoldCoinsTransfer'
    queryId: uint64
    amount: uint32
    receiver: c.Address
    sendExcessesTo: c.Address | null
}

export const AskGoldCoinsTransfer = {
    PREFIX: 0x00001145,

    create(args: {
        queryId: uint64
        amount: uint32
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }): AskGoldCoinsTransfer {
        return {
            $: 'AskGoldCoinsTransfer',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskGoldCoinsTransfer {
        loadAndCheckPrefix32(s, 0x00001145, 'AskGoldCoinsTransfer');
        return {
            $: 'AskGoldCoinsTransfer',
            queryId: s.loadUintBig(64),
            amount: s.loadUintBig(32),
            receiver: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: AskGoldCoinsTransfer, b: c.Builder): void {
        b.storeUint(0x00001145, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.amount, 32);
        b.storeAddress(self.receiver);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: AskGoldCoinsTransfer): c.Cell {
        return makeCellFrom<AskGoldCoinsTransfer>(self, AskGoldCoinsTransfer.store);
    }
}

/**
 > struct (0x00001146) InternalGoldCoinsTransfer {
 >     queryId: uint64
 >     amount: uint32
 >     version: uint10
 >     transferInitiator: address
 > }
 */
export interface InternalGoldCoinsTransfer {
    readonly $: 'InternalGoldCoinsTransfer'
    queryId: uint64
    amount: uint32
    version: uint10 /* = 0 */
    transferInitiator: c.Address
}

export const InternalGoldCoinsTransfer = {
    PREFIX: 0x00001146,

    create(args: {
        queryId: uint64
        amount: uint32
        version?: uint10 /* = 0 */
        transferInitiator: c.Address
    }): InternalGoldCoinsTransfer {
        return {
            $: 'InternalGoldCoinsTransfer',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalGoldCoinsTransfer {
        loadAndCheckPrefix32(s, 0x00001146, 'InternalGoldCoinsTransfer');
        return {
            $: 'InternalGoldCoinsTransfer',
            queryId: s.loadUintBig(64),
            amount: s.loadUintBig(32),
            version: s.loadUintBig(10),
            transferInitiator: s.loadAddress(),
        }
    },
    store(self: InternalGoldCoinsTransfer, b: c.Builder): void {
        b.storeUint(0x00001146, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.amount, 32);
        b.storeUint(self.version, 10);
        b.storeAddress(self.transferInitiator);
    },
    toCell(self: InternalGoldCoinsTransfer): c.Cell {
        return makeCellFrom<InternalGoldCoinsTransfer>(self, InternalGoldCoinsTransfer.store);
    }
}

/**
 > struct (0x00001147) BuyCredit {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferRecipient: address
 >     sendExcessesTo: address?
 > }
 */
export interface BuyCredit {
    readonly $: 'BuyCredit'
    queryId: uint64
    jettonAmount: coins
    transferRecipient: c.Address
    sendExcessesTo: c.Address | null
}

export const BuyCredit = {
    PREFIX: 0x00001147,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
    }): BuyCredit {
        return {
            $: 'BuyCredit',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuyCredit {
        loadAndCheckPrefix32(s, 0x00001147, 'BuyCredit');
        return {
            $: 'BuyCredit',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferRecipient: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: BuyCredit, b: c.Builder): void {
        b.storeUint(0x00001147, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: BuyCredit): c.Cell {
        return makeCellFrom<BuyCredit>(self, BuyCredit.store);
    }
}

/**
 > struct (0x00001148) Payback {
 >     queryId: uint64
 >     amount: coins
 >     sender: address
 >     swapTargetOwner: address?
 > }
 */
export interface Payback {
    readonly $: 'Payback'
    queryId: uint64
    amount: coins
    sender: c.Address
    swapTargetOwner: c.Address | null /* = null */
}

export const Payback = {
    PREFIX: 0x00001148,

    create(args: {
        queryId: uint64
        amount: coins
        sender: c.Address
        swapTargetOwner?: c.Address | null /* = null */
    }): Payback {
        return {
            $: 'Payback',
            swapTargetOwner: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): Payback {
        loadAndCheckPrefix32(s, 0x00001148, 'Payback');
        return {
            $: 'Payback',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            sender: s.loadAddress(),
            swapTargetOwner: s.loadMaybeAddress(),
        }
    },
    store(self: Payback, b: c.Builder): void {
        b.storeUint(0x00001148, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.sender);
        b.storeAddress(self.swapTargetOwner);
    },
    toCell(self: Payback): c.Cell {
        return makeCellFrom<Payback>(self, Payback.store);
    }
}

/**
 > struct (0x00001149) ActSetPersonalJetton {
 >     personalJettonMinter: address
 >     personalJettonWallet: address
 > }
 */
export interface ActSetPersonalJetton {
    readonly $: 'ActSetPersonalJetton'
    personalJettonMinter: c.Address
    personalJettonWallet: c.Address
}

export const ActSetPersonalJetton = {
    PREFIX: 0x00001149,

    create(args: {
        personalJettonMinter: c.Address
        personalJettonWallet: c.Address
    }): ActSetPersonalJetton {
        return {
            $: 'ActSetPersonalJetton',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActSetPersonalJetton {
        loadAndCheckPrefix32(s, 0x00001149, 'ActSetPersonalJetton');
        return {
            $: 'ActSetPersonalJetton',
            personalJettonMinter: s.loadAddress(),
            personalJettonWallet: s.loadAddress(),
        }
    },
    store(self: ActSetPersonalJetton, b: c.Builder): void {
        b.storeUint(0x00001149, 32);
        b.storeAddress(self.personalJettonMinter);
        b.storeAddress(self.personalJettonWallet);
    },
    toCell(self: ActSetPersonalJetton): c.Cell {
        return makeCellFrom<ActSetPersonalJetton>(self, ActSetPersonalJetton.store);
    }
}

/**
 > struct (0x0000114a) SetLoanRequirement {
 >     queryId: uint64
 >     amount: coins?
 >     maturityDate: uint32?
 >     cutoffDate: uint32?
 >     multiplier: uint16?
 > }
 */
export interface SetLoanRequirement {
    readonly $: 'SetLoanRequirement'
    queryId: uint64 /* = 0 */
    amount: coins | null /* = null */
    maturityDate: uint32 | null /* = null */
    cutoffDate: uint32 | null /* = null */
    multiplier: uint16 | null /* = null */
}

export const SetLoanRequirement = {
    PREFIX: 0x0000114a,

    create(args: {
        queryId?: uint64 /* = 0 */
        amount?: coins | null /* = null */
        maturityDate?: uint32 | null /* = null */
        cutoffDate?: uint32 | null /* = null */
        multiplier?: uint16 | null /* = null */
    }): SetLoanRequirement {
        return {
            $: 'SetLoanRequirement',
            queryId: 0n,
            amount: null,
            maturityDate: null,
            cutoffDate: null,
            multiplier: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): SetLoanRequirement {
        loadAndCheckPrefix32(s, 0x0000114a, 'SetLoanRequirement');
        return {
            $: 'SetLoanRequirement',
            queryId: s.loadUintBig(64),
            amount: s.loadBoolean() ? s.loadCoins() : null,
            maturityDate: s.loadBoolean() ? s.loadUintBig(32) : null,
            cutoffDate: s.loadBoolean() ? s.loadUintBig(32) : null,
            multiplier: s.loadBoolean() ? s.loadUintBig(16) : null,
        }
    },
    store(self: SetLoanRequirement, b: c.Builder): void {
        b.storeUint(0x0000114a, 32);
        b.storeUint(self.queryId, 64);
        storeTolkNullable<coins>(self.amount, b,
            (v,b) => b.storeCoins(v)
        );
        storeTolkNullable<uint32>(self.maturityDate, b,
            (v,b) => b.storeUint(v, 32)
        );
        storeTolkNullable<uint32>(self.cutoffDate, b,
            (v,b) => b.storeUint(v, 32)
        );
        storeTolkNullable<uint16>(self.multiplier, b,
            (v,b) => b.storeUint(v, 16)
        );
    },
    toCell(self: SetLoanRequirement): c.Cell {
        return makeCellFrom<SetLoanRequirement>(self, SetLoanRequirement.store);
    }
}

/**
 > struct (0x0000114b) RepayDebt {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface RepayDebt {
    readonly $: 'RepayDebt'
    queryId: uint64 /* = 0 */
    amount: coins
}

export const RepayDebt = {
    PREFIX: 0x0000114b,

    create(args: {
        queryId?: uint64 /* = 0 */
        amount: coins
    }): RepayDebt {
        return {
            $: 'RepayDebt',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): RepayDebt {
        loadAndCheckPrefix32(s, 0x0000114b, 'RepayDebt');
        return {
            $: 'RepayDebt',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: RepayDebt, b: c.Builder): void {
        b.storeUint(0x0000114b, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: RepayDebt): c.Cell {
        return makeCellFrom<RepayDebt>(self, RepayDebt.store);
    }
}

/**
 > struct (0x0000105a) ActCloseAccount {
 >     queryId: uint64
 > }
 */
export interface ActCloseAccount {
    readonly $: 'ActCloseAccount'
    queryId: uint64 /* = 0 */
}

export const ActCloseAccount = {
    PREFIX: 0x0000105a,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): ActCloseAccount {
        return {
            $: 'ActCloseAccount',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActCloseAccount {
        loadAndCheckPrefix32(s, 0x0000105a, 'ActCloseAccount');
        return {
            $: 'ActCloseAccount',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ActCloseAccount, b: c.Builder): void {
        b.storeUint(0x0000105a, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ActCloseAccount): c.Cell {
        return makeCellFrom<ActCloseAccount>(self, ActCloseAccount.store);
    }
}

/**
 > struct (0x0000105b) AuthorityCloseAccount {
 >     queryId: uint64
 >     target: address
 > }
 */
export interface AuthorityCloseAccount {
    readonly $: 'AuthorityCloseAccount'
    queryId: uint64 /* = 0 */
    target: c.Address
}

export const AuthorityCloseAccount = {
    PREFIX: 0x0000105b,

    create(args: {
        queryId?: uint64 /* = 0 */
        target: c.Address
    }): AuthorityCloseAccount {
        return {
            $: 'AuthorityCloseAccount',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): AuthorityCloseAccount {
        loadAndCheckPrefix32(s, 0x0000105b, 'AuthorityCloseAccount');
        return {
            $: 'AuthorityCloseAccount',
            queryId: s.loadUintBig(64),
            target: s.loadAddress(),
        }
    },
    store(self: AuthorityCloseAccount, b: c.Builder): void {
        b.storeUint(0x0000105b, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.target);
    },
    toCell(self: AuthorityCloseAccount): c.Cell {
        return makeCellFrom<AuthorityCloseAccount>(self, AuthorityCloseAccount.store);
    }
}

/**
 > struct (0x00001191) ActJoinLottery {
 > }
 */
export interface ActJoinLottery {
    readonly $: 'ActJoinLottery'
}

export const ActJoinLottery = {
    PREFIX: 0x00001191,

    create(): ActJoinLottery {
        return {
            $: 'ActJoinLottery',
        }
    },
    fromSlice(s: c.Slice): ActJoinLottery {
        loadAndCheckPrefix32(s, 0x00001191, 'ActJoinLottery');
        return {
            $: 'ActJoinLottery',
        }
    },
    store(self: ActJoinLottery, b: c.Builder): void {
        b.storeUint(0x00001191, 32);
    },
    toCell(self: ActJoinLottery): c.Cell {
        return makeCellFrom<ActJoinLottery>(self, ActJoinLottery.store);
    }
}

/**
 > struct (0x00001192) RequestState {
 > }
 */
export interface RequestState {
    readonly $: 'RequestState'
}

export const RequestState = {
    PREFIX: 0x00001192,

    create(): RequestState {
        return {
            $: 'RequestState',
        }
    },
    fromSlice(s: c.Slice): RequestState {
        loadAndCheckPrefix32(s, 0x00001192, 'RequestState');
        return {
            $: 'RequestState',
        }
    },
    store(self: RequestState, b: c.Builder): void {
        b.storeUint(0x00001192, 32);
    },
    toCell(self: RequestState): c.Cell {
        return makeCellFrom<RequestState>(self, RequestState.store);
    }
}

/**
 > struct (0x00001193) ProvideState {
 >     state: cell
 > }
 */
export interface ProvideState {
    readonly $: 'ProvideState'
    state: c.Cell
}

export const ProvideState = {
    PREFIX: 0x00001193,

    create(args: {
        state: c.Cell
    }): ProvideState {
        return {
            $: 'ProvideState',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProvideState {
        loadAndCheckPrefix32(s, 0x00001193, 'ProvideState');
        return {
            $: 'ProvideState',
            state: s.loadRef(),
        }
    },
    store(self: ProvideState, b: c.Builder): void {
        b.storeUint(0x00001193, 32);
        b.storeRef(self.state);
    },
    toCell(self: ProvideState): c.Cell {
        return makeCellFrom<ProvideState>(self, ProvideState.store);
    }
}

/**
 > struct (0x62696430) DnsBidRequest {
 >     queryId: uint64
 >     domain: Cell<RemainingBitsAndRefs>
 >     fiBidAmount: coins
 >     collectionAddress: address
 > }
 */
export interface DnsBidRequest {
    readonly $: 'DnsBidRequest'
    queryId: uint64
    domain: CellRef<RemainingBitsAndRefs>
    fiBidAmount: coins
    collectionAddress: c.Address
}

export const DnsBidRequest = {
    PREFIX: 0x62696430,

    create(args: {
        queryId: uint64
        domain: CellRef<RemainingBitsAndRefs>
        fiBidAmount: coins
        collectionAddress: c.Address
    }): DnsBidRequest {
        return {
            $: 'DnsBidRequest',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsBidRequest {
        loadAndCheckPrefix32(s, 0x62696430, 'DnsBidRequest');
        return {
            $: 'DnsBidRequest',
            queryId: s.loadUintBig(64),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
            fiBidAmount: s.loadCoins(),
            collectionAddress: s.loadAddress(),
        }
    },
    store(self: DnsBidRequest, b: c.Builder): void {
        b.storeUint(0x62696430, 32);
        b.storeUint(self.queryId, 64);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
        b.storeCoins(self.fiBidAmount);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self: DnsBidRequest): c.Cell {
        return makeCellFrom<DnsBidRequest>(self, DnsBidRequest.store);
    }
}

/**
 > struct (0x62696431) BidBroDomain {
 >     queryId: uint64
 >     bidder: address
 >     fiAmount: coins
 >     domain: Cell<RemainingBitsAndRefs>
 >     collectionAddress: address
 > }
 */
export interface BidBroDomain {
    readonly $: 'BidBroDomain'
    queryId: uint64
    bidder: c.Address
    fiAmount: coins
    domain: CellRef<RemainingBitsAndRefs>
    collectionAddress: c.Address
}

export const BidBroDomain = {
    PREFIX: 0x62696431,

    create(args: {
        queryId: uint64
        bidder: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
        collectionAddress: c.Address
    }): BidBroDomain {
        return {
            $: 'BidBroDomain',
            ...args
        }
    },
    fromSlice(s: c.Slice): BidBroDomain {
        loadAndCheckPrefix32(s, 0x62696431, 'BidBroDomain');
        return {
            $: 'BidBroDomain',
            queryId: s.loadUintBig(64),
            bidder: s.loadAddress(),
            fiAmount: s.loadCoins(),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
            collectionAddress: s.loadAddress(),
        }
    },
    store(self: BidBroDomain, b: c.Builder): void {
        b.storeUint(0x62696431, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.bidder);
        b.storeCoins(self.fiAmount);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self: BidBroDomain): c.Cell {
        return makeCellFrom<BidBroDomain>(self, BidBroDomain.store);
    }
}

/**
 > struct (0x72656e30) DnsRenewRequest {
 >     queryId: uint64
 >     itemAddress: address
 >     fiAmount: coins
 > }
 */
export interface DnsRenewRequest {
    readonly $: 'DnsRenewRequest'
    queryId: uint64
    itemAddress: c.Address
    fiAmount: coins
}

export const DnsRenewRequest = {
    PREFIX: 0x72656e30,

    create(args: {
        queryId: uint64
        itemAddress: c.Address
        fiAmount: coins
    }): DnsRenewRequest {
        return {
            $: 'DnsRenewRequest',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsRenewRequest {
        loadAndCheckPrefix32(s, 0x72656e30, 'DnsRenewRequest');
        return {
            $: 'DnsRenewRequest',
            queryId: s.loadUintBig(64),
            itemAddress: s.loadAddress(),
            fiAmount: s.loadCoins(),
        }
    },
    store(self: DnsRenewRequest, b: c.Builder): void {
        b.storeUint(0x72656e30, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.itemAddress);
        b.storeCoins(self.fiAmount);
    },
    toCell(self: DnsRenewRequest): c.Cell {
        return makeCellFrom<DnsRenewRequest>(self, DnsRenewRequest.store);
    }
}

/**
 > struct (0x72656e65) RenewBroDomain {
 >     queryId: uint64
 >     renewer: address
 >     fiAmount: coins
 >     itemAddress: address
 > }
 */
export interface RenewBroDomain {
    readonly $: 'RenewBroDomain'
    queryId: uint64
    renewer: c.Address
    fiAmount: coins
    itemAddress: c.Address
}

export const RenewBroDomain = {
    PREFIX: 0x72656e65,

    create(args: {
        queryId: uint64
        renewer: c.Address
        fiAmount: coins
        itemAddress: c.Address
    }): RenewBroDomain {
        return {
            $: 'RenewBroDomain',
            ...args
        }
    },
    fromSlice(s: c.Slice): RenewBroDomain {
        loadAndCheckPrefix32(s, 0x72656e65, 'RenewBroDomain');
        return {
            $: 'RenewBroDomain',
            queryId: s.loadUintBig(64),
            renewer: s.loadAddress(),
            fiAmount: s.loadCoins(),
            itemAddress: s.loadAddress(),
        }
    },
    store(self: RenewBroDomain, b: c.Builder): void {
        b.storeUint(0x72656e65, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.renewer);
        b.storeCoins(self.fiAmount);
        b.storeAddress(self.itemAddress);
    },
    toCell(self: RenewBroDomain): c.Cell {
        return makeCellFrom<RenewBroDomain>(self, RenewBroDomain.store);
    }
}

/**
 > struct (0x00001205) Follow {
 >     queryId: uint64
 >     followee: address
 > }
 */
export interface Follow {
    readonly $: 'Follow'
    queryId: uint64
    followee: c.Address
}

export const Follow = {
    PREFIX: 0x00001205,

    create(args: {
        queryId: uint64
        followee: c.Address
    }): Follow {
        return {
            $: 'Follow',
            ...args
        }
    },
    fromSlice(s: c.Slice): Follow {
        loadAndCheckPrefix32(s, 0x00001205, 'Follow');
        return {
            $: 'Follow',
            queryId: s.loadUintBig(64),
            followee: s.loadAddress(),
        }
    },
    store(self: Follow, b: c.Builder): void {
        b.storeUint(0x00001205, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followee);
    },
    toCell(self: Follow): c.Cell {
        return makeCellFrom<Follow>(self, Follow.store);
    }
}

/**
 > struct (0x00001200) Unfollow {
 >     queryId: uint64
 >     initiator: address
 >     followee: address
 > }
 */
export interface Unfollow {
    readonly $: 'Unfollow'
    queryId: uint64
    initiator: c.Address
    followee: c.Address
}

export const Unfollow = {
    PREFIX: 0x00001200,

    create(args: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }): Unfollow {
        return {
            $: 'Unfollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): Unfollow {
        loadAndCheckPrefix32(s, 0x00001200, 'Unfollow');
        return {
            $: 'Unfollow',
            queryId: s.loadUintBig(64),
            initiator: s.loadAddress(),
            followee: s.loadAddress(),
        }
    },
    store(self: Unfollow, b: c.Builder): void {
        b.storeUint(0x00001200, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.initiator);
        b.storeAddress(self.followee);
    },
    toCell(self: Unfollow): c.Cell {
        return makeCellFrom<Unfollow>(self, Unfollow.store);
    }
}

/**
 > struct (0x00001206) RequestFollow {
 >     queryId: uint64
 >     followerOwner: address
 >     mintAmount: coins
 > }
 */
export interface RequestFollow {
    readonly $: 'RequestFollow'
    queryId: uint64
    followerOwner: c.Address
    mintAmount: coins
}

export const RequestFollow = {
    PREFIX: 0x00001206,

    create(args: {
        queryId: uint64
        followerOwner: c.Address
        mintAmount: coins
    }): RequestFollow {
        return {
            $: 'RequestFollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestFollow {
        loadAndCheckPrefix32(s, 0x00001206, 'RequestFollow');
        return {
            $: 'RequestFollow',
            queryId: s.loadUintBig(64),
            followerOwner: s.loadAddress(),
            mintAmount: s.loadCoins(),
        }
    },
    store(self: RequestFollow, b: c.Builder): void {
        b.storeUint(0x00001206, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.mintAmount);
    },
    toCell(self: RequestFollow): c.Cell {
        return makeCellFrom<RequestFollow>(self, RequestFollow.store);
    }
}

/**
 > struct (0x00001207) RequestUnfollow {
 >     queryId: uint64
 >     initiator: address
 >     followerOwner: address
 >     burnAmount: coins
 > }
 */
export interface RequestUnfollow {
    readonly $: 'RequestUnfollow'
    queryId: uint64
    initiator: c.Address
    followerOwner: c.Address
    burnAmount: coins
}

export const RequestUnfollow = {
    PREFIX: 0x00001207,

    create(args: {
        queryId: uint64
        initiator: c.Address
        followerOwner: c.Address
        burnAmount: coins
    }): RequestUnfollow {
        return {
            $: 'RequestUnfollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestUnfollow {
        loadAndCheckPrefix32(s, 0x00001207, 'RequestUnfollow');
        return {
            $: 'RequestUnfollow',
            queryId: s.loadUintBig(64),
            initiator: s.loadAddress(),
            followerOwner: s.loadAddress(),
            burnAmount: s.loadCoins(),
        }
    },
    store(self: RequestUnfollow, b: c.Builder): void {
        b.storeUint(0x00001207, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.initiator);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.burnAmount);
    },
    toCell(self: RequestUnfollow): c.Cell {
        return makeCellFrom<RequestUnfollow>(self, RequestUnfollow.store);
    }
}

/**
 > struct (0x00001201) InitFollow {
 >     queryId: uint64
 >     followerOwner: address
 >     mintAmount: coins
 >     latestFollowingCode: cell?
 > }
 */
export interface InitFollow {
    readonly $: 'InitFollow'
    queryId: uint64
    followerOwner: c.Address
    mintAmount: coins /* = 0 */
    latestFollowingCode: c.Cell | null /* = null */
}

export const InitFollow = {
    PREFIX: 0x00001201,

    create(args: {
        queryId: uint64
        followerOwner: c.Address
        mintAmount?: coins /* = 0 */
        latestFollowingCode?: c.Cell | null /* = null */
    }): InitFollow {
        return {
            $: 'InitFollow',
            mintAmount: 0n,
            latestFollowingCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): InitFollow {
        loadAndCheckPrefix32(s, 0x00001201, 'InitFollow');
        return {
            $: 'InitFollow',
            queryId: s.loadUintBig(64),
            followerOwner: s.loadAddress(),
            mintAmount: s.loadCoins(),
            latestFollowingCode: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: InitFollow, b: c.Builder): void {
        b.storeUint(0x00001201, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.mintAmount);
        storeTolkNullable<c.Cell>(self.latestFollowingCode, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: InitFollow): c.Cell {
        return makeCellFrom<InitFollow>(self, InitFollow.store);
    }
}

/**
 > struct (0x00001204) SettleDeath {
 >     queryId: uint64
 >     deceased: address
 > }
 */
export interface SettleDeath {
    readonly $: 'SettleDeath'
    queryId: uint64
    deceased: c.Address
}

export const SettleDeath = {
    PREFIX: 0x00001204,

    create(args: {
        queryId: uint64
        deceased: c.Address
    }): SettleDeath {
        return {
            $: 'SettleDeath',
            ...args
        }
    },
    fromSlice(s: c.Slice): SettleDeath {
        loadAndCheckPrefix32(s, 0x00001204, 'SettleDeath');
        return {
            $: 'SettleDeath',
            queryId: s.loadUintBig(64),
            deceased: s.loadAddress(),
        }
    },
    store(self: SettleDeath, b: c.Builder): void {
        b.storeUint(0x00001204, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.deceased);
    },
    toCell(self: SettleDeath): c.Cell {
        return makeCellFrom<SettleDeath>(self, SettleDeath.store);
    }
}

/**
 > struct (0x00001208) FollowRevertedNotification {
 >     queryId: uint64
 >     reason: uint16
 >     followerOwner: address
 > }
 */
export interface FollowRevertedNotification {
    readonly $: 'FollowRevertedNotification'
    queryId: uint64
    reason: uint16
    followerOwner: c.Address
}

export const FollowRevertedNotification = {
    PREFIX: 0x00001208,

    create(args: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }): FollowRevertedNotification {
        return {
            $: 'FollowRevertedNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): FollowRevertedNotification {
        loadAndCheckPrefix32(s, 0x00001208, 'FollowRevertedNotification');
        return {
            $: 'FollowRevertedNotification',
            queryId: s.loadUintBig(64),
            reason: s.loadUintBig(16),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: FollowRevertedNotification, b: c.Builder): void {
        b.storeUint(0x00001208, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.reason, 16);
        b.storeAddress(self.followerOwner);
    },
    toCell(self: FollowRevertedNotification): c.Cell {
        return makeCellFrom<FollowRevertedNotification>(self, FollowRevertedNotification.store);
    }
}

/**
 > struct (0x00001209) UnfollowRevertedNotification {
 >     queryId: uint64
 >     reason: uint16
 >     followerOwner: address
 > }
 */
export interface UnfollowRevertedNotification {
    readonly $: 'UnfollowRevertedNotification'
    queryId: uint64
    reason: uint16
    followerOwner: c.Address
}

export const UnfollowRevertedNotification = {
    PREFIX: 0x00001209,

    create(args: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }): UnfollowRevertedNotification {
        return {
            $: 'UnfollowRevertedNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): UnfollowRevertedNotification {
        loadAndCheckPrefix32(s, 0x00001209, 'UnfollowRevertedNotification');
        return {
            $: 'UnfollowRevertedNotification',
            queryId: s.loadUintBig(64),
            reason: s.loadUintBig(16),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: UnfollowRevertedNotification, b: c.Builder): void {
        b.storeUint(0x00001209, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.reason, 16);
        b.storeAddress(self.followerOwner);
    },
    toCell(self: UnfollowRevertedNotification): c.Cell {
        return makeCellFrom<UnfollowRevertedNotification>(self, UnfollowRevertedNotification.store);
    }
}

/**
 > struct BaseFiWalletStore {
 >     owner: address
 >     minterAddr: address
 >     version: uint10
 > }
 */
export interface BaseFiWalletStore {
    readonly $: 'BaseFiWalletStore'
    owner: c.Address
    minterAddr: c.Address
    version: uint10 /* = 0 */
}

export const BaseFiWalletStore = {
    create(args: {
        owner: c.Address
        minterAddr: c.Address
        version?: uint10 /* = 0 */
    }): BaseFiWalletStore {
        return {
            $: 'BaseFiWalletStore',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): BaseFiWalletStore {
        return {
            $: 'BaseFiWalletStore',
            owner: s.loadAddress(),
            minterAddr: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: BaseFiWalletStore, b: c.Builder): void {
        b.storeAddress(self.owner);
        b.storeAddress(self.minterAddr);
        b.storeUint(self.version, 10);
    },
    toCell(self: BaseFiWalletStore): c.Cell {
        return makeCellFrom<BaseFiWalletStore>(self, BaseFiWalletStore.store);
    }
}

/**
 > struct NomInAddrs {
 >     nominee: address?
 >     invitor: address?
 >     invitor0: address?
 > }
 */
export interface NomInAddrs {
    readonly $: 'NomInAddrs'
    nominee: c.Address | null /* = null */
    invitor: c.Address | null /* = null */
    invitor0: c.Address | null /* = null */
}

export const NomInAddrs = {
    create(args: {
        nominee?: c.Address | null /* = null */
        invitor?: c.Address | null /* = null */
        invitor0?: c.Address | null /* = null */
    }): NomInAddrs {
        return {
            $: 'NomInAddrs',
            nominee: null,
            invitor: null,
            invitor0: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): NomInAddrs {
        return {
            $: 'NomInAddrs',
            nominee: s.loadMaybeAddress(),
            invitor: s.loadMaybeAddress(),
            invitor0: s.loadMaybeAddress(),
        }
    },
    store(self: NomInAddrs, b: c.Builder): void {
        b.storeAddress(self.nominee);
        b.storeAddress(self.invitor);
        b.storeAddress(self.invitor0);
    },
    toCell(self: NomInAddrs): c.Cell {
        return makeCellFrom<NomInAddrs>(self, NomInAddrs.store);
    }
}

/**
 > struct TrustedAddrs {
 >     minterAddr: address
 >     personalJettonMinter: address
 >     personalJettonWallet: address
 >     authorisedAccs: map<address, address>
 > }
 */
export interface TrustedAddrs {
    readonly $: 'TrustedAddrs'
    minterAddr: c.Address
    personalJettonMinter: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
    personalJettonWallet: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
    authorisedAccs: c.Dictionary<c.Address, c.Address> /* = [] as map<address, address> */
}

export const TrustedAddrs = {
    create(args: {
        minterAddr: c.Address
        personalJettonMinter?: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
        personalJettonWallet?: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
        authorisedAccs: c.Dictionary<c.Address, c.Address> /* = [] as map<address, address> */
    }): TrustedAddrs {
        return {
            $: 'TrustedAddrs',
            personalJettonMinter: c.Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'),
            personalJettonWallet: c.Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'),
            ...args
        }
    },
    fromSlice(s: c.Slice): TrustedAddrs {
        return {
            $: 'TrustedAddrs',
            minterAddr: s.loadAddress(),
            personalJettonMinter: s.loadAddress(),
            personalJettonWallet: s.loadAddress(),
            authorisedAccs: c.Dictionary.load<c.Address, c.Address>(c.Dictionary.Keys.Address(), createDictionaryValue<c.Address>(
                (s) => s.loadAddress(),
                (v,b) => b.storeAddress(v)
            ), s),
        }
    },
    store(self: TrustedAddrs, b: c.Builder): void {
        b.storeAddress(self.minterAddr);
        b.storeAddress(self.personalJettonMinter);
        b.storeAddress(self.personalJettonWallet);
        b.storeDict<c.Address, c.Address>(self.authorisedAccs, c.Dictionary.Keys.Address(), createDictionaryValue<c.Address>(
            (s) => s.loadAddress(),
            (v,b) => b.storeAddress(v)
        ));
    },
    toCell(self: TrustedAddrs): c.Cell {
        return makeCellFrom<TrustedAddrs>(self, TrustedAddrs.store);
    }
}

/**
 > struct Addresses {
 >     owner: address
 >     nomInAddrs: Cell<NomInAddrs>
 >     trustedJettonAddrs: Cell<TrustedAddrs>
 > }
 */
export interface Addresses {
    readonly $: 'Addresses'
    owner: c.Address
    nomInAddrs: CellRef<NomInAddrs>
    trustedJettonAddrs: CellRef<TrustedAddrs>
}

export const Addresses = {
    create(args: {
        owner: c.Address
        nomInAddrs: CellRef<NomInAddrs>
        trustedJettonAddrs: CellRef<TrustedAddrs>
    }): Addresses {
        return {
            $: 'Addresses',
            ...args
        }
    },
    fromSlice(s: c.Slice): Addresses {
        return {
            $: 'Addresses',
            owner: s.loadAddress(),
            nomInAddrs: loadCellRef<NomInAddrs>(s, NomInAddrs.fromSlice),
            trustedJettonAddrs: loadCellRef<TrustedAddrs>(s, TrustedAddrs.fromSlice),
        }
    },
    store(self: Addresses, b: c.Builder): void {
        b.storeAddress(self.owner);
        storeCellRef<NomInAddrs>(self.nomInAddrs, b, NomInAddrs.store);
        storeCellRef<TrustedAddrs>(self.trustedJettonAddrs, b, TrustedAddrs.store);
    },
    toCell(self: Addresses): c.Cell {
        return makeCellFrom<Addresses>(self, Addresses.store);
    }
}

/**
 > struct SocialMaps {
 >     votedFor: map<address, uint4>
 >     followingCount: uint32
 >     followersCount: uint32
 > }
 */
export interface SocialMaps {
    readonly $: 'SocialMaps'
    votedFor: c.Dictionary<c.Address, uint4> /* = [] as map<address, uint4> */
    followingCount: uint32 /* = 0 */
    followersCount: uint32 /* = 0 */
}

export const SocialMaps = {
    create(args: {
        votedFor: c.Dictionary<c.Address, uint4> /* = [] as map<address, uint4> */
        followingCount?: uint32 /* = 0 */
        followersCount?: uint32 /* = 0 */
    }): SocialMaps {
        return {
            $: 'SocialMaps',
            followingCount: 0n,
            followersCount: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): SocialMaps {
        return {
            $: 'SocialMaps',
            votedFor: c.Dictionary.load<c.Address, uint4>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(4), s),
            followingCount: s.loadUintBig(32),
            followersCount: s.loadUintBig(32),
        }
    },
    store(self: SocialMaps, b: c.Builder): void {
        b.storeDict<c.Address, uint4>(self.votedFor, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(4));
        b.storeUint(self.followingCount, 32);
        b.storeUint(self.followersCount, 32);
    },
    toCell(self: SocialMaps): c.Cell {
        return makeCellFrom<SocialMaps>(self, SocialMaps.store);
    }
}

/**
 > struct Maps {
 >     invited: map<address, coins>
 >     pocketMoney: map<address, Cell<PocketMoney>>
 >     social: Cell<SocialMaps>
 >     reportInfo: Cell<ReportInfo>
 > }
 */
export interface Maps {
    readonly $: 'Maps'
    invited: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
    pocketMoney: c.Dictionary<c.Address, CellRef<PocketMoney>> /* = [] as map<address, Cell<PocketMoney>> */
    social: CellRef<SocialMaps>
    reportInfo: CellRef<ReportInfo>
}

export const Maps = {
    create(args: {
        invited: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
        pocketMoney: c.Dictionary<c.Address, CellRef<PocketMoney>> /* = [] as map<address, Cell<PocketMoney>> */
        social: CellRef<SocialMaps>
        reportInfo: CellRef<ReportInfo>
    }): Maps {
        return {
            $: 'Maps',
            ...args
        }
    },
    fromSlice(s: c.Slice): Maps {
        return {
            $: 'Maps',
            invited: c.Dictionary.load<c.Address, coins>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4), s),
            pocketMoney: c.Dictionary.load<c.Address, CellRef<PocketMoney>>(c.Dictionary.Keys.Address(), createDictionaryValue<CellRef<PocketMoney>>(
                (s) => loadCellRef<PocketMoney>(s, PocketMoney.fromSlice),
                (v,b) => storeCellRef<PocketMoney>(v, b, PocketMoney.store)
            ), s),
            social: loadCellRef<SocialMaps>(s, SocialMaps.fromSlice),
            reportInfo: loadCellRef<ReportInfo>(s, ReportInfo.fromSlice),
        }
    },
    store(self: Maps, b: c.Builder): void {
        b.storeDict<c.Address, coins>(self.invited, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4));
        b.storeDict<c.Address, CellRef<PocketMoney>>(self.pocketMoney, c.Dictionary.Keys.Address(), createDictionaryValue<CellRef<PocketMoney>>(
            (s) => loadCellRef<PocketMoney>(s, PocketMoney.fromSlice),
            (v,b) => storeCellRef<PocketMoney>(v, b, PocketMoney.store)
        ));
        storeCellRef<SocialMaps>(self.social, b, SocialMaps.store);
        storeCellRef<ReportInfo>(self.reportInfo, b, ReportInfo.store);
    },
    toCell(self: Maps): c.Cell {
        return makeCellFrom<Maps>(self, Maps.store);
    }
}

/**
 > struct ReportInfo {
 >     reports: map<address, bool>
 >     tosBreach: bool
 >     reporterCount: uint10
 >     disputerCount: uint10
 >     reportResolutionTime: uint32
 > }
 */
export interface ReportInfo {
    readonly $: 'ReportInfo'
    reports: c.Dictionary<c.Address, boolean> /* = [] as map<address, bool> */
    tosBreach: boolean /* = false */
    reporterCount: uint10 /* = 0 */
    disputerCount: uint10 /* = 0 */
    reportResolutionTime: uint32 /* = 0 */
}

export const ReportInfo = {
    create(args: {
        reports: c.Dictionary<c.Address, boolean> /* = [] as map<address, bool> */
        tosBreach?: boolean /* = false */
        reporterCount?: uint10 /* = 0 */
        disputerCount?: uint10 /* = 0 */
        reportResolutionTime?: uint32 /* = 0 */
    }): ReportInfo {
        return {
            $: 'ReportInfo',
            tosBreach: false,
            reporterCount: 0n,
            disputerCount: 0n,
            reportResolutionTime: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ReportInfo {
        return {
            $: 'ReportInfo',
            reports: c.Dictionary.load<c.Address, boolean>(c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool(), s),
            tosBreach: s.loadBoolean(),
            reporterCount: s.loadUintBig(10),
            disputerCount: s.loadUintBig(10),
            reportResolutionTime: s.loadUintBig(32),
        }
    },
    store(self: ReportInfo, b: c.Builder): void {
        b.storeDict<c.Address, boolean>(self.reports, c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool());
        b.storeBit(self.tosBreach);
        b.storeUint(self.reporterCount, 10);
        b.storeUint(self.disputerCount, 10);
        b.storeUint(self.reportResolutionTime, 32);
    },
    toCell(self: ReportInfo): c.Cell {
        return makeCellFrom<ReportInfo>(self, ReportInfo.store);
    }
}

/**
 > struct TimeStamps {
 >     accountInit: uint32
 >     lastInvite: uint32
 >     lastClaim: uint32
 >     lastDecay: uint32
 >     creditCutoff: uint32
 > }
 */
export interface TimeStamps {
    readonly $: 'TimeStamps'
    accountInit: uint32 /* = 0 */
    lastInvite: uint32 /* = 0 */
    lastClaim: uint32 /* = 0 */
    lastDecay: uint32 /* = 0 */
    creditCutoff: uint32 /* = 0 */
}

export const TimeStamps = {
    create(args: {
        accountInit?: uint32 /* = 0 */
        lastInvite?: uint32 /* = 0 */
        lastClaim?: uint32 /* = 0 */
        lastDecay?: uint32 /* = 0 */
        creditCutoff?: uint32 /* = 0 */
    }): TimeStamps {
        return {
            $: 'TimeStamps',
            accountInit: 0n,
            lastInvite: 0n,
            lastClaim: 0n,
            lastDecay: 0n,
            creditCutoff: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): TimeStamps {
        return {
            $: 'TimeStamps',
            accountInit: s.loadUintBig(32),
            lastInvite: s.loadUintBig(32),
            lastClaim: s.loadUintBig(32),
            lastDecay: s.loadUintBig(32),
            creditCutoff: s.loadUintBig(32),
        }
    },
    store(self: TimeStamps, b: c.Builder): void {
        b.storeUint(self.accountInit, 32);
        b.storeUint(self.lastInvite, 32);
        b.storeUint(self.lastClaim, 32);
        b.storeUint(self.lastDecay, 32);
        b.storeUint(self.creditCutoff, 32);
    },
    toCell(self: TimeStamps): c.Cell {
        return makeCellFrom<TimeStamps>(self, TimeStamps.store);
    }
}

/**
 > struct ProfileInfo {
 >     username: string
 >     h3Cell: string
 >     country: uint16
 > }
 */
export interface ProfileInfo {
    readonly $: 'ProfileInfo'
    username: string /* = "" */
    h3Cell: string /* = "" */
    country: uint16 /* = 0 */
}

export const ProfileInfo = {
    create(args: {
        username?: string /* = "" */
        h3Cell?: string /* = "" */
        country?: uint16 /* = 0 */
    }): ProfileInfo {
        return {
            $: 'ProfileInfo',
            username: "",
            h3Cell: "",
            country: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ProfileInfo {
        return {
            $: 'ProfileInfo',
            username: s.loadStringRefTail(),
            h3Cell: s.loadStringRefTail(),
            country: s.loadUintBig(16),
        }
    },
    store(self: ProfileInfo, b: c.Builder): void {
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.h3Cell);
        b.storeUint(self.country, 16);
    },
    toCell(self: ProfileInfo): c.Cell {
        return makeCellFrom<ProfileInfo>(self, ProfileInfo.store);
    }
}

/**
 > struct FiWalletStore {
 >     jettonBalance: coins
 >     goldCoins: uint32
 >     txnCount: uint8
 >     status: uint2
 >     isAuthorityAccount: bool
 >     isPrevilegedAccount: bool
 >     creditNeed: coins
 >     creditMaturity: uint32
 >     multiplier: uint16
 >     accumulatedFees: coins
 >     debt: coins
 >     allowDeferred: bool
 >     votes: uint4
 >     receivedVotes: uint20
 >     connections: uint8
 >     active: bool
 >     mintable: bool
 >     version: uint10
 >     storeVersion: uint10
 >     profile: Cell<ProfileInfo>
 >     timestamps: Cell<TimeStamps>
 >     addresses: Cell<Addresses>
 >     maps: Cell<Maps>
 > }
 */
export interface FiWalletStore {
    readonly $: 'FiWalletStore'
    jettonBalance: coins /* = 0 */
    goldCoins: uint32 /* = 1 */
    txnCount: uint8 /* = 0 */
    status: uint2 /* = 0 */
    isAuthorityAccount: boolean /* = false */
    isPrevilegedAccount: boolean /* = false */
    creditNeed: coins /* = 0 */
    creditMaturity: uint32 /* = 0 */
    multiplier: uint16 /* = 1000 */
    accumulatedFees: coins /* = 0 */
    debt: coins /* = 0 */
    allowDeferred: boolean /* = false */
    votes: uint4 /* = 10 */
    receivedVotes: uint20 /* = 0 */
    connections: uint8 /* = 0 */
    active: boolean /* = false */
    mintable: boolean /* = true */
    version: uint10 /* = 0 */
    storeVersion: uint10 /* = 3 */
    profile: CellRef<ProfileInfo>
    timestamps: CellRef<TimeStamps>
    addresses: CellRef<Addresses>
    maps: CellRef<Maps>
}

export const FiWalletStore = {
    create(args: {
        jettonBalance?: coins /* = 0 */
        goldCoins?: uint32 /* = 1 */
        txnCount?: uint8 /* = 0 */
        status?: uint2 /* = 0 */
        isAuthorityAccount?: boolean /* = false */
        isPrevilegedAccount?: boolean /* = false */
        creditNeed?: coins /* = 0 */
        creditMaturity?: uint32 /* = 0 */
        multiplier?: uint16 /* = 1000 */
        accumulatedFees?: coins /* = 0 */
        debt?: coins /* = 0 */
        allowDeferred?: boolean /* = false */
        votes?: uint4 /* = 10 */
        receivedVotes?: uint20 /* = 0 */
        connections?: uint8 /* = 0 */
        active?: boolean /* = false */
        mintable?: boolean /* = true */
        version?: uint10 /* = 0 */
        storeVersion?: uint10 /* = 3 */
        profile: CellRef<ProfileInfo>
        timestamps: CellRef<TimeStamps>
        addresses: CellRef<Addresses>
        maps: CellRef<Maps>
    }): FiWalletStore {
        return {
            $: 'FiWalletStore',
            jettonBalance: 0n,
            goldCoins: 1n,
            txnCount: 0n,
            status: 0n,
            isAuthorityAccount: false,
            isPrevilegedAccount: false,
            creditNeed: 0n,
            creditMaturity: 0n,
            multiplier: 1000n,
            accumulatedFees: 0n,
            debt: 0n,
            allowDeferred: false,
            votes: 10n,
            receivedVotes: 0n,
            connections: 0n,
            active: false,
            mintable: true,
            version: 0n,
            storeVersion: 3n,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiWalletStore {
        return {
            $: 'FiWalletStore',
            jettonBalance: s.loadCoins(),
            goldCoins: s.loadUintBig(32),
            txnCount: s.loadUintBig(8),
            status: s.loadUintBig(2),
            isAuthorityAccount: s.loadBoolean(),
            isPrevilegedAccount: s.loadBoolean(),
            creditNeed: s.loadCoins(),
            creditMaturity: s.loadUintBig(32),
            multiplier: s.loadUintBig(16),
            accumulatedFees: s.loadCoins(),
            debt: s.loadCoins(),
            allowDeferred: s.loadBoolean(),
            votes: s.loadUintBig(4),
            receivedVotes: s.loadUintBig(20),
            connections: s.loadUintBig(8),
            active: s.loadBoolean(),
            mintable: s.loadBoolean(),
            version: s.loadUintBig(10),
            storeVersion: s.loadUintBig(10),
            profile: loadCellRef<ProfileInfo>(s, ProfileInfo.fromSlice),
            timestamps: loadCellRef<TimeStamps>(s, TimeStamps.fromSlice),
            addresses: loadCellRef<Addresses>(s, Addresses.fromSlice),
            maps: loadCellRef<Maps>(s, Maps.fromSlice),
        }
    },
    store(self: FiWalletStore, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeUint(self.goldCoins, 32);
        b.storeUint(self.txnCount, 8);
        b.storeUint(self.status, 2);
        b.storeBit(self.isAuthorityAccount);
        b.storeBit(self.isPrevilegedAccount);
        b.storeCoins(self.creditNeed);
        b.storeUint(self.creditMaturity, 32);
        b.storeUint(self.multiplier, 16);
        b.storeCoins(self.accumulatedFees);
        b.storeCoins(self.debt);
        b.storeBit(self.allowDeferred);
        b.storeUint(self.votes, 4);
        b.storeUint(self.receivedVotes, 20);
        b.storeUint(self.connections, 8);
        b.storeBit(self.active);
        b.storeBit(self.mintable);
        b.storeUint(self.version, 10);
        b.storeUint(self.storeVersion, 10);
        storeCellRef<ProfileInfo>(self.profile, b, ProfileInfo.store);
        storeCellRef<TimeStamps>(self.timestamps, b, TimeStamps.store);
        storeCellRef<Addresses>(self.addresses, b, Addresses.store);
        storeCellRef<Maps>(self.maps, b, Maps.store);
    },
    toCell(self: FiWalletStore): c.Cell {
        return makeCellFrom<FiWalletStore>(self, FiWalletStore.store);
    }
}

/**
 > struct (0x716a4d21) ClaimDeferredPayment {
 >     queryId: uint64
 > }
 */
export interface ClaimDeferredPayment {
    readonly $: 'ClaimDeferredPayment'
    queryId: uint64 /* = 0 */
}

export const ClaimDeferredPayment = {
    PREFIX: 0x716a4d21,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): ClaimDeferredPayment {
        return {
            $: 'ClaimDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimDeferredPayment {
        loadAndCheckPrefix32(s, 0x716a4d21, 'ClaimDeferredPayment');
        return {
            $: 'ClaimDeferredPayment',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimDeferredPayment, b: c.Builder): void {
        b.storeUint(0x716a4d21, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimDeferredPayment): c.Cell {
        return makeCellFrom<ClaimDeferredPayment>(self, ClaimDeferredPayment.store);
    }
}

/**
 > struct (0x38b4c81a) CancelDeferredPayment {
 >     queryId: uint64
 > }
 */
export interface CancelDeferredPayment {
    readonly $: 'CancelDeferredPayment'
    queryId: uint64 /* = 0 */
}

export const CancelDeferredPayment = {
    PREFIX: 0x38b4c81a,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): CancelDeferredPayment {
        return {
            $: 'CancelDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): CancelDeferredPayment {
        loadAndCheckPrefix32(s, 0x38b4c81a, 'CancelDeferredPayment');
        return {
            $: 'CancelDeferredPayment',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: CancelDeferredPayment, b: c.Builder): void {
        b.storeUint(0x38b4c81a, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: CancelDeferredPayment): c.Cell {
        return makeCellFrom<CancelDeferredPayment>(self, CancelDeferredPayment.store);
    }
}

/**
 > struct (0x24d8b9e1) PenalizeDeferredRequester {
 >     queryId: uint64
 >     payer: address
 >     amount: coins
 > }
 */
export interface PenalizeDeferredRequester {
    readonly $: 'PenalizeDeferredRequester'
    queryId: uint64 /* = 0 */
    payer: c.Address
    amount: coins
}

export const PenalizeDeferredRequester = {
    PREFIX: 0x24d8b9e1,

    create(args: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }): PenalizeDeferredRequester {
        return {
            $: 'PenalizeDeferredRequester',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PenalizeDeferredRequester {
        loadAndCheckPrefix32(s, 0x24d8b9e1, 'PenalizeDeferredRequester');
        return {
            $: 'PenalizeDeferredRequester',
            queryId: s.loadUintBig(64),
            payer: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: PenalizeDeferredRequester, b: c.Builder): void {
        b.storeUint(0x24d8b9e1, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.payer);
        b.storeCoins(self.amount);
    },
    toCell(self: PenalizeDeferredRequester): c.Cell {
        return makeCellFrom<PenalizeDeferredRequester>(self, PenalizeDeferredRequester.store);
    }
}

/**
 > struct (0x19a4f210) DeferredPaymentInitiated {
 >     queryId: uint64
 >     holdingAddress: address
 >     amount: coins
 > }
 */
export interface DeferredPaymentInitiated {
    readonly $: 'DeferredPaymentInitiated'
    queryId: uint64 /* = 0 */
    holdingAddress: c.Address
    amount: coins
}

export const DeferredPaymentInitiated = {
    PREFIX: 0x19a4f210,

    create(args: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
        amount: coins
    }): DeferredPaymentInitiated {
        return {
            $: 'DeferredPaymentInitiated',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): DeferredPaymentInitiated {
        loadAndCheckPrefix32(s, 0x19a4f210, 'DeferredPaymentInitiated');
        return {
            $: 'DeferredPaymentInitiated',
            queryId: s.loadUintBig(64),
            holdingAddress: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: DeferredPaymentInitiated, b: c.Builder): void {
        b.storeUint(0x19a4f210, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.holdingAddress);
        b.storeCoins(self.amount);
    },
    toCell(self: DeferredPaymentInitiated): c.Cell {
        return makeCellFrom<DeferredPaymentInitiated>(self, DeferredPaymentInitiated.store);
    }
}

/**
 > struct (0x49f2b801) PullDeferredFunds {
 >     queryId: uint64
 >     payee: address
 >     amount: coins
 > }
 */
export interface PullDeferredFunds {
    readonly $: 'PullDeferredFunds'
    queryId: uint64 /* = 0 */
    payee: c.Address
    amount: coins
}

export const PullDeferredFunds = {
    PREFIX: 0x49f2b801,

    create(args: {
        queryId?: uint64 /* = 0 */
        payee: c.Address
        amount: coins
    }): PullDeferredFunds {
        return {
            $: 'PullDeferredFunds',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PullDeferredFunds {
        loadAndCheckPrefix32(s, 0x49f2b801, 'PullDeferredFunds');
        return {
            $: 'PullDeferredFunds',
            queryId: s.loadUintBig(64),
            payee: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: PullDeferredFunds, b: c.Builder): void {
        b.storeUint(0x49f2b801, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.payee);
        b.storeCoins(self.amount);
    },
    toCell(self: PullDeferredFunds): c.Cell {
        return makeCellFrom<PullDeferredFunds>(self, PullDeferredFunds.store);
    }
}

/**
 > struct (0x6a1bc924) RequestDeferredPayment {
 >     queryId: uint64
 >     payer: address
 >     amount: coins
 > }
 */
export interface RequestDeferredPayment {
    readonly $: 'RequestDeferredPayment'
    queryId: uint64 /* = 0 */
    payer: c.Address
    amount: coins
}

export const RequestDeferredPayment = {
    PREFIX: 0x6a1bc924,

    create(args: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }): RequestDeferredPayment {
        return {
            $: 'RequestDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestDeferredPayment {
        loadAndCheckPrefix32(s, 0x6a1bc924, 'RequestDeferredPayment');
        return {
            $: 'RequestDeferredPayment',
            queryId: s.loadUintBig(64),
            payer: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: RequestDeferredPayment, b: c.Builder): void {
        b.storeUint(0x6a1bc924, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.payer);
        b.storeCoins(self.amount);
    },
    toCell(self: RequestDeferredPayment): c.Cell {
        return makeCellFrom<RequestDeferredPayment>(self, RequestDeferredPayment.store);
    }
}

/**
 > struct (0x7c49e102) ActCancelDeferredPayment {
 >     queryId: uint64
 >     holdingAddress: address
 > }
 */
export interface ActCancelDeferredPayment {
    readonly $: 'ActCancelDeferredPayment'
    queryId: uint64 /* = 0 */
    holdingAddress: c.Address
}

export const ActCancelDeferredPayment = {
    PREFIX: 0x7c49e102,

    create(args: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }): ActCancelDeferredPayment {
        return {
            $: 'ActCancelDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActCancelDeferredPayment {
        loadAndCheckPrefix32(s, 0x7c49e102, 'ActCancelDeferredPayment');
        return {
            $: 'ActCancelDeferredPayment',
            queryId: s.loadUintBig(64),
            holdingAddress: s.loadAddress(),
        }
    },
    store(self: ActCancelDeferredPayment, b: c.Builder): void {
        b.storeUint(0x7c49e102, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.holdingAddress);
    },
    toCell(self: ActCancelDeferredPayment): c.Cell {
        return makeCellFrom<ActCancelDeferredPayment>(self, ActCancelDeferredPayment.store);
    }
}

/**
 > struct (0x531b70a2) AcceptDeferredTransfer {
 >     queryId: uint64
 >     payer: address
 >     payee: address
 >     amount: coins
 > }
 */
export interface AcceptDeferredTransfer {
    readonly $: 'AcceptDeferredTransfer'
    queryId: uint64 /* = 0 */
    payer: c.Address
    payee: c.Address
    amount: coins
}

export const AcceptDeferredTransfer = {
    PREFIX: 0x531b70a2,

    create(args: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        payee: c.Address
        amount: coins
    }): AcceptDeferredTransfer {
        return {
            $: 'AcceptDeferredTransfer',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): AcceptDeferredTransfer {
        loadAndCheckPrefix32(s, 0x531b70a2, 'AcceptDeferredTransfer');
        return {
            $: 'AcceptDeferredTransfer',
            queryId: s.loadUintBig(64),
            payer: s.loadAddress(),
            payee: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: AcceptDeferredTransfer, b: c.Builder): void {
        b.storeUint(0x531b70a2, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.payer);
        b.storeAddress(self.payee);
        b.storeCoins(self.amount);
    },
    toCell(self: AcceptDeferredTransfer): c.Cell {
        return makeCellFrom<AcceptDeferredTransfer>(self, AcceptDeferredTransfer.store);
    }
}

/**
 > struct (0x1f84b29c) ActClaimDeferredPayment {
 >     queryId: uint64
 >     holdingAddress: address
 > }
 */
export interface ActClaimDeferredPayment {
    readonly $: 'ActClaimDeferredPayment'
    queryId: uint64 /* = 0 */
    holdingAddress: c.Address
}

export const ActClaimDeferredPayment = {
    PREFIX: 0x1f84b29c,

    create(args: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }): ActClaimDeferredPayment {
        return {
            $: 'ActClaimDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ActClaimDeferredPayment {
        loadAndCheckPrefix32(s, 0x1f84b29c, 'ActClaimDeferredPayment');
        return {
            $: 'ActClaimDeferredPayment',
            queryId: s.loadUintBig(64),
            holdingAddress: s.loadAddress(),
        }
    },
    store(self: ActClaimDeferredPayment, b: c.Builder): void {
        b.storeUint(0x1f84b29c, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.holdingAddress);
    },
    toCell(self: ActClaimDeferredPayment): c.Cell {
        return makeCellFrom<ActClaimDeferredPayment>(self, ActClaimDeferredPayment.store);
    }
}

/**
 > struct (0x576f30a1) ToggleDeferredPayment {
 >     queryId: uint64
 >     enabled: bool
 > }
 */
export interface ToggleDeferredPayment {
    readonly $: 'ToggleDeferredPayment'
    queryId: uint64 /* = 0 */
    enabled: boolean
}

export const ToggleDeferredPayment = {
    PREFIX: 0x576f30a1,

    create(args: {
        queryId?: uint64 /* = 0 */
        enabled: boolean
    }): ToggleDeferredPayment {
        return {
            $: 'ToggleDeferredPayment',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ToggleDeferredPayment {
        loadAndCheckPrefix32(s, 0x576f30a1, 'ToggleDeferredPayment');
        return {
            $: 'ToggleDeferredPayment',
            queryId: s.loadUintBig(64),
            enabled: s.loadBoolean(),
        }
    },
    store(self: ToggleDeferredPayment, b: c.Builder): void {
        b.storeUint(0x576f30a1, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.enabled);
    },
    toCell(self: ToggleDeferredPayment): c.Cell {
        return makeCellFrom<ToggleDeferredPayment>(self, ToggleDeferredPayment.store);
    }
}

/**
 > struct (0x00001198) EnterLottery {
 >     sender: address
 >     amount: coins
 > }
 */
export interface EnterLottery {
    readonly $: 'EnterLottery'
    sender: c.Address
    amount: coins
}

export const EnterLottery = {
    PREFIX: 0x00001198,

    create(args: {
        sender: c.Address
        amount: coins
    }): EnterLottery {
        return {
            $: 'EnterLottery',
            ...args
        }
    },
    fromSlice(s: c.Slice): EnterLottery {
        loadAndCheckPrefix32(s, 0x00001198, 'EnterLottery');
        return {
            $: 'EnterLottery',
            sender: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: EnterLottery, b: c.Builder): void {
        b.storeUint(0x00001198, 32);
        b.storeAddress(self.sender);
        b.storeCoins(self.amount);
    },
    toCell(self: EnterLottery): c.Cell {
        return makeCellFrom<EnterLottery>(self, EnterLottery.store);
    }
}

// ————————————————————————————————————————————
//    class FossFiWallet
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

export class FossFiWallet implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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AACQLOMPERIRKBESERERExERERAREhEQ4uMNERARKBEQERARExEQERAREhEQERAREREQbm9wAf5XLlYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBAMRKwMCESoCAREpAREo8AIRKdM/+kj6ADBWKSG+8uLF+JeCEAX14QC+8uK/ESlWKaHIz5HJlbmWE8s/UsD6UgERKfoChAP8Vy74ki/HBfLivFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBFYrBAMRKwMCESoCAREpAREo8AIRKdM/+kgw7UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHRiC3I+lIS+lKJ23FyA2TXLCAAAJA0jyHXLCAAAJAE4w8RJxEoEScREBEnERARERETEREREBESERDjDREnESgRJ3N0dQB6VxZXFlcWVxZXKhER0z/6APpIgggPQkDIz5HNi0JyFcs/UAP6AvpSzsnIz4UIUsD6Ulj6AnHPC2rMyXP7AAADACAAsM8WyXguVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1AhxwXy0sQKpFEQceMEghjo1KUQAMjPhYgc+lKBEgbPC47LP1Kw+lJQCvoCyYBQ+wAC/lcWVxZXFlcWVyr4kivHBRES0z/6SPpIMPiS7UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHRiCTI+lIS+lLPiACAyXglVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBREVk1cUf5QRFMMA4vLivCvCAPLi7wvbdgOI1ywgAACQPI8h1ywgAACQROMPEScRKBEnERARJxEQERERExERERAREhEQ4w0REhEoERIREhEnERIRERETEREREBESERCHiIkB/lcuVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEAxErAwIRKgIBESkBESjwAhEopBEp0z/6SPoAMBEpVimgggr68IBtyIvHvdl94AAAAAAAAAAYzxZWLPoCUvD6UlJA+lR3AGqlghjo1KUQAMjPkAAASB4Tyz8c+lJSwPpSAfoCycjPhYgBERMB+lJxzwtuARESAczJgFD7AALe9ADJyM+FCFJw+lJY+gJxzwtqzMly+wD4kvgoiCLI+lIS+lLPiACAyXiIyM+JiAFUc0LIz4PLBM+FoMzM+RaE97AGgAsk1yQzEs4Uy/eBFQzPC3kSzMzPkAAASAYUyz8S+lIBESn6AvQAyYEAkPsApHgBFP8A9KQT9LzyyAt5AgFiensCAsR8fQIBIIKDAvPX20Xb9/EjImHAQdqJofSR9JH0Aa4UAAmuWEAAASAZHZOuWEAAASAJHHmuWEAAAQC5HE5iZmfxJY4LJGL/L/EksY4LhgHF5cV56AmumEH2CaHaPdqn4hYZtmPAYQgeC44AK+XohifGGoAnxhoDkfSl9KSx9AWUAZPaqX5/AgFIgIEA9jX4kiLHBZF/l/iSI8cFwwDi8uK8A45KMgLTP/pIMIIK+vCAyM+FCBX6UlAE+gKBEgnPC4ohzws/z4gLvlIw+lLJc/sAyM+FCBL6UoESCc8Ljss/z4gLvvpSyYEAgvsA2zHhM3CLCMjOycjPhQhSMPpScc8LbszJgEL7AAD2NfiSIscFkX+X+JIjxwXDAOLy4rwE0z/6SDAEjkQ0ggr68IDIz4UIE/pSWPoCgRIIzwuKI88LP8+IC7pSIPpSyYAR+wDIz4UI+lKBEgjPC44Syz/PiAu6+lLJgQCC+wDbMeAwf4sIyM7JyM+FCBX6UnHPC24UzMmAUPsAAJOlXqZjjgqih44KKWPlxXgF5aW8Ba5YQAABIBnlf6Z+Y/SR9ABgB5H0pCX0pLH0BZ8Hk9qpFhGRnZORnwoQJfSk454W3ZmTAKH2AQA7phhh2omh9JH0kfQBpAGiB5H0pCX0pAP0BZQBk9qpAB290ndqJofSR9JH0AaQBowAI78pl2omh9JBj9JBj9ABjpAGjAA+AREoAfpSycjPhYhSMPpSz4QQc/oCcc8LZczJgED7AAAIAAAQ+wAazxYBERIByz/JgFD7AADwVxZXFlcWVxZXKhER008x+kgwKscFmCjCAJMIpQjejldWJ8IAlREnpREn3hEmghjo1KUQAKGCCvrwgIIY6NSlEABtbciLx73ZfeAAAAAAAAAACM8WUAP6AlLQ+lL6VPQAycjPhQhSQPpSWPoCcc8LaszJcvsAESbiA2bXLCAAAJBMjppXFlcWVxZXFlcqERHTTzH6SDAqxwWSCKTjDo8M1ywgAACQJOMPESYI4giKi4wD/lcuVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEVisEAxErAwIRKgIBESkBESjwAlYowgDy4u8RKKURKdM/+kj6SPoAMFYqIb6VESpWKqGbViqhAREgAaARH3DiVirCAOMP+JKhoqMA6BEnpFYcghjo1KUQALYIER1WHaGCGOjUpRAAAREeoREnViegVifCAI5Eggr68IBtbciLx73ZfeAAAAAAAAAAGM8WAREr+gJS0PpS+lQBESkB9ADJyM+FCFJA+lIBESn6AnHPC2oBESgBzMly+wCSVyfiEScIAv5XFlcWVxZXFlcqViORf5RWIsMA4hES0z8x+kgw+JLtRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdGII8j6UhL6Us+IAIDJeFEiyM+DywTPhaDMzPkWhPewE4ALUATXJMjPigBAzhLL989QxwUREpNXEX+UERHDAOLy4rxWJ8IA240D+NcsIAAAgsyOQDBXFVcVVxVXFVcp+JIqxwXy4rz4ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wCPItcsIAAAihzjDxEQESgREBEQERMREBEQERIREBEQEREREAXiERMRKBETESYREhETERKOj5AA/pURJ6URJ95WJoIY6NSlEAC+jhERJoIY6NSlEAChghjo1KUQAI4Vghjo1KUQAFYnoQERHQGgERwRJnAB4iDCAI47ggr68ID4km3Ii8e92X3gAAAAAAAAAAjPFlAE+gJS0PpS+lQS9ADJyM+FCFJA+lJY+gJxzwtqzMly+wCRMOIB+lcWVxZXFlcWVyr4kivHBfLgSRER0z8x+kjTAAGS0gCSbQHi0wABmfoA0x/TH4EAhpZtbW1YA3DiAdMAAZv6ANMf0x/TH4EAh5htAW1tbVgDcOIB0wABmvoA0x/XCx+BAIiVMG1tbXDiLW6zkX+VKcMAwwDikX+VJMMAwwDikQM21ywgAACKJI8N1ywgAACKLOMPBREmBeMNBREml5iZABgRERESEREREBERERAEtJF/lSDDAMMA4vKx+CMvVhaBAQv0Cm+hjhEwcG1tbXBtbW1tbSVtbW1tJOMNVh5uklcelT8OER0O4hEZmQIRGwJXGVcZ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');

    static Errors = {
        'Errors.BalanceError': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.MaxConnections': 250,
        'Errors.WrongWorkchain': 333,
        'Errors.IncorrectSender': 700,
        'Errors.AccountInactive': 702,
        'Errors.InsufficientGasSent': 703,
        'Errors.IncorrectReceiver': 708,
        'Errors.InsufficientBalance': 709,
        'Errors.AlreadyReported': 710,
        'Errors.AlreadyInvited': 723,
        'Errors.NoVotesAvailable': 731,
        'Errors.NotVotedYet': 732,
        'Errors.VersionMismatch': 734,
        'Errors.WaitMore': 735,
        'Errors.ProvideCoordinates': 738,
        'Errors.InviteFirst': 740,
        'FollowingErrors.NotFollowing': 751,
        'Errors.ProposalFeeInsufficient': 756,
        'Errors.CountryMismatch': 759,
        'Errors.CreditNeedExceeded': 760,
        'Errors.AccountInDebt': 761,
        'Errors.HasActiveVotes': 762,
        'Errors.CreditNotMatured': 763,
        'Errors.PersonalJettonNotRegistered': 764,
        'Errors.DeferredPaymentDisabled': 765,
        'Errors.PocketMoneyLocked': 767,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new FossFiWallet(address);
    }

    static fromStorage(emptyStorage: {
        owner: c.Address
        minterAddr: c.Address
        version?: uint10 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FossFiWallet.CodeCell,
            data: BaseFiWalletStore.toCell(BaseFiWalletStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FossFiWallet(address, initialState);
    }

    static createCellOfActClaimWeeklyGrant(body: {
        queryId: uint64
        sendExcessesTo: c.Address | null
    }) {
        return ActClaimWeeklyGrant.toCell(ActClaimWeeklyGrant.create(body));
    }

    static createCellOfActInvite(body: {
        queryId: uint64
        transferRecipient: c.Address
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }) {
        return ActInvite.toCell(ActInvite.create(body));
    }

    static createCellOfActVote(body: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }) {
        return ActVote.toCell(ActVote.create(body));
    }

    static createCellOfActUnvote(body: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }) {
        return ActUnvote.toCell(ActUnvote.create(body));
    }

    static createCellOfDnsBidRequest(body: {
        queryId: uint64
        domain: CellRef<RemainingBitsAndRefs>
        fiBidAmount: coins
        collectionAddress: c.Address
    }) {
        return DnsBidRequest.toCell(DnsBidRequest.create(body));
    }

    static createCellOfDnsRenewRequest(body: {
        queryId: uint64
        itemAddress: c.Address
        fiAmount: coins
    }) {
        return DnsRenewRequest.toCell(DnsRenewRequest.create(body));
    }

    static createCellOfDeActivateCircleRing(body: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }) {
        return DeActivateCircleRing.toCell(DeActivateCircleRing.create(body));
    }

    static createCellOfDeActivateCircleRingInternal(body: {
        version?: uint10 /* = 0 */
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }) {
        return DeActivateCircleRingInternal.toCell(DeActivateCircleRingInternal.create(body));
    }

    static createCellOfActDispatchAuthorityAction(body: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }) {
        return ActDispatchAuthorityAction.toCell(ActDispatchAuthorityAction.create(body));
    }

    static createCellOfActJoinLottery(body: {
    }) {
        return ActJoinLottery.toCell(ActJoinLottery.create());
    }

    static createCellOfActSetPersonalJetton(body: {
        personalJettonMinter: c.Address
        personalJettonWallet: c.Address
    }) {
        return ActSetPersonalJetton.toCell(ActSetPersonalJetton.create(body));
    }

    static createCellOfActDestroyAccount(body: {
    }) {
        return ActDestroyAccount.toCell(ActDestroyAccount.create());
    }

    static createCellOfActSubmitProposal(body: {
        queryId: uint64
        daoProxyAddress: c.Address
        targetMsg: c.Cell
        pollCode: c.Cell
    }) {
        return ActSubmitProposal.toCell(ActSubmitProposal.create(body));
    }

    static createCellOfActVoteProposal(body: {
        queryId: uint64
        pollAddress: c.Address
        proposalId: uint64
        vote: boolean
        oldVote?: boolean | null /* = null */
    }) {
        return ActVoteProposal.toCell(ActVoteProposal.create(body));
    }

    static createCellOfAskToTransfer(body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return AskToTransfer.toCell(AskToTransfer.create(body));
    }

    static createCellOfAskToBurn(body: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }) {
        return AskToBurn.toCell(AskToBurn.create(body));
    }

    static createCellOfBuyCredit(body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return BuyCredit.toCell(BuyCredit.create(body));
    }

    static createCellOfAuthorityAction(body: {
        version?: uint10 /* = 0 */
        sender: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }) {
        return AuthorityAction.toCell(AuthorityAction.create(body));
    }

    static createCellOfChangeProfile(body: {
        queryId?: uint64 /* = 0 */
        username?: string | null /* = null */
        h3Cell?: string | null /* = null */
        country?: uint16 | null /* = null */
        nominee?: c.Address | null /* = null */
    }) {
        return ChangeProfile.toCell(ChangeProfile.create(body));
    }

    static createCellOfInternalTransferStep(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        version?: uint10 /* = 0 */
        transferredAsCredit?: boolean /* = false */
        latestWalletCode?: c.Cell | null /* = null */
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return InternalTransferStep.toCell(InternalTransferStep.create(body));
    }

    static createCellOfInternalInvite(body: {
        queryId?: uint64 /* = 0 */
        version: uint10
        sender: c.Address
        invitor: c.Address
        latestFiWalletCode: c.Cell
        currentStorage: c.Cell | null
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }) {
        return InternalInvite.toCell(InternalInvite.create(body));
    }

    static createCellOfPayback(body: {
        queryId: uint64
        amount: coins
        sender: c.Address
        swapTargetOwner?: c.Address | null /* = null */
    }) {
        return Payback.toCell(Payback.create(body));
    }

    static createCellOfRequestState(body: {
    }) {
        return RequestState.toCell(RequestState.create());
    }

    static createCellOfRequestUpgradeCode(body: {
        targetAddress?: c.Address | null /* = null */
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    static createCellOfSetStatus(body: {
        sender: c.Address
        status: uint2
    }) {
        return SetStatus.toCell(SetStatus.create(body));
    }

    static createCellOfTopUpTons(body: {
        latestFiWalletCode?: c.Cell | null /* = null */
    }) {
        return TopUpTons.toCell(TopUpTons.create(body));
    }

    static createCellOfTransferNotificationForRecipient(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body));
    }

    static createCellOfUpgrade(body: {
        walletUpgrade?: boolean /* = true */
        walletVersion: uint10
        sender: c.Address
        newData?: c.Cell | null /* = null */
        newCode?: c.Cell | null /* = null */
    }) {
        return Upgrade.toCell(Upgrade.create(body));
    }

    static createCellOfVotingAction(body: {
        version?: uint10 /* = 0 */
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
        country?: uint16 /* = 0 */
    }) {
        return VotingAction.toCell(VotingAction.create(body));
    }

    static createCellOfEnterLottery(body: {
        sender: c.Address
        amount: coins
    }) {
        return EnterLottery.toCell(EnterLottery.create(body));
    }

    static createCellOfFollow(body: {
        queryId: uint64
        followee: c.Address
    }) {
        return Follow.toCell(Follow.create(body));
    }

    static createCellOfUnfollow(body: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }) {
        return Unfollow.toCell(Unfollow.create(body));
    }

    static createCellOfRequestFollow(body: {
        queryId: uint64
        followerOwner: c.Address
        mintAmount: coins
    }) {
        return RequestFollow.toCell(RequestFollow.create(body));
    }

    static createCellOfRequestUnfollow(body: {
        queryId: uint64
        initiator: c.Address
        followerOwner: c.Address
        burnAmount: coins
    }) {
        return RequestUnfollow.toCell(RequestUnfollow.create(body));
    }

    static createCellOfFollowRevertedNotification(body: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }) {
        return FollowRevertedNotification.toCell(FollowRevertedNotification.create(body));
    }

    static createCellOfUnfollowRevertedNotification(body: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }) {
        return UnfollowRevertedNotification.toCell(UnfollowRevertedNotification.create(body));
    }

    static createCellOfSettleDeath(body: {
        queryId: uint64
        deceased: c.Address
    }) {
        return SettleDeath.toCell(SettleDeath.create(body));
    }

    static createCellOfDestroy(body: {
    }) {
        return Destroy.toCell(Destroy.create());
    }

    static createCellOfSetPocketMoney(body: {
        queryId: uint64
        grantee: c.Address
        unrestricted?: boolean | null /* = null */
        oneTime?: OneTimePocketMoney | null /* = null */
        fixedRecurring?: FixedRecurringConfig | null /* = null */
        openRecurring?: OpenRecurringConfig | null /* = null */
    }) {
        return SetPocketMoney.toCell(SetPocketMoney.create(body));
    }

    static createCellOfSpendPocketMoney(body: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return SpendPocketMoney.toCell(SpendPocketMoney.create(body));
    }

    static createCellOfAskGoldCoinsTransfer(body: {
        queryId: uint64
        amount: uint32
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return AskGoldCoinsTransfer.toCell(AskGoldCoinsTransfer.create(body));
    }

    static createCellOfInternalGoldCoinsTransfer(body: {
        queryId: uint64
        amount: uint32
        version?: uint10 /* = 0 */
        transferInitiator: c.Address
    }) {
        return InternalGoldCoinsTransfer.toCell(InternalGoldCoinsTransfer.create(body));
    }

    static createCellOfTriggerDecay(body: {
        sender: c.Address
    }) {
        return TriggerDecay.toCell(TriggerDecay.create(body));
    }

    static createCellOfActPayEmi(body: {
        queryId?: uint64 /* = 0 */
        sendExcessesTo?: c.Address | null /* = null */
    }) {
        return ActPayEmi.toCell(ActPayEmi.create(body));
    }

    static createCellOfTriggerDefaultEmi(body: {
        queryId?: uint64 /* = 0 */
        sender: c.Address
    }) {
        return TriggerDefaultEmi.toCell(TriggerDefaultEmi.create(body));
    }

    static createCellOfSetLoanRequirement(body: {
        queryId?: uint64 /* = 0 */
        amount?: coins | null /* = null */
        maturityDate?: uint32 | null /* = null */
        cutoffDate?: uint32 | null /* = null */
        multiplier?: uint16 | null /* = null */
    }) {
        return SetLoanRequirement.toCell(SetLoanRequirement.create(body));
    }

    static createCellOfRepayDebt(body: {
        queryId?: uint64 /* = 0 */
        amount: coins
    }) {
        return RepayDebt.toCell(RepayDebt.create(body));
    }

    static createCellOfActCloseAccount(body: {
        queryId?: uint64 /* = 0 */
    }) {
        return ActCloseAccount.toCell(ActCloseAccount.create(body));
    }

    static createCellOfAuthorityCloseAccount(body: {
        queryId?: uint64 /* = 0 */
        target: c.Address
    }) {
        return AuthorityCloseAccount.toCell(AuthorityCloseAccount.create(body));
    }

    static createCellOfRequestDeferredPayment(body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }) {
        return RequestDeferredPayment.toCell(RequestDeferredPayment.create(body));
    }

    static createCellOfPullDeferredFunds(body: {
        queryId?: uint64 /* = 0 */
        payee: c.Address
        amount: coins
    }) {
        return PullDeferredFunds.toCell(PullDeferredFunds.create(body));
    }

    static createCellOfDeferredPaymentInitiated(body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
        amount: coins
    }) {
        return DeferredPaymentInitiated.toCell(DeferredPaymentInitiated.create(body));
    }

    static createCellOfPenalizeDeferredRequester(body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }) {
        return PenalizeDeferredRequester.toCell(PenalizeDeferredRequester.create(body));
    }

    static createCellOfActCancelDeferredPayment(body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }) {
        return ActCancelDeferredPayment.toCell(ActCancelDeferredPayment.create(body));
    }

    static createCellOfActClaimDeferredPayment(body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }) {
        return ActClaimDeferredPayment.toCell(ActClaimDeferredPayment.create(body));
    }

    static createCellOfAcceptDeferredTransfer(body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        payee: c.Address
        amount: coins
    }) {
        return AcceptDeferredTransfer.toCell(AcceptDeferredTransfer.create(body));
    }

    static createCellOfToggleDeferredPayment(body: {
        queryId?: uint64 /* = 0 */
        enabled: boolean
    }) {
        return ToggleDeferredPayment.toCell(ToggleDeferredPayment.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendActClaimWeeklyGrant(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActClaimWeeklyGrant.toCell(ActClaimWeeklyGrant.create(body)),
            ...extraOptions
        });
    }

    async sendActInvite(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        transferRecipient: c.Address
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActInvite.toCell(ActInvite.create(body)),
            ...extraOptions
        });
    }

    async sendActVote(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActVote.toCell(ActVote.create(body)),
            ...extraOptions
        });
    }

    async sendActUnvote(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
        count?: uint4 /* = 1 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActUnvote.toCell(ActUnvote.create(body)),
            ...extraOptions
        });
    }

    async sendDnsBidRequest(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        domain: CellRef<RemainingBitsAndRefs>
        fiBidAmount: coins
        collectionAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DnsBidRequest.toCell(DnsBidRequest.create(body)),
            ...extraOptions
        });
    }

    async sendDnsRenewRequest(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        itemAddress: c.Address
        fiAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DnsRenewRequest.toCell(DnsRenewRequest.create(body)),
            ...extraOptions
        });
    }

    async sendDeActivateCircleRing(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DeActivateCircleRing.toCell(DeActivateCircleRing.create(body)),
            ...extraOptions
        });
    }

    async sendDeActivateCircleRingInternal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        version?: uint10 /* = 0 */
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DeActivateCircleRingInternal.toCell(DeActivateCircleRingInternal.create(body)),
            ...extraOptions
        });
    }

    async sendActDispatchAuthorityAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActDispatchAuthorityAction.toCell(ActDispatchAuthorityAction.create(body)),
            ...extraOptions
        });
    }

    async sendActJoinLottery(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActJoinLottery.toCell(ActJoinLottery.create()),
            ...extraOptions
        });
    }

    async sendActSetPersonalJetton(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        personalJettonMinter: c.Address
        personalJettonWallet: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActSetPersonalJetton.toCell(ActSetPersonalJetton.create(body)),
            ...extraOptions
        });
    }

    async sendActDestroyAccount(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActDestroyAccount.toCell(ActDestroyAccount.create()),
            ...extraOptions
        });
    }

    async sendActSubmitProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        daoProxyAddress: c.Address
        targetMsg: c.Cell
        pollCode: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActSubmitProposal.toCell(ActSubmitProposal.create(body)),
            ...extraOptions
        });
    }

    async sendActVoteProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        pollAddress: c.Address
        proposalId: uint64
        vote: boolean
        oldVote?: boolean | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActVoteProposal.toCell(ActVoteProposal.create(body)),
            ...extraOptions
        });
    }

    async sendAskToTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToTransfer.toCell(AskToTransfer.create(body)),
            ...extraOptions
        });
    }

    async sendAskToBurn(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToBurn.toCell(AskToBurn.create(body)),
            ...extraOptions
        });
    }

    async sendBuyCredit(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BuyCredit.toCell(BuyCredit.create(body)),
            ...extraOptions
        });
    }

    async sendAuthorityAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        version?: uint10 /* = 0 */
        sender: c.Address
        fundsReceiver?: c.Address | null /* = null */
        amount?: coins /* = 0 */
        toggleActive?: boolean /* = true */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AuthorityAction.toCell(AuthorityAction.create(body)),
            ...extraOptions
        });
    }

    async sendChangeProfile(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        username?: string | null /* = null */
        h3Cell?: string | null /* = null */
        country?: uint16 | null /* = null */
        nominee?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeProfile.toCell(ChangeProfile.create(body)),
            ...extraOptions
        });
    }

    async sendInternalTransferStep(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        version?: uint10 /* = 0 */
        transferredAsCredit?: boolean /* = false */
        latestWalletCode?: c.Cell | null /* = null */
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalTransferStep.toCell(InternalTransferStep.create(body)),
            ...extraOptions
        });
    }

    async sendInternalInvite(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        version: uint10
        sender: c.Address
        invitor: c.Address
        latestFiWalletCode: c.Cell
        currentStorage: c.Cell | null
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalInvite.toCell(InternalInvite.create(body)),
            ...extraOptions
        });
    }

    async sendPayback(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        sender: c.Address
        swapTargetOwner?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Payback.toCell(Payback.create(body)),
            ...extraOptions
        });
    }

    async sendRequestState(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestState.toCell(RequestState.create()),
            ...extraOptions
        });
    }

    async sendRequestUpgradeCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        targetAddress?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUpgradeCode.toCell(RequestUpgradeCode.create(body)),
            ...extraOptions
        });
    }

    async sendSetStatus(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        sender: c.Address
        status: uint2
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetStatus.toCell(SetStatus.create(body)),
            ...extraOptions
        });
    }

    async sendTopUpTons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        latestFiWalletCode?: c.Cell | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUpTons.toCell(TopUpTons.create(body)),
            ...extraOptions
        });
    }

    async sendTransferNotificationForRecipient(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body)),
            ...extraOptions
        });
    }

    async sendUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        walletUpgrade?: boolean /* = true */
        walletVersion: uint10
        sender: c.Address
        newData?: c.Cell | null /* = null */
        newCode?: c.Cell | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Upgrade.toCell(Upgrade.create(body)),
            ...extraOptions
        });
    }

    async sendVotingAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        version?: uint10 /* = 0 */
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
        country?: uint16 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: VotingAction.toCell(VotingAction.create(body)),
            ...extraOptions
        });
    }

    async sendEnterLottery(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        sender: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: EnterLottery.toCell(EnterLottery.create(body)),
            ...extraOptions
        });
    }

    async sendFollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        followee: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Follow.toCell(Follow.create(body)),
            ...extraOptions
        });
    }

    async sendUnfollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Unfollow.toCell(Unfollow.create(body)),
            ...extraOptions
        });
    }

    async sendRequestFollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        followerOwner: c.Address
        mintAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestFollow.toCell(RequestFollow.create(body)),
            ...extraOptions
        });
    }

    async sendRequestUnfollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        initiator: c.Address
        followerOwner: c.Address
        burnAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUnfollow.toCell(RequestUnfollow.create(body)),
            ...extraOptions
        });
    }

    async sendFollowRevertedNotification(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FollowRevertedNotification.toCell(FollowRevertedNotification.create(body)),
            ...extraOptions
        });
    }

    async sendUnfollowRevertedNotification(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UnfollowRevertedNotification.toCell(UnfollowRevertedNotification.create(body)),
            ...extraOptions
        });
    }

    async sendSettleDeath(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        deceased: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SettleDeath.toCell(SettleDeath.create(body)),
            ...extraOptions
        });
    }

    async sendDestroy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Destroy.toCell(Destroy.create()),
            ...extraOptions
        });
    }

    async sendSetPocketMoney(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        grantee: c.Address
        unrestricted?: boolean | null /* = null */
        oneTime?: OneTimePocketMoney | null /* = null */
        fixedRecurring?: FixedRecurringConfig | null /* = null */
        openRecurring?: OpenRecurringConfig | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetPocketMoney.toCell(SetPocketMoney.create(body)),
            ...extraOptions
        });
    }

    async sendSpendPocketMoney(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SpendPocketMoney.toCell(SpendPocketMoney.create(body)),
            ...extraOptions
        });
    }

    async sendAskGoldCoinsTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: uint32
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskGoldCoinsTransfer.toCell(AskGoldCoinsTransfer.create(body)),
            ...extraOptions
        });
    }

    async sendInternalGoldCoinsTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: uint32
        version?: uint10 /* = 0 */
        transferInitiator: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalGoldCoinsTransfer.toCell(InternalGoldCoinsTransfer.create(body)),
            ...extraOptions
        });
    }

    async sendTriggerDecay(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        sender: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TriggerDecay.toCell(TriggerDecay.create(body)),
            ...extraOptions
        });
    }

    async sendActPayEmi(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        sendExcessesTo?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActPayEmi.toCell(ActPayEmi.create(body)),
            ...extraOptions
        });
    }

    async sendTriggerDefaultEmi(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        sender: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TriggerDefaultEmi.toCell(TriggerDefaultEmi.create(body)),
            ...extraOptions
        });
    }

    async sendSetLoanRequirement(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        amount?: coins | null /* = null */
        maturityDate?: uint32 | null /* = null */
        cutoffDate?: uint32 | null /* = null */
        multiplier?: uint16 | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetLoanRequirement.toCell(SetLoanRequirement.create(body)),
            ...extraOptions
        });
    }

    async sendRepayDebt(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RepayDebt.toCell(RepayDebt.create(body)),
            ...extraOptions
        });
    }

    async sendActCloseAccount(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActCloseAccount.toCell(ActCloseAccount.create(body)),
            ...extraOptions
        });
    }

    async sendAuthorityCloseAccount(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        target: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AuthorityCloseAccount.toCell(AuthorityCloseAccount.create(body)),
            ...extraOptions
        });
    }

    async sendRequestDeferredPayment(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestDeferredPayment.toCell(RequestDeferredPayment.create(body)),
            ...extraOptions
        });
    }

    async sendPullDeferredFunds(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        payee: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: PullDeferredFunds.toCell(PullDeferredFunds.create(body)),
            ...extraOptions
        });
    }

    async sendDeferredPaymentInitiated(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DeferredPaymentInitiated.toCell(DeferredPaymentInitiated.create(body)),
            ...extraOptions
        });
    }

    async sendPenalizeDeferredRequester(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: PenalizeDeferredRequester.toCell(PenalizeDeferredRequester.create(body)),
            ...extraOptions
        });
    }

    async sendActCancelDeferredPayment(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActCancelDeferredPayment.toCell(ActCancelDeferredPayment.create(body)),
            ...extraOptions
        });
    }

    async sendActClaimDeferredPayment(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        holdingAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActClaimDeferredPayment.toCell(ActClaimDeferredPayment.create(body)),
            ...extraOptions
        });
    }

    async sendAcceptDeferredTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        payer: c.Address
        payee: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AcceptDeferredTransfer.toCell(AcceptDeferredTransfer.create(body)),
            ...extraOptions
        });
    }

    async sendToggleDeferredPayment(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        enabled: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ToggleDeferredPayment.toCell(ToggleDeferredPayment.create(body)),
            ...extraOptions
        });
    }

    async getHoldingCode(provider: ContractProvider): Promise<c.Cell> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_holding_code', []));
        return r.readCell();
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

    async getWalletDataAll(provider: ContractProvider): Promise<FiWalletStore> {
        const r = StackReader.fromGetMethod(23, await provider.get('get_wallet_data_all', []));
        return ({
            $: 'FiWalletStore',
            jettonBalance: r.readBigInt(),
            goldCoins: r.readBigInt(),
            txnCount: r.readBigInt(),
            status: r.readBigInt(),
            isAuthorityAccount: r.readBoolean(),
            isPrevilegedAccount: r.readBoolean(),
            creditNeed: r.readBigInt(),
            creditMaturity: r.readBigInt(),
            multiplier: r.readBigInt(),
            accumulatedFees: r.readBigInt(),
            debt: r.readBigInt(),
            allowDeferred: r.readBoolean(),
            votes: r.readBigInt(),
            receivedVotes: r.readBigInt(),
            connections: r.readBigInt(),
            active: r.readBoolean(),
            mintable: r.readBoolean(),
            version: r.readBigInt(),
            storeVersion: r.readBigInt(),
            profile: r.readCellRef<ProfileInfo>(ProfileInfo.fromSlice),
            timestamps: r.readCellRef<TimeStamps>(TimeStamps.fromSlice),
            addresses: r.readCellRef<Addresses>(Addresses.fromSlice),
            maps: r.readCellRef<Maps>(Maps.fromSlice),
        });
    }

    async getUsername(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_username', []));
        return r.readSnakeString();
    }

    async getH3Cell(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_h3_cell', []));
        return r.readSnakeString();
    }

    async getProfile(provider: ContractProvider): Promise<[
        string,
        string,
        uint16,
    ]> {
        const r = StackReader.fromGetMethod(3, await provider.get('get_profile', []));
        return [
            r.readSnakeString(),
            r.readSnakeString(),
            r.readBigInt(),
        ];
    }

    async getFollowingCount(provider: ContractProvider): Promise<uint32> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_following_count', []));
        return r.readBigInt();
    }

    async getFollowersCount(provider: ContractProvider): Promise<uint32> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_followers_count', []));
        return r.readBigInt();
    }

    async getPocketMoney(provider: ContractProvider, grantee: c.Address): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_pocket_money', [
            { type: 'slice', cell: makeCellFrom<c.Address>(grantee,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readBigInt();
    }

    async getPocketMoneyData(provider: ContractProvider, grantee: c.Address): Promise<PocketMoney> {
        const r = StackReader.fromGetMethod(16, await provider.get('get_pocket_money_data', [
            { type: 'slice', cell: makeCellFrom<c.Address>(grantee,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return ({
            $: 'PocketMoney',
            unrestricted: r.readBoolean(),
            oneTime: r.readWideNullable<OneTimePocketMoney>(4,
                (r) => ({
                    $: 'OneTimePocketMoney',
                    remaining: r.readBigInt(),
                    startTime: r.readBigInt(),
                    validUntil: r.readBigInt(),
                })
            ),
            fixedRecurring: r.readWideNullable<FixedRecurringPocketMoney>(6,
                (r) => ({
                    $: 'FixedRecurringPocketMoney',
                    limit: r.readBigInt(),
                    spent: r.readBigInt(),
                    period: r.readBigInt(),
                    startTime: r.readBigInt(),
                    validUntil: r.readBigInt(),
                })
            ),
            openRecurring: r.readWideNullable<OpenRecurringPocketMoney>(5,
                (r) => ({
                    $: 'OpenRecurringPocketMoney',
                    limit: r.readBigInt(),
                    spent: r.readBigInt(),
                    period: r.readBigInt(),
                    startTime: r.readBigInt(),
                })
            ),
        });
    }

    async getCreditCutoff(provider: ContractProvider): Promise<uint32> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_credit_cutoff', []));
        return r.readBigInt();
    }
}
