/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Modal } from '@/core/components/ui/modal';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { formatLargeValue, toDecimal } from '@/core/utils';
import { useTrackedPersonalTokens } from '../../hooks/use-tracked-personal-tokens';
import type { DiscoveredPersonalToken } from '@/lib/brotherhood/ton';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTokenManually } = useTrackedPersonalTokens();

  const [inputAddress, setInputAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [verifiedToken, setVerifiedToken] =
    useState<DiscoveredPersonalToken | null>(null);

  const handleReset = () => {
    setInputAddress('');
    setWarningMessage(null);
    setVerifiedToken(null);
    setIsValidating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputAddress.trim()) return;

    setIsValidating(true);
    setWarningMessage(null);
    setVerifiedToken(null);

    try {
      const result = await addTokenManually(inputAddress.trim());
      if (!result.success) {
        setWarningMessage(
          result.error ||
            'Warning: This address is not a verified BrotherHood personal token minter.',
        );
      } else if (result.token) {
        setVerifiedToken(result.token);
        toast.success(`Added ${result.token.symbol || 'Personal Token'} to assets!`);
        handleClose();
      }
    } catch (err: any) {
      setWarningMessage(
        err?.message ||
          'Failed to inspect contract. Ensure address is a valid personal token minter.',
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className="px-2"
    >
      <Modal.Header onClose={handleClose}>
        <Modal.Title>Add Personal Token</Modal.Title>
      </Modal.Header>

      <Modal.Body className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Enter a BrotherHood personal token minter address to track its balance in your assets.
        </p>

        <form onSubmit={handleValidate} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="minter-address-input"
              className="text-xs font-semibold text-foreground"
            >
              Minter Contract Address
            </label>
            <Input
              id="minter-address-input"
              value={inputAddress}
              onChange={(e) => {
                setInputAddress(e.target.value);
                if (warningMessage) setWarningMessage(null);
                if (verifiedToken) setVerifiedToken(null);
              }}
              placeholder="e.g. kQ... or 0:..."
              className="font-mono text-xs"
              autoFocus
            />
          </div>

          {/* Warning banner if not ecosystem token */}
          {warningMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 font-medium">{warningMessage}</div>
            </div>
          )}

          {/* Verified Token Preview if balance == 0 or prior to saving */}
          {verifiedToken && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  {verifiedToken.name || 'Personal Token'} ({verifiedToken.symbol})
                </div>
                <div className="text-muted-foreground tabular-nums">
                  Your Balance:{' '}
                  {formatLargeValue(
                    String(toDecimal(verifiedToken.balance, 9)),
                    4,
                  )}{' '}
                  {verifiedToken.symbol}
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!inputAddress.trim() || isValidating}
            className="w-full flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Contract...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Token</span>
              </>
            )}
          </Button>
        </form>
      </Modal.Body>
    </Modal.Container>
  );
};
