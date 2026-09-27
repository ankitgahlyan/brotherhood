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
 > struct (0x00000000) DeployDnsDomain {
 >     payload: RemainingBitsAndRefs
 > }
 */
export interface DeployDnsDomain {
    readonly $: 'DeployDnsDomain'
    payload: RemainingBitsAndRefs
}

export const DeployDnsDomain = {
    PREFIX: 0x00000000,

    create(args: {
        payload: RemainingBitsAndRefs
    }): DeployDnsDomain {
        return {
            $: 'DeployDnsDomain',
            ...args
        }
    },
    fromSlice(s: c.Slice): DeployDnsDomain {
        loadAndCheckPrefix32(s, 0x00000000, 'DeployDnsDomain');
        return {
            $: 'DeployDnsDomain',
            payload: loadTolkRemaining(s),
        }
    },
    store(self: DeployDnsDomain, b: c.Builder): void {
        b.storeUint(0x00000000, 32);
        storeTolkRemaining(self.payload, b);
    },
    toCell(self: DeployDnsDomain): c.Cell {
        return makeCellFrom<DeployDnsDomain>(self, DeployDnsDomain.store);
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
 >     isInstantMint: bool
 >     fiMinterAddress: address?
 > }
 */
export interface CollectionStorage {
    readonly $: 'CollectionStorage'
    treasuryAddress: c.Address
    content: c.Cell
    nftItemCode: c.Cell
    deploymentTime: uint32 /* = 0 */
    isInstantMint: boolean /* = false */
    fiMinterAddress: c.Address | null /* = null */
}

export const CollectionStorage = {
    create(args: {
        treasuryAddress: c.Address
        content: c.Cell
        nftItemCode: c.Cell
        deploymentTime?: uint32 /* = 0 */
        isInstantMint?: boolean /* = false */
        fiMinterAddress?: c.Address | null /* = null */
    }): CollectionStorage {
        return {
            $: 'CollectionStorage',
            deploymentTime: 0n,
            isInstantMint: false,
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
            isInstantMint: s.loadBoolean(),
            fiMinterAddress: s.loadMaybeAddress(),
        }
    },
    store(self: CollectionStorage, b: c.Builder): void {
        b.storeAddress(self.treasuryAddress);
        b.storeRef(self.content);
        b.storeRef(self.nftItemCode);
        b.storeUint(self.deploymentTime, 32);
        b.storeBit(self.isInstantMint);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECHAEABasAART/APSkE/S88sgLAQIBYgIDAgLNBAUCASAUFQIBIAYHAJHRBggUyYQRAEjCc5UABwEGABTJhBEAJGE5yoAHAQYAHMGEENIwnOVABwEGACTBhBDHRqUogAcGCEy8EMOjUpRABwQQwLpDt0AEAgEgCAkAiVIMECmDCCGC6Q7dAA4CDAApgwghgXSHboAOAgwAOYMIIYC6Q7dADgIMAEmDCCGASoF8gA4MEJloISVAvkAOCCESoF8gCAT3PiR8kDXLCAAAAAE4wLXLCLNHkEMjkjtRND6SDD4kscF8uGhghAF9eEA+CdvEKIB0z/6APpIMFMTvJIxApEz4iDCAPLhksjPhQgT+lJY+gKCENUydtvPC4rLP8lx+wDg1ywhuH9ijJEw4NcsIWCs36TjAtcsIxNLIYzjAoAoLDA0ASTIIddJEtcYAs4h12SOEyHXSsAB8uDKAddM0CDXSdcYAs7kz1CAD/O1E0PgjIIIQYuTzELzy4McB+kjUMdTTH9cKACCVIcIAwwCRcOKOFgGCCCeNAKAkvJn4klADxwXy4aKRMuKSMzDiA/ABMSDXSSJwc+MEqgIhufLgyCCBA/C78uDJIKk4AvLQylzbPPLgyyCrAiOVMTMC8APjDviXu/LgzCHIzhIODwL+7UTQ+kjUMdTTHzHXCgD4klADxwXy4aEC0z8x+kjwATEg10kjcHPjBKoCIbny4MgggQPwu/LgySCpOALy0MpSENs88uDLIMjO+RaAUPgzIG6RMJ/Q9AVSEIMH9A5voTHy0M3ighAL68IA+CgCyMv/EvpSyVJCcOMEAsjOyW0lBRIRAv7tRND6SDHUMdTTHzHSAPpQMCBukTCX+JLHBfLhqOIC0z8x+kj6ANdM0PABMSDXSQVwc+MEqgIlufLgyCSBA/C78uDJJKk4AvLQylME2zzy4MsEqwLwBCG78uDMI8jO+RaAUPgzIG6RMJ/Q9AVSEIMH9A5voTHy0M3i+CgByMv/EhMACIQP8vAB6jCrAnpxIsAElluBA+iAZN4iwAWWW4EB9IAy3iLABpZbgQGQgCjeIsAHlluBASyAHt4iwAiWW4EAyIAU3iLACZRbgGR63gLACpVbgDJ1Ad6CEDuaygCoAYIQO5rKAKgEghBi5PMQoYIIJ40AqQQgwhWRW+MOAhAA6vkWgFD4MyBukTCf0PQFUhCDB/QOb6Ex8tDN4oIQC+vCAPgoAsjL/xL6UslSInDjBPiSBMjOyW0kBsj6UhLMFcoAz4QgFPpUycjPiYgBUyXIz4TQzMz5Fs8L/1AE+gKBAI3PC3AUzBPMzMkBk3H7AJSAQPsA4gAYNAOYAqdagGSpBALkAHbI+lISzBTKAM+EIBP6VMnIz4mIAVM1yM+E0MzM+RbPC/9Y+gKBAI3PC3AUzMwSzMkBk3H7AJSAQPsA4gC47aLt+3ABqwIgpQGOSwLTByHCL5UhwTrDAJFw4iLCYJUiwXvDAJFw4gGSMH+SwwDiIJEyjhcwAcAtlSHCAMMAkXDilVMSucMAkXDiAeIBlV8DcNsx4QGkWORfA38AbvpSyQTIzsn4kgPI+lLMz4EB+gL6VMnIz4mIAV3Iz4TQzMz5Fs8L/4EAjc8LdBLMEszMyYBA+wACASAWFwIBIBgZAAe4tdMYAGO6ej7UTQ+kgx1DHU0x8x0gAx+lAx0fgoAsjL/xL6UskByM+E0MzM+RbIz4oAQMv/z1CAAxuQW+1E0PpI1NQx0x8x0gD6UDHRfwNt4wSAIBWBobAM+wwwwINdJqTgC8tBGINcKByDAAAGRcJch10nACMMA4pNbeG3gIJUB0wcxAd4hcHCRs54B0wchwAAClAKmCALeWegxIMIA8uDJUSLXGcjO+RaCAWej7UPYAXhw4wQSoMjPiupOEvpSyYAAzsWb7UTQ+kjUMdQx0x8x0gAx+lAx0XWAZFiA=');

    static Errors = {
        'ERROR_DNS_INVALID_SUBDOMAIN_BITS': 70,
        'ERROR_AUCTION_NOT_STARTED': 199,
        'ERROR_DOMAIN_TOO_SHORT': 200,
        'ERROR_DOMAIN_TOO_LONG': 201,
        'ERROR_DOMAIN_FORMAT_INVALID': 202,
        'ERROR_DOMAIN_HAS_INVALID_CHARS': 203,
        'ERROR_BID_BELOW_MIN_PRICE': 204,
        'ERROR_DOMAIN_IS_BLACKLISTED': 205,
        'ERROR_NOT_ENOUGH_BALANCE': 402,
        'ERROR_NOT_AUTHORIZED_TREASURY': 417,
        'ERROR_RESERVATION_PERIOD_ACTIVE': 418,
        'ERROR_INCORRECT_SENDER': 424,
        'ERROR_UNKNOWN_OP': 65535,
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
        isInstantMint?: boolean /* = false */
        fiMinterAddress?: c.Address | null /* = null */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? DnsCollection.CodeCell,
            data: CollectionStorage.toCell(CollectionStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new DnsCollection(address, initialState);
    }

    static createCellOfDeployDnsDomain(body: {
        payload: RemainingBitsAndRefs
    }) {
        return DeployDnsDomain.toCell(DeployDnsDomain.create(body));
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendDeployDnsDomain(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        payload: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DeployDnsDomain.toCell(DeployDnsDomain.create(body)),
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
