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
type uint64 = bigint
type uint256 = bigint

/**
 > struct LocationStore {
 >     letterKey: uint8
 >     minterAddress: address
 >     cityMapCode: cell
 >     cities: map<uint256, string>
 > }
 */
export interface LocationStore {
    readonly $: 'LocationStore'
    letterKey: uint8
    minterAddress: c.Address
    cityMapCode: c.Cell
    cities: c.Dictionary<uint256, string>
}

export const LocationStore = {
    create(args: {
        letterKey: uint8
        minterAddress: c.Address
        cityMapCode: c.Cell
        cities: c.Dictionary<uint256, string>
    }): LocationStore {
        return {
            $: 'LocationStore',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationStore {
        return {
            $: 'LocationStore',
            letterKey: s.loadUintBig(8),
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
 > }
 */
export interface RegisterCityMember {
    readonly $: 'RegisterCityMember'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const RegisterCityMember = {
    PREFIX: 0x000010a6,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): RegisterCityMember {
        return {
            $: 'RegisterCityMember',
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
        }
    },
    store(self: RegisterCityMember, b: c.Builder): void {
        b.storeUint(0x000010a6, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
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
 > }
 */
export interface UnregisterCityMember {
    readonly $: 'UnregisterCityMember'
    queryId: uint64
    ownerAddress: c.Address
    cityName: string
    sendExcessesTo: c.Address | null
}

export const UnregisterCityMember = {
    PREFIX: 0x000010a7,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }): UnregisterCityMember {
        return {
            $: 'UnregisterCityMember',
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
        }
    },
    store(self: UnregisterCityMember, b: c.Builder): void {
        b.storeUint(0x000010a7, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.sendExcessesTo);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECDQEAAYAAART/APSkE/S88sgLAQIBYgIDAezQ+JHyQO1E0NYH+kjU9AUE1ywgAACFJOMCMzMB1ywgAACFLI5O+JJYxwXy4EnTP/pI1PpQMPgobSPIzBL6UvQAycjPkAAAQp4Vyz8T+lLM+lTJyM+JCAFTI8jPhNDMzPkWzwv/gQCNzwt0E8zMzMmAQPsA4PI/BAIBIAUGANj4kiPHBfLgSdM/+kjU+lAwIdDIzvkWVEIZgwf0FwbIzhX6UiPPFBX0AMntVPgobSTIzBL6UvQAycjPkAAAQpoSyz8U+lISzBP6VMnIz4kIAVMjyM+E0MzM+RbPC/+BAI3PC3QTzMzMyYBA+wACASAHCAIBIAkKAB+5AW7UTQ0wcx+kgx1DH0BYAEu5ru7UTQ10z4KG0DyMz6UhL0AMkByM+E0MzM+RbIz4oAQMv/z1CAARuvy+1E0NcLB4AgFqCwwAO64S9qJoaYOY/SQY6hj6AoDoZGd8iwDBg/oHN9CYwAAXrFZ2omhpg5j9JBhA');

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
