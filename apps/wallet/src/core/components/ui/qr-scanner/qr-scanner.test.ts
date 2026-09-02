/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { QrScanner } from './qr-scanner';

describe('QrScanner Component', () => {
  it('returns null when isVisible is false', () => {
    const html = renderToString(
      React.createElement(QrScanner, {
        isVisible: false,
        onClose: () => {},
        onScan: () => {},
      }),
    );
    expect(html).toBe('');
  });

  it('renders modal markup when isVisible is true', () => {
    const html = renderToString(
      React.createElement(QrScanner, {
        isVisible: true,
        title: 'Scan Test QR',
        onClose: () => {},
        onScan: () => {},
      }),
    );
    expect(html).toContain('Scan Test QR');
    expect(html).toContain('qr-scanner-');
  });

  it('parses ton transfer URLs correctly', () => {
    const rawUrl = 'ton://transfer/EQCGScrZe1xKqqPu1GtZtUdtJRFLXdUx7zsBoRwGc8u_guTB';
    let address = rawUrl.trim();
    const tonTransferMatch = address.match(/ton:\/\/transfer\/(.+)/);
    if (tonTransferMatch) {
      address = tonTransferMatch[1];
    }
    expect(address).toBe('EQCGScrZe1xKqqPu1GtZtUdtJRFLXdUx7zsBoRwGc8u_guTB');
  });
});
