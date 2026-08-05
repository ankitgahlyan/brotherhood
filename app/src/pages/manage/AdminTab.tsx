import { useState, type FormEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import {
  buildChangeAdminBody,
  buildTopUpTonsBody,
  buildApproveUpgradeBody,
  buildRejectUpgradeBody,
  buildChangeContentBody,
} from '../../lib/deploy';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import {
  tryParseAddress,
  WalletRequired,
  AdminRequired,
  type Network,
  type JettonInfo,
} from './common';
import { ZERO_ADDRESS } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  PenLine,
  ArrowRightLeft,
  Coins,
  Check,
  X,
} from 'lucide-react';
import { StatusAlert } from '../DeployPage';
import { MintTab } from './MintTab';

export function AdminTab({
  contractAddr,
  info,
  isAdmin,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  contractAddr: string;
  info: JettonInfo;
  isAdmin: boolean;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [newAdmin, setNewAdmin] = useState(ZERO_ADDRESS);
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  const [newName, setNewName] = useState(info.metadata.name || '');
  const [newSymbol, setNewSymbol] = useState(info.metadata.symbol || '');
  const newDecimals = info.metadata.decimals || '9';
  const [newDescription, setNewDescription] = useState(
    info.metadata.description || '',
  );
  const [newImage, setNewImage] = useState(info.metadata.image || '');

  if (!isConnected) return <WalletRequired />;
  if (!isAdmin) return <AdminRequired />;

  async function handleChangeAdmin(e: FormEvent) {
    e.preventDefault();
    const adminAddr = tryParseAddress(newAdmin);
    if (!adminAddr) {
      setStatus({ type: 'error', message: 'Invalid admin address' });
      return;
    }

    const body = buildChangeAdminBody(adminAddr);
    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Admin change transaction sent!',
      fallbackError: 'Failed',
      onSuccess: () => setTimeout(onSuccess, 5000),
    });
  }

  async function handleTopUpTons() {
    const body = buildTopUpTonsBody();
    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Top-up transaction sent!',
      fallbackError: 'Top up failed',
      onSuccess: () => setTimeout(onSuccess, 5000),
    });
  }

  async function handleApproveUpgrade() {
    const body = buildApproveUpgradeBody();
    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Approve upgrade transaction sent!',
      fallbackError: 'Approve failed',
      onSuccess: () => setTimeout(onSuccess, 5000),
    });
  }

  async function handleRejectUpgrade() {
    const body = buildRejectUpgradeBody();
    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Reject upgrade transaction sent!',
      fallbackError: 'Reject failed',
      onSuccess: () => setTimeout(onSuccess, 5000),
    });
  }

  async function handleUpdateContent(e: FormEvent) {
    e.preventDefault();

    const body = await buildChangeContentBody({
      name: newName,
      symbol: newSymbol,
      decimals: newDecimals,
      description: newDescription || undefined,
      image: newImage || undefined,
    });
    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Content update transaction sent!',
      fallbackError: 'Failed',
      onSuccess: () => setTimeout(onSuccess, 5000),
    });
  }

  const decimals = parseInt(info.metadata.decimals || '9') || 9;

  return (
    <div className="space-y-0">
      <div className="space-y-4.5">
        <h3 className="font-display text-base font-semibold">Mint Tokens</h3>
        <MintTab
          contractAddr={contractAddr}
          decimals={decimals}
          isAdmin={isAdmin}
          isConnected={isConnected}
          network={network}
          tonConnectUI={tonConnectUI}
          ownerAddress={ownerAddress}
          onSuccess={onSuccess}
        />
      </div>

      <Separator className="my-6" />

      <form onSubmit={handleUpdateContent} className="space-y-4.5">
        <h3 className="font-display text-base font-semibold">
          Update Metadata
        </h3>
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </Label>
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Symbol
            </Label>
            <Input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </Label>
          <Textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Image URL
          </Label>
          <Input
            type="text"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          variant="brand"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Updating...
            </>
          ) : (
            <>
              <PenLine className="size-4" />
              Update Metadata
            </>
          )}
        </Button>
      </form>

      <Separator className="my-6" />

      <form onSubmit={handleChangeAdmin} className="space-y-4.5">
        <h3 className="font-display text-base font-semibold">Transfer Admin</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            New Admin Address
          </Label>
          <Input
            type="text"
            placeholder="0Q..."
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Zero address (0:000...0) revokes admin rights permanently
          </p>
        </div>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Transferring...
            </>
          ) : (
            <>
              <ArrowRightLeft className="size-4" />
              Transfer Admin Rights
            </>
          )}
        </Button>
      </form>

      <Separator className="my-6" />

      <div className="space-y-4.5">
        <h3 className="font-display text-base font-semibold">Admin Actions</h3>
        <div className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
          <Button
            variant="brand"
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleTopUpTons}
          >
            {loading ? (
              <>
                <span className="spinner" /> Top Up...
              </>
            ) : (
              <>
                <Coins className="size-4" />
                Top Up Tons
              </>
            )}
          </Button>
          <Button
            variant="brand"
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleApproveUpgrade}
          >
            {loading ? (
              <>
                <span className="spinner" /> Approving...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Approve Upgrade
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
            onClick={handleRejectUpgrade}
          >
            {loading ? (
              <>
                <span className="spinner" /> Rejecting...
              </>
            ) : (
              <>
                <X className="size-4" />
                Reject Upgrade
              </>
            )}
          </Button>
        </div>
      </div>

      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          className="mt-4"
        />
      )}
    </div>
  );
}
