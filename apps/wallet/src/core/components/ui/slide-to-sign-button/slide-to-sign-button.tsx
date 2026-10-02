/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronsRight, Check } from 'lucide-react';
import type { ButtonSize, ButtonVariant } from '../button';
import { cn } from '@/core/lib/utils';

export interface SlideToSignButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  /** Label shown in the idle state (before sliding). */
  idleLabel?: string;
  /** Label shown once the slide completes. */
  completeLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  testId?: string;
}

const SLIDE_TRACK_VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-primary/15 border border-primary/30 text-foreground shadow-inner',
  secondary:
    'bg-secondary/80 border border-primary/25 text-foreground shadow-inner',
  gray: 'bg-secondary border border-border text-foreground shadow-inner',
  danger:
    'bg-destructive/15 border border-destructive/30 text-destructive shadow-inner',
  ghost: 'bg-secondary/50 border border-border/60 text-foreground',
};

const SLIDE_THUMB_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-md',
  secondary: 'bg-primary text-primary-foreground shadow-md',
  gray: 'bg-foreground text-background shadow-md',
  danger: 'bg-destructive text-white shadow-md',
  ghost: 'bg-primary text-primary-foreground shadow-md',
};

const SLIDE_FILL_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary/25',
  secondary: 'bg-primary/20',
  gray: 'bg-foreground/15',
  danger: 'bg-destructive/25',
  ghost: 'bg-primary/20',
};

const SLIDE_HEIGHT_CLASS: Record<ButtonSize, string> = {
  lg: 'h-13 rounded-2xl text-base font-bold',
  md: 'h-11 rounded-xl text-sm font-semibold',
  sm: 'h-9 rounded-full text-xs font-semibold',
  icon: 'h-9 w-9 rounded-full',
};

const SLIDE_THUMB_SIZE_CLASS: Record<ButtonSize, string> = {
  lg: 'h-11 w-12 rounded-xl',
  md: 'h-9 w-10 rounded-lg',
  sm: 'h-7 w-8 rounded-full',
  icon: 'h-7 w-7 rounded-full',
};

const COMPLETION_THRESHOLD = 0.85;

export const SlideToSignButton: React.FC<SlideToSignButtonProps> = ({
  onComplete,
  disabled = false,
  loading = false,
  className = '',
  idleLabel = 'Send',
  completeLabel = 'Sent!',
  variant = 'primary',
  size = 'md',
  testId,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startXRef = useRef(0);
  const maxDragRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const measureTrack = useCallback(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return 0;
    const computed = Math.max(0, track.clientWidth - thumb.clientWidth - 8);
    maxDragRef.current = computed;
    setMaxDrag(computed);
    return computed;
  }, []);

  const triggerComplete = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsComplete(true);
    setDragOffset(maxDragRef.current);
    clearTimers();

    completeTimerRef.current = setTimeout(() => {
      onComplete();
    }, 220);

    resetTimerRef.current = setTimeout(() => {
      setIsComplete(false);
      setDragOffset(0);
      currentOffsetRef.current = 0;
    }, 1000);
  }, [onComplete, clearTimers]);

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || loading || isComplete) return;
      const max = measureTrack();
      if (max <= 0) return;

      isDraggingRef.current = true;
      setIsDragging(true);
      startXRef.current = clientX - currentOffsetRef.current;
    },
    [disabled, loading, isComplete, measureTrack],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current || isComplete) return;
      const max = maxDragRef.current || measureTrack();
      if (max <= 0) return;

      const nextOffset = Math.max(
        0,
        Math.min(clientX - startXRef.current, max),
      );
      currentOffsetRef.current = nextOffset;
      setDragOffset(nextOffset);

      if (nextOffset >= max * 0.96) {
        triggerComplete();
      }
    },
    [isComplete, measureTrack, triggerComplete],
  );

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current || isComplete) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const max = maxDragRef.current;
    if (max > 0 && currentOffsetRef.current >= max * COMPLETION_THRESHOLD) {
      triggerComplete();
    } else {
      currentOffsetRef.current = 0;
      setDragOffset(0);
    }
  }, [isComplete, triggerComplete]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    const onMouseUp = () => {
      handleEnd();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const progressRatio = maxDrag > 0 ? Math.min(1, dragOffset / maxDrag) : 0;
  const formattedIdleLabel = idleLabel.toLowerCase().startsWith('slide')
    ? idleLabel
    : `Slide to ${idleLabel}`;

  return (
    <div
      ref={trackRef}
      role="button"
      tabIndex={disabled || loading ? -1 : 0}
      aria-disabled={disabled || loading}
      aria-label={formattedIdleLabel}
      data-testid={testId}
      data-swipe-ignore="true"
      onKeyDown={(e) => {
        if (disabled || loading || isComplete) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerComplete();
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
      className={cn(
        'no-swipe relative flex-1 flex items-center p-1 overflow-hidden select-none touch-pan-y transition-colors duration-200',
        SLIDE_HEIGHT_CLASS[size],
        disabled || loading
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        isComplete
          ? 'bg-emerald-600 text-white border border-emerald-500'
          : SLIDE_TRACK_VARIANT[variant],
        className,
      )}
    >
      {/* Filled trail behind thumb */}
      {!isComplete && !loading && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 pointer-events-none',
            SLIDE_FILL_VARIANT[variant],
            !isDragging && 'transition-all duration-200 ease-out',
          )}
          style={{
            width: dragOffset > 0 ? `${dragOffset + 28}px` : '0px',
          }}
        />
      )}

      {/* Center Track Label */}
      <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none px-12">
        {loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="truncate">Processing...</span>
          </div>
        ) : isComplete ? (
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="truncate">{completeLabel}</span>
          </div>
        ) : (
          <span
            className="truncate font-semibold transition-opacity duration-75"
            style={{
              opacity: Math.max(0.15, 1 - progressRatio * 1.15),
            }}
          >
            {formattedIdleLabel}
          </span>
        )}
      </div>

      {/* Draggable Thumb */}
      {!loading && !isComplete && (
        <div
          ref={thumbRef}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStart(e.clientX);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (e.touches.length > 0) {
              handleStart(e.touches[0].clientX);
            }
          }}
          className={cn(
            'relative z-20 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing select-none',
            SLIDE_THUMB_SIZE_CLASS[size],
            SLIDE_THUMB_VARIANT[variant],
            !isDragging && 'transition-transform duration-200 ease-out',
          )}
          style={{
            transform: `translateX(${dragOffset}px)`,
          }}
          data-testid={testId ? `${testId}-thumb` : 'slide-to-sign-thumb'}
        >
          <ChevronsRight className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
