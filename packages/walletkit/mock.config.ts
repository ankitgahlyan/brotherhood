/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

 
const isJest = typeof jest !== 'undefined';
 
const isVitest = typeof (global as any).vi !== 'undefined';

export const useFakeTimers = isJest
    ? jest.useFakeTimers
    : isVitest
      ?  
        (global as any).vi.useFakeTimers
      : () => {
            throw new Error('No test framework detected');
        };

export const useRealTimers = isJest
    ? jest.useRealTimers
    : isVitest
      ?  
        (global as any).vi.useRealTimers
      : () => {
            throw new Error('No test framework detected');
        };

export const mockFn = isJest
    ? jest.fn
    : isVitest
      ?  
        (global as any).vi.fn
      : () => {
            throw new Error('No test framework detected');
        };

export const clearAllMocks = isJest
    ? jest.clearAllMocks
    : isVitest
      ?  
        (global as any).vi.clearAllMocks
      : () => {
            throw new Error('No test framework detected');
        };

 
export const mocked = isJest ? jest.mocked : isVitest ? (global as any).vi.mocked : (fn: any) => fn;

export type MockFunction = ReturnType<typeof mockFn>;
