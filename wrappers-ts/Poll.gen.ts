// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Poll contract in Tolk.
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

type uint32 = bigint
type uint33 = bigint
type uint64 = bigint

/**
 > struct PollDataReply {
 >     proposalId: uint64
 >     proposerOwner: address
 >     daoProxyAddress: address
 >     fiAddress: address
 >     targetMsg: cell
 >     yesVotes: uint33
 >     noVotes: uint33
 >     totalAccounts: uint33
 >     expiresAt: uint32
 >     executed: bool
 > }
 */
export interface PollDataReply {
    readonly $: 'PollDataReply'
    proposalId: uint64
    proposerOwner: c.Address
    daoProxyAddress: c.Address
    fiAddress: c.Address
    targetMsg: c.Cell
    yesVotes: uint33
    noVotes: uint33
    totalAccounts: uint33
    expiresAt: uint32
    executed: boolean
}

export const PollDataReply = {
    create(args: {
        proposalId: uint64
        proposerOwner: c.Address
        daoProxyAddress: c.Address
        fiAddress: c.Address
        targetMsg: c.Cell
        yesVotes: uint33
        noVotes: uint33
        totalAccounts: uint33
        expiresAt: uint32
        executed: boolean
    }): PollDataReply {
        return {
            $: 'PollDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): PollDataReply {
        return {
            $: 'PollDataReply',
            proposalId: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            daoProxyAddress: s.loadAddress(),
            fiAddress: s.loadAddress(),
            targetMsg: s.loadRef(),
            yesVotes: s.loadUintBig(33),
            noVotes: s.loadUintBig(33),
            totalAccounts: s.loadUintBig(33),
            expiresAt: s.loadUintBig(32),
            executed: s.loadBoolean(),
        }
    },
    store(self: PollDataReply, b: c.Builder): void {
        b.storeUint(self.proposalId, 64);
        b.storeAddress(self.proposerOwner);
        b.storeAddress(self.daoProxyAddress);
        b.storeAddress(self.fiAddress);
        b.storeRef(self.targetMsg);
        b.storeUint(self.yesVotes, 33);
        b.storeUint(self.noVotes, 33);
        b.storeUint(self.totalAccounts, 33);
        b.storeUint(self.expiresAt, 32);
        b.storeBit(self.executed);
    },
    toCell(self: PollDataReply): c.Cell {
        return makeCellFrom<PollDataReply>(self, PollDataReply.store);
    }
}

/**
 > struct (0xd53276db) ReturnExcessesBack {
 >     queryId: uint64
 > }
 */
export interface ReturnExcessesBack {
    readonly $: 'ReturnExcessesBack'
    queryId: uint64
}

export const ReturnExcessesBack = {
    PREFIX: 0xd53276db,

    create(args: {
        queryId: uint64
    }): ReturnExcessesBack {
        return {
            $: 'ReturnExcessesBack',
            ...args
        }
    },
    fromSlice(s: c.Slice): ReturnExcessesBack {
        loadAndCheckPrefix32(s, 0xd53276db, 'ReturnExcessesBack');
        return {
            $: 'ReturnExcessesBack',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ReturnExcessesBack, b: c.Builder): void {
        b.storeUint(0xd53276db, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ReturnExcessesBack): c.Cell {
        return makeCellFrom<ReturnExcessesBack>(self, ReturnExcessesBack.store);
    }
}

/**
 > struct (0x0000100d) ExecuteDaoProposal {
 >     queryId: uint64
 >     proposalId: uint64
 >     proposerOwner: address
 >     expiresAt: uint32
 >     walletLibRef: cell
 >     targetMsg: cell
 > }
 */
export interface ExecuteDaoProposal {
    readonly $: 'ExecuteDaoProposal'
    queryId: uint64 /* = 0 */
    proposalId: uint64
    proposerOwner: c.Address
    expiresAt: uint32
    walletLibRef: c.Cell
    targetMsg: c.Cell
}

export const ExecuteDaoProposal = {
    PREFIX: 0x0000100d,

    create(args: {
        queryId?: uint64 /* = 0 */
        proposalId: uint64
        proposerOwner: c.Address
        expiresAt: uint32
        walletLibRef: c.Cell
        targetMsg: c.Cell
    }): ExecuteDaoProposal {
        return {
            $: 'ExecuteDaoProposal',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): ExecuteDaoProposal {
        loadAndCheckPrefix32(s, 0x0000100d, 'ExecuteDaoProposal');
        return {
            $: 'ExecuteDaoProposal',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            expiresAt: s.loadUintBig(32),
            walletLibRef: s.loadRef(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: ExecuteDaoProposal, b: c.Builder): void {
        b.storeUint(0x0000100d, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
        b.storeAddress(self.proposerOwner);
        b.storeUint(self.expiresAt, 32);
        b.storeRef(self.walletLibRef);
        b.storeRef(self.targetMsg);
    },
    toCell(self: ExecuteDaoProposal): c.Cell {
        return makeCellFrom<ExecuteDaoProposal>(self, ExecuteDaoProposal.store);
    }
}

/**
 > struct (0x0000100e) RequestTotalAccounts {
 >     queryId: uint64
 > }
 */
export interface RequestTotalAccounts {
    readonly $: 'RequestTotalAccounts'
    queryId: uint64 /* = 0 */
}

export const RequestTotalAccounts = {
    PREFIX: 0x0000100e,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): RequestTotalAccounts {
        return {
            $: 'RequestTotalAccounts',
            queryId: 0n,
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
    queryId: uint64 /* = 0 */
    totalAccounts: uint33
}

export const ResponseTotalAccounts = {
    PREFIX: 0x0000100f,

    create(args: {
        queryId?: uint64 /* = 0 */
        totalAccounts: uint33
    }): ResponseTotalAccounts {
        return {
            $: 'ResponseTotalAccounts',
            queryId: 0n,
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
 > struct (0x000010fb) InitPoll {
 >     queryId: uint64
 > }
 */
export interface InitPoll {
    readonly $: 'InitPoll'
    queryId: uint64 /* = 0 */
}

export const InitPoll = {
    PREFIX: 0x000010fb,

    create(args: {
        queryId?: uint64 /* = 0 */
    }): InitPoll {
        return {
            $: 'InitPoll',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InitPoll {
        loadAndCheckPrefix32(s, 0x000010fb, 'InitPoll');
        return {
            $: 'InitPoll',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: InitPoll, b: c.Builder): void {
        b.storeUint(0x000010fb, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: InitPoll): c.Cell {
        return makeCellFrom<InitPoll>(self, InitPoll.store);
    }
}

/**
 > struct (0x000010fd) VoteProposalChild {
 >     queryId: uint64
 >     proposalId: uint64
 >     vote: bool
 >     voterOwner: address
 > }
 */
export interface VoteProposalChild {
    readonly $: 'VoteProposalChild'
    queryId: uint64
    proposalId: uint64
    vote: boolean
    voterOwner: c.Address
}

export const VoteProposalChild = {
    PREFIX: 0x000010fd,

    create(args: {
        queryId: uint64
        proposalId: uint64
        vote: boolean
        voterOwner: c.Address
    }): VoteProposalChild {
        return {
            $: 'VoteProposalChild',
            ...args
        }
    },
    fromSlice(s: c.Slice): VoteProposalChild {
        loadAndCheckPrefix32(s, 0x000010fd, 'VoteProposalChild');
        return {
            $: 'VoteProposalChild',
            queryId: s.loadUintBig(64),
            proposalId: s.loadUintBig(64),
            vote: s.loadBoolean(),
            voterOwner: s.loadAddress(),
        }
    },
    store(self: VoteProposalChild, b: c.Builder): void {
        b.storeUint(0x000010fd, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.proposalId, 64);
        b.storeBit(self.vote);
        b.storeAddress(self.voterOwner);
    },
    toCell(self: VoteProposalChild): c.Cell {
        return makeCellFrom<VoteProposalChild>(self, VoteProposalChild.store);
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
    oldVote: boolean | null /* = null */
    newVote: boolean
}

export const VoteProposal = {
    PREFIX: 0x000010fe,

    create(args: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote?: boolean | null /* = null */
        newVote: boolean
    }): VoteProposal {
        return {
            $: 'VoteProposal',
            oldVote: null,
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
 > struct PollAddresses {
 >     proposerOwner: address
 >     daoProxyAddress: address
 >     fiAddress: address
 > }
 */
export interface PollAddresses {
    readonly $: 'PollAddresses'
    proposerOwner: c.Address
    daoProxyAddress: c.Address
    fiAddress: c.Address
}

export const PollAddresses = {
    create(args: {
        proposerOwner: c.Address
        daoProxyAddress: c.Address
        fiAddress: c.Address
    }): PollAddresses {
        return {
            $: 'PollAddresses',
            ...args
        }
    },
    fromSlice(s: c.Slice): PollAddresses {
        return {
            $: 'PollAddresses',
            proposerOwner: s.loadAddress(),
            daoProxyAddress: s.loadAddress(),
            fiAddress: s.loadAddress(),
        }
    },
    store(self: PollAddresses, b: c.Builder): void {
        b.storeAddress(self.proposerOwner);
        b.storeAddress(self.daoProxyAddress);
        b.storeAddress(self.fiAddress);
    },
    toCell(self: PollAddresses): c.Cell {
        return makeCellFrom<PollAddresses>(self, PollAddresses.store);
    }
}

/**
 > struct PollStore {
 >     proposalId: uint64
 >     addresses: Cell<PollAddresses>
 >     targetMsg: cell
 >     yesVotes: uint33
 >     noVotes: uint33
 >     totalAccounts: uint33
 >     expiresAt: uint32
 >     executed: bool
 > }
 */
export interface PollStore {
    readonly $: 'PollStore'
    proposalId: uint64
    addresses: CellRef<PollAddresses>
    targetMsg: c.Cell
    yesVotes: uint33 /* = 0 */
    noVotes: uint33 /* = 0 */
    totalAccounts: uint33 /* = 0 */
    expiresAt: uint32 /* = 0 */
    executed: boolean /* = false */
}

export const PollStore = {
    create(args: {
        proposalId: uint64
        addresses: CellRef<PollAddresses>
        targetMsg: c.Cell
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        totalAccounts?: uint33 /* = 0 */
        expiresAt?: uint32 /* = 0 */
        executed?: boolean /* = false */
    }): PollStore {
        return {
            $: 'PollStore',
            yesVotes: 0n,
            noVotes: 0n,
            totalAccounts: 0n,
            expiresAt: 0n,
            executed: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): PollStore {
        return {
            $: 'PollStore',
            proposalId: s.loadUintBig(64),
            addresses: loadCellRef<PollAddresses>(s, PollAddresses.fromSlice),
            targetMsg: s.loadRef(),
            yesVotes: s.loadUintBig(33),
            noVotes: s.loadUintBig(33),
            totalAccounts: s.loadUintBig(33),
            expiresAt: s.loadUintBig(32),
            executed: s.loadBoolean(),
        }
    },
    store(self: PollStore, b: c.Builder): void {
        b.storeUint(self.proposalId, 64);
        storeCellRef<PollAddresses>(self.addresses, b, PollAddresses.store);
        b.storeRef(self.targetMsg);
        b.storeUint(self.yesVotes, 33);
        b.storeUint(self.noVotes, 33);
        b.storeUint(self.totalAccounts, 33);
        b.storeUint(self.expiresAt, 32);
        b.storeBit(self.executed);
    },
    toCell(self: PollStore): c.Cell {
        return makeCellFrom<PollStore>(self, PollStore.store);
    }
}

// ————————————————————————————————————————————
//    class Poll
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

export class Poll implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.IncorrectSender': 700,
        'Errors.ProposalNotFound': 751,
        'Errors.ProposalExpired': 754,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Poll(address);
    }

    static fromStorage(emptyStorage: {
        proposalId: uint64
        addresses: CellRef<PollAddresses>
        targetMsg: c.Cell
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        totalAccounts?: uint33 /* = 0 */
        expiresAt?: uint32 /* = 0 */
        executed?: boolean /* = false */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Poll.CodeCell,
            data: PollStore.toCell(PollStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Poll(address, initialState);
    }

    static createCellOfInitPoll(body: {
        queryId?: uint64 /* = 0 */
    }) {
        return InitPoll.toCell(InitPoll.create(body));
    }

    static createCellOfResponseTotalAccounts(body: {
        queryId?: uint64 /* = 0 */
        totalAccounts: uint33
    }) {
        return ResponseTotalAccounts.toCell(ResponseTotalAccounts.create(body));
    }

    static createCellOfVoteProposal(body: {
        queryId: uint64
        proposalId: uint64
        voterOwner: c.Address
        oldVote?: boolean | null /* = null */
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendInitPoll(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitPoll.toCell(InitPoll.create(body)),
            ...extraOptions
        });
    }

    async sendResponseTotalAccounts(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
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
        oldVote?: boolean | null /* = null */
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

    async getPollData(provider: ContractProvider): Promise<PollDataReply> {
        const r = StackReader.fromGetMethod(10, await provider.get('get_poll_data', []));
        return ({
            $: 'PollDataReply',
            proposalId: r.readBigInt(),
            proposerOwner: r.readSlice().loadAddress(),
            daoProxyAddress: r.readSlice().loadAddress(),
            fiAddress: r.readSlice().loadAddress(),
            targetMsg: r.readCell(),
            yesVotes: r.readBigInt(),
            noVotes: r.readBigInt(),
            totalAccounts: r.readBigInt(),
            expiresAt: r.readBigInt(),
            executed: r.readBoolean(),
        });
    }

    async getVoterAddress(provider: ContractProvider, voterOwner: c.Address): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_voter_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(voterOwner,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readSlice().loadAddress();
    }
}
