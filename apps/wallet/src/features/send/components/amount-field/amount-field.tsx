/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';

import type { TokenOption } from '../../types';

import { CenteredAmountInput } from '@/core/components/ui/centered-amount-input';
import { AmountReversed } from '@/core/components/ui/amount-reversed';
import { Button } from '@/core/components/ui/button';

const INCREMENT_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000] as const;

/** Clamp a numeric amount to a clean decimal string (no trailing zeros, no exponent). */
const toAmountString = (value: number, decimals: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '0';
  const fixed = value.toFixed(Math.min(decimals, 9));
  return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
};

interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
  token: TokenOption;
}

/** Centered amount input with a fiat sub-line, additive denomination buttons, MAX, and Undo. */
export const AmountField: React.FC<AmountFieldProps> = ({
  value,
  onChange,
  token,
}) => {
  const [clickHistory, setClickHistory] = useState<number[]>([]);
  const [prevTokenId, setPrevTokenId] = useState(token.id);

  if (token.id !== prevTokenId) {
    setPrevTokenId(token.id);
    setClickHistory([]);
  }

  const amountNumber = parseFloat(value) || 0;
  const fiatValue =
    token.rate !== undefined ? String(amountNumber * token.rate) : undefined;

  const handleAmountChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    if (!cleaned || parseFloat(cleaned) === 0) {
      setClickHistory([]);
    }
    onChange(cleaned);
  };

  const handleAddStep = (step: number) => {
    const current = parseFloat(value) || 0;
    const next = current + step;
    setClickHistory((prev) => [...prev, step]);
    onChange(toAmountString(next, token.decimals));
  };

  const handleUndo = () => {
    if (clickHistory.length === 0) return;
    const lastStep = clickHistory[clickHistory.length - 1];
    const current = parseFloat(value) || 0;
    const next = Math.max(0, current - lastStep);
    setClickHistory((prev) => prev.slice(0, -1));
    onChange(next > 0 ? toAmountString(next, token.decimals) : '');
  };

  const handleMax = () => {
    const maxVal = Math.max(0, token.maxSendable);
    const current = parseFloat(value) || 0;
    const delta = maxVal - current;
    if (delta !== 0) {
      setClickHistory((prev) => [...prev, delta]);
    }
    onChange(toAmountString(maxVal, token.decimals));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 py-2">
        <CenteredAmountInput
          value={value}
          onValueChange={handleAmountChange}
          ticker={token.symbol}
          baseTestId="send-amount"
        />
        {fiatValue !== undefined && (
          <AmountReversed value={fiatValue} symbol="≈$" decimals={2} />
        )}
      </div>
      <div className="mx-auto grid w-full grid-cols-6 gap-1.5">
        {INCREMENT_STEPS.map((step) => {
          const digits = String(step).length;
          const sizeClass =
            digits <= 2
              ? 'text-lg sm:text-xl'
              : digits === 3
                ? 'text-base sm:text-lg'
                : 'text-sm sm:text-base tracking-tighter';
          return (
            <Button
              key={step}
              type="button"
              size="sm"
              variant="secondary"
              className={`w-full h-10 px-0.5 py-0 font-extrabold leading-none tabular-nums whitespace-nowrap cursor-pointer ${sizeClass}`}
              onClick={() => handleAddStep(step)}
              data-testid={`send-amount-add-${step}`}
            >
              {step}
            </Button>
          );
        })}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full h-10 px-0.5 py-0 text-sm sm:text-base font-extrabold leading-none tracking-tight whitespace-nowrap cursor-pointer"
          onClick={handleMax}
          data-testid="send-amount-max"
        >
          MAX
        </Button>
        <Button
          type="button"
          size="sm"
          variant="gray"
          disabled={clickHistory.length === 0}
          className="w-full h-10 px-0.5 py-0 text-xs sm:text-sm font-bold leading-none whitespace-nowrap cursor-pointer gap-0.5"
          onClick={handleUndo}
          title="Undo last added amount"
          data-testid="send-amount-undo"
        >
          <Undo2 className="w-3.5 h-3.5 shrink-0" />
          <span>Undo</span>
        </Button>
      </div>
    </div>
  );
};
