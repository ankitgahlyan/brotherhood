/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useRef } from 'react';
import {
  registerBackCallback,
  unregisterBackCallback,
} from '../lib/back-stack';

export interface UseHistoryBackOptions {
  isActive?: boolean;
  onBack: () => void;
  syncHistory?: boolean;
}

/**
 * Hook to coordinate modal, drawer, or sheet back navigation with Telegram BackButton and browser popstate.
 */
export function useHistoryBack({
  isActive = true,
  onBack,
  syncHistory = true,
}: UseHistoryBackOptions): void {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const idRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      if (idRef.current !== undefined) {
        unregisterBackCallback(idRef.current);
        idRef.current = undefined;
      }
      return;
    }

    idRef.current = registerBackCallback(() => {
      onBackRef.current?.();
    }, { syncHistory });

    return () => {
      if (idRef.current !== undefined) {
        unregisterBackCallback(idRef.current);
        idRef.current = undefined;
      }
    };
  }, [isActive, syncHistory]);
}
