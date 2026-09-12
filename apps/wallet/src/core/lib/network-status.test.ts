import { describe, it, expect } from 'bun:test';
import {
  isOnline,
  OfflineError,
  onNetworkStatusChange,
} from './network-status';

describe('Network Status Utility', () => {
  it('creates OfflineError with expected defaults', () => {
    const err = new OfflineError();
    expect(err.name).toBe('OfflineError');
    expect(err.message).toBe('Network is offline. Serving from local cache.');
  });

  it('reports boolean from isOnline()', () => {
    const status = isOnline();
    expect(typeof status).toBe('boolean');
  });

  it('subscribes and unsubscribes to status changes cleanly', () => {
    let called = false;
    const unsubscribe = onNetworkStatusChange((_online) => {
      called = true;
    });
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
    expect(called).toBe(false);
  });
});
