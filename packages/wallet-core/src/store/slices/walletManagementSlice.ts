/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { compareAddress, Base64ToHex, Network } from '@ton/walletkit';
import type {
  ITonWalletKit,
  Transaction,
  TransactionsUpdate,
  Wallet,
  WalletAdapter,
} from '@ton/walletkit';
import { createLedgerPath } from '@demo/v4ledger-adapter';

import { SimpleEncryption } from '../../utils';
import { createComponentLogger } from '../../utils/logger';
import { getChainNetwork } from '../../utils/network';
import {
  createWalletAdapter,
  generateWalletId,
  generateWalletName,
} from '../../utils/walletAdapterFactory';
import type {
  LedgerConfig,
  SavedWallet,
  WalletKitConfig,
} from '../../types/wallet';
import type { NetworkType } from '../../utils/network';
import type { SetState, WalletManagementSliceCreator } from '../../types/store';

const log = createComponentLogger('WalletManagementSlice');

let activeStreamingUnwatchers: Array<() => void> = [];

let inFlightLoadEvents: Promise<void> | null = null;
let lastLoadEventsKey = '';
let lastLoadEventsTime = 0;
const EVENTS_CACHE_TTL_MS = 30_000;

let inFlightLoadAllWallets: Promise<void> | null = null;
let inFlightSwitchWalletId: string | null = null;
let inFlightSwitchWalletPromise: Promise<void> | null = null;

function isAccountInEvent(
  ev: any,
  targetAddr: string,
  associatedAddrs: string[] = [],
): boolean {
  if (!ev || !targetAddr) return false;

  const allTargets = [targetAddr, ...associatedAddrs];

  const matches = (addrCandidate?: unknown): boolean => {
    if (!addrCandidate) return false;
    const str =
      typeof addrCandidate === 'string'
        ? addrCandidate
        : (addrCandidate as any)?.address;
    if (!str || typeof str !== 'string') return false;
    for (const t of allTargets) {
      try {
        if (compareAddress(str, t)) return true;
      } catch {
        if (str === t) return true;
      }
    }
    return false;
  };

  // 1. Primary event account
  if (matches(ev.account)) return true;

  // 2. Parsed actions
  if (Array.isArray(ev.actions)) {
    for (const action of ev.actions) {
      if (!action) continue;

      // TonTransfer
      if (action.TonTransfer) {
        if (matches(action.TonTransfer.sender)) return true;
        if (matches(action.TonTransfer.recipient)) return true;
      }

      // JettonTransfer
      if (action.JettonTransfer) {
        if (matches(action.JettonTransfer.sender)) return true;
        if (matches(action.JettonTransfer.recipient)) return true;
      }

      // JettonSwap
      if (action.JettonSwap) {
        if (matches(action.JettonSwap.userWallet)) return true;
      }

      // NftItemTransfer
      if (action.NftItemTransfer) {
        if (matches(action.NftItemTransfer.sender)) return true;
        if (matches(action.NftItemTransfer.recipient)) return true;
      }

      // SmartContractExec
      if (action.SmartContractExec) {
        if (matches(action.SmartContractExec.executor)) return true;
        if (matches(action.SmartContractExec.contract)) return true;
      }

      // ContractDeploy
      if (action.ContractDeploy) {
        if (matches(action.ContractDeploy.address)) return true;
      }

      // SimplePreview accounts
      if (Array.isArray(action.simplePreview?.accounts)) {
        for (const previewAcc of action.simplePreview.accounts) {
          if (matches(previewAcc)) return true;
        }
      }
    }
  }

  // 3. Transactions / messages
  if (ev.transactions) {
    const txList = Array.isArray(ev.transactions)
      ? ev.transactions
      : Object.values(ev.transactions);
    for (const tx of txList as any[]) {
      if (!tx) continue;
      if (matches(tx.account)) return true;
      if (tx.in_msg) {
        if (matches(tx.in_msg.source)) return true;
        if (matches(tx.in_msg.destination)) return true;
      }
      if (Array.isArray(tx.out_msgs)) {
        for (const msg of tx.out_msgs) {
          if (!msg) continue;
          if (matches(msg.source)) return true;
          if (matches(msg.destination)) return true;
        }
      }
    }
  }

  return false;
}

export const createWalletManagementSlice =
  (walletKitConfig?: WalletKitConfig): WalletManagementSliceCreator =>
  (set: SetState, get) => ({
    walletManagement: {
      savedWallets: [],
      activeWalletId: undefined,
      address: undefined,
      balance: undefined,
      balancesByAddress: {},
      publicKey: undefined,
      events: [],
      eventsByAddress: {},
      associatedAddressesByAddress: {},
      hasNextEvents: false,
      pendingTransactions: [],
      confirmedTraceIds: [],
      confirmedExternalHashes: [],
      currentWallet: undefined,
      hasWallet: false,
      isAuthenticated: false,
      isStreamingConnected: false,
    },

    // Load saved wallets into WalletKit (lazy: only loads active/primary wallet)
    loadSavedWalletsIntoKit: async (walletKit: ITonWalletKit) => {
      const state = get();
      const savedWallets = state.walletManagement.savedWallets;
      if (!savedWallets || savedWallets.length === 0) {
        return;
      }

      if (!state.auth.currentPassword) {
        return;
      }

      const targetWallet =
        savedWallets.find(
          (w) => w.id === state.walletManagement.activeWalletId,
        ) ?? savedWallets[0];

      if (!targetWallet) {
        return;
      }

      log.info(`Loading active wallet ${targetWallet.name} into WalletKit`);

      try {
        // Check if wallet already loaded using kitWalletId
        if (
          targetWallet.kitWalletId &&
          walletKit.getWallet(targetWallet.kitWalletId)
        ) {
          log.info(`Wallet ${targetWallet.name} already loaded`);
          return;
        }

        const walletAdapter = await state.createAdapterFromSavedWallet(
          walletKit,
          targetWallet,
        );

        if (!walletAdapter) {
          log.warn(`Failed to create adapter for wallet ${targetWallet.name}`);
          return;
        }

        const loadedWallet = await walletKit.addWallet(walletAdapter);
        if (loadedWallet) {
          const newKitWalletId = loadedWallet.getWalletId();
          if (newKitWalletId && newKitWalletId !== targetWallet.kitWalletId) {
            set((state) => {
              const sw = state.walletManagement.savedWallets.find(
                (w) => w.id === targetWallet.id,
              );
              if (sw) sw.kitWalletId = newKitWalletId;
            });
          }
        }
        log.info(
          `Loaded wallet ${targetWallet.name} (${targetWallet.address})`,
        );
      } catch (error) {
        log.error(`Failed to load wallet ${targetWallet.name}:`, error);
      }
    },

    // Create a new wallet
    createWallet: async (
      mnemonic: string[],
      name?: string,
      version?: 'v5r1',
      network?: NetworkType,
      subwalletId?: number,
    ) => {
      const state = get();
      if (!state.auth.currentPassword) {
        throw new Error('User not authenticated');
      }

      if (!state.walletCore.walletKit) {
        throw new Error('WalletKit not initialized');
      }

      try {
        const walletId = generateWalletId();
        const walletName =
          name ||
          generateWalletName(
            state.walletManagement.savedWallets,
            state.auth.useWalletInterfaceType || 'mnemonic',
          );

        const encryptedMnemonic = await SimpleEncryption.encrypt(
          JSON.stringify(mnemonic),
          state.auth.currentPassword,
        );

        const walletVersion = 'v5r1';
        const walletNetwork = network || 'testnet';
        const resolvedSubwalletId =
          subwalletId ??
          (walletNetwork === 'testnet' ? 2147483645 : 2147483409);

        const walletAdapter = await createWalletAdapter({
          mnemonic,
          useWalletInterfaceType:
            state.auth.useWalletInterfaceType || 'mnemonic',
          ledgerAccountNumber: state.auth.ledgerAccountNumber,
          storedLedgerConfig: undefined,
          network: walletNetwork,
          walletKit: state.walletCore.walletKit,
          version: walletVersion,
          walletId: resolvedSubwalletId,
        });

        const wallet =
          await state.walletCore.walletKit.addWallet(walletAdapter);
        if (!wallet) {
          throw new Error('Failed to find created wallet');
        }

        const address = wallet.getAddress();
        const publicKey = wallet.getPublicKey();

        const savedWallet: SavedWallet = {
          id: walletId,
          name: walletName,
          address,
          publicKey,
          encryptedMnemonic,
          walletType: state.auth.useWalletInterfaceType || 'mnemonic',
          walletInterfaceType: state.auth.useWalletInterfaceType || 'mnemonic',
          version: walletVersion,
          network: walletNetwork,
          subwalletId: resolvedSubwalletId,
          createdAt: Date.now(),
          kitWalletId: wallet.getWalletId(),
        };

        set((state) => {
          state.walletManagement.savedWallets.push(savedWallet);
          state.walletManagement.hasWallet = true;
          state.walletManagement.isAuthenticated = true;
          state.walletManagement.activeWalletId = walletId;
          state.walletManagement.address = address;
          state.walletManagement.publicKey = publicKey;
          // Leave balance undefined (shows skeleton) until the real balance loads,
          // so the received-toast hook seeds the actual balance instead of diffing from 0.
          state.walletManagement.balance = undefined;
          state.walletManagement.currentWallet = wallet;
          state.walletManagement.events = [];
        });

        await get().startWebSocketStreaming();
        void get().loadEvents(15, 0, false);
        log.info(`Created wallet ${walletId} (${walletName})`);
        return walletId;
      } catch (error) {
        log.error('Error creating wallet:', error);
        throw error instanceof Error
          ? error
          : new Error('Failed to create wallet');
      }
    },

    importWallet: async (
      mnemonic: string[],
      name?: string,
      version?: 'v5r1',
      network?: NetworkType,
      subwalletId?: number,
    ) => {
      return get().createWallet(mnemonic, name, version, network, subwalletId);
    },

    createLedgerWallet: async (name?: string, network?: NetworkType) => {
      const state = get();
      if (!state.auth.currentPassword) {
        throw new Error('User not authenticated');
      }

      if (state.auth.useWalletInterfaceType !== 'ledger') {
        throw new Error('Wallet type must be set to ledger');
      }

      if (!state.walletCore.walletKit) {
        throw new Error('WalletKit not initialized');
      }

      try {
        const getneratedWalletId = generateWalletId();
        const walletName =
          name ||
          generateWalletName(state.walletManagement.savedWallets, 'ledger');
        const version = 'v4r2';
        const walletNetwork = network || 'mainnet';

        if (!walletKitConfig?.createLedgerTransport) {
          throw new Error(
            'createLedgerTransport is required for Ledger wallet',
          );
        }

        const walletAdapter = await createWalletAdapter({
          useWalletInterfaceType: 'ledger',
          ledgerAccountNumber: state.auth.ledgerAccountNumber,
          storedLedgerConfig: undefined,
          network: walletNetwork,
          walletKit: state.walletCore.walletKit,
          version: version,
          createLedgerTransport: walletKitConfig.createLedgerTransport,
        });

        const wallet =
          await state.walletCore.walletKit.addWallet(walletAdapter);

        if (!wallet) {
          throw new Error('Failed to find created Ledger wallet');
        }

        const address = wallet.getAddress();
        const kitWalletId = wallet.getWalletId();

        const existingWallet = state.walletManagement.savedWallets.find(
          (w) => w.kitWalletId === kitWalletId,
        );
        if (existingWallet) {
          log.warn(`Wallet with walletId ${kitWalletId} already exists`);
          throw new Error('A wallet with this walletId already exists');
        }

        const balance = await wallet.getBalance();
        const publicKey = wallet.getPublicKey();

        const ledgerPath = createLedgerPath(
          wallet.getNetwork().chainId === Network.testnet().chainId,
          0,
          state.auth.ledgerAccountNumber || 0,
        );
        const ledgerConfig: LedgerConfig = {
          publicKey: publicKey,
          path: ledgerPath,
          walletId: 698983191,
          version: version,
          network: walletNetwork,
          workchain: 0,
          accountIndex: state.auth.ledgerAccountNumber || 0,
        };

        const savedWallet: SavedWallet = {
          id: getneratedWalletId,
          name: walletName,
          address,
          publicKey,
          ledgerConfig,
          walletType: 'ledger',
          walletInterfaceType: 'ledger',
          version: version,
          network: walletNetwork,
          createdAt: Date.now(),
          kitWalletId: wallet.getWalletId(),
        };

        set((state) => {
          state.walletManagement.savedWallets.push(savedWallet);
          state.walletManagement.hasWallet = true;
          state.walletManagement.isAuthenticated = true;
          state.walletManagement.activeWalletId = getneratedWalletId;
          state.walletManagement.address = address;
          state.walletManagement.publicKey = publicKey;
          state.walletManagement.balance = balance.toString();
          if (address) {
            state.walletManagement.balancesByAddress[address] =
              balance.toString();
          }
          state.walletManagement.currentWallet = wallet;
        });

        await get().startWebSocketStreaming();
        log.info(`Created Ledger wallet ${getneratedWalletId} (${walletName})`);
        return getneratedWalletId;
      } catch (error) {
        log.error('Error creating Ledger wallet:', error);
        throw error instanceof Error
          ? error
          : new Error('Failed to create Ledger wallet');
      }
    },

    switchWallet: async (walletId: string) => {
      if (inFlightSwitchWalletId === walletId && inFlightSwitchWalletPromise) {
        return inFlightSwitchWalletPromise;
      }

      const runSwitch = async () => {
        const state = get();

        if (!state.walletCore.walletKit) {
          throw new Error('WalletKit not initialized');
        }

        const savedWallet = state.walletManagement.savedWallets.find(
          (w) => w.id === walletId,
        );
        if (!savedWallet) {
          throw new Error('Wallet not found');
        }

        try {
          if (
            state.walletManagement.activeWalletId === walletId &&
            state.walletManagement.currentWallet
          ) {
            log.info(`Wallet ${walletId} is already active, skipping switch`);
            if (!state.walletManagement.isStreamingConnected) {
              await get().startWebSocketStreaming();
            }
            return;
          }

          log.info(`Switching to wallet ${walletId} (${savedWallet.name})`);

          await get().stopWebSocketStreaming();

          let wallet = savedWallet.kitWalletId
            ? state.walletCore.walletKit.getWallet(savedWallet.kitWalletId)
            : undefined;

          let newlyAssignedKitId: string | undefined;

          // Fallback: check if the wallet was already registered under a matching address
          if (!wallet && savedWallet.address) {
            const loadedWallets = state.walletCore.walletKit.getWallets();
            wallet = loadedWallets.find((w) => {
              try {
                return compareAddress(w.getAddress(), savedWallet.address);
              } catch {
                return w.getAddress() === savedWallet.address;
              }
            });
            if (wallet) {
              const matchedKitWalletId = wallet.getWalletId();
              if (matchedKitWalletId !== savedWallet.kitWalletId) {
                newlyAssignedKitId = matchedKitWalletId;
              }
            }
          }

          // Wallet is not in WalletKit yet — decrypt mnemonic and create adapter
          if (!wallet) {
            if (!state.auth.currentPassword) {
              throw new Error('User not authenticated');
            }

            const walletAdapter = await state.createAdapterFromSavedWallet(
              state.walletCore.walletKit,
              savedWallet,
            );

            if (!walletAdapter) {
              throw new Error(
                `Failed to create adapter for wallet ${savedWallet.name}`,
              );
            }

            wallet = await state.walletCore.walletKit.addWallet(walletAdapter);
          }

          if (!wallet) {
            throw new Error('Failed to load wallet');
          }

          if (
            !newlyAssignedKitId &&
            wallet.getWalletId() !== savedWallet.kitWalletId
          ) {
            newlyAssignedKitId = wallet.getWalletId();
          }

          // Activate the wallet immediately using cached balance if available
          const cachedBalance = savedWallet.address
            ? (state.walletManagement.balancesByAddress?.[
                savedWallet.address
              ] ??
              (state.walletManagement.activeWalletId === walletId
                ? state.walletManagement.balance
                : undefined))
            : undefined;

          set((state) => {
            if (newlyAssignedKitId) {
              const savedWalletIndex =
                state.walletManagement.savedWallets.findIndex(
                  (w) => w.id === walletId,
                );
              if (savedWalletIndex !== -1) {
                state.walletManagement.savedWallets[
                  savedWalletIndex
                ].kitWalletId = newlyAssignedKitId;
              }
            }

            state.walletManagement.activeWalletId = walletId;
            state.walletManagement.address = savedWallet.address;
            state.walletManagement.publicKey = savedWallet.publicKey;
            state.walletManagement.balance = cachedBalance;
            if (savedWallet.address && cachedBalance !== undefined) {
              state.walletManagement.balancesByAddress[savedWallet.address] =
                cachedBalance;
            }
            state.walletManagement.currentWallet = wallet;
            state.walletManagement.events =
              (savedWallet.address &&
                state.walletManagement.eventsByAddress[savedWallet.address]) ||
              [];

            // Restore cached jettons and nfts for the newly active wallet (or reset to empty if not yet loaded)
            const cachedJettons = savedWallet.address
              ? state.jettons.jettonsByAddress[savedWallet.address]
              : undefined;
            state.jettons.userJettons = cachedJettons ?? [];

            const cachedNfts = savedWallet.address
              ? state.nfts.nftsByAddress[savedWallet.address]
              : undefined;
            state.nfts.userNfts = cachedNfts ?? [];
          });

          await get().startWebSocketStreaming();

          log.info(`Switched to wallet ${walletId} successfully`);
        } catch (error) {
          log.error('Error switching wallet:', error);
          throw error instanceof Error
            ? error
            : new Error('Failed to switch wallet');
        }
      };

      inFlightSwitchWalletId = walletId;
      const switchPromise = runSwitch();
      inFlightSwitchWalletPromise = switchPromise;
      switchPromise
        .catch(() => {})
        .finally(() => {
          if (inFlightSwitchWalletPromise === switchPromise) {
            inFlightSwitchWalletId = null;
            inFlightSwitchWalletPromise = null;
          }
        });
      return switchPromise;
    },

    removeWallet: (walletId: string) => {
      const state = get();
      const walletIndex = state.walletManagement.savedWallets.findIndex(
        (w) => w.id === walletId,
      );

      if (walletIndex === -1) {
        throw new Error('Wallet not found');
      }

      const isRemovingActiveWallet =
        state.walletManagement.activeWalletId === walletId;
      const isLastWallet = state.walletManagement.savedWallets.length === 1;
      // Pick the next wallet to switch to BEFORE removing. Don't touch activeWalletId here —
      // switchWallet must see it still pointing at the removed wallet, otherwise it treats the
      // target as "already active" and early-returns without loading address/currentWallet.
      const nextActiveId =
        isRemovingActiveWallet && !isLastWallet
          ? state.walletManagement.savedWallets.find((w) => w.id !== walletId)
              ?.id
          : undefined;

      const targetSavedWallet =
        state.walletManagement.savedWallets[walletIndex];
      const removedAddress = targetSavedWallet?.address;
      const removedKitWalletId = targetSavedWallet?.kitWalletId;

      set((state) => {
        state.walletManagement.savedWallets.splice(walletIndex, 1);
        if (removedAddress) {
          delete state.walletManagement.balancesByAddress[removedAddress];
          delete state.walletManagement.eventsByAddress[removedAddress];
          delete state.jettons.jettonsByAddress[removedAddress];
          delete state.nfts.nftsByAddress[removedAddress];
          if (state.brotherhood?.brotherhoodByAddress) {
            delete state.brotherhood.brotherhoodByAddress[removedAddress];
          }
        }

        if (isRemovingActiveWallet && isLastWallet) {
          state.walletManagement.hasWallet = false;
          state.walletManagement.isAuthenticated = false;
          state.walletManagement.activeWalletId = undefined;
          state.walletManagement.address = undefined;
          state.walletManagement.publicKey = undefined;
          state.walletManagement.balance = undefined;
          state.walletManagement.balancesByAddress = {};
          state.walletManagement.currentWallet = undefined;
          state.walletManagement.events = [];
          state.walletManagement.eventsByAddress = {};
          state.walletManagement.pendingTransactions = [];
          state.walletManagement.confirmedTraceIds = [];
          state.walletManagement.confirmedExternalHashes = [];
          state.walletManagement.isStreamingConnected = false;
          state.jettons.userJettons = [];
          state.nfts.userNfts = [];
        }
      });

      if (removedAddress) {
        get().removeBrotherhoodWallet(removedAddress);
      }
      if (state.walletCore.walletKit && removedKitWalletId) {
        void state.walletCore.walletKit
          .removeWallet(removedKitWalletId)
          .catch(() => {});
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(`wallet_synced_${walletId}`);
        }
      } catch {
        // Ignore localStorage access errors
      }

      if (isRemovingActiveWallet && isLastWallet) {
        void get().stopWebSocketStreaming();
      }

      log.info(`Removed wallet ${walletId}`);

      if (nextActiveId) {
        void get()
          .switchWallet(nextActiveId)
          .catch((err) =>
            log.error('Error switching wallet after removal:', err),
          );
      }
    },

    renameWallet: (walletId: string, newName: string) => {
      set((state) => {
        const wallet = state.walletManagement.savedWallets.find(
          (w) => w.id === walletId,
        );
        if (wallet) {
          wallet.name = newName;
        }
      });
      log.info(`Renamed wallet ${walletId} to ${newName}`);
    },

    loadAllWallets: async () => {
      if (inFlightLoadAllWallets) {
        return inFlightLoadAllWallets;
      }

      const runLoad = async () => {
        try {
          const state = get();
          if (!state.auth.currentPassword) {
            log.info(
              'Skipping loadAllWallets: session password not set or user not authenticated',
            );
            return;
          }

          if (!state.walletCore.walletKit) {
            log.info('Skipping loadAllWallets: WalletKit not initialized');
            return;
          }

          const savedWallets = state.walletManagement.savedWallets;
          if (!savedWallets || savedWallets.length === 0) {
            return;
          }

          log.info(
            `Loading all wallets (${savedWallets.length}) into WalletKit`,
          );

          // 1. Load each saved wallet into WalletKit if not already present
          const kit = state.walletCore.walletKit;
          for (const savedWallet of savedWallets) {
            try {
              let existing = savedWallet.kitWalletId
                ? kit.getWallet(savedWallet.kitWalletId)
                : undefined;
              if (!existing && savedWallet.address) {
                const loadedWallets = kit.getWallets();
                existing = loadedWallets.find((w) => {
                  try {
                    return compareAddress(w.getAddress(), savedWallet.address);
                  } catch {
                    return w.getAddress() === savedWallet.address;
                  }
                });
              }

              if (!existing) {
                const adapter = await state.createAdapterFromSavedWallet(
                  kit,
                  savedWallet,
                );
                if (adapter) {
                  const added = await kit.addWallet(adapter);
                  if (
                    added &&
                    (!savedWallet.kitWalletId ||
                      savedWallet.kitWalletId !== added.getWalletId())
                  ) {
                    set((s) => {
                      const idx = s.walletManagement.savedWallets.findIndex(
                        (w) => w.id === savedWallet.id,
                      );
                      if (idx !== -1) {
                        s.walletManagement.savedWallets[idx].kitWalletId =
                          added.getWalletId();
                      }
                    });
                  }
                }
              }
            } catch (err) {
              log.warn(
                `Failed loading wallet ${savedWallet.name} into kit:`,
                err,
              );
            }
          }

          const targetWallet =
            savedWallets.find(
              (w) => w.id === state.walletManagement.activeWalletId,
            ) ?? savedWallets[0];

          if (!targetWallet) {
            return;
          }

          // 2. Only switch if the active wallet is not already active and instantiated
          const currentState = get();
          if (
            currentState.walletManagement.activeWalletId !== targetWallet.id ||
            !currentState.walletManagement.currentWallet
          ) {
            log.info(
              `Activating wallet ${targetWallet.name} (${targetWallet.id})`,
            );
            await get().switchWallet(targetWallet.id);
          } else {
            log.info(`Active wallet ${targetWallet.name} is already active`);
            if (!currentState.walletManagement.isStreamingConnected) {
              await get().startWebSocketStreaming();
            }
          }

          set((state) => {
            const hasWallet = state.walletManagement.savedWallets.length > 0;
            if (
              state.walletManagement.hasWallet !== hasWallet ||
              state.walletManagement.isAuthenticated !== hasWallet
            ) {
              state.walletManagement.hasWallet = hasWallet;
              state.walletManagement.isAuthenticated = hasWallet;
            }
          });

          log.info('All wallets loaded successfully');
        } catch (error) {
          log.error('Error loading wallets:', error);
          set((state) => {
            const hasWallet = state.walletManagement.savedWallets.length > 0;
            if (
              state.walletManagement.hasWallet !== hasWallet ||
              state.walletManagement.isAuthenticated !== hasWallet
            ) {
              state.walletManagement.hasWallet = hasWallet;
              state.walletManagement.isAuthenticated = hasWallet;
            }
          });
        }
      };

      const loadPromise = runLoad();
      inFlightLoadAllWallets = loadPromise;
      loadPromise
        .catch(() => {})
        .finally(() => {
          if (inFlightLoadAllWallets === loadPromise) {
            inFlightLoadAllWallets = null;
          }
        });
      return loadPromise;
    },

    getDecryptedMnemonic: async (
      walletId?: string,
    ): Promise<string[] | null> => {
      const state = get();

      if (!state.auth.currentPassword) {
        log.error('No current password available');
        return null;
      }

      try {
        const targetWalletId =
          walletId || state.walletManagement.activeWalletId;
        if (!targetWalletId) {
          log.error('No wallet ID provided or active');
          return null;
        }

        const savedWallet = state.walletManagement.savedWallets.find(
          (w) => w.id === targetWalletId,
        );
        if (!savedWallet || !savedWallet.encryptedMnemonic) {
          log.error('No encrypted mnemonic found for wallet');
          return null;
        }

        const decryptedString = await SimpleEncryption.decrypt(
          savedWallet.encryptedMnemonic,
          state.auth.currentPassword,
        );

        const mnemonic = JSON.parse(decryptedString) as string[];

        if (!mnemonic || mnemonic.length === 0) {
          log.error('Decrypted mnemonic is empty');
          return null;
        }

        return mnemonic;
      } catch (error) {
        log.error('Error decrypting mnemonic:', error);
        return null;
      }
    },

    clearWallet: () => {
      void get().stopWebSocketStreaming();
      set((state) => {
        state.walletManagement.isAuthenticated = false;
        state.walletManagement.hasWallet = false;
        state.walletManagement.savedWallets = [];
        state.walletManagement.activeWalletId = undefined;
        state.walletManagement.address = undefined;
        state.walletManagement.balance = undefined;
        state.walletManagement.balancesByAddress = {};
        state.walletManagement.publicKey = undefined;
        state.walletManagement.events = [];
        state.walletManagement.eventsByAddress = {};
        state.walletManagement.associatedAddressesByAddress = {};
        state.walletManagement.pendingTransactions = [];
        state.walletManagement.confirmedTraceIds = [];
        state.walletManagement.confirmedExternalHashes = [];
        state.walletManagement.currentWallet = undefined;
        state.walletManagement.isStreamingConnected = false;
        state.tonConnect.pendingConnectRequestEvent = undefined;
        state.tonConnect.isConnectModalOpen = false;
        state.tonConnect.pendingTransactionRequestEvent = undefined;
        state.tonConnect.isTransactionModalOpen = false;
        state.tonConnect.pendingSignDataRequestEvent = undefined;
        state.tonConnect.isSignDataModalOpen = false;

        // Clear assets
        state.jettons.userJettons = [];
        state.jettons.jettonsByAddress = {};
        state.nfts.userNfts = [];
        state.nfts.nftsByAddress = {};
      });
    },

    setAssociatedAddresses: (
      walletAddress: string,
      associatedAddresses: string[],
    ) => {
      set((state) => {
        if (!state.walletManagement.associatedAddressesByAddress) {
          state.walletManagement.associatedAddressesByAddress = {};
        }
        const existing =
          state.walletManagement.associatedAddressesByAddress[walletAddress] ||
          [];
        const merged = Array.from(
          new Set([...existing, ...associatedAddresses]),
        );
        state.walletManagement.associatedAddressesByAddress[walletAddress] =
          merged;
      });
    },

    updateBalance: async () => {
      const state = get();
      if (!state.walletManagement.currentWallet) {
        log.warn('No wallet available to update balance');
        return;
      }

      try {
        const balance = await state.walletManagement.currentWallet.getBalance();
        const balanceString = balance.toString();
        const address = state.walletManagement.address;

        set((state) => {
          state.walletManagement.balance = balanceString;
          if (address) {
            state.walletManagement.balancesByAddress[address] = balanceString;
          }
        });
      } catch (error) {
        log.error('Error updating balance:', error);
      }
    },

    startWebSocketStreaming: async () => {
      const state = get();
      if (
        !state.walletManagement.address ||
        state.walletManagement.isStreamingConnected
      ) {
        return;
      }

      const wallet = state.walletManagement.currentWallet;
      const network =
        typeof wallet?.getNetwork === 'function'
          ? wallet.getNetwork()
          : undefined;
      if (!network) return;

      const streaming = state.walletCore.walletKit?.streaming;

      if (!streaming) return;
      if (!streaming.hasProvider(network)) {
        log.info(
          `No streaming provider registered for network ${network.chainId}; skipping WebSocket streaming`,
        );
        return;
      }

      activeStreamingUnwatchers.forEach((unwatch) => unwatch());
      activeStreamingUnwatchers = [];

      const address = state.walletManagement.address;

      const unwatchBalance = streaming.watchBalance(
        network,
        address,
        (update) => {
          set((s) => {
            if (
              update.status === 'finalized' &&
              s.walletManagement.balance !== update.rawBalance
            ) {
              s.walletManagement.balance = update.rawBalance;
              if (address) {
                s.walletManagement.balancesByAddress[address] =
                  update.rawBalance;
              }
              log.info('Balance updated via WebSocket:', update.rawBalance);
            }
          });
        },
      );

      const unwatchJettons = streaming.watchJettons(
        network,
        address,
        (update) => {
          if (update.status === 'finalized') {
            get().updateJettonBalanceFromStream(
              update.walletAddress,
              update.rawBalance,
              update.decimals,
            );

            const hasJetton = get().jettons.userJettons.some((j) =>
              compareAddress(j.walletAddress, update.walletAddress),
            );

            if (!hasJetton) {
              void get()
                .refreshJettons()
                .catch((err) =>
                  log.error('Error refreshing jettons after new jetton:', err),
                );
            }
          }
        },
      );

      const unwatchTransactions = streaming.watchTransactions(
        network,
        address,
        (update) => {
          log.info(
            'New transactions received via WebSocket for:',
            update.address,
            compareAddress(update.address, address),
          );
          get().handleStreamingTransactions(update);
        },
      );

      const unwatchConnection = streaming.onConnectionChange(
        network,
        (connected) => {
          set((s) => {
            s.walletManagement.isStreamingConnected = connected;
          });
        },
      );

      activeStreamingUnwatchers.push(
        unwatchBalance,
        unwatchJettons,
        unwatchTransactions,
        unwatchConnection,
      );

      log.info('WebSocket streaming started for address:', address);
    },

    stopWebSocketStreaming: async () => {
      activeStreamingUnwatchers.forEach((unwatch) => unwatch());
      activeStreamingUnwatchers = [];

      set((s) => {
        s.walletManagement.isStreamingConnected = false;
        s.walletManagement.pendingTransactions = [];
        s.walletManagement.confirmedTraceIds = [];
        s.walletManagement.confirmedExternalHashes = [];
      });
      log.info('WebSocket streaming stopped');
    },

    updateWebSocketSubscription: async () => {
      const state = get();
      if (!state.walletManagement.address) {
        return;
      }
      await get().stopWebSocketStreaming();
      await get().startWebSocketStreaming();
    },

    handleStreamingTransactions: (update: TransactionsUpdate) => {
      const state = get();
      const address = state.walletManagement.address;
      if (!address || !compareAddress(update.address, address)) {
        return;
      }

      if (update.status === 'invalidated' && update.traceHash) {
        set((s) => {
          s.walletManagement.pendingTransactions =
            s.walletManagement.pendingTransactions.filter(
              (p) =>
                p.externalHash !== update.traceHash &&
                p.traceId !== update.traceHash,
            );
        });
        return;
      }

      const txs = update.transactions as Transaction[];
      if (!txs || txs.length === 0) return;

      // Sort by logicalTime ascending to identify the initiating transaction
      const txsSorted = [...txs].sort((a, b) =>
        BigInt(a.logicalTime) < BigInt(b.logicalTime) ? -1 : 1,
      );
      const firstTx = txsSorted[0];

      // Derive a stable identifier: prefer traceExternalHash, fall back to hash of first tx
      const externalHash = firstTx.traceExternalHash || undefined;
      const traceId = firstTx.traceId
        ? Base64ToHex(firstTx.traceId)
        : firstTx.hash;

      // Build preview from the first tx's messages
      const hasExternalInMessage =
        firstTx.inMessage && !firstTx.inMessage.source;
      const outMsg = firstTx.outMessages?.[0];
      const inMsg = firstTx.inMessage;

      let previewType: 'send' | 'receive' | 'contract' = 'contract';
      let previewAmount = '0';
      let previewAddress = '';

      if (hasExternalInMessage && outMsg?.destination) {
        // External message with an outgoing transfer — user sent TON
        previewType = 'send';
        previewAmount = outMsg.value ?? '0';
        previewAddress = outMsg.destination;
      } else if (inMsg?.source && inMsg.value) {
        // Incoming internal message with value — user received TON
        previewType = 'receive';
        previewAmount = inMsg.value;
        previewAddress = inMsg.source;
      }

      set((s) => {
        const existingIndex = s.walletManagement.pendingTransactions.findIndex(
          (p) =>
            (externalHash &&
              p.externalHash &&
              p.externalHash === externalHash) ||
            p.traceId === traceId,
        );

        const pendingTx = {
          traceId,
          externalHash,
          action: undefined,
          finality: update.status,
          preview: {
            type: previewType,
            amount: previewAmount,
            address: previewAddress,
            timestamp: firstTx.now,
          },
        };

        if (existingIndex !== -1) {
          s.walletManagement.pendingTransactions[existingIndex] = {
            ...s.walletManagement.pendingTransactions[existingIndex],
            ...pendingTx,
          };
        } else {
          s.walletManagement.pendingTransactions.unshift(pendingTx);
        }
      });

      // On confirmed/finalized, refresh events and balance from REST
      if (update.status === 'confirmed' || update.status === 'finalized') {
        void get().loadEvents(15, 0, true);
      }
    },

    addPendingTransaction: (pendingTx) => {
      set((s) => {
        const existingIndex = s.walletManagement.pendingTransactions.findIndex(
          (p) =>
            (pendingTx.externalHash &&
              p.externalHash &&
              p.externalHash === pendingTx.externalHash) ||
            p.traceId === pendingTx.traceId,
        );

        if (existingIndex !== -1) {
          s.walletManagement.pendingTransactions[existingIndex] = {
            ...s.walletManagement.pendingTransactions[existingIndex],
            ...pendingTx,
          };
        } else {
          s.walletManagement.pendingTransactions.unshift(pendingTx);
        }
      });
    },

    removePendingTransaction: (traceIdOrExternalHash: string) => {
      set((s) => {
        s.walletManagement.pendingTransactions =
          s.walletManagement.pendingTransactions.filter(
            (p) =>
              p.traceId !== traceIdOrExternalHash &&
              p.externalHash !== traceIdOrExternalHash,
          );
      });
    },

    clearPendingTransactions: () => {
      set((s) => {
        s.walletManagement.pendingTransactions = [];
      });
    },

    loadEvents: async (
      limit = 15,
      offset = 0,
      force = false,
      tokenFilter?: string,
      extraAddresses?: string[],
    ) => {
      const state = get();
      const address = state.walletManagement.address;
      if (!address) {
        log.warn('No wallet address available to load events');
        return;
      }

      if (!state.walletCore.walletKit) {
        log.warn('WalletKit not initialized to load events');
        return;
      }

      const allSavedWallets = state.walletManagement.savedWallets;
      const associatedMap =
        state.walletManagement.associatedAddressesByAddress || {};
      const allAssociated = [
        ...Object.values(associatedMap).flat(),
        ...(extraAddresses || []),
      ];

      const primaryAddresses = Array.from(
        new Set(
          [
            address,
            ...allSavedWallets.map((w) => w.address).filter(Boolean),
          ].map((a) => String(a)),
        ),
      );

      const allAddresses = Array.from(
        new Set([...primaryAddresses, ...allAssociated]),
      );

      const key = `${allAddresses.sort().join(',')}:${limit}:${offset}:${tokenFilter || ''}`;
      if (inFlightLoadEvents && lastLoadEventsKey === key) {
        return inFlightLoadEvents;
      }

      // Cache check: If events were recently loaded for these addresses, reuse cache unless forced
      const now = Date.now();
      if (
        !force &&
        key === lastLoadEventsKey &&
        now - lastLoadEventsTime < EVENTS_CACHE_TTL_MS
      ) {
        set((state) => {
          state.walletManagement.events = (
            state.walletManagement.eventsByAddress[address] || []
          ).slice(0, limit);
        });
        return;
      }

      const run = async () => {
        try {
          log.info(
            'Loading events for addresses:',
            allAddresses,
            'limit:',
            limit,
            'offset:',
            offset,
            'tokenFilter:',
            tokenFilter,
          );

          const activeWallet = state.walletManagement.savedWallets.find(
            (w) => w.id === state.walletManagement.activeWalletId,
          );
          const walletNetwork = activeWallet?.network || 'testnet';

          // Single call passing all saved wallet addresses
          const response = await state.walletCore.walletKit
            ?.getApiClient(getChainNetwork(walletNetwork))
            .getEvents({
              account:
                allAddresses.length === 1 ? allAddresses[0] : allAddresses,
              limit: Math.max(limit, 15),
              offset,
              tokenFilter,
            });

          if (!response) return;

          set((state) => {
            // Partition events by wallet address
            const newEventsByAddress: Record<string, unknown[]> = {
              ...state.walletManagement.eventsByAddress,
            };

            for (const addr of primaryAddresses) {
              if (!newEventsByAddress[addr]) {
                newEventsByAddress[addr] = [];
              }
            }

            for (const ev of (response.events || []) as any[]) {
              let matched = false;
              for (const addr of primaryAddresses) {
                const associated = associatedMap[addr] || [];
                const belongs =
                  primaryAddresses.length === 1 ||
                  isAccountInEvent(ev, addr, associated);
                if (belongs) {
                  matched = true;
                  if (
                    !newEventsByAddress[addr].some(
                      (e: any) => e.eventId === ev.eventId,
                    )
                  ) {
                    newEventsByAddress[addr].push(ev);
                  }
                }
              }
              // If none matched explicitly but it was returned by the indexer during an active wallet query,
              // attribute it to the active wallet address so that unparsed or unusual transactions are not dropped.
              if (!matched && address) {
                if (
                  !newEventsByAddress[address].some(
                    (e: any) => e.eventId === ev.eventId,
                  )
                ) {
                  newEventsByAddress[address].push(ev);
                }
              }
            }

            // Sort events descending (newest first) and cap to prevent unbounded growth while supporting pagination
            const maxCap = Math.max(limit * 2, 250);
            for (const addr of primaryAddresses) {
              if (newEventsByAddress[addr]) {
                newEventsByAddress[addr].sort((a: any, b: any) => {
                  const ltA = Number(a?.lt ?? 0);
                  const ltB = Number(b?.lt ?? 0);
                  if (ltA && ltB && ltA !== ltB) return ltB - ltA;
                  const timeA = Number(a?.timestamp ?? 0);
                  const timeB = Number(b?.timestamp ?? 0);
                  return timeB - timeA;
                });
                if (newEventsByAddress[addr].length > maxCap) {
                  newEventsByAddress[addr] = newEventsByAddress[addr].slice(
                    0,
                    maxCap,
                  );
                }
              }
            }

            state.walletManagement.eventsByAddress = newEventsByAddress;
            state.walletManagement.events = (
              newEventsByAddress[address] || []
            ).slice(0, limit);
            state.walletManagement.hasNextEvents =
              Boolean(response.hasNext) ||
              (newEventsByAddress[address]?.length ?? 0) >= limit;

            const eventTraceIds = new Set<string>();
            const eventExtHashes = new Set<string>();
            for (const ev of response.events as Array<{
              eventId?: string;
              traceExternalHash?: string;
            }>) {
              if (ev.eventId) eventTraceIds.add(ev.eventId);
              if (ev.traceExternalHash)
                eventExtHashes.add(Base64ToHex(ev.traceExternalHash));
            }
            state.walletManagement.confirmedTraceIds = [
              ...state.walletManagement.confirmedTraceIds,
              ...eventTraceIds,
            ].slice(-50);
            state.walletManagement.confirmedExternalHashes = [
              ...state.walletManagement.confirmedExternalHashes,
              ...eventExtHashes,
            ].slice(-50);
            state.walletManagement.pendingTransactions =
              state.walletManagement.pendingTransactions.filter(
                (p) =>
                  !(p.traceId && eventTraceIds.has(p.traceId)) &&
                  !(p.externalHash && eventExtHashes.has(p.externalHash)),
              );
          });

          lastLoadEventsTime = Date.now();
          log.info(
            `Loaded ${response.events.length} events across all wallets`,
          );
        } catch (error) {
          log.error('Error loading events:', error);
        } finally {
          if (lastLoadEventsKey === key) {
            inFlightLoadEvents = null;
          }
        }
      };

      lastLoadEventsKey = key;
      inFlightLoadEvents = run();
      return inFlightLoadEvents;
    },

    getAvailableWallets: (): Wallet[] => {
      const state = get();
      if (!state.walletCore.walletKit) {
        return [];
      }
      return state.walletCore.walletKit.getWallets();
    },

    getActiveWallet: (): SavedWallet | undefined => {
      const state = get();
      if (!state.walletManagement.activeWalletId) {
        return undefined;
      }
      return state.walletManagement.savedWallets.find(
        (w) => w.id === state.walletManagement.activeWalletId,
      );
    },

    createAdapterFromSavedWallet: async (
      walletKit: ITonWalletKit,
      savedWallet: SavedWallet,
    ): Promise<WalletAdapter | undefined> => {
      const state = get();

      if (!state.auth.currentPassword) {
        throw new Error('Cannot load wallets: user is not authenticated');
      }

      let walletAdapter;
      const walletNetwork = savedWallet.network || 'testnet';

      if (savedWallet.walletType === 'ledger' && savedWallet.ledgerConfig) {
        if (!walletKitConfig?.createLedgerTransport) {
          log.warn(
            `Skipping Ledger wallet ${savedWallet.id}: createLedgerTransport not provided`,
          );
          return;
        }

        walletAdapter = await createWalletAdapter({
          useWalletInterfaceType: 'ledger',
          ledgerAccountNumber: savedWallet.ledgerConfig.accountIndex,
          storedLedgerConfig: savedWallet.ledgerConfig,
          network: walletNetwork,
          walletKit,
          version: savedWallet.version || 'v4r2',
          createLedgerTransport: walletKitConfig.createLedgerTransport,
        });
      } else if (savedWallet.encryptedMnemonic) {
        const mnemonicJson = await SimpleEncryption.decrypt(
          savedWallet.encryptedMnemonic,
          state.auth.currentPassword,
        );
        const mnemonic = JSON.parse(mnemonicJson) as string[];

        const resolvedSubwalletId =
          savedWallet.subwalletId ??
          (walletNetwork === 'testnet' ? 2147483645 : 2147483409);

        walletAdapter = await createWalletAdapter({
          mnemonic,
          useWalletInterfaceType: savedWallet.walletInterfaceType,
          ledgerAccountNumber: state.auth.ledgerAccountNumber,
          storedLedgerConfig: undefined,
          network: walletNetwork,
          walletKit,
          version: 'v5r1',
          walletId: resolvedSubwalletId,
        });
      }

      return walletAdapter;
    },
  });
