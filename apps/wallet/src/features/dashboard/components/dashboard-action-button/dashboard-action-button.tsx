/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { usePreferences } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';
import { cn } from '@/core/lib/utils';

/** Maps action labels to jewel gradient CSS classes defined in App.css */
const JEWEL_CLASS: Record<string, string> = {
  Send: 'jewel-btn-send',
  Receive: 'jewel-btn-receive',
  Swap: 'jewel-btn-swap',
  Invite: 'jewel-btn-invite',
  Vote: 'jewel-btn-vote',
  Stake: 'jewel-btn-stake',
};

interface DashboardActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  'aria-label'?: string;
  testId?: string;
  className?: string;
  iconContainerClassName?: string;
}

export const DashboardActionButton: React.FC<DashboardActionButtonProps> = ({
  icon,
  label,
  onClick,
  'aria-label': ariaLabel,
  testId,
  className,
  iconContainerClassName,
}) => {
  const { viewMode } = usePreferences();
  const { isGlass } = useTheme();
  const isPictorial = viewMode === 'icons_only';

  const jewelClass = isGlass ? (JEWEL_CLASS[label] ?? '') : '';

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label={ariaLabel ?? label}
      title={label}
      className={cn(
        'flex-1 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-secondary/50 hover:bg-secondary/80 border border-border/80 text-foreground text-xs font-semibold hover:shadow-xs active:scale-[0.96] transition-all cursor-pointer select-none min-h-(--touch-target)',
        isPictorial ? 'py-3.5 px-3 min-w-[72px]' : 'py-3 px-2 min-w-[100px]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-xl flex items-center justify-center transition-transform',
          isPictorial ? 'w-11 h-11 scale-105' : 'w-10 h-10',
          jewelClass,
          iconContainerClassName,
        )}
      >
        {icon}
      </div>
      {isPictorial ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="tracking-tight">{label}</span>
      )}
    </button>
  );
};
