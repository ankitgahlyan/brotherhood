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

type uint64 = bigint
type uint256 = bigint

/**
 > struct (0x11111111) EnterLottery {
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
    PREFIX: 0x11111111,

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
        loadAndCheckPrefix32(s, 0x11111111, 'EnterLottery');
        return {
            $: 'EnterLottery',
            sender: s.loadAddress(),
            amount: s.loadCoins(),
        }
    },
    store(self: EnterLottery, b: c.Builder): void {
        b.storeUint(0x11111111, 32);
        b.storeAddress(self.sender);
        b.storeCoins(self.amount);
    },
    toCell(self: EnterLottery): c.Cell {
        return makeCellFrom<EnterLottery>(self, EnterLottery.store);
    }
}

/**
 > struct (0x22222222) LotteryWin {
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
    PREFIX: 0x22222222,

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
        loadAndCheckPrefix32(s, 0x22222222, 'LotteryWin');
        return {
            $: 'LotteryWin',
            entryAmount: s.loadCoins(),
            amt: s.loadCoins(),
            winner: s.loadAddress(),
        }
    },
    store(self: LotteryWin, b: c.Builder): void {
        b.storeUint(0x22222222, 32);
        b.storeCoins(self.entryAmount);
        b.storeCoins(self.amt);
        b.storeAddress(self.winner);
    },
    toCell(self: LotteryWin): c.Cell {
        return makeCellFrom<LotteryWin>(self, LotteryWin.store);
    }
}

/**
 > struct (0x44444444) DrawWinner {
 >     queryId: uint64
 > }
 */
export interface DrawWinner {
    readonly $: 'DrawWinner'
    queryId: uint64
}

export const DrawWinner = {
    PREFIX: 0x44444444,

    create(args: {
        queryId: uint64
    }): DrawWinner {
        return {
            $: 'DrawWinner',
            ...args
        }
    },
    fromSlice(s: c.Slice): DrawWinner {
        loadAndCheckPrefix32(s, 0x44444444, 'DrawWinner');
        return {
            $: 'DrawWinner',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DrawWinner, b: c.Builder): void {
        b.storeUint(0x44444444, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DrawWinner): c.Cell {
        return makeCellFrom<DrawWinner>(self, DrawWinner.store);
    }
}

/**
 > struct LotteryStorage {
 >     owner: address
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
        entryAmount: coins
        participants: c.Dictionary<c.Address, []>
        participantCount?: int32 /* = 0 */
        revealDeadline?: int32 /* = 0 */
        prizePool?: coins /* = 0 */
        randomSeed?: uint256 /* = 0 */
    }): LotteryStorage {
        return {
            $: 'LotteryStorage',
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
    static CodeCell = c.Cell.fromBase64('te6ccgECEAEAAcYAART/APSkE/S88sgLAQIBYgIDAgLPBAUCASAICQLDPiR8kAgxwCRMODXLCCIiIiMl/pI+gCBAIGOEtcsIiIiIiSS8j/h0z9tWYEAguIB0e1E0PpI+gD0BNIf0h/6ANcL/4EAgVAIuuMPA8j6Ulj6AvQAEsofEsofWPoCy//J7VSAGBwBdO2i7fsSqQhwIoEBC/SCb6UykQGOFVMSupRsMdsx4AGkUROBAQv0dG+lMujyw+eAAiviSJscF8uK8IZf4IyK78uDJmDH4I4EOEKAB4lN0uvLgylODgQEL9ApvoTGdyFQglYEBC/RBAqRAE99QB6AHyPpS+RYVsgCGNzf4I1AHvPLhkCXCAPLhkUMF8AHIz5CIiIiKJPoCUAP6AhL6UsnIz4UIUiD6UnHPC27MyYBC+wBtcFRwABA2RBVVIAIBIAoLAgEgDg8CA5XwDA0AIbv4ntRND6SDH6ADH0AdcKH4AD2iz7UTQ+kgx+gAx9AHTHzHXCh8gkjBw4fgjvpFy4HOACmhf7UTQ+kgx+gAx9AWBAQv0Cm+hMYAJ7iK/tRND6SDH6ADH0AdM/MfoAMIACe4cf7UTQ+kgx+gAx9AHTHzHXCh+A==');

    static Errors = {
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
