import { useEffect, useState, type FormEvent } from 'react';
import { Address, fromNano, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildBuyCreditBody, buildBurnBody, parseUnits } from '../../lib/deploy';
import {
  getWalletAddress,
  getPersonalMinterForIssuer,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
} from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';

export function CreditTab({
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
  const [buyIssuer, setBuyIssuer] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [paybackIssuer, setPaybackIssuer] = useState('');
  const [paybackAmount, setPaybackAmount] = useState('');
  const { sendTransaction, loading, status, setStatus } =
    useSendFiTransaction(tonConnectUI, network);
  const [personalBalance, setPersonalBalance] = useState<bigint | null>(null);
  const [personalBalanceError, setPersonalBalanceError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!ownerAddress) return;
    const issuerAddr = tryParseAddress(paybackIssuer);
    if (!issuerAddr) {
      setPersonalBalance(null);
      setPersonalBalanceError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const minter = await getPersonalMinterForIssuer(issuerAddr);
        if (!minter) {
          if (!cancelled) {
            setPersonalBalance(null);
            setPersonalBalanceError(
              'This issuer has no Personal Token minter deployed',
            );
          }
          return;
        }
        const balance = await getPersonalWalletBalance(minter, ownerAddress);
        if (!cancelled) {
          setPersonalBalance(balance);
          setPersonalBalanceError(null);
        }
      } catch {
        if (!cancelled) {
          setPersonalBalance(null);
          setPersonalBalanceError('Could not read your Personal Token balance');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paybackIssuer, ownerAddress]);

  if (!isConnected) return <WalletRequired />;

  async function handleBuyCredit(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddr = tryParseAddress(buyIssuer);
    if (!issuerAddr) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(buyAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const body = buildBuyCreditBody({
      transferRecipient: issuerAddr,
      amount: parseUnits(buyAmount.trim(), decimals),
      responseAddress: ownerAddress,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('1.5'),
          payload: body,
        },
      ],
      successMessage:
        'Buy transaction sent! The issuer mints your Personal Token on receipt.',
      fallbackError: 'Buy failed',
      onSuccess: () => {
        setBuyAmount('');
        setBuyIssuer('');
      },
    });
  }

  async function handlePayback(e: FormEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddr = tryParseAddress(paybackIssuer);
    if (!issuerAddr) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(paybackAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const personalMinter = await getPersonalMinterForIssuer(issuerAddr);
    if (!personalMinter) {
      setStatus({
        type: 'error',
        message: 'This issuer has no Personal Token minter deployed',
      });
      return;
    }
    const personalWallet = await getPersonalWalletAddress(
      personalMinter,
      ownerAddress,
    );
    // burning with sendExcessesTo set triggers the issuer's payback leg
    const body = buildBurnBody(
      parseUnits(paybackAmount.trim(), decimals),
      ownerAddress,
    );

    await sendTransaction({
      messages: [
        {
          address: personalWallet.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage:
        'Payback transaction sent! Burning your Personal Token returns the FI loan.',
      fallbackError: 'Payback failed',
      onSuccess: () => {
        setPaybackAmount('');
        setPaybackIssuer('');
      },
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleBuyCredit} className="space-y-4.5">
        <h3 className="text-base font-semibold">Buy Credit</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Issuer Address
          </Label>
          <InputScan toAddr={buyIssuer} setToAddr={setBuyIssuer} />
          <p className="text-xs text-muted-foreground">
            Lend FI to an issuer and receive their Personal Token as credit.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount (FI)
          </Label>
          <Input
            type="text"
            placeholder="100"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Buying credit...
            </>
          ) : (
            'Buy Credit'
          )}
        </Button>
        {status && <StatusAlert type={status.type} message={status.message} />}
      </form>

      <Separator />

      <form onSubmit={handlePayback} className="space-y-4.5">
        <h3 className="text-base font-semibold">Pay Back</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Issuer Address
          </Label>
          <InputScan toAddr={paybackIssuer} setToAddr={setPaybackIssuer} />
          <p className="text-xs text-muted-foreground">
            Burn your Personal Token; the issuer returns the FI loan.
          </p>
          {personalBalance !== null && (
            <p className="text-xs text-muted-foreground">
              Your Personal Token balance on this issuer:{' '}
              <span className="font-semibold">{fromNano(personalBalance)}</span>
            </p>
          )}
          {personalBalanceError && (
            <p className="text-xs text-destructive">{personalBalanceError}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount (Personal Tokens)
          </Label>
          <Input
            type="text"
            placeholder="100"
            value={paybackAmount}
            onChange={(e) => setPaybackAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Paying back...
            </>
          ) : (
            'Pay Back'
          )}
        </Button>
        {status && <StatusAlert type={status.type} message={status.message} />}
      </form>
    </div>
  );
}
