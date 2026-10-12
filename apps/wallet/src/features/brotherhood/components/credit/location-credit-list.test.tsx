/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

let mockEntries: Array<{
  borrowerAddress: string;
  amount: bigint;
  multiplier: number;
  cutoffDate: number;
  maturityDate: number;
}> = [];
let mockIsLoading = false;
let mockIsDeployed = false;

mock.module('../../hooks/use-location-credit', () => ({
  useLocationCredit: (_h3Cell: string | null | undefined) => ({
    entries: mockEntries,
    isLoading: mockIsLoading,
    isDeployed: mockIsDeployed,
  }),
}));

mock.module('../../hooks/use-member-profiles', () => ({
  useMemberProfiles: (addresses: string[]) => {
    const data: Record<string, any> = {};
    for (const addr of addresses) {
      data[addr] = {
        address: addr,
        ownerAddress: addr,
        username: 'tst2_user',
        dnsDomain: 'tst2.bro',
        active: true,
      };
    }
    return {
      data,
      isLoading: false,
      refetch: mock(),
    };
  },
}));

mock.module('@/core/utils/formatters', () => ({
  useFormatAddress: () => ({
    formatWalletAddress: (addr: string) =>
      `${addr.slice(0, 4)}…${addr.slice(-4)}`,
    formatContractAddress: (addr: string) =>
      `${addr.slice(0, 4)}…${addr.slice(-4)}`,
  }),
}));

const mockContactStore = Object.assign(
  (selector: any) =>
    selector
      ? selector({ contacts: {}, contactsByNetwork: {} })
      : { contacts: {}, contactsByNetwork: {} },
  {
    getState: () => ({
      contacts: {},
      contactsByNetwork: { testnet: {}, mainnet: {}, tetra: {} },
    }),
  },
);

mock.module('@/core/storage/useContactBookStore', () => ({
  useContactBookStore: mockContactStore,
  normalizeContactAddress: (a: string) => a,
  EMPTY_CONTACTS_MAP: {},
}));

mock.module('@/core/components/ui/copy-button', () => ({
  CopyButton: () => <button type="button">Copy</button>,
}));

import { LocationCreditList } from './location-credit-list';

describe('LocationCreditList Component', () => {
  const dummyH3Cell = '893d1250e6bffff';

  it('renders nothing when h3Cell is null or undefined', () => {
    const html = renderToString(
      <LocationCreditList h3Cell={null} onSendCredit={() => {}} />,
    );
    expect(html).toBe('');
  });

  it('renders loading state when isLoading is true', () => {
    mockIsLoading = true;
    mockIsDeployed = false;
    mockEntries = [];

    const html = renderToString(
      <LocationCreditList h3Cell={dummyH3Cell} onSendCredit={() => {}} />,
    );
    expect(html).toContain('Loading location credit requests…');
  });

  it('renders empty undeployed message when not deployed', () => {
    mockIsLoading = false;
    mockIsDeployed = false;
    mockEntries = [];

    const html = renderToString(
      <LocationCreditList h3Cell={dummyH3Cell} onSendCredit={() => {}} />,
    );
    expect(html).toContain(
      'No location credit contract deployed yet for this spatial cell.',
    );
    expect(html).toContain('Location Credit Requests');
  });

  it('renders empty active requests message when deployed but entries list is empty', () => {
    mockIsLoading = false;
    mockIsDeployed = true;
    mockEntries = [];

    const html = renderToString(
      <LocationCreditList h3Cell={dummyH3Cell} onSendCredit={() => {}} />,
    );
    expect(html).toContain('No active credit requests found in your location.');
  });

  it('renders credit seeker card with terms when entries are present', () => {
    mockIsLoading = false;
    mockIsDeployed = true;
    mockEntries = [
      {
        borrowerAddress:
          '0:d697e62a36c552db7089b1d86430eabc76d53c5309bad217ccfcbaf08fc2b827',
        amount: 100_000_000_000n, // 100 FI
        multiplier: 1.5,
        cutoffDate: 0,
        maturityDate: 1791773402,
      },
    ];

    const html = renderToString(
      <LocationCreditList h3Cell={dummyH3Cell} onSendCredit={() => {}} />,
    );

    expect(html).toContain('Location Credit Requests');
    expect(html).toContain('100<!-- --> FI');
    expect(html).toContain('1.5<!-- -->x');
    expect(html).toContain('Send Credit');
    expect(html).toContain('Location');
  });
});
