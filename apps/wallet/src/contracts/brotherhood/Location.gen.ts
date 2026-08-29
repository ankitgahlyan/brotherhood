// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Location contract in Tolk.
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

type uint8 = bigint
type uint10 = bigint
type uint64 = bigint
type uint256 = bigint

/**
 > struct LocationStore {
 >     letterKey: uint8
 >     version: uint10
 >     cityMapVersion: uint10
 >     minterAddress: address
 >     cityMapCode: cell
 >     cities: map<uint256, string>
 > }
 */
export interface LocationStore {
    readonly $: 'LocationStore'
    letterKey: uint8
    version: uint10 /* = 0 */
    cityMapVersion: uint10 /* = 0 */
    minterAddress: c.Address
    cityMapCode: c.Cell
    cities: c.Dictionary<uint256, string>
}

export const LocationStore = {
    create(args: {
        letterKey: uint8
        version?: uint10 /* = 0 */
        cityMapVersion?: uint10 /* = 0 */
        minterAddress: c.Address
        cityMapCode: c.Cell
        cities: c.Dictionary<uint256, string>
    }): LocationStore {
        return {
            $: 'LocationStore',
            version: 0n,
            cityMapVersion: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationStore {
        return {
            $: 'LocationStore',
            letterKey: s.loadUintBig(8),
            version: s.loadUintBig(10),
            cityMapVersion: s.loadUintBig(10),
            minterAddress: s.loadAddress(),
            cityMapCode: s.loadRef(),
            cities: c.Dictionary.load<uint256, string>(c.Dictionary.Keys.BigUint(256), createDictionaryValue<string>(
                (s) => s.loadStringRefTail(),
                (v,b) => b.storeStringRefTail(v)
            ), s),
        }
    },
    store(self: LocationStore, b: c.Builder): void {
        b.storeUint(self.letterKey, 8);
        b.storeUint(self.version, 10);
        b.storeUint(self.cityMapVersion, 10);
        b.storeAddress(self.minterAddress);
        b.storeRef(self.cityMapCode);
        b.storeDict<uint256, string>(self.cities, c.Dictionary.Keys.BigUint(256), createDictionaryValue<string>(
            (s) => s.loadStringRefTail(),
            (v,b) => b.storeStringRefTail(v)
        ));
    },
    toCell(self: LocationStore): c.Cell {
        return makeCellFrom<LocationStore>(self, LocationStore.store);
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
 > struct (0x000010a4) LocationRegisterCity {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 > }
 */
export interface LocationRegisterCity {
    readonly $: 'LocationRegisterCity'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const LocationRegisterCity = {
    PREFIX: 0x000010a4,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): LocationRegisterCity {
        return {
            $: 'LocationRegisterCity',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationRegisterCity {
        loadAndCheckPrefix32(s, 0x000010a4, 'LocationRegisterCity');
        return {
            $: 'LocationRegisterCity',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationRegisterCity, b: c.Builder): void {
        b.storeUint(0x000010a4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationRegisterCity): c.Cell {
        return makeCellFrom<LocationRegisterCity>(self, LocationRegisterCity.store);
    }
}

/**
 > struct (0x000010a5) LocationUnregisterCity {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 > }
 */
export interface LocationUnregisterCity {
    readonly $: 'LocationUnregisterCity'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const LocationUnregisterCity = {
    PREFIX: 0x000010a5,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): LocationUnregisterCity {
        return {
            $: 'LocationUnregisterCity',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationUnregisterCity {
        loadAndCheckPrefix32(s, 0x000010a5, 'LocationUnregisterCity');
        return {
            $: 'LocationUnregisterCity',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationUnregisterCity, b: c.Builder): void {
        b.storeUint(0x000010a5, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationUnregisterCity): c.Cell {
        return makeCellFrom<LocationUnregisterCity>(self, LocationUnregisterCity.store);
    }
}

/**
 > struct (0x000010a6) RegisterCityMember {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 >     version: uint10
 > }
 */
export interface RegisterCityMember {
    readonly $: 'RegisterCityMember'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
    version: uint10 /* = 0 */
}

export const RegisterCityMember = {
    PREFIX: 0x000010a6,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
        version?: uint10 /* = 0 */
    }): RegisterCityMember {
        return {
            $: 'RegisterCityMember',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): RegisterCityMember {
        loadAndCheckPrefix32(s, 0x000010a6, 'RegisterCityMember');
        return {
            $: 'RegisterCityMember',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: RegisterCityMember, b: c.Builder): void {
        b.storeUint(0x000010a6, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
        b.storeUint(self.version, 10);
    },
    toCell(self: RegisterCityMember): c.Cell {
        return makeCellFrom<RegisterCityMember>(self, RegisterCityMember.store);
    }
}

/**
 > struct (0x000010a7) UnregisterCityMember {
 >     queryId: uint64
 >     ownerAddress: address
 >     cityName: string
 >     sendExcessesTo: address?
 >     version: uint10
 > }
 */
export interface UnregisterCityMember {
    readonly $: 'UnregisterCityMember'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
    version: uint10 /* = 0 */
}

export const UnregisterCityMember = {
    PREFIX: 0x000010a7,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
        version?: uint10 /* = 0 */
    }): UnregisterCityMember {
        return {
            $: 'UnregisterCityMember',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): UnregisterCityMember {
        loadAndCheckPrefix32(s, 0x000010a7, 'UnregisterCityMember');
        return {
            $: 'UnregisterCityMember',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            cityName: s.loadStringRefTail(),
            sendExcessesTo: s.loadMaybeAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: UnregisterCityMember, b: c.Builder): void {
        b.storeUint(0x000010a7, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
        b.storeUint(self.version, 10);
    },
    toCell(self: UnregisterCityMember): c.Cell {
        return makeCellFrom<UnregisterCityMember>(self, UnregisterCityMember.store);
    }
}

// ————————————————————————————————————————————
//    class Location
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

export class Location implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECFQEAAsoAART/APSkE/S88sgLAQIBYgIDBPLQ+JHyQO1E0NYH0wnTCfpI1PQFBtcsIAAAhSTjAtcsIAAAhSzjAtcsIAAAgFyOPDFsQviSWMcF8uBJ9AQx10wg+wTQ7R7tU+1E0NMH0wnTCfpI1PQE0QSkBcjLBxXLCRLLCfpSEsz0AMntVODXLCAAAIA04wIybDMBBAUGBwIBIAkKAPb4kiPHBfLgSdM/+kjU+lAwIdDIzvkWVEIbgwf0NzAIyM4XywklzwsJFPpSIs8UFvQAye1U+ChtJcjMz4gAgBL6UvQAycjPkAAAQpoWyz8S+lITzBT6VBPLCcnIz4kIAVMjyM+E0MzM+RbPC/+BAI3PC3QTzMzMyYBA+wAAsjQ0NPiSUATHBfLgSdM/+kjU+lAw+ChtI8jMz4gAgBL6UvQAycjPkAAAQp4Vyz8T+lLM+lQTywnJyM+JCAFdyM+E0MzM+RbPC/+BAI3PC3QSzBLMzMmAQPsAAOj4kiPHBfLgSdIA0wn6SDH0BDH0BQKOGzADpCNukTOSMQLiBMjOE8sJywn6Usz0AMntVI4/UGdfBSK5bBKOMiBukTCYIPsE0O0e7VPi7UTQ0wfTCdMJ+kjU9ATRBKQFyMsHFcsJEssJ+lISzPQAye1UkTDi4gFiidcnMY4o+JL4KG3Iz5AAAEAbFcsJ+lIT9AD0AMnIz4UIEvpScc8LbszJgEL7AODyPwgACAAAEAgCASALDAIBIBESAB+5AW7UTQ0xsx+kgx1DH0BYAgEgDQ4CASAPEAAXt989qJoaYiY64WEwABewZDtRNDTBzHXCwmAAU7K7u1E0NdM+ChtA8jMz4gAgPpSEvQAyQHIz4TQzMz5FsjPigBAy//PUIAARuvy+1E0NcLB4AgFqExQAO64S9qJoaY2Y/SQY6hj6AoDoZGd8iwDBg/oHN9CYwAAXrFZ2omhpjZj9JBhA');

    static Errors = {
        'Errors.NotOwner': 73,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Location(address);
    }

    static fromStorage(emptyStorage: {
        letterKey: uint8
        version?: uint10 /* = 0 */
        cityMapVersion?: uint10 /* = 0 */
        minterAddress: c.Address
        cityMapCode: c.Cell
        cities: c.Dictionary<uint256, string>
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Location.CodeCell,
            data: LocationStore.toCell(LocationStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Location(address, initialState);
    }

    static createCellOfLocationRegisterCity(body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }) {
        return LocationRegisterCity.toCell(LocationRegisterCity.create(body));
    }

    static createCellOfLocationUnregisterCity(body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }) {
        return LocationUnregisterCity.toCell(LocationUnregisterCity.create(body));
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

    static createCellOfRequestUpgradeCode(body: {
        sender: c.Address
        version: uint10
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

    async sendLocationRegisterCity(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LocationRegisterCity.toCell(LocationRegisterCity.create(body)),
            ...extraOptions
        });
    }

    async sendLocationUnregisterCity(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LocationUnregisterCity.toCell(LocationUnregisterCity.create(body)),
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

    async getVersion(provider: ContractProvider): Promise<uint10> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_version', []));
        return r.readBigInt();
    }

    async getCityMapVersion(provider: ContractProvider): Promise<uint10> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_city_map_version', []));
        return r.readBigInt();
    }

    async getLetterKey(provider: ContractProvider): Promise<uint8> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_letter_key', []));
        return r.readBigInt();
    }

    async getMinterAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_minter_address', []));
        return r.readSlice().loadAddress();
    }

    async getCityExists(provider: ContractProvider, cityName: string): Promise<boolean> {
        const r = StackReader.fromGetMethod(1, await provider.get('city_exists', [
            { type: 'cell', cell: beginCell().storeStringTail(cityName).endCell() },
        ]));
        return r.readBoolean();
    }

    async getCities(provider: ContractProvider): Promise<c.Dictionary<uint256, string>> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_cities', []));
        return r.readDictionary<uint256, string>(c.Dictionary.Keys.BigUint(256), createDictionaryValue<string>(
            (s) => s.loadStringRefTail(),
            (v,b) => b.storeStringRefTail(v)
        ));
    }

    async getCityMapAddress(provider: ContractProvider, cityName: string): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_city_map_address', [
            { type: 'cell', cell: beginCell().storeStringTail(cityName).endCell() },
        ]));
        return r.readSlice().loadAddress();
    }
}
