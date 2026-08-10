// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a FossFi contract in Tolk.
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

    readDictionary<K extends c.DictionaryKeyTypes, V>(keySerializer: c.DictionaryKey<K>, valueSerializer: c.DictionaryValue<V>): c.Dictionary<K, V> {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return c.Dictionary.empty<K, V>(keySerializer, valueSerializer);
        }
        return c.Dictionary.loadDirect<K, V>(keySerializer, valueSerializer, this.readCell());
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint8 = bigint
type uint10 = bigint
type uint32 = bigint
type uint33 = bigint
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
 > struct (0x00001003) ClaimMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface ClaimMinterAdmin {
    readonly $: 'ClaimMinterAdmin'
    queryId: uint64
}

export const ClaimMinterAdmin = {
    PREFIX: 0x00001003,

    create(args: {
        queryId: uint64
    }): ClaimMinterAdmin {
        return {
            $: 'ClaimMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimMinterAdmin {
        loadAndCheckPrefix32(s, 0x00001003, 'ClaimMinterAdmin');
        return {
            $: 'ClaimMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimMinterAdmin, b: c.Builder): void {
        b.storeUint(0x00001003, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimMinterAdmin): c.Cell {
        return makeCellFrom<ClaimMinterAdmin>(self, ClaimMinterAdmin.store);
    }
}

/**
 > struct (0x00001004) DropMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface DropMinterAdmin {
    readonly $: 'DropMinterAdmin'
    queryId: uint64
}

export const DropMinterAdmin = {
    PREFIX: 0x00001004,

    create(args: {
        queryId: uint64
    }): DropMinterAdmin {
        return {
            $: 'DropMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): DropMinterAdmin {
        loadAndCheckPrefix32(s, 0x00001004, 'DropMinterAdmin');
        return {
            $: 'DropMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DropMinterAdmin, b: c.Builder): void {
        b.storeUint(0x00001004, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DropMinterAdmin): c.Cell {
        return makeCellFrom<DropMinterAdmin>(self, DropMinterAdmin.store);
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
 > struct (0x00001009) ApproveUpgrade {
 > }
 */
export interface ApproveUpgrade {
    readonly $: 'ApproveUpgrade'
}

export const ApproveUpgrade = {
    PREFIX: 0x00001009,

    create(): ApproveUpgrade {
        return {
            $: 'ApproveUpgrade',
        }
    },
    fromSlice(s: c.Slice): ApproveUpgrade {
        loadAndCheckPrefix32(s, 0x00001009, 'ApproveUpgrade');
        return {
            $: 'ApproveUpgrade',
        }
    },
    store(self: ApproveUpgrade, b: c.Builder): void {
        b.storeUint(0x00001009, 32);
    },
    toCell(self: ApproveUpgrade): c.Cell {
        return makeCellFrom<ApproveUpgrade>(self, ApproveUpgrade.store);
    }
}

/**
 > struct (0x0000100a) RejectUpgrade {
 > }
 */
export interface RejectUpgrade {
    readonly $: 'RejectUpgrade'
}

export const RejectUpgrade = {
    PREFIX: 0x0000100a,

    create(): RejectUpgrade {
        return {
            $: 'RejectUpgrade',
        }
    },
    fromSlice(s: c.Slice): RejectUpgrade {
        loadAndCheckPrefix32(s, 0x0000100a, 'RejectUpgrade');
        return {
            $: 'RejectUpgrade',
        }
    },
    store(self: RejectUpgrade, b: c.Builder): void {
        b.storeUint(0x0000100a, 32);
    },
    toCell(self: RejectUpgrade): c.Cell {
        return makeCellFrom<RejectUpgrade>(self, RejectUpgrade.store);
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
 > struct (0x0000100c) SetLocationAddresses {
 >     queryId: uint64
 >     locationAddrs: map<uint8, address>
 > }
 */
export interface SetLocationAddresses {
    readonly $: 'SetLocationAddresses'
    queryId: uint64
    locationAddrs: c.Dictionary<uint8, c.Address>
}

export const SetLocationAddresses = {
    PREFIX: 0x0000100c,

    create(args: {
        queryId: uint64
        locationAddrs: c.Dictionary<uint8, c.Address>
    }): SetLocationAddresses {
        return {
            $: 'SetLocationAddresses',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetLocationAddresses {
        loadAndCheckPrefix32(s, 0x0000100c, 'SetLocationAddresses');
        return {
            $: 'SetLocationAddresses',
            queryId: s.loadUintBig(64),
            locationAddrs: c.Dictionary.load<uint8, c.Address>(c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
                (s) => s.loadAddress(),
                (v,b) => b.storeAddress(v)
            ), s),
        }
    },
    store(self: SetLocationAddresses, b: c.Builder): void {
        b.storeUint(0x0000100c, 32);
        b.storeUint(self.queryId, 64);
        b.storeDict<uint8, c.Address>(self.locationAddrs, c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
            (s) => s.loadAddress(),
            (v,b) => b.storeAddress(v)
        ));
    },
    toCell(self: SetLocationAddresses): c.Cell {
        return makeCellFrom<SetLocationAddresses>(self, SetLocationAddresses.store);
    }
}

/**
 > struct (0x0000100d) ChangeDaoAddress {
 >     queryId: uint64
 >     newDaoAddress: address?
 > }
 */
export interface ChangeDaoAddress {
    readonly $: 'ChangeDaoAddress'
    queryId: uint64
    newDaoAddress: c.Address | null
}

export const ChangeDaoAddress = {
    PREFIX: 0x0000100d,

    create(args: {
        queryId: uint64
        newDaoAddress: c.Address | null
    }): ChangeDaoAddress {
        return {
            $: 'ChangeDaoAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeDaoAddress {
        loadAndCheckPrefix32(s, 0x0000100d, 'ChangeDaoAddress');
        return {
            $: 'ChangeDaoAddress',
            queryId: s.loadUintBig(64),
            newDaoAddress: s.loadMaybeAddress(),
        }
    },
    store(self: ChangeDaoAddress, b: c.Builder): void {
        b.storeUint(0x0000100d, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newDaoAddress);
    },
    toCell(self: ChangeDaoAddress): c.Cell {
        return makeCellFrom<ChangeDaoAddress>(self, ChangeDaoAddress.store);
    }
}

/**
 > struct (0x0000100e) RequestTotalAccounts {
 >     queryId: uint64
 > }
 */
export interface RequestTotalAccounts {
    readonly $: 'RequestTotalAccounts'
    queryId: uint64
}

export const RequestTotalAccounts = {
    PREFIX: 0x0000100e,

    create(args: {
        queryId: uint64
    }): RequestTotalAccounts {
        return {
            $: 'RequestTotalAccounts',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestTotalAccounts {
        loadAndCheckPrefix32(s, 0x0000100e, 'RequestTotalAccounts');
        return {
            $: 'RequestTotalAccounts',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: RequestTotalAccounts, b: c.Builder): void {
        b.storeUint(0x0000100e, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: RequestTotalAccounts): c.Cell {
        return makeCellFrom<RequestTotalAccounts>(self, RequestTotalAccounts.store);
    }
}

/**
 > struct (0x0000100f) ResponseTotalAccounts {
 >     queryId: uint64
 >     totalAccounts: uint33
 > }
 */
export interface ResponseTotalAccounts {
    readonly $: 'ResponseTotalAccounts'
    queryId: uint64
    totalAccounts: uint33
}

export const ResponseTotalAccounts = {
    PREFIX: 0x0000100f,

    create(args: {
        queryId: uint64
        totalAccounts: uint33
    }): ResponseTotalAccounts {
        return {
            $: 'ResponseTotalAccounts',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResponseTotalAccounts {
        loadAndCheckPrefix32(s, 0x0000100f, 'ResponseTotalAccounts');
        return {
            $: 'ResponseTotalAccounts',
            queryId: s.loadUintBig(64),
            totalAccounts: s.loadUintBig(33),
        }
    },
    store(self: ResponseTotalAccounts, b: c.Builder): void {
        b.storeUint(0x0000100f, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.totalAccounts, 33);
    },
    toCell(self: ResponseTotalAccounts): c.Cell {
        return makeCellFrom<ResponseTotalAccounts>(self, ResponseTotalAccounts.store);
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
 > struct (0x000010a4) LocationRegisterCity {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 > }
 */
export interface LocationRegisterCity {
    readonly $: 'LocationRegisterCity'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const LocationRegisterCity = {
    PREFIX: 0x000010a4,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): LocationRegisterCity {
        return {
            $: 'LocationRegisterCity',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationRegisterCity {
        loadAndCheckPrefix32(s, 0x000010a4, 'LocationRegisterCity');
        return {
            $: 'LocationRegisterCity',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationRegisterCity, b: c.Builder): void {
        b.storeUint(0x000010a4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationRegisterCity): c.Cell {
        return makeCellFrom<LocationRegisterCity>(self, LocationRegisterCity.store);
    }
}

/**
 > struct (0x000010a5) LocationUnregisterCity {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 > }
 */
export interface LocationUnregisterCity {
    readonly $: 'LocationUnregisterCity'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const LocationUnregisterCity = {
    PREFIX: 0x000010a5,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): LocationUnregisterCity {
        return {
            $: 'LocationUnregisterCity',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationUnregisterCity {
        loadAndCheckPrefix32(s, 0x000010a5, 'LocationUnregisterCity');
        return {
            $: 'LocationUnregisterCity',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationUnregisterCity, b: c.Builder): void {
        b.storeUint(0x000010a5, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationUnregisterCity): c.Cell {
        return makeCellFrom<LocationUnregisterCity>(self, LocationUnregisterCity.store);
    }
}

/**
 > struct CurrentRequest {
 >     newUpgrade: Upgrade
 >     timestamp: uint32
 > }
 */
export interface CurrentRequest {
    readonly $: 'CurrentRequest'
    newUpgrade: Upgrade
    timestamp: uint32
}

export const CurrentRequest = {
    create(args: {
        newUpgrade: Upgrade
        timestamp: uint32
    }): CurrentRequest {
        return {
            $: 'CurrentRequest',
            ...args
        }
    },
    fromSlice(s: c.Slice): CurrentRequest {
        return {
            $: 'CurrentRequest',
            newUpgrade: Upgrade.fromSlice(s),
            timestamp: s.loadUintBig(32),
        }
    },
    store(self: CurrentRequest, b: c.Builder): void {
        Upgrade.store(self.newUpgrade, b);
        b.storeUint(self.timestamp, 32);
    },
    toCell(self: CurrentRequest): c.Cell {
        return makeCellFrom<CurrentRequest>(self, CurrentRequest.store);
    }
}

/**
 > struct AdminHandoff {
 >     newAdminAddress: address
 >     timestamp: uint32
 > }
 */
export interface AdminHandoff {
    readonly $: 'AdminHandoff'
    newAdminAddress: c.Address
    timestamp: uint32
}

export const AdminHandoff = {
    create(args: {
        newAdminAddress: c.Address
        timestamp: uint32
    }): AdminHandoff {
        return {
            $: 'AdminHandoff',
            ...args
        }
    },
    fromSlice(s: c.Slice): AdminHandoff {
        return {
            $: 'AdminHandoff',
            newAdminAddress: s.loadAddress(),
            timestamp: s.loadUintBig(32),
        }
    },
    store(self: AdminHandoff, b: c.Builder): void {
        b.storeAddress(self.newAdminAddress);
        b.storeUint(self.timestamp, 32);
    },
    toCell(self: AdminHandoff): c.Cell {
        return makeCellFrom<AdminHandoff>(self, AdminHandoff.store);
    }
}

/**
 > struct FiCodes {
 >     totalAccounts: uint33
 >     lotteryCode: cell
 >     latestFiWalletCode: cell
 >     currentRequest: Cell<CurrentRequest>?
 >     locationAddrs: map<uint8, address>?
 > }
 */
export interface FiCodes {
    readonly $: 'FiCodes'
    totalAccounts: uint33 /* = 0 */
    lotteryCode: c.Cell
    latestFiWalletCode: c.Cell
    currentRequest: CellRef<CurrentRequest> | null /* = null */
    locationAddrs: c.Dictionary<uint8, c.Address> | null /* = null */
}

export const FiCodes = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        lotteryCode: c.Cell
        latestFiWalletCode: c.Cell
        currentRequest?: CellRef<CurrentRequest> | null /* = null */
        locationAddrs?: c.Dictionary<uint8, c.Address> | null /* = null */
    }): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: 0n,
            currentRequest: null,
            locationAddrs: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: s.loadUintBig(33),
            lotteryCode: s.loadRef(),
            latestFiWalletCode: s.loadRef(),
            currentRequest: s.loadBoolean() ? loadCellRef<CurrentRequest>(s, CurrentRequest.fromSlice) : null,
            locationAddrs: s.loadBoolean() ? c.Dictionary.load<uint8, c.Address>(c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
                (s) => s.loadAddress(),
                (v,b) => b.storeAddress(v)
            ), s) : null,
        }
    },
    store(self: FiCodes, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        b.storeRef(self.lotteryCode);
        b.storeRef(self.latestFiWalletCode);
        storeTolkNullable<CellRef<CurrentRequest>>(self.currentRequest, b,
            (v,b) => storeCellRef<CurrentRequest>(v, b, CurrentRequest.store)
        );
        storeTolkNullable<c.Dictionary<uint8, c.Address>>(self.locationAddrs, b,
            (v,b) => { b.storeDict<uint8, c.Address>(v, c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
                (s) => s.loadAddress(),
                (v,b) => b.storeAddress(v)
            )); }
        );
    },
    toCell(self: FiCodes): c.Cell {
        return makeCellFrom<FiCodes>(self, FiCodes.store);
    }
}

/**
 > struct FiStore {
 >     totalSupply: coins
 >     walletVersion: uint10
 >     adminAddress: address
 >     daoAddress: address?
 >     adminHandoff: Cell<AdminHandoff>?
 >     metadata: cell
 >     others: Cell<FiCodes>
 > }
 */
export interface FiStore {
    readonly $: 'FiStore'
    totalSupply: coins /* = 0 */
    walletVersion: uint10 /* = 0 */
    adminAddress: c.Address
    daoAddress: c.Address | null /* = null */
    adminHandoff: CellRef<AdminHandoff> | null /* = null */
    metadata: c.Cell
    others: CellRef<FiCodes>
}

export const FiStore = {
    create(args: {
        totalSupply?: coins /* = 0 */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        daoAddress?: c.Address | null /* = null */
        adminHandoff?: CellRef<AdminHandoff> | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }): FiStore {
        return {
            $: 'FiStore',
            totalSupply: 0n,
            walletVersion: 0n,
            daoAddress: null,
            adminHandoff: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiStore {
        return {
            $: 'FiStore',
            totalSupply: s.loadCoins(),
            walletVersion: s.loadUintBig(10),
            adminAddress: s.loadAddress(),
            daoAddress: s.loadMaybeAddress(),
            adminHandoff: s.loadBoolean() ? loadCellRef<AdminHandoff>(s, AdminHandoff.fromSlice) : null,
            metadata: s.loadRef(),
            others: loadCellRef<FiCodes>(s, FiCodes.fromSlice),
        }
    },
    store(self: FiStore, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        b.storeUint(self.walletVersion, 10);
        b.storeAddress(self.adminAddress);
        b.storeAddress(self.daoAddress);
        storeTolkNullable<CellRef<AdminHandoff>>(self.adminHandoff, b,
            (v,b) => storeCellRef<AdminHandoff>(v, b, AdminHandoff.store)
        );
        b.storeRef(self.metadata);
        storeCellRef<FiCodes>(self.others, b, FiCodes.store);
    },
    toCell(self: FiStore): c.Cell {
        return makeCellFrom<FiStore>(self, FiStore.store);
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

/**
 > struct (0x00001199) LotteryWin {
 >     entryAmount: coins
 >     amt: coins
 >     winner: address
 > }
 */
export interface LotteryWin {
    readonly $: 'LotteryWin'
    entryAmount: coins
    amt: coins
    winner: c.Address
}

export const LotteryWin = {
    PREFIX: 0x00001199,

    create(args: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }): LotteryWin {
        return {
            $: 'LotteryWin',
            ...args
        }
    },
    fromSlice(s: c.Slice): LotteryWin {
        loadAndCheckPrefix32(s, 0x00001199, 'LotteryWin');
        return {
            $: 'LotteryWin',
            entryAmount: s.loadCoins(),
            amt: s.loadCoins(),
            winner: s.loadAddress(),
        }
    },
    store(self: LotteryWin, b: c.Builder): void {
        b.storeUint(0x00001199, 32);
        b.storeCoins(self.entryAmount);
        b.storeCoins(self.amt);
        b.storeAddress(self.winner);
    },
    toCell(self: LotteryWin): c.Cell {
        return makeCellFrom<LotteryWin>(self, LotteryWin.store);
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
//    class FossFi
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

export class FossFi implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidOp': 72,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
        'Errors.Null': 404,
        'Errors.IncorrectSender': 700,
        'Errors.WaitMore': 735,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new FossFi(address);
    }

    static fromStorage(emptyStorage: {
        totalSupply?: coins /* = 0 */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        daoAddress?: c.Address | null /* = null */
        adminHandoff?: CellRef<AdminHandoff> | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FossFi.CodeCell,
            data: FiStore.toCell(FiStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FossFi(address, initialState);
    }

    static createCellOfMintNewJettons(body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }) {
        return MintNewJettons.toCell(MintNewJettons.create(body));
    }

    static createCellOfNotifyMinter(body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
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

    static createCellOfClaimMinterAdmin(body: {
        queryId: uint64
    }) {
        return ClaimMinterAdmin.toCell(ClaimMinterAdmin.create(body));
    }

    static createCellOfDropMinterAdmin(body: {
        queryId: uint64
    }) {
        return DropMinterAdmin.toCell(DropMinterAdmin.create(body));
    }

    static createCellOfChangeMinterMetadata(body: {
        queryId: uint64
        newMetadata: c.Cell
    }) {
        return ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body));
    }

    static createCellOfSetLocationAddresses(body: {
        queryId: uint64
        locationAddrs: c.Dictionary<uint8, c.Address>
    }) {
        return SetLocationAddresses.toCell(SetLocationAddresses.create(body));
    }

    static createCellOfChangeDaoAddress(body: {
        queryId: uint64
        newDaoAddress: c.Address | null
    }) {
        return ChangeDaoAddress.toCell(ChangeDaoAddress.create(body));
    }

    static createCellOfRequestTotalAccounts(body: {
        queryId: uint64
    }) {
        return RequestTotalAccounts.toCell(RequestTotalAccounts.create(body));
    }

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    static createCellOfInformMinterInviteInternal(body: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        username: string
        city: string
        cityLetter?: uint8 /* = 0 */
    }) {
        return InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body));
    }

    static createCellOfInformMinterChangeCity(body: {
        queryId: uint64
        owner: c.Address
        oldCity: string
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }) {
        return InformMinterChangeCity.toCell(InformMinterChangeCity.create(body));
    }

    static createCellOfRequestUpgradeCode(body: {
        sender: c.Address
        version: uint10
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    static createCellOfEnterLottery(body: {
        sender: c.Address
        amount: coins
    }) {
        return EnterLottery.toCell(EnterLottery.create(body));
    }

    static createCellOfLotteryWin(body: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }) {
        return LotteryWin.toCell(LotteryWin.create(body));
    }

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
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

    static createCellOfRejectUpgrade(body: {
    }) {
        return RejectUpgrade.toCell(RejectUpgrade.create());
    }

    static createCellOfApproveUpgrade(body: {
    }) {
        return ApproveUpgrade.toCell(ApproveUpgrade.create());
    }

    static createCellOfDestroy(body: {
    }) {
        return Destroy.toCell(Destroy.create());
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

    async sendClaimMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimMinterAdmin.toCell(ClaimMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendDropMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DropMinterAdmin.toCell(DropMinterAdmin.create(body)),
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

    async sendSetLocationAddresses(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        locationAddrs: c.Dictionary<uint8, c.Address>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetLocationAddresses.toCell(SetLocationAddresses.create(body)),
            ...extraOptions
        });
    }

    async sendChangeDaoAddress(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newDaoAddress: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeDaoAddress.toCell(ChangeDaoAddress.create(body)),
            ...extraOptions
        });
    }

    async sendRequestTotalAccounts(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestTotalAccounts.toCell(RequestTotalAccounts.create(body)),
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

    async sendInformMinterInviteInternal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        username: string
        city: string
        cityLetter?: uint8 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body)),
            ...extraOptions
        });
    }

    async sendInformMinterChangeCity(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        oldCity: string
        newCity: string
        oldCityLetter?: uint8 /* = 0 */
        newCityLetter?: uint8 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterChangeCity.toCell(InformMinterChangeCity.create(body)),
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

    async sendLotteryWin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LotteryWin.toCell(LotteryWin.create(body)),
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

    async sendRejectUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RejectUpgrade.toCell(RejectUpgrade.create()),
            ...extraOptions
        });
    }

    async sendApproveUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ApproveUpgrade.toCell(ApproveUpgrade.create()),
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

    async getTotalAccounts(provider: ContractProvider): Promise<uint33> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_total_accounts', []));
        return r.readBigInt();
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

    async getJettonDataAll(provider: ContractProvider): Promise<FiStore> {
        const r = StackReader.fromGetMethod(7, await provider.get('get_jetton_data_all', []));
        return ({
            $: 'FiStore',
            totalSupply: r.readBigInt(),
            walletVersion: r.readBigInt(),
            adminAddress: r.readSlice().loadAddress(),
            daoAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            adminHandoff: r.readNullable<CellRef<AdminHandoff>>(
                (r) => r.readCellRef<AdminHandoff>(AdminHandoff.fromSlice)
            ),
            metadata: r.readCell(),
            others: r.readCellRef<FiCodes>(FiCodes.fromSlice),
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

    async getLocationAddress(provider: ContractProvider, cityName: string): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_location_address', [
            { type: 'cell', cell: beginCell().storeStringTail(cityName).endCell() },
        ]));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }

    async getLocationAddresses(provider: ContractProvider): Promise<c.Dictionary<uint8, c.Address>> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_location_addresses', []));
        return r.readDictionary<uint8, c.Address>(c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
            (s) => s.loadAddress(),
            (v,b) => b.storeAddress(v)
        ));
    }

    async getDaoAddress(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_dao_address', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }
}
