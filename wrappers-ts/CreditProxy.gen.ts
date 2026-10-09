// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a CreditProxy contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint10 = bigint
type uint16 = bigint
type uint32 = bigint
type uint64 = bigint

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
 > struct LocationCreditTerms {
 >     amount: coins
 >     multiplier: uint16
 >     cutoffDate: uint32
 >     maturityDate: uint32
 > }
 */
export interface LocationCreditTerms {
    readonly $: 'LocationCreditTerms'
    amount: coins
    multiplier: uint16
    cutoffDate: uint32
    maturityDate: uint32
}

export const LocationCreditTerms = {
    create(args: {
        amount: coins
        multiplier: uint16
        cutoffDate: uint32
        maturityDate: uint32
    }): LocationCreditTerms {
        return {
            $: 'LocationCreditTerms',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationCreditTerms {
        return {
            $: 'LocationCreditTerms',
            amount: s.loadCoins(),
            multiplier: s.loadUintBig(16),
            cutoffDate: s.loadUintBig(32),
            maturityDate: s.loadUintBig(32),
        }
    },
    store(self: LocationCreditTerms, b: c.Builder): void {
        b.storeCoins(self.amount);
        b.storeUint(self.multiplier, 16);
        b.storeUint(self.cutoffDate, 32);
        b.storeUint(self.maturityDate, 32);
    },
    toCell(self: LocationCreditTerms): c.Cell {
        return makeCellFrom<LocationCreditTerms>(self, LocationCreditTerms.store);
    }
}

/**
 > struct CreditTokenInfo {
 >     tokenMinter: address?
 >     deployer: address?
 > }
 */
export interface CreditTokenInfo {
    readonly $: 'CreditTokenInfo'
    tokenMinter: c.Address | null /* = null */
    deployer: c.Address | null /* = null */
}

export const CreditTokenInfo = {
    create(args: {
        tokenMinter?: c.Address | null /* = null */
        deployer?: c.Address | null /* = null */
    }): CreditTokenInfo {
        return {
            $: 'CreditTokenInfo',
            tokenMinter: null,
            deployer: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditTokenInfo {
        return {
            $: 'CreditTokenInfo',
            tokenMinter: s.loadMaybeAddress(),
            deployer: s.loadMaybeAddress(),
        }
    },
    store(self: CreditTokenInfo, b: c.Builder): void {
        b.storeAddress(self.tokenMinter);
        b.storeAddress(self.deployer);
    },
    toCell(self: CreditTokenInfo): c.Cell {
        return makeCellFrom<CreditTokenInfo>(self, CreditTokenInfo.store);
    }
}

/**
 > struct (0x00001160) CreditProxySetNeed {
 >     queryId: uint64
 >     owner: address
 >     h3Cell: string
 >     terms: Cell<LocationCreditTerms>
 >     tokenInfo: Cell<CreditTokenInfo>?
 > }
 */
export interface CreditProxySetNeed {
    readonly $: 'CreditProxySetNeed'
    queryId: uint64
    owner: c.Address
    h3Cell: string
    terms: CellRef<LocationCreditTerms>
    tokenInfo: CellRef<CreditTokenInfo> | null /* = null */
}

export const CreditProxySetNeed = {
    PREFIX: 0x00001160,

    create(args: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        terms: CellRef<LocationCreditTerms>
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }): CreditProxySetNeed {
        return {
            $: 'CreditProxySetNeed',
            tokenInfo: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditProxySetNeed {
        loadAndCheckPrefix32(s, 0x00001160, 'CreditProxySetNeed');
        return {
            $: 'CreditProxySetNeed',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            h3Cell: s.loadStringRefTail(),
            terms: loadCellRef<LocationCreditTerms>(s, LocationCreditTerms.fromSlice),
            tokenInfo: s.loadBoolean() ? loadCellRef<CreditTokenInfo>(s, CreditTokenInfo.fromSlice) : null,
        }
    },
    store(self: CreditProxySetNeed, b: c.Builder): void {
        b.storeUint(0x00001160, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeStringRefTail(self.h3Cell);
        storeCellRef<LocationCreditTerms>(self.terms, b, LocationCreditTerms.store);
        storeTolkNullable<CellRef<CreditTokenInfo>>(self.tokenInfo, b,
            (v,b) => storeCellRef<CreditTokenInfo>(v, b, CreditTokenInfo.store)
        );
    },
    toCell(self: CreditProxySetNeed): c.Cell {
        return makeCellFrom<CreditProxySetNeed>(self, CreditProxySetNeed.store);
    }
}

/**
 > struct (0x00001161) CreditProxyRemoveNeed {
 >     queryId: uint64
 >     owner: address
 >     h3Cell: string
 >     tokenInfo: Cell<CreditTokenInfo>?
 > }
 */
export interface CreditProxyRemoveNeed {
    readonly $: 'CreditProxyRemoveNeed'
    queryId: uint64
    owner: c.Address
    h3Cell: string
    tokenInfo: CellRef<CreditTokenInfo> | null /* = null */
}

export const CreditProxyRemoveNeed = {
    PREFIX: 0x00001161,

    create(args: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }): CreditProxyRemoveNeed {
        return {
            $: 'CreditProxyRemoveNeed',
            tokenInfo: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditProxyRemoveNeed {
        loadAndCheckPrefix32(s, 0x00001161, 'CreditProxyRemoveNeed');
        return {
            $: 'CreditProxyRemoveNeed',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            h3Cell: s.loadStringRefTail(),
            tokenInfo: s.loadBoolean() ? loadCellRef<CreditTokenInfo>(s, CreditTokenInfo.fromSlice) : null,
        }
    },
    store(self: CreditProxyRemoveNeed, b: c.Builder): void {
        b.storeUint(0x00001161, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeStringRefTail(self.h3Cell);
        storeTolkNullable<CellRef<CreditTokenInfo>>(self.tokenInfo, b,
            (v,b) => storeCellRef<CreditTokenInfo>(v, b, CreditTokenInfo.store)
        );
    },
    toCell(self: CreditProxyRemoveNeed): c.Cell {
        return makeCellFrom<CreditProxyRemoveNeed>(self, CreditProxyRemoveNeed.store);
    }
}

/**
 > struct (0x00001162) AddLocationCreditEntry {
 >     queryId: uint64
 >     tokenWalletAddress: address
 >     borrowerAddress: address
 >     terms: Cell<LocationCreditTerms>
 >     sendExcessesTo: address?
 > }
 */
export interface AddLocationCreditEntry {
    readonly $: 'AddLocationCreditEntry'
    queryId: uint64
    tokenWalletAddress: c.Address
    borrowerAddress: c.Address
    terms: CellRef<LocationCreditTerms>
    sendExcessesTo: c.Address | null /* = null */
}

export const AddLocationCreditEntry = {
    PREFIX: 0x00001162,

    create(args: {
        queryId: uint64
        tokenWalletAddress: c.Address
        borrowerAddress: c.Address
        terms: CellRef<LocationCreditTerms>
        sendExcessesTo?: c.Address | null /* = null */
    }): AddLocationCreditEntry {
        return {
            $: 'AddLocationCreditEntry',
            sendExcessesTo: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): AddLocationCreditEntry {
        loadAndCheckPrefix32(s, 0x00001162, 'AddLocationCreditEntry');
        return {
            $: 'AddLocationCreditEntry',
            queryId: s.loadUintBig(64),
            tokenWalletAddress: s.loadAddress(),
            borrowerAddress: s.loadAddress(),
            terms: loadCellRef<LocationCreditTerms>(s, LocationCreditTerms.fromSlice),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: AddLocationCreditEntry, b: c.Builder): void {
        b.storeUint(0x00001162, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.tokenWalletAddress);
        b.storeAddress(self.borrowerAddress);
        storeCellRef<LocationCreditTerms>(self.terms, b, LocationCreditTerms.store);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: AddLocationCreditEntry): c.Cell {
        return makeCellFrom<AddLocationCreditEntry>(self, AddLocationCreditEntry.store);
    }
}

/**
 > struct (0x00001163) RemoveLocationCreditEntry {
 >     queryId: uint64
 >     tokenWalletAddress: address
 >     sendExcessesTo: address?
 > }
 */
export interface RemoveLocationCreditEntry {
    readonly $: 'RemoveLocationCreditEntry'
    queryId: uint64
    tokenWalletAddress: c.Address
    sendExcessesTo: c.Address | null /* = null */
}

export const RemoveLocationCreditEntry = {
    PREFIX: 0x00001163,

    create(args: {
        queryId: uint64
        tokenWalletAddress: c.Address
        sendExcessesTo?: c.Address | null /* = null */
    }): RemoveLocationCreditEntry {
        return {
            $: 'RemoveLocationCreditEntry',
            sendExcessesTo: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): RemoveLocationCreditEntry {
        loadAndCheckPrefix32(s, 0x00001163, 'RemoveLocationCreditEntry');
        return {
            $: 'RemoveLocationCreditEntry',
            queryId: s.loadUintBig(64),
            tokenWalletAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: RemoveLocationCreditEntry, b: c.Builder): void {
        b.storeUint(0x00001163, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.tokenWalletAddress);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: RemoveLocationCreditEntry): c.Cell {
        return makeCellFrom<RemoveLocationCreditEntry>(self, RemoveLocationCreditEntry.store);
    }
}

/**
 > struct CreditProxyStore {
 >     adminAddress: address
 >     fiMinterAddress: address
 >     locationCreditCode: cell
 >     version: uint10
 > }
 */
export interface CreditProxyStore {
    readonly $: 'CreditProxyStore'
    adminAddress: c.Address
    fiMinterAddress: c.Address
    locationCreditCode: c.Cell
    version: uint10 /* = 1 */
}

export const CreditProxyStore = {
    create(args: {
        adminAddress: c.Address
        fiMinterAddress: c.Address
        locationCreditCode: c.Cell
        version?: uint10 /* = 1 */
    }): CreditProxyStore {
        return {
            $: 'CreditProxyStore',
            version: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditProxyStore {
        return {
            $: 'CreditProxyStore',
            adminAddress: s.loadAddress(),
            fiMinterAddress: s.loadAddress(),
            locationCreditCode: s.loadRef(),
            version: s.loadUintBig(10),
        }
    },
    store(self: CreditProxyStore, b: c.Builder): void {
        b.storeAddress(self.adminAddress);
        b.storeAddress(self.fiMinterAddress);
        b.storeRef(self.locationCreditCode);
        b.storeUint(self.version, 10);
    },
    toCell(self: CreditProxyStore): c.Cell {
        return makeCellFrom<CreditProxyStore>(self, CreditProxyStore.store);
    }
}

// ————————————————————————————————————————————
//    class CreditProxy
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

export class CreditProxy implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECEwEAA+cAART/APSkE/S88sgLAQIBYgIDAgLPBAUAG6HJA9qJofSR9JGpphOjA8M+JHyQCDHAJEw4CDtRND6SPpI10wD1ywgAACLBOMC1ywgAACLDOMCMWwS1ywgAACAXI4bMviSxwXy4En0BNdMIPsE0O0e7VMgbpEw4O1U4NcsIAAAgswx4wIwhA8BxwDy9IAYHCAT3CFujrYxiCLI+lIS+lLPiACAyXhRIsjPg8sEz4WgzMz5FoT3sBKAC1AD1yTIz4oAQM7L989QxwXy4rzgAdD6UPpQ0SFukX+WUxLHBcMA4uMCMiFus1QQI+MEiCPI+lIS+lIS+lLPiACAyXhRIsjPg8sEz4WgzMz5FoT3sIAwJCgsA8jQD0z/6SNTU9AX4klREAwnwAfgobVRBE8jME/pSFfpSz5AAAAAC9ADPiAGAyXj4ksjPkAAARYoVyz8U+lJSIPpSFsz6VMnIz4kIAVR1QsjPg8sEz4WgzMz5FoT3sASACyTXJDMSzhLL94EVDc8LeRLMEszMyYBC+wAA6jQD0z/6SNT0BfiSVEMDCPAB+ChtVEEXyMwX+lIU+lLPkAAAAAIV9ADPiAGAyXhRRMjPg8sEz4WgzMz5FoT3sBKAC1AE1yTIz4oAQM4Sy/fPUPiSyM+QAABFjhPLPxL6UhL6VMnIz4UIEvpScc8LbszJgEL7AABqMfiSxwXy4En4ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wABbFuIIsj6UhL6Us+IAIDJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBfLivAwBFP8A9KQT9LzyyAsRACwSgAtQA9ckyM+KAEDOy/fPUMcF8uK8ART/APSkE/S88sgLDQICxw4PAffX8SPkgdqJofSR9JGmE6LaSa5YQAABBSkch6aSY/SRrpnxJfBUpseR9KX0pZ8QAQGS8KJFkZ8HlgmfC0GZmfItCe9gKQAWoAuuSZGfFACBnCeX756gJY4LImMiYcUcLGOuWEAAAQB5JeR/w/EkR44L5cV56AvEQN0kvgvBEAAJrFevgsAAHiD7BNDtHu1T+JJVIPEIrwFO0yHQ0wMBcbDycfpIMO1E0PpIMfpI+kjTCTHRI9csILxqKMzjAvI/EgD20z8x+gD6SPpQMfoAMdMJMdIA9AVTZMcFkjI0jjz4KlNTyPpSGPpSF/pSz4gAgMl4UXfIz4PLBM+FoMzM+RaE97ATgAtQB9ckyM+KAEDOFcv3z1AlxwXy4EriAYIQO5rKALpQA7EDxwUSsSFus7Dy4v4g+wTQ7R7tU/AA');

    static Errors = {
        'Errors.NotOwner': 73,
        'Errors.IncorrectSender': 700,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new CreditProxy(address);
    }

    static fromStorage(emptyStorage: {
        adminAddress: c.Address
        fiMinterAddress: c.Address
        locationCreditCode: c.Cell
        version?: uint10 /* = 1 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? CreditProxy.CodeCell,
            data: CreditProxyStore.toCell(CreditProxyStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new CreditProxy(address, initialState);
    }

    static createCellOfCreditProxySetNeed(body: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        terms: CellRef<LocationCreditTerms>
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }) {
        return CreditProxySetNeed.toCell(CreditProxySetNeed.create(body));
    }

    static createCellOfCreditProxyRemoveNeed(body: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }) {
        return CreditProxyRemoveNeed.toCell(CreditProxyRemoveNeed.create(body));
    }

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
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

    async sendCreditProxySetNeed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        terms: CellRef<LocationCreditTerms>
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreditProxySetNeed.toCell(CreditProxySetNeed.create(body)),
            ...extraOptions
        });
    }

    async sendCreditProxyRemoveNeed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        h3Cell: string
        tokenInfo?: CellRef<CreditTokenInfo> | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreditProxyRemoveNeed.toCell(CreditProxyRemoveNeed.create(body)),
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

    async sendDestroy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Destroy.toCell(Destroy.create()),
            ...extraOptions
        });
    }

    async getState(provider: ContractProvider): Promise<CreditProxyStore> {
        const r = StackReader.fromGetMethod(4, await provider.get('getState', []));
        return ({
            $: 'CreditProxyStore',
            adminAddress: r.readSlice().loadAddress(),
            fiMinterAddress: r.readSlice().loadAddress(),
            locationCreditCode: r.readCell(),
            version: r.readBigInt(),
        });
    }
}
