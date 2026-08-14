import { useState, type SyntheticEvent } from 'react';
import { Address, toNano } from '@ton/core';
import { buildMintBody, parseUnits } from '../../lib/deploy';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import {
  tryParseAddress,
  WalletRequired,
  AdminRequired,
  type Network,
} from './common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { Coins } from 'lucide-react';
import { StatusAlert } from '../DeployPage';

export function MintTab({
  contractAddr,
  decimals,
  isAdmin,
  isConnected,
  network,
  ownerAddress,
  onSuccess,
}: {
  contractAddr: string;
  decimals: number;
  isAdmin: boolean;
  isConnected: boolean;
  network: Network;
  ownerAddress: Address | null;
  onSuccess: () => void;
}) {
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
      network,
  );

  if (!isConnected) return <WalletRequired />;
  if (!isAdmin) return <AdminRequired />;

  async function handleMint(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const recipientRaw = toAddr.trim() || ownerAddress.toString();
    const recipientAddr = tryParseAddress(recipientRaw);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const amountParsed = parseFloat(amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const mintAmountNano = parseUnits(amount.trim(), decimals);
    const body = buildMintBody({
      toAddress: recipientAddr,
      jettonAmount: mintAmountNano,
      forwardTonAmount: toNano('0.02'),
      totalTonAmount: toNano('0.05'),
    });

    await sendTransaction({
      messages: [
        {
          address: Address.parse(contractAddr).toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Mint transaction sent!',
      fallbackError: 'Mint failed',
      onSuccess: () => {
        setAmount('');
        setTimeout(onSuccess, 5000);
      },
    });
  }

  return (
    <form onSubmit={handleMint} className="space-y-4.5">
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
          placeholder="1000"
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
            <span className="spinner" /> Minting...
          </>
        ) : (
          <>
            <Coins className="size-4" />
            Mint Tokens
          </>
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </form>
  );
}
