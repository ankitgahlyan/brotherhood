// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a PersonalMinter contract in Tolk.
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

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
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
type uint64 = bigint
type uint256 = bigint

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
 > struct JettonDataReply {
 >     totalSupply: int
 >     mintable: bool
 >     adminAddress: address?
 >     jettonContent: Cell<OnchainMetadataReply>
 >     jettonWalletCode: cell
 > }
 */
export interface JettonDataReply {
    readonly $: 'JettonDataReply'
    totalSupply: bigint
    mintable: boolean
    adminAddress: c.Address | null
    jettonContent: CellRef<OnchainMetadataReply>
    jettonWalletCode: c.Cell
}

export const JettonDataReply = {
    create(args: {
        totalSupply: bigint
        mintable: boolean
        adminAddress: c.Address | null
        jettonContent: CellRef<OnchainMetadataReply>
        jettonWalletCode: c.Cell
    }): JettonDataReply {
        return {
            $: 'JettonDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): JettonDataReply {
        throw new Error(`Can't unpack 'JettonDataReply' from cell, because 'JettonDataReply.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: JettonDataReply, b: c.Builder): void {
        throw new Error(`Can't pack 'JettonDataReply' to cell, because 'self.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: JettonDataReply): c.Cell {
        return makeCellFrom<JettonDataReply>(self, JettonDataReply.store);
    }
}

/**
 > struct (0x00) OnchainMetadataReply {
 >     contentDict: map<uint256, string_prefixed0x>
 > }
 */
export interface OnchainMetadataReply {
    readonly $: 'OnchainMetadataReply'
    contentDict: c.Dictionary<uint256, string_prefixed0x>
}

export const OnchainMetadataReply = {
    PREFIX: 0x00,

    create(args: {
        contentDict: c.Dictionary<uint256, string_prefixed0x>
    }): OnchainMetadataReply {
        return {
            $: 'OnchainMetadataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): OnchainMetadataReply {
        loadAndCheckPrefix(s, 0x00, 8, 'OnchainMetadataReply');
        return {
            $: 'OnchainMetadataReply',
            contentDict: c.Dictionary.load<uint256, string_prefixed0x>(c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store), s),
        }
    },
    store(self: OnchainMetadataReply, b: c.Builder): void {
        b.storeUint(0x00, 8);
        b.storeDict<uint256, string_prefixed0x>(self.contentDict, c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store));
    },
    toCell(self: OnchainMetadataReply): c.Cell {
        return makeCellFrom<OnchainMetadataReply>(self, OnchainMetadataReply.store);
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
 > struct (0x2c76b972) RequestWalletAddress {
 >     queryId: uint64
 >     owner: address
 >     includeOwnerAddress: bool
 > }
 */
export interface RequestWalletAddress {
    readonly $: 'RequestWalletAddress'
    queryId: uint64
    owner: c.Address
    includeOwnerAddress: boolean
}

export const RequestWalletAddress = {
    PREFIX: 0x2c76b972,

    create(args: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }): RequestWalletAddress {
        return {
            $: 'RequestWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestWalletAddress {
        loadAndCheckPrefix32(s, 0x2c76b972, 'RequestWalletAddress');
        return {
            $: 'RequestWalletAddress',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            includeOwnerAddress: s.loadBoolean(),
        }
    },
    store(self: RequestWalletAddress, b: c.Builder): void {
        b.storeUint(0x2c76b972, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeBit(self.includeOwnerAddress);
    },
    toCell(self: RequestWalletAddress): c.Cell {
        return makeCellFrom<RequestWalletAddress>(self, RequestWalletAddress.store);
    }
}

/**
 > struct (0xd1735466) ResponseWalletAddress {
 >     queryId: uint64
 >     jettonWalletAddress: address?
 >     owner: Cell<address>?
 > }
 */
export interface ResponseWalletAddress {
    readonly $: 'ResponseWalletAddress'
    queryId: uint64
    jettonWalletAddress: c.Address | null
    owner: CellRef<c.Address> | null
}

export const ResponseWalletAddress = {
    PREFIX: 0xd1735466,

    create(args: {
        queryId: uint64
        jettonWalletAddress: c.Address | null
        owner: CellRef<c.Address> | null
    }): ResponseWalletAddress {
        return {
            $: 'ResponseWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResponseWalletAddress {
        loadAndCheckPrefix32(s, 0xd1735466, 'ResponseWalletAddress');
        return {
            $: 'ResponseWalletAddress',
            queryId: s.loadUintBig(64),
            jettonWalletAddress: s.loadMaybeAddress(),
            owner: s.loadBoolean() ? loadCellRef<c.Address>(s,
                (s) => s.loadAddress()
            ) : null,
        }
    },
    store(self: ResponseWalletAddress, b: c.Builder): void {
        b.storeUint(0xd1735466, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.jettonWalletAddress);
        storeTolkNullable<CellRef<c.Address>>(self.owner, b,
            (v,b) => { storeCellRef<c.Address>(v, b,
                (v,b) => b.storeAddress(v)
            ); }
        );
    },
    toCell(self: ResponseWalletAddress): c.Cell {
        return makeCellFrom<ResponseWalletAddress>(self, ResponseWalletAddress.store);
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
 > struct (0x00001002) ChangeMinterAdmin {
 >     queryId: uint64
 >     newAdminAddress: address
 > }
 */
export interface ChangeMinterAdmin {
    readonly $: 'ChangeMinterAdmin'
    queryId: uint64
    newAdminAddress: c.Address
}

export const ChangeMinterAdmin = {
    PREFIX: 0x00001002,

    create(args: {
        queryId: uint64
        newAdminAddress: c.Address
    }): ChangeMinterAdmin {
        return {
            $: 'ChangeMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterAdmin {
        loadAndCheckPrefix32(s, 0x00001002, 'ChangeMinterAdmin');
        return {
            $: 'ChangeMinterAdmin',
            queryId: s.loadUintBig(64),
            newAdminAddress: s.loadAddress(),
        }
    },
    store(self: ChangeMinterAdmin, b: c.Builder): void {
        b.storeUint(0x00001002, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newAdminAddress);
    },
    toCell(self: ChangeMinterAdmin): c.Cell {
        return makeCellFrom<ChangeMinterAdmin>(self, ChangeMinterAdmin.store);
    }
}

/**
 > struct (0x00001005) ChangeMinterMetadata {
 >     queryId: uint64
 >     newMetadata: cell
 > }
 */
export interface ChangeMinterMetadata {
    readonly $: 'ChangeMinterMetadata'
    queryId: uint64
    newMetadata: c.Cell
}

export const ChangeMinterMetadata = {
    PREFIX: 0x00001005,

    create(args: {
        queryId: uint64
        newMetadata: c.Cell
    }): ChangeMinterMetadata {
        return {
            $: 'ChangeMinterMetadata',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterMetadata {
        loadAndCheckPrefix32(s, 0x00001005, 'ChangeMinterMetadata');
        return {
            $: 'ChangeMinterMetadata',
            queryId: s.loadUintBig(64),
            newMetadata: s.loadRef(),
        }
    },
    store(self: ChangeMinterMetadata, b: c.Builder): void {
        b.storeUint(0x00001005, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.newMetadata);
    },
    toCell(self: ChangeMinterMetadata): c.Cell {
        return makeCellFrom<ChangeMinterMetadata>(self, ChangeMinterMetadata.store);
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
 > struct PersonalCodes {
 >     latestPersonalWalletCode: cell
 > }
 */
export interface PersonalCodes {
    readonly $: 'PersonalCodes'
    latestPersonalWalletCode: c.Cell
}

export const PersonalCodes = {
    create(args: {
        latestPersonalWalletCode: c.Cell
    }): PersonalCodes {
        return {
            $: 'PersonalCodes',
            ...args
        }
    },
    fromSlice(s: c.Slice): PersonalCodes {
        return {
            $: 'PersonalCodes',
            latestPersonalWalletCode: s.loadRef(),
        }
    },
    store(self: PersonalCodes, b: c.Builder): void {
        b.storeRef(self.latestPersonalWalletCode);
    },
    toCell(self: PersonalCodes): c.Cell {
        return makeCellFrom<PersonalCodes>(self, PersonalCodes.store);
    }
}

/**
 > struct PersonalStore {
 >     totalSupply: coins
 >     fiJettonAddress: address
 >     adminAddress: address
 >     metadataUri: cell?
 >     version: uint10
 >     codes: PersonalCodes
 > }
 */
export interface PersonalStore {
    readonly $: 'PersonalStore'
    totalSupply: coins /* = 0 */
    fiJettonAddress: c.Address
    adminAddress: c.Address
    metadataUri: c.Cell | null /* = null */
    version: uint10 /* = 1 */
    codes: PersonalCodes
}

export const PersonalStore = {
    create(args: {
        totalSupply?: coins /* = 0 */
        fiJettonAddress: c.Address
        adminAddress: c.Address
        metadataUri?: c.Cell | null /* = null */
        version?: uint10 /* = 1 */
        codes: PersonalCodes
    }): PersonalStore {
        return {
            $: 'PersonalStore',
            totalSupply: 0n,
            metadataUri: null,
            version: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PersonalStore {
        return {
            $: 'PersonalStore',
            totalSupply: s.loadCoins(),
            fiJettonAddress: s.loadAddress(),
            adminAddress: s.loadAddress(),
            metadataUri: s.loadBoolean() ? s.loadRef() : null,
            version: s.loadUintBig(10),
            codes: PersonalCodes.fromSlice(s),
        }
    },
    store(self: PersonalStore, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        b.storeAddress(self.fiJettonAddress);
        b.storeAddress(self.adminAddress);
        storeTolkNullable<c.Cell>(self.metadataUri, b,
            (v,b) => b.storeRef(v)
        );
        b.storeUint(self.version, 10);
        PersonalCodes.store(self.codes, b);
    },
    toCell(self: PersonalStore): c.Cell {
        return makeCellFrom<PersonalStore>(self, PersonalStore.store);
    }
}

/**
 > type string_prefixed0x = string
 */
export type string_prefixed0x = string

export const string_prefixed0x = {
    fromSlice(s: c.Slice): string_prefixed0x {
        return s.loadStringRefTail();
    },
    store(self: string_prefixed0x, b: c.Builder): void {
        b.storeStringRefTail(self);
    },
    toCell(self: string_prefixed0x): c.Cell {
        return makeCellFrom<string_prefixed0x>(self, string_prefixed0x.store);
    }
}

// ————————————————————————————————————————————
//    class PersonalMinter
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

export class PersonalMinter implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
        'Errors.IncorrectSender': 700,
        'Errors.VersionMismatch': 734,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new PersonalMinter(address);
    }

    static fromStorage(emptyStorage: {
        totalSupply?: coins /* = 0 */
        fiJettonAddress: c.Address
        adminAddress: c.Address
        metadataUri?: c.Cell | null /* = null */
        version?: uint10 /* = 1 */
        codes: PersonalCodes
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? PersonalMinter.CodeCell,
            data: PersonalStore.toCell(PersonalStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new PersonalMinter(address, initialState);
    }

    static createCellOfMintNewJettons(body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }) {
        return MintNewJettons.toCell(MintNewJettons.create(body));
    }

    static createCellOfNotifyMinter(body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
        customPayload?: c.Cell | null /* = null */
    }) {
        return NotifyMinter.toCell(NotifyMinter.create(body));
    }

    static createCellOfRequestWalletAddress(body: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }) {
        return RequestWalletAddress.toCell(RequestWalletAddress.create(body));
    }

    static createCellOfChangeMinterAdmin(body: {
        queryId: uint64
        newAdminAddress: c.Address
    }) {
        return ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body));
    }

    static createCellOfChangeMinterMetadata(body: {
        queryId: uint64
        newMetadata: c.Cell
    }) {
        return ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body));
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

    static createCellOfRequestUpgradeCode(body: {
        targetAddress?: c.Address | null /* = null */
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    static createCellOfTopUpTons(body: {
        latestFiWalletCode?: c.Cell | null /* = null */
    }) {
        return TopUpTons.toCell(TopUpTons.create(body));
    }

    static createCellOfDestroy(body: {
    }) {
        return Destroy.toCell(Destroy.create());
    }

    static createCellOfPaybackShortfall(body: {
        queryId: uint64
        lender: c.Address
        shortfall: coins
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }) {
        return PaybackShortfall.toCell(PaybackShortfall.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendMintNewJettons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintNewJettons.toCell(MintNewJettons.create(body)),
            ...extraOptions
        });
    }

    async sendNotifyMinter(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
        customPayload?: c.Cell | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: NotifyMinter.toCell(NotifyMinter.create(body)),
            ...extraOptions
        });
    }

    async sendRequestWalletAddress(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestWalletAddress.toCell(RequestWalletAddress.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newAdminAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMinterMetadata(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newMetadata: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body)),
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

    async sendRequestUpgradeCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        targetAddress?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUpgradeCode.toCell(RequestUpgradeCode.create(body)),
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

    async sendDestroy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Destroy.toCell(Destroy.create()),
            ...extraOptions
        });
    }

    async sendPaybackShortfall(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        lender: c.Address
        shortfall: coins
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: PaybackShortfall.toCell(PaybackShortfall.create(body)),
            ...extraOptions
        });
    }

    async getState(provider: ContractProvider): Promise<PersonalStore> {
        const r = StackReader.fromGetMethod(6, await provider.get('get_state', []));
        return ({
            $: 'PersonalStore',
            totalSupply: r.readBigInt(),
            fiJettonAddress: r.readSlice().loadAddress(),
            adminAddress: r.readSlice().loadAddress(),
            metadataUri: r.readNullable<c.Cell>(
                (r) => r.readCell()
            ),
            version: r.readBigInt(),
            codes: ({
                $: 'PersonalCodes',
                latestPersonalWalletCode: r.readCell(),
            }),
        });
    }

    async getJettonData(provider: ContractProvider): Promise<JettonDataReply> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_jetton_data', []));
        return ({
            $: 'JettonDataReply',
            totalSupply: r.readBigInt(),
            mintable: r.readBoolean(),
            adminAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            jettonContent: r.readCellRef<OnchainMetadataReply>(OnchainMetadataReply.fromSlice),
            jettonWalletCode: r.readCell(),
        });
    }

    async getWalletAddress(provider: ContractProvider, owner: c.Address): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_wallet_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(owner,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readSlice().loadAddress();
    }
}
