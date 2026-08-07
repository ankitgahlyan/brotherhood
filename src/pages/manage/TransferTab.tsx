import { useState, type FormEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildTransferBody, parseUnits } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';

export function TransferTab({
  decimals,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
}: {
  decimals: number;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected) return <WalletRequired />;

  async function handleTransfer(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const recipientAddr = tryParseAddress(toAddr);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const transferAmount = parseUnits(amount.trim(), decimals);
    const body = buildTransferBody({
      toAddress: recipientAddr,
      amount: transferAmount,
      responseAddress: ownerAddress,
      forwardTonAmount: toNano('0.001'),
    });

    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.05'),
          payload: body,
        },
      ],
      successMessage: 'Transfer transaction sent!',
      fallbackError: 'Transfer failed',
      onSuccess: () => {
        setAmount('');
        setToAddr('');
      },
    });
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recipient Address
        </Label>
        <InputScan toAddr={toAddr} setToAddr={setToAddr} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Amount
        </Label>
        <Input
          type="text"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
            <span className="spinner" /> Transferring...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Transfer Tokens
          </>
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}
