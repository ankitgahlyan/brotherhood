/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { usePreferences } from '@demo/wallet-core';
import { cn } from '@/core/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  testId?: string;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  viewMode?: 'standard' | 'icons_only';
}

/** Compact single-select segmented control (e.g. network / wallet version pickers). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  viewMode: propViewMode,
}: SegmentedProps<T>) {
  const { viewMode: userViewMode } = usePreferences();
  const effectiveViewMode = propViewMode ?? userViewMode ?? 'standard';
  const isPictorial = effectiveViewMode === 'icons_only';

  return (
    <div
      role="group"
      className={cn(
        'flex rounded-xl border border-border overflow-hidden bg-secondary/50',
        className,
      )}
    >
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            data-testid={option.testId}
            aria-pressed={isSelected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-11',
              index > 0 && 'border-l border-border',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60',
            )}
          >
            {Icon && (
              <Icon
                aria-hidden="true"
                className={cn(
                  isPictorial ? 'w-4 h-4' : 'w-3.5 h-3.5',
                  isSelected ? 'stroke-[2.2]' : 'stroke-[1.75]',
                  'shrink-0',
                )}
              />
            )}
            {isPictorial && Icon ? (
              <span className="sr-only">{option.label}</span>
            ) : (
              <span>{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
