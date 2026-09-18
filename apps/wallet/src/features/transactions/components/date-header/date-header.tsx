/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

interface DateHeaderProps {
  timestamp: number;
  isUpdating?: boolean;
}

export function formatHumanDay(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  const isCurrentYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: isCurrentYear ? undefined : 'numeric',
  });
}

export const DateHeader: React.FC<DateHeaderProps> = ({
  timestamp,
  isUpdating,
}) => {
  const label = formatHumanDay(timestamp);

  return (
    <div className="flex justify-center my-2.5 select-none pointer-events-none sticky top-1 z-10">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground bg-secondary/80 backdrop-blur-md shadow-xs border border-border/40 transition-all">
        <span>{label}</span>
        {isUpdating && (
          <span
            className="flex items-center gap-0.5 ml-0.5"
            title="Updating..."
          >
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
            <span className="w-1 h-1 rounded-full bg-primary/80 animate-pulse" />
          </span>
        )}
      </div>
    </div>
  );
};
