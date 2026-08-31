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
 > struct (0x0000100c) ChangeDaoAddress {
 >     queryId: uint64
 >     newDaoAddress: address
 > }
 */
export interface ChangeDaoAddress {
    readonly $: 'ChangeDaoAddress'
    queryId: uint64
    newDaoAddress: c.Address
}

export const ChangeDaoAddress = {
    PREFIX: 0x0000100c,

    create(args: {
        queryId: uint64
        newDaoAddress: c.Address
    }): ChangeDaoAddress {
        return {
            $: 'ChangeDaoAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeDaoAddress {
        loadAndCheckPrefix32(s, 0x0000100c, 'ChangeDaoAddress');
        return {
            $: 'ChangeDaoAddress',
            queryId: s.loadUintBig(64),
            newDaoAddress: s.loadAddress(),
        }
    },
    store(self: ChangeDaoAddress, b: c.Builder): void {
        b.storeUint(0x0000100c, 32);
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
    queryId: uint64 /* = 0 */
}

export const RequestTotalAccounts = {
    PREFIX: 0x0000100e,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): RequestTotalAccounts {
        return {
            $: 'RequestTotalAccounts',
            queryId: 0n,
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
    queryId: uint64 /* = 0 */
    totalAccounts: uint33
}

export const ResponseTotalAccounts = {
    PREFIX: 0x0000100f,

    create(args: {
        queryId?: uint64 /* = 0 */
        totalAccounts: uint33
    }): ResponseTotalAccounts {
        return {
            $: 'ResponseTotalAccounts',
            queryId: 0n,
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
 > struct (0x000010a4) LocationAddMember {
 >     queryId: uint64
 >     userAddress: address
 >     sendExcessesTo: address?
 > }
 */
export interface LocationAddMember {
    readonly $: 'LocationAddMember'
    queryId: uint64
    userAddress: c.Address
    sendExcessesTo: c.Address | null
}

export const LocationAddMember = {
    PREFIX: 0x000010a4,

    create(args: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }): LocationAddMember {
        return {
            $: 'LocationAddMember',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationAddMember {
        loadAndCheckPrefix32(s, 0x000010a4, 'LocationAddMember');
        return {
            $: 'LocationAddMember',
            queryId: s.loadUintBig(64),
            userAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationAddMember, b: c.Builder): void {
        b.storeUint(0x000010a4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.userAddress);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationAddMember): c.Cell {
        return makeCellFrom<LocationAddMember>(self, LocationAddMember.store);
    }
}

/**
 > struct (0x000010a5) LocationRemoveMember {
 >     queryId: uint64
 >     userAddress: address
 >     sendExcessesTo: address?
 > }
 */
export interface LocationRemoveMember {
    readonly $: 'LocationRemoveMember'
    queryId: uint64
    userAddress: c.Address
    sendExcessesTo: c.Address | null
}

export const LocationRemoveMember = {
    PREFIX: 0x000010a5,

    create(args: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }): LocationRemoveMember {
        return {
            $: 'LocationRemoveMember',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationRemoveMember {
        loadAndCheckPrefix32(s, 0x000010a5, 'LocationRemoveMember');
        return {
            $: 'LocationRemoveMember',
            queryId: s.loadUintBig(64),
            userAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationRemoveMember, b: c.Builder): void {
        b.storeUint(0x000010a5, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.userAddress);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationRemoveMember): c.Cell {
        return makeCellFrom<LocationRemoveMember>(self, LocationRemoveMember.store);
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
 > }
 */
export interface FiCodes {
    readonly $: 'FiCodes'
    totalAccounts: uint33 /* = 0 */
    lotteryCode: c.Cell
    latestFiWalletCode: c.Cell
    currentRequest: CellRef<CurrentRequest> | null /* = null */
}

export const FiCodes = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        lotteryCode: c.Cell
        latestFiWalletCode: c.Cell
        currentRequest?: CellRef<CurrentRequest> | null /* = null */
    }): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: 0n,
            currentRequest: null,
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
        }
    },
    store(self: FiCodes, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        b.storeRef(self.lotteryCode);
        b.storeRef(self.latestFiWalletCode);
        storeTolkNullable<CellRef<CurrentRequest>>(self.currentRequest, b,
            (v,b) => storeCellRef<CurrentRequest>(v, b, CurrentRequest.store)
        );
    },
    toCell(self: FiCodes): c.Cell {
        return makeCellFrom<FiCodes>(self, FiCodes.store);
    }
}

/**
 > struct FiStore {
 >     totalSupply: coins
 >     offChainRulesHash: string_prefixed0x
 >     walletVersion: uint10
 >     adminAddress: address
 >     daoAddress: address
 >     adminHandoff: Cell<AdminHandoff>?
 >     metadata: cell
 >     others: Cell<FiCodes>
 > }
 */
export interface FiStore {
    readonly $: 'FiStore'
    totalSupply: coins /* = 0 */
    offChainRulesHash: string_prefixed0x /* = "" */
    walletVersion: uint10 /* = 0 */
    adminAddress: c.Address
    daoAddress: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
    adminHandoff: CellRef<AdminHandoff> | null /* = null */
    metadata: c.Cell
    others: CellRef<FiCodes>
}

export const FiStore = {
    create(args: {
        totalSupply?: coins /* = 0 */
        offChainRulesHash?: string_prefixed0x /* = "" */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        daoAddress?: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
        adminHandoff?: CellRef<AdminHandoff> | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }): FiStore {
        return {
            $: 'FiStore',
            totalSupply: 0n,
            offChainRulesHash: "",
            walletVersion: 0n,
            daoAddress: c.Address.parse('0:0000000000000000000000000000000000000000000000000000000000000000'),
            adminHandoff: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiStore {
        return {
            $: 'FiStore',
            totalSupply: s.loadCoins(),
            offChainRulesHash: string_prefixed0x.fromSlice(s),
            walletVersion: s.loadUintBig(10),
            adminAddress: s.loadAddress(),
            daoAddress: s.loadAddress(),
            adminHandoff: s.loadBoolean() ? loadCellRef<AdminHandoff>(s, AdminHandoff.fromSlice) : null,
            metadata: s.loadRef(),
            others: loadCellRef<FiCodes>(s, FiCodes.fromSlice),
        }
    },
    store(self: FiStore, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        string_prefixed0x.store(self.offChainRulesHash, b);
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
 > struct (0x0000119b) UpgradeLotteryCode {
 >     newCode: cell
 > }
 */
export interface UpgradeLotteryCode {
    readonly $: 'UpgradeLotteryCode'
    newCode: c.Cell
}

export const UpgradeLotteryCode = {
    PREFIX: 0x0000119b,

    create(args: {
        newCode: c.Cell
    }): UpgradeLotteryCode {
        return {
            $: 'UpgradeLotteryCode',
            ...args
        }
    },
    fromSlice(s: c.Slice): UpgradeLotteryCode {
        loadAndCheckPrefix32(s, 0x0000119b, 'UpgradeLotteryCode');
        return {
            $: 'UpgradeLotteryCode',
            newCode: s.loadRef(),
        }
    },
    store(self: UpgradeLotteryCode, b: c.Builder): void {
        b.storeUint(0x0000119b, 32);
        b.storeRef(self.newCode);
    },
    toCell(self: UpgradeLotteryCode): c.Cell {
        return makeCellFrom<UpgradeLotteryCode>(self, UpgradeLotteryCode.store);
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
        offChainRulesHash?: string_prefixed0x /* = "" */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        daoAddress?: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
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

    static createCellOfChangeDaoAddress(body: {
        queryId: uint64
        newDaoAddress: c.Address
    }) {
        return ChangeDaoAddress.toCell(ChangeDaoAddress.create(body));
    }

    static createCellOfRequestTotalAccounts(body: {
        queryId?: uint64 /* = 0 */
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
        h3Cell: string
        country?: uint16 /* = 0 */
    }) {
        return InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body));
    }

    static createCellOfInformMinterChangeLocation(body: {
        queryId: uint64
        owner: c.Address
        oldH3Cell: string
        newH3Cell: string
    }) {
        return InformMinterChangeLocation.toCell(InformMinterChangeLocation.create(body));
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

    static createCellOfUpgradeLotteryCode(body: {
        newCode: c.Cell
    }) {
        return UpgradeLotteryCode.toCell(UpgradeLotteryCode.create(body));
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

    async sendChangeDaoAddress(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newDaoAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeDaoAddress.toCell(ChangeDaoAddress.create(body)),
            ...extraOptions
        });
    }

    async sendRequestTotalAccounts(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
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
        h3Cell: string
        country?: uint16 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body)),
            ...extraOptions
        });
    }

    async sendInformMinterChangeLocation(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        oldH3Cell: string
        newH3Cell: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterChangeLocation.toCell(InformMinterChangeLocation.create(body)),
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

    async sendUpgradeLotteryCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        newCode: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UpgradeLotteryCode.toCell(UpgradeLotteryCode.create(body)),
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

    async getDaoAddress(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_dao_address', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
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
        const r = StackReader.fromGetMethod(8, await provider.get('get_jetton_data_all', []));
        return ({
            $: 'FiStore',
            totalSupply: r.readBigInt(),
            offChainRulesHash: r.readSnakeString(),
            walletVersion: r.readBigInt(),
            adminAddress: r.readSlice().loadAddress(),
            daoAddress: r.readSlice().loadAddress(),
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
}
