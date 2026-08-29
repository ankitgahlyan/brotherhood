/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

import { Input } from '@/core/components/ui/input';
import { QrScanner } from '@/core/components/ui/qr-scanner/qr-scanner';

interface RecipientFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    /** When provided, renders a "Use my address" shortcut in the header. */
    onUseMyAddress?: () => void;
}

/** Recipient address field with an optional "Use my address" shortcut and inline validation. */
export const RecipientField: React.FC<RecipientFieldProps> = ({ value, onChange, error, onUseMyAddress }) => {
    const [isScannerVisible, setIsScannerVisible] = useState(false);

    return (
        <Input.Container error={Boolean(error)}>
            <Input.Header>
                <Input.Title>Recipient</Input.Title>
                {onUseMyAddress && (
                    <button
                        type="button"
                        onClick={onUseMyAddress}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        data-testid="use-my-address"
                    >
                        Use my address
                    </button>
                )}
            </Input.Header>
            <Input.Field className="flex items-center gap-2 pr-2">
                <Input.Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="EQ…"
                    data-testid="recipient-input"
                />
                <button
                    type="button"
                    onClick={() => setIsScannerVisible(true)}
                    aria-label="Scan QR code"
                    title="Scan QR code"
                    className="shrink-0 p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                    <QrCode className="w-4 h-4 text-blue-600" />
                </button>
            </Input.Field>
            {error && <Input.Caption>{error}</Input.Caption>}
            <QrScanner
                isVisible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
                onScan={(scanned) => {
                    onChange(scanned);
                    setIsScannerVisible(false);
                }}
            />
        </Input.Container>
    );
};
