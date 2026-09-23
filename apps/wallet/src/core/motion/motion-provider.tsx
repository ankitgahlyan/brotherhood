/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { createContext, useContext, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { usePreferences, type AnimationLevel } from '@demo/wallet-core';

interface MotionContextValue {
  animationLevel: AnimationLevel;
  isReduced: boolean;
  isRich: boolean;
  isPerformance: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  animationLevel: 'performance',
  isReduced: false,
  isRich: false,
  isPerformance: true,
});

export const useAnimationSettings = () => useContext(MotionContext);

export interface MotionProviderProps {
  children: React.ReactNode;
}

/** Spring physics presets tailored for snappy mobile and desktop feel */
export const MOTION_PRESETS = {
  spring: {
    type: 'spring',
    stiffness: 380,
    damping: 28,
  },
  gentleSpring: {
    type: 'spring',
    stiffness: 220,
    damping: 24,
  },
  snappySpring: {
    type: 'spring',
    stiffness: 450,
    damping: 32,
  },
  fade: {
    duration: 0.18,
    ease: [0.16, 1, 0.3, 1],
  },
  tabSlide: {
    duration: 0.22,
    ease: [0.32, 0.72, 0, 1],
  },
} as const;

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const { animationLevel } = usePreferences();

  const contextValue = useMemo<MotionContextValue>(
    () => ({
      animationLevel,
      isReduced: animationLevel === 'none',
      isPerformance: animationLevel === 'performance',
      isRich: animationLevel === 'full',
    }),
    [animationLevel],
  );

  return (
    <MotionContext.Provider value={contextValue}>
      <MotionConfig
        reducedMotion={animationLevel === 'none' ? 'always' : 'never'}
        transition={
          animationLevel === 'full'
            ? MOTION_PRESETS.spring
            : animationLevel === 'performance'
              ? MOTION_PRESETS.fade
              : { duration: 0 }
        }
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
};
