/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell, Cell } from '@ton/core';
import { asAddressFriendly } from '@ton/walletkit';
import type {
  Wallet,
  SendTransactionRequestEvent,
  ConnectionRequestEvent,
  SignDataRequestEvent,
  SignMessageRequestEvent,
  DisconnectionEvent,
  TransactionRequestMessage,
} from '@ton/walletkit';

import { createComponentLogger } from '../../utils/logger';
import type {
  QueuedRequest,
  QueuedRequestData,
  DisconnectNotification,
} from '../../types/wallet';
import type { SetState, TonConnectSliceCreator } from '../../types/store';

const log = createComponentLogger('TonConnectSlice');

// Queue management constants
const MAX_QUEUE_SIZE = 100;
const MODAL_CLOSE_DELAY = 500;
const REQUEST_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CONTRACT_CALL_NANO = '50000000'; // 0.05 TON default when bin/init is provided without amount

let pendingExternalReturnStrategy: string | undefined;

function executeReturnStrategy(strategy?: string): void {
  const target = (strategy || pendingExternalReturnStrategy || '').trim();
  pendingExternalReturnStrategy = undefined;
  if (!target || target === 'back' || target === 'none') return;
  if (typeof window === 'undefined') return;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(target)) return;

  setTimeout(() => {
    try {
      const tgWebApp = (
        window as unknown as {
          Telegram?: {
            WebApp?: {
              openTelegramLink?: (url: string) => void;
              openLink?: (url: string) => void;
            };
          };
        }
      ).Telegram?.WebApp;
      if (
        (target.startsWith('https://t.me/') || target.startsWith('tg://')) &&
        tgWebApp?.openTelegramLink
      ) {
        if (target.startsWith('https://t.me/')) {
          tgWebApp.openTelegramLink(target);
          return;
        }
      }
      if (/^(https?):\/\//i.test(target) && tgWebApp?.openLink) {
        tgWebApp.openLink(target);
        return;
      }
      window.location.href = target;
    } catch (err) {
      log.warn('Failed to execute returnStrategy redirect:', err);
    }
  }, 350);
}

function decodeTonConnectStartParam(startParam: string): string | null {
  const trimmed = startParam.trim();
  if (!trimmed.startsWith('tonconnect-')) return null;
  const raw = trimmed.slice('tonconnect-'.length);
  if (!raw) return null;

  // TonConnect TMA startapp encoding:
  // '--' -> literal '-', '-' -> '&', '__' -> '=', '_XX' -> '%XX'
  const HYPHEN_TOKEN = '\u0000';
  const step1 = raw.replace(/--/g, HYPHEN_TOKEN);
  const pairs = step1.split('-');
  const queryParts: string[] = [];
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('__');
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).replaceAll(HYPHEN_TOKEN, '-');
    const valRaw = pair
      .slice(eqIdx + 2)
      .replaceAll(HYPHEN_TOKEN, '-')
      .replace(/_([0-9a-fA-F]{2})/g, '%$1');
    try {
      const decodedVal = decodeURIComponent(valRaw);
      queryParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(decodedVal)}`,
      );
    } catch {
      queryParts.push(`${encodeURIComponent(key)}=${valRaw}`);
    }
  }
  if (queryParts.length === 0) return null;
  return `tc://?${queryParts.join('&')}`;
}

function unwrapIncomingTonUrl(rawInput: string): string {
  let trimmed = rawInput.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('tonconnect-')) {
    return decodeTonConnectStartParam(trimmed) ?? trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const wrappedUrl =
      parsed.searchParams.get('url') || parsed.searchParams.get('tonconnect');
    if (wrappedUrl) {
      trimmed = decodeURIComponent(wrappedUrl.trim());
    } else {
      const startApp =
        parsed.searchParams.get('startapp') ||
        parsed.searchParams.get('tgWebAppStartParam');
      if (startApp) {
        const decodedStart = decodeTonConnectStartParam(startApp);
        if (decodedStart) return decodedStart;
        trimmed = decodeURIComponent(startApp.trim());
      }
    }
  } catch {
    // Not a standard URL or relative
  }

  if (trimmed.startsWith('web+ton://')) {
    return `ton://${trimmed.slice('web+ton://'.length)}`;
  }
  if (trimmed.startsWith('web+tonconnect://')) {
    return `tc://${trimmed.slice('web+tonconnect://'.length)}`;
  }
  if (trimmed.startsWith('tonconnect://')) {
    return `tc://${trimmed.slice('tonconnect://'.length)}`;
  }
  return trimmed;
}

function normalizeBocBase64(rawBoc: string): string {
  const cleaned = rawBoc.trim().replace(/-/g, '+').replace(/_/g, '/');
  const padded = cleaned.padEnd(
    cleaned.length + ((4 - (cleaned.length % 4)) % 4),
    '=',
  );
  const cell = Cell.fromBoc(Buffer.from(padded, 'base64'))[0];
  if (!cell) {
    throw new Error('Invalid BOC payload');
  }
  return cell.toBoc().toString('base64');
}

function encodeTextCommentBocBase64(text: string): string {
  return beginCell()
    .storeUint(0, 32)
    .storeStringTail(text)
    .endCell()
    .toBoc()
    .toString('base64');
}

function nanoToDecimalTonString(nanoStr: string): string {
  const trimmed = nanoStr.trim();
  if (!trimmed) return '';
  if (trimmed.includes('.')) return trimmed;
  try {
    const n = BigInt(trimmed);
    if (n <= 0n) return '';
    const whole = n / 1_000_000_000n;
    const frac = n % 1_000_000_000n;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(9, '0').replace(/0+$/, '');
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return trimmed;
  }
}

interface ParsedTonTransferLink {
  address: string;
  amount?: string;
  bin?: string;
  init?: string;
  text?: string;
  jetton?: string;
  validUntil?: number;
  returnStrategy?: string;
}

function parseTonTransferLink(url: string): ParsedTonTransferLink | null {
  const trimmed = url.trim();
  let addressPart = '';
  let queryString = '';

  const transferMatch = trimmed.match(
    /^(?:ton:\/\/transfer\/|https?:\/\/[^/]+\/(?:brotherhood\/(?:web\/)?)?transfer\/)([^?#]+)(?:\?([^#]*))?/i,
  );
  if (transferMatch) {
    addressPart = decodeURIComponent(transferMatch[1].replace(/\/+$/, ''));
    queryString = transferMatch[2] || '';
  } else {
    // Also support bare `<tonAddress>?amount=...` (e.g. if prefix was stripped)
    const bareMatch = trimmed.match(/^([0-9a-zA-Z_:+-]{48,66})(?:\?([^#]*))?$/);
    if (bareMatch) {
      addressPart = bareMatch[1];
      queryString = bareMatch[2] || '';
    } else {
      return null;
    }
  }

  try {
    Address.parse(addressPart);
  } catch {
    return null;
  }

  const sp = new URLSearchParams(queryString);
  const amount = sp.get('amount')?.trim() || undefined;
  const bin = (sp.get('bin') || sp.get('body'))?.trim() || undefined;
  const init = (sp.get('init') || sp.get('stateInit'))?.trim() || undefined;
  const text = (sp.get('text') || sp.get('comment')) ?? undefined;
  const jetton = sp.get('jetton')?.trim() || undefined;
  const expRaw = (sp.get('exp') || sp.get('validUntil'))?.trim();
  const validUntil =
    expRaw && /^\d+$/.test(expRaw) ? Number(expRaw) : undefined;
  const returnStrategy =
    (sp.get('ret') || sp.get('returnStrategy') || sp.get('callback'))?.trim() ||
    undefined;

  return {
    address: addressPart,
    amount,
    bin,
    init,
    text,
    jetton,
    validUntil,
    returnStrategy,
  };
}

export const createTonConnectSlice: TonConnectSliceCreator = (
  set: SetState,
  get,
) => ({
  tonConnect: {
    requestQueue: {
      items: [],
      currentRequestId: undefined,
      isProcessing: false,
    },
    pendingConnectRequestEvent: undefined,
    isConnectModalOpen: false,
    pendingTransactionRequestEvent: undefined,
    isTransactionModalOpen: false,
    pendingSignDataRequestEvent: undefined,
    isSignDataModalOpen: false,
    pendingSignMessageRequestEvent: undefined,
    isSignMessageModalOpen: false,
    disconnectedSessions: [],
    connectedSessions: [],
  },

  // TON Connect & ton://transfer URL handling
  handleTonConnectUrl: async (rawUrl: string) => {
    const state = get();
    if (!state.walletCore.walletKit) {
      throw new Error('WalletKit not initialized');
    }

    const url = unwrapIncomingTonUrl(rawUrl);
    if (!url) {
      throw new Error('Empty TON link');
    }

    // 1. Check if this is a `ton://transfer/<address>?...` deep link
    const transferLink = parseTonTransferLink(url);
    if (transferLink) {
      const hasContractCall = Boolean(transferLink.bin || transferLink.init);
      const shouldOpenSendForm =
        Boolean(transferLink.jetton) ||
        (!transferLink.amount && !hasContractCall);

      if (shouldOpenSendForm) {
        if (
          typeof window !== 'undefined' &&
          typeof window.dispatchEvent === 'function'
        ) {
          const formattedAmount = transferLink.amount
            ? transferLink.jetton
              ? transferLink.amount
              : nanoToDecimalTonString(transferLink.amount)
            : '';
          window.dispatchEvent(
            new CustomEvent('brotherhood_navigate_send', {
              detail: {
                recipient: transferLink.address,
                amount: formattedAmount,
                token: transferLink.jetton || '',
                comment: transferLink.text || '',
              },
            }),
          );
        }
        return;
      }

      // Route directly into TransactionRequestModal via handleNewTransaction
      const walletKit = state.walletCore.walletKit;
      const activeSaved = state.walletManagement.savedWallets.find(
        (w) => w.id === state.walletManagement.activeWalletId,
      );
      let signingWallet: Wallet | null | undefined =
        state.walletManagement.currentWallet;

      if (
        !signingWallet ||
        activeSaved?.walletType === 'watch-only' ||
        activeSaved?.isWatchOnly
      ) {
        const nonWatchSaved = state.walletManagement.savedWallets.find(
          (w) =>
            w.walletType !== 'watch-only' && !w.isWatchOnly && w.kitWalletId,
        );
        if (nonWatchSaved?.kitWalletId) {
          signingWallet = walletKit.getWallet(nonWatchSaved.kitWalletId);
        }
      }
      if (!signingWallet) {
        const allWallets = walletKit.getWallets();
        signingWallet = allWallets[0];
      }
      if (!signingWallet) {
        throw new Error('No signing wallet available');
      }

      let payload: string | undefined;
      if (transferLink.bin) {
        payload = normalizeBocBase64(transferLink.bin);
      } else if (transferLink.text) {
        payload = encodeTextCommentBocBase64(transferLink.text);
      }

      const stateInit = transferLink.init
        ? normalizeBocBase64(transferLink.init)
        : undefined;

      const amountNano =
        transferLink.amount && /^\d+$/.test(transferLink.amount)
          ? transferLink.amount
          : transferLink.amount
            ? String(
                Math.round(parseFloat(transferLink.amount) * 1_000_000_000),
              )
            : DEFAULT_CONTRACT_CALL_NANO;

      const message: TransactionRequestMessage = {
        address: asAddressFriendly(transferLink.address),
        amount: amountNano,
        ...(payload ? { payload } : {}),
        ...(stateInit ? { stateInit } : {}),
      };

      pendingExternalReturnStrategy = transferLink.returnStrategy;

      await walletKit.handleNewTransaction(signingWallet, {
        messages: [message],
        validUntil: transferLink.validUntil,
        network: signingWallet.getNetwork(),
      });
      return;
    }

    // 2. Standard TonConnect v2 URL (`tc://...`, `https://...?v=2&id=...&r=...`)
    try {
      log.info('Handling TON Connect URL:', url);
      try {
        const parsedTc = new URL(url);
        const retParam = parsedTc.searchParams.get('ret');
        if (retParam) {
          pendingExternalReturnStrategy = retParam;
        }
      } catch {
        /* ignore */
      }
      await state.walletCore.walletKit.handleTonConnectUrl(url);
      log.info('Handled TON Connect URL');
    } catch (error) {
      log.error('Failed to handle TON Connect URL:', error);
      throw new Error('Failed to process TON Connect link');
    }
  },

  // Connect request actions
  showConnectRequest: (request: ConnectionRequestEvent) => {
    set((state) => {
      state.tonConnect.pendingConnectRequestEvent = request;
      state.tonConnect.isConnectModalOpen = true;
    });
  },

  approveConnectRequest: async (selectedWallet: Wallet) => {
    const state = get();
    if (!state.tonConnect.pendingConnectRequestEvent) {
      log.error('No pending connect request to approve');
      return;
    }

    if (!state.walletCore.walletKit) {
      throw new Error('WalletKit not initialized');
    }

    try {
      const event: ConnectionRequestEvent = {
        ...state.tonConnect.pendingConnectRequestEvent,
        walletAddress: selectedWallet.getAddress(),
        walletId: selectedWallet.getWalletId(),
      };
      const returnStrategy =
        (
          event as unknown as {
            returnStrategy?: string;
            params?: { returnStrategy?: string };
          }
        )?.params?.returnStrategy ??
        (event as unknown as { returnStrategy?: string })?.returnStrategy;

      const embeddedRequest =
        await state.walletCore.walletKit.approveConnectRequest(event);

      state.clearCurrentRequestFromQueue();
      set((state) => {
        state.tonConnect.pendingConnectRequestEvent = undefined;
        state.tonConnect.isConnectModalOpen = false;
      });

      if (embeddedRequest) {
        switch (embeddedRequest.type) {
          case 'sendTransaction':
            get().enqueueRequest({
              type: 'transaction',
              request: embeddedRequest,
            });
            break;
          case 'signMessage':
            get().enqueueRequest({
              type: 'signMessage',
              request: embeddedRequest,
            });
            break;
          case 'signData':
            get().enqueueRequest({
              type: 'signData',
              request: embeddedRequest,
            });
            break;
        }
      } else {
        executeReturnStrategy(returnStrategy);
      }
    } catch (error) {
      log.error('Failed to approve connect request:', error);
      state.clearCurrentRequestFromQueue();
      throw error;
    }
  },

  rejectConnectRequest: async (reason?: string) => {
    const state = get();
    if (!state.tonConnect.pendingConnectRequestEvent) {
      log.error('No pending connect request to reject');
      return;
    }

    const pendingEvent = state.tonConnect
      .pendingConnectRequestEvent as unknown as {
      returnStrategy?: string;
      params?: { returnStrategy?: string };
    };
    const returnStrategy =
      pendingEvent?.params?.returnStrategy ?? pendingEvent?.returnStrategy;

    const closeModal = () => {
      set((state) => {
        state.tonConnect.pendingConnectRequestEvent = undefined;
        state.tonConnect.isConnectModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
    };

    if (!state.walletCore.walletKit) {
      log.error('WalletKit not initialized');
      closeModal();
      return;
    }

    try {
      await state.walletCore.walletKit.rejectConnectRequest(
        state.tonConnect.pendingConnectRequestEvent,
        reason,
      );
    } catch (error) {
      log.error('Failed to reject connect request:', error);
    }

    closeModal();
    executeReturnStrategy(returnStrategy);
  },

  closeConnectModal: () => {
    set((state) => {
      state.tonConnect.isConnectModalOpen = false;
      state.tonConnect.pendingConnectRequestEvent = undefined;
    });
    get().clearCurrentRequestFromQueue();
  },

  // Connected Sessions management
  loadConnectedSessions: async () => {
    const state = get();
    if (!state.walletCore.walletKit) {
      return [];
    }
    try {
      const sessions = await state.walletCore.walletKit.listSessions();
      set((state) => {
        state.tonConnect.connectedSessions = sessions;
      });
      return sessions;
    } catch (error) {
      log.error('Failed to list sessions:', error);
      return [];
    }
  },

  disconnectSession: async (sessionId: string) => {
    const state = get();
    if (!state.walletCore.walletKit) {
      return;
    }
    try {
      await state.walletCore.walletKit.disconnect(sessionId);
      set((state) => {
        state.tonConnect.connectedSessions = (
          state.tonConnect.connectedSessions || []
        ).filter((s) => s.sessionId !== sessionId);
      });
    } catch (error) {
      log.error('Failed to disconnect session:', error);
    }
  },

  disconnectAllSessions: async () => {
    const state = get();
    if (!state.walletCore.walletKit) {
      return;
    }
    try {
      await state.walletCore.walletKit.disconnect();
      set((state) => {
        state.tonConnect.connectedSessions = [];
      });
    } catch (error) {
      log.error('Failed to disconnect all sessions:', error);
    }
  },

  // Transaction request actions
  showTransactionRequest: (request: SendTransactionRequestEvent) => {
    set((state) => {
      state.tonConnect.pendingTransactionRequestEvent = request;
      state.tonConnect.isTransactionModalOpen = true;
    });
  },

  approveTransactionRequest: async () => {
    const state = get();
    if (!state.tonConnect.pendingTransactionRequestEvent) {
      log.error('No pending transaction request to approve');
      return undefined;
    }

    if (!state.walletCore.walletKit) {
      throw new Error('WalletKit not initialized');
    }

    try {
      const result = await state.walletCore.walletKit.approveTransactionRequest(
        state.tonConnect.pendingTransactionRequestEvent,
      );

      set((state) => {
        state.tonConnect.pendingTransactionRequestEvent = undefined;
        state.tonConnect.isTransactionModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
      if (
        typeof window !== 'undefined' &&
        typeof window.dispatchEvent === 'function'
      ) {
        window.dispatchEvent(
          new CustomEvent('brotherhood_tx_modal_approved', {
            detail: {
              isStreamingConnected: Boolean(
                get().walletManagement?.isStreamingConnected,
              ),
            },
          }),
        );
      }
      executeReturnStrategy();
      return result;
    } catch (error) {
      log.error('Failed to approve transaction request:', error);
      state.clearCurrentRequestFromQueue();
      if (
        typeof window !== 'undefined' &&
        typeof window.dispatchEvent === 'function'
      ) {
        window.dispatchEvent(new CustomEvent('brotherhood_tx_modal_rejected'));
      }
      throw error;
    }
  },

  rejectTransactionRequest: async (reason?: string) => {
    const state = get();
    if (
      typeof window !== 'undefined' &&
      typeof window.dispatchEvent === 'function'
    ) {
      window.dispatchEvent(new CustomEvent('brotherhood_tx_modal_rejected'));
    }
    if (!state.tonConnect.pendingTransactionRequestEvent) {
      log.error('No pending transaction request to reject');
      return;
    }

    if (!state.walletCore.walletKit) {
      // Close modal even if walletKit is not initialized
      set((state) => {
        state.tonConnect.pendingTransactionRequestEvent = undefined;
        state.tonConnect.isTransactionModalOpen = false;
      });
      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
      return;
    }

    try {
      await state.walletCore.walletKit.rejectTransactionRequest(
        state.tonConnect.pendingTransactionRequestEvent,
        reason,
      );
    } catch (error) {
      log.error('Failed to reject transaction request:', error);
    } finally {
      set((state) => {
        state.tonConnect.pendingTransactionRequestEvent = undefined;
        state.tonConnect.isTransactionModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
    }
  },

  closeTransactionModal: () => {
    set((state) => {
      state.tonConnect.isTransactionModalOpen = false;
      state.tonConnect.pendingTransactionRequestEvent = undefined;
    });
    get().clearCurrentRequestFromQueue();
  },

  // Sign data request actions
  showSignDataRequest: (request: SignDataRequestEvent) => {
    set((state) => {
      state.tonConnect.pendingSignDataRequestEvent = request;
      state.tonConnect.isSignDataModalOpen = true;
    });
  },

  approveSignDataRequest: async () => {
    const state = get();
    if (!state.tonConnect.pendingSignDataRequestEvent) {
      log.error('No pending sign data request to approve');
      return;
    }

    if (!state.walletCore.walletKit) {
      throw new Error('WalletKit not initialized');
    }

    try {
      await state.walletCore.walletKit.approveSignDataRequest(
        state.tonConnect.pendingSignDataRequestEvent,
      );

      set((state) => {
        state.tonConnect.pendingSignDataRequestEvent = undefined;
        state.tonConnect.isSignDataModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
    } catch (error) {
      log.error('Failed to approve sign data request:', error);
      state.clearCurrentRequestFromQueue();
      throw error;
    }
  },

  rejectSignDataRequest: async (reason?: string) => {
    const state = get();
    if (!state.tonConnect.pendingSignDataRequestEvent) {
      log.error('No pending sign data request to reject');
      return;
    }

    if (!state.walletCore.walletKit) {
      // Close modal even if walletKit is not initialized
      set((state) => {
        state.tonConnect.pendingSignDataRequestEvent = undefined;
        state.tonConnect.isSignDataModalOpen = false;
      });
      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
      return;
    }

    try {
      await state.walletCore.walletKit.rejectSignDataRequest(
        state.tonConnect.pendingSignDataRequestEvent,
        reason,
      );
    } catch (error) {
      log.error('Failed to reject sign data request:', error);
    } finally {
      set((state) => {
        state.tonConnect.pendingSignDataRequestEvent = undefined;
        state.tonConnect.isSignDataModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
    }
  },

  closeSignDataModal: () => {
    set((state) => {
      state.tonConnect.isSignDataModalOpen = false;
      state.tonConnect.pendingSignDataRequestEvent = undefined;
    });
    get().clearCurrentRequestFromQueue();
  },

  // Sign message request actions
  showSignMessageRequest: (request: SignMessageRequestEvent) => {
    set((state) => {
      state.tonConnect.pendingSignMessageRequestEvent = request;
      state.tonConnect.isSignMessageModalOpen = true;
    });
  },

  approveSignMessageRequest: async () => {
    const state = get();
    if (!state.tonConnect.pendingSignMessageRequestEvent) {
      log.error('No pending sign message request to approve');
      return;
    }
    if (!state.walletCore.walletKit) {
      throw new Error('WalletKit not initialized');
    }
    try {
      await state.walletCore.walletKit.approveSignMessageRequest(
        state.tonConnect.pendingSignMessageRequestEvent,
      );

      set((state) => {
        state.tonConnect.pendingSignMessageRequestEvent = undefined;
        state.tonConnect.isSignMessageModalOpen = false;
      });

      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
    } catch (error) {
      log.error('Failed to approve sign message request:', error);
      state.clearCurrentRequestFromQueue();
      throw error;
    }
  },

  rejectSignMessageRequest: async (reason?: string) => {
    const state = get();
    if (!state.tonConnect.pendingSignMessageRequestEvent) {
      log.error('No pending sign message request to reject');
      return;
    }
    if (!state.walletCore.walletKit) {
      set((state) => {
        state.tonConnect.pendingSignMessageRequestEvent = undefined;
        state.tonConnect.isSignMessageModalOpen = false;
      });
      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
      return;
    }
    try {
      await state.walletCore.walletKit.rejectSignMessageRequest(
        state.tonConnect.pendingSignMessageRequestEvent,
        reason,
      );
    } catch (error) {
      log.error('Failed to reject sign message request:', error);
    } finally {
      set((state) => {
        state.tonConnect.pendingSignMessageRequestEvent = undefined;
        state.tonConnect.isSignMessageModalOpen = false;
      });
      state.clearCurrentRequestFromQueue();
      executeReturnStrategy();
    }
  },

  closeSignMessageModal: () => {
    set((state) => {
      state.tonConnect.isSignMessageModalOpen = false;
      state.tonConnect.pendingSignMessageRequestEvent = undefined;
    });
    get().clearCurrentRequestFromQueue();
  },

  // Disconnect events
  handleDisconnectEvent: (event: DisconnectionEvent) => {
    log.info('Disconnect event received:', event);

    set((state) => {
      state.tonConnect.disconnectedSessions.push({
        walletAddress: event.walletAddress,
        reason: event.preview.reason,
        timestamp: Date.now(),
      } as DisconnectNotification);
    });
  },

  clearDisconnectNotifications: () => {
    set((state) => {
      state.tonConnect.disconnectedSessions = [];
    });
  },

  // Queue management
  enqueueRequest: (request: QueuedRequestData) => {
    const state = get();

    const requestId = `${request.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (state.tonConnect.requestQueue.items.length >= MAX_QUEUE_SIZE) {
      log.warn('Queue is full, attempting to clear expired requests');

      get().clearExpiredRequests();

      const updatedState = get();
      if (updatedState.tonConnect.requestQueue.items.length >= MAX_QUEUE_SIZE) {
        log.error(
          `Queue overflow: cannot add more requests. Queue is full (${MAX_QUEUE_SIZE} items). Please approve or reject pending requests.`,
        );
        return;
      }
    }

    const now = Date.now();
    const queuedRequest: QueuedRequest = {
      ...request,
      id: requestId,
      timestamp: now,
      expiresAt: now + REQUEST_EXPIRATION_TIME,
    };

    set((state) => {
      state.tonConnect.requestQueue.items.push(queuedRequest);
    });

    log.info(`Enqueued ${request.type} request`, {
      requestId,
      queueSize: state.tonConnect.requestQueue.items.length + 1,
    });

    if (!state.tonConnect.requestQueue.isProcessing) {
      get().processNextRequest();
    }
  },

  processNextRequest: () => {
    const state = get();

    if (state.tonConnect.requestQueue.isProcessing) {
      log.info('Already processing a request, skipping');
      return;
    }

    const nextRequest = state.tonConnect.requestQueue.items[0];
    if (!nextRequest) {
      log.info('No more requests in queue');
      return;
    }

    if (nextRequest.expiresAt < Date.now()) {
      log.warn('Next request has expired, removing and trying next', {
        requestId: nextRequest.id,
      });
      set((state) => {
        state.tonConnect.requestQueue.items.shift();
      });
      get().processNextRequest();
      return;
    }

    log.info(`Processing ${nextRequest.type} request`, {
      requestId: nextRequest.id,
    });

    set((state) => {
      state.tonConnect.requestQueue.isProcessing = true;
      state.tonConnect.requestQueue.currentRequestId = nextRequest.id;
    });

    if (nextRequest.type === 'connect') {
      get().showConnectRequest(nextRequest.request);
    } else if (nextRequest.type === 'transaction') {
      get().showTransactionRequest(nextRequest.request);
    } else if (nextRequest.type === 'signData') {
      get().showSignDataRequest(nextRequest.request);
    } else if (nextRequest.type === 'signMessage') {
      get().showSignMessageRequest(nextRequest.request);
    }
  },

  clearExpiredRequests: () => {
    const now = Date.now();
    set((state) => {
      const originalLength = state.tonConnect.requestQueue.items.length;
      state.tonConnect.requestQueue.items =
        state.tonConnect.requestQueue.items.filter(
          (item) => item.expiresAt > now,
        );
      const removedCount =
        originalLength - state.tonConnect.requestQueue.items.length;
      if (removedCount > 0) {
        log.info(`Cleared ${removedCount} expired requests from queue`);
      }
    });
  },

  getCurrentRequest: () => {
    const state = get();
    if (!state.tonConnect.requestQueue.currentRequestId) {
      return undefined;
    }
    return state.tonConnect.requestQueue.items.find(
      (item) => item.id === state.tonConnect.requestQueue.currentRequestId,
    );
  },

  clearCurrentRequestFromQueue: () => {
    set((state) => {
      const currentId = state.tonConnect.requestQueue.currentRequestId;
      state.tonConnect.requestQueue.items =
        state.tonConnect.requestQueue.items.filter(
          (item) => item.id !== currentId,
        );
      state.tonConnect.requestQueue.currentRequestId = undefined;
      state.tonConnect.requestQueue.isProcessing = false;
    });

    setTimeout(() => {
      get().processNextRequest();
    }, MODAL_CLOSE_DELAY);
  },

  // Setup WalletKit event listeners (called from walletCoreSlice)
  setupTonConnectListeners: (walletKit) => {
    walletKit.onConnectRequest((event) => {
      log.info('Connect request received:', event);
      if (event?.preview?.manifestFetchErrorCode) {
        log.error(
          'Connect request received with manifest fetch error:',
          event?.preview?.manifestFetchErrorCode,
        );
        walletKit.rejectConnectRequest(
          event,
          event?.preview?.manifestFetchErrorCode == 2
            ? 'App manifest not found'
            : event?.preview?.manifestFetchErrorCode == 3
              ? 'App manifest content error'
              : undefined,
          event.preview.manifestFetchErrorCode,
        );
        return;
      }
      get().enqueueRequest({
        type: 'connect',
        request: event,
      });
    });

    walletKit.onTransactionRequest(
      async (event: SendTransactionRequestEvent) => {
        const wallet = await walletKit.getWallet(event.walletId ?? '');
        if (!wallet) {
          log.error('Wallet not found for transaction request', {
            walletId: event.walletId,
          });
          return;
        }

        get().enqueueRequest({
          type: 'transaction',
          request: event,
        });
      },
    );

    walletKit.onSignDataRequest((event) => {
      log.info('Sign data request received:', event);
      get().enqueueRequest({
        type: 'signData',
        request: event,
      });
    });

    walletKit.onSignMessageRequest((event) => {
      log.info('Sign message request received:', event);
      get().enqueueRequest({
        type: 'signMessage',
        request: event,
      });
    });

    walletKit.onDisconnect((event) => {
      log.info('Disconnect event received:', event);
      get().handleDisconnectEvent(event);
    });

    log.info('TonConnect listeners initialized');
  },
});
