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
    static CodeCell = c.Cell.fromBase64('te6ccgECGwEABTUAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASATFAIB0wYHAEesJJA3SXaqcJh2omh9JGpqaY/9KGiCZH0pCeZmZY/9KmT2qkAE8U+JHyQNcsIs0eQQyOSO1E0PpIMPiSxwXy4aGCEAX14QD4J28QogHTP/oA+kgwUxO8kjECkTPiIMIA8uGSyM+FCBP6Ulj6AoIQ1TJ2288Liss/yXH7AODXLCG4f2KM4wLXLCFgrN+k4wLXLCMTSyGM4wLXLCAAAIBcgICQoLAJFCDBApkwgiAJGE5yoADgIMACmTCCIASMJzlQAOAgwAOYMIIaRhOcqADgIMAEmDCCGOjUpRAA4MEJl4IYdGpSiADgghgXSHboAIAF7tRND6SNTU0x/6UNEF1ws/AZIwcJTCAMMA4o4Q+CMDyPpSEszMyx/6VMntVOBfBAP87UTQ+kjUMdTTHzH6UDD4klADxwXy4aEC0z8x+kjIIddJEtcYAs4h12SOEyHXSsAB8uDKAddM0CDXSdcYAs7kMc9QINdJIMIA8uDIIIED8Lvy4MkgqTgC8tDKUhDbPPLgyyDIzvkWgFD4MyBun9D0BVIQgwf0Dm+hMfLQzeMNDwwNAfrtRND6SNQx1NMf+lAwIG6Y+JIhxwXy4ajf+CMgghBi5PMQvPLgxwXTPzH6SPoA10wkwgCOFASBAligF7mXUgXHBfLhopE04hA0lRAnNDUw4gHQyCHXSRLXGALOIddkjhMh10rAAfLgygHXTNAg10nXGALO5DHPUCDXSSDCAA4C4I4c7UTQ+kgw+JLHBfLhofQE10wg+wTQ7R7tU/EISeDXLCMjc5usjjHtRND6SDD4kscF8uGh0z8x+kjU9AXIz5AAAEAu9ADMycjPhQgS+lJxzwtuzMmAQPsA4NcsIyNzmyTjAtcsIyNzm8TjAoQP8vAREgACMACIghAL68IA+CgCyMv/EvpSyQLIzskDyPpSE8zPhhAT+lTJyM+JiAFTNMjPhNDMzPkWzwv/WPoCgQCNzwtwE8zMzMlx+wAC/vLgyCCBA/C78uDJIKk4AvLQylzbPPLgy6sC8AIku/LgzCDIzvkWgFD4MyBukTCf0PQFUhCDB/QOb6Ex8tDN4oIQC+vCAPgoAsjL/xL6UskCyM7JBsj6UhbMz4FQBPoC+lTJyM+JiAFdyM+E0MzM+RbPC/9QBPoCgQCNzwtwzMwPEAC47aLt+3ABqwIgpQGOSwLTByHCL5UhwTrDAJFw4iLCYJUiwXvDAJFw4gGSMH+SwwDiIJEyjhcwAcAtlSHCAMMAkXDilVMSucMAkXDiAeIBlV8DcNsx4QGkWORfA38ACszJcfsAAGTtRND6SDD4kiHHBfLhoQHTP/pQMCBus0AT4wTIz4UI+lKCENUydtvPC47LP8mBAKD7AABs7UTQ+kgw+JIhxwXy4aEB0z/6SPpQMCBus0AU4wTIz4UIE/pSghBkbnNkzwuOyz/6VMmAQPsAAgEgFRYCASAXGAAHuLXTGABduno+1E0PpIMdQx1NMfMfpQMdH4KALIy/8S+lLJAcjPhNDMzPkWyM+KAEDL/89QgAJ7kFvtRND6SNTUMdMfMfpQMdF/AoAgFYGRoAz7DDDAg10mpOALy0EYg1woHIMAAAZFwlyHXScAIwwDik1t4beAglQHTBzEB3iFwcJGzngHTByHAAAKUAqYIAt5Z6DEgwgDy4MlRItcZyM75FoIBZ6PtQ9gBeHDjBBKgyM+K6k4S+lLJgAC2xZvtRND6SNQx1DHTHzH6UDHRdYBkWIA==');

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
        'Errors.NotAuthorizedTreasury': 417,
        'Errors.ReservationPeriodActive': 418,
        'Errors.DnsIncorrectSender': 424,
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
