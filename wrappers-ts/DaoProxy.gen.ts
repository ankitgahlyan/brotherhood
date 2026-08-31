// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a DaoProxy contract in Tolk.
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

type uint10 = bigint
type uint32 = bigint
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
 > struct (0x00001010) InitDaoProxy {
 >     queryId: uint64
 >     targetAddress: address
 > }
 */
export interface InitDaoProxy {
    readonly $: 'InitDaoProxy'
    queryId: uint64 /* = 0 */
    targetAddress: c.Address
}

export const InitDaoProxy = {
    PREFIX: 0x00001010,

    create(args: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }): InitDaoProxy {
        return {
            $: 'InitDaoProxy',
            queryId: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): InitDaoProxy {
        loadAndCheckPrefix32(s, 0x00001010, 'InitDaoProxy');
        return {
            $: 'InitDaoProxy',
            queryId: s.loadUintBig(64),
            targetAddress: s.loadAddress(),
        }
    },
    store(self: InitDaoProxy, b: c.Builder): void {
        b.storeUint(0x00001010, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.targetAddress);
    },
    toCell(self: InitDaoProxy): c.Cell {
        return makeCellFrom<InitDaoProxy>(self, InitDaoProxy.store);
    }
}

/**
 > struct DaoProxyStore {
 >     adminAddress: address
 >     targetAddress: address
 > }
 */
export interface DaoProxyStore {
    readonly $: 'DaoProxyStore'
    adminAddress: c.Address
    targetAddress: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
}

export const DaoProxyStore = {
    create(args: {
        adminAddress: c.Address
        targetAddress?: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
    }): DaoProxyStore {
        return {
            $: 'DaoProxyStore',
            targetAddress: c.Address.parse('0:0000000000000000000000000000000000000000000000000000000000000000'),
            ...args
        }
    },
    fromSlice(s: c.Slice): DaoProxyStore {
        return {
            $: 'DaoProxyStore',
            adminAddress: s.loadAddress(),
            targetAddress: s.loadAddress(),
        }
    },
    store(self: DaoProxyStore, b: c.Builder): void {
        b.storeAddress(self.adminAddress);
        b.storeAddress(self.targetAddress);
    },
    toCell(self: DaoProxyStore): c.Cell {
        return makeCellFrom<DaoProxyStore>(self, DaoProxyStore.store);
    }
}

// ————————————————————————————————————————————
//    class DaoProxy
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

export class DaoProxy implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECyQEAOHAAART/APSkE/S88sgLAQIBYgIDAgLECAkCASAEBQARv4F/aiaH0kGEAgFuBgcAbbDaO1E0PpIMfpIMCCNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATHBW1Y4wSAAFbDxu1E0PpI+kjRgAfHX8SMiYcBBjgEiYcBB2omh9JH0kGAFrlhAAAEBCRwy2EXxJEWOC+XAk6Z+Y/SQYAOR9KX0pZPaqcGuWEAAAQC5HDLYRfEksY4L5cCT6AmumEH2CaHaPdqn4hVPwGOuWEAAAQDZxgRjrlhAAAEAeGMiYcEIHgOOAeXpCgAprVOYdqJofSR9JGiA5H0pfSlk9qpAAvwyII0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMcF8tBJAdM/MdM/+kjTH9Qx10z4KIgkyPpSEvpSUmD6UslTJcjLPxLMzHDPC2ITyx/PgclYyM+E0MzM+RbIz4oAQMv/z1D4kscF8uK8eoETiIIQCWYBgHALDAEU/wD0pBP0vPLICw0A8vg3cPsCgiAJGE5yoACCEAX14QCCCvrwgPgobSBus5MwiwTfyM+QXjUUZijPCz9QBfoCz4gAQPpSUlD6VM+EIBPOycjPhQhScPpSWPoCgRABzwuKFcs/E/pSWPoCEszJgBH7ANDIzsnIz4UIEvpScc8LbszJgQCQ+wACAWIODwICxBAwAgFYKCkB99fxIxyZpj5iQa6ThD8cgaY+AwIh+3UcaaZ+Y6Z+Y64UAdqJoax/qammQaZADTBDhAEmA0oDvSxBhAEjS73ECZGcJ5mZlkGWQZ2T2qkiYcXAYcBBjgEiYcBB2omhpn+pqaZBpkGmQaY/rhQATaH0kfSR9JBgF65YQAABD7kRAs6OFl8KMsjPhQj6UoEQDs8Ljss/yYBC+wDg1ywgAACAfI4nNVs5+JJQCMcF8uK80z8x1wsgBcjLPxTMEszLIMsgyyDLH8oAye1U4NcsIAAAh/TjAjFsktcsIAAAh/zjAluEDwHHAPL0EhME/DwL0z/TP/pI0wABktIAkm0B4tcKAIiIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEbREVyBjDwxQASjL4kiHHBfLivAHXCz/Iz4UIEvpSghDVMnbbzwuOyz/JgQCg+wAB+vpSEvpS+lIBERMB9ADJJsj6UgEREwHMARESAczJbW1tyPQAcM8LP8ltyPQAcM8LNMkDyPQAEvQAzMzJyI0FAAAAAAQAAAAAAAAABAFAAAAAgAAEzxYTzAEREgHMARERAcwBERABzMl4JBERVBICyM+DywTPhaDMzPkWhPewFQP8AREQAYALARER1yTIz4oAQM4fy/fPUPiSxwXy4rwl8tLv+CMnufLi8iBumzAskgiklAekBwjijhMtvZ4slAikB6WUCKUHpOIHCN4I4vgoiCrI+lIS+lLPhIDJggkxLQDIz4mIAVMjyM+E0MzM+RbPC/8B+gKBAIzPC3ASzMyJKhYXAAgAABD9AfTPFiPPCz8Syz8cygAX+lLJgBH7ACOYI6oApgJzqQSRceIqu5Qhs8MAkXDijrExf4jIz5AAAEA2F8s/Kc8LPxL6UiLPCx8VzCXPFMnIz4UIGvpScc8LbhnMyYEAsPsAkzA0OOIFyMs/FMwSzBTLIMsgyyASyx/KAMntVBgBFP8A9KQT9LzyyAsZAgFiGhsCAsQvMAIBIBwdAgEgHh8CASAkJQA1uFiu1E0NQx1DHUMddM0PQB9AHXTND0AdcLH4AgEgICEAG7aRXaiaGumaGpqa4WHwAgEgIiMAO7KJO1E0NQx1DHUMddM0PQB9AHXTND0AdMfMdcLH4ABHssC7UTQ+gDUMdQx10zQ+kjUMddM0PpI+kgx+kgx9AQx0fgqgABm4sP7UTQ10zQ1DHXTIAgFIJicAFbNJu1E0NdM0NdMgAGGzOntRND6ANMf0wfTAdIA0gD6ANMf0w/6APoA0gDTA9MT0wfSANIA0wnTCdTU1NTRgAUO5zO+CiIAsj6UvpSz4SAyQHIz4TQzMz5FsjPigBAy//PUIKgBHunm+1E0NM/1NTTINMg0yDTH9cKAAbQ+kj6SPpIMEgWRHQVE4ART/APSkE/S88sgLKwIBYiwtAbzQ+JHyQCDtRND6SPpI0gDXCgAE1ywgAACH7I4sNfiSIscF8uK8BNN/MdcKAASVUSO6wwCSMnDik/LC9eDI+lL6Us+DygDJ7VTgNFsB1ywgAACH/DHjAjCEDwHHAPL0LgAdoMSz2omh9JH0kaQBpAGjAGgx+JIhxwXy4rzIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAAgHTMTIAB6xXGEACASAzNABtQ4XwY2Nls0NGxVAdD0AfQB1DHXTNABkjN/kwPDAOLy4r4C9AHTADHXCwnBAfLixgHy0vny0vmAL3O2i7fv4keMCIO1E0PoA0x/TB9MB0gDSAPoA0x/TD/oA+gDSANMD0xPTB9IA0gDTCdMJ1NTU10wj0CPQI9D6SNTXTNAl0ALQAvQE9ATUAdAI1NTXCw8J0x/TH9Mf1wsfCfpI+kgg+kgx9AUN+lD6UPpQMBES9ATTH9cLH4DU2BLU7UTQ+gAx0ysx+gAx0y8x+gAx+gAx0yAx0gDUMdQx10ztRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmJgw8PEUQL+0x8x7UTQ+gDTH9YL+gDWL/oA+gDSANMD1hPTB9YV1NTU10wh0PpI1DHXTNBwUgL6SDARFNcsIAAAh9ydECNfA1cRghjo1KUQAI6r1ywgAACMxJwQI18DVxGCElQL5ACOlNcsILxqKMyaMTJXEtM/MfoAMOMO4uIBERABoBEQHjc4AvwRLNcsIAAAhQyOLTxXEFcTVxNXE1cTVyf4l4IK+vCAvPKwBddMINDXScIA8uLi+JIsxwWT8sK84eMOERDI+lQf+lQc+lTJA8j6UgERJAH6Uh7OyQzIzB3MF8sPyREgyMsfF8sfGMsfyx/JAsj6UhjMFszJA8j0ABbLHwERGQE/QAPe1ywgAACClI9j1ywgAACHnI7V1ywgAACKNJoyVxMx0z8x1wsfjsDXLCAAAJA0jjIwMlcSAdD0BPQE1NTRAdD0BNMf0x/RIcIAkwGlAd4CyPQAyx/LH8kDyPQAEvQAEszMyeMOARER4uMNEREG4w0GOTo7AFagyAEREPoCH8sfG85QCfoCF85QBfoCUAP6AsoAywPOywfOzBPMEszMye1UA/rXLCAAAJA8j3Ix1ywgAACQDI7j1ywgAACQBDGS8j/hAtD0BPQE1NTRAdD0BNMf0x/RpALI9ADLH8sfyQPI9AAS9AASzMzJK4IY6NSlEAC2CFHMoSCScDzfghjo1KUQAC2hghjo1KUQAFAOoSDCAJQwMlcS4w0K4w0BERHjDTw9PgCEM1cTAdIA1wsDAY4zGaAB0PQE9ATU1NEB0PQE0x/TH9H4klADgQEL9FkwyPQAyx/LH8kDyPQAEvQAEszMyVAIkTDiADgQI18DVxEg0PQEMfQEMdQx1DHRgh8XZvW6AAalAHiCCvrwgG3Ii8e92X3gAAAAAAAAABjPFlAD+gIV+lL6VMnIz4UIAREVAfpSUAP6AnHPC2oBERMBzMly+wAA7jAC0PQE9ATU1NEB0PQE0x/TH9EgwgCRpd4CyPQAyx/LH8kDyPQAEvQAEszMyYIfFyta8ACCCvrwgIIY6NSlEABtyIvHvdl94AAAAAAAAAAIzxZY+gIV+lIU+lTJyM+FCAERFQH6UlAD+gJxzwtqARETAczJcvsAAFowMlcSAdD0BPQE1NTRAdD0BNMf0x/RAaQCyPQAEssfyx/JA8j0ABL0ABLMzMkE+tcsIAAAhRSPatcsIAAAhUSOMFcRVxJXE1cTVxNXE1cn+JeCCvrwgLzysPiSLMcFk/LCvOFWGMAK8uL6CtM/MdcLD48Z1ywgAACKDOMPESQRJhEkChEkEREREA8ODOIREREmEREREBERERAPERAPEO8MDgrjDQoRJgoKEREKQUJDRACsyx/JAsj0AAERGAH0AMwSzsnIAREV+gIBERMByx8BEREBywcfywEdygAbygBQCfoCF8sfFcsPUAP6AgH6AsoAywPLE8sHygDKAMsJywkUzBPMzMzJ7VQB/lcRVxRXFFcUVxRXKPiS+JdRHscF8uBJggr68IC+8rD4IyWCCAk6gKAhufLi34ILwmcAJqAhvJyCCAk6gFAEoCO5wwCSM3Di8uLfgiAKGvs1RgARJlYmoAzTP/pQMFEQceMEyM+R73Zfess/AREn+gJS0PpSAREmAfpUycjPhQhFA4jXLCAAAIKMjyPXLCAAAIeM4w8OESYOCBEkCA8RGA8KERYKCBERCBDvEI4KCOMNDxEmDxEWESQRFggRFggOEREOEK8QrkZHSACoVxFXFFcUVxRXFFco+JeCCvrwgLzysPiSLccFk/LCvOEL0z/XTCDQ10nCAPLi4iDIz5AAAEKOE8s/UuD6UhfMFszJyM+FCFIg+lJxzwtuzMmAUPsAABIKERAKEK8QrgUAHFIg+lJxzwtuzMmAUPsABORXEVcUVxRXFFcUVyj4kviXUR7HBfLgSYIK+vCAvvKwC/pIMCD6RDDy0U0RGfLi2/iSVhnHBfLSxO1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyYnDw8RJAzTXLCAAAIeUjw3XLCAAAIKs4w8PERgP4w0RGFNUVQL6VxFXLPiS+JcBVhLHBfLgSYIK+vCAvvKwD9M/+kjU1NcLDyP6RDDy0U1WLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQRWLQQDES0DAhEsAgERKwERKvACVhTQ10nCAJFw4w1LTAL6iW0HyPpSEvpS+lIV9ADJVh3I+lIVzBTMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewAREaAYALAREb1yTIz4oAQM7ESgBiAREZAcv3z1BwyM+GoFIiERKBAQv0QcjPhYgS+lKCAh56zwuTUsD6Ui3PCw/JgFD7AAASVhPQ10nCAMMABMDy4uL4IwiBOECgKLkpgggJOoCgKbmwViWx8uLfVhvBC/Lg+hEbpO1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyYnDw8RNAvyJbQfI+lIS+lL6UhX0AMlWGsj6UhXMFMzJbW1tyPQAcM8LP8ltyPQAcM8LNMkDyPQAEvQAzMzJyI0FAAAAAAQAAAAAAAAABAFAAAAAgAAEzxYTzBTME8wSzMl4VhhUEjLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fETgT8z1CCGOiZCkYAyAH6AkAfgQEL9EERKYIY6JkKRgCg+CqIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEiW0syPpSE/pS+lL0AMlWGsj6UhLMzMltbW3I9ABww8PETwH+zws/yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhTMEszMzMl4+CptVh1WFijIz5AAAEFKAREkAcs/EssJ+lIBESEB+lLMAREfAfQAAREXAcwBERUBzAERFwHLD8nIz4mIAVYVVhVWHsjPg1AAdssEz4WgzMz5FoT3sBEXgAtWHtckVx0BERwBzgERFQHL94EVDc8LeQEREgHMARESAcwBERgBzMmAUPsAAvyJbQfI+lIS+lL6UhX0AMknyPpSFcwUzMltbW3I9ABwzws/yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhPMFMwTzBLMyXhRIsjPg8sEz4WgzMz5FoT3sBSAC1AF1yTIz4oAQM4Ty/fPUCPEUgBIxwWVbCHy4r7gMND6SDHUMdTR0PpI+kgx+kgx9AQx0ccF8uBKBNJXEVcUVxRXFFcUVyj4kviXUR7HBfLgSYIK+vCAvvKwC/pIMCD6RDDy0U1WFvLivu1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyYnDw8RWAvrXLCAAAIK8jkQwVxBXE1cTVxNXE1cn+JL4l1EdxwXy4EmCCvrwgL7ysIIQBfXhAMjPhQhSIPpSAfoCgRAIzwuKUsD6UlYUzwsJyXP7AI8Z1ywgAACHpOMPChEmCgoREQoKERAKEK8QruIREREmEREREBERERAPERAPEO8QrlhZBMhXEVcUVxRXFFcUVyj4kviXUR7HBfLgSYIK+vCAvvKwC/pIMCD6RDDy0U3tRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmJw8PEbwP8iW0HyPpSEvpS+lIV9ADJJcj6UhXMFMzJbW1tyPQAcM8LP8ltyPQAcM8LNMkDyPQAEvQAzMzJyI0FAAAAAAQAAAAAAAAABAFAAAAAgAAEzxYTzBTME8wSzMl4USLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUMiJxFtXAB7PFvpSgRBWzwuOyYBQ+wAE4lcRVxRXFFcUVxRXKPiS+JdRHscF8uBJggr68IC+8rAL+kgwIPpEMPLRTVYhkX+UViDDAOLy4rztRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmJw8PEWgP81ywgAACMjI7z1ywgAACKTI5WVxFXFFcUVxRXFFco+JL4l1EexwXy4EmCCvrwgL7ysAv6SDAg+kQw8tFNK40IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMcFkTuRMOLjDgoRJgoRJAoREQoKERAKEK8QruMNXV5fA/6JbQfI+lIS+lL6UhX0AMklyPpSFcwUzMltbW3I9ABwzws/yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhPMFMwTzBLMyXhRIsjPg8sEz4WgzMz5FoT3sBKAC1AD1yTIz4oAQM7L989QLMiJxFtcAAFiACTPFhL6UoEQ9c8LjvpSyYBQ+wAE+tcsIAAAgsSOTTBXEFcTVxNXE1cTVyf4kviXUR3HBfLgSYIK+vCAvvKw+JLIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAj6TXLCC8aijMjwnXLCB8U/Us4w/jDQoRJgoKEREKChEQChCvEK7iYGFiYwCUMFcQVxNXE1cTVxNXJ/iS+JdRHccF8uBJggr68IC+8rARJIISVAvkAKGCElQL5ADIz4WIViYB+lKBEZjPC45S0PpSAfoCyYBQ+wAALBERESYREREkERAREREQDxEQDxDvEK4B9FcRVxRXFFcUVxRXKPiSLccF8uBJVhry0vlWG/LS+QvTP/oA+kj6UPQB+gAg9AQBbpEwkdHiI/pEMPLRTfiX+JNw+DojcnHjBPg5IG6BTQ4i4wQhboEoZFgD4wRQI6gloIBwggDbiHD4PKABcPg2oAFw+DaggHCCANrAZAMo1ywgAACKPI8J1ywgAACKROMP4w1xcnMD+FcRVxRXFFcUVxRXKAvTP/oA0wnSAPpI+lD6ADH4kiPwASRWG7qRNOMOESokoALjAIIID0JAyM+RzYtCcibPCz9QBfoCUhD6UhPOycjPhQhWEQH6UlAE+gJxzwtqE8zJc/sAViduswIRKAHjBPiX+CdvEKL4L6CAcIIA2sBoaWoAKBERESYREREQEREREA8REA8Q7xCuBP6CEAlmAYBw+DegvPKwViolvvKvESokoe1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyY0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIltB8j6UhL6UvpSw8PEZQH+FfQAySjI+lIVzBTMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewFYALUAbXJMjPigBAzhTL989QVipus5ZXKosEESrfyGYBZInPFhbLP1AE+gJWGM8LCc+BVhAB+lL6VFj6AgERJwHOycjPhYgS+lJxzwtuzMmAUPsAZwAIF41FGQDIBFYauY41+JKCEAX14QBt+CrIz5AAAEAbVh7PCwlWFgH6UhL0APQAycjPhQgT+lIB+gJxzwtqzMlz+wCOJviSghAF9eEAyM+FCBL6UgH6AoEQCM8LilYSAfpSVhrPCwnJc/sA4gL+ViPCAPLi+CNWJLYIU0ChESUhoVYlwgCSVyXjDVYiqIIQBfXhAG2CAYagbcj0AM9QIG6zkzCLBN/Iz5BeNRRmKs8LP1AF+gLPiADAUlD6UhL6VAH6AhLOyVR2IcjPkAAAQAYTyz/6UlAD+gLMycjPhQhWEgH6Ulj6AnHPC2rMyWtsAEqCEAlmAYBw+De2CXL7AsjPhQj6UoIQ1TJ2288Ljss/yYEAgvsABP4DViWh7UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHR+CqIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEiW0HyPpSEvpS+lIV9ADJJ8j6UhXMFMzJbW1tyPQAw8PEbQAGc/sAAf5wzws/yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhPMFMwTzBLMyXglVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1CCCvrwgIsIIG6zkzCLBN/Iz5BeNRRmKs8LPwERKfoCbgBuVh3PCwnPgVYVAfpSVi4B+lTPhCABESgBzsnIz4WIEvpSAREn+gJxzwtqAREmAczJc/sAAhEkAgL+iW0HyPpSEvpS+lIV9ADJJcj6UhXMFMzJbW1tyPQAcM8LP8ltyPQAcM8LNMkDyPQAEvQAzMzJyI0FAAAAAAQAAAAAAAAABAFAAAAAgAAEzxYTzBTME8wSzMl4USLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUCAREcRwAFyBAQv0YvLi3NMD0QERGgGgyM+FCAEREQH6UoICHmrPC5NSwPpSz4gAAsmAUPsABNJXEVcUVxRXFFcUVyj4kiHHBfLivPgjVh++8uL7C9M/+gD6SDAhVii78uLFESchoe1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyYnDw8R0BPjXLCAAAIKUj1/XLCAAAIK0jh8wVxBXE1cTVxNXE1cn+JIuxwX4klYRxwWx8uLkERWzjxnXLCAAAIes4w8KESYKChERCgoREAoQrxCu4gERJgERFREkERUCERUCARERAQEREAFADwMODeMNERARJhEQAREkAQIRFQIPEREPdnd4eQH8VxFXFFcUVxRXFFco+JItxwXy4ElWGvLS+VYb8tL5C9M/+gD6SPpQMCH6RDDy0U34l/iTcPg6cfg5IG6BTQ4i4wQhboEoZFgD4wRQI6iAcIIA24hw+DygAXD4NqABcPg2oIBwggDawIIQCWYBgHD4N6C88rBWKCO+8q8RKCKhkgL6iW0HyPpSEvpS+lIV9ADJVizI+lIVzBTMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewAREpAYALAREq1yTIz4oAQM7EdQCMAREoAcv3z1BtiwggbrOTMIsE38jPkF41FGYVyz9QA/oCVhfPCwnPgVLw+lIS+lTPhCASzsnIz4WIEvpScc8LbszJgFD7AADuVxFXFFcUVxRXFFcoC/pIMPiSAfABViDy0sQRFbNWJI5V+JKL9hdXRob3JpdHlGcmVlemWCBus5MwiwTfyIvBeNRRkAAAAAAAAAAIzxZWJ/oCVhbPCwnPgVLg+lJS4PpUz4QgzsnIz4WIEvpScc8LbszJgFD7AN4D/NcsIAAAh7SO61cRERDXLCAAAIBEjkhXFFcUVxRXFFcoD/pIMPiSAfAB+JKCEAX14QBt+CrIz5AAAEAbVhjPCwlWEAH6UhL0APQAycjPhQgT+lIB+gJxzwtqzMlz+wDjDhERESEREREQEREREA8REA8Qrw4K4w0RIQ4RFQ4REXp7fATGM1cQVxJXElcSVxJXElckVyURE/LS0wvTP9MJ+kj6SNT0BNTU1wsP+JLtRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmJw8PEjwAYAxEQAxDfEK4NClAzA6LXLCAAAIA0j0bXLCAAAIBcjjE3XwVQzV8LbPNskzP4klADxwWSMH+W+JLHBcMA4vLivPQE10wg+wTQ7R7tU/EIrtsx4NcsIAAAh5zjDxEX4w19fn8AUFcVVxVXFVcVVyRXKPiSUAyBAQv0Cm+hMfiSIscFsfLivA76SDHXCwEACBEQDw4AhlcUVxRXFFcUVygP0gDTA/pI1wsP+JJY8AECm1EeuvLi9wERGAGgljEBERgBoeJWH44QVyBWH4IID0JAvH9w4wQRIN8C6NcsIAAAh9SO49csIAAAh+SOVFcUVxRXFFcUVyj4ki3HBfLgSVYW8uK+D9M/+kjTP9IA0wABk9cKAJIwbeLIz4WIFPpSgRD+zwuOFMs/yz9S4PpSIW6TMc+BlM+DygDiygDJgFD7AOMODhEkDuMNDhEkDhEXgIEAaFcUVxRXFFcUVygP0wAx0wn6SPQE9AX4klAD8AFWFiO5n1cWIPsE0O0e7VMRFPEIrpJfA+ID+tcsIsr4PeSPctcsIAAAgDyO1dcsI5sWhOSOPFcUVxRXFFcUVygP0z/6APpIgggPQkDIz5HNi0JyFcs/UAP6AvpSzsnIz4UIUuD6Ulj6AnHPC2rMyXP7AOMODhEmDg4REQ4OERAOEO/jDRERESYREREQEREREA8REA8Q7+MNgoOEAv5XFFcUVxRXFFco+JItxwXy4ElWFvLivoIY6NSlEABWJiG+8uL0AREmAaH4I4IICTqAoBEQ0z/6SNTXTFYQyPpSE/pSUlD6UskjyMs/zMxwzwtiARESAcsfz4HJyM+JiAEhVhPIz4TQzMz5Fs8L/4EAjM8LdAEREgHMARERAcyJjY4DxtcsIAAAjMSOL1cUVxRXFFcUVygP+kj6ADD4kljwAcjPhYhSIPpSgRGYzwuOUtD6UgH6AsmAUPsAj6jXLCAAAJAsjw/XLCAAAJA04w8RJREmESXjDREQESYREA8REQ8OERAO4oWGhwCSMFcTVxNXE1cTVycjkXCX+JIhxwXDAOKOLzM8PVcSVxtXG38RH4IQO5rKAKB/f/gj+Cj4KAURJAUEESAEAxEfAwURFQVQ/VUE3gDgVxRXFFcUVxRXKPiX+DkgboE1hVjjBHGBAqJw+DgBcPg2oIEqr3D4NqC88rD4ki3HBfLgSQ/TP/oA+lAwVicivvKvESchocjPke92X3oTyz8B+gJS0PpSAREmAfpUycjPhYhSIPpScc8LbszJgFD7AAH+VyxWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQRWKQQDESkDAhEoAgERJwERJvACESakESfTP/pI+gAwESdWJ6CCCvrwgMiLx73ZfeAAAAAAAAAAGM8WVin6AlYQAfpSUjD6VIgDdNcsIAAAkASPHdcsIAAAkDzjDxEQESYREBEQESUREA8REQ8OERAO4w0RJREmESUOESUODxERDw4REA6VlpcE/lcs+JJWEccF8uK8VikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEAxEpAwIRKAIBEScBESbwAhEn0z/6SDDtRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzInDw4mKAdzJyM+FCFJg+lJY+gJxzwtqzMly+wD4kvgoiCLI+lIS+lIBESr6As+ByXjIz4mIASJWLCPIz4PLBM+FoMzM+RaE97AEgAsj1yQyzhLL94EVDM8LeQERKQHMAREoAczPkAAASAYSyz/6UsmBAJD7AJoABAAAAf7PFslwyMt/yW1tbQLI+lT6VPpUyY0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABI0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABG0HyPpSEvpS+lIV9ADJVhLI+lIVzBTMyW1tbcj0AHDPCz/JiwH+bcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFYQVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1AhxwXy0sQMpFEQceMEghjo1KUQAMjPhYge+lKBEgbPC47LP4wAGlLQ+lJQDPoCyYBQ+wAACAAAEPsAGs8WAREQAcs/yYBQ+wAC/IltB8j6UhL6UvpSFfQAySzI+lIVzBTMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeCpUEjLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUMSQAf7HBfLivH+CEDuaygBWFZUQKTU1MI5GOztXEVcSVxL4I/iSVhNWE1YSKVYbvI4VVxol+wQF0O0e7VMD8QiuBhEXBhAmlRApNTUw4hETARESAQIREAIQaRA4ECZDAOL4ksjPkAAAQVIZyz9WEAH6Uhb6UswUzBTLD8nIz4UIViYBkQAY+lJxzwtuzMmAUPsABP7tRNDUMdQx10zQ1DHXTND6SPpIMfpIMfQEMdH4KoiIAcjMzM+IAALJcMjLf8ltbW0CyPpU+lT6VMmNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASJbQfI+lIS+lL6UhX0AMkmyPpSFcwUzMltbW3I9ABwzws/w8PEkwH8yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhPMFMwTzBLMyXhRIsjPg8sEz4WgzMz5FoT3sBOAC1AE1yTIz4oAQM4Sy/fPUIsIIG6zkzCLBN/Iz5BeNRRmFcs/UAP6AlYXzwsJz4NS8PpSlAA6AREoAfpUz4QgEs7JyM+FiBL6UnHPC27MyYBQ+wAE/lcsVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEVikEAxEpAwIRKAIBEScBESbwAlYmwgDy4u8RJqURJ9M/+kj6SPoAMFYoIb6XEShWKKFWKOMOIMIAkjAx4w34kvgoiCLI+lKYmZqbA4TXLCAAAJBEjyXXLCAAAJBMjplXFFcUVxRXFFcoD9NPMfpIMCzHBZIKpOMO4w4K4w0RJREmESUOESUODxERDw4REA6lpqcE/FcUVxRXFFcUVyj4ki3HBREQ0z/6SPpIMPiS7UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHR+CqIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEiW0HyPpSEsPDxMUAMlcdVhxWKKEBER4BoBEcEScRHBEdfxEdcAEAcIIK+vCAyIvHvdl94AAAAAAAAAAIzxZY+gJWEQH6UhP6VMnIz4UIUmD6UlAD+gJxzwtqEszJcvsAART/APSkE/S88sgLnACyEvpSAREq+gLPgcl4ESpWKsjPg8sEz4WgzMz5FoT3sIALAREq1yTIz4oAQM4BESgBy/fPUPgoyM+QAABIAhTLPxL6UhL6UsnIz4WIEvpScc8LbszJgQCQ+wACAWKdngICxJ+gAgEgo6QC89fbRdv38SMiYcBB2omh9JH0kfQBrhQACa5YQAABIBkdk65YQAABIAkcea5YQAABALkcTmJmZ/EljgskYv8v8SSxjguGAcXlxXnoCa6YQfYJodo92qfiFhm2Y8BhCB4LjgAr5eiGJ8YagCfGGgOR9KX0pLH0BZQBk9qpoaIAPa2GGHaiaH0kfSR9AGkAaIHkfSkJfSkA/QFlAGT2qkAA9jX4kiLHBZF/l/iSI8cFwwDi8uK8A45KMgLTP/pIMIIK+vCAyM+FCBX6UlAE+gKBEgnPC4ohzws/z4gLvlIw+lLJc/sAyM+FCBL6UoESCc8Ljss/z4gLvvpSyYEAgvsA2zHhM3CLCMjOycjPhQhSMPpScc8LbszJgEL7AAD2NfiSIscFkX+X+JIjxwXDAOLy4rwE0z/6SDAEjkQ0ggr68IDIz4UIE/pSWPoCgRIIzwuKI88LP8+IC7pSIPpSyYAR+wDIz4UI+lKBEgjPC44Syz/PiAu6+lLJgQCC+wDbMeAwf4sIyM7JyM+FCBX6UnHPC24UzMmAUPsAAB290ndqJofSR9JH0AaQBowAI78pl2omh9JBj9JBj9ABjpAGjADwESWkVhqCGOjUpRAAtggRG1YboSCTcFcb34IY6NSlEAABERyhESVWJaBWJcIAjkKCCvrwgG3Ii8e92X3gAAAAAAAAABjPFgERKPoCUuD6UgERJwH6VMnIz4UIVigB+lIBESf6AnHPC2oBESYBzMly+wCSVyXiESUKA/TXLCAAAJAkj2zXLCAAAILMjs3XLCAAAIocjjNXFFcUVxRXFFco+JItxwXy4EkP0z8x+kj6ADAgm8gB+gJAGYEBC/RBmTBQCIEBC/RZMOLjDg4RJg4OEREODhEQDhDvB+MNERERJhERESQREBERERAPERAPEO/jDREkCqipqgDoVxRXFFcUVxRXKA/TTzH6SDAsxwWYKsIAkwqlCt6OVFYlwgCVESWlESXeESSCGOjUpRAAoYIK+vCAghjo1KUQAG3Ii8e92X3gAAAAAAAAAAjPFlj6AlLg+lL6VMnIz4UIVicB+lJY+gJxzwtqzMly+wARJOIE/NcsIAAAiiSPctcsIAAAiiyO49csIAAAijSOWFcUVxRXFFcUVygP0z/TH/pIMPiSAfABARElAaD4l/iS+CdvEFih+C+ggHCCANrAghAJZgGAcPg3tgly+wLIz4UI+lKCENUydtvPC44BESUByz/JgQCC+wDjDuMNBxEkB+MNB6usra4AgDBXE1cTVxNXE1cn+JIsxwXy4rz4ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wAE/lcUVxRXFFcUVyhWIZF/lFYgwwDiERDTPzH6SDD4ku1E0NQx1DHXTNDUMddM0PpI+kgx+kgx9AQx0fgqiIgByMzMz4gAAslwyMt/yW1tbQLI+lT6VPpUyY0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIltB8jDw8TAAfbXLCAAAIpUjjtXFFcUVxRXFFcgVyf4kizHBfLgSQ7TPzH6ANcLHyHCAI4WIPgjvPKxVh74I7yWIBEfvvKxklce4pEw4o6v1ywgAACKZI4gVxRXFFcUVxRXHlcn+JIsxwXy4EkO0z8x1wsPIMIA8rHjDhEcER7iER4RJg6vBNxXFFcUVxRXFFco+JItxwXy4ElWGvLS+VYb8tL5D9M/0x/6SDAhwgDy4sRWJiK+8q8RJiGh7UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHR+CqIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJicPDxLkD/lcUVxRXFFcUVyj4kimBAQv0CvLi7/oA0REQ0z/6APpI+lAwVhMjvvLixVYpI77yr/iX+JNw+Dpx+DkgboFNDiLjBCFugShkWAPjBFAjqIBwggDbiHD4PKABcPg2oAFw+DaggHCCANrAghAJZgGAcPg3oLzysFYTI7rjDxEoIaG7vL0ABBEkA77XLCAAAIpcj0/XLCAAAILUjrBXFFcUVxRXFFcXVyf4kviXUR3HBfLgSYIK+vCAvvKwVhFwIHAjbpdXKFcRVyUw4w7jDhEVESYRFREjESQRIw4RIw4OERUO4w0OESYRHLCxsgHIERLXCz9WKMIAjkWLCCBus5MwiwTfyM+QXjUUZiLPCz8BESr6AlYYzwsJz4FWEAH6UlYQAfpUz4QgAREpAc7JI8jPhQj6UnHPC27MyYBC+wCSVyjiVibCAJVXJ1clMOMNDhEkDrMD4NcsIAAAgtyPZNcsIAAAihSOkjBXE1cTVxNXE1cn+CMqkTrjDY6o1ywgAACMlDGOFFcTVxNXE1cTESfHAPKxDhEmDl4u4w0REREmERFeLuIRFREkERURFREjERUREREVEREREBERERAPERAPDg/jDQ60tbYAjFcUVxRXFFcUVyj4ki3HBfLgSQ/TPzH6ADAgwgDysVYlIb7yr1YbwgCOGVYbtggRG1YboQERJQERG6FWGpNwVxrfESSRMOIAUMjPhQgT+lKBEUbPC44BEScByz8BESUByx9SwPpSyYBC+wARIxEkESMA9lMKoSCCCCeNAKkEIMIAjmc8IIIoBB3ZDsjsAKiCEEooYACpBBy2CVYmtgggwgCOOREmViahbciLx73ZfeAAAAAAAAAACM8WAREo+gJS4PpSAREnAfpUycjPhQhSMPpScc8LbszJgFD7AJEw4gqCCCeNAKkIGqEJkl8D4gH+Vyv4l4IQO5rKALry4r/4kshWKvoCVinPCx9WKM8LB1YnzwsBVibPCgBWJc8KAFYk+gJWI88LH1YizwsPViH6AlYg+gJWH88KAFYezwsDVh3PCxNWHM8LB1YbzwoAVhrPCgBWGc8LCVYYzwsJAREXAcwBERUBzAEREwHMARERAbcBaFcUVxRXFFcUVxdXJw7TP/pIMPiSAfABViCRf5RWH8MA4vLivFYRcCBwI26WVygzVyUw4w64ADjMycjPhQgBERQB+lKBEZPPC44BERMBzMmAQvsAAPhWKMIAjkWLCCBus5MwiwTfyM+QXjUUZibPCz8BESr6AlYYzwsJz4FWEAH6UlYQAfpUz4QgAREpAc7JI8jPhQj6UnHPC27MyYBC+wCSVyjiVibCAI4fyM+FCBP6UoERRs8LjhPLPwERJQHLH1LA+lLJgEL7AJRXJmwh4hEjAvqJbQfI+lIS+lL6UhX0AMlWK8j6UhXMFMzJbW1tyPQAcM8LP8ltyPQAcM8LNMkDyPQAEvQAzMzJyI0FAAAAAAQAAAAAAAAABAFAAAAAgAAEzxYTzBTME8wSzMl4USLIz4PLBM+FoMzM+RaE97ABESgBgAsBESnXJMjPigBAzsS6AEQBEScBy/fPUC7Iz4WIEvpSgRFGzwuOE8s/yx/6UsmAUPsAABhXE/iSUAyBAQv0WTAAKviSERQjocgB+gICAREUAQ2BAQv0QQT67UTQ1DHUMddM0NQx10zQ+kj6SDH6SDH0BDHR+CqIiAHIzMzPiAACyXDIy3/JbW1tAsj6VPpU+lTJjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEiW0HyPpSEvpS+lIV9ADJVhDI+lIVzBTMyW1tbcj0AHDDw8S+AfzPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewHYALUA7XJMjPigBAzhzL989QiwggbrOTMIsE38jPkF41FGYUyz9Y+gJWF88LCc+BUvC/AEr6UgEREgH6VM+EIM7JyM+FiAEREQH6UnHPC24BERABzMmAUPsAAfr6UhL6UvpSFfQAySbI+lIVzBTMyW1tbcj0AHDPCz/Jbcj0AHDPCzTJA8j0ABL0AMzMyciNBQAAAAAEAAAAAAAAAAQBQAAAAIAABM8WE8wUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewE4ALUATXJMjPigBAzhLL989QxwUREMEBtpI/f5MPwwDi8uK8ViXCAJURJaURJd5WJIIY6NSlEAC+jhERJIIY6NSlEAChghjo1KUQAI4eVxmCGOjUpRAAViShAREaAaARGBEjERgRGX8RGXAB4iDCAJEw4w3CAHKCCvrwgPiSyIvHvdl94AAAAAAAAAAIzxZQA/oCUuD6UhL6VMnIz4UIVicB+lJY+gJxzwtqzMly+wAAAABDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAP6+lL6UhX0AMknyPpSFcwUzMltbW3I9ABwzws/yW3I9ABwzws0yQPI9AAS9ADMzMnIjQUAAAAABAAAAAAAAAAEAUAAAACAAATPFhPMFMwTzBLMyXglVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBRET4w/Gx8gABlcSfwAIERLDAAB+8uK8LcIA8uLvDaWCGOjUpRAAyM+QAABIHhPLPx76UlLg+lIB+gLJyM+FiAEREQH6UnHPC24BERABzMmAUPsA');

    static Errors = {
        'Errors.NotOwner': 73,
        'Errors.IncorrectSender': 700,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new DaoProxy(address);
    }

    static fromStorage(emptyStorage: {
        adminAddress: c.Address
        targetAddress?: c.Address /* = address('0:0000000000000000000000000000000000000000000000000000000000000000') */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? DaoProxy.CodeCell,
            data: DaoProxyStore.toCell(DaoProxyStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new DaoProxy(address, initialState);
    }

    static createCellOfInitDaoProxy(body: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }) {
        return InitDaoProxy.toCell(InitDaoProxy.create(body));
    }

    static createCellOfExecuteDaoProposal(body: {
        queryId?: uint64 /* = 0 */
        proposalId: uint64
        proposerOwner: c.Address
        expiresAt: uint32
        walletLibRef: c.Cell
        targetMsg: c.Cell
    }) {
        return ExecuteDaoProposal.toCell(ExecuteDaoProposal.create(body));
    }

    static createCellOfHotUpgrade(body: {
        additionalData: c.Cell | null
        code: c.Cell
    }) {
        return HotUpgrade.toCell(HotUpgrade.create(body));
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

    async sendInitDaoProxy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        targetAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitDaoProxy.toCell(InitDaoProxy.create(body)),
            ...extraOptions
        });
    }

    async sendExecuteDaoProposal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId?: uint64 /* = 0 */
        proposalId: uint64
        proposerOwner: c.Address
        expiresAt: uint32
        walletLibRef: c.Cell
        targetMsg: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ExecuteDaoProposal.toCell(ExecuteDaoProposal.create(body)),
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

    async sendTopUpTons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUpTons.toCell(TopUpTons.create()),
            ...extraOptions
        });
    }

    async getDaoProxyData(provider: ContractProvider): Promise<DaoProxyStore> {
        const r = StackReader.fromGetMethod(2, await provider.get('get_dao_proxy_data', []));
        return ({
            $: 'DaoProxyStore',
            adminAddress: r.readSlice().loadAddress(),
            targetAddress: r.readSlice().loadAddress(),
        });
    }

    async getTargetAddress(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_target_address', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }

    async getAdminAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_admin_address', []));
        return r.readSlice().loadAddress();
    }
}
