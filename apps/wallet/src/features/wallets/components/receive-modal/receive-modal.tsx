/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Address } from '@ton/core';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@demo/wallet-core';
import QRCodeStyling from 'qr-code-styling';
import type { Options as QrOptions } from 'qr-code-styling';

import { Modal } from '@/core/components/ui/modal';
import { assetUrl } from '@/core/utils';

const QR_COLOR = '#14181F';

const QR_OPTIONS: Partial<QrOptions> = {
  type: 'svg',
  margin: 0,
  image: assetUrl('favicon.svg'),
  dotsOptions: { color: QR_COLOR, type: 'rounded' },
  cornersSquareOptions: { color: QR_COLOR, type: 'extra-rounded' },
  cornersDotOptions: { color: QR_COLOR, type: 'dot' },
  backgroundOptions: { color: '#ffffff' },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,
    imageSize: 0.32,
    hideBackgroundDots: true,
  },
  qrOptions: { errorCorrectionLevel: 'H' },
};

const CACHE_KEY_PREFIX = 'bro_receive_qr_';

const StyledQrCode: React.FC<{ value: string; size?: number }> = ({
  value,
  size = 220,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // Create the QR instance and append it to the container with caching.
  useEffect(() => {
    if (!containerRef.current || !value) return;

    const cacheKey = `${CACHE_KEY_PREFIX}${value}_${size}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && containerRef.current) {
        containerRef.current.innerHTML = cached;
      }
    } catch {
      // ignore localStorage errors
    }

    const qr = new QRCodeStyling({
      ...QR_OPTIONS,
      width: size,
      height: size,
      data: value,
    });
    qrRef.current = qr;

    const updateDomAndCache = () => {
      if (!containerRef.current) return;
      containerRef.current.replaceChildren();
      qr.append(containerRef.current);
      try {
        const svgContent = containerRef.current.innerHTML;
        if (svgContent) {
          localStorage.setItem(cacheKey, svgContent);
        }
      } catch {
        // ignore
      }
    };

    if (qr._svgDrawingPromise) {
      qr._svgDrawingPromise.then(updateDomAndCache).catch(updateDomAndCache);
    } else {
      updateDomAndCache();
    }
  }, [size, value]);

  return <div ref={containerRef} style={{ width: size, height: size }} />;
};

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address, getActiveWallet } = useWallet();
  const network = getActiveWallet()?.network ?? 'testnet';

  const parsed = useMemo(() => {
    if (!address) return null;
    try {
      return Address.parse(address);
    } catch {
      return null;
    }
  }, [address]);

  // Always show user-friendly non-bounceable address format (0Q... on testnet, UQ... on mainnet)
  const formattedAddress = useMemo(() => {
    if (!parsed) return address ?? '';
    return parsed.toString({
      urlSafe: true,
      bounceable: false,
      testOnly: network === 'testnet',
    });
  }, [parsed, network, address]);

  const handleCopy = async () => {
    if (!formattedAddress) return;
    try {
      await navigator.clipboard.writeText(formattedAddress);
      toast.success('Address copied');
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title>Receive</Modal.Title>
      </Modal.Header>

      <Modal.Body className="items-center gap-5">
        <div className="rounded-2xl border border-border p-4 bg-white shadow-sm">
          {formattedAddress ? (
            <StyledQrCode value={formattedAddress} />
          ) : (
            <div className="w-55 h-55 rounded-lg bg-muted animate-pulse" />
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full flex items-center gap-2 bg-secondary/70 border border-border rounded-2xl px-4 py-3 text-left hover:bg-secondary transition-colors"
          aria-label="Copy address"
        >
          <span className="flex-1 min-w-0 text-sm font-mono text-foreground break-all">
            {formattedAddress}
          </span>
          <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </Modal.Body>
    </Modal.Container>
  );
};
