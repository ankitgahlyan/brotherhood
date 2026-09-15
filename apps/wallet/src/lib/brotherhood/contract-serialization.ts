import { Address, Cell } from '@ton/core';

// Custom Replacer for JSON.stringify to handle Address, Cell, bigint, Map, and Dictionary
export function serializeReplacer(_key: string, value: any): any {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() };
  }
  if (
    value &&
    typeof value === 'object' &&
    value.constructor?.name === 'Address'
  ) {
    return { __type: 'Address', value: (value as Address).toString() };
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof value.toRawString === 'function' &&
    typeof value.toString === 'function'
  ) {
    try {
      return { __type: 'Address', value: value.toString() };
    } catch {
      /* pass */
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    (value.constructor?.name === 'Cell' ||
      (typeof value.toBoc === 'function' &&
        typeof value.beginParse === 'function'))
  ) {
    try {
      return {
        __type: 'Cell',
        value: (value as Cell).toBoc().toString('base64'),
      };
    } catch {
      /* pass */
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.keys === 'function' &&
    typeof value.get === 'function'
  ) {
    try {
      const rawKeys = value.keys();
      const keys = Array.isArray(rawKeys) ? rawKeys : Array.from(rawKeys);
      const entries = keys.map((k: any) => [k, value.get(k)]);
      return {
        __type: 'Dictionary',
        value: entries,
      };
    } catch {
      /* pass */
    }
  }
  if (value instanceof Map) {
    return {
      __type: 'Map',
      value: Array.from(value.entries()),
    };
  }
  return value;
}

// Custom Reviver for JSON.parse to reconstruct Address, Cell, bigint, Map, and Dictionary
export function serializeReviver(_key: string, value: any): any {
  if (value && typeof value === 'object' && value.__type) {
    if (value.__type === 'bigint') {
      return BigInt(value.value);
    }
    if (value.__type === 'Address') {
      try {
        return Address.parse(value.value);
      } catch {
        return value.value;
      }
    }
    if (value.__type === 'Cell') {
      try {
        return Cell.fromBase64(value.value);
      } catch {
        return value.value;
      }
    }
    if (value.__type === 'Map' && Array.isArray(value.value)) {
      return new Map(value.value);
    }
    if (value.__type === 'Dictionary') {
      const entries = Array.isArray(value.value) ? value.value : [];
      const entriesMap = new Map(entries);
      const keysList = Array.from(entriesMap.keys());
      return {
        keys: () => keysList,
        get: (key: any) => {
          const keyStr = key?.toString ? key.toString() : String(key);
          for (const [k, v] of entriesMap.entries()) {
            if (k === key || (k?.toString && k.toString() === keyStr)) {
              return v;
            }
          }
          return entriesMap.get(key);
        },
        values: () => Array.from(entriesMap.values()),
        size: entriesMap.size,
      };
    }
  }
  return value;
}

export function serializeForStorage(data: any): string {
  return JSON.stringify(data, serializeReplacer);
}

export function deserializeFromStorage<T = any>(data: string | any): T {
  if (data === null || data === undefined) {
    return data;
  }
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  return JSON.parse(jsonStr, serializeReviver);
}
