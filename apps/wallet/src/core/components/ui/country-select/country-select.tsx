/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ISO_COUNTRIES,
  getCountryByCode,
  type CountryItem,
} from '@/lib/brotherhood/countries';

export interface CountrySelectProps {
  value: number;
  onChange: (code: number) => void;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  'data-testid': testId = 'country-select',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(() => getCountryByCode(value), [value]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return ISO_COUNTRIES;
    const q = search.toLowerCase().trim();
    return ISO_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alpha2.toLowerCase().includes(q) ||
        c.code.toString().includes(q),
    );
  }, [search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (c: CountryItem) => {
    onChange(c.code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/40 transition-colors"
        data-testid={testId}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-medium text-foreground truncate">
            {selectedCountry.name}
          </span>
          <span className="text-muted-foreground font-mono text-[11px]">
            (Code {selectedCountry.code})
          </span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg p-2 space-y-2 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code (e.g. 840, India)..."
              className="w-full p-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid={`${testId}-search`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="overflow-y-auto space-y-0.5 max-h-44 pr-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={`${c.code}-${c.alpha2}`}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                    c.code === value
                      ? 'bg-blue-500/15 text-blue-600 font-semibold dark:text-blue-400'
                      : 'text-foreground hover:bg-secondary/70'
                  }`}
                  data-testid={`${testId}-option-${c.code}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0 ml-2">
                    {c.code}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No matching country found.
                {/^\d+$/.test(search.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(parseInt(search.trim(), 10));
                      setIsOpen(false);
                    }}
                    className="block w-full mt-2 py-1 text-xs text-blue-500 hover:underline"
                  >
                    Use custom code #{search.trim()}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
