import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';

interface QrScannerProps {
  isVisible: boolean;
  onScan: (data: string) => void | Promise<void>;
  onClose: () => void;
  hint?: string;
}

export const QrScanner: FC<QrScannerProps> = ({
  isVisible,
  onScan,
  onClose,
  // hint = 'Point your camera at a TON Connect QR code',
}) => {
  const scanLockRef = useRef(false);
  // ref to hold scanner instance synchronously
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  // const [qrScanner, setQRScanner] = useState<Html5Qrcode>();
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [cameraIndex, setCameraIndex] = useState(1);

  const resetScanner = useCallback(() => {
    scanLockRef.current = false;
  }, []);

  useEffect(() => {
    if (!isVisible) {
      resetScanner();
      return;
    }
  }, [isVisible, resetScanner]);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanLockRef.current) return;

      scanLockRef.current = true;

      Promise.resolve(onScan(data)).catch(() => {
        scanLockRef.current = false;
      });
    },
    [onScan],
  );

  const stopQRScanner = useCallback(
    async (shouldClose = true) => {
      if (!qrScannerRef.current) return;

      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
      } catch {
        /* Ignore non-critical scanner state errors during unmount or duplicate stop */
      } finally {
        if (shouldClose) {
          onClose();
        }
      }
    },
    [onClose],
  );

  const onScanSuccess = useCallback(
    (qrCodeMessage: string) => {
      let address = qrCodeMessage.trim();

      const tonTransferMatch = address.match(/ton:\/\/transfer\/(.+)/);
      if (tonTransferMatch) {
        address = tonTransferMatch[1];
      }

      handleBarCodeScanned({ data: address });
      stopQRScanner();
    },
    [handleBarCodeScanned, stopQRScanner],
  );

  const initializeQRScanner = useCallback(async () => {
    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5Qrcode('qr');
    }

    const cams = await Html5Qrcode.getCameras();
    setCameras(cams);
    const idx = cams.length > 1 ? 1 : 0;
    setCameraIndex(idx);

    try {
      await qrScannerRef.current.start(
        cams[idx].id,
        undefined,
        onScanSuccess,
        () => {
          // onScanError: Silently ignore QR scanning errors (continuous scanning attempts)
        },
      );
    } catch (err: unknown) {
      console.error('QR Scanner initialization failed:', err);
    }
  }, [onScanSuccess]);

  useEffect(() => {
    if (!isVisible) return;

    initializeQRScanner();
    return () => {
      stopQRScanner(false);
    };
  }, [isVisible, initializeQRScanner, stopQRScanner]);

  if (!isVisible) {
    return null;
  }

  async function flipCamera() {
    if (!qrScannerRef.current || cameras.length < 2) return;

    const next = (cameraIndex + 1) % cameras.length;
    setCameraIndex(next);
    try {
      await qrScannerRef.current.stop();
    } catch (err: unknown) {
      console.error('Error stopping QR scanner before flipping camera:', err);
    }
    try {
      await qrScannerRef.current.start(
        cameras[next].id,
        undefined,
        onScanSuccess,
        () => {},
      );
    } catch (err: unknown) {
      console.error('Error switching camera', err);
    }
  }

  return (
    <>
      {/* <!-- QR Scanner Overlay --> */}
      {isVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            // close when clicking outside inner container
            if (e.target === e.currentTarget) {
              stopQRScanner();
            }
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl page-enter"
            onClick={(e) => {
              e.stopPropagation(); // prevent clicks inside from reaching page
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-display text-sm font-semibold">
                  Scan QR code
                </div>
                <div className="flex items-center gap-2">
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        flipCamera();
                      }}
                      className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent"
                    >
                      Flip Camera
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      stopQRScanner();
                    }}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-black p-1.5 overflow-hidden">
                <div
                  id="qr"
                  className="w-full h-full rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
