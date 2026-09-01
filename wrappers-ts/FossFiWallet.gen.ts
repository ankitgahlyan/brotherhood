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
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
}

export const TopUpTons = {
    PREFIX: 0x00001007,

    create(): TopUpTons {
        return {
            $: 'TopUpTons',
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0x00001007, 'TopUpTons');
        return {
            $: 'TopUpTons',
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0x00001007, 32);
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

/**
 > struct (0x00001008) RequestUpgradeCode {
 >     sender: address
 >     version: uint10
 > }
 */
export interface RequestUpgradeCode {
    readonly $: 'RequestUpgradeCode'
    sender: c.Address
    version: uint10
}

export const RequestUpgradeCode = {
    PREFIX: 0x00001008,

    create(args: {
        sender: c.Address
        version: uint10
    }): RequestUpgradeCode {
        return {
            $: 'RequestUpgradeCode',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestUpgradeCode {
        loadAndCheckPrefix32(s, 0x00001008, 'RequestUpgradeCode');
        return {
            $: 'RequestUpgradeCode',
            sender: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: RequestUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00001008, 32);
        b.storeAddress(self.sender);
        b.storeUint(self.version, 10);
    },
    toCell(self: RequestUpgradeCode): c.Cell {
        return makeCellFrom<RequestUpgradeCode>(self, RequestUpgradeCode.store);
    }
}

/**
 > struct (0x0000100b) HotUpgrade {
 >     additionalData: cell?
 >     code: cell
 > }
 */
export interface HotUpgrade {
    readonly $: 'HotUpgrade'
    additionalData: c.Cell | null
    code: c.Cell
}

export const HotUpgrade = {
    PREFIX: 0x0000100b,

    create(args: {
        additionalData: c.Cell | null
        code: c.Cell
    }): HotUpgrade {
        return {
            $: 'HotUpgrade',
            ...args
        }
    },
    fromSlice(s: c.Slice): HotUpgrade {
        loadAndCheckPrefix32(s, 0x0000100b, 'HotUpgrade');
        return {
            $: 'HotUpgrade',
            additionalData: s.loadBoolean() ? s.loadRef() : null,
            code: s.loadRef(),
        }
    },
    store(self: HotUpgrade, b: c.Builder): void {
        b.storeUint(0x0000100b, 32);
        storeTolkNullable<c.Cell>(self.additionalData, b,
            (v,b) => b.storeRef(v)
        );
        b.storeRef(self.code);
    },
    toCell(self: HotUpgrade): c.Cell {
        return makeCellFrom<HotUpgrade>(self, HotUpgrade.store);
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
 >     currentWalletCode: cell
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
    currentWalletCode: c.Cell
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
        currentWalletCode: c.Cell
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
            currentWalletCode: s.loadRef(),
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
        b.storeRef(self.currentWalletCode);
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
 > struct (0x00001055) ActDeactivate {
 >     transferRecipient: address
 > }
 */
export interface ActDeactivate {
    readonly $: 'ActDeactivate'
    transferRecipient: c.Address
}

export const ActDeactivate = {
    PREFIX: 0x00001055,

    create(args: {
        transferRecipient: c.Address
    }): ActDeactivate {
        return {
            $: 'ActDeactivate',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActDeactivate {
        loadAndCheckPrefix32(s, 0x00001055, 'ActDeactivate');
        return {
            $: 'ActDeactivate',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActDeactivate, b: c.Builder): void {
        b.storeUint(0x00001055, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActDeactivate): c.Cell {
        return makeCellFrom<ActDeactivate>(self, ActDeactivate.store);
    }
}

/**
 > struct (0x00001056) InternalDeActivate {
 > }
 */
export interface InternalDeActivate {
    readonly $: 'InternalDeActivate'
}

export const InternalDeActivate = {
    PREFIX: 0x00001056,

    create(): InternalDeActivate {
        return {
            $: 'InternalDeActivate',
        }
    },
    fromSlice(s: c.Slice): InternalDeActivate {
        loadAndCheckPrefix32(s, 0x00001056, 'InternalDeActivate');
        return {
            $: 'InternalDeActivate',
        }
    },
    store(self: InternalDeActivate, b: c.Builder): void {
        b.storeUint(0x00001056, 32);
    },
    toCell(self: InternalDeActivate): c.Cell {
        return makeCellFrom<InternalDeActivate>(self, InternalDeActivate.store);
    }
}

/**
 > struct (0x00001057) ActRequestUpgrade {
 > }
 */
export interface ActRequestUpgrade {
    readonly $: 'ActRequestUpgrade'
}

export const ActRequestUpgrade = {
    PREFIX: 0x00001057,

    create(): ActRequestUpgrade {
        return {
            $: 'ActRequestUpgrade',
        }
    },
    fromSlice(s: c.Slice): ActRequestUpgrade {
        loadAndCheckPrefix32(s, 0x00001057, 'ActRequestUpgrade');
        return {
            $: 'ActRequestUpgrade',
        }
    },
    store(self: ActRequestUpgrade, b: c.Builder): void {
        b.storeUint(0x00001057, 32);
    },
    toCell(self: ActRequestUpgrade): c.Cell {
        return makeCellFrom<ActRequestUpgrade>(self, ActRequestUpgrade.store);
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
 > struct (0x000010a1) ChangeUsername {
 >     newUsername: string
 > }
 */
export interface ChangeUsername {
    readonly $: 'ChangeUsername'
    newUsername: string
}

export const ChangeUsername = {
    PREFIX: 0x000010a1,

    create(args: {
        newUsername: string
    }): ChangeUsername {
        return {
            $: 'ChangeUsername',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeUsername {
        loadAndCheckPrefix32(s, 0x000010a1, 'ChangeUsername');
        return {
            $: 'ChangeUsername',
            newUsername: s.loadStringRefTail(),
        }
    },
    store(self: ChangeUsername, b: c.Builder): void {
        b.storeUint(0x000010a1, 32);
        b.storeStringRefTail(self.newUsername);
    },
    toCell(self: ChangeUsername): c.Cell {
        return makeCellFrom<ChangeUsername>(self, ChangeUsername.store);
    }
}

/**
 > struct (0x000010a2) ChangeLocation {
 >     queryId: uint64
 >     newH3Cell: string
 > }
 */
export interface ChangeLocation {
    readonly $: 'ChangeLocation'
    queryId: uint64 /* = 0 */
    newH3Cell: string
}

export const ChangeLocation = {
    PREFIX: 0x000010a2,

    create(args: {
        queryId?: uint64 /* = 0 */
        newH3Cell: string
    }): ChangeLocation {
        return {
            $: 'ChangeLocation',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeLocation {
        loadAndCheckPrefix32(s, 0x000010a2, 'ChangeLocation');
        return {
            $: 'ChangeLocation',
            queryId: s.loadUintBig(64),
            newH3Cell: s.loadStringRefTail(),
        }
    },
    store(self: ChangeLocation, b: c.Builder): void {
        b.storeUint(0x000010a2, 32);
        b.storeUint(self.queryId, 64);
        b.storeStringRefTail(self.newH3Cell);
    },
    toCell(self: ChangeLocation): c.Cell {
        return makeCellFrom<ChangeLocation>(self, ChangeLocation.store);
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
 > struct (0x000010a8) ChangeCountry {
 >     queryId: uint64
 >     newCountry: uint16
 > }
 */
export interface ChangeCountry {
    readonly $: 'ChangeCountry'
    queryId: uint64 /* = 0 */
    newCountry: uint16
}

export const ChangeCountry = {
    PREFIX: 0x000010a8,

    create(args: {
        queryId?: uint64 /* = 0 */
        newCountry: uint16
    }): ChangeCountry {
        return {
            $: 'ChangeCountry',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeCountry {
        loadAndCheckPrefix32(s, 0x000010a8, 'ChangeCountry');
        return {
            $: 'ChangeCountry',
            queryId: s.loadUintBig(64),
            newCountry: s.loadUintBig(16),
        }
    },
    store(self: ChangeCountry, b: c.Builder): void {
        b.storeUint(0x000010a8, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.newCountry, 16);
    },
    toCell(self: ChangeCountry): c.Cell {
        return makeCellFrom<ChangeCountry>(self, ChangeCountry.store);
    }
}

/**
 > struct (0x000010f1) ActVote {
 >     transferRecipient: address
 > }
 */
export interface ActVote {
    readonly $: 'ActVote'
    transferRecipient: c.Address
}

export const ActVote = {
    PREFIX: 0x000010f1,

    create(args: {
        transferRecipient: c.Address
    }): ActVote {
        return {
            $: 'ActVote',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActVote {
        loadAndCheckPrefix32(s, 0x000010f1, 'ActVote');
        return {
            $: 'ActVote',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActVote, b: c.Builder): void {
        b.storeUint(0x000010f1, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActVote): c.Cell {
        return makeCellFrom<ActVote>(self, ActVote.store);
    }
}

/**
 > struct (0x000010f2) ActUnvote {
 >     transferRecipient: address
 > }
 */
export interface ActUnvote {
    readonly $: 'ActUnvote'
    transferRecipient: c.Address
}

export const ActUnvote = {
    PREFIX: 0x000010f2,

    create(args: {
        transferRecipient: c.Address
    }): ActUnvote {
        return {
            $: 'ActUnvote',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActUnvote {
        loadAndCheckPrefix32(s, 0x000010f2, 'ActUnvote');
        return {
            $: 'ActUnvote',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActUnvote, b: c.Builder): void {
        b.storeUint(0x000010f2, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActUnvote): c.Cell {
        return makeCellFrom<ActUnvote>(self, ActUnvote.store);
    }
}

/**
 > struct (0x000010f3) VotingAction {
 >     positiveVote: bool
 >     count: uint4
 >     sender: address
 >     country: uint16
 > }
 */
export interface VotingAction {
    readonly $: 'VotingAction'
    positiveVote: boolean /* = true */
    count: uint4 /* = 10 */
    sender: c.Address
    country: uint16 /* = 0 */
}

export const VotingAction = {
    PREFIX: 0x000010f3,

    create(args: {
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
        country?: uint16 /* = 0 */
    }): VotingAction {
        return {
            $: 'VotingAction',
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
            positiveVote: s.loadBoolean(),
            count: s.loadUintBig(4),
            sender: s.loadAddress(),
            country: s.loadUintBig(16),
        }
    },
    store(self: VotingAction, b: c.Builder): void {
        b.storeUint(0x000010f3, 32);
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
 > }
 */
export interface ActDispatchAuthorityAction {
    readonly $: 'ActDispatchAuthorityAction'
    transferRecipient: c.Address
}

export const ActDispatchAuthorityAction = {
    PREFIX: 0x000010f4,

    create(args: {
        transferRecipient: c.Address
    }): ActDispatchAuthorityAction {
        return {
            $: 'ActDispatchAuthorityAction',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActDispatchAuthorityAction {
        loadAndCheckPrefix32(s, 0x000010f4, 'ActDispatchAuthorityAction');
        return {
            $: 'ActDispatchAuthorityAction',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActDispatchAuthorityAction, b: c.Builder): void {
        b.storeUint(0x000010f4, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActDispatchAuthorityAction): c.Cell {
        return makeCellFrom<ActDispatchAuthorityAction>(self, ActDispatchAuthorityAction.store);
    }
}

/**
 > struct (0x000010f5) AuthorityAction {
 >     sender: address
 > }
 */
export interface AuthorityAction {
    readonly $: 'AuthorityAction'
    sender: c.Address
}

export const AuthorityAction = {
    PREFIX: 0x000010f5,

    create(args: {
        sender: c.Address
    }): AuthorityAction {
        return {
            $: 'AuthorityAction',
            ...args
        }
    },
    fromSlice(s: c.Slice): AuthorityAction {
        loadAndCheckPrefix32(s, 0x000010f5, 'AuthorityAction');
        return {
            $: 'AuthorityAction',
            sender: s.loadAddress(),
        }
    },
    store(self: AuthorityAction, b: c.Builder): void {
        b.storeUint(0x000010f5, 32);
        b.storeAddress(self.sender);
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
 > struct (0x00001142) TriggerDecay {
 >     sender: address
 > }
 */
export interface TriggerDecay {
    readonly $: 'TriggerDecay'
    sender: c.Address
}

export const TriggerDecay = {
    PREFIX: 0x00001142,

    create(args: {
        sender: c.Address
    }): TriggerDecay {
        return {
            $: 'TriggerDecay',
            ...args
        }
    },
    fromSlice(s: c.Slice): TriggerDecay {
        loadAndCheckPrefix32(s, 0x00001142, 'TriggerDecay');
        return {
            $: 'TriggerDecay',
            sender: s.loadAddress(),
        }
    },
    store(self: TriggerDecay, b: c.Builder): void {
        b.storeUint(0x00001142, 32);
        b.storeAddress(self.sender);
    },
    toCell(self: TriggerDecay): c.Cell {
        return makeCellFrom<TriggerDecay>(self, TriggerDecay.store);
    }
}

/**
 > struct (0x00001143) SetAllowance {
 >     queryId: uint64
 >     grantee: address
 >     amount: coins
 > }
 */
export interface SetAllowance {
    readonly $: 'SetAllowance'
    queryId: uint64
    grantee: c.Address
    amount: coins
}

export const SetAllowance = {
    PREFIX: 0x00001143,

    create(args: {
        queryId: uint64
        grantee: c.Address
        amount: coins
    }): SetAllowance {
        return {
            $: 'SetAllowance',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetAllowance {
        loadAndCheckPrefix32(s, 0x00001143, 'SetAllowance');
        return {
            $: 'SetAllowance',
            queryId: s.loadUintBig(64),
            grantee: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: SetAllowance, b: c.Builder): void {
        b.storeUint(0x00001143, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.grantee);
        b.storeCoins(self.amount);
    },
    toCell(self: SetAllowance): c.Cell {
        return makeCellFrom<SetAllowance>(self, SetAllowance.store);
    }
}

/**
 > struct (0x00001144) SpendAllowance {
 >     queryId: uint64
 >     amount: coins
 >     receiver: address
 >     sendExcessesTo: address?
 > }
 */
export interface SpendAllowance {
    readonly $: 'SpendAllowance'
    queryId: uint64
    amount: coins
    receiver: c.Address
    sendExcessesTo: c.Address | null
}

export const SpendAllowance = {
    PREFIX: 0x00001144,

    create(args: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }): SpendAllowance {
        return {
            $: 'SpendAllowance',
            ...args
        }
    },
    fromSlice(s: c.Slice): SpendAllowance {
        loadAndCheckPrefix32(s, 0x00001144, 'SpendAllowance');
        return {
            $: 'SpendAllowance',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            receiver: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: SpendAllowance, b: c.Builder): void {
        b.storeUint(0x00001144, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.receiver);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: SpendAllowance): c.Cell {
        return makeCellFrom<SpendAllowance>(self, SpendAllowance.store);
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
 >     transferInitiator: address
 > }
 */
export interface InternalGoldCoinsTransfer {
    readonly $: 'InternalGoldCoinsTransfer'
    queryId: uint64
    amount: uint32
    transferInitiator: c.Address
}

export const InternalGoldCoinsTransfer = {
    PREFIX: 0x00001146,

    create(args: {
        queryId: uint64
        amount: uint32
        transferInitiator: c.Address
    }): InternalGoldCoinsTransfer {
        return {
            $: 'InternalGoldCoinsTransfer',
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalGoldCoinsTransfer {
        loadAndCheckPrefix32(s, 0x00001146, 'InternalGoldCoinsTransfer');
        return {
            $: 'InternalGoldCoinsTransfer',
            queryId: s.loadUintBig(64),
            amount: s.loadUintBig(32),
            transferInitiator: s.loadAddress(),
        }
    },
    store(self: InternalGoldCoinsTransfer, b: c.Builder): void {
        b.storeUint(0x00001146, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.amount, 32);
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
 > }
 */
export interface Payback {
    readonly $: 'Payback'
    queryId: uint64
    amount: coins
    sender: c.Address
}

export const Payback = {
    PREFIX: 0x00001148,

    create(args: {
        queryId: uint64
        amount: coins
        sender: c.Address
    }): Payback {
        return {
            $: 'Payback',
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
        }
    },
    store(self: Payback, b: c.Builder): void {
        b.storeUint(0x00001148, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.sender);
    },
    toCell(self: Payback): c.Cell {
        return makeCellFrom<Payback>(self, Payback.store);
    }
}

/**
 > struct (0x00001149) ActSetPersonalJettonMinter {
 >     transferRecipient: address
 > }
 */
export interface ActSetPersonalJettonMinter {
    readonly $: 'ActSetPersonalJettonMinter'
    transferRecipient: c.Address
}

export const ActSetPersonalJettonMinter = {
    PREFIX: 0x00001149,

    create(args: {
        transferRecipient: c.Address
    }): ActSetPersonalJettonMinter {
        return {
            $: 'ActSetPersonalJettonMinter',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActSetPersonalJettonMinter {
        loadAndCheckPrefix32(s, 0x00001149, 'ActSetPersonalJettonMinter');
        return {
            $: 'ActSetPersonalJettonMinter',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActSetPersonalJettonMinter, b: c.Builder): void {
        b.storeUint(0x00001149, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActSetPersonalJettonMinter): c.Cell {
        return makeCellFrom<ActSetPersonalJettonMinter>(self, ActSetPersonalJettonMinter.store);
    }
}

/**
 > struct (0x0000114a) SetCreditNeed {
 >     queryId: uint64
 >     amount: coins
 >     maturityDate: uint32
 > }
 */
export interface SetCreditNeed {
    readonly $: 'SetCreditNeed'
    queryId: uint64 /* = 0 */
    amount: coins
    maturityDate: uint32 /* = 0 */
}

export const SetCreditNeed = {
    PREFIX: 0x0000114a,

    create(args: {
        queryId?: uint64 /* = 0 */
        amount: coins
        maturityDate?: uint32 /* = 0 */
    }): SetCreditNeed {
        return {
            $: 'SetCreditNeed',
            queryId: 0n,
            maturityDate: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): SetCreditNeed {
        loadAndCheckPrefix32(s, 0x0000114a, 'SetCreditNeed');
        return {
            $: 'SetCreditNeed',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            maturityDate: s.loadUintBig(32),
        }
    },
    store(self: SetCreditNeed, b: c.Builder): void {
        b.storeUint(0x0000114a, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeUint(self.maturityDate, 32);
    },
    toCell(self: SetCreditNeed): c.Cell {
        return makeCellFrom<SetCreditNeed>(self, SetCreditNeed.store);
    }
}

/**
 > struct (0x0000114c) SetMultiplier {
 >     queryId: uint64
 >     multiplier: uint16
 > }
 */
export interface SetMultiplier {
    readonly $: 'SetMultiplier'
    queryId: uint64 /* = 0 */
    multiplier: uint16
}

export const SetMultiplier = {
    PREFIX: 0x0000114c,

    create(args: {
        queryId?: uint64 /* = 0 */
        multiplier: uint16
    }): SetMultiplier {
        return {
            $: 'SetMultiplier',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): SetMultiplier {
        loadAndCheckPrefix32(s, 0x0000114c, 'SetMultiplier');
        return {
            $: 'SetMultiplier',
            queryId: s.loadUintBig(64),
            multiplier: s.loadUintBig(16),
        }
    },
    store(self: SetMultiplier, b: c.Builder): void {
        b.storeUint(0x0000114c, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.multiplier, 16);
    },
    toCell(self: SetMultiplier): c.Cell {
        return makeCellFrom<SetMultiplier>(self, SetMultiplier.store);
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
 > }
 */
export interface InitFollow {
    readonly $: 'InitFollow'
    queryId: uint64
    followerOwner: c.Address
}

export const InitFollow = {
    PREFIX: 0x00001201,

    create(args: {
        queryId: uint64
        followerOwner: c.Address
    }): InitFollow {
        return {
            $: 'InitFollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): InitFollow {
        loadAndCheckPrefix32(s, 0x00001201, 'InitFollow');
        return {
            $: 'InitFollow',
            queryId: s.loadUintBig(64),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: InitFollow, b: c.Builder): void {
        b.storeUint(0x00001201, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followerOwner);
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
 >     allowances: map<address, coins>
 >     social: Cell<SocialMaps>
 >     reportInfo: Cell<ReportInfo>
 > }
 */
export interface Maps {
    readonly $: 'Maps'
    invited: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
    allowances: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
    social: CellRef<SocialMaps>
    reportInfo: CellRef<ReportInfo>
}

export const Maps = {
    create(args: {
        invited: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
        allowances: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
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
            allowances: c.Dictionary.load<c.Address, coins>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4), s),
            social: loadCellRef<SocialMaps>(s, SocialMaps.fromSlice),
            reportInfo: loadCellRef<ReportInfo>(s, ReportInfo.fromSlice),
        }
    },
    store(self: Maps, b: c.Builder): void {
        b.storeDict<c.Address, coins>(self.invited, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4));
        b.storeDict<c.Address, coins>(self.allowances, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4));
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
 >     debts: bool
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
    multiplier: uint16 /* = 1 */
    accumulatedFees: coins /* = 0 */
    debt: coins /* = 0 */
    debts: boolean /* = false */
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
        multiplier?: uint16 /* = 1 */
        accumulatedFees?: coins /* = 0 */
        debt?: coins /* = 0 */
        debts?: boolean /* = false */
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
            multiplier: 1n,
            accumulatedFees: 0n,
            debt: 0n,
            debts: false,
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
            debts: s.loadBoolean(),
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
        b.storeBit(self.debts);
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
        jettonBalance?: coins /* = 0 */
        goldCoins?: uint32 /* = 1 */
        txnCount?: uint8 /* = 0 */
        status?: uint2 /* = 0 */
        isAuthorityAccount?: boolean /* = false */
        isPrevilegedAccount?: boolean /* = false */
        creditNeed?: coins /* = 0 */
        creditMaturity?: uint32 /* = 0 */
        multiplier?: uint16 /* = 1 */
        accumulatedFees?: coins /* = 0 */
        debt?: coins /* = 0 */
        debts?: boolean /* = false */
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
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FossFiWallet.CodeCell,
            data: FiWalletStore.toCell(FiWalletStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FossFiWallet(address, initialState);
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
        sender: c.Address
    }) {
        return AuthorityAction.toCell(AuthorityAction.create(body));
    }

    static createCellOfChangeUsername(body: {
        newUsername: string
    }) {
        return ChangeUsername.toCell(ChangeUsername.create(body));
    }

    static createCellOfChangeLocation(body: {
        queryId?: uint64 /* = 0 */
        newH3Cell: string
    }) {
        return ChangeLocation.toCell(ChangeLocation.create(body));
    }

    static createCellOfChangeCountry(body: {
        queryId?: uint64 /* = 0 */
        newCountry: uint16
    }) {
        return ChangeCountry.toCell(ChangeCountry.create(body));
    }

    static createCellOfInternalTransferStep(body: {
        queryId: uint64
        jettonAmount: coins
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return InternalTransferStep.toCell(InternalTransferStep.create(body));
    }

    static createCellOfInternalInvite(body: {
        queryId?: uint64 /* = 0 */
        version: uint10
        sender: c.Address
        invitor: c.Address
        currentWalletCode: c.Cell
        currentStorage: c.Cell | null
        username: string
        h3Cell: string
        country?: uint16 /* = 0 */
    }) {
        return InternalInvite.toCell(InternalInvite.create(body));
    }

    static createCellOfInternalDeActivate(body: {
    }) {
        return InternalDeActivate.toCell(InternalDeActivate.create());
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
    }) {
        return ActVote.toCell(ActVote.create(body));
    }

    static createCellOfActUnvote(body: {
        transferRecipient: c.Address
    }) {
        return ActUnvote.toCell(ActUnvote.create(body));
    }

    static createCellOfActDeactivate(body: {
        transferRecipient: c.Address
    }) {
        return ActDeactivate.toCell(ActDeactivate.create(body));
    }

    static createCellOfActRequestUpgrade(body: {
    }) {
        return ActRequestUpgrade.toCell(ActRequestUpgrade.create());
    }

    static createCellOfActDispatchAuthorityAction(body: {
        transferRecipient: c.Address
    }) {
        return ActDispatchAuthorityAction.toCell(ActDispatchAuthorityAction.create(body));
    }

    static createCellOfActJoinLottery(body: {
    }) {
        return ActJoinLottery.toCell(ActJoinLottery.create());
    }

    static createCellOfActSetPersonalJettonMinter(body: {
        transferRecipient: c.Address
    }) {
        return ActSetPersonalJettonMinter.toCell(ActSetPersonalJettonMinter.create(body));
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

    static createCellOfPayback(body: {
        queryId: uint64
        amount: coins
        sender: c.Address
    }) {
        return Payback.toCell(Payback.create(body));
    }

    static createCellOfRequestState(body: {
    }) {
        return RequestState.toCell(RequestState.create());
    }

    static createCellOfRequestUpgradeCode(body: {
        sender: c.Address
        version: uint10
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
    }) {
        return TopUpTons.toCell(TopUpTons.create());
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

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
    }

    static createCellOfVotingAction(body: {
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

    static createCellOfSetAllowance(body: {
        queryId: uint64
        grantee: c.Address
        amount: coins
    }) {
        return SetAllowance.toCell(SetAllowance.create(body));
    }

    static createCellOfSpendAllowance(body: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return SpendAllowance.toCell(SpendAllowance.create(body));
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
        transferInitiator: c.Address
    }) {
        return InternalGoldCoinsTransfer.toCell(InternalGoldCoinsTransfer.create(body));
    }

    static createCellOfTriggerDecay(body: {
        sender: c.Address
    }) {
        return TriggerDecay.toCell(TriggerDecay.create(body));
    }

    static createCellOfSetCreditNeed(body: {
        queryId?: uint64 /* = 0 */
        amount: coins
        maturityDate?: uint32 /* = 0 */
    }) {
        return SetCreditNeed.toCell(SetCreditNeed.create(body));
    }

    static createCellOfSetMultiplier(body: {
        queryId?: uint64 /* = 0 */
        multiplier: uint16
    }) {
        return SetMultiplier.toCell(SetMultiplier.create(body));
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
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
        sender: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AuthorityAction.toCell(AuthorityAction.create(body)),
            ...extraOptions
        });
    }

    async sendChangeUsername(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        newUsername: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeUsername.toCell(ChangeUsername.create(body)),
            ...extraOptions
        });
    }

    async sendChangeLocation(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        newH3Cell: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeLocation.toCell(ChangeLocation.create(body)),
            ...extraOptions
        });
    }

    async sendChangeCountry(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        newCountry: uint16
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeCountry.toCell(ChangeCountry.create(body)),
            ...extraOptions
        });
    }

    async sendInternalTransferStep(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
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
        currentWalletCode: c.Cell
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

    async sendInternalDeActivate(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalDeActivate.toCell(InternalDeActivate.create()),
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
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActVote.toCell(ActVote.create(body)),
            ...extraOptions
        });
    }

    async sendActUnvote(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActUnvote.toCell(ActUnvote.create(body)),
            ...extraOptions
        });
    }

    async sendActDeactivate(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActDeactivate.toCell(ActDeactivate.create(body)),
            ...extraOptions
        });
    }

    async sendActRequestUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActRequestUpgrade.toCell(ActRequestUpgrade.create()),
            ...extraOptions
        });
    }

    async sendActDispatchAuthorityAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
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

    async sendActSetPersonalJettonMinter(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        transferRecipient: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActSetPersonalJettonMinter.toCell(ActSetPersonalJettonMinter.create(body)),
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

    async sendPayback(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        sender: c.Address
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
        sender: c.Address
        version: uint10
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
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUpTons.toCell(TopUpTons.create()),
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

    async sendHotUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        additionalData: c.Cell | null
        code: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: HotUpgrade.toCell(HotUpgrade.create(body)),
            ...extraOptions
        });
    }

    async sendVotingAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
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

    async sendSetAllowance(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        grantee: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetAllowance.toCell(SetAllowance.create(body)),
            ...extraOptions
        });
    }

    async sendSpendAllowance(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        receiver: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SpendAllowance.toCell(SpendAllowance.create(body)),
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

    async sendSetCreditNeed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        amount: coins
        maturityDate?: uint32 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetCreditNeed.toCell(SetCreditNeed.create(body)),
            ...extraOptions
        });
    }

    async sendSetMultiplier(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        multiplier: uint16
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetMultiplier.toCell(SetMultiplier.create(body)),
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
            debts: r.readBoolean(),
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
}
