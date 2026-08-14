import { useState, type SyntheticEvent } from 'react';
import { Address, toNano } from '@ton/core';
import { buildBurnBody, parseUnits } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { WalletRequired, type Network } from './common';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusAlert } from '../DeployPage';

export function BurnTab({
  decimals,
  isConnected,
  network,
  ownerAddress,
  onSuccess,
}: {
  decimals: number;
  isConnected: boolean;
  network: Network;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
      network,
  );

  if (!isConnected) return <WalletRequired />;

  async function handleBurn(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const burnAmount = parseUnits(amount.trim(), decimals);
    const body = buildBurnBody(burnAmount, ownerAddress);

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
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Burn transaction sent!',
      fallbackError: 'Burn failed',
      onSuccess: () => {
        setAmount('');
        setTimeout(onSuccess, 5000);
      },
    });
  }

  return (
    <form onSubmit={handleBurn} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Amount to Burn
        </Label>
        <Input
          type="text"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Burns tokens from your wallet. This action is irreversible.
        </p>
      </div>
      <Button
        variant="destructive"
        className="w-full h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Burning...
          </>
        ) : (
          <>
            <Flame className="size-4" />
            Burn Tokens
          </>
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}
