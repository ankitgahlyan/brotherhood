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
}

export const DashboardActionButton: React.FC<DashboardActionButtonProps> = ({
  icon,
  label,
  onClick,
  'aria-label': ariaLabel,
  testId,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel ?? label}
    className={cn(
      'flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-secondary/70 border border-border text-foreground text-sm font-medium hover:bg-secondary hover:scale-[1.03] active:scale-[0.97] transition-all',
      className,
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);
