// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Dao contract in Tolk.
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

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }

    readWideNullable<T>(stackW: number, readFn_T: (r: StackReader) => T): T | null {
        const slotTypeId = this.tuple[stackW - 1];
        if (slotTypeId?.type !== 'int') {
            throw new Error(`not 'int' on a stack`);
        }
        if (slotTypeId.value === 0n) {
            this.tuple = this.tuple.slice(stackW);
            return null;
        }
        const valueT = readFn_T(this);
        this.tuple.shift();
        return valueT;
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

type uint32 = bigint
type uint33 = bigint
type uint64 = bigint

/**
 > struct (0x00001007) TopUpTons {
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
}

export const TopUpTons = {
    PREFIX: 0x00001007,

    create(): TopUpTons {
        return {
            $: 'TopUpTons',
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0x00001007, 'TopUpTons');
        return {
            $: 'TopUpTons',
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0x00001007, 32);
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

/**
 > struct (0x0000100e) RequestTotalAccounts {
 >     queryId: uint64
 > }
 */
export interface RequestTotalAccounts {
    readonly $: 'RequestTotalAccounts'
    queryId: uint64
}

export const RequestTotalAccounts = {
    PREFIX: 0x0000100e,

    create(args: {
        queryId: uint64
    }): RequestTotalAccounts {
        return {
            $: 'RequestTotalAccounts',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestTotalAccounts {
        loadAndCheckPrefix32(s, 0x0000100e, 'RequestTotalAccounts');
        return {
            $: 'RequestTotalAccounts',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: RequestTotalAccounts, b: c.Builder): void {
        b.storeUint(0x0000100e, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: RequestTotalAccounts): c.Cell {
        return makeCellFrom<RequestTotalAccounts>(self, RequestTotalAccounts.store);
    }
}

/**
 > struct (0x0000100f) ResponseTotalAccounts {
 >     queryId: uint64
 >     totalAccounts: uint33
 > }
 */
export interface ResponseTotalAccounts {
    readonly $: 'ResponseTotalAccounts'
    queryId: uint64
    totalAccounts: uint33
}

export const ResponseTotalAccounts = {
    PREFIX: 0x0000100f,

    create(args: {
        queryId: uint64
        totalAccounts: uint33
    }): ResponseTotalAccounts {
        return {
            $: 'ResponseTotalAccounts',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResponseTotalAccounts {
        loadAndCheckPrefix32(s, 0x0000100f, 'ResponseTotalAccounts');
        return {
            $: 'ResponseTotalAccounts',
            queryId: s.loadUintBig(64),
            totalAccounts: s.loadUintBig(33),
        }
    },
    store(self: ResponseTotalAccounts, b: c.Builder): void {
        b.storeUint(0x0000100f, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.totalAccounts, 33);
    },
    toCell(self: ResponseTotalAccounts): c.Cell {
        return makeCellFrom<ResponseTotalAccounts>(self, ResponseTotalAccounts.store);
    }
}

/**
 > struct (0x000010fb) SubmitProposal {
 >     queryId: uint64
 >     proposerOwner: address
 >     targetMsg: cell
 > }
 */
export interface SubmitProposal {
    readonly $: 'SubmitProposal'
    queryId: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
}

export const SubmitProposal = {
    PREFIX: 0x000010fb,

    create(args: {
        queryId: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }): SubmitProposal {
        return {
            $: 'SubmitProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): SubmitProposal {
        loadAndCheckPrefix32(s, 0x000010fb, 'SubmitProposal');
        return {
            $: 'SubmitProposal',
            queryId: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: SubmitProposal, b: c.Builder): void {
        b.storeUint(0x000010fb, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
    },
    toCell(self: SubmitProposal): c.Cell {
        return makeCellFrom<SubmitProposal>(self, SubmitProposal.store);
    }
}

/**
 > struct (0x000010fe) VoteProposal {
 >     queryId: uint64
 >     proposalId: uint64
 >     voterOwner: address
 >     oldVote: bool?
 >     newVote: bool
 > }
 */
export interface VoteProposal {
    readonly $: 'VoteProposal'
    queryId: uint64
    proposalId: uint64
    voterOwner: c.Address
    oldVote: boolean | null
    newVote: boolean
}

export const VoteProposal = {
    PREFIX: 0x000010fe,

    create(args: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote: boolean | null
        newVote: boolean
    }): VoteProposal {
        return {
            $: 'VoteProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): VoteProposal {
        loadAndCheckPrefix32(s, 0x000010fe, 'VoteProposal');
        return {
            $: 'VoteProposal',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
            voterOwner: s.loadAddress(),
            oldVote: s.loadBoolean() ? s.loadBoolean() : null,
            newVote: s.loadBoolean(),
        }
    },
    store(self: VoteProposal, b: c.Builder): void {
        b.storeUint(0x000010fe, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
        b.storeAddress(self.voterOwner);
        storeTolkNullable<boolean>(self.oldVote, b,
            (v,b) => b.storeBit(v)
        );
        b.storeBit(self.newVote);
    },
    toCell(self: VoteProposal): c.Cell {
        return makeCellFrom<VoteProposal>(self, VoteProposal.store);
    }
}

/**
 > struct (0x000010ff) CleanupProposalVotes {
 >     queryId: uint64
 >     proposalId: uint64
 > }
 */
export interface CleanupProposalVotes {
    readonly $: 'CleanupProposalVotes'
    queryId: uint64
    proposalId: uint64
}

export const CleanupProposalVotes = {
    PREFIX: 0x000010ff,

    create(args: {
        queryId: uint64
        proposalId: uint64
    }): CleanupProposalVotes {
        return {
            $: 'CleanupProposalVotes',
            ...args
        }
    },
    fromSlice(s: c.Slice): CleanupProposalVotes {
        loadAndCheckPrefix32(s, 0x000010ff, 'CleanupProposalVotes');
        return {
            $: 'CleanupProposalVotes',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
        }
    },
    store(self: CleanupProposalVotes, b: c.Builder): void {
        b.storeUint(0x000010ff, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
    },
    toCell(self: CleanupProposalVotes): c.Cell {
        return makeCellFrom<CleanupProposalVotes>(self, CleanupProposalVotes.store);
    }
}

/**
 > struct Proposal {
 >     id: uint64
 >     proposerOwner: address
 >     targetMsg: cell
 >     totalAccounts: uint33
 >     totalAccountsSet: bool
 >     yesVotes: uint33
 >     noVotes: uint33
 >     createdAt: uint32
 >     expiresAt: uint32
 >     executed: bool
 > }
 */
export interface Proposal {
    readonly $: 'Proposal'
    id: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
    totalAccounts: uint33 /* = 0 */
    totalAccountsSet: boolean /* = false */
    yesVotes: uint33 /* = 0 */
    noVotes: uint33 /* = 0 */
    createdAt: uint32 /* = 0 */
    expiresAt: uint32 /* = 0 */
    executed: boolean /* = false */
}

export const Proposal = {
    create(args: {
        id: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
        totalAccounts?: uint33 /* = 0 */
        totalAccountsSet?: boolean /* = false */
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        createdAt?: uint32 /* = 0 */
        expiresAt?: uint32 /* = 0 */
        executed?: boolean /* = false */
    }): Proposal {
        return {
            $: 'Proposal',
            totalAccounts: 0n,
            totalAccountsSet: false,
            yesVotes: 0n,
            noVotes: 0n,
            createdAt: 0n,
            expiresAt: 0n,
            executed: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): Proposal {
        return {
            $: 'Proposal',
            id: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
            totalAccounts: s.loadUintBig(33),
            totalAccountsSet: s.loadBoolean(),
            yesVotes: s.loadUintBig(33),
            noVotes: s.loadUintBig(33),
            createdAt: s.loadUintBig(32),
            expiresAt: s.loadUintBig(32),
            executed: s.loadBoolean(),
        }
    },
    store(self: Proposal, b: c.Builder): void {
        b.storeUint(self.id, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
        b.storeUint(self.totalAccounts, 33);
        b.storeBit(self.totalAccountsSet);
        b.storeUint(self.yesVotes, 33);
        b.storeUint(self.noVotes, 33);
        b.storeUint(self.createdAt, 32);
        b.storeUint(self.expiresAt, 32);
        b.storeBit(self.executed);
    },
    toCell(self: Proposal): c.Cell {
        return makeCellFrom<Proposal>(self, Proposal.store);
    }
}

/**
 > struct DaoStore {
 >     fiAddress: address
 >     treasuryAddress: address
 >     baseFiWalletCode: cell
 >     daoVoterCode: cell
 >     proposalCount: uint64
 >     proposals: map<uint64, Proposal>
 > }
 */
export interface DaoStore {
    readonly $: 'DaoStore'
    fiAddress: c.Address
    treasuryAddress: c.Address
    baseFiWalletCode: c.Cell
    daoVoterCode: c.Cell
    proposalCount: uint64 /* = 0 */
    proposals: c.Dictionary<uint64, Proposal> /* = [] as map<uint64, Proposal> */
}

export const DaoStore = {
    create(args: {
        fiAddress: c.Address
        treasuryAddress: c.Address
        baseFiWalletCode: c.Cell
        daoVoterCode: c.Cell
        proposalCount?: uint64 /* = 0 */
        proposals: c.Dictionary<uint64, Proposal> /* = [] as map<uint64, Proposal> */
    }): DaoStore {
        return {
            $: 'DaoStore',
            proposalCount: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): DaoStore {
        return {
            $: 'DaoStore',
            fiAddress: s.loadAddress(),
            treasuryAddress: s.loadAddress(),
            baseFiWalletCode: s.loadRef(),
            daoVoterCode: s.loadRef(),
            proposalCount: s.loadUintBig(64),
            proposals: c.Dictionary.load<uint64, Proposal>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<Proposal>(Proposal.fromSlice, Proposal.store), s),
        }
    },
    store(self: DaoStore, b: c.Builder): void {
        b.storeAddress(self.fiAddress);
        b.storeAddress(self.treasuryAddress);
        b.storeRef(self.baseFiWalletCode);
        b.storeRef(self.daoVoterCode);
        b.storeUint(self.proposalCount, 64);
        b.storeDict<uint64, Proposal>(self.proposals, c.Dictionary.Keys.BigUint(64), createDictionaryValue<Proposal>(Proposal.fromSlice, Proposal.store));
    },
    toCell(self: DaoStore): c.Cell {
        return makeCellFrom<DaoStore>(self, DaoStore.store);
    }
}

// ————————————————————————————————————————————
//    class Dao
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

export class Dao implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECFQEAA6YAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASAREgR31/EjImHAQY4BImHB2omh9JH0kamppn/oCg2uWEAAAQ+5xgWuWEAAAQD5xgWuWEAAAQ/pxgWuWEAAAQ/5BgcICQAHrFcYQAT80z8x+kjXTIiIAcjMzMlwyMt/yW1tbQLI+lT6VPpUyW1tbSzI+lIT+lT6VPQAySXI+lJSoPpSEszMyW1tbW0ByPQA9ADJbcj0AHDPCzTJA8j0ABL0AMzMyciL4AAAAAEAAACgAAAAQAACzxYUzBLMzMzJeFNjVBMyyM+DywSJCgoLDADG+JImxwXy4rzTP9cLIFMXgED0Dm+hjkjTP/pI1NMgMdIAMdMg0yDTH9Mf0gDRB8jLPxb6UhTMFssgz4PLIBTLIBPLHxLLH8oAQBeAQPRDBMj6UhP6UszMEss/9ADJ7VSSXwniBP7TPzHTP/pI0wABktIAkm0B4tcKAPgobQTI+lL6UhP0AMklyM+E0MzM+RbIz4oAQMv/z1D4kscF8uL2UyiAQPQO8uLv0z/6SNTTINIA0yDTINMf0x/SANEl8uLwIPLS8fgjIrny4vIqbpo6CpICpJMBpFji4w4kkXHjDSG74wAHDQ4PEADQjljTPzHXCz9TBoBA9A5voY5E0z8x+kgx1DHTIDHSADHTIDHTIDHTHzHTH9IA0ZIwf5X4I7vDAOKOGFAGgED0WzAEyPpSE/pSzMwSyz/0AMntVJJfB+KSXwji4Gxh1ywgAACAPDHc8j8AAAABaADazxbMzPkWhPewEoALUAPXJMjPigBAzsv3z1D4kscF8uBK+CMDpFMDgggJOoCgIcjLPxX6UhPMcM8LYxTLHxLLH8+BVCAIgED0QyXI+lIV+lITzMzLP/QAye1UyM+FCPpSgRAOzwuOyz/JgEL7AAAqUau9nQqUAqQBpZQCpQGk4liROuICABAkqgCmAnOpBAA2OH8l0MjOycjPhQhWEQH6UnHPC27MyYBC+wAIAGDIyz8W+lIUzBLLIMoAE8sgyyDLHxLLH8oAQBeAQPRDBMj6UhP6UszMEss/9ADJ7VQAgb+EX2omh9JBj9JBjqGOoY6Z+Y+gLAIHoHN9DHC+mf/SRqaZBpAGmQaZBpj+mP6QBowIBC8Bg2tra2tra2tra2uEAgFYExQAIbfaPaiaH0kfSRqammf+gJowAFG0L/2omhqGOumfBQ2geR9KX0pCXoAZIDkZ8JoZmZ8i2RnxQAgZf/nqEA==');

    static Errors = {
        'Errors.NotValidWallet': 74,
        'Errors.IncorrectSender': 700,
        'Errors.ProposalNotFound': 751,
        'Errors.ProposalPendingAccounts': 752,
        'Errors.ProposalAlreadyExecuted': 753,
        'Errors.ProposalExpired': 754,
        'Errors.InvalidDaoVoter': 758,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Dao(address);
    }

    static fromStorage(emptyStorage: {
        fiAddress: c.Address
        treasuryAddress: c.Address
        baseFiWalletCode: c.Cell
        daoVoterCode: c.Cell
        proposalCount?: uint64 /* = 0 */
        proposals: c.Dictionary<uint64, Proposal> /* = [] as map<uint64, Proposal> */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Dao.CodeCell,
            data: DaoStore.toCell(DaoStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Dao(address, initialState);
    }

    static createCellOfSubmitProposal(body: {
        queryId: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }) {
        return SubmitProposal.toCell(SubmitProposal.create(body));
    }

    static createCellOfResponseTotalAccounts(body: {
        queryId: uint64
        totalAccounts: uint33
    }) {
        return ResponseTotalAccounts.toCell(ResponseTotalAccounts.create(body));
    }

    static createCellOfVoteProposal(body: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote: boolean | null
        newVote: boolean
    }) {
        return VoteProposal.toCell(VoteProposal.create(body));
    }

    static createCellOfCleanupProposalVotes(body: {
        queryId: uint64
        proposalId: uint64
    }) {
        return CleanupProposalVotes.toCell(CleanupProposalVotes.create(body));
    }

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendSubmitProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SubmitProposal.toCell(SubmitProposal.create(body)),
            ...extraOptions
        });
    }

    async sendResponseTotalAccounts(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        totalAccounts: uint33
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ResponseTotalAccounts.toCell(ResponseTotalAccounts.create(body)),
            ...extraOptions
        });
    }

    async sendVoteProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote: boolean | null
        newVote: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: VoteProposal.toCell(VoteProposal.create(body)),
            ...extraOptions
        });
    }

    async sendCleanupProposalVotes(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        proposalId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CleanupProposalVotes.toCell(CleanupProposalVotes.create(body)),
            ...extraOptions
        });
    }

    async sendTopUpTons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUpTons.toCell(TopUpTons.create()),
            ...extraOptions
        });
    }

    async getDaoData(provider: ContractProvider): Promise<DaoStore> {
        const r = StackReader.fromGetMethod(6, await provider.get('get_dao_data', []));
        return ({
            $: 'DaoStore',
            fiAddress: r.readSlice().loadAddress(),
            treasuryAddress: r.readSlice().loadAddress(),
            baseFiWalletCode: r.readCell(),
            daoVoterCode: r.readCell(),
            proposalCount: r.readBigInt(),
            proposals: r.readDictionary<uint64, Proposal>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<Proposal>(Proposal.fromSlice, Proposal.store)),
        });
    }

    async getProposal(provider: ContractProvider, proposalId: uint64): Promise<Proposal | null> {
        const r = StackReader.fromGetMethod(11, await provider.get('get_proposal', [
            { type: 'int', value: proposalId },
        ]));
        return r.readWideNullable<Proposal>(11,
            (r) => ({
                $: 'Proposal',
                id: r.readBigInt(),
                proposerOwner: r.readSlice().loadAddress(),
                targetMsg: r.readCell(),
                totalAccounts: r.readBigInt(),
                totalAccountsSet: r.readBoolean(),
                yesVotes: r.readBigInt(),
                noVotes: r.readBigInt(),
                createdAt: r.readBigInt(),
                expiresAt: r.readBigInt(),
                executed: r.readBoolean(),
            })
        );
    }

    async getDaoVoterAddress(provider: ContractProvider, voterOwner: c.Address): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_dao_voter_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(voterOwner,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readSlice().loadAddress();
    }
}
