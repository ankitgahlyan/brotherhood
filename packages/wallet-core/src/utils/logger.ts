/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface Logger {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

/**
 * Creates a component logger with a prefix
 */
export function createComponentLogger(component: string): Logger {
    const prefix = `[${component}]`;

    return {
         
        info: (...args: unknown[]) => console.log(prefix, ...args),
         
        warn: (...args: unknown[]) => console.warn(prefix, ...args),
         
        error: (...args: unknown[]) => console.error(prefix, ...args),
    };
}
