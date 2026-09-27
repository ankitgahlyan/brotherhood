/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Address } from '@ton/core';
import { isValidAddress, type NFT } from '@ton/walletkit';
import { useWallet, useWalletKit, useNfts } from '@demo/wallet-core';
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/core/components/ui/modal/modal';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { CopyButton } from '@/core/components/ui/copy-button';
import { TxButton } from '@/core/components/ui/tx-button';
import { tokenImageUrls } from '@/core/utils';
import { useBrotherhoodTransaction } from '@/features/brotherhood/hooks/use-brotherhood-transaction';
import { RecipientField } from '@/features/send/components/recipient-field/recipient-field';
import { buildNftTransferBody, NFT_TRANSFER_GAS } from '../../lib/nft-transfer';
import { useDnsStore } from '@/features/dns/store/dns-store';
import type { Network } from '@/lib/brotherhood/config';

interface NftTransferModalProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
  formatNftIndex?: (index: string) => string;
}

const getNftImageSources = (nft: NFT): string[] => {
  const img = nft.info?.image;
  if (!img) return [];
  return [
    ...tokenImageUrls(img),
    ...(img.data ? [`data:image/png;base64,${img.data}`] : []),
  ];
};

export const NftTransferModal: React.FC<NftTransferModalProps> = ({
  nft,
  isOpen,
  onClose,
  formatNftIndex,
}) => {
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const walletKit = useWalletKit();
  const { refreshNfts } = useNfts();
  const updateDomain = useDnsStore((s) => s.updateDomain);

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;

  const { send, isSending, error } = useBrotherhoodTransaction(
    currentWallet,
    walletKit,
  );

  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedRecipientAddress, setResolvedRecipientAddress] = useState<
    string | null
  >(null);

  const effectiveRecipient = useMemo(() => {
    if (resolvedRecipientAddress) return resolvedRecipientAddress;
    const trimmed = recipientInput.trim();
    if (isValidAddress(trimmed)) return trimmed;
    return null;
  }, [recipientInput, resolvedRecipientAddress]);

  const handleClose = useCallback(() => {
    setRecipientInput('');
    setResolvedRecipientAddress(null);
    onClose();
  }, [onClose]);

  const handleTransfer = useCallback(async () => {
    if (!nft || !effectiveRecipient || !address) return;

    try {
      const payload = buildNftTransferBody({
        queryId: BigInt(Date.now()),
        newOwner: Address.parse(effectiveRecipient),
        responseDestination: Address.parse(address),
      });

      await send([
        {
          toAddress: nft.address,
          amount: NFT_TRANSFER_GAS,
          payload,
        },
      ]);

      // If it was an owned .bro domain, mark as transferred
      updateDomain(nft.address, { isOutdated: true }, network);

      // Refresh on-chain NFT list
      void refreshNfts();

      handleClose();
    } catch (e) {
      console.warn('[NftTransferModal] transfer error:', e);
    }
  }, [
    nft,
    effectiveRecipient,
    address,
    send,
    updateDomain,
    network,
    refreshNfts,
    handleClose,
  ]);

  if (!nft) return null;

  const name =
    nft.info?.name ||
    (nft.index && formatNftIndex ? `NFT ${formatNftIndex(nft.index)}` : 'NFT');
  const indexLabel =
    nft.index && formatNftIndex
      ? formatNftIndex(nft.index)
      : (nft.index ?? null);

  return (
    <ModalContainer
      isOpened={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ModalHeader onClose={handleClose}>
        <ModalTitle>Transfer NFT</ModalTitle>
      </ModalHeader>

      <ModalBody className="p-4 space-y-4">
        {/* NFT Preview banner */}
        <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-2xl">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <FallbackImage
              src={getNftImageSources(nft)}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-foreground truncate">
              {name}
            </h4>
            {indexLabel && (
              <p className="text-xs text-muted-foreground truncate">
                Index: {indexLabel}
              </p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-mono text-muted-foreground truncate">
                {nft.address.slice(0, 6)}…{nft.address.slice(-4)}
              </span>
              <CopyButton address={nft.address} />
            </div>
          </div>
        </div>

        {/* Recipient Field */}
        <div>
          <RecipientField
            value={recipientInput}
            onChange={setRecipientInput}
            onResolvedAddressChange={setResolvedRecipientAddress}
            onUseMyAddress={
              address ? () => setRecipientInput(address) : undefined
            }
          />
        </div>

        {/* Gas disclosure */}
        <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
          <span>Network & Transfer Fee</span>
          <span className="font-medium text-foreground">~0.08 TON</span>
        </div>

        {error && <p className="text-xs text-rose-500 px-1">{error}</p>}

        {/* Actions */}
        <div className="pt-2">
          <TxButton
            size="lg"
            className="w-full font-semibold"
            disabled={!effectiveRecipient || isSending}
            loading={isSending}
            onAction={handleTransfer}
            actionLabel="Confirm Transfer"
            completeLabel="Transferred!"
          >
            Transfer NFT
          </TxButton>
        </div>
      </ModalBody>
    </ModalContainer>
  );
};
