/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import {
  useContactBookStore,
  formatContactAddress,
} from './useContactBookStore';

describe('useContactBookStore with TON DNS domains', () => {
  const testAddress1 = 'UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4';
  const testAddress2 = 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG';
  const network = 'testnet';
  const expectedAddr1 = formatContactAddress(testAddress1, network);
  const expectedAddr2 = formatContactAddress(testAddress2, network);

  beforeEach(() => {
    useContactBookStore.getState().clearContacts('testnet');
    useContactBookStore.getState().clearContacts('mainnet');
  });

  describe('saveDnsDomain', () => {
    it('creates a new contact when address does not exist in store', () => {
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);

      const contact = useContactBookStore
        .getState()
        .getContact(testAddress1, network);
      expect(contact).not.toBeNull();
      expect(contact?.address).toBe(expectedAddr1);
      expect(contact?.dnsDomain).toBe('alice.ton');
      expect(contact?.dnsDomains).toEqual(['alice.ton']);
      expect(contact?.customName).toBeUndefined();
    });

    it('updates existing contact preserving nickname and avoiding duplicate domains', () => {
      // First save contact with a custom name
      useContactBookStore
        .getState()
        .setCustomName(testAddress1, 'Alice Bestie', 'close friend', network);

      // Save DNS domain
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);

      let contact = useContactBookStore
        .getState()
        .getContact(testAddress1, network);
      expect(contact?.customName).toBe('Alice Bestie');
      expect(contact?.dnsDomain).toBe('alice.ton');
      expect(contact?.dnsDomains).toEqual(['alice.ton']);

      // Save a secondary DNS domain for the same address
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice_work.t.me', network);

      contact = useContactBookStore
        .getState()
        .getContact(testAddress1, network);
      expect(contact?.customName).toBe('Alice Bestie');
      expect(contact?.dnsDomain).toBe('alice_work.t.me');
      expect(contact?.dnsDomains).toEqual(['alice.ton', 'alice_work.t.me']);

      // Re-saving an existing domain should not duplicate in dnsDomains
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);
      contact = useContactBookStore
        .getState()
        .getContact(testAddress1, network);
      expect(contact?.dnsDomains).toEqual(['alice.ton', 'alice_work.t.me']);
    });
  });

  describe('resolveAddress', () => {
    beforeEach(() => {
      useContactBookStore
        .getState()
        .setCustomName(testAddress1, 'Alice', undefined, network);
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.t.me', network);

      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress2, 'bob.ton', network);
    });

    it('resolves raw addresses directly', () => {
      const resolved = useContactBookStore
        .getState()
        .resolveAddress(testAddress1, network);
      expect(resolved).toBeDefined();
    });

    it('resolves by custom nickname', () => {
      const resolved = useContactBookStore
        .getState()
        .resolveAddress('Alice', network);
      expect(resolved).toBe(expectedAddr1);

      const resolvedAt = useContactBookStore
        .getState()
        .resolveAddress('@Alice', network);
      expect(resolvedAt).toBe(expectedAddr1);
    });

    it('resolves by primary dnsDomain', () => {
      const resolved = useContactBookStore
        .getState()
        .resolveAddress('bob.ton', network);
      expect(resolved).toBe(expectedAddr2);
    });

    it('resolves by any domain in dnsDomains alias list', () => {
      const resolvedFirst = useContactBookStore
        .getState()
        .resolveAddress('alice.ton', network);
      expect(resolvedFirst).toBe(expectedAddr1);

      const resolvedSecond = useContactBookStore
        .getState()
        .resolveAddress('alice.t.me', network);
      expect(resolvedSecond).toBe(expectedAddr1);
    });

    it('returns null for unknown domain or name', () => {
      const resolved = useContactBookStore
        .getState()
        .resolveAddress('unknown.ton', network);
      expect(resolved).toBeNull();
    });
  });

  describe('non-bounceable format and bounceable (kQ) address normalization', () => {
    const bounceableTestnetAddr =
      'kQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3Oc3';
    const nonBounceableTestnetAddr = formatContactAddress(
      bounceableTestnetAddr,
      network,
    );

    it('saves non-bounceable address when given a bounceable kQ address', () => {
      useContactBookStore
        .getState()
        .setCustomName(bounceableTestnetAddr, 'Charlie', undefined, network);

      const contact = useContactBookStore
        .getState()
        .getContact(bounceableTestnetAddr, network);
      expect(contact).not.toBeNull();
      expect(contact?.address).toBe(nonBounceableTestnetAddr);
      expect(contact?.address.startsWith('0Q')).toBe(true);
    });

    it('does not create duplicate entries when setting custom name with kQ vs 0Q', () => {
      useContactBookStore
        .getState()
        .setCustomName(bounceableTestnetAddr, 'Charlie', undefined, network);
      useContactBookStore
        .getState()
        .setCustomName(
          nonBounceableTestnetAddr,
          'Charlie Friend',
          undefined,
          network,
        );

      const list = useContactBookStore.getState().getContactsList(network);
      expect(list.length).toBe(1);
      expect(list[0].address).toBe(nonBounceableTestnetAddr);
      expect(list[0].customName).toBe('Charlie Friend');
    });

    it('resolves effective name when queried with a bounceable kQ address', () => {
      useContactBookStore
        .getState()
        .setCustomName(nonBounceableTestnetAddr, 'Charlie', undefined, network);

      const effective = useContactBookStore
        .getState()
        .getEffectiveName(bounceableTestnetAddr, network);
      expect(effective?.name).toBe('Charlie');
    });
  });

  describe('getEffectiveName', () => {
    it('prefers customName over dnsDomain', () => {
      useContactBookStore
        .getState()
        .setCustomName(testAddress1, 'Alice Nickname', undefined, network);
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);

      const effective = useContactBookStore
        .getState()
        .getEffectiveName(testAddress1, network);
      expect(effective?.name).toBe('Alice Nickname');
      expect(effective?.isCustom).toBe(true);
    });

    it('falls back to dnsDomain if no customName or onChainUsername exists', () => {
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress2, 'bob.ton', network);

      const effective = useContactBookStore
        .getState()
        .getEffectiveName(testAddress2, network);
      expect(effective?.name).toBe('bob.ton');
      expect(effective?.isCustom).toBe(false);
    });
  });

  describe('importContacts and exportContacts', () => {
    it('preserves dnsDomain and dnsDomains across export and import', () => {
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alice.ton', network);
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'alias.ton', network);

      const exportedJson = useContactBookStore
        .getState()
        .exportContacts(network);

      // Clear contacts
      useContactBookStore.getState().clearContacts(network);
      expect(
        useContactBookStore.getState().getContact(testAddress1, network),
      ).toBeNull();

      // Import back
      const importResult = useContactBookStore
        .getState()
        .importContacts(exportedJson, network);
      expect(importResult.importedCount).toBe(1);

      const restored = useContactBookStore
        .getState()
        .getContact(testAddress1, network);
      expect(restored).not.toBeNull();
      expect(restored?.dnsDomain).toBe('alias.ton');
      expect(restored?.dnsDomains).toEqual(['alice.ton', 'alias.ton']);
    });
  });

  describe('domain deduplication across multiple addresses', () => {
    it('deduplicates contacts when the same domain is saved for a second address', () => {
      // First save domain for testAddress1
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress1, 'anki.bro', network);

      let list = useContactBookStore.getState().getContactsList(network);
      expect(list.length).toBe(1);
      expect(list[0].dnsDomain).toBe('anki.bro');

      // Now save the exact same domain for testAddress2 (e.g. FiWallet address vs EOA)
      useContactBookStore
        .getState()
        .saveDnsDomain(testAddress2, 'anki.bro', network);

      list = useContactBookStore.getState().getContactsList(network);
      // Must not create duplicate entries for anki.bro!
      expect(list.length).toBe(1);
      expect(list[0].dnsDomain).toBe('anki.bro');
      expect(list[0].address).toBe(expectedAddr2);
    });
  });
});
