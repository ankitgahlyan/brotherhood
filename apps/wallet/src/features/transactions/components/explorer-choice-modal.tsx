/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Copy, ExternalLink, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { Modal } from '@/core/components/ui/modal';
import {
  useExplorer,
  getExplorerTxUrl,
  type ExplorerChoice,
} from '@/core/explorer';
import type { NetworkType } from '@demo/wallet-core';

interface ExplorerChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  network?: NetworkType;
}

interface ExplorerOption {
  id: ExplorerChoice;
  name: string;
  host: (net: NetworkType) => string;
}

const EXPLORER_OPTIONS: ExplorerOption[] = [
  {
    id: 'tonscan',
    name: 'TonScan',
    host: (net) =>
      net === 'testnet'
        ? 'testnet.tonscan.org'
        : net === 'tetra'
          ? 'tetra.tonscan.org'
          : 'tonscan.org',
  },
  {
    id: 'tonviewer',
    name: 'TonViewer',
    host: (net) =>
      net === 'testnet'
        ? 'testnet.tonviewer.com'
        : net === 'tetra'
          ? 'tetra.tonviewer.com'
          : 'tonviewer.com',
  },
  {
    id: 'actonscan',
    name: 'ActonScan',
    host: (net) =>
      net === 'testnet' ? 'actonscan.com (?network=testnet)' : 'actonscan.com',
  },
];

export const ExplorerChoiceModal: React.FC<ExplorerChoiceModalProps> = ({
  isOpen,
  onClose,
  txHash,
  network = 'testnet',
}) => {
  const { explorer: defaultExplorer, setExplorer } = useExplorer();
  const [setAsDefault, setSetAsDefault] = useState(false);

  if (!txHash) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      toast.success('Transaction hash copied');
    } catch {
      toast.error('Failed to copy hash');
    }
  };

  const handleOpenExplorer = (choice: ExplorerChoice) => {
    if (setAsDefault) {
      setExplorer(choice);
      toast.success(
        `Default explorer set to ${EXPLORER_OPTIONS.find((o) => o.id === choice)?.name}`,
      );
    }
    const url = getExplorerTxUrl(network, txHash, choice);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const truncatedHash =
    txHash.length > 18
      ? `${txHash.slice(0, 8)}…${txHash.slice(-8)}`
      : txHash;

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span>Open in Explorer</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="space-y-4 pt-1">
        {/* Hash display with copy button */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/70 border border-border">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Trace / Tx Hash ({network})
            </span>
            <span className="font-mono text-xs text-foreground truncate block">
              {truncatedHash}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Copy full hash"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Explorer options */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground block px-1">
            Choose Explorer
          </span>
          <div className="grid gap-2">
            {EXPLORER_OPTIONS.map((opt) => {
              const isCurrentDefault = defaultExplorer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOpenExplorer(opt.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-secondary/70 transition-all text-left group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {opt.name}
                      </span>
                      {isCurrentDefault && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Current Default
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {opt.host(network)}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Set as default checkbox */}
        <label className="flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={setAsDefault}
            onChange={(e) => setSetAsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
          />
          <span>Always remember this choice as my default explorer</span>
        </label>
      </Modal.Body>
    </Modal.Container>
  );
};
