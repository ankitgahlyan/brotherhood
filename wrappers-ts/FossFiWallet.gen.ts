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
 > struct (0x642b7d07) MintNewJettons {
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
    PREFIX: 0x642b7d07,

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
        loadAndCheckPrefix32(s, 0x642b7d07, 'MintNewJettons');
        return {
            $: 'MintNewJettons',
            queryId: s.loadUintBig(64),
            mintRecipient: s.loadAddress(),
            tonAmount: s.loadCoins(),
            internalTransferMsg: loadCellRef<InternalTransferStep>(s, InternalTransferStep.fromSlice),
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x642b7d07, 32);
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
 > struct (0x2508d66a) Upgrade {
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
    PREFIX: 0x2508d66a,

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
        loadAndCheckPrefix32(s, 0x2508d66a, 'Upgrade');
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
        b.storeUint(0x2508d66a, 32);
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
 > struct (0xd372158c) TopUpTons {
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
}

export const TopUpTons = {
    PREFIX: 0xd372158c,

    create(): TopUpTons {
        return {
            $: 'TopUpTons',
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0xd372158c, 'TopUpTons');
        return {
            $: 'TopUpTons',
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0xd372158c, 32);
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

/**
 > struct (0x00000001) InternalInvite {
 >     queryId: uint64
 >     version: uint10
 >     sender: address
 >     invitor: address
 >     currentWalletCode: cell
 >     currentStorage: cell?
 >     id: string
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
    id: string
}

export const InternalInvite = {
    PREFIX: 0x00000001,

    create(args: {
        queryId?: uint64 /* = 0 */
        version: uint10
        sender: c.Address
        invitor: c.Address
        currentWalletCode: c.Cell
        currentStorage: c.Cell | null
        id: string
    }): InternalInvite {
        return {
            $: 'InternalInvite',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalInvite {
        loadAndCheckPrefix32(s, 0x00000001, 'InternalInvite');
        return {
            $: 'InternalInvite',
            queryId: s.loadUintBig(64),
            version: s.loadUintBig(10),
            sender: s.loadAddress(),
            invitor: s.loadAddress(),
            currentWalletCode: s.loadRef(),
            currentStorage: s.loadBoolean() ? s.loadRef() : null,
            id: s.loadStringRefTail(),
        }
    },
    store(self: InternalInvite, b: c.Builder): void {
        b.storeUint(0x00000001, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.version, 10);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeRef(self.currentWalletCode);
        storeTolkNullable<c.Cell>(self.currentStorage, b,
            (v,b) => b.storeRef(v)
        );
        b.storeStringRefTail(self.id);
    },
    toCell(self: InternalInvite): c.Cell {
        return makeCellFrom<InternalInvite>(self, InternalInvite.store);
    }
}

/**
 > struct (0x00000002) InternalDeActivate {
 > }
 */
export interface InternalDeActivate {
    readonly $: 'InternalDeActivate'
}

export const InternalDeActivate = {
    PREFIX: 0x00000002,

    create(): InternalDeActivate {
        return {
            $: 'InternalDeActivate',
        }
    },
    fromSlice(s: c.Slice): InternalDeActivate {
        loadAndCheckPrefix32(s, 0x00000002, 'InternalDeActivate');
        return {
            $: 'InternalDeActivate',
        }
    },
    store(self: InternalDeActivate, b: c.Builder): void {
        b.storeUint(0x00000002, 32);
    },
    toCell(self: InternalDeActivate): c.Cell {
        return makeCellFrom<InternalDeActivate>(self, InternalDeActivate.store);
    }
}

/**
 > struct (0x00000004) InformMinterInviteInternal {
 >     queryId: uint64
 >     sender: address
 >     invitor: address
 >     id: string
 > }
 */
export interface InformMinterInviteInternal {
    readonly $: 'InformMinterInviteInternal'
    queryId: uint64
    sender: c.Address
    invitor: c.Address
    id: string
}

export const InformMinterInviteInternal = {
    PREFIX: 0x00000004,

    create(args: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        id: string
    }): InformMinterInviteInternal {
        return {
            $: 'InformMinterInviteInternal',
            ...args
        }
    },
    fromSlice(s: c.Slice): InformMinterInviteInternal {
        loadAndCheckPrefix32(s, 0x00000004, 'InformMinterInviteInternal');
        return {
            $: 'InformMinterInviteInternal',
            queryId: s.loadUintBig(64),
            sender: s.loadAddress(),
            invitor: s.loadAddress(),
            id: s.loadStringRefTail(),
        }
    },
    store(self: InformMinterInviteInternal, b: c.Builder): void {
        b.storeUint(0x00000004, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeStringRefTail(self.id);
    },
    toCell(self: InformMinterInviteInternal): c.Cell {
        return makeCellFrom<InformMinterInviteInternal>(self, InformMinterInviteInternal.store);
    }
}

/**
 > struct (0x00000005) AuthorityAction {
 >     sender: address
 > }
 */
export interface AuthorityAction {
    readonly $: 'AuthorityAction'
    sender: c.Address
}

export const AuthorityAction = {
    PREFIX: 0x00000005,

    create(args: {
        sender: c.Address
    }): AuthorityAction {
        return {
            $: 'AuthorityAction',
            ...args
        }
    },
    fromSlice(s: c.Slice): AuthorityAction {
        loadAndCheckPrefix32(s, 0x00000005, 'AuthorityAction');
        return {
            $: 'AuthorityAction',
            sender: s.loadAddress(),
        }
    },
    store(self: AuthorityAction, b: c.Builder): void {
        b.storeUint(0x00000005, 32);
        b.storeAddress(self.sender);
    },
    toCell(self: AuthorityAction): c.Cell {
        return makeCellFrom<AuthorityAction>(self, AuthorityAction.store);
    }
}

/**
 > struct (0x00000006) SetStatus {
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
    PREFIX: 0x00000006,

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
        loadAndCheckPrefix32(s, 0x00000006, 'SetStatus');
        return {
            $: 'SetStatus',
            sender: s.loadAddress(),
            status: s.loadUintBig(2),
        }
    },
    store(self: SetStatus, b: c.Builder): void {
        b.storeUint(0x00000006, 32);
        b.storeAddress(self.sender);
        b.storeUint(self.status, 2);
    },
    toCell(self: SetStatus): c.Cell {
        return makeCellFrom<SetStatus>(self, SetStatus.store);
    }
}

/**
 > struct (0x00000008) VotingAction {
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
    PREFIX: 0x00000008,

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
        loadAndCheckPrefix32(s, 0x00000008, 'VotingAction');
        return {
            $: 'VotingAction',
            positiveVote: s.loadBoolean(),
            count: s.loadUintBig(4),
            sender: s.loadAddress(),
        }
    },
    store(self: VotingAction, b: c.Builder): void {
        b.storeUint(0x00000008, 32);
        b.storeBit(self.positiveVote);
        b.storeUint(self.count, 4);
        b.storeAddress(self.sender);
    },
    toCell(self: VotingAction): c.Cell {
        return makeCellFrom<VotingAction>(self, VotingAction.store);
    }
}

/**
 > struct (0x00000009) Payback {
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
    PREFIX: 0x00000009,

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
        loadAndCheckPrefix32(s, 0x00000009, 'Payback');
        return {
            $: 'Payback',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            sender: s.loadAddress(),
        }
    },
    store(self: Payback, b: c.Builder): void {
        b.storeUint(0x00000009, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.sender);
    },
    toCell(self: Payback): c.Cell {
        return makeCellFrom<Payback>(self, Payback.store);
    }
}

/**
 > struct (0x00000010) RequestUpgradeCode {
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
    PREFIX: 0x00000010,

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
        loadAndCheckPrefix32(s, 0x00000010, 'RequestUpgradeCode');
        return {
            $: 'RequestUpgradeCode',
            sender: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: RequestUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00000010, 32);
        b.storeAddress(self.sender);
        b.storeUint(self.version, 10);
    },
    toCell(self: RequestUpgradeCode): c.Cell {
        return makeCellFrom<RequestUpgradeCode>(self, RequestUpgradeCode.store);
    }
}

/**
 > struct (0x00000014) Destroy {
 > }
 */
export interface Destroy {
    readonly $: 'Destroy'
}

export const Destroy = {
    PREFIX: 0x00000014,

    create(): Destroy {
        return {
            $: 'Destroy',
        }
    },
    fromSlice(s: c.Slice): Destroy {
        loadAndCheckPrefix32(s, 0x00000014, 'Destroy');
        return {
            $: 'Destroy',
        }
    },
    store(self: Destroy, b: c.Builder): void {
        b.storeUint(0x00000014, 32);
    },
    toCell(self: Destroy): c.Cell {
        return makeCellFrom<Destroy>(self, Destroy.store);
    }
}

/**
 > struct (0x00000020) ActInvite {
 >     queryId: uint64
 >     transferRecipient: address
 >     id: string
 > }
 */
export interface ActInvite {
    readonly $: 'ActInvite'
    queryId: uint64
    transferRecipient: c.Address
    id: string
}

export const ActInvite = {
    PREFIX: 0x00000020,

    create(args: {
        queryId: uint64
        transferRecipient: c.Address
        id: string
    }): ActInvite {
        return {
            $: 'ActInvite',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActInvite {
        loadAndCheckPrefix32(s, 0x00000020, 'ActInvite');
        return {
            $: 'ActInvite',
            queryId: s.loadUintBig(64),
            transferRecipient: s.loadAddress(),
            id: s.loadStringRefTail(),
        }
    },
    store(self: ActInvite, b: c.Builder): void {
        b.storeUint(0x00000020, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.transferRecipient);
        b.storeStringRefTail(self.id);
    },
    toCell(self: ActInvite): c.Cell {
        return makeCellFrom<ActInvite>(self, ActInvite.store);
    }
}

/**
 > struct (0x00000021) ActClaimWeeklyGrant {
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
    PREFIX: 0x00000021,

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
        loadAndCheckPrefix32(s, 0x00000021, 'ActClaimWeeklyGrant');
        return {
            $: 'ActClaimWeeklyGrant',
            queryId: s.loadUintBig(64),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: ActClaimWeeklyGrant, b: c.Builder): void {
        b.storeUint(0x00000021, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: ActClaimWeeklyGrant): c.Cell {
        return makeCellFrom<ActClaimWeeklyGrant>(self, ActClaimWeeklyGrant.store);
    }
}

/**
 > struct (0x00000022) ActVote {
 >     transferRecipient: address
 > }
 */
export interface ActVote {
    readonly $: 'ActVote'
    transferRecipient: c.Address
}

export const ActVote = {
    PREFIX: 0x00000022,

    create(args: {
        transferRecipient: c.Address
    }): ActVote {
        return {
            $: 'ActVote',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActVote {
        loadAndCheckPrefix32(s, 0x00000022, 'ActVote');
        return {
            $: 'ActVote',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActVote, b: c.Builder): void {
        b.storeUint(0x00000022, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActVote): c.Cell {
        return makeCellFrom<ActVote>(self, ActVote.store);
    }
}

/**
 > struct (0x00000023) ActUnvote {
 >     transferRecipient: address
 > }
 */
export interface ActUnvote {
    readonly $: 'ActUnvote'
    transferRecipient: c.Address
}

export const ActUnvote = {
    PREFIX: 0x00000023,

    create(args: {
        transferRecipient: c.Address
    }): ActUnvote {
        return {
            $: 'ActUnvote',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActUnvote {
        loadAndCheckPrefix32(s, 0x00000023, 'ActUnvote');
        return {
            $: 'ActUnvote',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActUnvote, b: c.Builder): void {
        b.storeUint(0x00000023, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActUnvote): c.Cell {
        return makeCellFrom<ActUnvote>(self, ActUnvote.store);
    }
}

/**
 > struct (0x00000024) ActDeactivate {
 >     transferRecipient: address
 > }
 */
export interface ActDeactivate {
    readonly $: 'ActDeactivate'
    transferRecipient: c.Address
}

export const ActDeactivate = {
    PREFIX: 0x00000024,

    create(args: {
        transferRecipient: c.Address
    }): ActDeactivate {
        return {
            $: 'ActDeactivate',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActDeactivate {
        loadAndCheckPrefix32(s, 0x00000024, 'ActDeactivate');
        return {
            $: 'ActDeactivate',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActDeactivate, b: c.Builder): void {
        b.storeUint(0x00000024, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActDeactivate): c.Cell {
        return makeCellFrom<ActDeactivate>(self, ActDeactivate.store);
    }
}

/**
 > struct (0x00000025) ActRequestUpgrade {
 > }
 */
export interface ActRequestUpgrade {
    readonly $: 'ActRequestUpgrade'
}

export const ActRequestUpgrade = {
    PREFIX: 0x00000025,

    create(): ActRequestUpgrade {
        return {
            $: 'ActRequestUpgrade',
        }
    },
    fromSlice(s: c.Slice): ActRequestUpgrade {
        loadAndCheckPrefix32(s, 0x00000025, 'ActRequestUpgrade');
        return {
            $: 'ActRequestUpgrade',
        }
    },
    store(self: ActRequestUpgrade, b: c.Builder): void {
        b.storeUint(0x00000025, 32);
    },
    toCell(self: ActRequestUpgrade): c.Cell {
        return makeCellFrom<ActRequestUpgrade>(self, ActRequestUpgrade.store);
    }
}

/**
 > struct (0x00000026) ActDispatchAuthorityAction {
 >     transferRecipient: address
 > }
 */
export interface ActDispatchAuthorityAction {
    readonly $: 'ActDispatchAuthorityAction'
    transferRecipient: c.Address
}

export const ActDispatchAuthorityAction = {
    PREFIX: 0x00000026,

    create(args: {
        transferRecipient: c.Address
    }): ActDispatchAuthorityAction {
        return {
            $: 'ActDispatchAuthorityAction',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActDispatchAuthorityAction {
        loadAndCheckPrefix32(s, 0x00000026, 'ActDispatchAuthorityAction');
        return {
            $: 'ActDispatchAuthorityAction',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActDispatchAuthorityAction, b: c.Builder): void {
        b.storeUint(0x00000026, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActDispatchAuthorityAction): c.Cell {
        return makeCellFrom<ActDispatchAuthorityAction>(self, ActDispatchAuthorityAction.store);
    }
}

/**
 > struct (0x00000027) ActJoinLottery {
 > }
 */
export interface ActJoinLottery {
    readonly $: 'ActJoinLottery'
}

export const ActJoinLottery = {
    PREFIX: 0x00000027,

    create(): ActJoinLottery {
        return {
            $: 'ActJoinLottery',
        }
    },
    fromSlice(s: c.Slice): ActJoinLottery {
        loadAndCheckPrefix32(s, 0x00000027, 'ActJoinLottery');
        return {
            $: 'ActJoinLottery',
        }
    },
    store(self: ActJoinLottery, b: c.Builder): void {
        b.storeUint(0x00000027, 32);
    },
    toCell(self: ActJoinLottery): c.Cell {
        return makeCellFrom<ActJoinLottery>(self, ActJoinLottery.store);
    }
}

/**
 > struct (0x00000028) ActSetPersonalJettonMinter {
 >     transferRecipient: address
 > }
 */
export interface ActSetPersonalJettonMinter {
    readonly $: 'ActSetPersonalJettonMinter'
    transferRecipient: c.Address
}

export const ActSetPersonalJettonMinter = {
    PREFIX: 0x00000028,

    create(args: {
        transferRecipient: c.Address
    }): ActSetPersonalJettonMinter {
        return {
            $: 'ActSetPersonalJettonMinter',
            ...args
        }
    },
    fromSlice(s: c.Slice): ActSetPersonalJettonMinter {
        loadAndCheckPrefix32(s, 0x00000028, 'ActSetPersonalJettonMinter');
        return {
            $: 'ActSetPersonalJettonMinter',
            transferRecipient: s.loadAddress(),
        }
    },
    store(self: ActSetPersonalJettonMinter, b: c.Builder): void {
        b.storeUint(0x00000028, 32);
        b.storeAddress(self.transferRecipient);
    },
    toCell(self: ActSetPersonalJettonMinter): c.Cell {
        return makeCellFrom<ActSetPersonalJettonMinter>(self, ActSetPersonalJettonMinter.store);
    }
}

/**
 > struct (0x00000029) ActDestroyAccount {
 > }
 */
export interface ActDestroyAccount {
    readonly $: 'ActDestroyAccount'
}

export const ActDestroyAccount = {
    PREFIX: 0x00000029,

    create(): ActDestroyAccount {
        return {
            $: 'ActDestroyAccount',
        }
    },
    fromSlice(s: c.Slice): ActDestroyAccount {
        loadAndCheckPrefix32(s, 0x00000029, 'ActDestroyAccount');
        return {
            $: 'ActDestroyAccount',
        }
    },
    store(self: ActDestroyAccount, b: c.Builder): void {
        b.storeUint(0x00000029, 32);
    },
    toCell(self: ActDestroyAccount): c.Cell {
        return makeCellFrom<ActDestroyAccount>(self, ActDestroyAccount.store);
    }
}

/**
 > struct (0x00000017) ChangeId {
 >     newId: string
 > }
 */
export interface ChangeId {
    readonly $: 'ChangeId'
    newId: string
}

export const ChangeId = {
    PREFIX: 0x00000017,

    create(args: {
        newId: string
    }): ChangeId {
        return {
            $: 'ChangeId',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeId {
        loadAndCheckPrefix32(s, 0x00000017, 'ChangeId');
        return {
            $: 'ChangeId',
            newId: s.loadStringRefTail(),
        }
    },
    store(self: ChangeId, b: c.Builder): void {
        b.storeUint(0x00000017, 32);
        b.storeStringRefTail(self.newId);
    },
    toCell(self: ChangeId): c.Cell {
        return makeCellFrom<ChangeId>(self, ChangeId.store);
    }
}

/**
 > struct (0x00000018) RequestState {
 > }
 */
export interface RequestState {
    readonly $: 'RequestState'
}

export const RequestState = {
    PREFIX: 0x00000018,

    create(): RequestState {
        return {
            $: 'RequestState',
        }
    },
    fromSlice(s: c.Slice): RequestState {
        loadAndCheckPrefix32(s, 0x00000018, 'RequestState');
        return {
            $: 'RequestState',
        }
    },
    store(self: RequestState, b: c.Builder): void {
        b.storeUint(0x00000018, 32);
    },
    toCell(self: RequestState): c.Cell {
        return makeCellFrom<RequestState>(self, RequestState.store);
    }
}

/**
 > struct (0x00000019) ProvideState {
 >     state: cell
 > }
 */
export interface ProvideState {
    readonly $: 'ProvideState'
    state: c.Cell
}

export const ProvideState = {
    PREFIX: 0x00000019,

    create(args: {
        state: c.Cell
    }): ProvideState {
        return {
            $: 'ProvideState',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProvideState {
        loadAndCheckPrefix32(s, 0x00000019, 'ProvideState');
        return {
            $: 'ProvideState',
            state: s.loadRef(),
        }
    },
    store(self: ProvideState, b: c.Builder): void {
        b.storeUint(0x00000019, 32);
        b.storeRef(self.state);
    },
    toCell(self: ProvideState): c.Cell {
        return makeCellFrom<ProvideState>(self, ProvideState.store);
    }
}

/**
 > struct (0x0000001a) SetAllowance {
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
    PREFIX: 0x0000001a,

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
        loadAndCheckPrefix32(s, 0x0000001a, 'SetAllowance');
        return {
            $: 'SetAllowance',
            queryId: s.loadUintBig(64),
            grantee: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: SetAllowance, b: c.Builder): void {
        b.storeUint(0x0000001a, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.grantee);
        b.storeCoins(self.amount);
    },
    toCell(self: SetAllowance): c.Cell {
        return makeCellFrom<SetAllowance>(self, SetAllowance.store);
    }
}

/**
 > struct (0x0000001b) SpendAllowance {
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
    PREFIX: 0x0000001b,

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
        loadAndCheckPrefix32(s, 0x0000001b, 'SpendAllowance');
        return {
            $: 'SpendAllowance',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            receiver: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: SpendAllowance, b: c.Builder): void {
        b.storeUint(0x0000001b, 32);
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
 > struct (0x0000001c) AskGoldCoinsTransfer {
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
    PREFIX: 0x0000001c,

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
        loadAndCheckPrefix32(s, 0x0000001c, 'AskGoldCoinsTransfer');
        return {
            $: 'AskGoldCoinsTransfer',
            queryId: s.loadUintBig(64),
            amount: s.loadUintBig(32),
            receiver: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: AskGoldCoinsTransfer, b: c.Builder): void {
        b.storeUint(0x0000001c, 32);
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
 > struct (0x0000001d) InternalGoldCoinsTransfer {
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
    PREFIX: 0x0000001d,

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
        loadAndCheckPrefix32(s, 0x0000001d, 'InternalGoldCoinsTransfer');
        return {
            $: 'InternalGoldCoinsTransfer',
            queryId: s.loadUintBig(64),
            amount: s.loadUintBig(32),
            transferInitiator: s.loadAddress(),
        }
    },
    store(self: InternalGoldCoinsTransfer, b: c.Builder): void {
        b.storeUint(0x0000001d, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.amount, 32);
        b.storeAddress(self.transferInitiator);
    },
    toCell(self: InternalGoldCoinsTransfer): c.Cell {
        return makeCellFrom<InternalGoldCoinsTransfer>(self, InternalGoldCoinsTransfer.store);
    }
}

/**
 > struct (0x0000001e) TriggerDecay {
 >     sender: address
 > }
 */
export interface TriggerDecay {
    readonly $: 'TriggerDecay'
    sender: c.Address
}

export const TriggerDecay = {
    PREFIX: 0x0000001e,

    create(args: {
        sender: c.Address
    }): TriggerDecay {
        return {
            $: 'TriggerDecay',
            ...args
        }
    },
    fromSlice(s: c.Slice): TriggerDecay {
        loadAndCheckPrefix32(s, 0x0000001e, 'TriggerDecay');
        return {
            $: 'TriggerDecay',
            sender: s.loadAddress(),
        }
    },
    store(self: TriggerDecay, b: c.Builder): void {
        b.storeUint(0x0000001e, 32);
        b.storeAddress(self.sender);
    },
    toCell(self: TriggerDecay): c.Cell {
        return makeCellFrom<TriggerDecay>(self, TriggerDecay.store);
    }
}

/**
 > struct (0x0000001f) BuyCredit {
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
    PREFIX: 0x0000001f,

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
        loadAndCheckPrefix32(s, 0x0000001f, 'BuyCredit');
        return {
            $: 'BuyCredit',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferRecipient: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: BuyCredit, b: c.Builder): void {
        b.storeUint(0x0000001f, 32);
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
 > struct (0x00000051) UnFollow {
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
    PREFIX: 0x00000051,

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
        loadAndCheckPrefix32(s, 0x00000051, 'UnFollow');
        return {
            $: 'UnFollow',
            queryId: s.loadUintBig(64),
            follow: s.loadBoolean(),
            followee: s.loadAddress(),
        }
    },
    store(self: UnFollow, b: c.Builder): void {
        b.storeUint(0x00000051, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.follow);
        b.storeAddress(self.followee);
    },
    toCell(self: UnFollow): c.Cell {
        return makeCellFrom<UnFollow>(self, UnFollow.store);
    }
}

/**
 > struct (0x00000052) UnFollowInternal {
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
    PREFIX: 0x00000052,

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
        loadAndCheckPrefix32(s, 0x00000052, 'UnFollowInternal');
        return {
            $: 'UnFollowInternal',
            queryId: s.loadUintBig(64),
            follow: s.loadBoolean(),
            sender: s.loadAddress(),
        }
    },
    store(self: UnFollowInternal, b: c.Builder): void {
        b.storeUint(0x00000052, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.follow);
        b.storeAddress(self.sender);
    },
    toCell(self: UnFollowInternal): c.Cell {
        return makeCellFrom<UnFollowInternal>(self, UnFollowInternal.store);
    }
}

/**
 > struct (0x11111111) EnterLottery {
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
    PREFIX: 0x11111111,

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
        loadAndCheckPrefix32(s, 0x11111111, 'EnterLottery');
        return {
            $: 'EnterLottery',
            sender: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: EnterLottery, b: c.Builder): void {
        b.storeUint(0x11111111, 32);
        b.storeAddress(self.sender);
        b.storeCoins(self.amount);
    },
    toCell(self: EnterLottery): c.Cell {
        return makeCellFrom<EnterLottery>(self, EnterLottery.store);
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
 >     personalJettonMinter: address?
 >     personalJettonWallet: address?
 >     authorisedAccs: map<address, address>
 > }
 */
export interface TrustedAddrs {
    readonly $: 'TrustedAddrs'
    minterAddr: c.Address
    personalJettonMinter: c.Address | null /* = null */
    personalJettonWallet: c.Address | null /* = null */
    authorisedAccs: c.Dictionary<c.Address, c.Address>
}

export const TrustedAddrs = {
    create(args: {
        minterAddr: c.Address
        personalJettonMinter?: c.Address | null /* = null */
        personalJettonWallet?: c.Address | null /* = null */
        authorisedAccs: c.Dictionary<c.Address, c.Address>
    }): TrustedAddrs {
        return {
            $: 'TrustedAddrs',
            personalJettonMinter: null,
            personalJettonWallet: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): TrustedAddrs {
        return {
            $: 'TrustedAddrs',
            minterAddr: s.loadAddress(),
            personalJettonMinter: s.loadMaybeAddress(),
            personalJettonWallet: s.loadMaybeAddress(),
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
 >     baseFiWalletCode: cell
 >     nomInAddrs: Cell<NomInAddrs>
 >     trustedJettonAddrs: Cell<TrustedAddrs>
 > }
 */
export interface Addresses {
    readonly $: 'Addresses'
    owner: c.Address
    treasury: c.Address
    baseFiWalletCode: c.Cell
    nomInAddrs: CellRef<NomInAddrs>
    trustedJettonAddrs: CellRef<TrustedAddrs>
}

export const Addresses = {
    create(args: {
        owner: c.Address
        treasury: c.Address
        baseFiWalletCode: c.Cell
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
            baseFiWalletCode: s.loadRef(),
            nomInAddrs: loadCellRef<NomInAddrs>(s, NomInAddrs.fromSlice),
            trustedJettonAddrs: loadCellRef<TrustedAddrs>(s, TrustedAddrs.fromSlice),
        }
    },
    store(self: Addresses, b: c.Builder): void {
        b.storeAddress(self.owner);
        b.storeAddress(self.treasury);
        b.storeRef(self.baseFiWalletCode);
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
    votedFor: c.Dictionary<c.Address, uint4>
    followings: c.Dictionary<c.Address, coins>
}

export const SocialMaps = {
    create(args: {
        votedFor: c.Dictionary<c.Address, uint4>
        followings: c.Dictionary<c.Address, coins>
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
    invited: c.Dictionary<c.Address, coins>
    allowances: c.Dictionary<c.Address, coins>
    social: CellRef<SocialMaps>
    reportInfo: CellRef<ReportInfo>
}

export const Maps = {
    create(args: {
        invited: c.Dictionary<c.Address, coins>
        allowances: c.Dictionary<c.Address, coins>
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
    reports: c.Dictionary<c.Address, boolean>
    tosBreach: boolean /* = false */
    reporterCount: uint10 /* = 0 */
    disputerCount: uint10 /* = 0 */
    reportResolutionTime: uint32 /* = 0 */
}

export const ReportInfo = {
    create(args: {
        reports: c.Dictionary<c.Address, boolean>
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
 > struct FiWalletStore {
 >     jettonBalance: coins
 >     goldCoins: uint32
 >     id: string
 >     txnCount: uint8
 >     status: uint2
 >     isAuthorityAccount: bool
 >     creditNeed: coins
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
 >     timestamps: Cell<TimeStamps>
 >     addresses: Cell<Addresses>
 >     maps: Cell<Maps>
 > }
 */
export interface FiWalletStore {
    readonly $: 'FiWalletStore'
    jettonBalance: coins /* = 0 */
    goldCoins: uint32 /* = 1 */
    id: string /* = "" */
    txnCount: uint8 /* = 0 */
    status: uint2 /* = 0 */
    isAuthorityAccount: boolean /* = false */
    creditNeed: coins /* = 0 */
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
    timestamps: CellRef<TimeStamps>
    addresses: CellRef<Addresses>
    maps: CellRef<Maps>
}

export const FiWalletStore = {
    create(args: {
        jettonBalance?: coins /* = 0 */
        goldCoins?: uint32 /* = 1 */
        id?: string /* = "" */
        txnCount?: uint8 /* = 0 */
        status?: uint2 /* = 0 */
        isAuthorityAccount?: boolean /* = false */
        creditNeed?: coins /* = 0 */
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
        timestamps: CellRef<TimeStamps>
        addresses: CellRef<Addresses>
        maps: CellRef<Maps>
    }): FiWalletStore {
        return {
            $: 'FiWalletStore',
            jettonBalance: 0n,
            goldCoins: 1n,
            id: "",
            txnCount: 0n,
            status: 0n,
            isAuthorityAccount: false,
            creditNeed: 0n,
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
            id: s.loadStringRefTail(),
            txnCount: s.loadUintBig(8),
            status: s.loadUintBig(2),
            isAuthorityAccount: s.loadBoolean(),
            creditNeed: s.loadCoins(),
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
            timestamps: loadCellRef<TimeStamps>(s, TimeStamps.fromSlice),
            addresses: loadCellRef<Addresses>(s, Addresses.fromSlice),
            maps: loadCellRef<Maps>(s, Maps.fromSlice),
        }
    },
    store(self: FiWalletStore, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeUint(self.goldCoins, 32);
        b.storeStringRefTail(self.id);
        b.storeUint(self.txnCount, 8);
        b.storeUint(self.status, 2);
        b.storeBit(self.isAuthorityAccount);
        b.storeCoins(self.creditNeed);
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
        storeCellRef<TimeStamps>(self.timestamps, b, TimeStamps.store);
        storeCellRef<Addresses>(self.addresses, b, Addresses.store);
        storeCellRef<Maps>(self.maps, b, Maps.store);
    },
    toCell(self: FiWalletStore): c.Cell {
        return makeCellFrom<FiWalletStore>(self, FiWalletStore.store);
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
        'Errors.InviteFirst': 740,
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
        id?: string /* = "" */
        txnCount?: uint8 /* = 0 */
        status?: uint2 /* = 0 */
        isAuthorityAccount?: boolean /* = false */
        creditNeed?: coins /* = 0 */
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

    static createCellOfChangeId(body: {
        newId: string
    }) {
        return ChangeId.toCell(ChangeId.create(body));
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
        id: string
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
        id: string
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

    async sendChangeId(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        newId: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeId.toCell(ChangeId.create(body)),
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
        id: string
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
        id: string
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
        const r = StackReader.fromGetMethod(20, await provider.get('get_wallet_data_all', []));
        return ({
            $: 'FiWalletStore',
            jettonBalance: r.readBigInt(),
            goldCoins: r.readBigInt(),
            id: r.readSnakeString(),
            txnCount: r.readBigInt(),
            status: r.readBigInt(),
            isAuthorityAccount: r.readBoolean(),
            creditNeed: r.readBigInt(),
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
            timestamps: r.readCellRef<TimeStamps>(TimeStamps.fromSlice),
            addresses: r.readCellRef<Addresses>(Addresses.fromSlice),
            maps: r.readCellRef<Maps>(Maps.fromSlice),
        });
    }

    async getId(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_id', []));
        return r.readSnakeString();
    }
}
