/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  QrCode,
  ChevronDown,
  Search,
  X,
  Users,
  Network as NetworkIcon,
} from 'lucide-react';
import { QrScanner } from '@/core/components/ui/qr-scanner/qr-scanner';
import { useFormatAddress } from '@/core/utils/formatters';
import { cn } from '@/core/lib/utils';
import type { MemberProfileInfo } from '../../hooks/use-member-profiles';
import { formatFi } from './credit-member-card';

export interface SelectableMemberOption {
  contractAddress: string;
  ownerAddress: string;
  username: string;
  degree: 'circle' | 'ring';
  creditNeed?: bigint;
  multiplier?: number;
  inviterUsername?: string;
}

export interface MemberComboboxInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  circleMembers: SelectableMemberOption[];
  ringMembers: SelectableMemberOption[];
  onSelectMember?: (member: SelectableMemberOption) => void;
  'data-testid'?: string;
}

export const MemberComboboxInput: React.FC<MemberComboboxInputProps> = ({
  value,
  onChange,
  placeholder = 'Borrower Address (UQ... / 0Q...)',
  disabled = false,
  circleMembers,
  ringMembers,
  onSelectMember,
  'data-testid': dataTestId,
}) => {
  const { formatWalletAddress, formatContractAddress } = useFormatAddress();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Combine and deduplicate options
  const allOptions = useMemo(() => {
    const map = new Map<string, SelectableMemberOption>();
    circleMembers.forEach((m) => {
      const key = m.ownerAddress || m.contractAddress;
      if (key) map.set(key, m);
    });
    ringMembers.forEach((m) => {
      const key = m.ownerAddress || m.contractAddress;
      if (key && !map.has(key)) map.set(key, m);
    });
    return Array.from(map.values());
  }, [circleMembers, ringMembers]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const q = searchQuery.toLowerCase().trim();
    return allOptions.filter(
      (m) =>
        m.username.toLowerCase().includes(q) ||
        m.ownerAddress.toLowerCase().includes(q) ||
        m.contractAddress.toLowerCase().includes(q),
    );
  }, [allOptions, searchQuery]);

  const filteredCircle = useMemo(
    () => filteredOptions.filter((m) => m.degree === 'circle'),
    [filteredOptions],
  );

  const filteredRing = useMemo(
    () => filteredOptions.filter((m) => m.degree === 'ring'),
    [filteredOptions],
  );

  const handleSelect = (member: SelectableMemberOption) => {
    const targetAddr = member.ownerAddress || member.contractAddress;
    onChange(targetAddr);
    onSelectMember?.(member);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleScan = (data: string) => {
    if (!data) return;
    onChange(data.trim());
    setIsScannerVisible(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Group */}
      <div className="flex items-center gap-1.5 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            data-testid={dataTestId}
            className="w-full p-2.5 pr-8 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear address input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Member Selector Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          className={cn(
            'shrink-0 p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer',
            isOpen
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
          )}
          title="Select from Circle or Ring members"
          aria-label="Select from Circle or Ring members"
        >
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Members</span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-150',
              isOpen && 'rotate-180',
            )}
          />
        </button>

        {/* QR Scanner Button */}
        <button
          type="button"
          onClick={() => setIsScannerVisible(true)}
          disabled={disabled}
          aria-label="Scan QR code"
          title="Scan QR code"
          className="shrink-0 p-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors flex items-center justify-center cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-72 flex flex-col text-xs">
          {/* Dropdown Search Bar */}
          <div className="p-2 border-b border-border bg-secondary/30 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by @username or address..."
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Member Options List */}
          <div className="overflow-y-auto flex-1 p-1 space-y-2 divide-y divide-border/40">
            {allOptions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No Circle or Ring members loaded yet.
              </div>
            ) : filteredCircle.length === 0 && filteredRing.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No matching members found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <>
                {/* Circle Section */}
                {filteredCircle.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Users className="w-3 h-3" />
                      Circle Members ({filteredCircle.length})
                    </div>
                    {filteredCircle.map((member) => {
                      const username = member.username
                        ? `@${member.username}`
                        : '@member';
                      const addr = member.ownerAddress
                        ? formatWalletAddress(member.ownerAddress, true, 4)
                        : formatContractAddress(
                            member.contractAddress,
                            true,
                            4,
                          );
                      const hasCreditNeed =
                        member.creditNeed !== undefined &&
                        member.creditNeed > 0n;

                      return (
                        <button
                          key={`circle-${member.contractAddress}`}
                          type="button"
                          onClick={() => handleSelect(member)}
                          className="w-full p-2 rounded-lg flex items-center justify-between text-left hover:bg-secondary/60 transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {username}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {addr}
                            </div>
                          </div>
                          {hasCreditNeed && (
                            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
                              Needs {formatFi(member.creditNeed)} FI
                              {member.multiplier
                                ? ` · ${member.multiplier}x`
                                : ''}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Ring Section */}
                {filteredRing.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      <NetworkIcon className="w-3 h-3" />
                      Ring Members ({filteredRing.length})
                    </div>
                    {filteredRing.map((member) => {
                      const username = member.username
                        ? `@${member.username}`
                        : '@member';
                      const addr = member.ownerAddress
                        ? formatWalletAddress(member.ownerAddress, true, 4)
                        : formatContractAddress(
                            member.contractAddress,
                            true,
                            4,
                          );
                      const hasCreditNeed =
                        member.creditNeed !== undefined &&
                        member.creditNeed > 0n;

                      return (
                        <button
                          key={`ring-${member.contractAddress}`}
                          type="button"
                          onClick={() => handleSelect(member)}
                          className="w-full p-2 rounded-lg flex items-center justify-between text-left hover:bg-secondary/60 transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {username}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {addr}
                            </div>
                          </div>
                          {hasCreditNeed && (
                            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400">
                              Needs {formatFi(member.creditNeed)} FI
                              {member.multiplier
                                ? ` · ${member.multiplier}x`
                                : ''}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Scanner Dialog */}
      <QrScanner
        isVisible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScan={handleScan}
        title="Scan Borrower Address"
      />
    </div>
  );
};
