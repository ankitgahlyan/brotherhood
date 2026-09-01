/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';
import { useWallet } from '@demo/wallet-core';
import { useFormatAddress } from '@/core/utils/formatters';
import { Button } from '@/core/components/ui/button';

interface NonMemberCardProps {
  className?: string;
  onRefresh?: () => void;
}

export const NonMemberCard: React.FC<NonMemberCardProps> = ({
  className = '',
  onRefresh,
}) => {
  const { address } = useWallet();
  const { formatWalletAddress, copyWalletAddress } = useFormatAddress();
  const [copied, setCopied] = useState(false);

  const shortAddr = address ? formatWalletAddress(address, true, 6) : '';

  const handleCopy = async () => {
    if (!address) return;
    const success = await copyWalletAddress(
      address,
      'Wallet address copied to clipboard',
    );
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`p-4 bg-card text-card-foreground border border-border/80 rounded-2xl shadow-sm space-y-3 ${className}`}
      data-testid="non-member-card"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Brotherhood Network Access
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are not a member of network. Get invited first to interact with
            brotherhood network.
          </p>
        </div>
      </div>

      {address && (
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground font-medium">
              Your Wallet Address (for Invite)
            </span>
            <button
              onClick={handleCopy}
              className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
              title="Copy Address"
              data-testid="copy-invite-address-btn"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-foreground select-all break-all">
            {shortAddr}
          </p>
        </div>
      )}

      {onRefresh && (
        <div className="pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            fullWidth
            data-testid="refresh-membership-btn"
          >
            Check Membership Status
          </Button>
        </div>
      )}
    </div>
  );
};
