/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import { useIsOnline, onApiCallFailed } from '@/core/lib/network-status';

export interface NetworkIndicatorProps {
  className?: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  className = '',
}) => {
  const online = useIsOnline();
  const [hasRecentFailure, setHasRecentFailure] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onApiCallFailed(() => {
      setHasRecentFailure(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setHasRecentFailure(false);
      }, 1000);
    });
  }, []);

  return (
    <div
      role="status"
      aria-label={
        hasRecentFailure ? 'API Error' : online ? 'Online' : 'Offline'
      }
      className={`relative flex items-center justify-center shrink-0 ${className}`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
          hasRecentFailure
            ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]'
            : online
              ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
              : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
        }`}
      />
    </div>
  );
};
