// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Dao contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type RemainingBitsAndRefs = c.Slice

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

function formatPrefix(prefixNum: number, prefixLen: number): string {
    return prefixLen % 4 ? `0b${prefixNum.toString(2).padStart(prefixLen, '0')}` : `0x${prefixNum.toString(16).padStart(prefixLen / 4, '0')}`;
}

function loadAndCheckPrefix(s: c.Slice, expected: number, prefixLen: number, structName: string): void {
    let prefix = s.loadUint(prefixLen);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected ${formatPrefix(expected, prefixLen)}, got ${formatPrefix(prefix, prefixLen)}`);
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

function storeTolkRemaining(v: RemainingBitsAndRefs, b: c.Builder): void {
    b.storeSlice(v);
}

function loadTolkRemaining(s: c.Slice): RemainingBitsAndRefs {
    let rest = s.clone();
    s.loadBits(s.remainingBits);
    while (s.remainingRefs) {
        s.loadRef();
    }
    return rest;
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

type uint10 = bigint
type uint32 = bigint
type uint33 = bigint
type uint64 = bigint

/**
 > type ForwardPayloadRemainder = RemainingBitsAndRefs
 */
export type ForwardPayloadRemainder = RemainingBitsAndRefs

export const ForwardPayloadRemainder = {
    fromSlice(s: c.Slice): ForwardPayloadRemainder {
        return loadTolkRemaining(s);
    },
    store(self: ForwardPayloadRemainder, b: c.Builder): void {
        storeTolkRemaining(self, b);
    },
    toCell(self: ForwardPayloadRemainder): c.Cell {
        return makeCellFrom<ForwardPayloadRemainder>(self, ForwardPayloadRemainder.store);
    }
}

/**
 > struct (0b0) PayloadInline {
 >     value: RemainingBitsAndRefs
 > }
 */
export interface PayloadInline {
    readonly $: 'PayloadInline'
    value: RemainingBitsAndRefs
}

export const PayloadInline = {
    PREFIX: 0b0,

    create(args: {
        value: RemainingBitsAndRefs
    }): PayloadInline {
        return {
            $: 'PayloadInline',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInline {
        loadAndCheckPrefix(s, 0b0, 1, 'PayloadInline');
        return {
            $: 'PayloadInline',
            value: loadTolkRemaining(s),
        }
    },
    store(self: PayloadInline, b: c.Builder): void {
        b.storeUint(0b0, 1);
        storeTolkRemaining(self.value, b);
    },
    toCell(self: PayloadInline): c.Cell {
        return makeCellFrom<PayloadInline>(self, PayloadInline.store);
    }
}

/**
 > struct (0b1) PayloadInRef {
 >     value: Cell<RemainingBitsAndRefs>
 > }
 */
export interface PayloadInRef {
    readonly $: 'PayloadInRef'
    value: CellRef<RemainingBitsAndRefs>
}

export const PayloadInRef = {
    PREFIX: 0b1,

    create(args: {
        value: CellRef<RemainingBitsAndRefs>
    }): PayloadInRef {
        return {
            $: 'PayloadInRef',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInRef {
        loadAndCheckPrefix(s, 0b1, 1, 'PayloadInRef');
        return {
            $: 'PayloadInRef',
            value: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
        }
    },
    store(self: PayloadInRef, b: c.Builder): void {
        b.storeUint(0b1, 1);
        storeCellRef<RemainingBitsAndRefs>(self.value, b, storeTolkRemaining);
    },
    toCell(self: PayloadInRef): c.Cell {
        return makeCellFrom<PayloadInRef>(self, PayloadInRef.store);
    }
}

/**
 > struct (0x178d4519) InternalTransferStep {
 >     queryId: uint64
 >     jettonAmount: coins
 >     version: uint10
 >     transferredAsCredit: bool
 >     transferInitiator: address
 >     sendExcessesTo: address?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface InternalTransferStep {
    readonly $: 'InternalTransferStep'
    queryId: uint64
    jettonAmount: coins
    version: uint10
    transferredAsCredit: boolean /* = false */
    transferInitiator: c.Address
    sendExcessesTo: c.Address | null
    forwardTonAmount: coins
    forwardPayload: PayloadInline | PayloadInRef
}

export const InternalTransferStep = {
    PREFIX: 0x178d4519,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        version: uint10
        transferredAsCredit?: boolean /* = false */
        transferInitiator: c.Address
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }): InternalTransferStep {
        return {
            $: 'InternalTransferStep',
            transferredAsCredit: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalTransferStep {
        loadAndCheckPrefix32(s, 0x178d4519, 'InternalTransferStep');
        return {
            $: 'InternalTransferStep',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            version: s.loadUintBig(10),
            transferredAsCredit: s.loadBoolean(),
            transferInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('InternalTransferStep.forwardPayload'),
        }
    },
    store(self: InternalTransferStep, b: c.Builder): void {
        b.storeUint(0x178d4519, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeUint(self.version, 10);
        b.storeBit(self.transferredAsCredit);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: InternalTransferStep): c.Cell {
        return makeCellFrom<InternalTransferStep>(self, InternalTransferStep.store);
    }
}

/**
 > struct (0x00001001) MintNewJettons {
 >     queryId: uint64
 >     mintRecipient: address
 >     tonAmount: coins
 >     internalTransferMsg: Cell<InternalTransferStep>
 > }
 */
export interface MintNewJettons {
    readonly $: 'MintNewJettons'
    queryId: uint64
    mintRecipient: c.Address
    tonAmount: coins
    internalTransferMsg: CellRef<InternalTransferStep>
}

export const MintNewJettons = {
    PREFIX: 0x00001001,

    create(args: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }): MintNewJettons {
        return {
            $: 'MintNewJettons',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintNewJettons {
        loadAndCheckPrefix32(s, 0x00001001, 'MintNewJettons');
        return {
            $: 'MintNewJettons',
            queryId: s.loadUintBig(64),
            mintRecipient: s.loadAddress(),
            tonAmount: s.loadCoins(),
            internalTransferMsg: loadCellRef<InternalTransferStep>(s, InternalTransferStep.fromSlice),
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x00001001, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.mintRecipient);
        b.storeCoins(self.tonAmount);
        storeCellRef<InternalTransferStep>(self.internalTransferMsg, b, InternalTransferStep.store);
    },
    toCell(self: MintNewJettons): c.Cell {
        return makeCellFrom<MintNewJettons>(self, MintNewJettons.store);
    }
}

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
 >     yesVotes: uint33
 >     noVotes: uint33
 >     expiresAt: uint32
 > }
 */
export interface Proposal {
    readonly $: 'Proposal'
    id: uint64
    proposerOwner: c.Address
    targetMsg: c.Cell
    yesVotes: uint33 /* = 0 */
    noVotes: uint33 /* = 0 */
    expiresAt: uint32 /* = 0 */
}

export const Proposal = {
    create(args: {
        id: uint64
        proposerOwner: c.Address
        targetMsg: c.Cell
        yesVotes?: uint33 /* = 0 */
        noVotes?: uint33 /* = 0 */
        expiresAt?: uint32 /* = 0 */
    }): Proposal {
        return {
            $: 'Proposal',
            yesVotes: 0n,
            noVotes: 0n,
            expiresAt: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): Proposal {
        return {
            $: 'Proposal',
            id: s.loadUintBig(64),
            proposerOwner: s.loadAddress(),
            targetMsg: s.loadRef(),
            yesVotes: s.loadUintBig(33),
            noVotes: s.loadUintBig(33),
            expiresAt: s.loadUintBig(32),
        }
    },
    store(self: Proposal, b: c.Builder): void {
        b.storeUint(self.id, 64);
        b.storeAddress(self.proposerOwner);
        b.storeRef(self.targetMsg);
        b.storeUint(self.yesVotes, 33);
        b.storeUint(self.noVotes, 33);
        b.storeUint(self.expiresAt, 32);
    },
    toCell(self: Proposal): c.Cell {
        return makeCellFrom<Proposal>(self, Proposal.store);
    }
}

/**
 > struct DaoStore {
 >     totalAccounts: uint33
 >     fiAddress: address
 >     proposalCount: uint64
 >     proposals: map<uint64, Proposal>
 > }
 */
export interface DaoStore {
    readonly $: 'DaoStore'
    totalAccounts: uint33 /* = 0 */
    fiAddress: c.Address
    proposalCount: uint64 /* = 0 */
    proposals: c.Dictionary<uint64, Proposal> /* = [] as map<uint64, Proposal> */
}

export const DaoStore = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        fiAddress: c.Address
        proposalCount?: uint64 /* = 0 */
        proposals: c.Dictionary<uint64, Proposal> /* = [] as map<uint64, Proposal> */
    }): DaoStore {
        return {
            $: 'DaoStore',
            totalAccounts: 0n,
            proposalCount: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): DaoStore {
        return {
            $: 'DaoStore',
            totalAccounts: s.loadUintBig(33),
            fiAddress: s.loadAddress(),
            proposalCount: s.loadUintBig(64),
            proposals: c.Dictionary.load<uint64, Proposal>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<Proposal>(Proposal.fromSlice, Proposal.store), s),
        }
    },
    store(self: DaoStore, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        b.storeAddress(self.fiAddress);
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
    static CodeCell = c.Cell.fromBase64('te6ccgECEgEAAvQAART/APSkE/S88sgLAQIBYgIDA/jQ+JGRMOAgxwCRMODtRNDTIPpI0z/0BQTXLCAAAIfcjk74IwKkUgLTPzH6SNdMBIIICTqAoCPIyz8S+lIUzHDPC0ETyx9UIAaAQPRDA8jLIFIg+lLLPxL0AMntVMjPhQj6UoEQDs8Ljss/yYBC+wDg1ywgAACAfOMCidcnBAUGAgEgDQ4AODP4kiLHBfLivALTPzHXCyDIyyD6Uss/9ADJ7VQACAAAEP4BuOMC1ywgAACH/I5D0z8x1ws/UwSAQPQOb6GOL9M/MfpIMdQx0yAx0yAx0x/R+CO7jhVQBIBA9FswAsjLIPpSEss/9ADJ7VSSXwXikl8G4uBsQdcsIAAAgDwx3PI/BwT+0z8x0z/6SNMAAZLSAJJtAeLXCgD4KIhtBcj6UhL6UhT0AMlQA8jPhNDMzPkWyM+KAEDL/89Q+JLHBfLi9lMmgED0DvLi79M/+kjU0yDTINMf0fgjIbny4vImbpk2BpGkkwWkBeKOElFnvZsGk6QFpZOlBaTiBZE24uIp4w8huxEICQoAECmqAKYCc6kEAAJxAU6OFQPIyz8S+lLMyyASyyDLH0AVgED0Q+MNAsjLIPpSEss/9ADJ7VQLAf4wbCIyggiYloBw+wKCIAkYTnKgAIIQBfXhAIIK+vCA+ChtIG6zkzCLBN/Iz5BeNRRmKM8LP1AF+gLPiABA+lJSQPpUz4QgE87JyM+FCFKA+lJY+gKBEAHPC4olzws/E/pSAfoCzMlz+wDQyM7JyM+FCFJA+lJxzwtuzMmAQvsADAAOUASAQPRbMABfv4RfaiaGmQGP0kGOmfmPoCwCB6BzfQz+mf/SRqaZBpkGmP6MCAQvAYNra2tra2uEAgFYDxAAHbfaPaiaGmQfSRpn/oCaMAFHtC//BRENoHkfSkJfSkJegBkgORnwmhmZnyLZGfFACBl/+eoQEQhCArOTlFw2gd4inUvykpg4psvc7cyRlkC/BLIeTiZjeEQd');

    static Errors = {
        'Errors.IncorrectSender': 700,
        'Errors.ProposalNotFound': 751,
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
        fiAddress: c.Address
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
        const r = StackReader.fromGetMethod(4, await provider.get('get_dao_data', []));
        return ({
            $: 'DaoStore',
            totalAccounts: r.readBigInt(),
            fiAddress: r.readSlice().loadAddress(),
            proposalCount: r.readBigInt(),
            proposals: r.readDictionary<uint64, Proposal>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<Proposal>(Proposal.fromSlice, Proposal.store)),
        });
    }

    async getProposal(provider: ContractProvider, proposalId: uint64): Promise<Proposal | null> {
        const r = StackReader.fromGetMethod(7, await provider.get('get_proposal', [
            { type: 'int', value: proposalId },
        ]));
        return r.readWideNullable<Proposal>(7,
            (r) => ({
                $: 'Proposal',
                id: r.readBigInt(),
                proposerOwner: r.readSlice().loadAddress(),
                targetMsg: r.readCell(),
                yesVotes: r.readBigInt(),
                noVotes: r.readBigInt(),
                expiresAt: r.readBigInt(),
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
