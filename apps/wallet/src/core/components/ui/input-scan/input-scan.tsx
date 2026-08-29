/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { QrScanner } from '../qr-scanner/qr-scanner';
import { cn } from '@/core/lib/utils';

export interface InputScanProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    scannerTitle?: string;
    containerClassName?: string;
    className?: string;
    'data-testid'?: string;
}

export const InputScan: React.FC<InputScanProps> = ({
    value,
    onChange,
    placeholder = 'EQA...',
    disabled = false,
    scannerTitle = 'Scan address QR code',
    containerClassName,
    className,
    'data-testid': dataTestId,
}) => {
    const [isScannerVisible, setIsScannerVisible] = useState(false);

    const handleScan = (data: string) => {
        if (!data) return;
        onChange(data.trim());
        setIsScannerVisible(false);
    };

    return (
        <div className={cn('flex items-center gap-2', containerClassName)}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                data-testid={dataTestId}
                className={cn('w-full flex-1 p-2 border rounded-lg text-xs outline-none focus:border-blue-500', className)}
            />
            <button
                type="button"
                onClick={() => setIsScannerVisible(true)}
                disabled={disabled}
                aria-label="Scan QR code"
                title="Scan QR code"
                className="shrink-0 p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 border border-gray-200"
            >
                <QrCode className="w-4 h-4 text-blue-600" />
            </button>
            <QrScanner
                isVisible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
                onScan={handleScan}
                title={scannerTitle}
            />
        </div>
    );
};
