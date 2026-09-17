/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import { Flame, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { useWallet, useWalletKit } from '@demo/wallet-core';

import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { formatLargeValue } from '@/core/utils';
import { isFiJetton } from '@/features/jettons';
import { isPersonalMinterContract } from '@/lib/brotherhood/ton';
import { usePersonalMinterDetails } from '@/lib/brotherhood/queries';
import type { AssetRowData } from '../asset-row';
import { useBurnToken, DEFAULT_BURN_GAS_TON } from '../../hooks/use-burn-token';

interface BurnTokenModalProps {
  asset: AssetRowData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BurnTokenModal: React.FC<BurnTokenModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentWallet, address, getActiveWallet } = useWallet();
  const walletKit = useWalletKit();
  const network = getActiveWallet()?.network ?? 'testnet';

  const [amount, setAmount] = useState('');
  const [isPayback, setIsPayback] = useState(true);
  const [customGasTon, setCustomGasTon] = useState(DEFAULT_BURN_GAS_TON);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isGram = asset?.id === 'TON' || asset?.symbol === 'GRAM';
  const isFi = useMemo(() => {
    if (!asset) return false;
    return isFiJetton({ address: asset.id, symbol: asset.symbol });
  }, [asset]);

  const { data: isPersonalToken } = useQuery({
    queryKey: ['is-personal-minter', asset?.id],
    queryFn: async () => {
      if (!asset?.id || isGram || isFi) return false;
      try {
        return await isPersonalMinterContract(Address.parse(asset.id));
      } catch {
        return false;
      }
    },
    enabled: Boolean(asset?.id && !isGram && !isFi),
    staleTime: Infinity,
  });

  const isPersonal = Boolean(isPersonalToken);

  const personalMinterAddress = useMemo(() => {
    if (!asset?.id || isGram || isFi) return null;
    try {
      return Address.parse(asset.id);
    } catch {
      return null;
    }
  }, [asset?.id, isGram, isFi]);

  const personalDetailsQuery = usePersonalMinterDetails(
    personalMinterAddress,
    isOpen && isPersonal,
  );

  const isUserPersonalIssuer = useMemo(() => {
    if (!address || !personalDetailsQuery.data?.adminAddress) return false;
    try {
      return Address.parse(address).equals(
        personalDetailsQuery.data.adminAddress,
      );
    } catch {
      return false;
    }
  }, [address, personalDetailsQuery.data]);

  // Burn for payback is ONLY applicable to personal tokens issued by other members.
  // Not for self-issued personal tokens, and not for FI or GRAM (which are simple burns).
  const canBurnForPayback =
    isPersonal && !isUserPersonalIssuer && !isFi && !isGram;

  const burner = useBurnToken({
    wallet: currentWallet,
    walletKit,
    walletAddress: address,
    asset,
    amount,
    isPayback: canBurnForPayback ? isPayback : false,
    customGasTon,
    network,
  });

  const handleMax = () => {
    if (asset) {
      setAmount(asset.amount.toString());
    }
  };

  const handleBurn = async () => {
    try {
      await burner.burn();
      setAmount('');
      onClose();
      onSuccess?.();
    } catch {
      // Error handled by burner hook
    }
  };

  if (!asset) return null;

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <span>Burn {asset.symbol}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        {/* Token summary header */}
        <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border/60">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border flex items-center justify-center">
            <FallbackImage
              src={asset.icon}
              alt=""
              className="w-full h-full object-cover"
              fallback={
                <span className="text-xs font-bold text-foreground">
                  {asset.fallbackText}
                </span>
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {asset.name}
            </h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
              <span>Available Balance:</span>
              <span className="font-mono font-medium text-foreground">
                {formatLargeValue(String(asset.amount))} {asset.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Amount to Burn</span>
            <button
              type="button"
              onClick={handleMax}
              className="font-semibold text-primary hover:underline cursor-pointer"
              data-testid="burn-amount-max"
            >
              Use Max
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono pr-16"
              data-testid="burn-amount-input"
            />
            <span className="absolute right-3.5 text-xs font-semibold text-muted-foreground select-none">
              {asset.symbol}
            </span>
          </div>
        </div>

        {/* Payback vs Simple Burn Checkbox (only on Personal Tokens issued by other members) */}
        {canBurnForPayback && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={isPayback}
              onChange={(e) => setIsPayback(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
              data-testid="burn-payback-checkbox"
            />
            <div className="flex flex-col gap-0.5 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>Burn for FI Token Payback</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Recommended
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Sends your wallet address with the burn request to trigger an
                automatic FI token payback from the issuer's account (requires
                credit maturity). Uncheck for a simple burn without payback.
              </p>
            </div>
          </label>
        )}

        {/* Advanced Gas Settings Accordion */}
        <div className="rounded-xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Advanced Gas Settings
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-3 bg-card border-t border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attached Gas:</span>
                <div className="flex items-center gap-1.5 w-32">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={customGasTon}
                    onChange={(e) => setCustomGasTon(e.target.value)}
                    className="w-full px-2 py-1 text-right rounded-lg border border-border bg-background text-foreground text-xs font-mono"
                    data-testid="burn-gas-input"
                  />
                  <span className="text-muted-foreground font-semibold">
                    TON
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Default is 0.6 TON to cover forwarding and storage. Unspent gas
                is automatically returned to your wallet.
              </p>
            </div>
          )}
        </div>

        {/* Validation error or execution error */}
        {(burner.validationError || burner.error) && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50/50 p-2.5 rounded-xl border border-red-200/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{burner.validationError || burner.error}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          fullWidth
          onClick={handleBurn}
          disabled={burner.isDisabled}
          loading={burner.isSending}
          variant="danger"
          data-testid="burn-submit-button"
        >
          <Flame className="w-4 h-4 mr-1.5" />
          <span>
            {burner.isSending
              ? 'Broadcasting Burn…'
              : isPersonal && isPayback
                ? 'Burn & Request Payback'
                : 'Burn Tokens'}
          </span>
        </Button>
      </Modal.Body>
    </Modal.Container>
  );
};
