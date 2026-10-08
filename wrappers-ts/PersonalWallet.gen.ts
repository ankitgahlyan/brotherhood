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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint10 = bigint
type uint16 = bigint
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
 > struct (0x00001150) PaybackShortfall {
 >     queryId: uint64
 >     lender: address
 >     shortfall: coins
 >     tokenMinter: address?
 >     deployer: address?
 > }
 */
export interface PaybackShortfall {
    readonly $: 'PaybackShortfall'
    queryId: uint64
    lender: c.Address
    shortfall: coins
    tokenMinter: c.Address | null /* = null */
    deployer: c.Address | null /* = null */
}

export const PaybackShortfall = {
    PREFIX: 0x00001150,

    create(args: {
        queryId: uint64
        lender: c.Address
        shortfall: coins
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }): PaybackShortfall {
        return {
            $: 'PaybackShortfall',
            tokenMinter: null,
            deployer: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): PaybackShortfall {
        loadAndCheckPrefix32(s, 0x00001150, 'PaybackShortfall');
        return {
            $: 'PaybackShortfall',
            queryId: s.loadUintBig(64),
            lender: s.loadAddress(),
            shortfall: s.loadCoins(),
            tokenMinter: s.loadMaybeAddress(),
            deployer: s.loadMaybeAddress(),
        }
    },
    store(self: PaybackShortfall, b: c.Builder): void {
        b.storeUint(0x00001150, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.lender);
        b.storeCoins(self.shortfall);
        b.storeAddress(self.tokenMinter);
        b.storeAddress(self.deployer);
    },
    toCell(self: PaybackShortfall): c.Cell {
        return makeCellFrom<PaybackShortfall>(self, PaybackShortfall.store);
    }
}

/**
 > struct PersonalCreditInfo {
 >     creditNeed: coins
 >     creditCutoff: uint32
 >     creditMaturity: uint32
 >     multiplier: uint16
 >     totalCreditReceived: coins
 >     totalPaybackSettled: coins
 >     totalPaybackShortfall: coins
 > }
 */
export interface PersonalCreditInfo {
    readonly $: 'PersonalCreditInfo'
    creditNeed: coins /* = 0 */
    creditCutoff: uint32 /* = 0 */
    creditMaturity: uint32 /* = 0 */
    multiplier: uint16 /* = 1000 */
    totalCreditReceived: coins /* = 0 */
    totalPaybackSettled: coins /* = 0 */
    totalPaybackShortfall: coins /* = 0 */
}

export const PersonalCreditInfo = {
    create(args: {
        creditNeed?: coins /* = 0 */
        creditCutoff?: uint32 /* = 0 */
        creditMaturity?: uint32 /* = 0 */
        multiplier?: uint16 /* = 1000 */
        totalCreditReceived?: coins /* = 0 */
        totalPaybackSettled?: coins /* = 0 */
        totalPaybackShortfall?: coins /* = 0 */
    }): PersonalCreditInfo {
        return {
            $: 'PersonalCreditInfo',
            creditNeed: 0n,
            creditCutoff: 0n,
            creditMaturity: 0n,
            multiplier: 1000n,
            totalCreditReceived: 0n,
            totalPaybackSettled: 0n,
            totalPaybackShortfall: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PersonalCreditInfo {
        return {
            $: 'PersonalCreditInfo',
            creditNeed: s.loadCoins(),
            creditCutoff: s.loadUintBig(32),
            creditMaturity: s.loadUintBig(32),
            multiplier: s.loadUintBig(16),
            totalCreditReceived: s.loadCoins(),
            totalPaybackSettled: s.loadCoins(),
            totalPaybackShortfall: s.loadCoins(),
        }
    },
    store(self: PersonalCreditInfo, b: c.Builder): void {
        b.storeCoins(self.creditNeed);
        b.storeUint(self.creditCutoff, 32);
        b.storeUint(self.creditMaturity, 32);
        b.storeUint(self.multiplier, 16);
        b.storeCoins(self.totalCreditReceived);
        b.storeCoins(self.totalPaybackSettled);
        b.storeCoins(self.totalPaybackShortfall);
    },
    toCell(self: PersonalCreditInfo): c.Cell {
        return makeCellFrom<PersonalCreditInfo>(self, PersonalCreditInfo.store);
    }
}

/**
 > struct PersonalWalletStore {
 >     jettonBalance: coins
 >     owner: address
 >     deployer: address
 >     minterAddress: address
 >     version: uint10
 >     credit: Cell<PersonalCreditInfo>
 > }
 */
export interface PersonalWalletStore {
    readonly $: 'PersonalWalletStore'
    jettonBalance: coins /* = 0 */
    owner: c.Address
    deployer: c.Address
    minterAddress: c.Address
    version: uint10 /* = 1 */
    credit: CellRef<PersonalCreditInfo>
}

export const PersonalWalletStore = {
    create(args: {
        jettonBalance?: coins /* = 0 */
        owner: c.Address
        deployer: c.Address
        minterAddress: c.Address
        version?: uint10 /* = 1 */
        credit: CellRef<PersonalCreditInfo>
    }): PersonalWalletStore {
        return {
            $: 'PersonalWalletStore',
            jettonBalance: 0n,
            version: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PersonalWalletStore {
        return {
            $: 'PersonalWalletStore',
            jettonBalance: s.loadCoins(),
            owner: s.loadAddress(),
            deployer: s.loadAddress(),
            minterAddress: s.loadAddress(),
            version: s.loadUintBig(10),
            credit: loadCellRef<PersonalCreditInfo>(s, PersonalCreditInfo.fromSlice),
        }
    },
    store(self: PersonalWalletStore, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeAddress(self.owner);
        b.storeAddress(self.deployer);
        b.storeAddress(self.minterAddress);
        b.storeUint(self.version, 10);
        storeCellRef<PersonalCreditInfo>(self.credit, b, PersonalCreditInfo.store);
    },
    toCell(self: PersonalWalletStore): c.Cell {
        return makeCellFrom<PersonalWalletStore>(self, PersonalWalletStore.store);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECNAEADTMAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASAUFQT119tF2/fxIxxppj5jrlhBeNRRmS2mfmP0AGEcI65YR73Zfekl5H/Dpn5j9ABhxdqJofQABUGQA/QFnZPaqcBB2omhrpMCBld1HCvaiaH0AfSR9JH0kaYTqaIgiiBoIEfGGg2uWEF41FGZxh+QA/QEJ/Sl9KX0pCWWE5mTBgcICQIBYhITAGTtRND6SPpI+kjTCTHRcHGCCD6AAMjLX8nIz4QgUmD6UlJQ+lJSQPpSz4gBgCHPFMntVAT+NwbTP/oA+kj6UPoA0wkx0gD0AfiSKccFjsn4ku1E0PoAMfpIMfpI+kgwiCjI+lIT+lL6Us+IAIDJeChUEjLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUMcF8uBK31F1oAGY+JIoxwWzwwCRcOLjACGUNhNfA+MNIC8KCwwCEtcsIHxT9SzjDxgZAATtVAT8CtD6ANMf0x/TD/oA+gD6ANEmwgDy4vglwgCX+CMmu/Li+N4jgQPovJf4IyW58uL43lOmtghTsKFRgaFRQaDIUAX6AhfLHxXLHyPPCw9Y+gIB+gJY+gLJI8IAkTPjDYED6KmEIMIA8rGJiCzI+lIS+lLPiACAyXgtVBIyyM+DDQ4kDwBUyM+RzYtCcibPCz9QBfoCE/pSFc7JyM+FCFKA+lJY+gJxzwtqzMlz+wACAHJukVuOM/iX+CdvEKL4L6BygQPoghAJZgGAcPg3tgly+wLIz4UI+lKCENUydtvPC47LP8mBAIL7AOIC/FHToe1E0PoAMfpIMfpI+kgwiCnI+lIT+lL6Us+IAIDJeCmCCvrwgG1tIW6zlDGLBAHfyM+QXjUUZlYQzws/UAv6AlYTAfpSUsD6VM+IAAQa9AAZzsnIz4mIAVR0U8jPg8sEz4WgzMz5FoT3sAOACyXXJDQTzsv3UAf6AoEVDS8QAEOADkrJyHgj/V6dogIFi1FuEHSJ92hFM23wcoJ6Dbwhno6wAv7LBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUIgsAsj6UhL6Us+IAIDJeC1UEjLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUIIQKbknAG2CAYagbcj0AM9QbSFus5QxiwQB38jPkF41FGYtzws/UAf6AlKg+lITJREAHM8LdRLMzBTMyXP7ABAsAJj6VAH6As+IAEAU9AATzslUeGoughAstBeAyM+QAABABhXLPxP6UlAG+gITzBT6VPpUycjPhYgS+lJY+gLPgXP6AnHPC2XMyYAR+wAKAAeivXwWAFGgTMe1E0PoA+kj6SPpI0wlRFrny4t7IUAX6AhP6UvpS+lISywnOye1UgIBbhYXACO+t2dqJofQB9JH0kfSRphOpowAz7NNu1E0NdJgQMruo4z7UTQ+kj6SPpI0wkx0YIIPoAAyMtfycjPhCBSQPpSNFIk+lIyUgL6UjHPiAGAIc8Uye1UjhTtRND6ADH6SDH6SDH6SDHTCTHU0eLQ+gDTH9Mf0w/6APoA+gDRgASGywLtRND6APpI+kgx+kgwiIC8B/jcG0z/6APpI+lD0AfoAIPQEAW6RMJHR4iP6RDDy0U34l/iTcPg6I3Jx4wT4OSBugRtyIuMEIW6BHplYA+MEUCOoJaCAEoEfQHD4PKABcPg2oAFw+DagcoED6IIQCWYBgHD4N6C88rD4kirHBfLgSVNkvvKvUWShJIIQO5rKALoaA5rXLCLK+D3kj0LXLCAAAIBEji0wNviSbfgqyM+QAABAGynPCwlScPpSEvQA9ADJyM+FCBL6UnHPC27MyYBQ+wCPCdcsIAAAgDTjD+LjDRwdHgL+kvgqkW3i7UTQ+gAx+kgx+kj6SDCIJ8j6UhP6UvpSz4gAgMl4Km6zlDqLBArfyM+QXjUUZhrLP1AI+gJSwPpSFfpUUAP6As+IAEAS9AAWzsnIz4mIAVR0JcjPg8sEz4WgzMz5FoT3sASACyfXJDYVzhLL94EVDc8LeczMzMmAUC8bAAT7AAL8N/iSI8cFB9MAMdMJ+kj0BPQF+JLtRND6ADH6SDH6SPpIMIgmyPpSE/pS+lLPiACAyXhRIsjPg8sEz4WgzMz5FoT3sBWAC1AG1yTIz4oAQM4Uy/fPUBPHBRqx8uK8UyG5jhVsYiBukTCYIPsE0O0e7VPi8QkT2zHgWzb4l/gnLx8D9tcsIAAAijyPcNcsIAAAikSO49csIAAAilSOVtcsIAAAgswxjkI2+JIkxwX4kiTHBbH4kiPHBbHy4rz4ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wCYhA8HxwAX8vTi4w0FBOMNBAXjDSAhIgDgN/iXghAdzWUAvvKw+Jf4OSBugRI6WOMEcYECo3D4OAFw+DaggRL1cPg2oLzysPiSJccF8uBJBtM/+gD6UPQFU0K+8q9RQqHIz5Hvdl96FMs/WPoCUmD6UvpUEvQAycjPhYhSMPpScc8LbszJgFD7AACKbxCi+C+gcoED6IIQCWYBgHD4N7YJcvsCyM+FCFJA+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAgvsAAf43+JIlxwXy4EkG0z/TAAGS+gCSbQHi0wABktMfkm0B4tMAAZLTH5JtAeLTAAGT1wsPkjBt4iNus5F/lSJus8MA4pF/lSFus8MA4pF/lSBus8MA4vKxCdD6ANMf0x/TD/oA+gD6ANEvbpE/mDMuwgDysRAu4iZukTaTNBA14iZuIwP8N40IYAOSsnIeCP9Xp2iAgWLUW4QdIn3aEUzbfBygnoNvCGejrIgmyPpSEvpSz4gAgMl4J1QSMsjPg8sEz4WgzMz5FoT3sBKAC1AD1yTIz4oAQM7L989QiCYCyPpSEvpSz4gAgMl4J1QSMsjPg8sEz4WgzMz5FoT3sBKAC1ADJCUmA/43+JIlxwXy4EkG0z/6APpI+lAwIfpEMPLRTfiX+JNw+Dpx+DkgboEbciLjBCFugR6ZWAPjBFAjqIASgR9AcPg8oAFw+DagAXD4NqBygQPoghAJZgGAcPg3oLzysFNCvvKvUUKh7UTQ+gAx+kgx+kj6SDCIJMj6UhP6UvpSic8WLzAxAN6RNpIyFeIiwgCVIcIAwwCRcOKVUyG78rHeJm6RNpMzECXiyFAD+gLLH8sfE8sPAfoCAfoCUAb6Asn4l/gnbxCi+C+gcoED6IIQCWYBgHD4N7YJcvsCyM+FCFJQ+lKCENUydtvPC44Wyz/JgQCC+wABFP8A9KQT9LzyyAsnART/APSkE/S88sgLKgL+1yTIz4oAQM7L989Q+JLHBfLivAXQ+gDTH9Mf0w/6APoA+gDR+CMlvvLi+yfCAPLixQzTP/oA+kgwUxm2CFEioVGioVFCoFH6oMhQCvoCGMsfFssfFMsPWPoCUAv6AlAE+gLJ7UTQ+gAx+kgx+kj6SDCIJcj6UhP6UvpSz4gAgC8tAgLHKCwB99fxI+SB2omh9JH0kaYTotpJrlhAAAEFKRyHppJj9JGumfEl8FSmx5H0pfSlnxABAZLwokWRnweWCZ8LQZmZ8i0J72ApABagC65JkZ8UAIGcJ5fvnqAljgsiYyJhxRwsY65YQAABAHkl5H/D8SRHjgvlxXnoC8RA3SS+C8EpAB4g+wTQ7R7tU/iSVSDxCK8CAscrLADT1/Ej5IHaiaH0kfSRphOj8SRHjgvxJEeOC2PlxXhHrlhAAAEAGRxBrpmhrlhBeNRRmeVjpn5j9ABj9JBj9KBj9ABjphRj6As7rlhAAAEAeSXkf8PoC8RA3eWl/EH2CaHaPdqn8SSqQeIRXwAJrFevgsAB8sl4U1fCAIIQBfXhAHDjBG1tIW6zlDGLBAHfyM+QXjUUZivPCz9QCfoCUuD6UlKQ+lTPiAAEGPQAF87JyM+JiAFUdFPIz4PLBM+FoMzM+RaE97ADgAsl1yQ0E87L91AF+gKBFQ3PC3USzMwSzMkkwgCWbDKAUPsA4w0uAHSAEfsAghAdzWUA+JLIz5AAAEVCFcs/E/pSUAT6AlJA+lRSUPpUycjPhQgT+lIB+gJxzwtqzMmAEfsAART/APSkE/S88sgLMgADACAAwsl4bfgqIW6zlDGLBAHfyM+QXjUUZhnLP1AH+gJSsPpSGPpUz4gADBb0ABTOycjPiYgBVHVGyM+DywTPhaDMzPkWhPewBIALKNckNxbOEsv3gRUNzwt5EswSzBLMyYBQ+wABTtMh0NMDAXGw8nH6SDDtRND6SDH6SPpI0wkx0SPXLCC8aijM4wLyPzMA9tM/MfoA+kj6UDH6ADHTCTHSAPQFU2THBZIyNI48+CpTU8j6Uhj6Uhf6Us+IAIDJeFF3yM+DywTPhaDMzPkWhPewE4ALUAfXJMjPigBAzhXL989QJccF8uBK4gGCEDuaygC6UAOxA8cFErEhbrOw8uL+IPsE0O0e7VPwAA==');

    static Errors = {
        'Errors.BalanceError': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
        'Errors.IncorrectSender': 700,
        'Errors.InsufficientBalance': 709,
        'Errors.VersionMismatch': 734,
        'Errors.CreditNeedExceeded': 760,
        'Errors.CreditNotMatured': 763,
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

    static fromStorage(emptyStorage: {
        jettonBalance?: coins /* = 0 */
        owner: c.Address
        deployer: c.Address
        minterAddress: c.Address
        version?: uint10 /* = 1 */
        credit: CellRef<PersonalCreditInfo>
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? PersonalWallet.CodeCell,
            data: PersonalWalletStore.toCell(PersonalWalletStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new PersonalWallet(address, initialState);
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

    static createCellOfUpgrade(body: {
        walletUpgrade?: boolean /* = true */
        walletVersion: uint10
        sender: c.Address
        newData?: c.Cell | null /* = null */
        newCode?: c.Cell | null /* = null */
    }) {
        return Upgrade.toCell(Upgrade.create(body));
    }

    static createCellOfRequestUpgradeCode(body: {
        targetAddress?: c.Address | null /* = null */
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    static createCellOfDestroy(body: {
    }) {
        return Destroy.toCell(Destroy.create());
    }

    static createCellOfBuyCredit(body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return BuyCredit.toCell(BuyCredit.create(body));
    }

    static createCellOfPayback(body: {
        queryId: uint64
        amount: coins
        sender: c.Address
        swapTargetOwner?: c.Address | null /* = null */
    }) {
        return Payback.toCell(Payback.create(body));
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

    async sendRequestUpgradeCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        targetAddress?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUpgradeCode.toCell(RequestUpgradeCode.create(body)),
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

    async getPersonalCreditInfo(provider: ContractProvider): Promise<PersonalCreditInfo> {
        const r = StackReader.fromGetMethod(7, await provider.get('get_personal_credit_info', []));
        return ({
            $: 'PersonalCreditInfo',
            creditNeed: r.readBigInt(),
            creditCutoff: r.readBigInt(),
            creditMaturity: r.readBigInt(),
            multiplier: r.readBigInt(),
            totalCreditReceived: r.readBigInt(),
            totalPaybackSettled: r.readBigInt(),
            totalPaybackShortfall: r.readBigInt(),
        });
    }

    async getPersonalWalletState(provider: ContractProvider): Promise<PersonalWalletStore> {
        const r = StackReader.fromGetMethod(6, await provider.get('get_personal_wallet_state', []));
        return ({
            $: 'PersonalWalletStore',
            jettonBalance: r.readBigInt(),
            owner: r.readSlice().loadAddress(),
            deployer: r.readSlice().loadAddress(),
            minterAddress: r.readSlice().loadAddress(),
            version: r.readBigInt(),
            credit: r.readCellRef<PersonalCreditInfo>(PersonalCreditInfo.fromSlice),
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
