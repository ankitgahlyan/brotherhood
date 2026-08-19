// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Following contract in Tolk.
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

type uint64 = bigint

/**
 > struct (0x00001200) Unfollow {
 >     queryId: uint64
 >     initiator: address
 >     followee: address
 > }
 */
export interface Unfollow {
    readonly $: 'Unfollow'
    queryId: uint64
    initiator: c.Address
    followee: c.Address
}

export const Unfollow = {
    PREFIX: 0x00001200,

    create(args: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }): Unfollow {
        return {
            $: 'Unfollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): Unfollow {
        loadAndCheckPrefix32(s, 0x00001200, 'Unfollow');
        return {
            $: 'Unfollow',
            queryId: s.loadUintBig(64),
            initiator: s.loadAddress(),
            followee: s.loadAddress(),
        }
    },
    store(self: Unfollow, b: c.Builder): void {
        b.storeUint(0x00001200, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.initiator);
        b.storeAddress(self.followee);
    },
    toCell(self: Unfollow): c.Cell {
        return makeCellFrom<Unfollow>(self, Unfollow.store);
    }
}

/**
 > struct (0x00001201) InitFollow {
 >     queryId: uint64
 >     followerOwner: address
 > }
 */
export interface InitFollow {
    readonly $: 'InitFollow'
    queryId: uint64
    followerOwner: c.Address
}

export const InitFollow = {
    PREFIX: 0x00001201,

    create(args: {
        queryId: uint64
        followerOwner: c.Address
    }): InitFollow {
        return {
            $: 'InitFollow',
            ...args
        }
    },
    fromSlice(s: c.Slice): InitFollow {
        loadAndCheckPrefix32(s, 0x00001201, 'InitFollow');
        return {
            $: 'InitFollow',
            queryId: s.loadUintBig(64),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: InitFollow, b: c.Builder): void {
        b.storeUint(0x00001201, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.followerOwner);
    },
    toCell(self: InitFollow): c.Cell {
        return makeCellFrom<InitFollow>(self, InitFollow.store);
    }
}

/**
 > struct (0x00001202) FollowNotification {
 >     queryId: uint64
 >     follower: address
 >     followerOwner: address
 >     mintAmount: coins
 > }
 */
export interface FollowNotification {
    readonly $: 'FollowNotification'
    queryId: uint64
    follower: c.Address
    followerOwner: c.Address
    mintAmount: coins
}

export const FollowNotification = {
    PREFIX: 0x00001202,

    create(args: {
        queryId: uint64
        follower: c.Address
        followerOwner: c.Address
        mintAmount: coins
    }): FollowNotification {
        return {
            $: 'FollowNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): FollowNotification {
        loadAndCheckPrefix32(s, 0x00001202, 'FollowNotification');
        return {
            $: 'FollowNotification',
            queryId: s.loadUintBig(64),
            follower: s.loadAddress(),
            followerOwner: s.loadAddress(),
            mintAmount: s.loadCoins(),
        }
    },
    store(self: FollowNotification, b: c.Builder): void {
        b.storeUint(0x00001202, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.follower);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.mintAmount);
    },
    toCell(self: FollowNotification): c.Cell {
        return makeCellFrom<FollowNotification>(self, FollowNotification.store);
    }
}

/**
 > struct (0x00001203) UnfollowNotification {
 >     queryId: uint64
 >     follower: address
 >     followerOwner: address
 >     burnAmount: coins
 > }
 */
export interface UnfollowNotification {
    readonly $: 'UnfollowNotification'
    queryId: uint64
    follower: c.Address
    followerOwner: c.Address
    burnAmount: coins
}

export const UnfollowNotification = {
    PREFIX: 0x00001203,

    create(args: {
        queryId: uint64
        follower: c.Address
        followerOwner: c.Address
        burnAmount: coins
    }): UnfollowNotification {
        return {
            $: 'UnfollowNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): UnfollowNotification {
        loadAndCheckPrefix32(s, 0x00001203, 'UnfollowNotification');
        return {
            $: 'UnfollowNotification',
            queryId: s.loadUintBig(64),
            follower: s.loadAddress(),
            followerOwner: s.loadAddress(),
            burnAmount: s.loadCoins(),
        }
    },
    store(self: UnfollowNotification, b: c.Builder): void {
        b.storeUint(0x00001203, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.follower);
        b.storeAddress(self.followerOwner);
        b.storeCoins(self.burnAmount);
    },
    toCell(self: UnfollowNotification): c.Cell {
        return makeCellFrom<UnfollowNotification>(self, UnfollowNotification.store);
    }
}

/**
 > struct (0x00001204) SettleDeath {
 >     queryId: uint64
 >     deceased: address
 > }
 */
export interface SettleDeath {
    readonly $: 'SettleDeath'
    queryId: uint64
    deceased: c.Address
}

export const SettleDeath = {
    PREFIX: 0x00001204,

    create(args: {
        queryId: uint64
        deceased: c.Address
    }): SettleDeath {
        return {
            $: 'SettleDeath',
            ...args
        }
    },
    fromSlice(s: c.Slice): SettleDeath {
        loadAndCheckPrefix32(s, 0x00001204, 'SettleDeath');
        return {
            $: 'SettleDeath',
            queryId: s.loadUintBig(64),
            deceased: s.loadAddress(),
        }
    },
    store(self: SettleDeath, b: c.Builder): void {
        b.storeUint(0x00001204, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.deceased);
    },
    toCell(self: SettleDeath): c.Cell {
        return makeCellFrom<SettleDeath>(self, SettleDeath.store);
    }
}

/**
 > struct FollowingStore {
 >     follower: address
 >     followee: address
 >     mintAmount: coins
 > }
 */
export interface FollowingStore {
    readonly $: 'FollowingStore'
    follower: c.Address
    followee: c.Address
    mintAmount: coins
}

export const FollowingStore = {
    create(args: {
        follower: c.Address
        followee: c.Address
        mintAmount: coins
    }): FollowingStore {
        return {
            $: 'FollowingStore',
            ...args
        }
    },
    fromSlice(s: c.Slice): FollowingStore {
        return {
            $: 'FollowingStore',
            follower: s.loadAddress(),
            followee: s.loadAddress(),
            mintAmount: s.loadCoins(),
        }
    },
    store(self: FollowingStore, b: c.Builder): void {
        b.storeAddress(self.follower);
        b.storeAddress(self.followee);
        b.storeCoins(self.mintAmount);
    },
    toCell(self: FollowingStore): c.Cell {
        return makeCellFrom<FollowingStore>(self, FollowingStore.store);
    }
}

// ————————————————————————————————————————————
//    class Following
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

export class Following implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgEBBQEA0wABFP8A9KQT9LzyyAsBAgFiAgMCwtD4kZEw4O1E0PpI+kj6ADAD1ywgAACQDI4y+JIjxwXy4rzTP/pIMMjPkAAASAoSyz8T+lIS+lJY+gLJyM+FCBL6UnHPC27MyYBQ+wDg1ywgAACQBOMC1ywgAACQJOMC8j8EBAAZoHSd2omh9JH0kfQBowCW+JIjxwXy4rzXCz/4ksjPkAAASA4Syz9SMPpS+lJQA/oCycjPhQgT+lJxzwtuEszJgBD7AIsIyM7JyM+FCBL6UnHPC27MyYEAoPsA');

    static Errors = {
        'Errors.IncorrectSender': 700,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Following(address);
    }

    static fromStorage(emptyStorage: {
        follower: c.Address
        followee: c.Address
        mintAmount: coins
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Following.CodeCell,
            data: FollowingStore.toCell(FollowingStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Following(address, initialState);
    }

    static createCellOfInitFollow(body: {
        queryId: uint64
        followerOwner: c.Address
    }) {
        return InitFollow.toCell(InitFollow.create(body));
    }

    static createCellOfUnfollow(body: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }) {
        return Unfollow.toCell(Unfollow.create(body));
    }

    static createCellOfSettleDeath(body: {
        queryId: uint64
        deceased: c.Address
    }) {
        return SettleDeath.toCell(SettleDeath.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendInitFollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        followerOwner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitFollow.toCell(InitFollow.create(body)),
            ...extraOptions
        });
    }

    async sendUnfollow(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        initiator: c.Address
        followee: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Unfollow.toCell(Unfollow.create(body)),
            ...extraOptions
        });
    }

    async sendSettleDeath(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        deceased: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SettleDeath.toCell(SettleDeath.create(body)),
            ...extraOptions
        });
    }

    async getFollowingData(provider: ContractProvider): Promise<FollowingStore> {
        const r = StackReader.fromGetMethod(3, await provider.get('get_following_data', []));
        return ({
            $: 'FollowingStore',
            follower: r.readSlice().loadAddress(),
            followee: r.readSlice().loadAddress(),
            mintAmount: r.readBigInt(),
        });
    }
}
