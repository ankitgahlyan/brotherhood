// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Voter contract in Tolk.
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
 > struct VoterStore {
 >     voterOwner: address
 >     pollAddress: address
 >     voted: bool
 >     vote: bool
 > }
 */
export interface VoterStore {
    readonly $: 'VoterStore'
    voterOwner: c.Address
    pollAddress: c.Address
    voted: boolean /* = false */
    vote: boolean /* = false */
}

export const VoterStore = {
    create(args: {
        voterOwner: c.Address
        pollAddress: c.Address
        voted?: boolean /* = false */
        vote?: boolean /* = false */
    }): VoterStore {
        return {
            $: 'VoterStore',
            voted: false,
            vote: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): VoterStore {
        return {
            $: 'VoterStore',
            voterOwner: s.loadAddress(),
            pollAddress: s.loadAddress(),
            voted: s.loadBoolean(),
            vote: s.loadBoolean(),
        }
    },
    store(self: VoterStore, b: c.Builder): void {
        b.storeAddress(self.voterOwner);
        b.storeAddress(self.pollAddress);
        b.storeBit(self.voted);
        b.storeBit(self.vote);
    },
    toCell(self: VoterStore): c.Cell {
        return makeCellFrom<VoterStore>(self, VoterStore.store);
    }
}

// ————————————————————————————————————————————
//    class Voter
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

export class Voter implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgEBBQEAwgABFP8A9KQT9LzyyAsBAgFiAgMBzND4kfJAIO1E0PpI+kjSANcKAATXLCAAAIfsjjQ1+JIixwXy4rwE038x0gD6SDAjxwXy4rwElVEjusMAkjJw4pPywvXgyPpS+lLPg8oAye1U4DRbAdcsIAAAh/wx4wIwhA8BxwDy9AQAHaDEs9qJofSR9JGkAaQBowBoMfiSIccF8uK8yM+FCPpSjQaAAAAAAAAAAAAAAAAAAGqZO22AAAAAAAAAAEDPFsmBAKD7AA==');

    static Errors = {
        'Errors.IncorrectSender': 700,
        'Errors.DuplicateVote': 757,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Voter(address);
    }

    static fromStorage(emptyStorage: {
        voterOwner: c.Address
        pollAddress: c.Address
        voted?: boolean /* = false */
        vote?: boolean /* = false */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Voter.CodeCell,
            data: VoterStore.toCell(VoterStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Voter(address, initialState);
    }

    static createCellOfVoteProposalChild(body: {
        queryId: uint64
        proposalId: uint64
        vote: boolean
        voterOwner: c.Address
    }) {
        return VoteProposalChild.toCell(VoteProposalChild.create(body));
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

    async sendVoteProposalChild(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        proposalId: uint64
        vote: boolean
        voterOwner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: VoteProposalChild.toCell(VoteProposalChild.create(body)),
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

    async getVoterData(provider: ContractProvider): Promise<VoterStore> {
        const r = StackReader.fromGetMethod(4, await provider.get('get_voter_data', []));
        return ({
            $: 'VoterStore',
            voterOwner: r.readSlice().loadAddress(),
            pollAddress: r.readSlice().loadAddress(),
            voted: r.readBoolean(),
            vote: r.readBoolean(),
        });
    }
}
