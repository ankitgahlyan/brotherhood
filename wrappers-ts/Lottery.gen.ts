// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Lottery contract in Tolk.
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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type int8 = bigint
type int32 = bigint

type uint10 = bigint
type uint64 = bigint
type uint256 = bigint

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
 > struct (0x00001198) EnterLottery {
 >     sender: address
 >     amount: coins
 > }
 */
export interface EnterLottery {
    readonly $: 'EnterLottery'
    sender: c.Address
    amount: coins
}

export const EnterLottery = {
    PREFIX: 0x00001198,

    create(args: {
        sender: c.Address
        amount: coins
    }): EnterLottery {
        return {
            $: 'EnterLottery',
            ...args
        }
    },
    fromSlice(s: c.Slice): EnterLottery {
        loadAndCheckPrefix32(s, 0x00001198, 'EnterLottery');
        return {
            $: 'EnterLottery',
            sender: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: EnterLottery, b: c.Builder): void {
        b.storeUint(0x00001198, 32);
        b.storeAddress(self.sender);
        b.storeCoins(self.amount);
    },
    toCell(self: EnterLottery): c.Cell {
        return makeCellFrom<EnterLottery>(self, EnterLottery.store);
    }
}

/**
 > struct (0x00001199) LotteryWin {
 >     entryAmount: coins
 >     amt: coins
 >     winner: address
 > }
 */
export interface LotteryWin {
    readonly $: 'LotteryWin'
    entryAmount: coins
    amt: coins
    winner: c.Address
}

export const LotteryWin = {
    PREFIX: 0x00001199,

    create(args: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }): LotteryWin {
        return {
            $: 'LotteryWin',
            ...args
        }
    },
    fromSlice(s: c.Slice): LotteryWin {
        loadAndCheckPrefix32(s, 0x00001199, 'LotteryWin');
        return {
            $: 'LotteryWin',
            entryAmount: s.loadCoins(),
            amt: s.loadCoins(),
            winner: s.loadAddress(),
        }
    },
    store(self: LotteryWin, b: c.Builder): void {
        b.storeUint(0x00001199, 32);
        b.storeCoins(self.entryAmount);
        b.storeCoins(self.amt);
        b.storeAddress(self.winner);
    },
    toCell(self: LotteryWin): c.Cell {
        return makeCellFrom<LotteryWin>(self, LotteryWin.store);
    }
}

/**
 > struct (0x0000119a) DrawWinner {
 >     queryId: uint64
 > }
 */
export interface DrawWinner {
    readonly $: 'DrawWinner'
    queryId: uint64
}

export const DrawWinner = {
    PREFIX: 0x0000119a,

    create(args: {
        queryId: uint64
    }): DrawWinner {
        return {
            $: 'DrawWinner',
            ...args
        }
    },
    fromSlice(s: c.Slice): DrawWinner {
        loadAndCheckPrefix32(s, 0x0000119a, 'DrawWinner');
        return {
            $: 'DrawWinner',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DrawWinner, b: c.Builder): void {
        b.storeUint(0x0000119a, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DrawWinner): c.Cell {
        return makeCellFrom<DrawWinner>(self, DrawWinner.store);
    }
}

/**
 > struct LotteryStorage {
 >     owner: address
 >     version: uint10
 >     entryAmount: coins
 >     participants: map<address, ()>
 >     participantCount: int32
 >     revealDeadline: int32
 >     prizePool: coins
 >     randomSeed: uint256
 > }
 */
export interface LotteryStorage {
    readonly $: 'LotteryStorage'
    owner: c.Address
    version: uint10 /* = 0 */
    entryAmount: coins
    participants: c.Dictionary<c.Address, []>
    participantCount: int32 /* = 0 */
    revealDeadline: int32 /* = 0 */
    prizePool: coins /* = 0 */
    randomSeed: uint256 /* = 0 */
}

export const LotteryStorage = {
    create(args: {
        owner: c.Address
        version?: uint10 /* = 0 */
        entryAmount: coins
        participants: c.Dictionary<c.Address, []>
        participantCount?: int32 /* = 0 */
        revealDeadline?: int32 /* = 0 */
        prizePool?: coins /* = 0 */
        randomSeed?: uint256 /* = 0 */
    }): LotteryStorage {
        return {
            $: 'LotteryStorage',
            version: 0n,
            participantCount: 0n,
            revealDeadline: 0n,
            prizePool: 0n,
            randomSeed: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): LotteryStorage {
        return {
            $: 'LotteryStorage',
            owner: s.loadAddress(),
            version: s.loadUintBig(10),
            entryAmount: s.loadCoins(),
            participants: c.Dictionary.load<c.Address, []>(c.Dictionary.Keys.Address(), createDictionaryValue<[]>(
                (s) => [],
                (v,b) => { {} }
            ), s),
            participantCount: s.loadIntBig(32),
            revealDeadline: s.loadIntBig(32),
            prizePool: s.loadCoins(),
            randomSeed: s.loadUintBig(256),
        }
    },
    store(self: LotteryStorage, b: c.Builder): void {
        b.storeAddress(self.owner);
        b.storeUint(self.version, 10);
        b.storeCoins(self.entryAmount);
        b.storeDict<c.Address, []>(self.participants, c.Dictionary.Keys.Address(), createDictionaryValue<[]>(
            (s) => [],
            (v,b) => { {} }
        ));
        b.storeInt(self.participantCount, 32);
        b.storeInt(self.revealDeadline, 32);
        b.storeCoins(self.prizePool);
        b.storeUint(self.randomSeed, 256);
    },
    toCell(self: LotteryStorage): c.Cell {
        return makeCellFrom<LotteryStorage>(self, LotteryStorage.store);
    }
}

// ————————————————————————————————————————————
//    class Lottery
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

export class Lottery implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECFAEAAt8AART/APSkE/S88sgLAQIBYgIDAgLPBAUCASAKCwH3O2i7fv4kfJAIMcAkTDg1ywgAACMxJj6SPoAbYEAgY5H1ywgAACM1JfTP21tgQCCjjLXLCAAAIBcl/QE1G2BAIOOHNcsIAAAgDSS8j/h0gAx0wn6SDH0BPQEVQKBAITiEDRBMOIUQzDiAtHtRND6SNMJ+gD0BNIf0h/6AIAYAXTtou37EqkIcCKBAQv0gm+lMpEBjhVTErqUbDHbMeABpFETgQEL9HRvpTLo8sPngAdbXC/+BAIEquo5EODj4kibHBfLivCCX+CMhu/Li35cw+COBDhCg4lODuvKxU5KBAQv0Cm+hMZzIVCCkgQEL9EEBpFjfUHigCMj6UvkWFbLjDgPI+lISywkB+gIS9AASyh8Syh9Y+gLL/8ntVAcC6DuBAIIpuo7mgQCDUAm6jkcQV18HMviSWMcF8uK8IPsE0O0e7VPtRND6SNMJ+gD0BNIf0h/6ANP/0QakB8j6UhfLCVAE+gIS9ADKH8ofWPoCy//J7VTbMeD4kibHBfLivFNGuZI2N+MNEDdFZEEw4w0QN0VmCAkAhDQnbpE3mSf7BAfQ7R7tU+LtRND6SNMJ+gD0BNIf0h/6ANP/0QakB8j6UhfLCVAE+gIS9ADKH8ofWPoCy//J7VQQJAB+Nzc3+CNQBrzy4t8lwgDysfgl+BVGRfAByM+QAABGZiT6Alj6AvpSycjPhQhSQPpScc8LbszJgEL7AG1wVHAAAgEgDA0CASASEwIBIA4PACe7+J7UTQ+kgx0wkx+gAx9AHXCh+AIB6RARABe0fJ2omh9JBjrhYTAAQ6LPtRND6SDHTCTH6ADH0AdMfMdcKHyCSMHDh+CO+kXLgc4AL6F/tRND6SDHTCTH6ADH0BYEBC/QKb6ExgAtuIr+1E0PpIMdMJMfoAMfQB0z8x+gAwgALbhx/tRND6SDHTCTH6ADH0AdMfMdcKH4');

    static Errors = {
        'Errors.InvalidMessage': 49,
        'Errors.IncorrectSender': 700,
        'Errors.WaitMore': 735,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Lottery(address);
    }

    static fromStorage(emptyStorage: {
        owner: c.Address
        version?: uint10 /* = 0 */
        entryAmount: coins
        participants: c.Dictionary<c.Address, []>
        participantCount?: int32 /* = 0 */
        revealDeadline?: int32 /* = 0 */
        prizePool?: coins /* = 0 */
        randomSeed?: uint256 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Lottery.CodeCell,
            data: LotteryStorage.toCell(LotteryStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Lottery(address, initialState);
    }

    static createCellOfEnterLottery(body: {
        sender: c.Address
        amount: coins
    }) {
        return EnterLottery.toCell(EnterLottery.create(body));
    }

    static createCellOfDrawWinner(body: {
        queryId: uint64
    }) {
        return DrawWinner.toCell(DrawWinner.create(body));
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendEnterLottery(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        sender: c.Address
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: EnterLottery.toCell(EnterLottery.create(body)),
            ...extraOptions
        });
    }

    async sendDrawWinner(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DrawWinner.toCell(DrawWinner.create(body)),
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

    async getVersion(provider: ContractProvider): Promise<uint10> {
        const r = StackReader.fromGetMethod(1, await provider.get('getVersion', []));
        return r.readBigInt();
    }

    async getParticipantCount(provider: ContractProvider): Promise<int32> {
        const r = StackReader.fromGetMethod(1, await provider.get('getParticipantCount', []));
        return r.readBigInt();
    }

    async getIsParticipant(provider: ContractProvider, addr: c.Address): Promise<boolean> {
        const r = StackReader.fromGetMethod(1, await provider.get('isParticipant', [
            { type: 'slice', cell: makeCellFrom<c.Address>(addr,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readBoolean();
    }

    async getDeadline(provider: ContractProvider): Promise<int32> {
        const r = StackReader.fromGetMethod(1, await provider.get('getDeadline', []));
        return r.readBigInt();
    }

    async getCurrentPhase(provider: ContractProvider): Promise<int8> {
        const r = StackReader.fromGetMethod(1, await provider.get('getCurrentPhase', []));
        return r.readBigInt();
    }

    async getPrizePool(provider: ContractProvider): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('getPrizePool', []));
        return r.readBigInt();
    }
}
