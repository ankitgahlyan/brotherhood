/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isBiometricsSupported,
  isBiometricsRegistered,
  registerBiometrics,
  authenticateBiometrics,
  clearBiometrics,
} from './biometrics';

export interface UseBiometricsResult {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  register: (password: string) => Promise<boolean>;
  authenticate: () => Promise<string | null>;
  disable: () => void;
  refresh: () => Promise<void>;
}

export function useBiometrics(): UseBiometricsResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const supported = await isBiometricsSupported();
      const enabled = isBiometricsRegistered();
      setIsSupported(supported);
      setIsEnabled(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometrics check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const register = useCallback(
    async (password: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const success = await registerBiometrics(password);
        if (success) {
          setIsEnabled(true);
        }
        return success;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to register biometrics';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const authenticate = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const password = await authenticateBiometrics();
      return password;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to authenticate biometrics';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disable = useCallback(() => {
    clearBiometrics();
    setIsEnabled(false);
  }, []);

  return {
    isSupported,
    isEnabled,
    isLoading,
    error,
    register,
    authenticate,
    disable,
    refresh,
  };
}
