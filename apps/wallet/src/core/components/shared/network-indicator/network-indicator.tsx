/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { useIsOnline } from '@/core/lib/network-status';

export interface NetworkIndicatorProps {
  className?: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  className = '',
}) => {
  const online = useIsOnline();

  return (
    <div
      role="status"
      aria-label={online ? 'Online' : 'Offline'}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
          online
            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
            : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
        }`}
      />
    </div>
  );
};
