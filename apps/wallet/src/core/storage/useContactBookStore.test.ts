import { describe, expect, it, beforeEach } from 'bun:test';
import {
  useContactBookStore,
  normalizeContactAddress,
} from './useContactBookStore';

describe('useContactBookStore', () => {
  const TEST_ADDR_1 =
    '0:1111111111111111111111111111111111111111111111111111111111111111';
  const TEST_ADDR_2 =
    '0:2222222222222222222222222222222222222222222222222222222222222222';

  beforeEach(() => {
    useContactBookStore.getState().clearContacts('testnet');
  });

  it('sets and retrieves custom names with notes', () => {
    const store = useContactBookStore.getState();
    store.setCustomName(TEST_ADDR_1, 'Alice', 'Best friend', 'testnet');

    const effective = store.getEffectiveName(TEST_ADDR_1, 'testnet');
    expect(effective).toEqual({
      name: 'Alice',
      isCustom: true,
      onChainName: undefined,
    });

    const contact = store.getContact(TEST_ADDR_1, 'testnet');
    expect(contact?.notes).toBe('Best friend');
    expect(contact?.customName).toBe('Alice');
  });

  it('resolves address from name bi-directionally', () => {
    const store = useContactBookStore.getState();
    store.setCustomName(TEST_ADDR_1, 'Alice', undefined, 'testnet');
    store.saveOnChainUsername(TEST_ADDR_2, 'bob_crypto', 'testnet');

    expect(store.resolveAddress('@Alice', 'testnet')).toBe(TEST_ADDR_1);
    expect(store.resolveAddress('alice', 'testnet')).toBe(TEST_ADDR_1);
    expect(store.resolveAddress('@bob_crypto', 'testnet')).toBe(TEST_ADDR_2);
  });

  it('exports and imports contacts cleanly', () => {
    const store = useContactBookStore.getState();
    store.setCustomName(TEST_ADDR_1, 'Alice', 'Note 1', 'testnet');
    store.setCustomName(TEST_ADDR_2, 'Bob', 'Note 2', 'testnet');

    const exportedJson = store.exportContacts('testnet');
    expect(exportedJson).toContain('Alice');
    expect(exportedJson).toContain('Bob');

    store.clearContacts('testnet');
    expect(store.getContactsList('testnet').length).toBe(0);

    const importResult = store.importContacts(exportedJson, 'testnet');
    expect(importResult.importedCount).toBe(2);
    expect(store.getContactsList('testnet').length).toBe(2);
    expect(store.getEffectiveName(TEST_ADDR_1, 'testnet')?.name).toBe('Alice');
  });
});
