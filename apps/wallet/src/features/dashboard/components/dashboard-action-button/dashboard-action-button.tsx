/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

interface DashboardActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  'aria-label'?: string;
  testId?: string;
}

export const DashboardActionButton: React.FC<DashboardActionButtonProps> = ({
  icon,
  label,
  onClick,
  'aria-label': ariaLabel,
  testId,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel ?? label}
    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-secondary/70 border border-border text-foreground text-sm font-medium hover:bg-secondary hover:scale-[1.03] active:scale-[0.97] transition-all"
  >
    {icon}
    <span>{label}</span>
  </button>
);
