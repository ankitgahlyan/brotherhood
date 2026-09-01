/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  useWallet,
  useTonConnect,
  useTransactionRequests,
  useSignDataRequests,
  useSignMessageRequests,
} from '@demo/wallet-core';

import { ConnectRequestModal } from './connect-request-modal';
import { TransactionRequestModal } from './transaction-request-modal';
import { SignDataRequestModal } from './sign-data-request-modal';
import { SignMessageRequestModal } from './sign-message-request-modal';

export const GlobalRequestModals: React.FC = () => {
  const { getAvailableWallets, savedWallets, getActiveWallet } = useWallet();
  const activeWallet = getActiveWallet();

  const {
    pendingConnectRequest,
    isConnectModalOpen,
    approveConnectRequest,
    rejectConnectRequest,
  } = useTonConnect();

  const { pendingTransactionRequest, isTransactionModalOpen } =
    useTransactionRequests();

  const {
    pendingSignDataRequest,
    isSignDataModalOpen,
    approveSignDataRequest,
    rejectSignDataRequest,
  } = useSignDataRequests();

  const { pendingSignMessageRequest, isSignMessageModalOpen } =
    useSignMessageRequests();

  return (
    <>
      {pendingConnectRequest && (
        <ConnectRequestModal
          request={pendingConnectRequest}
          availableWallets={getAvailableWallets()}
          savedWallets={savedWallets}
          currentWallet={getAvailableWallets().find(
            (w) => w.getWalletId() === activeWallet?.kitWalletId,
          )}
          isOpen={isConnectModalOpen}
          onApprove={approveConnectRequest}
          onReject={rejectConnectRequest}
        />
      )}

      {pendingTransactionRequest && (
        <TransactionRequestModal
          request={pendingTransactionRequest}
          savedWallets={savedWallets}
          isOpen={isTransactionModalOpen}
        />
      )}

      {pendingSignDataRequest && (
        <SignDataRequestModal
          request={pendingSignDataRequest}
          savedWallets={savedWallets}
          isOpen={isSignDataModalOpen}
          onApprove={approveSignDataRequest}
          onReject={rejectSignDataRequest}
        />
      )}

      {pendingSignMessageRequest && (
        <SignMessageRequestModal
          request={pendingSignMessageRequest}
          savedWallets={savedWallets}
          isOpen={isSignMessageModalOpen}
        />
      )}
    </>
  );
};
