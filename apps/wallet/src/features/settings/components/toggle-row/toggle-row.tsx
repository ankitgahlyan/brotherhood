/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Info } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/popover';

const InfoPopover: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 inline-flex items-center justify-center min-w-7 min-h-7 -m-1 rounded-full"
        aria-label={`${label} info`}
      >
        <Info className="w-4 h-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      align="start"
      className="w-64 text-xs text-popover-foreground bg-popover border border-border leading-relaxed"
    >
      {children}
    </PopoverContent>
  </Popover>
);

interface ToggleRowProps {
  testId: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  info?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  testId,
  label,
  description,
  checked,
  onChange,
  info,
  disabled = false,
  badge,
}) => (
  <div
    onClick={() => {
      if (!disabled) {
        onChange(!checked);
      }
    }}
    className={`flex items-center justify-between gap-3 px-4 py-3 min-h-(--touch-target) cursor-pointer hover:bg-muted/40 transition-colors select-none ${
      disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
    }`}
  >
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {badge}
        {info && (
          <div onClick={(e) => e.stopPropagation()}>
            <InfoPopover label={label}>{info}</InfoPopover>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
    <label
      data-testid={testId}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center min-h-(--touch-target) flex-shrink-0 ${
        disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="relative inline-flex w-11 h-6 shrink-0 items-center rounded-full p-0.5 bg-muted ring-1 ring-inset ring-border/60 peer-focus:outline-none transition-colors duration-200 peer-checked:bg-primary peer-checked:ring-primary">
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-xs ring-1 ring-black/10 transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  </div>
);
