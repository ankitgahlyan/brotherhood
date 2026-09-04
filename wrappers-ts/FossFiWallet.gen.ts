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
