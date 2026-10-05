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
 > }
 */
export interface MintNewJettons {
    readonly $: 'MintNewJettons'
    queryId: uint64
    mintRecipient: c.Address
    tonAmount: coins
    internalTransferMsg: CellRef<InternalTransferStep>
}

export const MintNewJettons = {
    PREFIX: 0x00001001,

    create(args: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }): MintNewJettons {
        return {
            $: 'MintNewJettons',
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
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x00001001, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.mintRecipient);
        b.storeCoins(self.tonAmount);
        storeCellRef<InternalTransferStep>(self.internalTransferMsg, b, InternalTransferStep.store);
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
 >     multiplier: uint16?
 > }
 */
export interface SetLoanRequirement {
    readonly $: 'SetLoanRequirement'
    queryId: uint64 /* = 0 */
    amount: coins | null /* = null */
    maturityDate: uint32 | null /* = null */
    multiplier: uint16 | null /* = null */
}

export const SetLoanRequirement = {
    PREFIX: 0x0000114a,

    create(args: {
        queryId?: uint64 /* = 0 */
        amount?: coins | null /* = null */
        maturityDate?: uint32 | null /* = null */
        multiplier?: uint16 | null /* = null */
    }): SetLoanRequirement {
        return {
            $: 'SetLoanRequirement',
            queryId: 0n,
            amount: null,
            maturityDate: null,
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
 > }
 */
export interface TimeStamps {
    readonly $: 'TimeStamps'
    accountInit: uint32 /* = 0 */
    lastInvite: uint32 /* = 0 */
    lastClaim: uint32 /* = 0 */
    lastDecay: uint32 /* = 0 */
}

export const TimeStamps = {
    create(args: {
        accountInit?: uint32 /* = 0 */
        lastInvite?: uint32 /* = 0 */
        lastClaim?: uint32 /* = 0 */
        lastDecay?: uint32 /* = 0 */
    }): TimeStamps {
        return {
            $: 'TimeStamps',
            accountInit: 0n,
            lastInvite: 0n,
            lastClaim: 0n,
            lastDecay: 0n,
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
        }
    },
    store(self: TimeStamps, b: c.Builder): void {
        b.storeUint(self.accountInit, 32);
        b.storeUint(self.lastInvite, 32);
        b.storeUint(self.lastClaim, 32);
        b.storeUint(self.lastDecay, 32);
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
    storeVersion: uint10 /* = 0 */
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
        storeVersion?: uint10 /* = 0 */
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
            storeVersion: 0n,
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
    static CodeCell = c.Cell.fromBase64('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');

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
}
