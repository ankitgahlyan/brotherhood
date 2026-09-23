/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { isValidAddress } from '@ton/walletkit';
import { useWalletStore, getChainNetwork } from '@demo/wallet-core';
import {
  resolveRecipientPublicKey,
  getCachedPublicKey,
} from '@/core/storage/publicKeyCache';

export interface CommentFieldProps {
  comment: string;
  onChangeComment: (comment: string) => void;
  isEncrypted: boolean;
  onChangeIsEncrypted: (isEncrypted: boolean) => void;
  recipientAddress?: string;
  network?: string;
  disabled?: boolean;
}

const MAX_COMMENT_CHARS = 400;

export const CommentField: React.FC<CommentFieldProps> = ({
  comment,
  onChangeComment,
  isEncrypted,
  onChangeIsEncrypted,
  recipientAddress,
  network = 'testnet',
  disabled = false,
}) => {
  const [isResolvingKey, setIsResolvingKey] = useState(false);
  const [isKeyUnavailable, setIsKeyUnavailable] = useState(false);

  const savedWallets = useWalletStore(
    (state) => state.walletManagement.savedWallets,
  );
  const walletKit = useWalletStore((state) => state.walletCore.walletKit);
  const tonClient = React.useMemo(() => {
    if (!walletKit) return undefined;
    try {
      const netType =
        network === 'mainnet'
          ? 'mainnet'
          : network === 'tetra'
            ? 'tetra'
            : 'testnet';
      const net = getChainNetwork(netType);
      return typeof walletKit.getApiClient === 'function'
        ? walletKit.getApiClient(net)
        : (walletKit as any).getClient?.();
    } catch {
      return undefined;
    }
  }, [walletKit, network]);

  // Check recipient public key when encryption is selected
  useEffect(() => {
    let isCancelled = false;

    if (
      !isEncrypted ||
      !recipientAddress ||
      !isValidAddress(recipientAddress.trim())
    ) {
      queueMicrotask(() => {
        if (!isCancelled) {
          setIsKeyUnavailable(false);
          setIsResolvingKey(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    const cleanAddr = recipientAddress.trim();
    const cached = getCachedPublicKey(cleanAddr, network, savedWallets);
    if (cached) {
      queueMicrotask(() => {
        if (!isCancelled) {
          setIsKeyUnavailable(false);
          setIsResolvingKey(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!isCancelled) {
        setIsResolvingKey(true);
      }
    });

    void resolveRecipientPublicKey(
      cleanAddr,
      network,
      tonClient,
      savedWallets,
    ).then((pubKey) => {
      if (!isCancelled) {
        setIsResolvingKey(false);
        setIsKeyUnavailable(!pubKey);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [recipientAddress, isEncrypted, network, tonClient, savedWallets]);

  const handleToggleEncrypted = (checked: boolean) => {
    onChangeIsEncrypted(checked);
    if (checked && isKeyUnavailable) {
      // Allow user to see status
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Comment (Optional)</span>
        </label>

        {/* Encrypted / Plain Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            {isEncrypted ? (
              <span className="flex items-center gap-1 text-primary">
                <Lock className="w-3 h-3" />
                <span>Encrypted</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Plain text</span>
              </span>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEncrypted}
              disabled={disabled}
              onChange={(e) => handleToggleEncrypted(e.target.checked)}
              aria-label="Toggle encrypted comment"
            />
            <div className="w-8 h-4.5 bg-muted border border-border/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= MAX_COMMENT_CHARS) {
              onChangeComment(val);
            }
          }}
          disabled={disabled}
          placeholder={
            isEncrypted
              ? 'Enter encrypted memo (visible only to recipient)…'
              : 'Enter plain text memo (visible publicly on-chain)…'
          }
          className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary text-xs text-foreground placeholder:text-muted-foreground resize-none transition-all outline-none"
        />
        <div className="absolute right-3 bottom-2 text-[10px] text-muted-foreground">
          {comment.length}/{MAX_COMMENT_CHARS}
        </div>
      </div>

      {/* Encryption Status Notices */}
      {isEncrypted && Boolean(comment.trim()) && (
        <>
          {isKeyUnavailable ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[11px]">
                  Recipient wallet uninitialized
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Recipient has not sent an on-chain transaction yet. Encrypted
                  comments require an active wallet.
                </p>
                <button
                  type="button"
                  onClick={() => onChangeIsEncrypted(false)}
                  className="mt-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 underline cursor-pointer"
                >
                  Switch to Plain Text
                </button>
              </div>
            </div>
          ) : isResolvingKey ? (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full border border-primary/40 border-t-primary animate-spin" />
              <span>Verifying recipient encryption key…</span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>End-to-end encrypted with recipient public key</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
