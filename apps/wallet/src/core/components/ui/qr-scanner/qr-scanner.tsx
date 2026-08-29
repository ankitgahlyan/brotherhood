/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { X, RefreshCw, Camera } from 'lucide-react';

interface QrScannerProps {
    isVisible: boolean;
    onScan: (data: string) => void | Promise<void>;
    onClose: () => void;
    title?: string;
}

export const QrScanner: React.FC<QrScannerProps> = ({
    isVisible,
    onScan,
    onClose,
    title = 'Scan QR code',
}) => {
    const scanLockRef = useRef(false);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [cameraIndex, setCameraIndex] = useState(0);

    const resetScanner = useCallback(() => {
        scanLockRef.current = false;
    }, []);

    useEffect(() => {
        if (!isVisible) {
            resetScanner();
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
                /* Ignore non-critical scanner state errors during unmount */
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
            void stopQRScanner();
        },
        [handleBarCodeScanned, stopQRScanner],
    );

    const initializeQRScanner = useCallback(async () => {
        if (!qrScannerRef.current) {
            qrScannerRef.current = new Html5Qrcode('qr-scanner-element');
        }

        try {
            const cams = await Html5Qrcode.getCameras();
            setCameras(cams);

            let backCamIndex = cams.findIndex((c) => /back|rear|environment|main|0/i.test(c.label));
            if (backCamIndex === -1 && cams.length > 1) {
                backCamIndex = cams.length - 1;
            } else if (backCamIndex === -1) {
                backCamIndex = 0;
            }
            setCameraIndex(backCamIndex);

            const cameraConstraint = cams.length > 0 && cams[backCamIndex] ? cams[backCamIndex].id : { facingMode: 'environment' };

            await qrScannerRef.current.start(
                cameraConstraint,
                {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                },
                onScanSuccess,
                () => {},
            );
        } catch (err) {
            console.error('QR Scanner initialization failed:', err);
        }
    }, [onScanSuccess]);

    useEffect(() => {
        if (!isVisible) return;
        initializeQRScanner();
        return () => {
            void stopQRScanner(false);
        };
    }, [isVisible, initializeQRScanner, stopQRScanner]);

    if (!isVisible) return null;

    const flipCamera = async () => {
        if (!qrScannerRef.current || cameras.length < 2) return;
        const next = (cameraIndex + 1) % cameras.length;
        setCameraIndex(next);
        try {
            await qrScannerRef.current.stop();
        } catch (err) {
            console.error('Error stopping QR scanner before flipping:', err);
        }
        try {
            await qrScannerRef.current.start(cameras[next].id, undefined, onScanSuccess, () => {});
        } catch (err) {
            console.error('Error switching camera:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget) {
                    void stopQRScanner();
                }
            }}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-sm text-gray-900">{title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {cameras.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    void flipCamera();
                                }}
                                className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                title="Flip Camera"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                void stopQRScanner();
                            }}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="rounded-xl bg-black p-2 overflow-hidden flex items-center justify-center min-h-[240px]">
                    <div id="qr-scanner-element" className="w-full h-full rounded-lg overflow-hidden" />
                </div>
            </div>
        </div>
    );
};
