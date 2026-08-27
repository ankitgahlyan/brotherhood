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

type uint16 = bigint
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
 > struct (0x00001208) FollowRevertedNotification {
 >     queryId: uint64
 >     reason: uint16
 >     followerOwner: address
 > }
 */
export interface FollowRevertedNotification {
    readonly $: 'FollowRevertedNotification'
    queryId: uint64
    reason: uint16
    followerOwner: c.Address
}

export const FollowRevertedNotification = {
    PREFIX: 0x00001208,

    create(args: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }): FollowRevertedNotification {
        return {
            $: 'FollowRevertedNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): FollowRevertedNotification {
        loadAndCheckPrefix32(s, 0x00001208, 'FollowRevertedNotification');
        return {
            $: 'FollowRevertedNotification',
            queryId: s.loadUintBig(64),
            reason: s.loadUintBig(16),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: FollowRevertedNotification, b: c.Builder): void {
        b.storeUint(0x00001208, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.reason, 16);
        b.storeAddress(self.followerOwner);
    },
    toCell(self: FollowRevertedNotification): c.Cell {
        return makeCellFrom<FollowRevertedNotification>(self, FollowRevertedNotification.store);
    }
}

/**
 > struct (0x00001209) UnfollowRevertedNotification {
 >     queryId: uint64
 >     reason: uint16
 >     followerOwner: address
 > }
 */
export interface UnfollowRevertedNotification {
    readonly $: 'UnfollowRevertedNotification'
    queryId: uint64
    reason: uint16
    followerOwner: c.Address
}

export const UnfollowRevertedNotification = {
    PREFIX: 0x00001209,

    create(args: {
        queryId: uint64
        reason: uint16
        followerOwner: c.Address
    }): UnfollowRevertedNotification {
        return {
            $: 'UnfollowRevertedNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): UnfollowRevertedNotification {
        loadAndCheckPrefix32(s, 0x00001209, 'UnfollowRevertedNotification');
        return {
            $: 'UnfollowRevertedNotification',
            queryId: s.loadUintBig(64),
            reason: s.loadUintBig(16),
            followerOwner: s.loadAddress(),
        }
    },
    store(self: UnfollowRevertedNotification, b: c.Builder): void {
        b.storeUint(0x00001209, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.reason, 16);
        b.storeAddress(self.followerOwner);
    },
    toCell(self: UnfollowRevertedNotification): c.Cell {
        return makeCellFrom<UnfollowRevertedNotification>(self, UnfollowRevertedNotification.store);
    }
}

/**
 > struct FollowingStore {
 >     follower: address
 >     followee: address
 >     mintAmount: coins
 >     isFollowing: bool
 > }
 */
export interface FollowingStore {
    readonly $: 'FollowingStore'
    follower: c.Address
    followee: c.Address
    mintAmount: coins
    isFollowing: boolean /* = false */
}

export const FollowingStore = {
    create(args: {
        follower: c.Address
        followee: c.Address
        mintAmount: coins
        isFollowing?: boolean /* = false */
    }): FollowingStore {
        return {
            $: 'FollowingStore',
            isFollowing: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): FollowingStore {
        return {
            $: 'FollowingStore',
            follower: s.loadAddress(),
            followee: s.loadAddress(),
            mintAmount: s.loadCoins(),
            isFollowing: s.loadBoolean(),
        }
    },
    store(self: FollowingStore, b: c.Builder): void {
        b.storeAddress(self.follower);
        b.storeAddress(self.followee);
        b.storeCoins(self.mintAmount);
        b.storeBit(self.isFollowing);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECCAEAAYEAART/APSkE/S88sgLAQIBYgIDApDQ7aLt+/iRkTDgIO1E0PpI+kj6ANcKAATXLCAAAJAMjpfXLCAAAJAEmzCEDwXHABXy9EMT4w1AE+MNAcj6UvpSWPoCygDJ7VQEBQIBIAYHAPY1+JIixwWRf5f4kiPHBcMA4vLivAOOSjIC0z/6SDCCCvrwgMjPhQgV+lJQBPoCgRIJzwuKIc8LP8+IC75SMPpSyXL7AMjPhQgS+lKBEgnPC47LP8+IC776UsmBAIL7ANsx4TNwiwjIzsnIz4UIUjD6UnHPC27MyYBQ+wAA9DX4kiLHBZF/l/iSI8cFwwDi8uK8BNM/+kgwBI5DNIIK+vCAyM+FCBP6Ulj6AoESCM8LiiPPCz/PiAu6UiD6Usly+wDIz4UI+lKBEgjPC44Syz/PiAu6+lLJgQCC+wDbMeAwf4sIyM7JyM+FCBX6UnHPC24UzMmAUPsAAB290ndqJofSR9JH0AaQBowAI78pl2omh9JBj9JBj9ABjpAGjA==');

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
        isFollowing?: boolean /* = false */
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

    async getFollowingData(provider: ContractProvider): Promise<FollowingStore> {
        const r = StackReader.fromGetMethod(4, await provider.get('get_following_data', []));
        return ({
            $: 'FollowingStore',
            follower: r.readSlice().loadAddress(),
            followee: r.readSlice().loadAddress(),
            mintAmount: r.readBigInt(),
            isFollowing: r.readBoolean(),
        });
    }

    async getIsFollowing(provider: ContractProvider): Promise<boolean> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_is_following', []));
        return r.readBoolean();
    }
}
