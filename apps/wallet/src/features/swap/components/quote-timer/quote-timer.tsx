/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

import { Button } from '@/core/components/ui/button';
import { useNowSeconds } from '@/core/hooks';

interface QuoteTimerProps {
  expiresAt?: number; // Unix timestamp in seconds
  onRefresh: () => void;
  loading?: boolean;
}

export const QuoteTimer: FC<QuoteTimerProps> = ({
  expiresAt,
  onRefresh,
  loading = false,
}) => {
  const now = useNowSeconds();
  const remainingSeconds = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isExpired = !expiresAt || remainingSeconds === 0;

  if (!expiresAt) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3">
        <span className="text-sm font-medium text-yellow-800">
          Quote expired
        </span>
        <Button
          onClick={onRefresh}
          disabled={loading}
          loading={loading}
          variant="secondary"
          size="sm"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
      <span className="text-sm text-blue-800">
        Quote valid for{' '}
        <span className="font-semibold">
          {minutes > 0 && `${minutes}m `}
          {seconds}s
        </span>
      </span>
    </div>
  );
};
