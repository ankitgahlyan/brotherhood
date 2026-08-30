// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Location contract in Tolk.
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

    readSnakeString(): string {
        return this.readCell().beginParse().loadStringTail();
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
 > struct (0x00001006) Upgrade {
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
    PREFIX: 0x00001006,

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
        loadAndCheckPrefix32(s, 0x00001006, 'Upgrade');
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
        b.storeUint(0x00001006, 32);
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
 > struct (0x000010a4) LocationAddMember {
 >     queryId: uint64
 >     userAddress: address
 >     sendExcessesTo: address?
 > }
 */
export interface LocationAddMember {
    readonly $: 'LocationAddMember'
    queryId: uint64
    userAddress: c.Address
    sendExcessesTo: c.Address | null
}

export const LocationAddMember = {
    PREFIX: 0x000010a4,

    create(args: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }): LocationAddMember {
        return {
            $: 'LocationAddMember',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationAddMember {
        loadAndCheckPrefix32(s, 0x000010a4, 'LocationAddMember');
        return {
            $: 'LocationAddMember',
            queryId: s.loadUintBig(64),
            userAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationAddMember, b: c.Builder): void {
        b.storeUint(0x000010a4, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.userAddress);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationAddMember): c.Cell {
        return makeCellFrom<LocationAddMember>(self, LocationAddMember.store);
    }
}

/**
 > struct (0x000010a5) LocationRemoveMember {
 >     queryId: uint64
 >     userAddress: address
 >     sendExcessesTo: address?
 > }
 */
export interface LocationRemoveMember {
    readonly $: 'LocationRemoveMember'
    queryId: uint64
    userAddress: c.Address
    sendExcessesTo: c.Address | null
}

export const LocationRemoveMember = {
    PREFIX: 0x000010a5,

    create(args: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }): LocationRemoveMember {
        return {
            $: 'LocationRemoveMember',
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationRemoveMember {
        loadAndCheckPrefix32(s, 0x000010a5, 'LocationRemoveMember');
        return {
            $: 'LocationRemoveMember',
            queryId: s.loadUintBig(64),
            userAddress: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: LocationRemoveMember, b: c.Builder): void {
        b.storeUint(0x000010a5, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.userAddress);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: LocationRemoveMember): c.Cell {
        return makeCellFrom<LocationRemoveMember>(self, LocationRemoveMember.store);
    }
}

/**
 > struct LocationStore {
 >     h3Cell: string
 >     minterAddress: address
 >     memberCount: uint32
 >     members: map<address, bool>
 >     version: uint10
 > }
 */
export interface LocationStore {
    readonly $: 'LocationStore'
    h3Cell: string
    minterAddress: c.Address
    memberCount: uint32 /* = 0 */
    members: c.Dictionary<c.Address, boolean> /* = [] as map<address, bool> */
    version: uint10 /* = 0 */
}

export const LocationStore = {
    create(args: {
        h3Cell: string
        minterAddress: c.Address
        memberCount?: uint32 /* = 0 */
        members: c.Dictionary<c.Address, boolean> /* = [] as map<address, bool> */
        version?: uint10 /* = 0 */
    }): LocationStore {
        return {
            $: 'LocationStore',
            memberCount: 0n,
            version: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): LocationStore {
        return {
            $: 'LocationStore',
            h3Cell: s.loadStringRefTail(),
            minterAddress: s.loadAddress(),
            memberCount: s.loadUintBig(32),
            members: c.Dictionary.load<c.Address, boolean>(c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool(), s),
            version: s.loadUintBig(10),
        }
    },
    store(self: LocationStore, b: c.Builder): void {
        b.storeStringRefTail(self.h3Cell);
        b.storeAddress(self.minterAddress);
        b.storeUint(self.memberCount, 32);
        b.storeDict<c.Address, boolean>(self.members, c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool());
        b.storeUint(self.version, 10);
    },
    toCell(self: LocationStore): c.Cell {
        return makeCellFrom<LocationStore>(self, LocationStore.store);
    }
}

// ————————————————————————————————————————————
//    class Location
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

export class Location implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECEwEAAhMAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASAJCgH31/Ej5IBB2omhqfSRpj/oCa4WEguuWEAAAQpJHL5t8SRHjgvlwJILpn/0kfSgYKYvAgIX6BTfQmMobiq+Cxw9kZ8GgBECAhfoggVICZGYJ/SkJ5Y+JegAJZYTk9qpxELdIrccL5GfChAl9KUEIapk7beeFx2Wf5MAhfYBxQYAQayJmHaiaGp9JGmP+gJphOjSAmRmCf0pZY/6AGWE5PaqQAL+4NcsIAAAhSyOYTb4kiPHBfLgSQXTP/pI+lAwUxeBAQv0Cm+hMY4gB4EBC/RZMCLCAJMCpQLeBMjME/pSyx8S9AASywnJ7VSUNxVfBeIhbpFbjhfIz4UIEvpSghDVMnbbzwuOyz/JgEL7AOLgNFsB1ywgAACAXOMC1ywgAACANAcIADJsIviSWMcF8uBJ9ATXTCD7BNDtHu1T8QkTAHqOMTP4kscF8uBJAdMAMdMJ+kgx9AT0BVEyuWwSjhIhbpExmSH7BAHQ7R7tU+LxCRORW+LgXwOEDwHHAPL0AgEgCwwCASANDgAvu2e+1E0NQx+kgx0x8x9AWBAQv0Cm+hMYACW4GQ7UTQ1DH6SDHTHzH0AdcLCYAA+4sP7UTQ10yAIBIA8QABe25b2omh9JBjrhY/ACASAREgARsis7UTQ+kgwgAB+wqbtRNDUMfpIMdMfMfQFg');

    static Errors = {
        'Errors.NotOwner': 73,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Location(address);
    }

    static fromStorage(emptyStorage: {
        h3Cell: string
        minterAddress: c.Address
        memberCount?: uint32 /* = 0 */
        members: c.Dictionary<c.Address, boolean> /* = [] as map<address, bool> */
        version?: uint10 /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Location.CodeCell,
            data: LocationStore.toCell(LocationStore.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Location(address, initialState);
    }

    static createCellOfLocationAddMember(body: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return LocationAddMember.toCell(LocationAddMember.create(body));
    }

    static createCellOfLocationRemoveMember(body: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return LocationRemoveMember.toCell(LocationRemoveMember.create(body));
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

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendLocationAddMember(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LocationAddMember.toCell(LocationAddMember.create(body)),
            ...extraOptions
        });
    }

    async sendLocationRemoveMember(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        userAddress: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LocationRemoveMember.toCell(LocationRemoveMember.create(body)),
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

    async getVersion(provider: ContractProvider): Promise<uint10> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_version', []));
        return r.readBigInt();
    }

    async getH3Cell(provider: ContractProvider): Promise<string> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_h3_cell', []));
        return r.readSnakeString();
    }

    async getMinterAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_minter_address', []));
        return r.readSlice().loadAddress();
    }

    async getMemberCount(provider: ContractProvider): Promise<uint32> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_member_count', []));
        return r.readBigInt();
    }

    async getIsMember(provider: ContractProvider, userAddress: c.Address): Promise<boolean> {
        const r = StackReader.fromGetMethod(1, await provider.get('is_member', [
            { type: 'slice', cell: makeCellFrom<c.Address>(userAddress,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readBoolean();
    }

    async getMembers(provider: ContractProvider): Promise<c.Dictionary<c.Address, boolean>> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_members', []));
        return r.readDictionary<c.Address, boolean>(c.Dictionary.Keys.Address(), c.Dictionary.Values.Bool());
    }
}
