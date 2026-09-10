/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import {
  isTelegramEnvironment,
  getTelegramLaunchUser,
  telegramHaptics,
  disableTelegramSwipeToClose,
  enableTelegramSwipeToClose,
  updateSafeAreaProperties,
  getRawTelegramWebApp,
  type TelegramUser,
} from '../lib/telegram';

export interface UseTwaReturn {
  isTwa: boolean;
  user: TelegramUser | undefined;
  haptics: typeof telegramHaptics;
  webApp: ReturnType<typeof getRawTelegramWebApp>;
  disableSwipeToClose: typeof disableTelegramSwipeToClose;
  enableSwipeToClose: typeof enableTelegramSwipeToClose;
  updateSafeArea: typeof updateSafeAreaProperties;
}

export function useTwa(): UseTwaReturn {
  const isTwa = useMemo(() => isTelegramEnvironment(), []);
  const user = useMemo(() => getTelegramLaunchUser(), []);
  const webApp = useMemo(() => getRawTelegramWebApp(), []);

  return {
    isTwa,
    user,
    haptics: telegramHaptics,
    webApp,
    disableSwipeToClose: disableTelegramSwipeToClose,
    enableSwipeToClose: enableTelegramSwipeToClose,
    updateSafeArea: updateSafeAreaProperties,
  };
}
