import React, { useCallback, useState, useEffect } from 'react';
import { Camera, Link as LinkIcon } from 'lucide-react';
import { useTonConnect } from '@demo/wallet-core';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { QrScanner } from '@/core/components/ui/qr-scanner/qr-scanner';

interface ConnectDappModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectDappModal: React.FC<ConnectDappModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { handleTonConnectUrl } = useTonConnect();
  const [url, setUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [mode, setMode] = useState<'scanner' | 'paste'>('scanner');

  // Reset to scanner mode whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setMode('scanner');
        setUrl('');
      });
    }
  }, [isOpen]);

  const processUrl = useCallback(
    async (rawUrl: string) => {
      const trimmed = rawUrl.trim();
      if (!trimmed) return;

      setIsConnecting(true);
      try {
        await handleTonConnectUrl(trimmed);
        setUrl('');
        onClose();
      } catch {
        // connect modal / error state handled by the store
      } finally {
        setIsConnecting(false);
      }
    },
    [handleTonConnectUrl, onClose],
  );

  const handleConnect = useCallback(() => {
    return processUrl(url);
  }, [url, processUrl]);

  const handleScan = useCallback(
    (scanned: string) => {
      if (scanned) {
        setUrl(scanned);
        void processUrl(scanned);
      }
    },
    [processUrl],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Default: Fullscreen Camera QR Scanner with Manual Paste button */}
      <QrScanner
        isVisible={isOpen && mode === 'scanner'}
        onScan={handleScan}
        onClose={onClose}
        title="Scan TonConnect QR"
        footer={
          <Button
            type="button"
            variant="gray"
            onClick={() => setMode('paste')}
            className="w-full h-9 text-xs gap-1.5 border-border hover:bg-secondary cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Paste Link Manually</span>
          </Button>
        }
      />

      {/* 2. Manual URL Entry Modal */}
      <Modal.Container
        isOpened={isOpen && mode === 'paste'}
        onOpenChange={(open) => !open && onClose()}
        className="px-2 max-w-md"
      >
        <Modal.Header onClose={onClose}>
          <Modal.Title>Connect to dApp</Modal.Title>
        </Modal.Header>

        <Modal.Body className="gap-4">
          <Button
            type="button"
            variant="gray"
            onClick={() => setMode('scanner')}
            className="w-full h-11 border-dashed border-primary/50 text-primary hover:bg-primary/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Code with Camera</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              or paste link
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div>
            <textarea
              id="tonconnect-url"
              data-testid="tonconnect-url"
              rows={3}
              className="w-full px-3 py-2 border border-border bg-secondary/50 rounded-xl resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="tc://… or ton://… or https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <Button
            data-testid="tonconnect-process"
            onClick={handleConnect}
            loading={isConnecting}
            disabled={!url.trim() || isConnecting}
            className="w-full"
          >
            Connect
          </Button>
        </Modal.Body>
      </Modal.Container>
    </>
  );
};
