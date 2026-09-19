/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  RotateCw,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/core/components/ui/modal';
import {
  useExplorer,
  getExplorerTxUrl,
  type ExplorerChoice,
} from '@/core/explorer';
import type { NetworkType } from '@demo/wallet-core';

interface InlineExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  network?: NetworkType;
  initialExplorer?: ExplorerChoice;
}

const EXPLORERS: { id: ExplorerChoice; name: string; host: string }[] = [
  { id: 'tonscan', name: 'TonScan', host: 'tonscan.org' },
  { id: 'tonviewer', name: 'TonViewer', host: 'tonviewer.com' },
  { id: 'actonscan', name: 'ActonScan', host: 'actonscan.com' },
];

export const InlineExplorerModal: React.FC<InlineExplorerModalProps> = ({
  isOpen,
  onClose,
  txHash,
  network = 'testnet',
  initialExplorer,
}) => {
  const { explorer: globalExplorer, setExplorer } = useExplorer();
  const [activeChoice, setActiveChoice] = useState<ExplorerChoice>(
    initialExplorer || globalExplorer || 'tonscan',
  );
  const [iframeKey, setIframeKey] = useState(0);
  const [hasIframeError, setHasIframeError] = useState(false);

  if (!txHash) return null;

  const currentUrl = getExplorerTxUrl(network, txHash, activeChoice);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Explorer link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleExternalOpen = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSelectExplorer = (choice: ExplorerChoice) => {
    setActiveChoice(choice);
    setExplorer(choice);
    setHasIframeError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleReload = () => {
    setHasIframeError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-4xl h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border border-border"
    >
      {/* Inline Top Navigation Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-secondary/80 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-background/60 border border-border/50">
            {EXPLORERS.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => handleSelectExplorer(exp.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeChoice === exp.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {exp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReload}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Reload frame"
            aria-label="Reload frame"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy URL"
            aria-label="Copy URL"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExternalOpen}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Open in External Browser"
            aria-label="Open in External Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 w-full h-full bg-background overflow-hidden">
        <iframe
          key={iframeKey}
          src={currentUrl}
          title={`${activeChoice} transaction explorer`}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
          onError={() => setHasIframeError(true)}
        />
        {hasIframeError && (
          <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Explorer preview unavailable
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              This explorer does not permit inline embedding. You can view the
              full transaction details in your browser.
            </p>
            <button
              type="button"
              onClick={handleExternalOpen}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open in Browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Fallback & Helper Notice */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-md w-[92%] px-3 py-2 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-between gap-3 text-xs pointer-events-auto">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate font-mono text-[11px]">{currentUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleExternalOpen}
            className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>External</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Modal.Container>
  );
};
