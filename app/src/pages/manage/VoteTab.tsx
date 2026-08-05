import { useState } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildVoteBody, buildUnvoteBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { sendTransaction, loading, status, setStatus } =
    useSendFiTransaction(tonConnectUI, network);

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
    // const client = getTonClient(network);
    const walletAddr = await getWalletAddress(
      // client,
      // Address.parse(contractAddr),
      owner,
    );

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
        <Input
          type="text"
          placeholder="0Q..."
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
        <Button
          className="h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
          onClick={() => sendVote(true)}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending vote...
            </>
          ) : (
            'Vote'
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
            'Unvote'
          )}
        </Button>
      </div>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
