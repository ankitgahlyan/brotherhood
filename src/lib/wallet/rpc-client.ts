import { Address, Cell, TupleItem } from '@ton/core';
import { TonClient } from '@ton/ton';

export type NetworkMode = 'mainnet' | 'testnet';

export interface WalletRpcClientOptions {
  network?: NetworkMode;
  apiKey?: string;
  endpoint?: string;
}

export function getMainnetApiKey(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_TONCENTER_MAINNET_API_KEY ||
        import.meta.env.TONCENTER_MAINNET_API_KEY
      );
    }
  } catch {
    // Ignore meta reference error
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env.VITE_TONCENTER_MAINNET_API_KEY ||
        process.env.TONCENTER_MAINNET_API_KEY
      );
    }
  } catch {
    // Ignore process reference error
  }
  return undefined;
}

export function getTestnetApiKey(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_TONCENTER_TESTNET_API_KEY ||
        import.meta.env.TONCENTER_TESTNET_API_KEY
      );
    }
  } catch {
    // Ignore meta reference error
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env.VITE_TONCENTER_TESTNET_API_KEY ||
        process.env.TONCENTER_TESTNET_API_KEY
      );
    }
  } catch {
    // Ignore process reference error
  }
  return undefined;
}

export function getDefaultEndpoint(network: NetworkMode): string {
  return network === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';
}

export function getDefaultV3Endpoint(network: NetworkMode): string {
  return network === 'mainnet'
    ? 'https://toncenter.com/api/v3/message'
    : 'https://testnet.toncenter.com/api/v3/message';
}

/**
 * RPC client wrapper around TonClient for sending BOCs, querying balance and seqno
 */
export class WalletRpcClient {
  public readonly network: NetworkMode;
  public readonly apiKey?: string;
  public readonly endpoint: string;
  private tonClient: TonClient;

  constructor(options: WalletRpcClientOptions = {}) {
    this.network = options.network ?? 'mainnet';
    this.apiKey =
      options.apiKey ??
      (this.network === 'mainnet' ? getMainnetApiKey() : getTestnetApiKey());
    this.endpoint = options.endpoint ?? getDefaultEndpoint(this.network);

    this.tonClient = new TonClient({
      endpoint: this.endpoint,
      apiKey: this.apiKey,
    });
  }

  /**
   * Returns the underlying @ton/ton TonClient instance
   */
  getTonClient(): TonClient {
    return this.tonClient;
  }

  /**
   * Submits a BOC (Bag of Cells) payload directly to the network
   */
  async sendBoc(boc: string | Buffer | Cell): Promise<string> {
    let bocBuffer: Buffer;
    let base64Boc: string;

    if (typeof boc === 'string') {
      // Check if hex or base64
      if (/^[0-9a-fA-F]+$/.test(boc)) {
        bocBuffer = Buffer.from(boc, 'hex');
        base64Boc = bocBuffer.toString('base64');
      } else {
        base64Boc = boc;
        bocBuffer = Buffer.from(boc, 'base64');
      }
    } else if (boc instanceof Cell) {
      bocBuffer = boc.toBoc();
      base64Boc = bocBuffer.toString('base64');
    } else {
      bocBuffer = boc;
      base64Boc = bocBuffer.toString('base64');
    }

    // Try V3 API submission first for higher reliability
    const v3Url = getDefaultV3Endpoint(this.network);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(v3Url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ boc: base64Boc }),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.message_hash) {
          return json.message_hash;
        }
        if (json.message_hash_norm) {
          return json.message_hash_norm;
        }
      }
    } catch {
      // Fall back to TonClient.sendFile
    }

    // Fallback to standard TonClient sendFile
    await this.tonClient.sendFile(bocBuffer);
    return Cell.fromBoc(bocBuffer)[0].hash().toString('hex');
  }

  /**
   * Fetches account sequence number (seqno). Returns 0 if non-existent or uninitialized.
   */
  async getSeqno(address: Address | string): Promise<number> {
    const targetAddr =
      typeof address === 'string' ? Address.parse(address) : address;
    try {
      const state = await this.tonClient.getContractState(targetAddr);
      if (state.state !== 'active') {
        return 0;
      }
      const res = await this.tonClient.runMethod(targetAddr, 'seqno');
      return res.stack.readNumber();
    } catch {
      return 0;
    }
  }

  /**
   * Fetches account TON balance in nanotons (bigint)
   */
  async getBalance(address: Address | string): Promise<bigint> {
    const targetAddr =
      typeof address === 'string' ? Address.parse(address) : address;
    try {
      const state = await this.tonClient.getContractState(targetAddr);
      return state.balance;
    } catch {
      return 0n;
    }
  }

  /**
   * Queries general contract state
   */
  async getAccountState(address: Address | string): Promise<{
    status: 'active' | 'uninitialized' | 'frozen' | 'non-existing';
    balance: bigint;
    seqno: number;
  }> {
    const targetAddr =
      typeof address === 'string' ? Address.parse(address) : address;
    try {
      const state = await this.tonClient.getContractState(targetAddr);
      let seqno = 0;
      if (state.state === 'active') {
        try {
          const res = await this.tonClient.runMethod(targetAddr, 'seqno');
          seqno = res.stack.readNumber();
        } catch {
          seqno = 0;
        }
      }
      const statusMap: Record<
        string,
        'active' | 'uninitialized' | 'frozen' | 'non-existing'
      > = {
        active: 'active',
        uninitialized: 'uninitialized',
        frozen: 'frozen',
      };
      return {
        status: statusMap[state.state] || 'non-existing',
        balance: state.balance,
        seqno,
      };
    } catch {
      return {
        status: 'non-existing',
        balance: 0n,
        seqno: 0,
      };
    }
  }

  /**
   * Runs a get method on the contract address
   */
  async runGetMethod(
    address: Address | string,
    method: string,
    stack: TupleItem[] = [],
  ) {
    const targetAddr =
      typeof address === 'string' ? Address.parse(address) : address;
    return await this.tonClient.runMethod(targetAddr, method, stack);
  }
}

// Singleton cache for default clients
const clientInstances: Partial<Record<NetworkMode, WalletRpcClient>> = {};

/**
 * Helper to get shared WalletRpcClient instance
 */
export function getRpcClient(
  network: NetworkMode = 'mainnet',
): WalletRpcClient {
  if (!clientInstances[network]) {
    clientInstances[network] = new WalletRpcClient({ network });
  }
  return clientInstances[network]!;
}
