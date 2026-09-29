/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useWalletStore } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';

import { ActivityList } from '../activity-list';
import { useTransactionRows } from '../../hooks/use-transaction-rows';
import { RefreshButton } from '@/core/components/ui/refresh-button';

const PREVIEW_COUNT = 10;
// Load a few extra so the preview still fills 10 rows after action-less events are skipped.
const PREVIEW_LOAD = 20;

/**
 * Dashboard "History" block: the latest transactions with wallet-v2 date separators and pill badges.
 */
export const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { rows } = useTransactionRows(PREVIEW_LOAD);
  const pendingTransactions = useWalletStore(
    (state) => state.walletManagement.pendingTransactions,
  );
  const loadEvents = useWalletStore((state) => state.loadEvents);
  const isSyncing = pendingTransactions.length > 0;
  const preview = rows.slice(0, PREVIEW_COUNT);

  const handleRefresh = async () => {
    await loadEvents(PREVIEW_LOAD, 0, true);
  };

  if (preview.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/wallet/history')}
          className="flex items-center gap-1 group cursor-pointer"
          aria-label="View all transactions"
        >
          <h2 className="text-base font-semibold text-foreground">History</h2>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <RefreshButton
          iconOnly
          onRefresh={handleRefresh}
          title="Refresh transaction traces"
          testId="dashboard-history-refresh-btn"
        />
      </div>

      <ActivityList rows={preview} isSyncing={isSyncing} />
    </section>
  );
};
