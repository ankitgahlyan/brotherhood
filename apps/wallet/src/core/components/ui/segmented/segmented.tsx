/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { cn } from '@/core/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  testId?: string;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

/** Compact single-select segmented control (e.g. network / wallet version pickers). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        'flex rounded-xl border border-border overflow-hidden bg-secondary/50',
        className,
      )}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          data-testid={option.testId}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            index > 0 && 'border-l border-border',
            value === option.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
