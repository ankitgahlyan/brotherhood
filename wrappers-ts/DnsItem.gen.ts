// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a DnsItem contract in Tolk.
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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   custom packToBuilder and unpackFromSlice
//

type CustomPackToBuilderFn<T> = (self: T, b: c.Builder) => void
type CustomUnpackFromSliceFn<T> = (s: c.Slice) => T

let customSerializersRegistry: Map<string, [CustomPackToBuilderFn<any> | null, CustomUnpackFromSliceFn<any> | null]> = new Map;

function ensureCustomSerializerRegistered(typeName: string) {
    if (!customSerializersRegistry.has(typeName)) {
        throw new Error(`Custom packToBuilder/unpackFromSlice was not registered for type 'DnsItem.${typeName}'.\n(in Tolk code, they have custom logic \`fun ${typeName}__packToBuilder\`)\nSteps to fix:\n1) in your code, create and implement\n > function ${typeName}__packToBuilder(self: ${typeName}, b: Builder): void { ... }\n > function ${typeName}__unpackFromSlice(s: Slice): ${typeName} { ... }\n2) register them in advance by calling\n > DnsItem.registerCustomPackUnpack('${typeName}', ${typeName}__packToBuilder, ${typeName}__unpackFromSlice);`);
    }
}

function invokeCustomPackToBuilder<T>(typeName: string, self: T, b: c.Builder) {
    ensureCustomSerializerRegistered(typeName);
    customSerializersRegistry.get(typeName)![0]!(self, b);
}

function invokeCustomUnpackFromSlice<T>(typeName: string, s: c.Slice): T {
    ensureCustomSerializerRegistered(typeName);
    return customSerializersRegistry.get(typeName)![1]!(s);
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint64 = bigint
type uint256 = bigint

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
 > type TransferForwardPayload = RemainingBitsAndRefs
 */
export type TransferForwardPayload = RemainingBitsAndRefs

export const TransferForwardPayload = {
    fromSlice(s: c.Slice): TransferForwardPayload {
        return loadTolkRemaining(s);
    },
    store(self: TransferForwardPayload, b: c.Builder): void {
        storeTolkRemaining(self, b);
    },
    toCell(self: TransferForwardPayload): c.Cell {
        return makeCellFrom<TransferForwardPayload>(self, TransferForwardPayload.store);
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
 > struct (0x557cea20) OutbidNotification {
 >     queryId: uint64
 > }
 */
export interface OutbidNotification {
    readonly $: 'OutbidNotification'
    queryId: uint64
}

export const OutbidNotification = {
    PREFIX: 0x557cea20,

    create(args: {
        queryId: uint64
    }): OutbidNotification {
        return {
            $: 'OutbidNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): OutbidNotification {
        loadAndCheckPrefix32(s, 0x557cea20, 'OutbidNotification');
        return {
            $: 'OutbidNotification',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: OutbidNotification, b: c.Builder): void {
        b.storeUint(0x557cea20, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: OutbidNotification): c.Cell {
        return makeCellFrom<OutbidNotification>(self, OutbidNotification.store);
    }
}

/**
 > struct (0x05138d91) OwnershipAssigned {
 >     queryId: uint64
 >     oldOwnerAddress: address?
 >     payload: TransferForwardPayload
 > }
 */
export interface OwnershipAssigned {
    readonly $: 'OwnershipAssigned'
    queryId: uint64
    oldOwnerAddress: c.Address | null
    payload: TransferForwardPayload
}

export const OwnershipAssigned = {
    PREFIX: 0x05138d91,

    create(args: {
        queryId: uint64
        oldOwnerAddress: c.Address | null
        payload: TransferForwardPayload
    }): OwnershipAssigned {
        return {
            $: 'OwnershipAssigned',
            ...args
        }
    },
    fromSlice(s: c.Slice): OwnershipAssigned {
        loadAndCheckPrefix32(s, 0x05138d91, 'OwnershipAssigned');
        return {
            $: 'OwnershipAssigned',
            queryId: s.loadUintBig(64),
            oldOwnerAddress: s.loadMaybeAddress(),
            payload: TransferForwardPayload.fromSlice(s),
        }
    },
    store(self: OwnershipAssigned, b: c.Builder): void {
        b.storeUint(0x05138d91, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.oldOwnerAddress);
        TransferForwardPayload.store(self.payload, b);
    },
    toCell(self: OwnershipAssigned): c.Cell {
        return makeCellFrom<OwnershipAssigned>(self, OwnershipAssigned.store);
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
 > struct (0x2fcb26a2) GetStaticData {
 >     queryId: uint64
 > }
 */
export interface GetStaticData {
    readonly $: 'GetStaticData'
    queryId: uint64
}

export const GetStaticData = {
    PREFIX: 0x2fcb26a2,

    create(args: {
        queryId: uint64
    }): GetStaticData {
        return {
            $: 'GetStaticData',
            ...args
        }
    },
    fromSlice(s: c.Slice): GetStaticData {
        loadAndCheckPrefix32(s, 0x2fcb26a2, 'GetStaticData');
        return {
            $: 'GetStaticData',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: GetStaticData, b: c.Builder): void {
        b.storeUint(0x2fcb26a2, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: GetStaticData): c.Cell {
        return makeCellFrom<GetStaticData>(self, GetStaticData.store);
    }
}

/**
 > struct (0x8b771735) ReportStaticData {
 >     queryId: uint64
 >     itemIndex: uint256
 >     collectionAddress: address
 > }
 */
export interface ReportStaticData {
    readonly $: 'ReportStaticData'
    queryId: uint64
    itemIndex: uint256
    collectionAddress: c.Address
}

export const ReportStaticData = {
    PREFIX: 0x8b771735,

    create(args: {
        queryId: uint64
        itemIndex: uint256
        collectionAddress: c.Address
    }): ReportStaticData {
        return {
            $: 'ReportStaticData',
            ...args
        }
    },
    fromSlice(s: c.Slice): ReportStaticData {
        loadAndCheckPrefix32(s, 0x8b771735, 'ReportStaticData');
        return {
            $: 'ReportStaticData',
            queryId: s.loadUintBig(64),
            itemIndex: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
        }
    },
    store(self: ReportStaticData, b: c.Builder): void {
        b.storeUint(0x8b771735, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.itemIndex, 256);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self: ReportStaticData): c.Cell {
        return makeCellFrom<ReportStaticData>(self, ReportStaticData.store);
    }
}

/**
 > struct TransferOwnershipData {
 >     newOwnerAddress: address
 >     responseDestination: address?
 >     customPayload: cell?
 >     forwardAmount: coins
 >     forwardPayload: TransferForwardPayload
 > }
 */
export interface TransferOwnershipData {
    readonly $: 'TransferOwnershipData'
    newOwnerAddress: c.Address
    responseDestination: c.Address | null
    customPayload: c.Cell | null
    forwardAmount: coins
    forwardPayload: TransferForwardPayload
}

export const TransferOwnershipData = {
    create(args: {
        newOwnerAddress: c.Address
        responseDestination: c.Address | null
        customPayload: c.Cell | null
        forwardAmount: coins
        forwardPayload: TransferForwardPayload
    }): TransferOwnershipData {
        return {
            $: 'TransferOwnershipData',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferOwnershipData {
        return {
            $: 'TransferOwnershipData',
            newOwnerAddress: s.loadAddress(),
            responseDestination: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
            forwardAmount: s.loadCoins(),
            forwardPayload: TransferForwardPayload.fromSlice(s),
        }
    },
    store(self: TransferOwnershipData, b: c.Builder): void {
        b.storeAddress(self.newOwnerAddress);
        b.storeAddress(self.responseDestination);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
        b.storeCoins(self.forwardAmount);
        TransferForwardPayload.store(self.forwardPayload, b);
    },
    toCell(self: TransferOwnershipData): c.Cell {
        return makeCellFrom<TransferOwnershipData>(self, TransferOwnershipData.store);
    }
}

/**
 > struct (0x5fcc3d14) TransferOwnership {
 >     queryId: uint64
 >     transferData: TransferOwnershipData
 > }
 */
export interface TransferOwnership {
    readonly $: 'TransferOwnership'
    queryId: uint64
    transferData: TransferOwnershipData
}

export const TransferOwnership = {
    PREFIX: 0x5fcc3d14,

    create(args: {
        queryId: uint64
        transferData: TransferOwnershipData
    }): TransferOwnership {
        return {
            $: 'TransferOwnership',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferOwnership {
        loadAndCheckPrefix32(s, 0x5fcc3d14, 'TransferOwnership');
        return {
            $: 'TransferOwnership',
            queryId: s.loadUintBig(64),
            transferData: TransferOwnershipData.fromSlice(s),
        }
    },
    store(self: TransferOwnership, b: c.Builder): void {
        b.storeUint(0x5fcc3d14, 32);
        b.storeUint(self.queryId, 64);
        TransferOwnershipData.store(self.transferData, b);
    },
    toCell(self: TransferOwnership): c.Cell {
        return makeCellFrom<TransferOwnership>(self, TransferOwnership.store);
    }
}

/**
 > struct (0x1a0b9d51) EditContent {
 >     queryId: uint64
 >     newContent: Cell<DnsRecords>
 > }
 */
export interface EditContent {
    readonly $: 'EditContent'
    queryId: uint64
    newContent: CellRef<DnsRecords>
}

export const EditContent = {
    PREFIX: 0x1a0b9d51,

    create(args: {
        queryId: uint64
        newContent: CellRef<DnsRecords>
    }): EditContent {
        return {
            $: 'EditContent',
            ...args
        }
    },
    fromSlice(s: c.Slice): EditContent {
        loadAndCheckPrefix32(s, 0x1a0b9d51, 'EditContent');
        return {
            $: 'EditContent',
            queryId: s.loadUintBig(64),
            newContent: loadCellRef<DnsRecords>(s, DnsRecords.fromSlice),
        }
    },
    store(self: EditContent, b: c.Builder): void {
        b.storeUint(0x1a0b9d51, 32);
        b.storeUint(self.queryId, 64);
        storeCellRef<DnsRecords>(self.newContent, b, DnsRecords.store);
    },
    toCell(self: EditContent): c.Cell {
        return makeCellFrom<EditContent>(self, EditContent.store);
    }
}

/**
 > struct (0x4eb1f0f9) ChangeDnsRecord {
 >     queryId: uint64
 >     key: uint256
 >     value: RemainingBitsAndRefs
 > }
 */
export interface ChangeDnsRecord {
    readonly $: 'ChangeDnsRecord'
    queryId: uint64
    key: uint256
    value: RemainingBitsAndRefs
}

export const ChangeDnsRecord = {
    PREFIX: 0x4eb1f0f9,

    create(args: {
        queryId: uint64
        key: uint256
        value: RemainingBitsAndRefs
    }): ChangeDnsRecord {
        return {
            $: 'ChangeDnsRecord',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeDnsRecord {
        loadAndCheckPrefix32(s, 0x4eb1f0f9, 'ChangeDnsRecord');
        return {
            $: 'ChangeDnsRecord',
            queryId: s.loadUintBig(64),
            key: s.loadUintBig(256),
            value: loadTolkRemaining(s),
        }
    },
    store(self: ChangeDnsRecord, b: c.Builder): void {
        b.storeUint(0x4eb1f0f9, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.key, 256);
        storeTolkRemaining(self.value, b);
    },
    toCell(self: ChangeDnsRecord): c.Cell {
        return makeCellFrom<ChangeDnsRecord>(self, ChangeDnsRecord.store);
    }
}

/**
 > struct (0x44beae41) ProcessGovernanceDecision {
 >     queryId: uint64
 > }
 */
export interface ProcessGovernanceDecision {
    readonly $: 'ProcessGovernanceDecision'
    queryId: uint64
}

export const ProcessGovernanceDecision = {
    PREFIX: 0x44beae41,

    create(args: {
        queryId: uint64
    }): ProcessGovernanceDecision {
        return {
            $: 'ProcessGovernanceDecision',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProcessGovernanceDecision {
        loadAndCheckPrefix32(s, 0x44beae41, 'ProcessGovernanceDecision');
        return {
            $: 'ProcessGovernanceDecision',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ProcessGovernanceDecision, b: c.Builder): void {
        b.storeUint(0x44beae41, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ProcessGovernanceDecision): c.Cell {
        return makeCellFrom<ProcessGovernanceDecision>(self, ProcessGovernanceDecision.store);
    }
}

/**
 > struct (0x4ed14b65) DnsRecordRelease {
 >     queryId: uint64
 > }
 */
export interface DnsRecordRelease {
    readonly $: 'DnsRecordRelease'
    queryId: uint64
}

export const DnsRecordRelease = {
    PREFIX: 0x4ed14b65,

    create(args: {
        queryId: uint64
    }): DnsRecordRelease {
        return {
            $: 'DnsRecordRelease',
            ...args
        }
    },
    fromSlice(s: c.Slice): DnsRecordRelease {
        loadAndCheckPrefix32(s, 0x4ed14b65, 'DnsRecordRelease');
        return {
            $: 'DnsRecordRelease',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DnsRecordRelease, b: c.Builder): void {
        b.storeUint(0x4ed14b65, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DnsRecordRelease): c.Cell {
        return makeCellFrom<DnsRecordRelease>(self, DnsRecordRelease.store);
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
 > struct (0x66696e61) FinalizeAuction {
 >     queryId: uint64
 > }
 */
export interface FinalizeAuction {
    readonly $: 'FinalizeAuction'
    queryId: uint64
}

export const FinalizeAuction = {
    PREFIX: 0x66696e61,

    create(args: {
        queryId: uint64
    }): FinalizeAuction {
        return {
            $: 'FinalizeAuction',
            ...args
        }
    },
    fromSlice(s: c.Slice): FinalizeAuction {
        loadAndCheckPrefix32(s, 0x66696e61, 'FinalizeAuction');
        return {
            $: 'FinalizeAuction',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: FinalizeAuction, b: c.Builder): void {
        b.storeUint(0x66696e61, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: FinalizeAuction): c.Cell {
        return makeCellFrom<FinalizeAuction>(self, FinalizeAuction.store);
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
 > struct (0x72656e65) RenewBroDomain {
 >     queryId: uint64
 >     renewer: address
 >     fiAmount: coins
 >     itemAddress: address
 > }
 */
export interface RenewBroDomain {
    readonly $: 'RenewBroDomain'
    queryId: uint64
    renewer: c.Address
    fiAmount: coins
    itemAddress: c.Address
}

export const RenewBroDomain = {
    PREFIX: 0x72656e65,

    create(args: {
        queryId: uint64
        renewer: c.Address
        fiAmount: coins
        itemAddress: c.Address
    }): RenewBroDomain {
        return {
            $: 'RenewBroDomain',
            ...args
        }
    },
    fromSlice(s: c.Slice): RenewBroDomain {
        loadAndCheckPrefix32(s, 0x72656e65, 'RenewBroDomain');
        return {
            $: 'RenewBroDomain',
            queryId: s.loadUintBig(64),
            renewer: s.loadAddress(),
            fiAmount: s.loadCoins(),
            itemAddress: s.loadAddress(),
        }
    },
    store(self: RenewBroDomain, b: c.Builder): void {
        b.storeUint(0x72656e65, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.renewer);
        b.storeCoins(self.fiAmount);
        b.storeAddress(self.itemAddress);
    },
    toCell(self: RenewBroDomain): c.Cell {
        return makeCellFrom<RenewBroDomain>(self, RenewBroDomain.store);
    }
}

/**
 > type DnsRecords = map<uint256, cell>
 */
export type DnsRecords = c.Dictionary<uint256, c.Cell>

export const DnsRecords = {
    fromSlice(s: c.Slice): DnsRecords {
        return invokeCustomUnpackFromSlice<DnsRecords>('DnsRecords', s);
    },
    store(self: DnsRecords, b: c.Builder): void {
        invokeCustomPackToBuilder<DnsRecords>('DnsRecords', self, b);
    },
    toCell(self: DnsRecords): c.Cell {
        return makeCellFrom<DnsRecords>(self, DnsRecords.store);
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

/**
 > struct ItemStorageNotInitialized {
 >     index: uint256
 >     collectionAddress: address
 > }
 */
export interface ItemStorageNotInitialized {
    readonly $: 'ItemStorageNotInitialized'
    index: uint256
    collectionAddress: c.Address
}

export const ItemStorageNotInitialized = {
    create(args: {
        index: uint256
        collectionAddress: c.Address
    }): ItemStorageNotInitialized {
        return {
            $: 'ItemStorageNotInitialized',
            ...args
        }
    },
    fromSlice(s: c.Slice): ItemStorageNotInitialized {
        return {
            $: 'ItemStorageNotInitialized',
            index: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
        }
    },
    store(self: ItemStorageNotInitialized, b: c.Builder): void {
        b.storeUint(self.index, 256);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self: ItemStorageNotInitialized): c.Cell {
        return makeCellFrom<ItemStorageNotInitialized>(self, ItemStorageNotInitialized.store);
    }
}

/**
 > struct ItemExtra {
 >     fiMinterAddress: address?
 > }
 */
export interface ItemExtra {
    readonly $: 'ItemExtra'
    fiMinterAddress: c.Address | null /* = null */
}

export const ItemExtra = {
    create(args: {
        fiMinterAddress?: c.Address | null /* = null */
    }): ItemExtra {
        return {
            $: 'ItemExtra',
            fiMinterAddress: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ItemExtra {
        return {
            $: 'ItemExtra',
            fiMinterAddress: s.loadMaybeAddress(),
        }
    },
    store(self: ItemExtra, b: c.Builder): void {
        b.storeAddress(self.fiMinterAddress);
    },
    toCell(self: ItemExtra): c.Cell {
        return makeCellFrom<ItemExtra>(self, ItemExtra.store);
    }
}

/**
 > struct ItemStorageInitialized {
 >     index: uint256
 >     collectionAddress: address
 >     ownerAddress: address?
 >     content: Cell<DnsRecords>
 >     domain: cell
 >     auction: Cell<AuctionState>?
 >     lastFillUpTime: uint64
 >     extra: Cell<ItemExtra>?
 > }
 */
export interface ItemStorageInitialized {
    readonly $: 'ItemStorageInitialized'
    index: uint256
    collectionAddress: c.Address
    ownerAddress: c.Address | null
    content: CellRef<DnsRecords>
    domain: c.Cell
    auction: CellRef<AuctionState> | null
    lastFillUpTime: uint64
    extra: CellRef<ItemExtra> | null /* = null */
}

export const ItemStorageInitialized = {
    create(args: {
        index: uint256
        collectionAddress: c.Address
        ownerAddress: c.Address | null
        content: CellRef<DnsRecords>
        domain: c.Cell
        auction: CellRef<AuctionState> | null
        lastFillUpTime: uint64
        extra?: CellRef<ItemExtra> | null /* = null */
    }): ItemStorageInitialized {
        return {
            $: 'ItemStorageInitialized',
            extra: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): ItemStorageInitialized {
        return {
            $: 'ItemStorageInitialized',
            index: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
            ownerAddress: s.loadMaybeAddress(),
            content: loadCellRef<DnsRecords>(s, DnsRecords.fromSlice),
            domain: s.loadRef(),
            auction: s.loadBoolean() ? loadCellRef<AuctionState>(s, AuctionState.fromSlice) : null,
            lastFillUpTime: s.loadUintBig(64),
            extra: s.loadBoolean() ? loadCellRef<ItemExtra>(s, ItemExtra.fromSlice) : null,
        }
    },
    store(self: ItemStorageInitialized, b: c.Builder): void {
        b.storeUint(self.index, 256);
        b.storeAddress(self.collectionAddress);
        b.storeAddress(self.ownerAddress);
        storeCellRef<DnsRecords>(self.content, b, DnsRecords.store);
        b.storeRef(self.domain);
        storeTolkNullable<CellRef<AuctionState>>(self.auction, b,
            (v,b) => storeCellRef<AuctionState>(v, b, AuctionState.store)
        );
        b.storeUint(self.lastFillUpTime, 64);
        storeTolkNullable<CellRef<ItemExtra>>(self.extra, b,
            (v,b) => storeCellRef<ItemExtra>(v, b, ItemExtra.store)
        );
    },
    toCell(self: ItemStorageInitialized): c.Cell {
        return makeCellFrom<ItemStorageInitialized>(self, ItemStorageInitialized.store);
    }
}

/**
 > struct NftDataReply {
 >     isInitialized: bool
 >     index: uint256
 >     collectionAddress: address
 >     ownerAddress: address?
 >     content: Cell<DnsRecords>?
 > }
 */
export interface NftDataReply {
    readonly $: 'NftDataReply'
    isInitialized: boolean
    index: uint256
    collectionAddress: c.Address
    ownerAddress: c.Address | null
    content: CellRef<DnsRecords> | null
}

export const NftDataReply = {
    create(args: {
        isInitialized: boolean
        index: uint256
        collectionAddress: c.Address
        ownerAddress: c.Address | null
        content: CellRef<DnsRecords> | null
    }): NftDataReply {
        return {
            $: 'NftDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): NftDataReply {
        return {
            $: 'NftDataReply',
            isInitialized: s.loadBoolean(),
            index: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
            ownerAddress: s.loadMaybeAddress(),
            content: s.loadBoolean() ? loadCellRef<DnsRecords>(s, DnsRecords.fromSlice) : null,
        }
    },
    store(self: NftDataReply, b: c.Builder): void {
        b.storeBit(self.isInitialized);
        b.storeUint(self.index, 256);
        b.storeAddress(self.collectionAddress);
        b.storeAddress(self.ownerAddress);
        storeTolkNullable<CellRef<DnsRecords>>(self.content, b,
            (v,b) => storeCellRef<DnsRecords>(v, b, DnsRecords.store)
        );
    },
    toCell(self: NftDataReply): c.Cell {
        return makeCellFrom<NftDataReply>(self, NftDataReply.store);
    }
}

/**
 > struct AuctionState {
 >     maxBidAddress: address?
 >     maxBidAmount: coins
 >     auctionEndTime: uint64
 > }
 */
export interface AuctionState {
    readonly $: 'AuctionState'
    maxBidAddress: c.Address | null
    maxBidAmount: coins
    auctionEndTime: uint64
}

export const AuctionState = {
    create(args: {
        maxBidAddress: c.Address | null
        maxBidAmount: coins
        auctionEndTime: uint64
    }): AuctionState {
        return {
            $: 'AuctionState',
            ...args
        }
    },
    fromSlice(s: c.Slice): AuctionState {
        return {
            $: 'AuctionState',
            maxBidAddress: s.loadMaybeAddress(),
            maxBidAmount: s.loadCoins(),
            auctionEndTime: s.loadUintBig(64),
        }
    },
    store(self: AuctionState, b: c.Builder): void {
        b.storeAddress(self.maxBidAddress);
        b.storeCoins(self.maxBidAmount);
        b.storeUint(self.auctionEndTime, 64);
    },
    toCell(self: AuctionState): c.Cell {
        return makeCellFrom<AuctionState>(self, AuctionState.store);
    }
}

// ————————————————————————————————————————————
//    class DnsItem
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

export class DnsItem implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.DnsInvalidSubdomainBits': 70,
        'Errors.BidBelowMinPrice': 204,
        'Errors.WrongWorkchain': 333,
        'Errors.DnsNotOwner': 401,
        'Errors.NotEnoughBalance': 402,
        'Errors.NotFromCollection': 405,
        'Errors.OnlyOwnerCanFillUpAfterAuction': 406,
        'Errors.BidTooLow': 407,
        'Errors.OnlyOwnerCanEditContent': 410,
        'Errors.OnlyOwnerCanChangeDns': 411,
        'Errors.ContentTagInvalid': 412,
        'Errors.GovernanceRequiresNoAuction': 413,
        'Errors.DnsBalanceReleaseForbidden': 414,
        'Errors.ConfigEntryNotFound': 415,
        'Errors.ConfigOperationInvalid': 416,
        'Errors.NoActiveAuction': 420,
        'Errors.AuctionNotFinished': 421,
        'Errors.AuctionAlreadyFinished': 422,
        'Errors.NoWinner': 423,
        'Errors.DnsIncorrectSender': 424,
        'Errors.UnknownOp': 65535,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static registerCustomPackUnpack<T>(
        typeName: string,
        packToBuilderFn: CustomPackToBuilderFn<T> | null,
        unpackFromSliceFn: CustomUnpackFromSliceFn<T> | null,
    ) {
        if (customSerializersRegistry.has(typeName)) {
            throw new Error(`Custom pack/unpack for 'DnsItem.${typeName}' already registered`);
        }
        customSerializersRegistry.set(typeName, [packToBuilderFn, unpackFromSliceFn]);
    }

    static fromAddress(address: c.Address) {
        return new DnsItem(address);
    }

    static fromStorage(emptyStorage: {
        index: uint256
        collectionAddress: c.Address
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? DnsItem.CodeCell,
            data: ItemStorageNotInitialized.toCell(ItemStorageNotInitialized.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new DnsItem(address, initialState);
    }

    static createCellOfTransferOwnership(body: {
        queryId: uint64
        transferData: TransferOwnershipData
    }) {
        return TransferOwnership.toCell(TransferOwnership.create(body));
    }

    static createCellOfEditContent(body: {
        queryId: uint64
        newContent: CellRef<DnsRecords>
    }) {
        return EditContent.toCell(EditContent.create(body));
    }

    static createCellOfChangeDnsRecord(body: {
        queryId: uint64
        key: uint256
        value: RemainingBitsAndRefs
    }) {
        return ChangeDnsRecord.toCell(ChangeDnsRecord.create(body));
    }

    static createCellOfProcessGovernanceDecision(body: {
        queryId: uint64
    }) {
        return ProcessGovernanceDecision.toCell(ProcessGovernanceDecision.create(body));
    }

    static createCellOfDnsRecordRelease(body: {
        queryId: uint64
    }) {
        return DnsRecordRelease.toCell(DnsRecordRelease.create(body));
    }

    static createCellOfGetStaticData(body: {
        queryId: uint64
    }) {
        return GetStaticData.toCell(GetStaticData.create(body));
    }

    static createCellOfFillUp(body: {
        queryId: uint64
    }) {
        return FillUp.toCell(FillUp.create(body));
    }

    static createCellOfFinalizeAuction(body: {
        queryId: uint64
    }) {
        return FinalizeAuction.toCell(FinalizeAuction.create(body));
    }

    static createCellOfRenewBroDomain(body: {
        queryId: uint64
        renewer: c.Address
        fiAmount: coins
        itemAddress: c.Address
    }) {
        return RenewBroDomain.toCell(RenewBroDomain.create(body));
    }

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
    }

    static createCellOfDestroyContract(body: {
        queryId?: uint64 /* = 0 */
        recipient?: c.Address | null /* = null */
    }) {
        return DestroyContract.toCell(DestroyContract.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendTransferOwnership(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        transferData: TransferOwnershipData
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TransferOwnership.toCell(TransferOwnership.create(body)),
            ...extraOptions
        });
    }

    async sendEditContent(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newContent: CellRef<DnsRecords>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: EditContent.toCell(EditContent.create(body)),
            ...extraOptions
        });
    }

    async sendChangeDnsRecord(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        key: uint256
        value: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeDnsRecord.toCell(ChangeDnsRecord.create(body)),
            ...extraOptions
        });
    }

    async sendProcessGovernanceDecision(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ProcessGovernanceDecision.toCell(ProcessGovernanceDecision.create(body)),
            ...extraOptions
        });
    }

    async sendDnsRecordRelease(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DnsRecordRelease.toCell(DnsRecordRelease.create(body)),
            ...extraOptions
        });
    }

    async sendGetStaticData(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: GetStaticData.toCell(GetStaticData.create(body)),
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

    async sendFinalizeAuction(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FinalizeAuction.toCell(FinalizeAuction.create(body)),
            ...extraOptions
        });
    }

    async sendRenewBroDomain(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        renewer: c.Address
        fiAmount: coins
        itemAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RenewBroDomain.toCell(RenewBroDomain.create(body)),
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

    async getNftData(provider: ContractProvider): Promise<NftDataReply> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_nft_data', []));
        return ({
            $: 'NftDataReply',
            isInitialized: r.readBoolean(),
            index: r.readBigInt(),
            collectionAddress: r.readSlice().loadAddress(),
            ownerAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            content: r.readNullable<CellRef<DnsRecords>>(
                (r) => r.readCellRef<DnsRecords>(DnsRecords.fromSlice)
            ),
        });
    }

    async getEditor(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_editor', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }

    async getDomain(provider: ContractProvider): Promise<c.Slice> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_domain', []));
        return r.readSlice();
    }

    async getAuctionInfo(provider: ContractProvider): Promise<AuctionState> {
        const r = StackReader.fromGetMethod(3, await provider.get('get_auction_info', []));
        return ({
            $: 'AuctionState',
            maxBidAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            maxBidAmount: r.readBigInt(),
            auctionEndTime: r.readBigInt(),
        });
    }

    async getLastFillUpTime(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_last_fill_up_time', []));
        return r.readBigInt();
    }

    async getDnsresolve(provider: ContractProvider, subdomain: c.Slice, category: uint256): Promise<DnsResolveResponse> {
        const r = StackReader.fromGetMethod(2, await provider.get('dnsresolve', [
            { type: 'slice', cell: beginCell().storeSlice(subdomain).endCell() },
            { type: 'int', value: category },
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
