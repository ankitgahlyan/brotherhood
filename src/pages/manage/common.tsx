import type { ReactNode } from 'react';
import { Address } from '@ton/core';
import { Lock, Wallet } from 'lucide-react';
import type { JettonMetadata } from '../../lib/jettonContent';
import { WalletSelector } from '@/components/wallet-selector';

export type Network = 'mainnet' | 'testnet';

export function tryParseAddress(raw: string): Address | null {
  try {
    return Address.parse(raw.trim());
  } catch {
    return null;
  }
}

export interface JettonInfo {
  totalSupply: bigint;
  mintable: boolean;
  adminAddress: Address | null;
  metadata: Partial<JettonMetadata>;
}

export function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 4) + '...' + addr.slice(-4);
}

export function AddressLink({
  address,
  network,
}: {
  address: string;
  network: Network;
}) {
  const base =
    network === 'testnet'
      ? 'https://testnet.tonviewer.com'
      : 'https://tonviewer.com';
  return (
    <a
      href={`${base}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className="text-primary hover:underline"
    >
      {shortenAddress(address)}
    </a>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="mb-3.5 text-muted-foreground flex justify-center">
        {icon}
      </div>
      <div className="text-[15px] font-semibold mb-1.5">{title}</div>
      {description && (
        <p className="text-sm text-muted-foreground mb-4.5 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function WalletRequired() {
  return (
    <EmptyState
      icon={<Wallet className="size-8" />}
      title="Wallet not connected"
      description="Connect your wallet to perform this action"
      action={<WalletSelector className="rounded-full max-w-55 mx-auto" />}
    />
  );
}

export function AdminRequired() {
  return (
    <EmptyState
      icon={<Lock className="size-8" />}
      title="Admin access required"
      description="Only the contract admin can perform this action"
    />
  );
}
