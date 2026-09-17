/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { cn } from '@/core/lib/utils';

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
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel ?? label}
    className={cn(
      'flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 border border-border/80 text-foreground text-xs font-semibold hover:shadow-sm active:scale-[0.96] transition-all cursor-pointer select-none',
      className,
    )}
  >
    <div
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-transform',
        iconContainerClassName,
      )}
    >
      {icon}
    </div>
    <span className="tracking-tight">{label}</span>
  </button>
);
