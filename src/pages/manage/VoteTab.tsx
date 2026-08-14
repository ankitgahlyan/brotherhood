import { useState } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildVoteBody, buildUnvoteBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';

export function VoteTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  async function sendVote(positive: boolean) {
    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }

    const body = positive
      ? buildVoteBody({
          transferRecipient: recipientAddr,
        })
      : buildUnvoteBody({
          transferRecipient: recipientAddr,
        });
    const walletAddr = await getWalletAddress(owner);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage: positive
        ? 'Vote transaction sent!'
        : 'Unvote transaction sent!',
      fallbackError: 'Vote failed',
      onSuccess: () => setToAddr(''),
    });
  }

  return (
    <div className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Delegate Address
        </Label>
        <InputScan toAddr={toAddr} setToAddr={setToAddr} />
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
        <Button
          variant="brand"
          className="h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
          onClick={() => sendVote(true)}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending vote...
            </>
          ) : (
            <>
              <ThumbsUp className="size-4" />
              Vote
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          className="h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
          onClick={() => sendVote(false)}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending unvote...
            </>
          ) : (
            <>
              <ThumbsDown className="size-4" />
              Unvote
            </>
          )}
        </Button>
      </div>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
