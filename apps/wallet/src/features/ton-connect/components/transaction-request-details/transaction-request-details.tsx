/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type {
  StructuredItem,
  TransactionRequest,
  TransactionRequestMessage,
} from '@ton/walletkit';
import { getAddressExplorerUrls } from '@demo/wallet-core';

import { useActiveWalletNetwork, useJettonInfo } from '@/features/jettons';
import { formatTonAddress } from '@/core/utils/formatters';
import { decodePayload } from '@/core/utils/payload';
import { formatNanoTonAmount, formatTokenAmount } from '@/core/utils/units';

interface TransactionRequestDetailsProps {
  request: TransactionRequest;
  title?: string;
}

function AddressLink({
  address,
  label,
  isContract = false,
}: {
  address?: string;
  label?: string;
  isContract?: boolean;
}) {
  const network = useActiveWalletNetwork();
  if (!address) return null;

  const normalized =
    formatTonAddress(address, {
      isContract,
      network,
      shorten: false,
    }) || address;

  const display =
    label ??
    formatTonAddress(address, {
      isContract,
      network,
      shorten: true,
      count: 6,
    });

  return (
    <a
      href={getAddressExplorerUrls(normalized, network).tonViewer}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline font-mono"
      title={normalized}
    >
      {display}
    </a>
  );
}

function DetailPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] px-2 py-0.5 bg-secondary text-foreground rounded border border-border/50">
      {children}
    </span>
  );
}

function PayloadDetails({
  label,
  payload,
}: {
  label: string;
  payload?: string;
}) {
  if (!payload) return null;
  const decoded = decodePayload(payload);
  if (!decoded) return null;

  return (
    <div className="text-xs text-muted-foreground break-words flex items-center gap-1.5 flex-wrap mt-1">
      <span className="font-medium text-foreground">{label}:</span>
      {decoded.isComment ? (
        <span className="text-foreground italic">
          {decoded.comment ? `“${decoded.comment}”` : 'Empty comment'}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/80 text-foreground text-[11px] font-medium border border-border/50">
          <span>{decoded.messageName}</span>
          {decoded.opcodeHex && (
            <span className="text-muted-foreground font-mono text-[10px]">
              {decoded.opcodeHex}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function renderDetails(details: Array<string | undefined>) {
  const filtered = details.filter((detail): detail is string =>
    Boolean(detail),
  );
  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {filtered.map((detail) => (
        <DetailPill key={detail}>{detail}</DetailPill>
      ))}
    </div>
  );
}

function RawMessageAction({
  message,
  index,
}: {
  message: TransactionRequestMessage;
  index: number;
}) {
  const decoded = decodePayload(message.payload);
  const actionTitle = decoded?.messageName ?? `Message #${index + 1}`;
  const isContract = Boolean(
    message.stateInit ||
      (decoded && !decoded.isComment && decoded.opcode !== undefined),
  );

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            {actionTitle}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            To <AddressLink address={message.address} isContract={isContract} />
          </div>
        </div>
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          {formatNanoTonAmount(message.amount)}
        </div>
      </div>
      {renderDetails([
        message.stateInit ? 'State init' : undefined,
        message.mode !== undefined ? `Mode ${message.mode}` : undefined,
        message.extraCurrency && Object.keys(message.extraCurrency).length > 0
          ? 'Extra currencies'
          : undefined,
      ])}
      <PayloadDetails label="Payload" payload={message.payload} />
    </div>
  );
}

function TonItemAction({
  item,
  index,
}: {
  item: Extract<StructuredItem, { type: 'ton' }>;
  index: number;
}) {
  const decoded = decodePayload(item.payload);
  const isContract = Boolean(
    item.stateInit ||
      (decoded && !decoded.isComment && decoded.opcode !== undefined),
  );
  const actionTitle = decoded?.messageName ?? `Send TON #${index + 1}`;

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            {actionTitle}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            To <AddressLink address={item.address} isContract={isContract} />
          </div>
        </div>
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          {formatNanoTonAmount(item.amount)}
        </div>
      </div>
      {renderDetails([
        item.stateInit ? 'State init' : undefined,
        item.extraCurrency && Object.keys(item.extraCurrency).length > 0
          ? 'Extra currencies'
          : undefined,
      ])}
      <PayloadDetails label="Payload" payload={item.payload} />
    </div>
  );
}

function JettonItemAction({
  item,
  index,
}: {
  item: Extract<StructuredItem, { type: 'jetton' }>;
  index: number;
}) {
  const network = useActiveWalletNetwork();
  const jettonInfo = useJettonInfo(item.master);

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            Send {jettonInfo?.name ?? 'Jetton'} #{index + 1}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            To <AddressLink address={item.destination} isContract={false} />
          </div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            {jettonInfo?.images?.[0] && (
              <img
                src={jettonInfo.images[0]}
                alt=""
                className="w-4 h-4 rounded-full"
              />
            )}
            <span>{jettonInfo?.name ?? 'Jetton'}</span>
            <AddressLink
              address={item.master}
              label={
                jettonInfo?.symbol ??
                formatTonAddress(item.master, {
                  isContract: true,
                  network,
                  shorten: true,
                  count: 6,
                })
              }
              isContract={true}
            />
          </div>
        </div>
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          {formatTokenAmount(
            item.amount,
            jettonInfo?.decimals ?? 9,
            jettonInfo?.symbol,
          )}
        </div>
      </div>
      {renderDetails([
        item.attachAmount
          ? `Attach ${formatNanoTonAmount(item.attachAmount)}`
          : undefined,
        item.forwardAmount
          ? `Forward ${formatNanoTonAmount(item.forwardAmount)}`
          : undefined,
        item.responseDestination
          ? `Response ${formatTonAddress(item.responseDestination, { isContract: false, network, shorten: true, count: 4 })}`
          : undefined,
      ])}
      <PayloadDetails label="Custom payload" payload={item.customPayload} />
      <PayloadDetails label="Forward payload" payload={item.forwardPayload} />
    </div>
  );
}

function NftItemAction({
  item,
  index,
}: {
  item: Extract<StructuredItem, { type: 'nft' }>;
  index: number;
}) {
  const network = useActiveWalletNetwork();

  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            Transfer NFT #{index + 1}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            To <AddressLink address={item.newOwner} isContract={false} />
          </div>
          <div className="text-xs text-muted-foreground truncate">
            NFT <AddressLink address={item.nftAddress} isContract={true} />
          </div>
        </div>
      </div>
      {renderDetails([
        item.attachAmount
          ? `Attach ${formatNanoTonAmount(item.attachAmount)}`
          : undefined,
        item.forwardAmount
          ? `Forward ${formatNanoTonAmount(item.forwardAmount)}`
          : undefined,
        item.responseDestination
          ? `Response ${formatTonAddress(item.responseDestination, { isContract: false, network, shorten: true, count: 4 })}`
          : undefined,
      ])}
      <PayloadDetails label="Custom payload" payload={item.customPayload} />
      <PayloadDetails label="Forward payload" payload={item.forwardPayload} />
    </div>
  );
}

function StructuredItemAction({
  item,
  index,
}: {
  item: StructuredItem;
  index: number;
}) {
  if (item.type === 'ton') return <TonItemAction item={item} index={index} />;
  if (item.type === 'jetton')
    return <JettonItemAction item={item} index={index} />;
  return <NftItemAction item={item} index={index} />;
}

export function TransactionRequestDetails({
  request,
  title = 'You will sign',
}: TransactionRequestDetailsProps) {
  const items = request.items ?? [];
  const messages = request.messages ?? [];
  const hasItems = items.length > 0;
  const count = hasItems ? items.length : messages.length;

  return (
    <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 divide-y divide-border">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">
            No outgoing messages in this request
          </p>
        ) : hasItems ? (
          items.map((item, index) => (
            <StructuredItemAction
              key={`${item.type}-${index}`}
              item={item}
              index={index}
            />
          ))
        ) : (
          messages.map((message, index) => (
            <RawMessageAction
              key={`${message.address}-${index}`}
              message={message}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
