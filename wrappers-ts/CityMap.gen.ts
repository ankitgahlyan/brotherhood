// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a CityMap contract in Tolk.
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

type uint64 = bigint

/**
 > struct CityMapStore {
 >     cityName: string
 >     locationAddress: address
 >     members: map<address, bool>
 > }
 */
export interface CityMapStore {
    readonly $: 'CityMapStore'
    cityName: string
    locationAddress: c.Address
    members: c.Dictionary<c.Address, boolean>
}

export const CityMapStore = {
    create(args: {
        cityName: string
        locationAddress: c.Address
        members: c.Dictionary<c.Address, boolean>
    }): CityMapStore {
        return {
            $: 'CityMapStore',
            ...args
        }
    },
    fromSlice(s: c.Slice): CityMapStore {
        return {
            $: 'CityMapStore',
            cityName: s.loadStringRefTail(),
            locationAddress: s.loadAddress(),
            members: c.Dictionary.load<c.Address, boolean>(c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool(), s),
        }
    },
    store(self: CityMapStore, b: c.Builder): void {
        b.storeStringRefTail(self.cityName);
        b.storeAddress(self.locationAddress);
        b.storeDict<c.Address, boolean>(self.members, c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool());
    },
    toCell(self: CityMapStore): c.Cell {
        return makeCellFrom<CityMapStore>(self, CityMapStore.store);
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
//    class CityMap
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

export class CityMap implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgEBCAEAqgABFP8A9KQT9LzyyAsBAgFiAgMA0ND4kfJA7UTQ1PpI9AUD1ywgAACFNI4j+JIixwXy4EnTPzH6SDDIz4NAFIEBC/RBAcjMEvpS9ADJ7VTg1ywgAACFPI4h+JIixwXy4EnTPzH6SDBQA4EBC/RZMAHIzBL6UvQAye1U4PI/AgEgBAUCAW4GBwAZv5U3aiaGoY/SQY+gLAARsYt7UTQ+kgwgAA+xX3tRNDXTIA==');

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
        return new CityMap(address);
    }

    static fromStorage(emptyStorage: {
        cityName: string
        locationAddress: c.Address
        members: c.Dictionary<c.Address, boolean>
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? CityMap.CodeCell,
            data: CityMapStore.toCell(CityMapStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new CityMap(address, initialState);
    }

    static createCellOfRegisterCityMember(body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }) {
        return RegisterCityMember.toCell(RegisterCityMember.create(body));
    }

    static createCellOfUnregisterCityMember(body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }) {
        return UnregisterCityMember.toCell(UnregisterCityMember.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendRegisterCityMember(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RegisterCityMember.toCell(RegisterCityMember.create(body)),
            ...extraOptions
        });
    }

    async sendUnregisterCityMember(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        ownerAddress: c.Address
        cityName: string
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: UnregisterCityMember.toCell(UnregisterCityMember.create(body)),
            ...extraOptions
        });
    }

    async getCityName(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_city_name', []));
        return r.readSnakeString();
    }

    async getLocationAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_location_address', []));
        return r.readSlice().loadAddress();
    }

    async getMembers(provider: ContractProvider): Promise<c.Dictionary<c.Address, boolean>> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_members', []));
        return r.readDictionary<c.Address, boolean>(c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool());
    }
}
