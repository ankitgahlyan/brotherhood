/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { CircleSlash, Zap, Sparkles, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences, type AnimationLevel } from '@demo/wallet-core';
import { useAnimationSettings } from '@/core/motion/motion-provider';
import { AnimatedBalance } from '@/components/ui/animated-balance';

interface AnimationOption {
  level: AnimationLevel;
  title: string;
  badge?: string;
  subtitle: string;
  icon: React.ReactNode;
}

const OPTIONS: AnimationOption[] = [
  {
    level: 'none',
    title: 'Disabled',
    subtitle: 'Zero motion, instant updates. Lowest CPU & battery use.',
    icon: <CircleSlash className="w-4 h-4" />,
  },
  {
    level: 'performance',
    title: 'Performance',
    badge: 'TMA Default',
    subtitle:
      'Smooth rolling numbers and subtle fades. Ideal for mobile & Telegram.',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
  },
  {
    level: 'full',
    title: 'Rich & Smooth',
    badge: 'Desktop Default',
    subtitle:
      'Full spring physics, layout shifts, swipe gestures & overscroll.',
    icon: <Sparkles className="w-4 h-4 text-purple-500" />,
  },
];

export const AnimationSettingsCard: React.FC = () => {
  const { animationLevel, setAnimationLevel } = usePreferences();
  const { isRich, isReduced } = useAnimationSettings();
  const [testCounter, setTestCounter] = useState(142.5);

  const handleTestTrigger = () => {
    const delta = Math.round((Math.random() * 50 - 20) * 100) / 100;
    setTestCounter((prev) =>
      Math.max(10, Math.round((prev + delta) * 100) / 100),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
        Animations & Motion
      </span>

      <div className="rounded-2xl bg-secondary/60 p-3 border border-border flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => {
            const isSelected = animationLevel === opt.level;
            return (
              <button
                key={opt.level}
                type="button"
                onClick={() => setAnimationLevel(opt.level)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-card text-foreground shadow-sm border-primary/40 ring-1 ring-primary/20'
                    : 'bg-background/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-transparent'
                }`}
                data-testid={`animation-level-${opt.level}`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {opt.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground border border-border">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    {opt.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Box */}
        <div className="rounded-xl bg-background/80 p-3 border border-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Live Motion Preview
            </span>
            <div className="text-base font-bold text-foreground flex items-center gap-1.5">
              <AnimatedBalance
                value={testCounter}
                decimals={2}
                suffix=" TON"
                className="font-mono tracking-tight"
              />
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleTestTrigger}
            whileTap={isRich ? { scale: 0.92 } : undefined}
            whileHover={!isReduced ? { scale: 1.04 } : undefined}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Update</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
