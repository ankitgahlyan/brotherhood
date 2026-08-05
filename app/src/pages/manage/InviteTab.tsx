import { useState, type FormEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildInviteBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { UserPlus } from 'lucide-react';
import { StatusAlert } from '../DeployPage';

export function InviteTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const [inviteId, setInviteId] = useState('');
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!ownerAddress) return <WalletRequired />;

  async function handleInvite(e: FormEvent) {
    e.preventDefault();

    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    if (!ownerAddress) {
      setStatus({ type: 'error', message: 'Wallet not connected' });
      return;
    }

    const body = buildInviteBody({
      transferRecipient: recipientAddr,
      id: inviteId.trim(),
    });
    // const client = getTonClient(network);
    const walletAddr = await getWalletAddress(
      // client,
      // Address.parse(contractAddr),
      ownerAddress,
    );

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage: 'Invite transaction sent!',
      fallbackError: 'Invite failed',
      onSuccess: () => {
        setToAddr('');
        setInviteId('');
      },
    });
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recipient Address
        </Label>
        <InputScan toAddr={toAddr} setToAddr={setToAddr} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Invite ID (optional)
        </Label>
        <Input
          type="text"
          placeholder="Invite reference"
          value={inviteId}
          onChange={(e) => setInviteId(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          This will send an invite message through your wallet contract.
        </p>
      </div>
      <Button
        variant="brand"
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Sending invite...
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Send Invite
          </>
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}
