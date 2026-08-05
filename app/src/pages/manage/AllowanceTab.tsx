import { useState, type FormEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import {
  buildSetAllowanceBody,
  buildSpendAllowanceBody,
  parseUnits,
} from '../../lib/deploy';
import { getWalletAddress, listAllowances } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';

export function AllowanceTab({
  decimals,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  fiWalletState,
  onSuccess,
}: {
  decimals: number;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  fiWalletState: FiWalletStore | null;
  onSuccess: () => void;
}) {
  const [granteeAddr, setGranteeAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [spendWallet, setSpendWallet] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendReceiver, setSpendReceiver] = useState('');
  const { sendTransaction, loading, status, setStatus } =
    useSendFiTransaction(tonConnectUI, network);

  if (!isConnected) return <WalletRequired />;
  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  function formatAmount(amount: bigint): string {
    const divisor = 10n ** BigInt(decimals);
    const whole = amount / divisor;
    const remainder = amount % divisor;
    if (remainder === 0n) return whole.toString();
    const fracStr = remainder
      .toString()
      .padStart(decimals, '0')
      .replace(/0+$/, '');
    return `${whole}.${fracStr}`;
  }

  async function handleSetAllowance(e: FormEvent, revoke: boolean) {
    e.preventDefault();
    const grantee = tryParseAddress(granteeAddr);
    if (!grantee) {
      setStatus({ type: 'error', message: 'Invalid grantee address' });
      return;
    }
    if (!revoke) {
      const amountParsed = parseFloat(amount);
      if (isNaN(amountParsed) || amountParsed < 0) {
        setStatus({ type: 'error', message: 'Enter a valid amount' });
        return;
      }
    }

    const body = buildSetAllowanceBody({
      grantee,
      amount: revoke ? 0n : parseUnits(amount.trim(), decimals),
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
      successMessage: revoke ? 'Allowance revoked' : 'Allowance granted',
      fallbackError: 'Grant failed',
      onSuccess: () => {
        setGranteeAddr('');
        setAmount('');
        onSuccess();
      },
    });
  }

  async function handleSpend(e: FormEvent) {
    e.preventDefault();
    const wallet = tryParseAddress(spendWallet);
    if (!wallet) {
      setStatus({ type: 'error', message: 'Invalid wallet address' });
      return;
    }
    const receiver = tryParseAddress(spendReceiver);
    if (!receiver) {
      setStatus({ type: 'error', message: 'Invalid receiver address' });
      return;
    }
    const amountParsed = parseFloat(spendAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const body = buildSpendAllowanceBody({
      amount: parseUnits(spendAmount.trim(), decimals),
      receiver,
      sendExcessesTo: owner,
    });
    // The SpendAllowance message goes to the grantor's wallet (the wallet
    // that holds the allowance map); the connected owner is the grantee.
    await sendTransaction({
      messages: [
        {
          address: wallet.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage: 'Spend transaction sent!',
      fallbackError: 'Spend failed',
      onSuccess: () => {
        setSpendAmount('');
        setSpendReceiver('');
        onSuccess();
      },
    });
  }

  return (
    <div className="space-y-4.5">
      {fiWalletState && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Allowances
          </p>
          {listAllowances(fiWalletState).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No allowances granted yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {listAllowances(fiWalletState).map((entry) => (
                <li
                  key={entry.grantee.toString()}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-mono truncate">
                    {entry.grantee.toString().slice(0, 12)}...
                  </span>
                  <span className="font-bold">
                    {formatAmount(entry.amount)} FI
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Separator />
      <form
        onSubmit={(e) => handleSetAllowance(e, false)}
        className="space-y-4.5"
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Grantee Address
          </Label>
          <InputScan toAddr={granteeAddr} setToAddr={setGranteeAddr} />
          <p className="text-xs text-muted-foreground">
            The friend who may spend from your FI balance.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount
          </Label>
          <Input
            type="text"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 h-12 rounded-full text-[15px] font-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Sending...
              </>
            ) : (
              'Grant Allowance'
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 h-12 rounded-full text-[15px] font-bold"
            disabled={loading || !granteeAddr.trim()}
            onClick={(e) => handleSetAllowance(e, true)}
          >
            Revoke
          </Button>
        </div>
      </form>

      <Separator className="my-4" />

      <form onSubmit={handleSpend} className="space-y-4.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Grantor Wallet Address
          </Label>
          <InputScan toAddr={spendWallet} setToAddr={setSpendWallet} />
          <p className="text-xs text-muted-foreground">
            The wallet that granted you an allowance.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount to Spend
          </Label>
          <Input
            type="text"
            placeholder="0.0"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Receiver Address
          </Label>
          <InputScan toAddr={spendReceiver} setToAddr={setSpendReceiver} />
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Sending...
            </>
          ) : (
            'Spend from Allowance'
          )}
        </Button>
      </form>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
