/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, beforeEach, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

let mockAuthState = {
  holdToSign: true,
  showFastSend: false,
};

mock.module('@demo/wallet-core', () => ({
  useAuth: () => mockAuthState,
}));

import { TxButton } from './tx-button';

describe('TxButton component', () => {
  beforeEach(() => {
    mockAuthState = {
      holdToSign: true,
      showFastSend: false,
    };
  });

  it('renders standard Button when fast send is disabled', () => {
    mockAuthState = {
      holdToSign: true,
      showFastSend: false,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Send TON');
    // Should render standard button, not HoldToSign progress bar container
    expect(html).not.toContain('Hold to Send TON');
  });

  it('renders standard Button when holdToSign is disabled even if fast send is enabled', () => {
    mockAuthState = {
      holdToSign: false,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Send TON');
    expect(html).not.toContain('Hold to Send TON');
  });

  it('renders HoldToSignButton with prefixed label when both holdToSign and showFastSend are true', () => {
    mockAuthState = {
      holdToSign: true,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Hold to Send TON');
  });

  it('avoids double prefixing if label already starts with Hold to', () => {
    mockAuthState = {
      holdToSign: true,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn" actionLabel="Hold to Claim">
        Claim
      </TxButton>,
    );

    expect(html).toContain('Hold to Claim');
    expect(html).not.toContain('Hold to Hold to');
  });
});
