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
 > struct (0x00001011) PushUpgradeCode {
 >     queryId: uint64
 >     targetAddress: address
 > }
 */
export interface PushUpgradeCode {
    readonly $: 'PushUpgradeCode'
    queryId: uint64 /* = 0 */
    targetAddress: c.Address
}

export const PushUpgradeCode = {
    PREFIX: 0x00001011,

    create(args: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }): PushUpgradeCode {
        return {
            $: 'PushUpgradeCode',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): PushUpgradeCode {
        loadAndCheckPrefix32(s, 0x00001011, 'PushUpgradeCode');
        return {
            $: 'PushUpgradeCode',
            queryId: s.loadUintBig(64),
            targetAddress: s.loadAddress(),
        }
    },
    store(self: PushUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00001011, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.targetAddress);
    },
    toCell(self: PushUpgradeCode): c.Cell {
        return makeCellFrom<PushUpgradeCode>(self, PushUpgradeCode.store);
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

    static createCellOfPushUpgradeCode(body: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }) {
        return PushUpgradeCode.toCell(PushUpgradeCode.create(body));
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

    async sendPushUpgradeCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: PushUpgradeCode.toCell(PushUpgradeCode.create(body)),
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
