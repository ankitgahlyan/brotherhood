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
 > struct (0x00001051) ActInvite {
 >     queryId: uint64
 >     transferRecipient: address
 >     username: string
 >     city: string
 >     cityLetter: uint8
 > }
 */
export interface ActInvite {
    readonly $: 'ActInvite'
    queryId: uint64
    transferRecipient: c.Address
    username: string
    city: string
    cityLetter: uint8 /* = 0 */
}

export const ActInvite = {
    PREFIX: 0x00001051,

    create(args: {
        queryId: uint64
        transferRecipient: c.Address
        username: string
        city: string
        cityLetter?: uint8 /* = 0 */
    }): ActInvite {
        return {
            $: 'ActInvite',
            cityLetter: 0n,
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
            city: s.loadStringRefTail(),
            cityLetter: s.loadUintBig(8),
        }
    },
    store(self: ActInvite, b: c.Builder): void {
        b.storeUint(0x00001051, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.transferRecipient);
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.city);
        b.storeUint(self.cityLetter, 8);
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
 >     city: string
 >     cityLetter: uint8
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
    city: string
    cityLetter: uint8 /* = 0 */
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
        city: string
        cityLetter?: uint8 /* = 0 */
    }): InternalInvite {
        return {
            $: 'InternalInvite',
            queryId: 0n,
            cityLetter: 0n,
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
            city: s.loadStringRefTail(),
            cityLetter: s.loadUintBig(8),
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
        b.storeStringRefTail(self.city);
        b.storeUint(self.cityLetter, 8);
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
 >     city: string
 >     cityLetter: uint8
 > }
 */
export interface InformMinterInviteInternal {
    readonly $: 'InformMinterInviteInternal'
    queryId: uint64
    sender: c.Address
    invitor: c.Address
    username: string
    city: string
    cityLetter: uint8 /* = 0 */
}

export const InformMinterInviteInternal = {
    PREFIX: 0x00001054,

    create(args: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        username: string
        city: string
        cityLetter?: uint8 /* = 0 */
    }): InformMinterInviteInternal {
        return {
            $: 'InformMinterInviteInternal',
            cityLetter: 0n,
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
            city: s.loadStringRefTail(),
            cityLetter: s.loadUintBig(8),
        }
    },
    store(self: InformMinterInviteInternal, b: c.Builder): void {
        b.storeUint(0x00001054, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.city);
        b.storeUint(self.cityLetter, 8);
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
 > struct (0x000010a2) ChangeCity {
 >     queryId: uint64
 >     newCity: string
 >     oldCityLetter: uint8
 >     newCityLetter: uint8
 > }
 */
export interface ChangeCity {
    readonly $: 'ChangeCity'
    queryId: uint64 /* = 0 */
    newCity: string
    oldCityLetter: uint8 /* = 0 */
    newCityLetter: uint8 /* = 0 */
}

export const ChangeCity = {
    PREFIX: 0x000010a2,

    create(args: {
        queryId?: uint64 /* = 0 */
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }): ChangeCity {
        return {
            $: 'ChangeCity',
            queryId: 0n,
            oldCityLetter: 0n,
            newCityLetter: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeCity {
        loadAndCheckPrefix32(s, 0x000010a2, 'ChangeCity');
        return {
            $: 'ChangeCity',
            queryId: s.loadUintBig(64),
            newCity: s.loadStringRefTail(),
            oldCityLetter: s.loadUintBig(8),
            newCityLetter: s.loadUintBig(8),
        }
    },
    store(self: ChangeCity, b: c.Builder): void {
        b.storeUint(0x000010a2, 32);
        b.storeUint(self.queryId, 64);
        b.storeStringRefTail(self.newCity);
        b.storeUint(self.oldCityLetter, 8);
        b.storeUint(self.newCityLetter, 8);
    },
    toCell(self: ChangeCity): c.Cell {
        return makeCellFrom<ChangeCity>(self, ChangeCity.store);
    }
}

/**
 > struct (0x000010a3) InformMinterChangeCity {
 >     queryId: uint64
 >     owner: address
 >     oldCity: string
 >     newCity: string
 >     oldCityLetter: uint8
 >     newCityLetter: uint8
 > }
 */
export interface InformMinterChangeCity {
    readonly $: 'InformMinterChangeCity'
    queryId: uint64
    owner: c.Address
    oldCity: string
    newCity: string
    oldCityLetter: uint8 /* = 0 */
    newCityLetter: uint8 /* = 0 */
}

export const InformMinterChangeCity = {
    PREFIX: 0x000010a3,

    create(args: {
        queryId: uint64
        owner: c.Address
        oldCity: string
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }): InformMinterChangeCity {
        return {
            $: 'InformMinterChangeCity',
            oldCityLetter: 0n,
            newCityLetter: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InformMinterChangeCity {
        loadAndCheckPrefix32(s, 0x000010a3, 'InformMinterChangeCity');
        return {
            $: 'InformMinterChangeCity',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            oldCity: s.loadStringRefTail(),
            newCity: s.loadStringRefTail(),
            oldCityLetter: s.loadUintBig(8),
            newCityLetter: s.loadUintBig(8),
        }
    },
    store(self: InformMinterChangeCity, b: c.Builder): void {
        b.storeUint(0x000010a3, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeStringRefTail(self.oldCity);
        b.storeStringRefTail(self.newCity);
        b.storeUint(self.oldCityLetter, 8);
        b.storeUint(self.newCityLetter, 8);
    },
    toCell(self: InformMinterChangeCity): c.Cell {
        return makeCellFrom<InformMinterChangeCity>(self, InformMinterChangeCity.store);
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
 > }
 */
export interface VotingAction {
    readonly $: 'VotingAction'
    positiveVote: boolean /* = true */
    count: uint4 /* = 10 */
    sender: c.Address
}

export const VotingAction = {
    PREFIX: 0x000010f3,

    create(args: {
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
    }): VotingAction {
        return {
            $: 'VotingAction',
            positiveVote: true,
            count: 10n,
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
        }
    },
    store(self: VotingAction, b: c.Builder): void {
        b.storeUint(0x000010f3, 32);
        b.storeBit(self.positiveVote);
        b.storeUint(self.count, 4);
        b.storeAddress(self.sender);
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
 >     daoAddress: address
 >     targetMsg: cell
 > }
 */
export interface ActSubmitProposal {
    readonly $: 'ActSubmitProposal'
    queryId: uint64
    daoAddress: c.Address
    targetMsg: c.Cell
}

export const ActSubmitProposal = {
    PREFIX: 0x000010fa,

    create(args: {
        queryId: uint64
        daoAddress: c.Address
        targetMsg: c.Cell
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
            daoAddress: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: ActSubmitProposal, b: c.Builder): void {
        b.storeUint(0x000010fa, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.daoAddress);
        b.storeRef(self.targetMsg);
    },
    toCell(self: ActSubmitProposal): c.Cell {
        return makeCellFrom<ActSubmitProposal>(self, ActSubmitProposal.store);
    }
}

/**
 > struct (0x000010fb) SubmitProposal {
 >     queryId: uint64
 >     proposerOwner: address
 >     targetMsg: cell
 > }
 */
export interface SubmitProposal {
    readonly $: 'SubmitProposal'
    queryId: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
}

export const SubmitProposal = {
    PREFIX: 0x000010fb,

    create(args: {
        queryId: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }): SubmitProposal {
        return {
            $: 'SubmitProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): SubmitProposal {
        loadAndCheckPrefix32(s, 0x000010fb, 'SubmitProposal');
        return {
            $: 'SubmitProposal',
            queryId: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: SubmitProposal, b: c.Builder): void {
        b.storeUint(0x000010fb, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
    },
    toCell(self: SubmitProposal): c.Cell {
        return makeCellFrom<SubmitProposal>(self, SubmitProposal.store);
    }
}

/**
 > struct (0x000010fc) ActVoteProposal {
 >     queryId: uint64
 >     daoAddress: address
 >     proposalId: uint64
 >     vote: bool
 > }
 */
export interface ActVoteProposal {
    readonly $: 'ActVoteProposal'
    queryId: uint64
    daoAddress: c.Address
    proposalId: uint64
    vote: boolean
}

export const ActVoteProposal = {
    PREFIX: 0x000010fc,

    create(args: {
        queryId: uint64
        daoAddress: c.Address
        proposalId: uint64
        vote: boolean
    }): ActVoteProposal {
        return {
            $: 'ActVoteProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActVoteProposal {
        loadAndCheckPrefix32(s, 0x000010fc, 'ActVoteProposal');
        return {
            $: 'ActVoteProposal',
            queryId: s.loadUintBig(64),
            daoAddress: s.loadAddress(),
            proposalId: s.loadUintBig(64),
            vote: s.loadBoolean(),
        }
    },
    store(self: ActVoteProposal, b: c.Builder): void {
        b.storeUint(0x000010fc, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.daoAddress);
        b.storeUint(self.proposalId, 64);
        b.storeBit(self.vote);
    },
    toCell(self: ActVoteProposal): c.Cell {
        return makeCellFrom<ActVoteProposal>(self, ActVoteProposal.store);
    }
}

/**
 > struct (0x000010fd) VoteProposalChild {
 >     queryId: uint64
 >     proposalId: uint64
 >     voterOwner: address
 >     vote: bool
 > }
 */
export interface VoteProposalChild {
    readonly $: 'VoteProposalChild'
    queryId: uint64
    proposalId: uint64
    voterOwner: c.Address
    vote: boolean
}

export const VoteProposalChild = {
    PREFIX: 0x000010fd,

    create(args: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        vote: boolean
    }): VoteProposalChild {
        return {
            $: 'VoteProposalChild',
            ...args
        }
    },
    fromSlice(s: c.Slice): VoteProposalChild {
        loadAndCheckPrefix32(s, 0x000010fd, 'VoteProposalChild');
        return {
            $: 'VoteProposalChild',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
            voterOwner: s.loadAddress(),
            vote: s.loadBoolean(),
        }
    },
    store(self: VoteProposalChild, b: c.Builder): void {
        b.storeUint(0x000010fd, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
        b.storeAddress(self.voterOwner);
        b.storeBit(self.vote);
    },
    toCell(self: VoteProposalChild): c.Cell {
        return makeCellFrom<VoteProposalChild>(self, VoteProposalChild.store);
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
 > }
 */
export interface SetCreditNeed {
    readonly $: 'SetCreditNeed'
    queryId: uint64 /* = 0 */
    amount: coins
}

export const SetCreditNeed = {
    PREFIX: 0x0000114a,

    create(args: {
        queryId?: uint64 /* = 0 */
        amount: coins
    }): SetCreditNeed {
        return {
            $: 'SetCreditNeed',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): SetCreditNeed {
        loadAndCheckPrefix32(s, 0x0000114a, 'SetCreditNeed');
        return {
            $: 'SetCreditNeed',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: SetCreditNeed, b: c.Builder): void {
        b.storeUint(0x0000114a, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
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
 > struct (0x000010f8) UnFollow {
 >     queryId: uint64
 >     follow: bool
 >     followee: address
 > }
 */
export interface UnFollow {
    readonly $: 'UnFollow'
    queryId: uint64
    follow: boolean
    followee: c.Address
}

export const UnFollow = {
    PREFIX: 0x000010f8,

    create(args: {
        queryId: uint64
        follow: boolean
        followee: c.Address
    }): UnFollow {
        return {
            $: 'UnFollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): UnFollow {
        loadAndCheckPrefix32(s, 0x000010f8, 'UnFollow');
        return {
            $: 'UnFollow',
            queryId: s.loadUintBig(64),
            follow: s.loadBoolean(),
            followee: s.loadAddress(),
        }
    },
    store(self: UnFollow, b: c.Builder): void {
        b.storeUint(0x000010f8, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.follow);
        b.storeAddress(self.followee);
    },
    toCell(self: UnFollow): c.Cell {
        return makeCellFrom<UnFollow>(self, UnFollow.store);
    }
}

/**
 > struct (0x000010f9) UnFollowInternal {
 >     queryId: uint64
 >     follow: bool
 >     sender: address
 > }
 */
export interface UnFollowInternal {
    readonly $: 'UnFollowInternal'
    queryId: uint64
    follow: boolean
    sender: c.Address
}

export const UnFollowInternal = {
    PREFIX: 0x000010f9,

    create(args: {
        queryId: uint64
        follow: boolean
        sender: c.Address
    }): UnFollowInternal {
        return {
            $: 'UnFollowInternal',
            ...args
        }
    },
    fromSlice(s: c.Slice): UnFollowInternal {
        loadAndCheckPrefix32(s, 0x000010f9, 'UnFollowInternal');
        return {
            $: 'UnFollowInternal',
            queryId: s.loadUintBig(64),
            follow: s.loadBoolean(),
            sender: s.loadAddress(),
        }
    },
    store(self: UnFollowInternal, b: c.Builder): void {
        b.storeUint(0x000010f9, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.follow);
        b.storeAddress(self.sender);
    },
    toCell(self: UnFollowInternal): c.Cell {
        return makeCellFrom<UnFollowInternal>(self, UnFollowInternal.store);
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
 >     treasury: address
 >     nomInAddrs: Cell<NomInAddrs>
 >     trustedJettonAddrs: Cell<TrustedAddrs>
 > }
 */
export interface Addresses {
    readonly $: 'Addresses'
    owner: c.Address
    treasury: c.Address
    nomInAddrs: CellRef<NomInAddrs>
    trustedJettonAddrs: CellRef<TrustedAddrs>
}

export const Addresses = {
    create(args: {
        owner: c.Address
        treasury: c.Address
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
            treasury: s.loadAddress(),
            nomInAddrs: loadCellRef<NomInAddrs>(s, NomInAddrs.fromSlice),
            trustedJettonAddrs: loadCellRef<TrustedAddrs>(s, TrustedAddrs.fromSlice),
        }
    },
    store(self: Addresses, b: c.Builder): void {
        b.storeAddress(self.owner);
        b.storeAddress(self.treasury);
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
 >     followings: map<address, coins>
 > }
 */
export interface SocialMaps {
    readonly $: 'SocialMaps'
    votedFor: c.Dictionary<c.Address, uint4> /* = [] as map<address, uint4> */
    followings: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
}

export const SocialMaps = {
    create(args: {
        votedFor: c.Dictionary<c.Address, uint4> /* = [] as map<address, uint4> */
        followings: c.Dictionary<c.Address, coins> /* = [] as map<address, coins> */
    }): SocialMaps {
        return {
            $: 'SocialMaps',
            ...args
        }
    },
    fromSlice(s: c.Slice): SocialMaps {
        return {
            $: 'SocialMaps',
            votedFor: c.Dictionary.load<c.Address, uint4>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(4), s),
            followings: c.Dictionary.load<c.Address, coins>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4), s),
        }
    },
    store(self: SocialMaps, b: c.Builder): void {
        b.storeDict<c.Address, uint4>(self.votedFor, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(4));
        b.storeDict<c.Address, coins>(self.followings, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigVarUint(4));
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
 >     city: string
 > }
 */
export interface ProfileInfo {
    readonly $: 'ProfileInfo'
    username: string /* = "" */
    city: string /* = "" */
}

export const ProfileInfo = {
    create(args: {
        username?: string /* = "" */
        city?: string /* = "" */
    }): ProfileInfo {
        return {
            $: 'ProfileInfo',
            username: "",
            city: "",
            ...args
        }
    },
    fromSlice(s: c.Slice): ProfileInfo {
        return {
            $: 'ProfileInfo',
            username: s.loadStringRefTail(),
            city: s.loadStringRefTail(),
        }
    },
    store(self: ProfileInfo, b: c.Builder): void {
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.city);
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
 >     creditNeed: coins
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
    creditNeed: coins /* = 0 */
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
        creditNeed?: coins /* = 0 */
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
            creditNeed: 0n,
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
            creditNeed: s.loadCoins(),
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
        b.storeCoins(self.creditNeed);
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
        'Errors.NotFollowing': 717,
        'Errors.ConnectionExists': 719,
        'Errors.AlreadyInvited': 723,
        'Errors.NoVotesAvailable': 731,
        'Errors.NotVotedYet': 732,
        'Errors.WaitMore': 735,
        'Errors.ProvideCoordinates': 738,
        'Errors.InviteFirst': 740,
        'Errors.ProposalFeeInsufficient': 756,
        'Errors.CreditNeedExceeded': 760,
        'Errors.AccountInDebt': 761,
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
        creditNeed?: coins /* = 0 */
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

    static createCellOfChangeCity(body: {
        queryId?: uint64 /* = 0 */
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }) {
        return ChangeCity.toCell(ChangeCity.create(body));
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
        city: string
        cityLetter?: uint8 /* = 0 */
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
        city: string
        cityLetter?: uint8 /* = 0 */
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
        daoAddress: c.Address
        targetMsg: c.Cell
    }) {
        return ActSubmitProposal.toCell(ActSubmitProposal.create(body));
    }

    static createCellOfActVoteProposal(body: {
        queryId: uint64
        daoAddress: c.Address
        proposalId: uint64
        vote: boolean
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

    static createCellOfVotingAction(body: {
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
    }) {
        return VotingAction.toCell(VotingAction.create(body));
    }

    static createCellOfEnterLottery(body: {
        sender: c.Address
        amount: coins
    }) {
        return EnterLottery.toCell(EnterLottery.create(body));
    }

    static createCellOfUnFollow(body: {
        queryId: uint64
        follow: boolean
        followee: c.Address
    }) {
        return UnFollow.toCell(UnFollow.create(body));
    }

    static createCellOfUnFollowInternal(body: {
        queryId: uint64
        follow: boolean
        sender: c.Address
    }) {
        return UnFollowInternal.toCell(UnFollowInternal.create(body));
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

    async sendChangeCity(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeCity.toCell(ChangeCity.create(body)),
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
        city: string
        cityLetter?: uint8 /* = 0 */
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
        city: string
        cityLetter?: uint8 /* = 0 */
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
        daoAddress: c.Address
        targetMsg: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ActSubmitProposal.toCell(ActSubmitProposal.create(body)),
            ...extraOptions
        });
    }

    async sendActVoteProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        daoAddress: c.Address
        proposalId: uint64
        vote: boolean
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

    async sendVotingAction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        positiveVote?: boolean /* = true */
        count?: uint4 /* = 10 */
        sender: c.Address
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

    async sendUnFollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        follow: boolean
        followee: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UnFollow.toCell(UnFollow.create(body)),
            ...extraOptions
        });
    }

    async sendUnFollowInternal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        follow: boolean
        sender: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UnFollowInternal.toCell(UnFollowInternal.create(body)),
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
        const r = StackReader.fromGetMethod(21, await provider.get('get_wallet_data_all', []));
        return ({
            $: 'FiWalletStore',
            jettonBalance: r.readBigInt(),
            goldCoins: r.readBigInt(),
            txnCount: r.readBigInt(),
            status: r.readBigInt(),
            isAuthorityAccount: r.readBoolean(),
            creditNeed: r.readBigInt(),
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

    async getCity(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_city', []));
        return r.readSnakeString();
    }
}
