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
import { Flame, Send, AlertTriangle, ExternalLink } from 'lucide-react';
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/core/components/ui/modal/modal';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { CopyButton } from '@/core/components/ui/copy-button';
import { TxButton } from '@/core/components/ui/tx-button';
import { useExplorer, getExplorerAddressUrl } from '@/core/explorer';
import { tokenImageUrls } from '@/core/utils';
import { useBrotherhoodTransaction } from '@/features/brotherhood/hooks/use-brotherhood-transaction';
import { RecipientField } from '@/features/send/components/recipient-field/recipient-field';
import {
  buildNftBurnBody,
  buildNftTransferBody,
  NFT_DESTROY_GAS,
  NFT_TRANSFER_GAS,
} from '../../lib/nft-transfer';
import { buildDestroyContractBody } from '@/features/dns/lib/dns-bodies';
import {
  useDnsStore,
  selectOwnedDomains,
} from '@/features/dns/store/dns-store';
import { clearDomainResolutionCache } from '@/core/lib/dns';
import { clearDomainLookupCache } from '@/features/dns/hooks/use-domain-lookup';
import {
  BRO_COLLECTION_RESOLVER,
  type Network,
} from '@/lib/brotherhood/config';

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
  const { explorer } = useExplorer();
  const updateDomain = useDnsStore((s) => s.updateDomain);
  const removeDomain = useDnsStore((s) => s.removeDomain);

  const network = (savedWallets.find((w) => w.id === activeWalletId)?.network ??
    'testnet') as Network;
  const ownedBroDomains = useDnsStore((s) => selectOwnedDomains(s, network));

  const { send, isSending, error } = useBrotherhoodTransaction(
    currentWallet,
    walletKit,
  );

  const [mode, setMode] = useState<'transfer' | 'burn'>('transfer');
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedRecipientAddress, setResolvedRecipientAddress] = useState<
    string | null
  >(null);

  const isBroDomain = useMemo(() => {
    if (!nft) return false;
    if (ownedBroDomains.some((d) => d.nftAddress === nft.address)) {
      return true;
    }
    const nftName = nft.info?.name?.toLowerCase() ?? '';
    const nftDesc = nft.info?.description?.toLowerCase() ?? '';
    return nftName.endsWith('.bro') || nftDesc.includes('.bro domain');
  }, [nft, ownedBroDomains]);

  const effectiveRecipient = useMemo(() => {
    if (resolvedRecipientAddress) return resolvedRecipientAddress;
    const trimmed = recipientInput.trim();
    if (isValidAddress(trimmed)) return trimmed;
    return null;
  }, [recipientInput, resolvedRecipientAddress]);

  const handleClose = useCallback(() => {
    setMode('transfer');
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

  const handleBurn = useCallback(async () => {
    if (!nft || !address) return;

    try {
      const ownerAddress = Address.parse(address);
      const queryId = BigInt(Date.now());

      if (isBroDomain) {
        // .bro DnsItem contracts support native DestroyContract (0x646e7364) which burns the NFT & refunds TON storage
        const payload = buildDestroyContractBody(queryId, ownerAddress);
        await send([
          {
            toAddress: nft.address,
            amount: NFT_DESTROY_GAS,
            payload,
          },
        ]);
        removeDomain(nft.address, network);
        clearDomainResolutionCache();
        clearDomainLookupCache();
      } else {
        // Standard TEP-62 NFTs are burned by transferring ownership to ZERO_ADDRESS
        const payload = buildNftBurnBody({
          queryId,
          responseDestination: ownerAddress,
        });
        await send([
          {
            toAddress: nft.address,
            amount: NFT_TRANSFER_GAS,
            payload,
          },
        ]);
      }

      void refreshNfts();
      handleClose();
    } catch (e) {
      console.warn('[NftTransferModal] burn error:', e);
    }
  }, [
    nft,
    address,
    isBroDomain,
    send,
    removeDomain,
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

  const collectionAddress =
    nft.collection?.address ||
    (isBroDomain ? BRO_COLLECTION_RESOLVER : undefined);
  const itemExplorerUrl = getExplorerAddressUrl(network, nft.address, explorer);
  const collectionExplorerUrl = collectionAddress
    ? getExplorerAddressUrl(network, collectionAddress, explorer)
    : null;

  return (
    <ModalContainer
      isOpened={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ModalHeader onClose={handleClose}>
        <ModalTitle>
          {mode === 'transfer' ? 'Transfer NFT' : 'Burn NFT'}
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="p-4 space-y-4">
        {/* Action Mode Switcher (Transfer vs Burn) */}
        <div
          role="tablist"
          aria-label="NFT Action"
          className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-secondary/80 border border-border/70"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'transfer'}
            onClick={() => setMode('transfer')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'transfer'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="nft-modal-tab-transfer"
          >
            <Send className="w-3.5 h-3.5 text-primary" />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'burn'}
            onClick={() => setMode('burn')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'burn'
                ? 'bg-rose-500/15 text-rose-400 shadow-xs border border-rose-500/40'
                : 'text-muted-foreground hover:text-rose-400'
            }`}
            data-testid="nft-modal-tab-burn"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Burn</span>
          </button>
        </div>

        {/* NFT Preview banner */}
        <div className="p-3 bg-secondary/50 border border-border rounded-2xl space-y-2.5">
          <div className="flex items-center gap-3">
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
              {nft.collection?.name && (
                <p className="text-xs text-muted-foreground truncate">
                  {nft.collection.name}
                </p>
              )}
              {indexLabel && (
                <p className="text-xs text-muted-foreground truncate">
                  Index: {indexLabel}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
            {collectionAddress && collectionExplorerUrl && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Collection</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <a
                    href={collectionExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline truncate cursor-pointer"
                    data-testid="nft-collection-explorer-link"
                    title="Open collection in explorer"
                  >
                    <span>
                      {collectionAddress.slice(0, 6)}…
                      {collectionAddress.slice(-4)}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <CopyButton address={collectionAddress} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Item Address</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href={itemExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline truncate cursor-pointer"
                  data-testid="nft-item-explorer-link"
                  title="Open item in explorer"
                >
                  <span>
                    {nft.address.slice(0, 6)}…{nft.address.slice(-4)}
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <CopyButton address={nft.address} />
              </div>
            </div>
          </div>
        </div>

        {mode === 'transfer' ? (
          <>
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

            {/* Transfer Action */}
            <div className="pt-2">
              <TxButton
                size="lg"
                className="w-full font-semibold"
                disabled={!effectiveRecipient || isSending}
                loading={isSending}
                onAction={handleTransfer}
                actionLabel="Confirm Transfer"
                completeLabel="Transferred!"
                data-testid="nft-transfer-submit-button"
              >
                Transfer NFT
              </TxButton>
            </div>
          </>
        ) : (
          <>
            {/* Burn Warning Card */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isBroDomain
                    ? 'Permanent Domain Destruction'
                    : 'Permanent NFT Burn'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isBroDomain
                  ? 'Burning this .bro domain permanently destroys its on-chain DNS contract and refunds its remaining TON storage reserve back to your wallet.'
                  : 'Burning this NFT permanently transfers ownership to the zero burn address (0:0000…0000). This action is irreversible.'}
              </p>
            </div>

            {/* Gas disclosure */}
            <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
              <span>Network Fee</span>
              <span className="font-medium text-foreground">
                {isBroDomain ? '~0.05 TON (Storage refunded)' : '~0.08 TON'}
              </span>
            </div>

            {error && <p className="text-xs text-rose-500 px-1">{error}</p>}

            {/* Burn Action */}
            <div className="pt-2">
              <TxButton
                size="lg"
                variant="danger"
                className="w-full font-semibold"
                disabled={!address || isSending}
                loading={isSending}
                onAction={handleBurn}
                actionLabel="Confirm Burn"
                completeLabel="Burned!"
                data-testid="nft-burn-submit-button"
              >
                <Flame className="w-4 h-4 mr-1.5" />
                {isBroDomain ? 'Destroy & Reclaim TON' : 'Burn NFT'}
              </TxButton>
            </div>
          </>
        )}
      </ModalBody>
    </ModalContainer>
  );
};
