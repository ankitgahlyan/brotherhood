/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronRight, History } from 'lucide-react';
import { useWalletStore } from '@demo/wallet-core';
import { useNavigate } from '@/core/routing';

/**
 * Dashboard "Transaction History" button row below assets: opens `/wallet/history` without auto-fetching traces on startup.
 */
export const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const pendingCount = useWalletStore(
    (state) => state.walletManagement.pendingTransactions.length,
  );

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate('/wallet/history')}
        className="w-full flex items-center gap-3 p-3 text-left rounded-2xl bg-card border border-border/60 hover:bg-secondary/50 active:bg-secondary/80 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open transaction history"
        data-testid="dashboard-open-history-btn"
      >
        <span className="w-10 h-10 rounded-full flex-shrink-0 bg-secondary border border-border flex items-center justify-center text-primary">
          <History className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Transaction History</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary">
                <span className="w-2 h-2 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                <span>{pendingCount} pending</span>
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            View transfers & contract calls
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
      </button>
    </section>
  );
};
