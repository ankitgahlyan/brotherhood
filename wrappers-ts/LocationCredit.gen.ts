// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a LocationCredit contract in Tolk.
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
 > struct LocationCreditEntry {
 >     borrowerAddress: address
 >     amount: coins
 >     multiplier: uint16
 >     cutoffDate: uint32
 >     maturityDate: uint32
 > }
 */
export interface LocationCreditEntry {
    readonly $: 'LocationCreditEntry'
    borrowerAddress: c.Address
    amount: coins
    multiplier: uint16
    cutoffDate: uint32
    maturityDate: uint32
}

export const LocationCreditEntry = {
    create(args: {
        borrowerAddress: c.Address
        amount: coins
        multiplier: uint16
        cutoffDate: uint32
        maturityDate: uint32
    }): LocationCreditEntry {
        return {
            $: 'LocationCreditEntry',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationCreditEntry {
        return {
            $: 'LocationCreditEntry',
            borrowerAddress: s.loadAddress(),
            amount: s.loadCoins(),
            multiplier: s.loadUintBig(16),
            cutoffDate: s.loadUintBig(32),
            maturityDate: s.loadUintBig(32),
        }
    },
    store(self: LocationCreditEntry, b: c.Builder): void {
        b.storeAddress(self.borrowerAddress);
        b.storeCoins(self.amount);
        b.storeUint(self.multiplier, 16);
        b.storeUint(self.cutoffDate, 32);
        b.storeUint(self.maturityDate, 32);
    },
    toCell(self: LocationCreditEntry): c.Cell {
        return makeCellFrom<LocationCreditEntry>(self, LocationCreditEntry.store);
    }
}

/**
 > struct LocationCreditStore {
 >     h3Cell: string
 >     proxyAddress: address
 >     adminAddress: address
 >     entryCount: uint32
 >     entries: map<address, LocationCreditEntry>
 >     version: uint10
 > }
 */
export interface LocationCreditStore {
    readonly $: 'LocationCreditStore'
    h3Cell: string
    proxyAddress: c.Address
    adminAddress: c.Address
    entryCount: uint32 /* = 0 */
    entries: c.Dictionary<c.Address, LocationCreditEntry> /* = [] as map<address, LocationCreditEntry> */
    version: uint10 /* = 1 */
}

export const LocationCreditStore = {
    create(args: {
        h3Cell: string
        proxyAddress: c.Address
        adminAddress: c.Address
        entryCount?: uint32 /* = 0 */
        entries: c.Dictionary<c.Address, LocationCreditEntry> /* = [] as map<address, LocationCreditEntry> */
        version?: uint10 /* = 1 */
    }): LocationCreditStore {
        return {
            $: 'LocationCreditStore',
            entryCount: 0n,
            version: 1n,
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationCreditStore {
        return {
            $: 'LocationCreditStore',
            h3Cell: s.loadStringRefTail(),
            proxyAddress: s.loadAddress(),
            adminAddress: s.loadAddress(),
            entryCount: s.loadUintBig(32),
            entries: c.Dictionary.load<c.Address, LocationCreditEntry>(c.Dictionary.Keys.Address(), createDictionaryValue<LocationCreditEntry>(LocationCreditEntry.fromSlice, LocationCreditEntry.store), s),
            version: s.loadUintBig(10),
        }
    },
    store(self: LocationCreditStore, b: c.Builder): void {
        b.storeStringRefTail(self.h3Cell);
        b.storeAddress(self.proxyAddress);
        b.storeAddress(self.adminAddress);
        b.storeUint(self.entryCount, 32);
        b.storeDict<c.Address, LocationCreditEntry>(self.entries, c.Dictionary.Keys.Address(), createDictionaryValue<LocationCreditEntry>(LocationCreditEntry.fromSlice, LocationCreditEntry.store));
        b.storeUint(self.version, 10);
    },
    toCell(self: LocationCreditStore): c.Cell {
        return makeCellFrom<LocationCreditStore>(self, LocationCreditStore.store);
    }
}

// ————————————————————————————————————————————
//    class LocationCredit
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

export class LocationCredit implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECCAEAAd8AART/APSkE/S88sgLAQIBYgIDA8zQ+JHyQCDHAJEw4CDtRNDU+kj6SNMf9AQG1ywgAACLFOMC1ywgAACLHOMCNFszMdcsIAAAgFyOGzL4kscF8uBJ9ATXTCD7BNDtHu1TIG6RMODtVODXLCAAAILMMeMCMIQPAccA8vQEBQYAI6HJA9qJoan0kfSRpj/oCaYTowH+N/iSJMcF8uK8BtM/+kj6SNT6UDBTOoEBC/QKb6ExkwWkBd8B0PoA0w/TH9Mf0QXI+lJQA/oCyw/LHxLLH0AJgQEL9EH4l/gnbxCi+C+ggGSCAMNQghAJZgGAcPg3tgly+wIFyMwU+lIS+lLLHxL0ABLOye1UIW6RW+DIz4UIEgcA/jf4kiTHBfLivAbTP/pI+lAwUxiBAQv0Cm+hMY5BCIEBC/RZMCLCAJMCpQLe+Jf4J28QovgvoIBkggDDUIIQCWYBgHD4N7YJcvsCBcjMFPpSEvpSyx8S9AASzsntVAGUEChsceIgbpFb4MjPhQj6UoIQ1TJ2288Ljss/yYBC+wAAajH4kscF8uBJ+JLIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAACT6UoIQ1TJ2288Ljss/yYBC+wA=');

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
        return new LocationCredit(address);
    }

    static fromStorage(emptyStorage: {
        h3Cell: string
        proxyAddress: c.Address
        adminAddress: c.Address
        entryCount?: uint32 /* = 0 */
        entries: c.Dictionary<c.Address, LocationCreditEntry> /* = [] as map<address, LocationCreditEntry> */
        version?: uint10 /* = 1 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? LocationCredit.CodeCell,
            data: LocationCreditStore.toCell(LocationCreditStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new LocationCredit(address, initialState);
    }

    static createCellOfAddLocationCreditEntry(body: {
        queryId: uint64
        tokenWalletAddress: c.Address
        borrowerAddress: c.Address
        terms: CellRef<LocationCreditTerms>
        sendExcessesTo?: c.Address | null /* = null */
    }) {
        return AddLocationCreditEntry.toCell(AddLocationCreditEntry.create(body));
    }

    static createCellOfRemoveLocationCreditEntry(body: {
        queryId: uint64
        tokenWalletAddress: c.Address
        sendExcessesTo?: c.Address | null /* = null */
    }) {
        return RemoveLocationCreditEntry.toCell(RemoveLocationCreditEntry.create(body));
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

    async sendAddLocationCreditEntry(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        tokenWalletAddress: c.Address
        borrowerAddress: c.Address
        terms: CellRef<LocationCreditTerms>
        sendExcessesTo?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AddLocationCreditEntry.toCell(AddLocationCreditEntry.create(body)),
            ...extraOptions
        });
    }

    async sendRemoveLocationCreditEntry(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        tokenWalletAddress: c.Address
        sendExcessesTo?: c.Address | null /* = null */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RemoveLocationCreditEntry.toCell(RemoveLocationCreditEntry.create(body)),
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

    async getState(provider: ContractProvider): Promise<LocationCreditStore> {
        const r = StackReader.fromGetMethod(6, await provider.get('getState', []));
        return ({
            $: 'LocationCreditStore',
            h3Cell: r.readSnakeString(),
            proxyAddress: r.readSlice().loadAddress(),
            adminAddress: r.readSlice().loadAddress(),
            entryCount: r.readBigInt(),
            entries: r.readDictionary<c.Address, LocationCreditEntry>(c.Dictionary.Keys.Address(), createDictionaryValue<LocationCreditEntry>(LocationCreditEntry.fromSlice, LocationCreditEntry.store)),
            version: r.readBigInt(),
        });
    }
}
