import React from 'react';
import { toast } from 'sonner';
import type { NetworkType } from '@demo/wallet-core';
import { getTransactionExplorerUrls } from '@demo/wallet-core';
import type { ExplorerChoice } from '@/core/explorer';

export function notifyTransactionSent(
  normalizedHash: string,
  network: NetworkType,
  explorer: ExplorerChoice = 'tonviewer',
) {
  const { tonScan, tonViewer, actonScan } = getTransactionExplorerUrls(
    normalizedHash,
    network,
  );
  const primaryUrl =
    explorer === 'tonviewer'
      ? tonViewer
      : explorer === 'actonscan'
        ? actonScan
        : tonScan;
  const primaryLabel =
    explorer === 'tonviewer'
      ? 'TonViewer'
      : explorer === 'actonscan'
        ? 'ActonScan'
        : 'TonScan';
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
