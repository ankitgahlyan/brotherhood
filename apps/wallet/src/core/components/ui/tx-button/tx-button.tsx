/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useRef } from 'react';
import { useAuth } from '@demo/wallet-core';
import { Button, type ButtonProps } from '../button';
import { HoldToSignButton } from '../hold-to-sign-button';
import { SlideToSignButton } from '../slide-to-sign-button';
import { cn } from '@/core/lib/utils';

export interface TxButtonProps extends ButtonProps {
  /**
   * Action name used for dynamic idleLabel (e.g. 'Send TON', 'Claim').
   * If omitted, will inspect string children.
   */
  actionLabel?: string;
  /**
   * Completion label shown when hold finishes (default: 'Sent!').
   */
  completeLabel?: string;
  /**
   * Hold duration in ms (default: 1500ms).
   */
  holdDuration?: number;
  /**
   * Primary action callback for both hold complete and click.
   */
  onAction?: () => void | Promise<void>;
  /**
   * Optional test ID forwarded to testId/data-testid.
   */
  testId?: string;
}

/**
 * Universal transaction button that automatically swaps between a standard Button,
 * HoldToSignButton, or SlideToSignButton when Fast Send + Hold/Slide to Sign are enabled in settings.
 */
export const TxButton: React.FC<TxButtonProps> = ({
  actionLabel,
  completeLabel = 'Sent!',
  holdDuration = 1500,
  onAction,
  onClick,
  disabled,
  loading,
  fullWidth,
  className,
  children,
  type = 'button',
  testId,
  ...props
}) => {
  const {
    holdToSign,
    slideToSign,
    showFastSend,
    isWatchOnly: rawIsWatchOnly,
  } = useAuth();
  const isWatchOnly = Boolean(rawIsWatchOnly);
  const effectiveDisabled = Boolean(disabled || isWatchOnly);

  const shouldSlide = Boolean(slideToSign && showFastSend && !isWatchOnly);
  const shouldHold = Boolean(
    !shouldSlide && holdToSign && showFastSend && !isWatchOnly,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedTestId = testId || (props as any)['data-testid'];

  const handleAction = () => {
    if (isWatchOnly) return;
    if (onAction) {
      void onAction();
    } else if (type === 'submit') {
      const form = containerRef.current?.closest('form');
      if (form) {
        form.requestSubmit();
      } else if (onClick) {
        onClick({} as React.MouseEvent<HTMLButtonElement>);
      }
    } else if (onClick) {
      onClick({} as React.MouseEvent<HTMLButtonElement>);
    }
  };

  if (shouldSlide) {
    const rawLabel =
      actionLabel || (typeof children === 'string' ? children : 'Sign');
    const idle = rawLabel.replace(/^(hold|slide) to\s+/i, '');

    return (
      <div ref={containerRef} className="w-full flex">
        <SlideToSignButton
          onComplete={handleAction}
          disabled={effectiveDisabled}
          loading={loading}
          idleLabel={idle}
          completeLabel={completeLabel}
          variant={props.variant}
          size={props.size}
          className={cn('w-full', className)}
          testId={resolvedTestId}
        />
      </div>
    );
  }

  if (shouldHold) {
    const rawLabel =
      actionLabel || (typeof children === 'string' ? children : 'Sign');
    const idle = rawLabel.replace(/^hold to\s+/i, '');

    return (
      <div ref={containerRef} className="w-full flex">
        <HoldToSignButton
          onComplete={handleAction}
          disabled={effectiveDisabled}
          loading={loading}
          holdDuration={holdDuration}
          idleLabel={idle}
          completeLabel={completeLabel}
          variant={props.variant}
          size={props.size}
          className={cn('w-full', className)}
          testId={resolvedTestId}
        />
      </div>
    );
  }

  return (
    <Button
      type={type}
      disabled={effectiveDisabled}
      loading={loading}
      fullWidth={fullWidth}
      className={className}
      data-testid={resolvedTestId}
      title={isWatchOnly ? 'Watch-Only Wallet (Sending Disabled)' : props.title}
      onClick={(e) => {
        if (isWatchOnly) return;
        if (type === 'submit') {
          onClick?.(e);
          return;
        }
        if (onAction) {
          void onAction();
        } else if (onClick) {
          onClick(e);
        }
      }}
      {...props}
    >
      {isWatchOnly ? 'Watch-Only (Sending Disabled)' : children}
    </Button>
  );
};
