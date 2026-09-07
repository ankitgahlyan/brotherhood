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
 > }
 */
export interface RequestUpgradeCode {
    readonly $: 'RequestUpgradeCode'
}

export const RequestUpgradeCode = {
    PREFIX: 0x00001008,

    create(): RequestUpgradeCode {
        return {
            $: 'RequestUpgradeCode',
        }
    },
    fromSlice(s: c.Slice): RequestUpgradeCode {
        loadAndCheckPrefix32(s, 0x00001008, 'RequestUpgradeCode');
        return {
            $: 'RequestUpgradeCode',
        }
    },
    store(self: RequestUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00001008, 32);
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
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create());
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
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUpgradeCode.toCell(RequestUpgradeCode.create()),
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
