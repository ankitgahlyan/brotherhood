/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  /** Back action; the back button is hidden when omitted. */
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

/** Page header for NewLayout: a round back button (same style as the modal close button) plus a title. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightElement,
}) => (
  <header className="flex items-center justify-between gap-3 px-4 pt-1 pb-3">
    <div className="flex items-center gap-2.5 min-w-0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-secondary/80 border border-border/80 flex items-center justify-center text-foreground hover:bg-secondary transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
      )}
      <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
    </div>
    {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
  </header>
);
