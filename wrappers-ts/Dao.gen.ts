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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint32 = bigint
type uint33 = bigint
type uint64 = bigint

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
 >     id: uint64
 >     proposerOwner: address
 >     targetMsg: cell
 > }
 */
export interface ExecuteDaoProposal {
    readonly $: 'ExecuteDaoProposal'
    id: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
}

export const ExecuteDaoProposal = {
    PREFIX: 0x0000100d,

    create(args: {
        id: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }): ExecuteDaoProposal {
        return {
            $: 'ExecuteDaoProposal',
            ...args
        }
    },
    fromSlice(s: c.Slice): ExecuteDaoProposal {
        loadAndCheckPrefix32(s, 0x0000100d, 'ExecuteDaoProposal');
        return {
            $: 'ExecuteDaoProposal',
            id: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: ExecuteDaoProposal, b: c.Builder): void {
        b.storeUint(0x0000100d, 32);
        b.storeUint(self.id, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
    },
    toCell(self: ExecuteDaoProposal): c.Cell {
        return makeCellFrom<ExecuteDaoProposal>(self, ExecuteDaoProposal.store);
    }
}

/**
 > struct (0x0000100e) RefundDaoProposalFee {
 >     id: uint64
 >     proposerOwner: address
 >     targetMsg: cell
 > }
 */
export interface RefundDaoProposalFee {
    readonly $: 'RefundDaoProposalFee'
    id: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
}

export const RefundDaoProposalFee = {
    PREFIX: 0x0000100e,

    create(args: {
        id: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
    }): RefundDaoProposalFee {
        return {
            $: 'RefundDaoProposalFee',
            ...args
        }
    },
    fromSlice(s: c.Slice): RefundDaoProposalFee {
        loadAndCheckPrefix32(s, 0x0000100e, 'RefundDaoProposalFee');
        return {
            $: 'RefundDaoProposalFee',
            id: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: RefundDaoProposalFee, b: c.Builder): void {
        b.storeUint(0x0000100e, 32);
        b.storeUint(self.id, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
    },
    toCell(self: RefundDaoProposalFee): c.Cell {
        return makeCellFrom<RefundDaoProposalFee>(self, RefundDaoProposalFee.store);
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
 >     id: uint64
 >     proposerOwner: address
 >     targetAddr: address
 >     targetMsg: cell
 > }
 */
export interface SubmitProposal {
    readonly $: 'SubmitProposal'
    id: uint64
    proposerOwner: c.Address
    targetAddr: c.Address
    targetMsg: c.Cell
}

export const SubmitProposal = {
    PREFIX: 0x000010fb,

    create(args: {
        id: uint64
        proposerOwner: c.Address
        targetAddr: c.Address
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
            id: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetAddr: s.loadAddress(),
            targetMsg: s.loadRef(),
        }
    },
    store(self: SubmitProposal, b: c.Builder): void {
        b.storeUint(0x000010fb, 32);
        b.storeUint(self.id, 64);
        b.storeAddress(self.proposerOwner);
        b.storeAddress(self.targetAddr);
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
 > struct DaoStore {
 >     totalAccounts: uint33
 >     proposer: address
 >     targetAddr: address
 >     targetMsg: cell?
 >     yesVotes: uint33
 >     noVotes: uint33
 >     expiresAt: uint32
 > }
 */
export interface DaoStore {
    readonly $: 'DaoStore'
    totalAccounts: uint33 /* = 0 */
    proposer: c.Address
    targetAddr: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
    targetMsg: c.Cell | null /* = null */
    yesVotes: uint33 /* = 0 */
    noVotes: uint33 /* = 0 */
    expiresAt: uint32 /* = 0 */
}

export const DaoStore = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        proposer: c.Address
        targetAddr?: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
        targetMsg?: c.Cell | null /* = null */
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        expiresAt?: uint32 /* = 0 */
    }): DaoStore {
        return {
            $: 'DaoStore',
            totalAccounts: 0n,
            targetAddr: c.Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'),
            targetMsg: null,
            yesVotes: 0n,
            noVotes: 0n,
            expiresAt: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): DaoStore {
        return {
            $: 'DaoStore',
            totalAccounts: s.loadUintBig(33),
            proposer: s.loadAddress(),
            targetAddr: s.loadAddress(),
            targetMsg: s.loadBoolean() ? s.loadRef() : null,
            yesVotes: s.loadUintBig(33),
            noVotes: s.loadUintBig(33),
            expiresAt: s.loadUintBig(32),
        }
    },
    store(self: DaoStore, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        b.storeAddress(self.proposer);
        b.storeAddress(self.targetAddr);
        storeTolkNullable<c.Cell>(self.targetMsg, b,
            (v,b) => b.storeRef(v)
        );
        b.storeUint(self.yesVotes, 33);
        b.storeUint(self.noVotes, 33);
        b.storeUint(self.expiresAt, 32);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECDgEAAp8AART/APSkE/S88sgLAQIBYgIDBPjQ+JGRMOAgxwCRMOAg7UTQ0yD6SPpI9ATTINMg1wsfB9csIAAAh9yORDMzNfgjNtM/+kgx+kjXTFRBGIIICTqAoAbIyyAV+lIX+lIT9AAUyyATyyDLH8ntVMjPhQgS+lKBEA7PC47LP8mAQvsA4NcsIAAAgHzjAonXJ+MCBAUGBwIBbgsMAEo2N/iSI8cF8uK8BNM/MdcLIMjLIBP6UvpS9ADLIBLLIMsfye1UAAgAABD+A/w4B9N/MfpI0wABktIAkm0B4tcKAPgoiG0FyPpSEvpSFPQAyVADyM+E0MzM+RbIz4oAQMv/z1D4kscF8uL2+CMoufLi8iBumDCRpJMGpAbijhAhvZqTpAalk6UGpOIGkTDi4iSYJKoApgJzqQSRceIhu+MCBMjLIBP6UvpS9AANCAkB/jZbA9csIAAAh/wxjm00+JIhxwXy4rz4I1ADvvLi38jPhQgT+lKNBoAAAAAAAAAAAAAAAAAAAAAIBwAAAAAAAAAAQM8WUhD6UhLMyYBC+wDIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsA4F8EhA8KALwwbDPIz4UIEvpSjQaAAAAAAAAAAAAAAAAAAAAACAaAAAAAAAAAAEDPFlIg+lLMyYBC+wDIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAABTLIBLLIMsfye1UAAoBxwDy9AApt9o9qJoaZB9JH0kegJpkGmQaY/owAUe0L/8FEQ2geR9KQl9KQl6AGSA5GfCaGZmfItkZ8UAIGX/56hANCEICH41C6Q1IuGk4oTsQDiVS7lnABPahUCCnL+37Kj9Mm84=');

    static Errors = {
        'Errors.IncorrectSender': 700,
        'Errors.WaitMore': 735,
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
        totalAccounts?: uint33 /* = 0 */
        proposer: c.Address
        targetAddr?: c.Address /* = address('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') */
        targetMsg?: c.Cell | null /* = null */
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        expiresAt?: uint32 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Dao.CodeCell,
            data: DaoStore.toCell(DaoStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Dao(address, initialState);
    }

    static createCellOfSubmitProposal(body: {
        id: uint64
        proposerOwner: c.Address
        targetAddr: c.Address
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendSubmitProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        id: uint64
        proposerOwner: c.Address
        targetAddr: c.Address
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

    async getDaoData(provider: ContractProvider): Promise<DaoStore> {
        const r = StackReader.fromGetMethod(7, await provider.get('get_dao_data', []));
        return ({
            $: 'DaoStore',
            totalAccounts: r.readBigInt(),
            proposer: r.readSlice().loadAddress(),
            targetAddr: r.readSlice().loadAddress(),
            targetMsg: r.readNullable<c.Cell>(
                (r) => r.readCell()
            ),
            yesVotes: r.readBigInt(),
            noVotes: r.readBigInt(),
            expiresAt: r.readBigInt(),
        });
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
