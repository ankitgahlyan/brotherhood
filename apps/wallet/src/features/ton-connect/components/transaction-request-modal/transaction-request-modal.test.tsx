import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

let mockFastSend = false;
let mockUnlocked = true;
let approveCalled = false;

mock.module('@demo/wallet-core', () => ({
  useTransactionRequests: () => ({
    approveTransactionRequest: async () => {
      approveCalled = true;
      return { signedBoc: 'te6cckEBAQEAAgAAAEysuc0=' };
    },
    rejectTransactionRequest: mock(),
  }),
  useAuth: () => ({
    showFastSend: mockFastSend,
    isUnlocked: mockUnlocked,
  }),
  getTransactionExplorerUrls: () => ({
    tonScan: 'https://testnet.tonscan.org/tx/123',
    tonViewer: 'https://testnet.tonviewer.com/transaction/123',
    actonScan: 'https://actonscan.com/tx/123',
  }),
}));

mock.module('@/features/jettons', () => ({
  useActiveWalletNetwork: () => 'testnet',
}));

mock.module('@/core/explorer', () => ({
  useExplorer: () => ({ explorer: 'tonviewer', setExplorer: () => {} }),
}));

mock.module('../request-modal', () => ({
  RequestModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="request-modal" data-open={isOpen ? 'true' : 'false'}>
      {isOpen ? 'Modal Content' : null}
    </div>
  ),
}));

mock.module('../transaction-request-details', () => ({
  TransactionRequestDetails: () => <div>Details</div>,
}));

import { TransactionRequestModal } from './transaction-request-modal';

describe('TransactionRequestModal Fast Send', () => {
  const dummyRequest: any = {
    id: 'req-1',
    walletId: 'w1',
    request: {
      messages: [{ address: '0:123', amount: '1000' }],
    },
  };

  it('renders modal when fast send is disabled', () => {
    mockFastSend = false;
    mockUnlocked = true;

    const html = renderToString(
      <TransactionRequestModal
        request={dummyRequest}
        savedWallets={[]}
        isOpen={true}
      />,
    );

    expect(html).toContain('data-open="true"');
    expect(html).toContain('Modal Content');
  });

  it('hides modal when fast send is enabled and wallet is unlocked', () => {
    mockFastSend = true;
    mockUnlocked = true;

    const html = renderToString(
      <TransactionRequestModal
        request={dummyRequest}
        savedWallets={[]}
        isOpen={true}
      />,
    );

    expect(html).toContain('data-open="false"');
    expect(html).not.toContain('Modal Content');
  });

  it('renders modal when fast send is enabled but wallet is locked', () => {
    mockFastSend = true;
    mockUnlocked = false;

    const html = renderToString(
      <TransactionRequestModal
        request={dummyRequest}
        savedWallets={[]}
        isOpen={true}
      />,
    );

    expect(html).toContain('data-open="true"');
    expect(html).toContain('Modal Content');
  });
});
