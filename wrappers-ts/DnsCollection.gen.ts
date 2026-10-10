// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a DnsCollection contract in Tolk.
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

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint32 = bigint
type uint64 = bigint

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
 > struct (0x370fec51) FillUp {
 >     queryId: uint64
 > }
 */
export interface FillUp {
    readonly $: 'FillUp'
    queryId: uint64
}

export const FillUp = {
    PREFIX: 0x370fec51,

    create(args: {
        queryId: uint64
    }): FillUp {
        return {
            $: 'FillUp',
            ...args
        }
    },
    fromSlice(s: c.Slice): FillUp {
        loadAndCheckPrefix32(s, 0x370fec51, 'FillUp');
        return {
            $: 'FillUp',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: FillUp, b: c.Builder): void {
        b.storeUint(0x370fec51, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: FillUp): c.Cell {
        return makeCellFrom<FillUp>(self, FillUp.store);
    }
}

/**
 > struct (0xd53276db) Excesses {
 >     queryId: uint64
 > }
 */
export interface Excesses {
    readonly $: 'Excesses'
    queryId: uint64
}

export const Excesses = {
    PREFIX: 0xd53276db,

    create(args: {
        queryId: uint64
    }): Excesses {
        return {
            $: 'Excesses',
            ...args
        }
    },
    fromSlice(s: c.Slice): Excesses {
        loadAndCheckPrefix32(s, 0xd53276db, 'Excesses');
        return {
            $: 'Excesses',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: Excesses, b: c.Builder): void {
        b.storeUint(0xd53276db, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: Excesses): c.Cell {
        return makeCellFrom<Excesses>(self, Excesses.store);
    }
}

/**
 > struct (0x59a3c821) WithdrawFees {
 >     queryId: uint64
 >     amount: coins
 >     recipient: address
 > }
 */
export interface WithdrawFees {
    readonly $: 'WithdrawFees'
    queryId: uint64
    amount: coins
    recipient: c.Address
}

export const WithdrawFees = {
    PREFIX: 0x59a3c821,

    create(args: {
        queryId: uint64
        amount: coins
        recipient: c.Address
    }): WithdrawFees {
        return {
            $: 'WithdrawFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): WithdrawFees {
        loadAndCheckPrefix32(s, 0x59a3c821, 'WithdrawFees');
        return {
            $: 'WithdrawFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            recipient: s.loadAddress(),
        }
    },
    store(self: WithdrawFees, b: c.Builder): void {
        b.storeUint(0x59a3c821, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.recipient);
    },
    toCell(self: WithdrawFees): c.Cell {
        return makeCellFrom<WithdrawFees>(self, WithdrawFees.store);
    }
}

/**
 > struct (0x2c159bf4) MintDomainFor {
 >     queryId: uint64
 >     targetOwner: address
 >     payload: RemainingBitsAndRefs
 > }
 */
export interface MintDomainFor {
    readonly $: 'MintDomainFor'
    queryId: uint64
    targetOwner: c.Address
    payload: RemainingBitsAndRefs
}

export const MintDomainFor = {
    PREFIX: 0x2c159bf4,

    create(args: {
        queryId: uint64
        targetOwner: c.Address
        payload: RemainingBitsAndRefs
    }): MintDomainFor {
        return {
            $: 'MintDomainFor',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintDomainFor {
        loadAndCheckPrefix32(s, 0x2c159bf4, 'MintDomainFor');
        return {
            $: 'MintDomainFor',
            queryId: s.loadUintBig(64),
            targetOwner: s.loadAddress(),
            payload: loadTolkRemaining(s),
        }
    },
    store(self: MintDomainFor, b: c.Builder): void {
        b.storeUint(0x2c159bf4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.targetOwner);
        storeTolkRemaining(self.payload, b);
    },
    toCell(self: MintDomainFor): c.Cell {
        return makeCellFrom<MintDomainFor>(self, MintDomainFor.store);
    }
}

/**
 > struct (0x646e7375) UpgradeDnsItem {
 >     queryId: uint64
 >     itemAddress: address
 >     code: cell
 >     additionalData: cell?
 > }
 */
export interface UpgradeDnsItem {
    readonly $: 'UpgradeDnsItem'
    queryId: uint64 /* = 0 */
    itemAddress: c.Address
    code: c.Cell
    additionalData: c.Cell | null /* = null */
}

export const UpgradeDnsItem = {
    PREFIX: 0x646e7375,

    create(args: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        code: c.Cell
        additionalData?: c.Cell | null /* = null */
    }): UpgradeDnsItem {
        return {
            $: 'UpgradeDnsItem',
            queryId: 0n,
            additionalData: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): UpgradeDnsItem {
        loadAndCheckPrefix32(s, 0x646e7375, 'UpgradeDnsItem');
        return {
            $: 'UpgradeDnsItem',
            queryId: s.loadUintBig(64),
            itemAddress: s.loadAddress(),
            code: s.loadRef(),
            additionalData: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: UpgradeDnsItem, b: c.Builder): void {
        b.storeUint(0x646e7375, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.itemAddress);
        b.storeRef(self.code);
        storeTolkNullable<c.Cell>(self.additionalData, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: UpgradeDnsItem): c.Cell {
        return makeCellFrom<UpgradeDnsItem>(self, UpgradeDnsItem.store);
    }
}

/**
 > struct (0x646e7364) DestroyContract {
 >     queryId: uint64
 >     recipient: address?
 > }
 */
export interface DestroyContract {
    readonly $: 'DestroyContract'
    queryId: uint64 /* = 0 */
    recipient: c.Address | null /* = null */
}

export const DestroyContract = {
    PREFIX: 0x646e7364,

    create(args: {
        queryId?: uint64 /* = 0 */
        recipient?: c.Address | null /* = null */
    }): DestroyContract {
        return {
            $: 'DestroyContract',
            queryId: 0n,
            recipient: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): DestroyContract {
        loadAndCheckPrefix32(s, 0x646e7364, 'DestroyContract');
        return {
            $: 'DestroyContract',
            queryId: s.loadUintBig(64),
            recipient: s.loadMaybeAddress(),
        }
    },
    store(self: DestroyContract, b: c.Builder): void {
        b.storeUint(0x646e7364, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.recipient);
    },
    toCell(self: DestroyContract): c.Cell {
        return makeCellFrom<DestroyContract>(self, DestroyContract.store);
    }
}

/**
 > struct (0x646e7378) DestroyDnsItem {
 >     queryId: uint64
 >     itemAddress: address
 >     recipient: address?
 > }
 */
export interface DestroyDnsItem {
    readonly $: 'DestroyDnsItem'
    queryId: uint64 /* = 0 */
    itemAddress: c.Address
    recipient: c.Address | null /* = null */
}

export const DestroyDnsItem = {
    PREFIX: 0x646e7378,

    create(args: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        recipient?: c.Address | null /* = null */
    }): DestroyDnsItem {
        return {
            $: 'DestroyDnsItem',
            queryId: 0n,
            recipient: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): DestroyDnsItem {
        loadAndCheckPrefix32(s, 0x646e7378, 'DestroyDnsItem');
        return {
            $: 'DestroyDnsItem',
            queryId: s.loadUintBig(64),
            itemAddress: s.loadAddress(),
            recipient: s.loadMaybeAddress(),
        }
    },
    store(self: DestroyDnsItem, b: c.Builder): void {
        b.storeUint(0x646e7378, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.itemAddress);
        b.storeAddress(self.recipient);
    },
    toCell(self: DestroyDnsItem): c.Cell {
        return makeCellFrom<DestroyDnsItem>(self, DestroyDnsItem.store);
    }
}

/**
 > struct ItemInitData {
 >     fromAddress: address
 >     domain: Cell<RemainingBitsAndRefs>
 >     isInstant: bool
 >     fiAmount: coins
 >     fiMinterAddress: address?
 > }
 */
export interface ItemInitData {
    readonly $: 'ItemInitData'
    fromAddress: c.Address
    domain: CellRef<RemainingBitsAndRefs>
    isInstant: boolean /* = false */
    fiAmount: coins /* = 0 */
    fiMinterAddress: c.Address | null /* = null */
}

export const ItemInitData = {
    create(args: {
        fromAddress: c.Address
        domain: CellRef<RemainingBitsAndRefs>
        isInstant?: boolean /* = false */
        fiAmount?: coins /* = 0 */
        fiMinterAddress?: c.Address | null /* = null */
    }): ItemInitData {
        return {
            $: 'ItemInitData',
            isInstant: false,
            fiAmount: 0n,
            fiMinterAddress: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ItemInitData {
        return {
            $: 'ItemInitData',
            fromAddress: s.loadAddress(),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
            isInstant: s.loadBoolean(),
            fiAmount: s.loadCoins(),
            fiMinterAddress: s.loadMaybeAddress(),
        }
    },
    store(self: ItemInitData, b: c.Builder): void {
        b.storeAddress(self.fromAddress);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
        b.storeBit(self.isInstant);
        b.storeCoins(self.fiAmount);
        b.storeAddress(self.fiMinterAddress);
    },
    toCell(self: ItemInitData): c.Cell {
        return makeCellFrom<ItemInitData>(self, ItemInitData.store);
    }
}

/**
 > struct (0x62696431) BidBroDomain {
 >     queryId: uint64
 >     bidder: address
 >     fiAmount: coins
 >     domain: Cell<RemainingBitsAndRefs>
 >     collectionAddress: address
 > }
 */
export interface BidBroDomain {
    readonly $: 'BidBroDomain'
    queryId: uint64
    bidder: c.Address
    fiAmount: coins
    domain: CellRef<RemainingBitsAndRefs>
    collectionAddress: c.Address
}

export const BidBroDomain = {
    PREFIX: 0x62696431,

    create(args: {
        queryId: uint64
        bidder: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
        collectionAddress: c.Address
    }): BidBroDomain {
        return {
            $: 'BidBroDomain',
            ...args
        }
    },
    fromSlice(s: c.Slice): BidBroDomain {
        loadAndCheckPrefix32(s, 0x62696431, 'BidBroDomain');
        return {
            $: 'BidBroDomain',
            queryId: s.loadUintBig(64),
            bidder: s.loadAddress(),
            fiAmount: s.loadCoins(),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
            collectionAddress: s.loadAddress(),
        }
    },
    store(self: BidBroDomain, b: c.Builder): void {
        b.storeUint(0x62696431, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.bidder);
        b.storeCoins(self.fiAmount);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self: BidBroDomain): c.Cell {
        return makeCellFrom<BidBroDomain>(self, BidBroDomain.store);
    }
}

/**
 > struct (0x6f757462) DnsOutbidNotification {
 >     queryId: uint64
 >     outbidAddress: address
 >     fiAmount: coins
 >     domain: Cell<RemainingBitsAndRefs>
 > }
 */
export interface DnsOutbidNotification {
    readonly $: 'DnsOutbidNotification'
    queryId: uint64
    outbidAddress: c.Address
    fiAmount: coins
    domain: CellRef<RemainingBitsAndRefs>
}

export const DnsOutbidNotification = {
    PREFIX: 0x6f757462,

    create(args: {
        queryId: uint64
        outbidAddress: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }): DnsOutbidNotification {
        return {
            $: 'DnsOutbidNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsOutbidNotification {
        loadAndCheckPrefix32(s, 0x6f757462, 'DnsOutbidNotification');
        return {
            $: 'DnsOutbidNotification',
            queryId: s.loadUintBig(64),
            outbidAddress: s.loadAddress(),
            fiAmount: s.loadCoins(),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
        }
    },
    store(self: DnsOutbidNotification, b: c.Builder): void {
        b.storeUint(0x6f757462, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.outbidAddress);
        b.storeCoins(self.fiAmount);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
    },
    toCell(self: DnsOutbidNotification): c.Cell {
        return makeCellFrom<DnsOutbidNotification>(self, DnsOutbidNotification.store);
    }
}

/**
 > struct (0x6275726e) DnsAuctionFinalized {
 >     queryId: uint64
 >     winner: address
 >     winningFiAmount: coins
 >     domain: Cell<RemainingBitsAndRefs>
 > }
 */
export interface DnsAuctionFinalized {
    readonly $: 'DnsAuctionFinalized'
    queryId: uint64
    winner: c.Address
    winningFiAmount: coins
    domain: CellRef<RemainingBitsAndRefs>
}

export const DnsAuctionFinalized = {
    PREFIX: 0x6275726e,

    create(args: {
        queryId: uint64
        winner: c.Address
        winningFiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }): DnsAuctionFinalized {
        return {
            $: 'DnsAuctionFinalized',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsAuctionFinalized {
        loadAndCheckPrefix32(s, 0x6275726e, 'DnsAuctionFinalized');
        return {
            $: 'DnsAuctionFinalized',
            queryId: s.loadUintBig(64),
            winner: s.loadAddress(),
            winningFiAmount: s.loadCoins(),
            domain: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
        }
    },
    store(self: DnsAuctionFinalized, b: c.Builder): void {
        b.storeUint(0x6275726e, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.winner);
        b.storeCoins(self.winningFiAmount);
        storeCellRef<RemainingBitsAndRefs>(self.domain, b, storeTolkRemaining);
    },
    toCell(self: DnsAuctionFinalized): c.Cell {
        return makeCellFrom<DnsAuctionFinalized>(self, DnsAuctionFinalized.store);
    }
}

/**
 > struct CollectionStorage {
 >     treasuryAddress: address
 >     content: cell
 >     nftItemCode: cell
 >     deploymentTime: uint32
 >     fiMinterAddress: address?
 > }
 */
export interface CollectionStorage {
    readonly $: 'CollectionStorage'
    treasuryAddress: c.Address
    content: c.Cell
    nftItemCode: c.Cell
    deploymentTime: uint32 /* = 0 */
    fiMinterAddress: c.Address | null /* = null */
}

export const CollectionStorage = {
    create(args: {
        treasuryAddress: c.Address
        content: c.Cell
        nftItemCode: c.Cell
        deploymentTime?: uint32 /* = 0 */
        fiMinterAddress?: c.Address | null /* = null */
    }): CollectionStorage {
        return {
            $: 'CollectionStorage',
            deploymentTime: 0n,
            fiMinterAddress: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): CollectionStorage {
        return {
            $: 'CollectionStorage',
            treasuryAddress: s.loadAddress(),
            content: s.loadRef(),
            nftItemCode: s.loadRef(),
            deploymentTime: s.loadUintBig(32),
            fiMinterAddress: s.loadMaybeAddress(),
        }
    },
    store(self: CollectionStorage, b: c.Builder): void {
        b.storeAddress(self.treasuryAddress);
        b.storeRef(self.content);
        b.storeRef(self.nftItemCode);
        b.storeUint(self.deploymentTime, 32);
        b.storeAddress(self.fiMinterAddress);
    },
    toCell(self: CollectionStorage): c.Cell {
        return makeCellFrom<CollectionStorage>(self, CollectionStorage.store);
    }
}

/**
 > struct CollectionDataReply {
 >     nextItemIndex: int
 >     content: cell
 >     ownerAddress: address?
 > }
 */
export interface CollectionDataReply {
    readonly $: 'CollectionDataReply'
    nextItemIndex: bigint
    content: c.Cell
    ownerAddress: c.Address | null
}

export const CollectionDataReply = {
    create(args: {
        nextItemIndex: bigint
        content: c.Cell
        ownerAddress: c.Address | null
    }): CollectionDataReply {
        return {
            $: 'CollectionDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): CollectionDataReply {
        throw new Error(`Can't unpack 'CollectionDataReply' from cell, because 'CollectionDataReply.nextItemIndex' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: CollectionDataReply, b: c.Builder): void {
        throw new Error(`Can't pack 'CollectionDataReply' to cell, because 'self.nextItemIndex' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: CollectionDataReply): c.Cell {
        return makeCellFrom<CollectionDataReply>(self, CollectionDataReply.store);
    }
}

/**
 > struct DnsResolveResponse {
 >     resolvedPrefixLengthBits: int
 >     resolvedRecord: cell?
 > }
 */
export interface DnsResolveResponse {
    readonly $: 'DnsResolveResponse'
    resolvedPrefixLengthBits: bigint
    resolvedRecord: c.Cell | null
}

export const DnsResolveResponse = {
    create(args: {
        resolvedPrefixLengthBits: bigint
        resolvedRecord: c.Cell | null
    }): DnsResolveResponse {
        return {
            $: 'DnsResolveResponse',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsResolveResponse {
        throw new Error(`Can't unpack 'DnsResolveResponse' from cell, because 'DnsResolveResponse.resolvedPrefixLengthBits' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: DnsResolveResponse, b: c.Builder): void {
        throw new Error(`Can't pack 'DnsResolveResponse' to cell, because 'self.resolvedPrefixLengthBits' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: DnsResolveResponse): c.Cell {
        return makeCellFrom<DnsResolveResponse>(self, DnsResolveResponse.store);
    }
}

// ————————————————————————————————————————————
//    class DnsCollection
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

export class DnsCollection implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.DnsInvalidSubdomainBits': 70,
        'Errors.AuctionNotStarted': 199,
        'Errors.DomainTooShort': 200,
        'Errors.DomainTooLong': 201,
        'Errors.DomainFormatInvalid': 202,
        'Errors.DomainHasInvalidChars': 203,
        'Errors.BidBelowMinPrice': 204,
        'Errors.DomainIsBlacklisted': 205,
        'Errors.NotEnoughBalance': 402,
        'Errors.ContentTagInvalid': 412,
        'Errors.NotAuthorizedTreasury': 417,
        'Errors.ReservationPeriodActive': 418,
        'Errors.DnsIncorrectSender': 424,
        'Errors.IncorrectSender': 700,
        'Errors.UnknownOp': 65535,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new DnsCollection(address);
    }

    static fromStorage(emptyStorage: {
        treasuryAddress: c.Address
        content: c.Cell
        nftItemCode: c.Cell
        deploymentTime?: uint32 /* = 0 */
        fiMinterAddress?: c.Address | null /* = null */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? DnsCollection.CodeCell,
            data: CollectionStorage.toCell(CollectionStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new DnsCollection(address, initialState);
    }

    static createCellOfFillUp(body: {
        queryId: uint64
    }) {
        return FillUp.toCell(FillUp.create(body));
    }

    static createCellOfWithdrawFees(body: {
        queryId: uint64
        amount: coins
        recipient: c.Address
    }) {
        return WithdrawFees.toCell(WithdrawFees.create(body));
    }

    static createCellOfMintDomainFor(body: {
        queryId: uint64
        targetOwner: c.Address
        payload: RemainingBitsAndRefs
    }) {
        return MintDomainFor.toCell(MintDomainFor.create(body));
    }

    static createCellOfBidBroDomain(body: {
        queryId: uint64
        bidder: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
        collectionAddress: c.Address
    }) {
        return BidBroDomain.toCell(BidBroDomain.create(body));
    }

    static createCellOfDnsOutbidNotification(body: {
        queryId: uint64
        outbidAddress: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }) {
        return DnsOutbidNotification.toCell(DnsOutbidNotification.create(body));
    }

    static createCellOfDnsAuctionFinalized(body: {
        queryId: uint64
        winner: c.Address
        winningFiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }) {
        return DnsAuctionFinalized.toCell(DnsAuctionFinalized.create(body));
    }

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
    }

    static createCellOfUpgradeDnsItem(body: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        code: c.Cell
        additionalData?: c.Cell | null /* = null */
    }) {
        return UpgradeDnsItem.toCell(UpgradeDnsItem.create(body));
    }

    static createCellOfDestroyContract(body: {
        queryId?: uint64 /* = 0 */
        recipient?: c.Address | null /* = null */
    }) {
        return DestroyContract.toCell(DestroyContract.create(body));
    }

    static createCellOfDestroyDnsItem(body: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        recipient?: c.Address | null /* = null */
    }) {
        return DestroyDnsItem.toCell(DestroyDnsItem.create(body));
    }

    static createCellOfRequestUpgradeCode(body: {
        targetAddress?: c.Address | null /* = null */
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendFillUp(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FillUp.toCell(FillUp.create(body)),
            ...extraOptions
        });
    }

    async sendWithdrawFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        recipient: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: WithdrawFees.toCell(WithdrawFees.create(body)),
            ...extraOptions
        });
    }

    async sendMintDomainFor(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        targetOwner: c.Address
        payload: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintDomainFor.toCell(MintDomainFor.create(body)),
            ...extraOptions
        });
    }

    async sendBidBroDomain(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        bidder: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
        collectionAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BidBroDomain.toCell(BidBroDomain.create(body)),
            ...extraOptions
        });
    }

    async sendDnsOutbidNotification(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        outbidAddress: c.Address
        fiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DnsOutbidNotification.toCell(DnsOutbidNotification.create(body)),
            ...extraOptions
        });
    }

    async sendDnsAuctionFinalized(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        winner: c.Address
        winningFiAmount: coins
        domain: CellRef<RemainingBitsAndRefs>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DnsAuctionFinalized.toCell(DnsAuctionFinalized.create(body)),
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

    async sendUpgradeDnsItem(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        code: c.Cell
        additionalData?: c.Cell | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UpgradeDnsItem.toCell(UpgradeDnsItem.create(body)),
            ...extraOptions
        });
    }

    async sendDestroyContract(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        recipient?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DestroyContract.toCell(DestroyContract.create(body)),
            ...extraOptions
        });
    }

    async sendDestroyDnsItem(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        itemAddress: c.Address
        recipient?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DestroyDnsItem.toCell(DestroyDnsItem.create(body)),
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

    async getCollectionData(provider: ContractProvider): Promise<CollectionDataReply> {
        const r = StackReader.fromGetMethod(3, await provider.get('get_collection_data', []));
        return ({
            $: 'CollectionDataReply',
            nextItemIndex: r.readBigInt(),
            content: r.readCell(),
            ownerAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
        });
    }

    async getRoyaltyParams(provider: ContractProvider): Promise<[
        bigint,
        bigint,
        c.Address,
    ]> {
        const r = StackReader.fromGetMethod(3, await provider.get('get_royalty_params', []));
        return [
            r.readBigInt(),
            r.readBigInt(),
            r.readSlice().loadAddress(),
        ];
    }

    async getNftAddressByIndex(provider: ContractProvider, index: bigint): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_nft_address_by_index', [
            { type: 'int', value: index },
        ]));
        return r.readSlice().loadAddress();
    }

    async getNftContent(provider: ContractProvider, _index: bigint, individualNftContent: c.Cell): Promise<c.Cell> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_nft_content', [
            { type: 'int', value: _index },
            { type: 'cell', cell: individualNftContent },
        ]));
        return r.readCell();
    }

    async getDnsresolve(provider: ContractProvider, subdomain: c.Slice, _category: bigint): Promise<DnsResolveResponse> {
        const r = StackReader.fromGetMethod(2, await provider.get('dnsresolve', [
            { type: 'slice', cell: beginCell().storeSlice(subdomain).endCell() },
            { type: 'int', value: _category },
        ]));
        return ({
            $: 'DnsResolveResponse',
            resolvedPrefixLengthBits: r.readBigInt(),
            resolvedRecord: r.readNullable<c.Cell>(
                (r) => r.readCell()
            ),
        });
    }
}
