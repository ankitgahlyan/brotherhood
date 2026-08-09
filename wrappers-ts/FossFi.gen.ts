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
 > struct (0x00001054) InformMinterInviteInternal {
 >     queryId: uint64
 >     sender: address
 >     invitor: address
 >     username: string
 >     city: string
 > }
 */
export interface InformMinterInviteInternal {
    readonly $: 'InformMinterInviteInternal'
    queryId: uint64
    sender: c.Address
    invitor: c.Address
    username: string
    city: string
}

export const InformMinterInviteInternal = {
    PREFIX: 0x00001054,

    create(args: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        username: string
        city: string
    }): InformMinterInviteInternal {
        return {
            $: 'InformMinterInviteInternal',
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
        }
    },
    store(self: InformMinterInviteInternal, b: c.Builder): void {
        b.storeUint(0x00001054, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeStringRefTail(self.username);
        b.storeStringRefTail(self.city);
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
 > }
 */
export interface InformMinterChangeCity {
    readonly $: 'InformMinterChangeCity'
    queryId: uint64
    owner: c.Address
    oldCity: string
    newCity: string
}

export const InformMinterChangeCity = {
    PREFIX: 0x000010a3,

    create(args: {
        queryId: uint64
        owner: c.Address
        oldCity: string
        newCity: string
    }): InformMinterChangeCity {
        return {
            $: 'InformMinterChangeCity',
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
        }
    },
    store(self: InformMinterChangeCity, b: c.Builder): void {
        b.storeUint(0x000010a3, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeStringRefTail(self.oldCity);
        b.storeStringRefTail(self.newCity);
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
 >     lotteryCode: cell?
 >     latestFiWalletCode: cell?
 >     currentRequest: Cell<CurrentRequest>?
 >     locationAddrs: map<uint8, address>
 > }
 */
export interface FiCodes {
    readonly $: 'FiCodes'
    totalAccounts: uint33 /* = 0 */
    lotteryCode: c.Cell | null /* = null */
    latestFiWalletCode: c.Cell | null /* = null */
    currentRequest: CellRef<CurrentRequest> | null /* = null */
    locationAddrs: c.Dictionary<uint8, c.Address> /* = [] as map<uint8, address> */
}

export const FiCodes = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        lotteryCode?: c.Cell | null /* = null */
        latestFiWalletCode?: c.Cell | null /* = null */
        currentRequest?: CellRef<CurrentRequest> | null /* = null */
        locationAddrs: c.Dictionary<uint8, c.Address> /* = [] as map<uint8, address> */
    }): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: 0n,
            lotteryCode: null,
            latestFiWalletCode: null,
            currentRequest: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: s.loadUintBig(33),
            lotteryCode: s.loadBoolean() ? s.loadRef() : null,
            latestFiWalletCode: s.loadBoolean() ? s.loadRef() : null,
            currentRequest: s.loadBoolean() ? loadCellRef<CurrentRequest>(s, CurrentRequest.fromSlice) : null,
            locationAddrs: c.Dictionary.load<uint8, c.Address>(c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
                (s) => s.loadAddress(),
                (v,b) => b.storeAddress(v)
            ), s),
        }
    },
    store(self: FiCodes, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        storeTolkNullable<c.Cell>(self.lotteryCode, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<c.Cell>(self.latestFiWalletCode, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<CellRef<CurrentRequest>>(self.currentRequest, b,
            (v,b) => storeCellRef<CurrentRequest>(v, b, CurrentRequest.store)
        );
        b.storeDict<uint8, c.Address>(self.locationAddrs, c.Dictionary.Keys.BigUint(8), createDictionaryValue<c.Address>(
            (s) => s.loadAddress(),
            (v,b) => b.storeAddress(v)
        ));
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
    }) {
        return InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body));
    }

    static createCellOfInformMinterChangeCity(body: {
        queryId: uint64
        owner: c.Address
        oldCity: string
        newCity: string
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
