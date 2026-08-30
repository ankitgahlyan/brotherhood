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
    static CodeCell = c.Cell.fromBase64('te6ccgECEgEAA9AAART/APSkE/S88sgLAQIBYgIDAgLEBAUCAVgPEAH31/EjHJmmPmJBrpOEPxyBpj4DAiH7dRxppn5jpn5jrhQB2omhrH+pqaZBpkANMEOEASYDSgO9LEGEASNLvcQJkZwnmZmWQZZBnZPaqSJhxcBhwEGOASJhwEHaiaGmf6mppkGmQaZBpj+uFABNofSR9JH0kGAXrlhAAAEPuQYAB6xXGEACzo4WXwoyyM+FCPpSgRAOzwuOyz/JgEL7AODXLCAAAIB8jic1Wzn4klAIxwXy4rzTPzHXCyAFyMs/FMwSzMsgyyDLIMsfygDJ7VTg1ywgAACH9OMCMWyS1ywgAACH/OMCW4QPAccA8vQHCAT8PAvTP9M/+kjTAAGS0gCSbQHi1woAiIiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARtERXIDgkJCgBKMviSIccF8uK8AdcLP8jPhQgS+lKCENUydtvPC47LP8mBAKD7AAAAAfr6UhL6UvpSARETAfQAySbI+lIBERMBzAEREgHMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wBERIBzAEREQHMAREQAczJeCQREVQSAsjPg8sEz4WgzMz5FoT3sAsD/AEREAGACwEREdckyM+KAEDOH8v3z1D4kscF8uK8JfLS7/gjJ7ny4vIgbpswLJIIpJQHpAcI4o4TLb2eLJQIpAellAilB6TiBwjeCOL4KIgqyPpSEvpSz4SAyYIJMS0AyM+JiAFTI8jPhNDMzPkWzwv/AfoCgQCMzwtwEszMiREMDQAIAAAQ/QH0zxYjzws/Ess/HMoAF/pSyYAR+wAjmCOqAKYCc6kEkXHiKruUIbPDAJFw4o6xMX+IyM+QAABANhfLPynPCz8S+lIizwsfFcwlzxTJyM+FCBr6UnHPC24ZzMmBALD7AJMwNDjiBcjLPxTMEswUyyDLIMsgEssfygDJ7VQOCEICO9pzlscsb5obGBCjCd0NYcaNSn91KLcRdiwzHnT73sIBQ7nM74KIgCyPpS+lLPhIDJAcjPhNDMzPkWyM+KAEDL/89QgRAEe6eb7UTQ0z/U1NMg0yDTINMf1woABtD6SPpI+kgwSBZEdBUTgIQgIXH49hkYExuXTBimAhhGcntLYUs+cFkx1tzV0rfkvKaA==');

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
