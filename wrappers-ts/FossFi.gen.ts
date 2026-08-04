// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a FossFi contract in Tolk.
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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
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
type uint256 = bigint

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
 > struct (0x7bdd97de) NotifyMinter {
 >     queryId: uint64
 >     jettonAmount: coins
 >     burnInitiator: address
 >     sendExcessesTo: address?
 > }
 */
export interface NotifyMinter {
    readonly $: 'NotifyMinter'
    queryId: uint64
    jettonAmount: coins
    burnInitiator: c.Address
    sendExcessesTo: c.Address | null
}

export const NotifyMinter = {
    PREFIX: 0x7bdd97de,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }): NotifyMinter {
        return {
            $: 'NotifyMinter',
            ...args
        }
    },
    fromSlice(s: c.Slice): NotifyMinter {
        loadAndCheckPrefix32(s, 0x7bdd97de, 'NotifyMinter');
        return {
            $: 'NotifyMinter',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            burnInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: NotifyMinter, b: c.Builder): void {
        b.storeUint(0x7bdd97de, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.burnInitiator);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: NotifyMinter): c.Cell {
        return makeCellFrom<NotifyMinter>(self, NotifyMinter.store);
    }
}

/**
 > struct (0x2c76b973) RequestWalletAddress {
 >     queryId: uint64
 >     owner: address
 >     includeOwnerAddress: bool
 > }
 */
export interface RequestWalletAddress {
    readonly $: 'RequestWalletAddress'
    queryId: uint64
    owner: c.Address
    includeOwnerAddress: boolean
}

export const RequestWalletAddress = {
    PREFIX: 0x2c76b973,

    create(args: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }): RequestWalletAddress {
        return {
            $: 'RequestWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestWalletAddress {
        loadAndCheckPrefix32(s, 0x2c76b973, 'RequestWalletAddress');
        return {
            $: 'RequestWalletAddress',
            queryId: s.loadUintBig(64),
            owner: s.loadAddress(),
            includeOwnerAddress: s.loadBoolean(),
        }
    },
    store(self: RequestWalletAddress, b: c.Builder): void {
        b.storeUint(0x2c76b973, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.owner);
        b.storeBit(self.includeOwnerAddress);
    },
    toCell(self: RequestWalletAddress): c.Cell {
        return makeCellFrom<RequestWalletAddress>(self, RequestWalletAddress.store);
    }
}

/**
 > struct (0xd1735400) ResponseWalletAddress {
 >     queryId: uint64
 >     jettonWalletAddress: address?
 >     owner: Cell<address>?
 > }
 */
export interface ResponseWalletAddress {
    readonly $: 'ResponseWalletAddress'
    queryId: uint64
    jettonWalletAddress: c.Address | null
    owner: CellRef<c.Address> | null
}

export const ResponseWalletAddress = {
    PREFIX: 0xd1735400,

    create(args: {
        queryId: uint64
        jettonWalletAddress: c.Address | null
        owner: CellRef<c.Address> | null
    }): ResponseWalletAddress {
        return {
            $: 'ResponseWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResponseWalletAddress {
        loadAndCheckPrefix32(s, 0xd1735400, 'ResponseWalletAddress');
        return {
            $: 'ResponseWalletAddress',
            queryId: s.loadUintBig(64),
            jettonWalletAddress: s.loadMaybeAddress(),
            owner: s.loadBoolean() ? loadCellRef<c.Address>(s,
                (s) => s.loadAddress()
            ) : null,
        }
    },
    store(self: ResponseWalletAddress, b: c.Builder): void {
        b.storeUint(0xd1735400, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.jettonWalletAddress);
        storeTolkNullable<CellRef<c.Address>>(self.owner, b,
            (v,b) => { storeCellRef<c.Address>(v, b,
                (v,b) => b.storeAddress(v)
            ); }
        );
    },
    toCell(self: ResponseWalletAddress): c.Cell {
        return makeCellFrom<ResponseWalletAddress>(self, ResponseWalletAddress.store);
    }
}

/**
 > struct (0x642b7d07) MintNewJettons {
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
    PREFIX: 0x642b7d07,

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
        loadAndCheckPrefix32(s, 0x642b7d07, 'MintNewJettons');
        return {
            $: 'MintNewJettons',
            queryId: s.loadUintBig(64),
            mintRecipient: s.loadAddress(),
            tonAmount: s.loadCoins(),
            internalTransferMsg: loadCellRef<InternalTransferStep>(s, InternalTransferStep.fromSlice),
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x642b7d07, 32);
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
 > struct (0x6501f354) ChangeMinterAdmin {
 >     queryId: uint64
 >     newAdminAddress: address
 > }
 */
export interface ChangeMinterAdmin {
    readonly $: 'ChangeMinterAdmin'
    queryId: uint64
    newAdminAddress: c.Address
}

export const ChangeMinterAdmin = {
    PREFIX: 0x6501f354,

    create(args: {
        queryId: uint64
        newAdminAddress: c.Address
    }): ChangeMinterAdmin {
        return {
            $: 'ChangeMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterAdmin {
        loadAndCheckPrefix32(s, 0x6501f354, 'ChangeMinterAdmin');
        return {
            $: 'ChangeMinterAdmin',
            queryId: s.loadUintBig(64),
            newAdminAddress: s.loadAddress(),
        }
    },
    store(self: ChangeMinterAdmin, b: c.Builder): void {
        b.storeUint(0x6501f354, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newAdminAddress);
    },
    toCell(self: ChangeMinterAdmin): c.Cell {
        return makeCellFrom<ChangeMinterAdmin>(self, ChangeMinterAdmin.store);
    }
}

/**
 > struct (0x2508d66a) Upgrade {
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
    PREFIX: 0x2508d66a,

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
        loadAndCheckPrefix32(s, 0x2508d66a, 'Upgrade');
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
        b.storeUint(0x2508d66a, 32);
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
 > struct (0xcb862902) ChangeMinterMetadata {
 >     queryId: uint64
 >     newMetadata: cell
 > }
 */
export interface ChangeMinterMetadata {
    readonly $: 'ChangeMinterMetadata'
    queryId: uint64
    newMetadata: c.Cell
}

export const ChangeMinterMetadata = {
    PREFIX: 0xcb862902,

    create(args: {
        queryId: uint64
        newMetadata: c.Cell
    }): ChangeMinterMetadata {
        return {
            $: 'ChangeMinterMetadata',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterMetadata {
        loadAndCheckPrefix32(s, 0xcb862902, 'ChangeMinterMetadata');
        return {
            $: 'ChangeMinterMetadata',
            queryId: s.loadUintBig(64),
            newMetadata: s.loadRef(),
        }
    },
    store(self: ChangeMinterMetadata, b: c.Builder): void {
        b.storeUint(0xcb862902, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.newMetadata);
    },
    toCell(self: ChangeMinterMetadata): c.Cell {
        return makeCellFrom<ChangeMinterMetadata>(self, ChangeMinterMetadata.store);
    }
}

/**
 > struct (0xd372158c) TopUpTons {
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
}

export const TopUpTons = {
    PREFIX: 0xd372158c,

    create(): TopUpTons {
        return {
            $: 'TopUpTons',
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0xd372158c, 'TopUpTons');
        return {
            $: 'TopUpTons',
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0xd372158c, 32);
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

/**
 > struct (0x00000004) InformMinterInviteInternal {
 >     queryId: uint64
 >     sender: address
 >     invitor: address
 >     id: string
 > }
 */
export interface InformMinterInviteInternal {
    readonly $: 'InformMinterInviteInternal'
    queryId: uint64
    sender: c.Address
    invitor: c.Address
    id: string
}

export const InformMinterInviteInternal = {
    PREFIX: 0x00000004,

    create(args: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        id: string
    }): InformMinterInviteInternal {
        return {
            $: 'InformMinterInviteInternal',
            ...args
        }
    },
    fromSlice(s: c.Slice): InformMinterInviteInternal {
        loadAndCheckPrefix32(s, 0x00000004, 'InformMinterInviteInternal');
        return {
            $: 'InformMinterInviteInternal',
            queryId: s.loadUintBig(64),
            sender: s.loadAddress(),
            invitor: s.loadAddress(),
            id: s.loadStringRefTail(),
        }
    },
    store(self: InformMinterInviteInternal, b: c.Builder): void {
        b.storeUint(0x00000004, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.sender);
        b.storeAddress(self.invitor);
        b.storeStringRefTail(self.id);
    },
    toCell(self: InformMinterInviteInternal): c.Cell {
        return makeCellFrom<InformMinterInviteInternal>(self, InformMinterInviteInternal.store);
    }
}

/**
 > struct (0x00000010) RequestUpgradeCode {
 >     sender: address
 >     version: uint10
 > }
 */
export interface RequestUpgradeCode {
    readonly $: 'RequestUpgradeCode'
    sender: c.Address
    version: uint10
}

export const RequestUpgradeCode = {
    PREFIX: 0x00000010,

    create(args: {
        sender: c.Address
        version: uint10
    }): RequestUpgradeCode {
        return {
            $: 'RequestUpgradeCode',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestUpgradeCode {
        loadAndCheckPrefix32(s, 0x00000010, 'RequestUpgradeCode');
        return {
            $: 'RequestUpgradeCode',
            sender: s.loadAddress(),
            version: s.loadUintBig(10),
        }
    },
    store(self: RequestUpgradeCode, b: c.Builder): void {
        b.storeUint(0x00000010, 32);
        b.storeAddress(self.sender);
        b.storeUint(self.version, 10);
    },
    toCell(self: RequestUpgradeCode): c.Cell {
        return makeCellFrom<RequestUpgradeCode>(self, RequestUpgradeCode.store);
    }
}

/**
 > struct (0x00000011) ApproveUpgrade {
 > }
 */
export interface ApproveUpgrade {
    readonly $: 'ApproveUpgrade'
}

export const ApproveUpgrade = {
    PREFIX: 0x00000011,

    create(): ApproveUpgrade {
        return {
            $: 'ApproveUpgrade',
        }
    },
    fromSlice(s: c.Slice): ApproveUpgrade {
        loadAndCheckPrefix32(s, 0x00000011, 'ApproveUpgrade');
        return {
            $: 'ApproveUpgrade',
        }
    },
    store(self: ApproveUpgrade, b: c.Builder): void {
        b.storeUint(0x00000011, 32);
    },
    toCell(self: ApproveUpgrade): c.Cell {
        return makeCellFrom<ApproveUpgrade>(self, ApproveUpgrade.store);
    }
}

/**
 > struct (0x00000012) RejectUpgrade {
 > }
 */
export interface RejectUpgrade {
    readonly $: 'RejectUpgrade'
}

export const RejectUpgrade = {
    PREFIX: 0x00000012,

    create(): RejectUpgrade {
        return {
            $: 'RejectUpgrade',
        }
    },
    fromSlice(s: c.Slice): RejectUpgrade {
        loadAndCheckPrefix32(s, 0x00000012, 'RejectUpgrade');
        return {
            $: 'RejectUpgrade',
        }
    },
    store(self: RejectUpgrade, b: c.Builder): void {
        b.storeUint(0x00000012, 32);
    },
    toCell(self: RejectUpgrade): c.Cell {
        return makeCellFrom<RejectUpgrade>(self, RejectUpgrade.store);
    }
}

/**
 > struct (0x00000013) HotUpgrade {
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
    PREFIX: 0x00000013,

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
        loadAndCheckPrefix32(s, 0x00000013, 'HotUpgrade');
        return {
            $: 'HotUpgrade',
            additionalData: s.loadBoolean() ? s.loadRef() : null,
            code: s.loadRef(),
        }
    },
    store(self: HotUpgrade, b: c.Builder): void {
        b.storeUint(0x00000013, 32);
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
 > struct (0x00000014) Destroy {
 > }
 */
export interface Destroy {
    readonly $: 'Destroy'
}

export const Destroy = {
    PREFIX: 0x00000014,

    create(): Destroy {
        return {
            $: 'Destroy',
        }
    },
    fromSlice(s: c.Slice): Destroy {
        loadAndCheckPrefix32(s, 0x00000014, 'Destroy');
        return {
            $: 'Destroy',
        }
    },
    store(self: Destroy, b: c.Builder): void {
        b.storeUint(0x00000014, 32);
    },
    toCell(self: Destroy): c.Cell {
        return makeCellFrom<Destroy>(self, Destroy.store);
    }
}

/**
 > struct CurrentRequest {
 >     newUpgrade: Upgrade
 >     timestamp: uint32
 > }
 */
export interface CurrentRequest {
    readonly $: 'CurrentRequest'
    newUpgrade: Upgrade
    timestamp: uint32
}

export const CurrentRequest = {
    create(args: {
        newUpgrade: Upgrade
        timestamp: uint32
    }): CurrentRequest {
        return {
            $: 'CurrentRequest',
            ...args
        }
    },
    fromSlice(s: c.Slice): CurrentRequest {
        return {
            $: 'CurrentRequest',
            newUpgrade: Upgrade.fromSlice(s),
            timestamp: s.loadUintBig(32),
        }
    },
    store(self: CurrentRequest, b: c.Builder): void {
        Upgrade.store(self.newUpgrade, b);
        b.storeUint(self.timestamp, 32);
    },
    toCell(self: CurrentRequest): c.Cell {
        return makeCellFrom<CurrentRequest>(self, CurrentRequest.store);
    }
}

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
 > struct FiCodes {
 >     totalAccounts: uint33
 >     lotteryCode: cell?
 >     latestFiWalletCode: cell?
 >     c: cell?
 >     d: cell?
 > }
 */
export interface FiCodes {
    readonly $: 'FiCodes'
    totalAccounts: uint33 /* = 0 */
    lotteryCode: c.Cell | null /* = null */
    latestFiWalletCode: c.Cell | null /* = null */
    c: c.Cell | null /* = null */
    d: c.Cell | null /* = null */
}

export const FiCodes = {
    create(args: {
        totalAccounts?: uint33 /* = 0 */
        lotteryCode?: c.Cell | null /* = null */
        latestFiWalletCode?: c.Cell | null /* = null */
        c?: c.Cell | null /* = null */
        d?: c.Cell | null /* = null */
    }): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: 0n,
            lotteryCode: null,
            latestFiWalletCode: null,
            c: null,
            d: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiCodes {
        return {
            $: 'FiCodes',
            totalAccounts: s.loadUintBig(33),
            lotteryCode: s.loadBoolean() ? s.loadRef() : null,
            latestFiWalletCode: s.loadBoolean() ? s.loadRef() : null,
            c: s.loadBoolean() ? s.loadRef() : null,
            d: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: FiCodes, b: c.Builder): void {
        b.storeUint(self.totalAccounts, 33);
        storeTolkNullable<c.Cell>(self.lotteryCode, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<c.Cell>(self.latestFiWalletCode, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<c.Cell>(self.c, b,
            (v,b) => b.storeRef(v)
        );
        storeTolkNullable<c.Cell>(self.d, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: FiCodes): c.Cell {
        return makeCellFrom<FiCodes>(self, FiCodes.store);
    }
}

/**
 > struct FiStore {
 >     totalSupply: coins
 >     walletVersion: uint10
 >     adminAddress: address
 >     nextAdminAddress: address?
 >     currentRequest: CurrentRequest?
 >     metadata: cell
 >     others: Cell<FiCodes>
 > }
 */
export interface FiStore {
    readonly $: 'FiStore'
    totalSupply: coins /* = 0 */
    walletVersion: uint10 /* = 0 */
    adminAddress: c.Address
    nextAdminAddress: c.Address | null /* = null */
    currentRequest: CurrentRequest | null /* = null */
    metadata: c.Cell
    others: CellRef<FiCodes>
}

export const FiStore = {
    create(args: {
        totalSupply?: coins /* = 0 */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        nextAdminAddress?: c.Address | null /* = null */
        currentRequest?: CurrentRequest | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }): FiStore {
        return {
            $: 'FiStore',
            totalSupply: 0n,
            walletVersion: 0n,
            nextAdminAddress: null,
            currentRequest: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): FiStore {
        return {
            $: 'FiStore',
            totalSupply: s.loadCoins(),
            walletVersion: s.loadUintBig(10),
            adminAddress: s.loadAddress(),
            nextAdminAddress: s.loadMaybeAddress(),
            currentRequest: s.loadBoolean() ? CurrentRequest.fromSlice(s) : null,
            metadata: s.loadRef(),
            others: loadCellRef<FiCodes>(s, FiCodes.fromSlice),
        }
    },
    store(self: FiStore, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        b.storeUint(self.walletVersion, 10);
        b.storeAddress(self.adminAddress);
        b.storeAddress(self.nextAdminAddress);
        storeTolkNullable<CurrentRequest>(self.currentRequest, b, CurrentRequest.store);
        b.storeRef(self.metadata);
        storeCellRef<FiCodes>(self.others, b, FiCodes.store);
    },
    toCell(self: FiStore): c.Cell {
        return makeCellFrom<FiStore>(self, FiStore.store);
    }
}

/**
 > struct JettonDataReply {
 >     totalSupply: int
 >     mintable: bool
 >     adminAddress: address?
 >     jettonContent: Cell<OnchainMetadataReply>
 >     jettonWalletCode: cell
 > }
 */
export interface JettonDataReply {
    readonly $: 'JettonDataReply'
    totalSupply: bigint
    mintable: boolean
    adminAddress: c.Address | null
    jettonContent: CellRef<OnchainMetadataReply>
    jettonWalletCode: c.Cell
}

export const JettonDataReply = {
    create(args: {
        totalSupply: bigint
        mintable: boolean
        adminAddress: c.Address | null
        jettonContent: CellRef<OnchainMetadataReply>
        jettonWalletCode: c.Cell
    }): JettonDataReply {
        return {
            $: 'JettonDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): JettonDataReply {
        throw new Error(`Can't unpack 'JettonDataReply' from cell, because 'JettonDataReply.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: JettonDataReply, b: c.Builder): void {
        throw new Error(`Can't pack 'JettonDataReply' to cell, because 'self.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: JettonDataReply): c.Cell {
        return makeCellFrom<JettonDataReply>(self, JettonDataReply.store);
    }
}

/**
 > struct (0x00) OnchainMetadataReply {
 >     contentDict: map<uint256, string_prefixed0x>
 > }
 */
export interface OnchainMetadataReply {
    readonly $: 'OnchainMetadataReply'
    contentDict: c.Dictionary<uint256, string_prefixed0x>
}

export const OnchainMetadataReply = {
    PREFIX: 0x00,

    create(args: {
        contentDict: c.Dictionary<uint256, string_prefixed0x>
    }): OnchainMetadataReply {
        return {
            $: 'OnchainMetadataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): OnchainMetadataReply {
        loadAndCheckPrefix(s, 0x00, 8, 'OnchainMetadataReply');
        return {
            $: 'OnchainMetadataReply',
            contentDict: c.Dictionary.load<uint256, string_prefixed0x>(c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store), s),
        }
    },
    store(self: OnchainMetadataReply, b: c.Builder): void {
        b.storeUint(0x00, 8);
        b.storeDict<uint256, string_prefixed0x>(self.contentDict, c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store));
    },
    toCell(self: OnchainMetadataReply): c.Cell {
        return makeCellFrom<OnchainMetadataReply>(self, OnchainMetadataReply.store);
    }
}

/**
 > type string_prefixed0x = string
 */
export type string_prefixed0x = string

export const string_prefixed0x = {
    fromSlice(s: c.Slice): string_prefixed0x {
        return s.loadStringRefTail();
    },
    store(self: string_prefixed0x, b: c.Builder): void {
        b.storeStringRefTail(self);
    },
    toCell(self: string_prefixed0x): c.Cell {
        return makeCellFrom<string_prefixed0x>(self, string_prefixed0x.store);
    }
}

// ————————————————————————————————————————————
//    class FossFi
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

export class FossFi implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidOp': 72,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
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
        return new FossFi(address);
    }

    static fromStorage(emptyStorage: {
        totalSupply?: coins /* = 0 */
        walletVersion?: uint10 /* = 0 */
        adminAddress: c.Address
        nextAdminAddress?: c.Address | null /* = null */
        currentRequest?: CurrentRequest | null /* = null */
        metadata: c.Cell
        others: CellRef<FiCodes>
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FossFi.CodeCell,
            data: FiStore.toCell(FiStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FossFi(address, initialState);
    }

    static createCellOfMintNewJettons(body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }) {
        return MintNewJettons.toCell(MintNewJettons.create(body));
    }

    static createCellOfNotifyMinter(body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return NotifyMinter.toCell(NotifyMinter.create(body));
    }

    static createCellOfRequestWalletAddress(body: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }) {
        return RequestWalletAddress.toCell(RequestWalletAddress.create(body));
    }

    static createCellOfChangeMinterAdmin(body: {
        queryId: uint64
        newAdminAddress: c.Address
    }) {
        return ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body));
    }

    static createCellOfChangeMinterMetadata(body: {
        queryId: uint64
        newMetadata: c.Cell
    }) {
        return ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body));
    }

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    static createCellOfInformMinterInviteInternal(body: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        id: string
    }) {
        return InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body));
    }

    static createCellOfRequestUpgradeCode(body: {
        sender: c.Address
        version: uint10
    }) {
        return RequestUpgradeCode.toCell(RequestUpgradeCode.create(body));
    }

    static createCellOfEnterLottery(body: {
        sender: c.Address
        amount: coins
    }) {
        return EnterLottery.toCell(EnterLottery.create(body));
    }

    static createCellOfLotteryWin(body: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }) {
        return LotteryWin.toCell(LotteryWin.create(body));
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

    static createCellOfRejectUpgrade(body: {
    }) {
        return RejectUpgrade.toCell(RejectUpgrade.create());
    }

    static createCellOfApproveUpgrade(body: {
    }) {
        return ApproveUpgrade.toCell(ApproveUpgrade.create());
    }

    static createCellOfDestroy(body: {
    }) {
        return Destroy.toCell(Destroy.create());
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendMintNewJettons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintNewJettons.toCell(MintNewJettons.create(body)),
            ...extraOptions
        });
    }

    async sendNotifyMinter(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: NotifyMinter.toCell(NotifyMinter.create(body)),
            ...extraOptions
        });
    }

    async sendRequestWalletAddress(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        owner: c.Address
        includeOwnerAddress: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestWalletAddress.toCell(RequestWalletAddress.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newAdminAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMinterMetadata(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newMetadata: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body)),
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

    async sendInformMinterInviteInternal(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        sender: c.Address
        invitor: c.Address
        id: string
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InformMinterInviteInternal.toCell(InformMinterInviteInternal.create(body)),
            ...extraOptions
        });
    }

    async sendRequestUpgradeCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        sender: c.Address
        version: uint10
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestUpgradeCode.toCell(RequestUpgradeCode.create(body)),
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

    async sendLotteryWin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        entryAmount: coins
        amt: coins
        winner: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LotteryWin.toCell(LotteryWin.create(body)),
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

    async sendRejectUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RejectUpgrade.toCell(RejectUpgrade.create()),
            ...extraOptions
        });
    }

    async sendApproveUpgrade(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ApproveUpgrade.toCell(ApproveUpgrade.create()),
            ...extraOptions
        });
    }

    async sendDestroy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Destroy.toCell(Destroy.create()),
            ...extraOptions
        });
    }

    async getJettonData(provider: ContractProvider): Promise<JettonDataReply> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_jetton_data', []));
        return ({
            $: 'JettonDataReply',
            totalSupply: r.readBigInt(),
            mintable: r.readBoolean(),
            adminAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            jettonContent: r.readCellRef<OnchainMetadataReply>(OnchainMetadataReply.fromSlice),
            jettonWalletCode: r.readCell(),
        });
    }

    async getJettonDataAll(provider: ContractProvider): Promise<FiStore> {
        const r = StackReader.fromGetMethod(13, await provider.get('get_jetton_data_all', []));
        return ({
            $: 'FiStore',
            totalSupply: r.readBigInt(),
            walletVersion: r.readBigInt(),
            adminAddress: r.readSlice().loadAddress(),
            nextAdminAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            currentRequest: r.readWideNullable<CurrentRequest>(7,
                (r) => ({
                    $: 'CurrentRequest',
                    newUpgrade: ({
                        $: 'Upgrade',
                        walletUpgrade: r.readBoolean(),
                        walletVersion: r.readBigInt(),
                        sender: r.readSlice().loadAddress(),
                        newData: r.readNullable<c.Cell>(
                            (r) => r.readCell()
                        ),
                        newCode: r.readNullable<c.Cell>(
                            (r) => r.readCell()
                        ),
                    }),
                    timestamp: r.readBigInt(),
                })
            ),
            metadata: r.readCell(),
            others: r.readCellRef<FiCodes>(FiCodes.fromSlice),
        });
    }

    async getWalletAddress(provider: ContractProvider, owner: c.Address): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_wallet_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(owner,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readSlice().loadAddress();
    }
}
