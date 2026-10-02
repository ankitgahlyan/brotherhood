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
  slideToSign: false,
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
      slideToSign: false,
      showFastSend: false,
    };
  });

  it('renders standard Button when fast send is disabled', () => {
    mockAuthState = {
      holdToSign: true,
      slideToSign: false,
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
      slideToSign: false,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Send TON');
    expect(html).not.toContain('Hold to Send TON');
  });

  it('renders HoldToSignButton with concise action name when both holdToSign and showFastSend are true', () => {
    mockAuthState = {
      holdToSign: true,
      slideToSign: false,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Send TON');
    expect(html).not.toContain('Hold to Send TON');
  });

  it('renders SlideToSignButton when both slideToSign and showFastSend are true', () => {
    mockAuthState = {
      holdToSign: false,
      slideToSign: true,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn">Send TON</TxButton>,
    );

    expect(html).toContain('Slide to Send TON');
    expect(html).toContain('data-swipe-ignore="true"');
  });

  it('strips legacy Hold to prefix if passed in actionLabel', () => {
    mockAuthState = {
      holdToSign: true,
      slideToSign: false,
      showFastSend: true,
    };

    const html = renderToString(
      <TxButton testId="send-btn" actionLabel="Hold to Claim">
        Claim
      </TxButton>,
    );

    expect(html).toContain('Claim');
    expect(html).not.toContain('Hold to Claim');
  });
});
