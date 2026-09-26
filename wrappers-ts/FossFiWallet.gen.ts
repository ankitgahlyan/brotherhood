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
 >     latestWalletCode: cell?
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
    latestWalletCode: c.Cell | null /* = null */
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
        latestWalletCode?: c.Cell | null /* = null */
        forwardPayload: PayloadInline | PayloadInRef
    }): InternalTransferStep {
        return {
            $: 'InternalTransferStep',
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
            version: s.loadUintBig(10),
            transferredAsCredit: s.loadBoolean(),
            transferInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
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
        b.storeUint(self.version, 10);
        b.storeBit(self.transferredAsCredit);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
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
    multiplier: uint16 /* = 1 */
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
        multiplier?: uint16 /* = 1 */
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
            multiplier: 1n,
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
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
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
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
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

    async getAllowance(provider: ContractProvider, grantee: c.Address): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_allowance', [
            { type: 'slice', cell: makeCellFrom<c.Address>(grantee,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readBigInt();
    }
}
