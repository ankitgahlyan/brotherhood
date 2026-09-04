/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { Search, Image as ImageIcon, Check, RotateCcw, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import {
  CRYPTOICONS_SYMBOLS,
  POPULAR_SYMBOLS,
  DEFAULT_TOKEN_IMAGE,
  getCryptoIconUrl,
} from '../data/cryptoicons';

export interface TokenImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const PAGE_SIZE = 72;

export const TokenImagePicker: React.FC<TokenImagePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeUrl = value || DEFAULT_TOKEN_IMAGE;

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CRYPTOICONS_SYMBOLS;
    return CRYPTOICONS_SYMBOLS.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const displayedSymbols = useMemo(() => {
    return filteredSymbols.slice(0, visibleCount);
  }, [filteredSymbols, visibleCount]);

  const handleSelectSymbol = (symbol: string) => {
    const url = getCryptoIconUrl(symbol);
    onChange(url);
    setIsOpen(false);
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const handleResetTon = () => {
    onChange(DEFAULT_TOKEN_IMAGE);
  };

  const isDefaultTon = activeUrl === DEFAULT_TOKEN_IMAGE;

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-muted-foreground font-medium flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          Token Icon (Optional)
        </label>
        {!isDefaultTon && (
          <button
            type="button"
            onClick={handleResetTon}
            disabled={disabled}
            className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset to TON
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-xl">
        {/* Preview Thumbnail */}
        <div className="relative w-9 h-9 rounded-lg bg-secondary/60 border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          <img
            src={activeUrl}
            alt="Token icon preview"
            className="w-7 h-7 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_TOKEN_IMAGE;
            }}
          />
        </div>

        {/* Input for direct URL edit */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={DEFAULT_TOKEN_IMAGE}
          disabled={disabled}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none truncate"
          data-testid="token-image-input"
        />

        {/* Browse Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              className="shrink-0 text-xs px-2.5 h-7"
              data-testid="token-image-browse-btn"
            >
              <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
              Select Icon
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md w-[92vw] sm:w-full p-4 gap-3 max-h-[85vh] flex flex-col">
            <DialogHeader className="p-0 pb-1">
              <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Select Token Icon
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground text-left">
                Choose from 1,125+ cryptocurrency icons from Cryptofonts.
              </p>
            </DialogHeader>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search symbol (ton, btc, eth, sol)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Popular tokens row */}
            {!searchQuery && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  Popular Icons
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SYMBOLS.slice(0, 10).map((sym) => {
                    const iconUrl = getCryptoIconUrl(sym);
                    const isSelected = activeUrl === iconUrl;
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleSelectSymbol(sym)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                          isSelected
                            ? 'bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400'
                            : 'bg-secondary/40 border-border/70 hover:bg-secondary text-foreground'
                        }`}
                      >
                        <img
                          src={iconUrl}
                          alt={sym}
                          className="w-3.5 h-3.5 object-contain"
                          loading="lazy"
                        />
                        <span className="uppercase">{sym}</span>
                        {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid of Icons */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {displayedSymbols.map((sym) => {
                  const iconUrl = getCryptoIconUrl(sym);
                  const isSelected = activeUrl === iconUrl;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleSelectSymbol(sym)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all group ${
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                          : 'bg-card border-border/70 hover:border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                      title={sym.toUpperCase()}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mb-1">
                        <img
                          src={iconUrl}
                          alt={sym}
                          className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[10px] uppercase truncate w-full">
                        {sym}
                      </span>
                    </button>
                  );
                })}
              </div>

              {displayedSymbols.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No crypto icons found for "{searchQuery}"
                </div>
              )}

              {displayedSymbols.length < filteredSymbols.length && (
                <div className="pt-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Load More ({filteredSymbols.length - displayedSymbols.length} remaining)
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{filteredSymbols.length} icons available</span>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
