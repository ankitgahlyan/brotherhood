/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { X, RefreshCw, Camera, AlertCircle, Loader2 } from 'lucide-react';

export interface QrScannerProps {
  isVisible: boolean;
  onScan: (data: string) => void | Promise<void>;
  onClose: () => void;
  title?: string;
}

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 220, height: 220 },
};

export const QrScanner: React.FC<QrScannerProps> = ({
  isVisible,
  onScan,
  onClose,
  title = 'Scan QR code',
}) => {
  const rawId = useId();
  const scannerElementId = `qr-scanner-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const scanLockRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const currentStartPromiseRef = useRef<Promise<unknown> | null>(null);

  // Keep latest callbacks in refs so changes don't re-trigger effects
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  });

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Safely stop the active scanner instance
  const safeStopScanner = useCallback(async (scanner: Html5Qrcode | null) => {
    if (!scanner) return;
    try {
      if (currentStartPromiseRef.current) {
        try {
          await currentStartPromiseRef.current;
        } catch {
          // Ignore start error during teardown
        }
      }
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      // Ignore transition or unmount errors
    }
  }, []);

  const handleClose = useCallback(async () => {
    await safeStopScanner(scannerRef.current);
    onCloseRef.current();
  }, [safeStopScanner]);

  const handleScanSuccess = useCallback(
    async (qrCodeMessage: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;

      let address = qrCodeMessage.trim();
      const tonTransferMatch = address.match(/ton:\/\/transfer\/(.+)/);
      if (tonTransferMatch) {
        address = tonTransferMatch[1];
      }

      await safeStopScanner(scannerRef.current);
      onCloseRef.current();

      try {
        await Promise.resolve(onScanRef.current(address));
      } catch {
        scanLockRef.current = false;
      }
    },
    [safeStopScanner],
  );

  useEffect(() => {
    if (!isVisible) {
      scanLockRef.current = false;
      setErrorMessage(null);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    const initialize = async () => {
      // Clean up previous scanner if still attached
      if (scannerRef.current) {
        await safeStopScanner(scannerRef.current);
        scannerRef.current = null;
      }

      if (isCancelled) return;

      const element = document.getElementById(scannerElementId);
      if (!element) return;
      element.innerHTML = '';

      const scanner = new Html5Qrcode(scannerElementId);
      scannerRef.current = scanner;

      try {
        const cams = await Html5Qrcode.getCameras().catch(() => []);
        if (isCancelled) {
          return;
        }
        setCameras(cams);

        let backCamIndex = cams.findIndex((c) =>
          /back|rear|environment|main|0/i.test(c.label),
        );
        if (backCamIndex === -1 && cams.length > 1) {
          backCamIndex = cams.length - 1;
        } else if (backCamIndex === -1) {
          backCamIndex = 0;
        }
        setCameraIndex(backCamIndex);

        const cameraConstraint =
          cams.length > 0 && cams[backCamIndex]
            ? cams[backCamIndex].id
            : { facingMode: 'environment' };

        const startPromise = scanner.start(
          cameraConstraint,
          SCANNER_CONFIG,
          (message) => {
            if (!isCancelled) {
              void handleScanSuccess(message);
            }
          },
          () => {},
        );

        currentStartPromiseRef.current = startPromise;
        await startPromise;

        if (isCancelled) {
          await safeStopScanner(scanner);
          return;
        }

        setIsLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error('QR Scanner initialization failed:', err);
          setErrorMessage(
            'Failed to start camera. Please ensure camera permissions are granted.',
          );
          setIsLoading(false);
        }
      } finally {
        currentStartPromiseRef.current = null;
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      void safeStopScanner(scanner);
    };
  }, [isVisible, scannerElementId, handleScanSuccess, safeStopScanner]);

  const flipCamera = async () => {
    const scanner = scannerRef.current;
    if (!scanner || cameras.length < 2 || isFlipping) return;

    setIsFlipping(true);
    const next = (cameraIndex + 1) % cameras.length;

    try {
      await safeStopScanner(scanner);
      setCameraIndex(next);

      const startPromise = scanner.start(
        cameras[next].id,
        SCANNER_CONFIG,
        (message) => {
          void handleScanSuccess(message);
        },
        () => {},
      );

      currentStartPromiseRef.current = startPromise;
      await startPromise;
    } catch (err) {
      console.error('Error switching camera:', err);
    } finally {
      currentStartPromiseRef.current = null;
      setIsFlipping(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          void handleClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-card text-card-foreground border border-border p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm text-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void flipCamera();
                }}
                disabled={isFlipping || isLoading}
                className="p-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                title="Flip Camera"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`}
                />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleClose();
              }}
              className="p-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative rounded-xl bg-black p-2 overflow-hidden flex items-center justify-center min-h-[240px]">
          {isLoading && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 bg-black/60 z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">Initializing camera...</span>
            </div>
          )}

          {errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-2 text-red-400 bg-black/90 z-10">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}

          <div
            id={scannerElementId}
            className="w-full h-full rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
};
