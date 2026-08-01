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
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.IncorrectSender': 700,
        'Errors.IncorrectReceiver': 708,
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
