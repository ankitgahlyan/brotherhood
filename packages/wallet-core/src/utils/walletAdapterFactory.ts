/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import type {
  WalletAdapter,
  WalletSigner,
  SignatureDomain,
} from '@ton/walletkit';
import {
  WalletV5R1Adapter,
  DefaultSignature,
  MnemonicToKeyPair,
  Uint8ArrayToHex,
  Network,
  Signer,
  createWalletId,
  formatWalletAddress,
} from '@ton/walletkit';
import type { ITonWalletKit, Transaction } from '@ton/walletkit';
import {
  createWalletInitConfigLedger,
  createLedgerPath,
  createWalletV4R2Ledger,
} from '@demo/v4ledger-adapter';

import type {
  CreateLedgerTransportFunction,
  LedgerConfig,
  PreviewTransaction,
  SavedWallet,
} from '../types/wallet';
import type { NetworkType } from './network';
import { createComponentLogger } from './logger';
import { getChainNetwork } from './network';

const log = createComponentLogger('WalletAdapterFactory');

export interface CreateWalletAdapterParams {
  mnemonic?: string[];
  watchOnlyAddress?: string;
  useWalletInterfaceType: 'signer' | 'mnemonic' | 'ledger' | 'watch-only';
  ledgerAccountNumber?: number;
  storedLedgerConfig?: LedgerConfig;
  network: NetworkType;
  walletKit: ITonWalletKit;
  version: 'v5r1' | 'v4r2';
  walletId?: number;
  /**
   * Factory function to create Ledger transport.
   * Required when useWalletInterfaceType is 'ledger'.
   * For web: () => TransportWebHID.create()
   * For React Native: () => TransportBLE.open(deviceId)
   */
  createLedgerTransport?: CreateLedgerTransportFunction;
}

/**
 * Creates a wallet adapter based on the specified type and configuration
 */
export async function createWalletAdapter(
  params: CreateWalletAdapterParams,
): Promise<WalletAdapter> {
  const {
    mnemonic,
    watchOnlyAddress,
    useWalletInterfaceType,
    ledgerAccountNumber = 0,
    storedLedgerConfig,
    network,
    walletKit,
    version: _version = 'v5r1',
    walletId,
    createLedgerTransport,
  } = params;

  const chainNetwork = getChainNetwork(network);
  const domain: SignatureDomain | undefined =
    network == 'tetra'
      ? {
          type: 'l2',
          globalId: 662387,
        }
      : undefined;

  const isTestnet = chainNetwork.chainId === Network.testnet().chainId;
  const w5WalletId = walletId ?? (isTestnet ? 2147483645 : 2147483409);

  switch (useWalletInterfaceType) {
    case 'watch-only': {
      if (!watchOnlyAddress) {
        throw new Error('Address required for watch-only wallet type');
      }
      const parsedAddr = Address.parse(watchOnlyAddress.trim());
      const client = walletKit.getApiClient(chainNetwork);
      const rejectWatchOnly = async (): Promise<never> => {
        throw new Error('Watch-only wallet cannot sign or send messages');
      };
      return {
        getPublicKey: () => ('0x' + '0'.repeat(64)) as any,
        getNetwork: () => chainNetwork,
        getClient: () => client,
        getAddress: (options?: { testnet?: boolean }) =>
          formatWalletAddress(parsedAddr, options?.testnet ?? isTestnet),
        getWalletId: () =>
          createWalletId(
            chainNetwork,
            formatWalletAddress(parsedAddr, isTestnet),
          ),
        getStateInit: async () => '' as any,
        getSignedSendTransaction: rejectWatchOnly,
        getSignedSignMessage: rejectWatchOnly,
        getSignedSignData: rejectWatchOnly,
        getSignedTonProof: rejectWatchOnly,
        getSupportedFeatures: () => [],
      };
    }
    case 'signer': {
      if (!mnemonic) {
        throw new Error('Mnemonic required for signer wallet type');
      }
      const keyPair = await MnemonicToKeyPair(mnemonic);

      const customSigner: WalletSigner = {
        sign: async (bytes: Iterable<number>) => {
          if (confirm('Are you sure you want to sign?')) {
            return DefaultSignature(bytes, keyPair.secretKey);
          }
          throw new Error('User did not confirm');
        },
        publicKey: Uint8ArrayToHex(keyPair.publicKey),
      };

      return await WalletV5R1Adapter.create(customSigner, {
        client: walletKit.getApiClient(chainNetwork),
        network: chainNetwork,
        domain: domain,
        walletId: w5WalletId,
      });
    }
    case 'mnemonic': {
      if (!mnemonic) {
        throw new Error('Mnemonic required for mnemonic wallet type');
      }

      const signer = await Signer.fromMnemonic(mnemonic, { type: 'ton' });

      return await WalletV5R1Adapter.create(signer, {
        client: walletKit.getApiClient(chainNetwork),
        network: chainNetwork,
        domain: domain,
        walletId: w5WalletId,
      });
    }
    case 'ledger': {
      if (!createLedgerTransport) {
        throw new Error(
          'createLedgerTransport is required for Ledger wallet type',
        );
      }

      try {
        if (storedLedgerConfig) {
          return createWalletV4R2Ledger(
            createWalletInitConfigLedger({
              createTransport: createLedgerTransport as any,
              path: storedLedgerConfig.path,
              publicKey: Buffer.from(
                storedLedgerConfig.publicKey.substring(2),
                'hex',
              ),
              version: storedLedgerConfig.version as 'v4r2',
              network: getChainNetwork(
                storedLedgerConfig.network as NetworkType,
              ),
              workchain: storedLedgerConfig.workchain,
              walletId: storedLedgerConfig.walletId,
              accountIndex: storedLedgerConfig.accountIndex,
            }),
            {
              tonClient: walletKit.getApiClient(chainNetwork),
            },
          );
        }

        const path = createLedgerPath(
          chainNetwork.chainId === Network.testnet().chainId,
          0,
          ledgerAccountNumber,
        );

        return createWalletV4R2Ledger(
          createWalletInitConfigLedger({
            createTransport: createLedgerTransport as any,
            path,
            version: 'v4r2',
            network: chainNetwork,
            workchain: 0,
            accountIndex: ledgerAccountNumber,
          }),
          {
            tonClient: walletKit.getApiClient(chainNetwork),
          },
        );
      } catch (error) {
        log.error('Failed to create Ledger transport:', error);
        throw new Error('Failed to connect to Ledger device');
      }
    }
    default:
      throw new Error(
        `Invalid wallet interface type: ${useWalletInterfaceType}`,
      );
  }
}

/**
 * Transforms a streaming Transaction to our PreviewTransaction type
 */
export function transformTransaction(tx: Transaction): PreviewTransaction {
  let type: 'send' | 'receive' = 'receive';
  let amount = '0';
  let address = '';

  if (tx.inMessage && tx.inMessage.value) {
    amount = tx.inMessage.value;
    address = tx.inMessage.source || '';
    type = 'receive';
  }

  if (tx.outMessages && tx.outMessages.length > 0) {
    const mainOutMsg = tx.outMessages[0];
    if (mainOutMsg.value) {
      amount = mainOutMsg.value;
      address = mainOutMsg.destination || '';
      type = 'send';
    }
  }

  let status: 'pending' | 'confirmed' | 'failed' = 'confirmed';
  if (tx.description?.isAborted) {
    status = 'failed';
  } else if (!tx.description?.computePhase?.isSuccess) {
    status = 'failed';
  }

  return {
    id: tx.hash,
    traceId: tx.traceId || undefined,
    messageHash: tx.inMessage?.hash || '',
    type,
    amount,
    address,
    timestamp: tx.now * 1000,
    status,
    externalMessageHash: tx.traceExternalHash || undefined,
  };
}

/**
 * Generates a unique wallet ID
 */
export function generateWalletId(): string {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a default wallet name based on existing wallets
 */
export function generateWalletName(
  existingWallets: SavedWallet[],
  type: 'mnemonic' | 'signer' | 'ledger' | 'watch-only',
): string {
  const prefix =
    type === 'ledger' ? 'Ledger' : type === 'watch-only' ? 'Watch' : 'Wallet';
  let counter =
    existingWallets.filter((w) => w.name.startsWith(prefix)).length + 1;
  let name = `${prefix} ${counter}`;

  while (existingWallets.some((w) => w.name === name)) {
    counter++;
    name = `${prefix} ${counter}`;
  }

  return name;
}
