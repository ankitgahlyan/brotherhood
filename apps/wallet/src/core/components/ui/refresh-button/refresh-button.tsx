/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';

export interface UseThrottledRefreshOptions {
  onRefresh: () => Promise<unknown> | void;
  cooldownMs?: number;
  minSpinMs?: number;
  successDurationMs?: number;
}

export function useThrottledRefresh({
  onRefresh,
  cooldownMs = 3500,
  minSpinMs = 600,
  successDurationMs = 2000,
}: UseThrottledRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isMountedRef = useRef(true);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const triggerRefresh = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isRefreshing || isCooldown) {
        return;
      }

      setIsRefreshing(true);
      setIsCooldown(true);
      setIsSuccess(false);

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);

      const startTime = Date.now();

      try {
        await Promise.resolve(onRefresh());

        // Guarantee minimum spin duration so user perceives the refresh action
        const elapsed = Date.now() - startTime;
        if (elapsed < minSpinMs) {
          await new Promise((resolve) =>
            setTimeout(resolve, minSpinMs - elapsed),
          );
        }

        if (isMountedRef.current) {
          setIsRefreshing(false);
          setIsSuccess(true);

          successTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setIsSuccess(false);
            }
          }, successDurationMs);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setIsRefreshing(false);
          setIsSuccess(false);
        }
      } finally {
        const totalElapsed = Date.now() - startTime;
        const remainingCooldown = Math.max(0, cooldownMs - totalElapsed);

        cooldownTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setIsCooldown(false);
          }
        }, remainingCooldown);
      }
    },
    [
      isRefreshing,
      isCooldown,
      onRefresh,
      cooldownMs,
      minSpinMs,
      successDurationMs,
    ],
  );

  return {
    isRefreshing,
    isCooldown,
    isSuccess,
    triggerRefresh,
    disabled: isRefreshing || isCooldown,
  };
}

export interface RefreshButtonProps {
  onRefresh: () => Promise<unknown> | void;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  ariaLabel?: string;
  cooldownMs?: number;
  minSpinMs?: number;
  successDurationMs?: number;
  successLabel?: string;
  testId?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  children = 'Refresh',
  variant = 'secondary',
  size = 'sm',
  iconOnly = false,
  disabled = false,
  className = '',
  title = 'Refresh data',
  ariaLabel,
  cooldownMs = 3500,
  minSpinMs = 600,
  successDurationMs = 2000,
  successLabel = 'Updated',
  testId,
}) => {
  const {
    isRefreshing,
    isSuccess,
    disabled: isThrottled,
    triggerRefresh,
  } = useThrottledRefresh({
    onRefresh,
    cooldownMs,
    minSpinMs,
    successDurationMs,
  });

  const isButtonDisabled = disabled || isThrottled;

  const renderIcon = () => {
    if (isSuccess) {
      return (
        <Check className="w-3.5 h-3.5 text-emerald-500 transition-transform duration-200 shrink-0" />
      );
    }
    return (
      <RefreshCw
        className={cn(
          'w-3.5 h-3.5 transition-transform shrink-0',
          isRefreshing && 'animate-spin text-primary',
        )}
      />
    );
  };

  if (iconOnly || size === 'icon') {
    return (
      <button
        type="button"
        onClick={triggerRefresh}
        disabled={isButtonDisabled}
        className={cn(
          'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center',
          isSuccess &&
            'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15',
          className,
        )}
        title={title}
        aria-label={
          ariaLabel || (typeof children === 'string' ? children : 'Refresh')
        }
        data-testid={testId}
      >
        {renderIcon()}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={triggerRefresh}
      disabled={isButtonDisabled}
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-200',
        isSuccess &&
          'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/15',
        className,
      )}
      title={title}
      aria-label={
        ariaLabel || (typeof children === 'string' ? children : 'Refresh')
      }
      data-testid={testId}
    >
      {renderIcon()}
      <span>
        {isRefreshing ? 'Refreshing…' : isSuccess ? successLabel : children}
      </span>
    </Button>
  );
};
