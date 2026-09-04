/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo } from 'react';
import { Address } from '@ton/core';
import {
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Coins,
  Shield,
  User,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@demo/wallet-core';

import { Modal } from '@/core/components/ui/modal';
import { FallbackImage } from '@/core/components/ui/fallback-image';
import { useExplorer, getExplorerAddressUrl } from '@/core/explorer';
import { useNavigate } from '@/core/routing';
import { formatLargeValue, shortenAddress, toDecimal } from '@/core/utils';
import type { AssetRowData } from '../asset-row';
import { isFiJetton } from '@/features/jettons';
import { FI_ADDRESS } from '@/lib/brotherhood/config';
import {
  useFiMinterState,
  useFiTotalAccounts,
  usePersonalMinterDetails,
} from '@/lib/brotherhood/queries';
import { isZeroAddress } from '@/lib/brotherhood/ton';

interface AssetDetailsModalProps {
  asset: AssetRowData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { address: userAddress, getActiveWallet } = useWallet();
  const network = getActiveWallet()?.network ?? 'testnet';
  const { explorer } = useExplorer();

  const isGram = asset?.id === 'TON' || asset?.symbol === 'GRAM';
  const isFi = useMemo(() => {
    if (!asset) return false;
    return isFiJetton({ address: asset.id, symbol: asset.symbol });
  }, [asset]);
  const isPersonal = Boolean(asset && !isGram && !isFi);

  // FI contract queries
  const fiStateQuery = useFiMinterState(isOpen && isFi);
  const fiTotalAccountsQuery = useFiTotalAccounts(isOpen && isFi);

  // Personal minter contract queries
  const personalMinterAddress = useMemo(() => {
    if (!isPersonal || !asset?.id) return null;
    try {
      return Address.parse(asset.id);
    } catch {
      return null;
    }
  }, [isPersonal, asset?.id]);

  const personalDetailsQuery = usePersonalMinterDetails(
    personalMinterAddress,
    isOpen && isPersonal,
  );

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const isUserPersonalIssuer = useMemo(() => {
    if (!userAddress || !personalDetailsQuery.data?.adminAddress) return false;
    try {
      return Address.parse(userAddress).equals(
        personalDetailsQuery.data.adminAddress,
      );
    } catch {
      return false;
    }
  }, [userAddress, personalDetailsQuery.data]);

  if (!asset) return null;

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <span>{asset.name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            ({asset.symbol})
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="space-y-4">
        {/* Token Balance Card */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-secondary/50 border border-border">
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border flex items-center justify-center mb-3">
            <FallbackImage
              src={asset.icon}
              alt={asset.name}
              className="w-full h-full object-cover"
              fallback={
                <span className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-base flex items-center justify-center">
                  {asset.fallbackText}
                </span>
              }
            />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {formatLargeValue(String(asset.amount), 4)} {asset.symbol}
          </div>
          {asset.fiat !== undefined && (
            <div className="text-sm text-muted-foreground mt-0.5">
              ${formatLargeValue(String(asset.fiat), 2, 2)}
              {asset.rateLabel && ` · ${asset.rateLabel}`}
            </div>
          )}
        </div>

        {/* 1. GRAMS SPECIFIC VIEW */}
        {isGram && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Network Info
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-primary" /> Network
                </span>
                <span className="font-semibold capitalize text-foreground">
                  {network}
                </span>
              </div>
              {userAddress && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Your Wallet
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground">
                      {shortenAddress(userAddress, 4, false, network)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(userAddress, 'Wallet address')}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy wallet address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getExplorerAddressUrl(
                        network,
                        userAddress,
                        explorer,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Testnet Faucet Redirect Button */}
            {network === 'testnet' ? (
              <a
                href="https://t.me/tnfaucet_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
                <span>Get Grams from Faucet (@tnfaucet_bot)</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-1">
                Grams is the native coin of The Open Network.
              </div>
            )}
          </div>
        )}

        {/* 2. FI TOKEN SPECIFIC VIEW */}
        {isFi && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>BrotherHood FI Minter Data</span>
                {fiStateQuery.isFetching && (
                  <span className="text-[10px] text-muted-foreground animate-pulse">
                    Refreshing...
                  </span>
                )}
              </div>

              {/* Total Accounts */}
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Total Accounts
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {fiTotalAccountsQuery.isLoading
                    ? 'Loading...'
                    : fiTotalAccountsQuery.data !== undefined
                      ? Number(fiTotalAccountsQuery.data).toLocaleString()
                      : fiStateQuery.data?.others?.ref?.totalAccounts !==
                          undefined
                        ? Number(
                            fiStateQuery.data.others.ref.totalAccounts,
                          ).toLocaleString()
                        : '—'}
                </span>
              </div>

              {/* Total Supply */}
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-primary" /> Total Supply
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {fiStateQuery.isLoading
                    ? 'Loading...'
                    : fiStateQuery.data?.totalSupply !== undefined
                      ? `${formatLargeValue(String(toDecimal(fiStateQuery.data.totalSupply, 9)), 2)} FI`
                      : '—'}
                </span>
              </div>

              {/* Admin Address */}
              {fiStateQuery.data?.adminAddress && (
                <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" /> Admin Address
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground">
                      {shortenAddress(
                        fiStateQuery.data.adminAddress.toString(),
                        4,
                        false,
                        network,
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          fiStateQuery.data!.adminAddress.toString(),
                          'Admin address',
                        )
                      }
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy admin address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getExplorerAddressUrl(
                        network,
                        fiStateQuery.data.adminAddress.toString(),
                        explorer,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="View admin on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* DAO Address */}
              {fiStateQuery.data?.daoAddress &&
                !isZeroAddress(fiStateQuery.data.daoAddress) && (
                  <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-primary" /> DAO Address
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-foreground">
                        {shortenAddress(
                          fiStateQuery.data.daoAddress.toString(),
                          4,
                          true,
                          network,
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            fiStateQuery.data!.daoAddress.toString(),
                            'DAO address',
                          )
                        }
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy DAO address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={getExplorerAddressUrl(
                          network,
                          fiStateQuery.data.daoAddress.toString(),
                          explorer,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        title="View DAO on explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

              {/* Wallet Version */}
              {fiStateQuery.data?.walletVersion !== undefined && (
                <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-primary" /> Wallet Version
                  </span>
                  <span className="font-semibold text-foreground">
                    v{Number(fiStateQuery.data.walletVersion)}
                  </span>
                </div>
              )}

              {/* FI Minter Address */}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-primary" /> Minter Address
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-foreground">
                    {shortenAddress(FI_ADDRESS, 4, true, network)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(FI_ADDRESS, 'FI Minter address')}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy FI Minter address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={getExplorerAddressUrl(network, FI_ADDRESS, explorer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="View minter on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Shortcut to Brotherhood */}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/brotherhood');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <span>Open Brotherhood Network</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        )}

        {/* 3. PERSONAL TOKEN SPECIFIC VIEW */}
        {isPersonal && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Personal Token Minter Data</span>
                {personalDetailsQuery.isFetching && (
                  <span className="text-[10px] text-muted-foreground animate-pulse">
                    Refreshing...
                  </span>
                )}
              </div>

              {/* Total Supply */}
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-primary" /> Total Supply
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {personalDetailsQuery.isLoading
                    ? 'Loading...'
                    : personalDetailsQuery.data?.totalSupply !== undefined
                      ? `${formatLargeValue(String(toDecimal(personalDetailsQuery.data.totalSupply, 9)), 2)} ${asset.symbol}`
                      : '—'}
                </span>
              </div>

              {/* Issuer / Admin Address */}
              {personalDetailsQuery.data?.adminAddress && (
                <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Issuer (Admin)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground">
                      {shortenAddress(
                        personalDetailsQuery.data.adminAddress.toString(),
                        4,
                        false,
                        network,
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          personalDetailsQuery.data!.adminAddress.toString(),
                          'Issuer address',
                        )
                      }
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy issuer address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getExplorerAddressUrl(
                        network,
                        personalDetailsQuery.data.adminAddress.toString(),
                        explorer,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="View issuer on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Minter Address */}
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" /> Minter Address
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-foreground">
                    {shortenAddress(asset.id, 4, true, network)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.id, 'Minter address')}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy minter address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={getExplorerAddressUrl(network, asset.id, explorer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="View minter on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* FI Reference */}
              {personalDetailsQuery.data?.fiJettonAddress && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-primary" /> FI Jetton
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground">
                      {shortenAddress(
                        personalDetailsQuery.data.fiJettonAddress.toString(),
                        4,
                        true,
                        network,
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          personalDetailsQuery.data!.fiJettonAddress.toString(),
                          'FI address',
                        )
                      }
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy FI address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getExplorerAddressUrl(
                        network,
                        personalDetailsQuery.data.fiJettonAddress.toString(),
                        explorer,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="View FI on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link to Minter on Explorer */}
            <a
              href={getExplorerAddressUrl(network, asset.id, explorer)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
            >
              <span>
                View Minter on{' '}
                {explorer === 'tonviewer' ? 'Tonviewer' : 'Tonscan'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Issuer shortcut button */}
            {isUserPersonalIssuer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/personal-jetton');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                <span>Manage Your Personal Token</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal.Container>
  );
};
