// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BaseFollowing contract in Tolk.
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
 > type AllowedMessageToBaseFollowing = InitFollow
 */
export type AllowedMessageToBaseFollowing = InitFollow

export const AllowedMessageToBaseFollowing = {
    fromSlice(s: c.Slice): AllowedMessageToBaseFollowing {
        return InitFollow.fromSlice(s);
    },
    store(self: AllowedMessageToBaseFollowing, b: c.Builder): void {
        InitFollow.store(self, b);
    },
    toCell(self: AllowedMessageToBaseFollowing): c.Cell {
        return makeCellFrom<AllowedMessageToBaseFollowing>(self, AllowedMessageToBaseFollowing.store);
    }
}

/**
 > struct (0x00001201) InitFollow {
 >     queryId: uint64
 >     followerOwner: address
 >     mintAmount: coins
 >     latestFollowingCode: cell?
 > }
 */
export interface InitFollow {
    readonly $: 'InitFollow'
    queryId: uint64
    followerOwner: c.Address
    mintAmount: coins /* = 0 */
    latestFollowingCode: c.Cell | null /* = null */
}

export const InitFollow = {
    PREFIX: 0x00001201,

    create(args: {
        queryId: uint64
        followerOwner: c.Address
        mintAmount?: coins /* = 0 */
        latestFollowingCode?: c.Cell | null /* = null */
    }): InitFollow {
        return {
            $: 'InitFollow',
            mintAmount: 0n,
            latestFollowingCode: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): InitFollow {
        loadAndCheckPrefix32(s, 0x00001201, 'InitFollow');
        return {
            $: 'InitFollow',
            queryId: s.loadUintBig(64),
            followerOwner: s.loadAddress(),
            mintAmount: s.loadCoins(),
            latestFollowingCode: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: InitFollow, b: c.Builder): void {
        b.storeUint(0x00001201, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.mintAmount);
        storeTolkNullable<c.Cell>(self.latestFollowingCode, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: InitFollow): c.Cell {
        return makeCellFrom<InitFollow>(self, InitFollow.store);
    }
}

/**
 > struct BaseFollowingStore {
 >     follower: address
 >     followee: address
 >     version: uint10
 > }
 */
export interface BaseFollowingStore {
    readonly $: 'BaseFollowingStore'
    follower: c.Address
    followee: c.Address
    version: uint10 /* = 0 */
}

export const BaseFollowingStore = {
    create(args: {
        follower: c.Address
        followee: c.Address
        version?: uint10 /* = 0 */
    }): BaseFollowingStore {
        return {
            $: 'BaseFollowingStore',
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): BaseFollowingStore {
        return {
            $: 'BaseFollowingStore',
            follower: s.loadAddress(),
            followee: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: BaseFollowingStore, b: c.Builder): void {
        b.storeAddress(self.follower);
        b.storeAddress(self.followee);
        b.storeUint(self.version, 10);
    },
    toCell(self: BaseFollowingStore): c.Cell {
        return makeCellFrom<BaseFollowingStore>(self, BaseFollowingStore.store);
    }
}

// ————————————————————————————————————————————
//    class BaseFollowing
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

export class BaseFollowing implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgEBBAEAZAABFP8A9KQT9LzyyAsBAgLHAgMAkdfxI+SB2omh9JH0kaYTo/EkRY4L8SRJjgtj5cV4R65YQAABIBkcP6Z+Y/SQY/QAY+gKQN3lpfxB9gmh2j3ap/EkqkHiEV/B5H8ACaxXr4LA');

    static Errors = {
        'Errors.IncorrectSender': 700,
        'Errors.NotOnboardedWallet': 766,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new BaseFollowing(address);
    }

    static fromStorage(emptyStorage: {
        follower: c.Address
        followee: c.Address
        version?: uint10 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BaseFollowing.CodeCell,
            data: BaseFollowingStore.toCell(BaseFollowingStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BaseFollowing(address, initialState);
    }

    static createCellOfAllowedMessageToBaseFollowing(body: AllowedMessageToBaseFollowing) {
        return AllowedMessageToBaseFollowing.toCell(body);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendAllowedMessageToBaseFollowing(provider: ContractProvider, via: Sender, msgValue: coins, body: AllowedMessageToBaseFollowing, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AllowedMessageToBaseFollowing.toCell(body),
            ...extraOptions
        });
    }
}
