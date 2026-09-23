/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';
import { useAnimationSettings } from '@/core/motion/motion-provider';

export interface AnimatedBalanceProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  intClassName?: string;
  fracClassName?: string;
  dotClassName?: string;
  suffixClassName?: string;
  /** Whether to render integer and fractional parts in separate stylized spans */
  splitParts?: boolean;
  /** Custom formatter function if standard toLocaleString is not sufficient */
  formatter?: (val: number) => string;
}

const defaultFormatter = (val: number, decimals: number): string => {
  if (!Number.isFinite(val)) return '0';
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const AnimatedBalance: React.FC<AnimatedBalanceProps> = ({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
  intClassName = '',
  fracClassName = '',
  dotClassName = '',
  suffixClassName = '',
  splitParts = false,
  formatter,
}) => {
  const { isReduced, isRich } = useAnimationSettings();
  const intSpanRef = useRef<HTMLSpanElement>(null);
  const fracSpanRef = useRef<HTMLSpanElement>(null);
  const mainSpanRef = useRef<HTMLSpanElement>(null);

  // Use snappy spring if rich, gentle spring if performance
  const springValue = useSpring(value, {
    stiffness: isRich ? 280 : 180,
    damping: isRich ? 24 : 20,
    mass: 0.8,
  });

  const displayString = useTransform(springValue, (current) => {
    return formatter ? formatter(current) : defaultFormatter(current, decimals);
  });

  useEffect(() => {
    if (isReduced) {
      springValue.jump(value);
    } else {
      springValue.set(value);
    }
  }, [value, isReduced, springValue]);

  useEffect(() => {
    return displayString.on('change', (latest) => {
      if (splitParts) {
        const [intPart, fracPart = ''] = latest.split('.');
        if (intSpanRef.current) intSpanRef.current.textContent = intPart;
        if (fracSpanRef.current) fracSpanRef.current.textContent = fracPart;
      } else if (mainSpanRef.current) {
        mainSpanRef.current.textContent = `${prefix}${latest}${suffix}`;
      }
    });
  }, [displayString, splitParts, prefix, suffix]);

  const initialFormatted = formatter
    ? formatter(value)
    : defaultFormatter(value, decimals);

  if (splitParts) {
    const [intPart, fracPart = ''] = initialFormatted.split('.');
    return (
      <span className={className}>
        {prefix && <span>{prefix}</span>}
        <span ref={intSpanRef} className={intClassName}>
          {intPart}
        </span>
        <span className={dotClassName}>.</span>
        <span ref={fracSpanRef} className={fracClassName}>
          {fracPart}
        </span>
        {suffix && <span className={suffixClassName}>{suffix}</span>}
      </span>
    );
  }

  return (
    <motion.span ref={mainSpanRef} className={className}>
      {prefix}
      {initialFormatted}
      {suffix}
    </motion.span>
  );
};
