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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

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
 > struct (0x2c76b973) RequestWalletAddress {
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
    PREFIX: 0x2c76b973,

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
        loadAndCheckPrefix32(s, 0x2c76b973, 'RequestWalletAddress');
        return {
            $: 'RequestWalletAddress',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            includeOwnerAddress: s.loadBoolean(),
        }
    },
    store(self: RequestWalletAddress, b: c.Builder): void {
        b.storeUint(0x2c76b973, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeBit(self.includeOwnerAddress);
    },
    toCell(self: RequestWalletAddress): c.Cell {
        return makeCellFrom<RequestWalletAddress>(self, RequestWalletAddress.store);
    }
}

/**
 > struct (0xd1735400) ResponseWalletAddress {
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
    PREFIX: 0xd1735400,

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
        loadAndCheckPrefix32(s, 0xd1735400, 'ResponseWalletAddress');
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
        b.storeUint(0xd1735400, 32);
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
 > struct (0x6501f354) ChangeMinterAdmin {
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
    PREFIX: 0x6501f354,

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
        loadAndCheckPrefix32(s, 0x6501f354, 'ChangeMinterAdmin');
        return {
            $: 'ChangeMinterAdmin',
            queryId: s.loadUintBig(64),
            newAdminAddress: s.loadAddress(),
        }
    },
    store(self: ChangeMinterAdmin, b: c.Builder): void {
        b.storeUint(0x6501f354, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newAdminAddress);
    },
    toCell(self: ChangeMinterAdmin): c.Cell {
        return makeCellFrom<ChangeMinterAdmin>(self, ChangeMinterAdmin.store);
    }
}

/**
 > struct (0xfb88e119) ClaimMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface ClaimMinterAdmin {
    readonly $: 'ClaimMinterAdmin'
    queryId: uint64
}

export const ClaimMinterAdmin = {
    PREFIX: 0xfb88e119,

    create(args: {
        queryId: uint64
    }): ClaimMinterAdmin {
        return {
            $: 'ClaimMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimMinterAdmin {
        loadAndCheckPrefix32(s, 0xfb88e119, 'ClaimMinterAdmin');
        return {
            $: 'ClaimMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimMinterAdmin, b: c.Builder): void {
        b.storeUint(0xfb88e119, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimMinterAdmin): c.Cell {
        return makeCellFrom<ClaimMinterAdmin>(self, ClaimMinterAdmin.store);
    }
}

/**
 > struct (0x7431f221) DropMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface DropMinterAdmin {
    readonly $: 'DropMinterAdmin'
    queryId: uint64
}

export const DropMinterAdmin = {
    PREFIX: 0x7431f221,

    create(args: {
        queryId: uint64
    }): DropMinterAdmin {
        return {
            $: 'DropMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): DropMinterAdmin {
        loadAndCheckPrefix32(s, 0x7431f221, 'DropMinterAdmin');
        return {
            $: 'DropMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DropMinterAdmin, b: c.Builder): void {
        b.storeUint(0x7431f221, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DropMinterAdmin): c.Cell {
        return makeCellFrom<DropMinterAdmin>(self, DropMinterAdmin.store);
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
 > struct (0xcb862902) ChangeMinterMetadata {
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
    PREFIX: 0xcb862902,

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
        loadAndCheckPrefix32(s, 0xcb862902, 'ChangeMinterMetadata');
        return {
            $: 'ChangeMinterMetadata',
            queryId: s.loadUintBig(64),
            newMetadata: s.loadRef(),
        }
    },
    store(self: ChangeMinterMetadata, b: c.Builder): void {
        b.storeUint(0xcb862902, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.newMetadata);
    },
    toCell(self: ChangeMinterMetadata): c.Cell {
        return makeCellFrom<ChangeMinterMetadata>(self, ChangeMinterMetadata.store);
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
 > struct (0x00000011) ApproveUpgrade {
 > }
 */
export interface ApproveUpgrade {
    readonly $: 'ApproveUpgrade'
}

export const ApproveUpgrade = {
    PREFIX: 0x00000011,

    create(): ApproveUpgrade {
        return {
            $: 'ApproveUpgrade',
        }
    },
    fromSlice(s: c.Slice): ApproveUpgrade {
        loadAndCheckPrefix32(s, 0x00000011, 'ApproveUpgrade');
        return {
            $: 'ApproveUpgrade',
        }
    },
    store(self: ApproveUpgrade, b: c.Builder): void {
        b.storeUint(0x00000011, 32);
    },
    toCell(self: ApproveUpgrade): c.Cell {
        return makeCellFrom<ApproveUpgrade>(self, ApproveUpgrade.store);
    }
}

/**
 > struct (0x00000012) RejectUpgrade {
 > }
 */
export interface RejectUpgrade {
    readonly $: 'RejectUpgrade'
}

export const RejectUpgrade = {
    PREFIX: 0x00000012,

    create(): RejectUpgrade {
        return {
            $: 'RejectUpgrade',
        }
    },
    fromSlice(s: c.Slice): RejectUpgrade {
        loadAndCheckPrefix32(s, 0x00000012, 'RejectUpgrade');
        return {
            $: 'RejectUpgrade',
        }
    },
    store(self: RejectUpgrade, b: c.Builder): void {
        b.storeUint(0x00000012, 32);
    },
    toCell(self: RejectUpgrade): c.Cell {
        return makeCellFrom<RejectUpgrade>(self, RejectUpgrade.store);
    }
}

/**
 > struct (0x00000013) HotUpgrade {
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
    PREFIX: 0x00000013,

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
        loadAndCheckPrefix32(s, 0x00000013, 'HotUpgrade');
        return {
            $: 'HotUpgrade',
            additionalData: s.loadBoolean() ? s.loadRef() : null,
            code: s.loadRef(),
        }
    },
    store(self: HotUpgrade, b: c.Builder): void {
        b.storeUint(0x00000013, 32);
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
 > struct (0x22222222) LotteryWin {
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
    PREFIX: 0x22222222,

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
        loadAndCheckPrefix32(s, 0x22222222, 'LotteryWin');
        return {
            $: 'LotteryWin',
            entryAmount: s.loadCoins(),
            amt: s.loadCoins(),
            winner: s.loadAddress(),
        }
    },
    store(self: LotteryWin, b: c.Builder): void {
        b.storeUint(0x22222222, 32);
        b.storeCoins(self.entryAmount);
        b.storeCoins(self.amt);
        b.storeAddress(self.winner);
    },
    toCell(self: LotteryWin): c.Cell {
        return makeCellFrom<LotteryWin>(self, LotteryWin.store);
    }
}

/**
 > struct FiCodes {
 >     totalAccounts: uint33
 >     lotteryCode: cell?
 >     latestFiWalletCode: cell?
 >     currentRequest: Cell<CurrentRequest>?
 > }
 */
export interface FiCodes {
    readonly $: 'FiCodes'
    totalAccounts: uint33 /* = 0 */
    lotteryCode: c.Cell | null /* = null */
    latestFiWalletCode: c.Cell | null /* = null */
    currentRequest: CellRef<CurrentRequest> | null /* = null */
}

export const FiCodes = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        lotteryCode?: c.Cell | null /* = null */
        latestFiWalletCode?: c.Cell | null /* = null */
        currentRequest?: CellRef<CurrentRequest> | null /* = null */
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
    adminHandoff: CellRef<AdminHandoff> | null /* = null */
    metadata: c.Cell
    others: CellRef<FiCodes>
}

export const FiStore = {
    create(args: {
        totalSupply?: coins /* = 0 */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        adminHandoff?: CellRef<AdminHandoff> | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }): FiStore {
        return {
            $: 'FiStore',
            totalSupply: 0n,
            walletVersion: 0n,
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
            adminHandoff: s.loadBoolean() ? loadCellRef<AdminHandoff>(s, AdminHandoff.fromSlice) : null,
            metadata: s.loadRef(),
            others: loadCellRef<FiCodes>(s, FiCodes.fromSlice),
        }
    },
    store(self: FiStore, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        b.storeUint(self.walletVersion, 10);
        b.storeAddress(self.adminAddress);
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
        'Errors.NotOwner': 73,
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

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    static createCellOfInformMinterInviteInternal(body: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        id: string
    }) {
        return InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body));
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
        id: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body)),
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
        const r = StackReader.fromGetMethod(6, await provider.get('get_jetton_data_all', []));
        return ({
            $: 'FiStore',
            totalSupply: r.readBigInt(),
            walletVersion: r.readBigInt(),
            adminAddress: r.readSlice().loadAddress(),
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
