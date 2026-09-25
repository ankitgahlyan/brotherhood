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
  footer?: React.ReactNode;
}

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 240, height: 240 },
};

export const QrScanner: React.FC<QrScannerProps> = ({
  isVisible,
  onScan,
  onClose,
  title = 'Scan QR Code',
  footer,
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

  const [prevIsVisible, setPrevIsVisible] = useState(isVisible);
  if (prevIsVisible !== isVisible) {
    setPrevIsVisible(isVisible);
    if (!isVisible) {
      setErrorMessage(null);
    } else {
      setIsLoading(true);
      setErrorMessage(null);
    }
  }

  useEffect(() => {
    if (!isVisible) {
      scanLockRef.current = false;
      return;
    }

    let isCancelled = false;

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
      if (scanner) {
        void safeStopScanner(scanner);
        scannerRef.current = null;
      }
    };
  }, [isVisible, safeStopScanner, handleScanSuccess, scannerElementId]);

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
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/90 text-white p-4 pt-[calc(1rem+var(--tg-safe-area-top,0px))] pb-[calc(1.5rem+var(--tg-safe-area-bottom,0px))] backdrop-blur-md cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        void handleClose();
      }}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between w-full max-w-sm mx-auto z-10 px-1 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm text-white tracking-tight">
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
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 cursor-pointer"
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
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centered Viewfinder Box */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-auto w-full max-w-sm mx-auto min-h-[280px] pointer-events-none">
        <div
          className="relative w-72 h-72 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black flex items-center justify-center pointer-events-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scanner Corner Reticles */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg z-20" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg z-20" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg z-20" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg z-20" />

          {isLoading && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 bg-black/80 z-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs font-medium">
                Initializing camera...
              </span>
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
            className="w-full h-full rounded-2xl overflow-hidden [&_video]:w-full! [&_video]:h-full! [&_video]:object-cover! [&_img]:hidden! [&_span]:hidden!"
          />
        </div>

        <p className="text-xs text-white/70 text-center mt-4 font-medium select-none">
          Align QR code within the frame
        </p>
      </div>

      {/* Footer / Actions */}
      <div
        className="w-full max-w-sm mx-auto z-10 flex flex-col gap-2 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {footer}
      </div>
    </div>
  );
};
