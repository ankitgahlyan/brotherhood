/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { SendTransactionRequestEvent } from '@ton/walletkit';
import { getNormalizedExtMessageHash } from '@ton/walletkit';
import {
  getTransactionExplorerUrls,
  useTransactionRequests,
} from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { RequestModal } from '../request-modal';
import { TransactionRequestDetails } from '../transaction-request-details';

import { useActiveWalletNetwork } from '@/features/jettons';
import { useExplorer } from '@/core/explorer';

interface TransactionRequestModalProps {
  request: SendTransactionRequestEvent;
  savedWallets: SavedWallet[];
  isOpen: boolean;
}

export const TransactionRequestModal: React.FC<
  TransactionRequestModalProps
> = ({ request, savedWallets, isOpen }) => {
  const network = useActiveWalletNetwork();
  const { explorer } = useExplorer();
  const { approveTransactionRequest, rejectTransactionRequest } =
    useTransactionRequests();

  const handleApprove = async () => {
    const result = await approveTransactionRequest();
    if (result?.signedBoc) {
      const { hash } = getNormalizedExtMessageHash(result.signedBoc);
      const { tonScan, tonViewer } = getTransactionExplorerUrls(hash, network);
      const primaryUrl = explorer === 'tonviewer' ? tonViewer : tonScan;
      const primaryLabel = explorer === 'tonviewer' ? 'TonViewer' : 'TonScan';
      const secondaryUrl = explorer === 'tonviewer' ? tonScan : tonViewer;
      const secondaryLabel = explorer === 'tonviewer' ? 'TonScan' : 'TonViewer';

      toast.success('Transaction is sent to the network', {
        description: (
          <span className="flex gap-3 mt-1 text-xs">
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold underline"
            >
              {primaryLabel} (Preferred)
            </a>
            <a
              href={secondaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground underline"
            >
              {secondaryLabel}
            </a>
          </span>
        ),
      });
    }
  };

  const handleReject = () => {
    rejectTransactionRequest('User rejected the transaction');
  };

  return (
    <RequestModal
      request={request}
      savedWallets={savedWallets}
      isOpen={isOpen}
      verb="Confirm transaction for"
      subtitle="A dApp wants to send a transaction from your wallet:"
      details={<TransactionRequestDetails request={request.request} />}
      approveLabel="Approve & Sign"
      disclaimer="Only approve transactions from dApps you trust. Blockchain transactions are irreversible."
      testIds={{
        approve: 'send-transaction-approve',
        reject: 'send-transaction-reject',
      }}
      modalTestId="transaction-request"
      onApprove={handleApprove}
      onReject={handleReject}
      loggerName="TransactionRequestModal"
      previewMode="send"
    />
  );
};
