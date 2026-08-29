/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  compact?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  compact = false,
}) => {
  const contentPadding = compact ? 'px-4 py-4' : 'p-6';
  const titlePadding = compact ? 'px-4 py-2' : 'px-6 py-4';
  const titleSize = compact ? 'text-base' : 'text-lg';
  return (
    <div
      className={`bg-card text-card-foreground rounded-2xl shadow-sm border border-border ${className}`}
    >
      {title && (
        <div className={`${titlePadding} border-b border-border`}>
          <h3 className={`${titleSize} font-medium text-foreground`}>
            {title}
          </h3>
        </div>
      )}
      <div className={contentPadding}>{children}</div>
    </div>
  );
};
