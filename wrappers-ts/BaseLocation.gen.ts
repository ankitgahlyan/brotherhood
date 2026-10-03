// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BaseLocation contract in Tolk.
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
type uint64 = bigint

/**
 > type AllowedMessageToBaseLocation = LocationAddMember
 */
export type AllowedMessageToBaseLocation = LocationAddMember

export const AllowedMessageToBaseLocation = {
    fromSlice(s: c.Slice): AllowedMessageToBaseLocation {
        return LocationAddMember.fromSlice(s);
    },
    store(self: AllowedMessageToBaseLocation, b: c.Builder): void {
        LocationAddMember.store(self, b);
    },
    toCell(self: AllowedMessageToBaseLocation): c.Cell {
        return makeCellFrom<AllowedMessageToBaseLocation>(self, AllowedMessageToBaseLocation.store);
    }
}

/**
 > struct (0x000010a4) LocationAddMember {
 >     queryId: uint64
 >     userAddress: address
 >     sendExcessesTo: address?
 >     latestLocationCode: cell?
 > }
 */
export interface LocationAddMember {
    readonly $: 'LocationAddMember'
    queryId: uint64
    userAddress: c.Address
    sendExcessesTo: c.Address | null
    latestLocationCode: c.Cell | null /* = null */
}

export const LocationAddMember = {
    PREFIX: 0x000010a4,

    create(args: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
        latestLocationCode?: c.Cell | null /* = null */
    }): LocationAddMember {
        return {
            $: 'LocationAddMember',
            latestLocationCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationAddMember {
        loadAndCheckPrefix32(s, 0x000010a4, 'LocationAddMember');
        return {
            $: 'LocationAddMember',
            queryId: s.loadUintBig(64),
            userAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            latestLocationCode: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: LocationAddMember, b: c.Builder): void {
        b.storeUint(0x000010a4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.userAddress);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.latestLocationCode, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: LocationAddMember): c.Cell {
        return makeCellFrom<LocationAddMember>(self, LocationAddMember.store);
    }
}

/**
 > struct BaseLocationStore {
 >     h3Cell: string
 >     minterAddress: address
 >     version: uint10
 > }
 */
export interface BaseLocationStore {
    readonly $: 'BaseLocationStore'
    h3Cell: string
    minterAddress: c.Address
    version: uint10 /* = 0 */
}

export const BaseLocationStore = {
    create(args: {
        h3Cell: string
        minterAddress: c.Address
        version?: uint10 /* = 0 */
    }): BaseLocationStore {
        return {
            $: 'BaseLocationStore',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): BaseLocationStore {
        return {
            $: 'BaseLocationStore',
            h3Cell: s.loadStringRefTail(),
            minterAddress: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: BaseLocationStore, b: c.Builder): void {
        b.storeStringRefTail(self.h3Cell);
        b.storeAddress(self.minterAddress);
        b.storeUint(self.version, 10);
    },
    toCell(self: BaseLocationStore): c.Cell {
        return makeCellFrom<BaseLocationStore>(self, BaseLocationStore.store);
    }
}

// ————————————————————————————————————————————
//    class BaseLocation
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

export class BaseLocation implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgEBBAEAXQABFP8A9KQT9LzyyAsBAgLHAgMAg9fxI+SB2omhqfSRphOj8SRFjgvlwJJHrlhAAAEKSRw/pn5j9JBj9KBj6ApA3eWl/EH2CaHaPdqn8SSqQeIRX8HkfwAJrFevgsA=');

    static Errors = {
        'Errors.NotOwner': 73,
        'Errors.NotOnboardedWallet': 766,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new BaseLocation(address);
    }

    static fromStorage(emptyStorage: {
        h3Cell: string
        minterAddress: c.Address
        version?: uint10 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BaseLocation.CodeCell,
            data: BaseLocationStore.toCell(BaseLocationStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BaseLocation(address, initialState);
    }

    static createCellOfAllowedMessageToBaseLocation(body: AllowedMessageToBaseLocation) {
        return AllowedMessageToBaseLocation.toCell(body);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendAllowedMessageToBaseLocation(provider: ContractProvider, via: Sender, msgValue: coins, body: AllowedMessageToBaseLocation, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AllowedMessageToBaseLocation.toCell(body),
            ...extraOptions
        });
    }
}
