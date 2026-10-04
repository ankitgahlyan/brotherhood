/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Address } from '@ton/core';
import { Copy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@demo/wallet-core';
import QRCodeStyling from 'qr-code-styling';
import type { Options as QrOptions } from 'qr-code-styling';

import { Modal } from '@/core/components/ui/modal';
import { assetUrl } from '@/core/utils';

const QR_OPTIONS: Partial<QrOptions> = {
  type: 'svg',
  margin: 0,
  image: assetUrl('favicon.svg'),
  dotsOptions: {
    type: 'rounded',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#0284C7' },
        { offset: 0.36, color: '#4F46E5' },
        { offset: 0.7, color: '#9333EA' },
        { offset: 1, color: '#E11D48' },
      ],
    },
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#0369A1' },
        { offset: 0.5, color: '#4338CA' },
        { offset: 1, color: '#BE123C' },
      ],
    },
  },
  cornersDotOptions: {
    type: 'dot',
    gradient: {
      type: 'radial',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#7E22CE' },
        { offset: 1, color: '#E11D48' },
      ],
    },
  },
  backgroundOptions: { color: '#ffffff' },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,
    imageSize: 0.32,
    hideBackgroundDots: true,
  },
  qrOptions: { errorCorrectionLevel: 'H' },
};

const LEGACY_STORAGE_PREFIX = 'bro_receive_qr_';
const CACHE_KEY_PREFIX = 'bro_receive_qr_v2_';
const QR_IDB_NAME = 'brotherhood_offline_images_db';
const QR_IDB_STORE = 'blobs';

/** In-memory L1 cache for 0ms re-opens during the active session */
const MEMORY_QR_SVG_CACHE = new Map<string, string>();
const MEMORY_QR_PNG_CACHE = new Map<string, Blob>();

// Clean up any legacy bro_receive_qr_* entries previously saved in localStorage
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LEGACY_STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
  } catch {
    // ignore localStorage errors
  }
}

function openQrIdb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(QR_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(QR_IDB_STORE)) {
          db.createObjectStore(QR_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getCachedQrSvgFromIdb(cacheKey: string): Promise<string | null> {
  const mem = MEMORY_QR_SVG_CACHE.get(cacheKey);
  if (mem) return mem;

  const db = await openQrIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(QR_IDB_STORE, 'readonly');
      const req = tx.objectStore(QR_IDB_STORE).get(cacheKey);
      req.onsuccess = () => {
        const res = req.result;
        if (typeof res === 'string') {
          MEMORY_QR_SVG_CACHE.set(cacheKey, res);
          resolve(res);
        } else if (res instanceof Blob) {
          res
            .text()
            .then((text) => {
              if (text) MEMORY_QR_SVG_CACHE.set(cacheKey, text);
              resolve(text || null);
            })
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveCachedQrSvgToIdb(
  cacheKey: string,
  svgContent: string,
): Promise<void> {
  MEMORY_QR_SVG_CACHE.set(cacheKey, svgContent);
  const db = await openQrIdb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(QR_IDB_STORE, 'readwrite');
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      tx.objectStore(QR_IDB_STORE).put(blob, cacheKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getOrCreateReceiveQrPngBlob(
  walletKey: string,
  addressValue: string,
): Promise<Blob> {
  const pngCacheKey = `${CACHE_KEY_PREFIX}png_${walletKey}_${addressValue}`;
  const memBlob = MEMORY_QR_PNG_CACHE.get(pngCacheKey);
  if (memBlob && memBlob.size > 0) return memBlob;

  const db = await openQrIdb();
  if (db) {
    const idbBlob = await new Promise<Blob | null>((resolve) => {
      try {
        const tx = db.transaction(QR_IDB_STORE, 'readonly');
        const req = tx.objectStore(QR_IDB_STORE).get(pngCacheKey);
        req.onsuccess = () => {
          resolve(req.result instanceof Blob ? req.result : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    if (idbBlob && idbBlob.size > 0) {
      MEMORY_QR_PNG_CACHE.set(pngCacheKey, idbBlob);
      return idbBlob;
    }
  }

  const qr = new QRCodeStyling({
    ...QR_OPTIONS,
    width: 512,
    height: 512,
    margin: 24,
    data: addressValue,
  });
  const rawData = await qr.getRawData('png');
  if (!rawData) {
    throw new Error('Could not generate QR image');
  }
  const blob =
    rawData instanceof Blob
      ? rawData
      : new Blob([rawData as unknown as BlobPart], { type: 'image/png' });

  MEMORY_QR_PNG_CACHE.set(pngCacheKey, blob);
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(QR_IDB_STORE, 'readwrite');
        tx.objectStore(QR_IDB_STORE).put(blob, pngCacheKey);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  return blob;
}

const StyledQrCode: React.FC<{
  value: string;
  walletKey: string;
  size?: number;
}> = ({ value, walletKey, size = 220 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // Create the QR instance and append it to the container with per-wallet IndexedDB caching.
  useEffect(() => {
    if (!containerRef.current || !value) return;

    let isCancelled = false;
    const cacheKey = `${CACHE_KEY_PREFIX}svg_${walletKey}_${value}_${size}`;

    const memCached = MEMORY_QR_SVG_CACHE.get(cacheKey);
    if (memCached && containerRef.current) {
      containerRef.current.innerHTML = memCached;
    } else {
      void getCachedQrSvgFromIdb(cacheKey).then((cached) => {
        if (
          !isCancelled &&
          cached &&
          containerRef.current &&
          !containerRef.current.hasChildNodes()
        ) {
          containerRef.current.innerHTML = cached;
        }
      });
    }

    const qr = new QRCodeStyling({
      ...QR_OPTIONS,
      width: size,
      height: size,
      data: value,
    });
    qrRef.current = qr;

    const updateDomAndCache = () => {
      if (isCancelled || !containerRef.current) return;
      containerRef.current.replaceChildren();
      qr.append(containerRef.current);
      const svgContent = containerRef.current.innerHTML;
      if (svgContent) {
        void saveCachedQrSvgToIdb(cacheKey, svgContent);
      }
    };

    if (qr._svgDrawingPromise) {
      qr._svgDrawingPromise.then(updateDomAndCache).catch(updateDomAndCache);
    } else {
      updateDomAndCache();
    }

    return () => {
      isCancelled = true;
    };
  }, [size, value, walletKey]);

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
  const { address, activeWalletId, getActiveWallet } = useWallet();
  const activeWallet = getActiveWallet();
  const network = activeWallet?.network ?? 'testnet';
  const [isSharingQr, setIsSharingQr] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

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

  const walletCacheKey = activeWalletId || formattedAddress || 'default';

  const handleCopy = async () => {
    if (!formattedAddress) return;
    try {
      await navigator.clipboard.writeText(formattedAddress);
      toast.success('Address copied');
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareQr = async () => {
    if (!formattedAddress || isSharingQr) return;
    setIsSharingQr(true);
    try {
      const blob = await getOrCreateReceiveQrPngBlob(
        walletCacheKey,
        formattedAddress,
      );
      const shortAddr = formattedAddress.slice(-8);
      const fileName = `ton-receive-${shortAddr}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `${activeWallet?.name || 'TON Wallet'} Receive QR`,
          text: formattedAddress,
          files: [file],
        });
      } else {
        triggerDownload(blob, fileName);
        toast.success('QR code downloaded');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Failed to share QR code');
      }
    } finally {
      setIsSharingQr(false);
    }
  };

  const handleDownloadQr = async () => {
    if (!formattedAddress || isDownloadingQr) return;
    setIsDownloadingQr(true);
    try {
      const blob = await getOrCreateReceiveQrPngBlob(
        walletCacheKey,
        formattedAddress,
      );
      const shortAddr = formattedAddress.slice(-8);
      const fileName = `ton-receive-${shortAddr}.png`;
      triggerDownload(blob, fileName);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloadingQr(false);
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

      <Modal.Body className="items-center gap-4">
        <div className="rounded-2xl border border-border p-4 bg-white shadow-sm">
          {formattedAddress ? (
            <StyledQrCode value={formattedAddress} walletKey={walletCacheKey} />
          ) : (
            <div className="w-55 h-55 rounded-lg bg-muted animate-pulse" />
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full flex items-center gap-2 bg-secondary/70 border border-border rounded-2xl px-4 py-3 text-left hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Copy address"
        >
          <span className="flex-1 min-w-0 text-sm font-mono text-foreground break-all">
            {formattedAddress}
          </span>
          <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>

        <div className="w-full grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShareQr}
            disabled={!formattedAddress || isSharingQr}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold text-xs shadow-xs transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="receive-share-qr-button"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{isSharingQr ? 'Sharing…' : 'Share QR'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            disabled={!formattedAddress || isDownloadingQr}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="receive-download-qr-button"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isDownloadingQr ? 'Saving…' : 'Download QR'}</span>
          </button>
        </div>
      </Modal.Body>
    </Modal.Container>
  );
};
