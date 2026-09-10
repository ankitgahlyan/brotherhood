/**
 * Contract Getter TVM Stack Decoder
 * Decodes raw Toncenter/TonAPI TVM stacks into named Tolk wrapper structs
 */

import {
  Address,
  Cell,
  type TupleItem,
  type TupleItemInt,
  type Slice,
} from '@ton/core';

// Helper types for Tolk generated wrappers
type LoadCallback<T> = (s: Slice) => T;

export interface CellRef<T> {
  ref: T;
}

export class StackReader {
  constructor(private tuple: TupleItem[]) {}

  static fromStack(expectedN: number | null, tuple: TupleItem[]): StackReader {
    const cloned = [...tuple];
    if (expectedN !== null && cloned.length !== expectedN) {
      throw new Error(
        `expected ${expectedN} stack width, got ${cloned.length}`,
      );
    }
    return new StackReader(cloned);
  }

  private popExpecting<ItemT>(itemType: string): ItemT {
    const item = this.tuple.shift();
    if (item?.type === itemType) {
      return item as ItemT;
    }
    throw new Error(`not '${itemType}' on a stack`);
  }

  private popCellLike(): Cell {
    const item = this.tuple.shift();
    if (
      item &&
      (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')
    ) {
      return item.cell;
    }
    throw new Error(`not cell/slice on a stack`);
  }

  readBigInt(): bigint {
    return this.popExpecting<TupleItemInt>('int').value;
  }

  readBoolean(): boolean {
    return this.popExpecting<TupleItemInt>('int').value !== 0n;
  }

  readCell(): Cell {
    return this.popCellLike();
  }

  readSlice(): Slice {
    return this.popCellLike().beginParse();
  }

  readSnakeString(): string {
    try {
      return this.readCell().beginParse().loadStringTail();
    } catch {
      return '';
    }
  }

  readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
    if (this.tuple.length > 0 && this.tuple[0].type === 'null') {
      this.tuple.shift();
      return null;
    }
    return readFn_T(this);
  }

  readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
    return { ref: loadFn_T(this.readCell().beginParse()) };
  }
}

// Parse RawStackItem list into TonCore TupleItem list
export function parseRawStack(stack: unknown[]): TupleItem[] {
  const result: TupleItem[] = [];

  for (const item of stack) {
    if (!item || typeof item !== 'object') continue;

    const raw = item as Record<string, unknown>;
    const type = raw.type;

    if (type === 'num') {
      const valStr = String(raw.value ?? '0');
      let val: bigint;
      if (valStr.startsWith('-0x') || valStr.startsWith('-0X')) {
        val = -BigInt(valStr.slice(1));
      } else if (valStr.startsWith('0x') || valStr.startsWith('0X')) {
        val = BigInt(valStr);
      } else if (valStr.startsWith('-')) {
        val = -BigInt(valStr.slice(1));
      } else {
        val = BigInt(valStr);
      }
      result.push({ type: 'int', value: val });
    } else if (type === 'null') {
      result.push({ type: 'null' });
    } else if (type === 'cell' || type === 'slice' || type === 'builder') {
      try {
        const bocBuffer = Buffer.from(String(raw.value ?? ''), 'base64');
        const cell = Cell.fromBoc(bocBuffer)[0];
        result.push({
          type: type as 'cell' | 'slice' | 'builder',
          cell,
        });
      } catch {
        result.push({ type: 'null' });
      }
    } else if (type === 'tuple' || type === 'list') {
      if (Array.isArray(raw.value)) {
        result.push({
          type: 'tuple',
          items: parseRawStack(raw.value),
        });
      } else {
        result.push({ type: 'null' });
      }
    } else if ('@type' in raw && raw['@type'] === 'tvm.stackEntryNumber') {
      // Toncenter v2 legacy format
      const entryNum = raw.number as Record<string, unknown>;
      const numVal = entryNum?.number ? String(entryNum.number) : '0';
      result.push({ type: 'int', value: BigInt(numVal) });
    } else if ('@type' in raw && raw['@type'] === 'tvm.stackEntryCell') {
      try {
        const entryCell = raw.cell as Record<string, unknown>;
        const bytes = String(entryCell?.bytes ?? '');
        const cell = Cell.fromBoc(Buffer.from(bytes, 'base64'))[0];
        result.push({ type: 'cell', cell });
      } catch {
        result.push({ type: 'null' });
      }
    } else if ('@type' in raw && raw['@type'] === 'tvm.stackEntryTuple') {
      const entryTuple = raw.tuple as Record<string, unknown>;
      if (Array.isArray(entryTuple?.elements)) {
        result.push({
          type: 'tuple',
          items: parseRawStack(entryTuple.elements),
        });
      } else {
        result.push({ type: 'null' });
      }
    }
  }

  return result;
}

// Convert complex structures, Address, BigInt, and Cell into JSON-serializable primitives
export function sanitizeForJson(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (obj instanceof Address) {
    return obj.toString();
  }

  if (obj instanceof Cell) {
    return `Cell<${obj.toBoc().toString('base64').slice(0, 16)}...> (${obj.bits.length}b, ${obj.refs.length}r)`;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJson);
  }

  if (typeof obj === 'object') {
    // Check if it's a Dictionary
    if ('values' in obj && typeof (obj as any).values === 'function') {
      try {
        const dict = obj as any;
        const keys = dict.keys();
        const dictObj: Record<string, unknown> = {};
        for (const k of keys) {
          const val = dict.get(k);
          const keyStr = k instanceof Address ? k.toString() : String(k);
          dictObj[keyStr] = sanitizeForJson(val);
        }
        return dictObj;
      } catch {
        // Fallback to regular serialization
      }
    }

    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeForJson(v);
    }
    return res;
  }

  return obj;
}

// Registry of getter decoders matching known contracts
export function decodeContractGetter(
  methodName: string,
  tuple: TupleItem[],
): { structName: string; data: unknown } | null {
  const n = tuple.length;

  try {
    switch (methodName) {
      // 1. Personal Minter: get_state (4 items)
      case 'get_state': {
        if (n === 4) {
          const r = StackReader.fromStack(4, tuple);
          return {
            structName: 'PersonalStore',
            data: sanitizeForJson({
              $: 'PersonalStore',
              totalSupply: r.readBigInt(),
              fiJettonAddress: r.readSlice().loadAddress(),
              adminAddress: r.readSlice().loadAddress(),
              metadataUri: r.readNullable((r2) => r2.readCell()),
            }),
          };
        }
        break;
      }

      // 2. Jetton Data: get_jetton_data (5 items)
      case 'get_jetton_data': {
        if (n === 5) {
          const r = StackReader.fromStack(5, tuple);
          const totalSupply = r.readBigInt();
          const mintable = r.readBoolean();
          const adminAddress = r.readNullable((r2) =>
            r2.readSlice().loadAddress(),
          );
          const jettonContentCell = r.readCell();
          const jettonWalletCode = r.readCell();

          return {
            structName: 'JettonDataReply',
            data: sanitizeForJson({
              $: 'JettonDataReply',
              totalSupply,
              mintable,
              adminAddress,
              jettonContentCell,
              jettonWalletCode,
            }),
          };
        }
        break;
      }

      // 3. Wallet Address: get_wallet_address (1 item)
      case 'get_wallet_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'WalletAddressReply',
            data: sanitizeForJson({
              $: 'WalletAddressReply',
              walletAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      // 4. Personal Wallet: get_personal_wallet_state (4 items)
      case 'get_personal_wallet_state': {
        if (n === 4) {
          const r = StackReader.fromStack(4, tuple);
          return {
            structName: 'PersonalWalletStore',
            data: sanitizeForJson({
              $: 'PersonalWalletStore',
              jettonBalance: r.readBigInt(),
              owner: r.readSlice().loadAddress(),
              deployer: r.readSlice().loadAddress(),
              minterAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      // 5. Standard Jetton Wallet Data: get_wallet_data (4 items)
      case 'get_wallet_data': {
        if (n === 4) {
          const r = StackReader.fromStack(4, tuple);
          return {
            structName: 'JettonWalletDataReply',
            data: sanitizeForJson({
              $: 'JettonWalletDataReply',
              jettonBalance: r.readBigInt(),
              ownerAddress: r.readSlice().loadAddress(),
              minterAddress: r.readSlice().loadAddress(),
              jettonWalletCode: r.readCell(),
            }),
          };
        }
        break;
      }

      // 6. FossFi Minter: get_jetton_data_all (8 items)
      case 'get_jetton_data_all': {
        if (n === 8) {
          const r = StackReader.fromStack(8, tuple);
          return {
            structName: 'FiStore',
            data: sanitizeForJson({
              $: 'FiStore',
              totalSupply: r.readBigInt(),
              offChainRulesHash: r.readSnakeString(),
              walletVersion: r.readBigInt(),
              adminAddress: r.readSlice().loadAddress(),
              daoAddress: r.readSlice().loadAddress(),
              adminHandoff: r.readNullable((r2) => r2.readCell()),
              metadata: r.readCell(),
              others: r.readCell(),
            }),
          };
        }
        break;
      }

      // 7. FossFi Minter: get_total_accounts (1 item)
      case 'get_total_accounts': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'TotalAccountsReply',
            data: sanitizeForJson({
              $: 'TotalAccountsReply',
              totalAccounts: r.readBigInt(),
            }),
          };
        }
        break;
      }

      // 8. FossFi Minter: get_dao_address (1 item)
      case 'get_dao_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'DaoAddressReply',
            data: sanitizeForJson({
              $: 'DaoAddressReply',
              daoAddress: r.readNullable((r2) => r2.readSlice().loadAddress()),
            }),
          };
        }
        break;
      }

      // 9. FossFi Wallet: get_wallet_data_all (23 items)
      case 'get_wallet_data_all': {
        if (n === 23) {
          const r = StackReader.fromStack(23, tuple);
          return {
            structName: 'FiWalletStore',
            data: sanitizeForJson({
              $: 'FiWalletStore',
              jettonBalance: r.readBigInt(),
              goldCoins: r.readBigInt(),
              txnCount: r.readBigInt(),
              status: r.readBigInt(),
              isAuthorityAccount: r.readBoolean(),
              isPrevilegedAccount: r.readBoolean(),
              creditNeed: r.readBigInt(),
              creditMaturity: r.readBigInt(),
              multiplier: r.readBigInt(),
              accumulatedFees: r.readBigInt(),
              debt: r.readBigInt(),
              debts: r.readBoolean(),
              votes: r.readBigInt(),
              receivedVotes: r.readBigInt(),
              connections: r.readBigInt(),
              active: r.readBoolean(),
              mintable: r.readBoolean(),
              version: r.readBigInt(),
              storeVersion: r.readBigInt(),
              profileCell: r.readCell(),
              timestampsCell: r.readCell(),
              addressesCell: r.readCell(),
              mapsCell: r.readCell(),
            }),
          };
        }
        break;
      }

      // 10. FossFi Wallet: get_username (1 item)
      case 'get_username': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'UsernameReply',
            data: sanitizeForJson({
              $: 'UsernameReply',
              username: r.readSnakeString(),
            }),
          };
        }
        break;
      }

      // 11. FossFi Wallet: get_h3_cell (1 item)
      case 'get_h3_cell': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'H3CellReply',
            data: sanitizeForJson({
              $: 'H3CellReply',
              h3Cell: r.readSnakeString(),
            }),
          };
        }
        break;
      }

      // 12. FossFi Wallet: get_profile (3 items)
      case 'get_profile': {
        if (n === 3) {
          const r = StackReader.fromStack(3, tuple);
          return {
            structName: 'ProfileReply',
            data: sanitizeForJson({
              $: 'ProfileReply',
              username: r.readSnakeString(),
              h3Cell: r.readSnakeString(),
              country: r.readBigInt(),
            }),
          };
        }
        break;
      }

      // 13. Following / Followers Count (1 item)
      case 'get_following_count': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'FollowingCountReply',
            data: sanitizeForJson({
              $: 'FollowingCountReply',
              followingCount: r.readBigInt(),
            }),
          };
        }
        break;
      }

      case 'get_followers_count': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'FollowersCountReply',
            data: sanitizeForJson({
              $: 'FollowersCountReply',
              followersCount: r.readBigInt(),
            }),
          };
        }
        break;
      }

      // 14. DaoProxy: get_dao_proxy_data (2 items)
      case 'get_dao_proxy_data': {
        if (n === 2) {
          const r = StackReader.fromStack(2, tuple);
          return {
            structName: 'DaoProxyStore',
            data: sanitizeForJson({
              $: 'DaoProxyStore',
              adminAddress: r.readSlice().loadAddress(),
              targetAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      case 'get_target_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'TargetAddressReply',
            data: sanitizeForJson({
              $: 'TargetAddressReply',
              targetAddress: r.readNullable((r2) =>
                r2.readSlice().loadAddress(),
              ),
            }),
          };
        }
        break;
      }

      case 'get_admin_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'AdminAddressReply',
            data: sanitizeForJson({
              $: 'AdminAddressReply',
              adminAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      // 15. Followers: get_following_data (4 items)
      case 'get_following_data': {
        if (n === 4) {
          const r = StackReader.fromStack(4, tuple);
          return {
            structName: 'FollowingStore',
            data: sanitizeForJson({
              $: 'FollowingStore',
              follower: r.readSlice().loadAddress(),
              followee: r.readSlice().loadAddress(),
              mintAmount: r.readBigInt(),
              isFollowing: r.readBoolean(),
            }),
          };
        }
        break;
      }

      case 'get_is_following': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'IsFollowingReply',
            data: sanitizeForJson({
              $: 'IsFollowingReply',
              isFollowing: r.readBoolean(),
            }),
          };
        }
        break;
      }

      // 16. Poll: get_poll_data (10 items)
      case 'get_poll_data': {
        if (n === 10) {
          const r = StackReader.fromStack(10, tuple);
          return {
            structName: 'PollDataReply',
            data: sanitizeForJson({
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
            }),
          };
        }
        break;
      }

      case 'get_voter_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'VoterAddressReply',
            data: sanitizeForJson({
              $: 'VoterAddressReply',
              voterAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      // 17. Voter: get_voter_data (4 items)
      case 'get_voter_data': {
        if (n === 4) {
          const r = StackReader.fromStack(4, tuple);
          return {
            structName: 'VoterStore',
            data: sanitizeForJson({
              $: 'VoterStore',
              voterOwner: r.readSlice().loadAddress(),
              pollAddress: r.readSlice().loadAddress(),
              voted: r.readBoolean(),
              vote: r.readBoolean(),
            }),
          };
        }
        break;
      }

      // 18. Location Getters
      case 'get_version':
      case 'getVersion': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'VersionReply',
            data: sanitizeForJson({
              $: 'VersionReply',
              version: r.readBigInt(),
            }),
          };
        }
        break;
      }

      case 'get_minter_address': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'MinterAddressReply',
            data: sanitizeForJson({
              $: 'MinterAddressReply',
              minterAddress: r.readSlice().loadAddress(),
            }),
          };
        }
        break;
      }

      case 'get_member_count':
      case 'getParticipantCount': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'CountReply',
            data: sanitizeForJson({
              $: 'CountReply',
              count: r.readBigInt(),
            }),
          };
        }
        break;
      }

      case 'is_member':
      case 'isParticipant': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'IsMemberReply',
            data: sanitizeForJson({
              $: 'IsMemberReply',
              isMember: r.readBoolean(),
            }),
          };
        }
        break;
      }

      // 19. Lottery Getters
      case 'getDeadline': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'DeadlineReply',
            data: sanitizeForJson({
              $: 'DeadlineReply',
              deadline: r.readBigInt(),
            }),
          };
        }
        break;
      }

      case 'getCurrentPhase': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'CurrentPhaseReply',
            data: sanitizeForJson({
              $: 'CurrentPhaseReply',
              currentPhase: r.readBigInt(),
            }),
          };
        }
        break;
      }

      case 'getPrizePool': {
        if (n === 1) {
          const r = StackReader.fromStack(1, tuple);
          return {
            structName: 'PrizePoolReply',
            data: sanitizeForJson({
              $: 'PrizePoolReply',
              prizePool: r.readBigInt(),
            }),
          };
        }
        break;
      }
    }
  } catch {
    // Decoding failed
    return null;
  }

  return null;
}

// Master function to extract getter call and decode response stack
export function decodeGetterResponse(
  requestBody: string | null | undefined,
  responseBody: string | null | undefined,
): { structName: string; data: unknown; methodName?: string } | null {
  if (!responseBody) return null;

  let methodName: string | undefined;

  // 1. Extract method name from request body if present
  if (requestBody) {
    try {
      const parsedReq = JSON.parse(requestBody);
      if (parsedReq) {
        if (parsedReq.method === 'runGetMethod' && parsedReq.params?.method) {
          methodName = String(parsedReq.params.method);
        } else if (typeof parsedReq.method === 'string') {
          methodName = parsedReq.method;
        }
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // 2. Parse response body to find the TVM stack
  try {
    const parsedRes = JSON.parse(responseBody);
    if (!parsedRes) return null;

    let stackItems: unknown[] | null = null;
    let gasUsed: number | undefined;
    let exitCode: number | undefined;

    if (Array.isArray(parsedRes.stack)) {
      stackItems = parsedRes.stack;
      gasUsed = parsedRes.gas_used;
      exitCode = parsedRes.exit_code;
    } else if (parsedRes.result && Array.isArray(parsedRes.result.stack)) {
      stackItems = parsedRes.result.stack;
      gasUsed = parsedRes.result.gas_used;
      exitCode = parsedRes.result.exit_code;
    }

    if (!stackItems || stackItems.length === 0) {
      return null;
    }

    const tuple = parseRawStack(stackItems);

    // If method name was found, try decoding with specific Tolk contract wrapper
    if (methodName) {
      const decoded = decodeContractGetter(methodName, tuple);
      if (decoded) {
        return {
          structName: decoded.structName,
          data: {
            ...((decoded.data as Record<string, unknown>) ?? {}),
            _meta: {
              method: methodName,
              exitCode: exitCode ?? 0,
              gasUsed: gasUsed ?? 0,
            },
          },
          methodName,
        };
      }
    }

    // Generic fallback: format TVM stack cleanly
    const genericStack = tuple.map((item, idx) => {
      if (item.type === 'int') return item.value.toString();
      if (item.type === 'null') return null;
      if (
        item.type === 'cell' ||
        item.type === 'slice' ||
        item.type === 'builder'
      ) {
        return `Cell<${item.cell.toBoc().toString('base64').slice(0, 16)}...>`;
      }
      return `Tuple[#${idx}]`;
    });

    return {
      structName: 'GenericTvmStack',
      data: {
        $: 'TvmStack',
        stack: genericStack,
        _meta: {
          exitCode: exitCode ?? 0,
          gasUsed: gasUsed ?? 0,
          method: methodName,
        },
      },
      methodName,
    };
  } catch {
    return null;
  }
}
