import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  Address,
  fromNano,
  toNano,
  beginCell,
  storeStateInit,
} from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  buildBuyCreditBody,
  buildBurnBody,
  buildPersonalMinterDeploy,
  buildPointPersonalMinterBody,
  buildSetCreditNeedBody,
  buildSetMultiplierBody,
  buildRepayDebtBody,
  parseUnits,
} from '../../lib/deploy';
import {
  getWalletAddress,
  getPersonalMinterForIssuer,
  getPersonalWalletAddress,
  getPersonalWalletBalance,
  getFiWalletState,
} from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { InputScan } from '@/components/input-scan';
import {
  Banknote,
  Undo2,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Coins,
  BadgeAlert,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { StatusAlert } from '../DeployPage';

export function CreditTab({
  decimals,
  fiWalletState,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  decimals: number;
  fiWalletState?: FiWalletStore | null;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess?: () => void;
}) {
  const [subTab, setSubTab] = useState<'credit' | 'issue' | 'debt-need'>(
    'credit',
  );

  // Buy / Payback states
  const [buyIssuer, setBuyIssuer] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [paybackIssuer, setPaybackIssuer] = useState('');
  const [paybackAmount, setPaybackAmount] = useState('');
  const [personalBalance, setPersonalBalance] = useState<bigint | null>(null);
  const [personalBalanceError, setPersonalBalanceError] = useState<
    string | null
  >(null);

  // Issue Token states
  const [name, setName] = useState('My Personal Token');
  const [symbol, setSymbol] = useState('PTK');
  const [tokenDecimals, setTokenDecimals] = useState('9');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [issuerAddr, setIssuerAddr] = useState('');
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  // Debt & Credit Need states
  const [creditNeedAmount, setCreditNeedAmount] = useState('');
  const [creditMaturityDate, setCreditMaturityDate] = useState('');
  const [multiplierVal, setMultiplierVal] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  // Info for Buy & Payback issuers
  const [buyIssuerState, setBuyIssuerState] = useState<FiWalletStore | null>(
    null,
  );
  const [paybackIssuerState, setPaybackIssuerState] =
    useState<FiWalletStore | null>(null);

  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  function getFutureIsoDateString(days: number): string {
    const d = new Date(Date.now() + days * 86400 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  function formatMaturityDate(timestamp?: bigint | number): string {
    if (!timestamp || Number(timestamp) === 0) return 'None';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  useEffect(() => {
    const issuer = tryParseAddress(buyIssuer);
    if (!issuer) {
      setBuyIssuerState(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const state = await getFiWalletState(issuer);
        if (!cancelled) setBuyIssuerState(state);
      } catch {
        if (!cancelled) setBuyIssuerState(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buyIssuer]);

  useEffect(() => {
    const issuer = tryParseAddress(paybackIssuer);
    if (!issuer) {
      setPaybackIssuerState(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const state = await getFiWalletState(issuer);
        if (!cancelled) setPaybackIssuerState(state);
      } catch {
        if (!cancelled) setPaybackIssuerState(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paybackIssuer]);

  useEffect(() => {
    if (!ownerAddress) return;
    const issuer = tryParseAddress(paybackIssuer);
    if (!issuer) {
      setPersonalBalance(null);
      setPersonalBalanceError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const minter = await getPersonalMinterForIssuer(issuer);
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

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  async function handleBuyCredit(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddrParsed = tryParseAddress(buyIssuer);
    if (!issuerAddrParsed) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(buyAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const body = buildBuyCreditBody({
      transferRecipient: issuerAddrParsed,
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
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handlePayback(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const issuerAddrParsed = tryParseAddress(paybackIssuer);
    if (!issuerAddrParsed) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }
    const amountParsed = parseFloat(paybackAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount' });
      return;
    }

    const personalMinter = await getPersonalMinterForIssuer(issuerAddrParsed);
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
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleIssue(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    if (!name.trim() || !symbol.trim()) {
      setStatus({ type: 'error', message: 'Name and symbol are required' });
      return;
    }
    const dec = parseInt(tokenDecimals);
    if (isNaN(dec) || dec < 0 || dec > 18) {
      setStatus({
        type: 'error',
        message: 'Decimals must be between 0 and 18',
      });
      return;
    }

    const issuerOwnerRaw = issuerAddr.trim() || ownerAddress.toString();
    const issuerOwner = tryParseAddress(issuerOwnerRaw);
    if (!issuerOwner) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }

    setStatus({ type: 'info', message: 'Preparing deployment...' });

    const issuerWallet = await getWalletAddress(issuerOwner);
    let issuerActive = true;
    try {
      await getFiWalletState(issuerOwner);
    } catch {
      issuerActive = false;
    }
    if (!issuerActive) {
      setStatus({
        type: 'info',
        message:
          'Issuer FI wallet not found; deploy and activate it first, or the pointer step will fail.',
      });
    }

    const { contractAddress, stateInit } = await buildPersonalMinterDeploy({
      issuerWallet,
      adminAddress: ownerAddress,
      metadata: {
        name: name.trim(),
        symbol: symbol.trim(),
        decimals: tokenDecimals,
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined,
      },
    });

    const friendlyAddr = contractAddress.toString({
      bounceable: true,
      testOnly: network === 'testnet',
    });

    const pointerBody = buildPointPersonalMinterBody({
      personalMinter: contractAddress,
    });

    await sendTransaction({
      messages: [
        {
          address: contractAddress.toString(),
          amount: toNano('1'),
          stateInit: beginCell().store(storeStateInit(stateInit)).endCell(),
        },
        {
          address: issuerWallet.toString(),
          amount: toNano('0.6'),
          payload: pointerBody,
        },
      ],
      successMessage:
        'Personal Token minter deployed and issuer wallet pointed at it!',
      fallbackError: 'Deployment failed',
      onSuccess: () => {
        setDeployedAddress(friendlyAddr);
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleSetCreditNeed(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const amountParsed = parseFloat(creditNeedAmount);
    if (isNaN(amountParsed) || amountParsed < 0) {
      setStatus({ type: 'error', message: 'Enter a valid credit need amount' });
      return;
    }

    let maturityTimestamp = 0;
    if (amountParsed > 0) {
      if (!creditMaturityDate) {
        setStatus({
          type: 'error',
          message: 'Please set a maturity date for your credit request',
        });
        return;
      }
      maturityTimestamp = Math.floor(
        new Date(creditMaturityDate).getTime() / 1000,
      );
      const nowSec = Math.floor(Date.now() / 1000);
      if (isNaN(maturityTimestamp) || maturityTimestamp <= nowSec) {
        setStatus({
          type: 'error',
          message: 'Maturity date must be in the future',
        });
        return;
      }
      const existingMaturity = Number(fiWalletState?.creditMaturity || 0n);
      if (existingMaturity > nowSec && maturityTimestamp < existingMaturity) {
        setStatus({
          type: 'error',
          message: `Cannot shorten maturity date. New date must be on or after ${new Date(existingMaturity * 1000).toLocaleString()}`,
        });
        return;
      }
    }

    const body = buildSetCreditNeedBody({
      amount: parseUnits(creditNeedAmount.trim(), decimals),
      maturityDate: BigInt(maturityTimestamp),
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Credit need updated successfully!',
      fallbackError: 'Failed to update credit need',
      onSuccess: () => {
        setCreditNeedAmount('');
        setCreditMaturityDate('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleSetMultiplier(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const mult = parseInt(multiplierVal.trim(), 10);
    if (isNaN(mult) || mult <= 0) {
      setStatus({
        type: 'error',
        message: 'Multiplier must be greater than 0',
      });
      return;
    }

    const body = buildSetMultiplierBody({ multiplier: mult });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Credit multiplier updated!',
      fallbackError: 'Failed to update multiplier',
      onSuccess: () => {
        setMultiplierVal('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleRepayDebt(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const amountParsed = parseFloat(repayAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount to repay' });
      return;
    }

    const body = buildRepayDebtBody({
      amount: parseUnits(repayAmount.trim(), decimals),
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Debt repayment processed!',
      fallbackError: 'Failed to repay debt',
      onSuccess: () => {
        setRepayAmount('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as 'credit' | 'issue' | 'debt-need')}
      >
        <TabsList className="grid grid-cols-3 w-full h-10 bg-secondary/60">
          <TabsTrigger value="credit" className="text-xs font-semibold">
            <Banknote className="size-3.5 mr-1.5" />
            Buy & Pay Back
          </TabsTrigger>
          <TabsTrigger value="issue" className="text-xs font-semibold">
            <Sparkles className="size-3.5 mr-1.5" />
            Issue Personal Token
          </TabsTrigger>
          <TabsTrigger value="debt-need" className="text-xs font-semibold">
            <ShieldCheck className="size-3.5 mr-1.5" />
            Debt & Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="mt-5 space-y-6">
          <form onSubmit={handleBuyCredit} className="space-y-4.5">
            <h3 className="font-display text-base font-semibold">Buy Credit</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Issuer Address
              </Label>
              <InputScan toAddr={buyIssuer} setToAddr={setBuyIssuer} />
              <p className="text-xs text-muted-foreground">
                Lend FI to an issuer and receive their Personal Token as credit.
              </p>
              {buyIssuerState && (
                <div className="p-2.5 rounded-lg bg-secondary/50 border text-xs space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Need:</span>
                    <span className="font-semibold text-primary">
                      {fromNano(buyIssuerState.creditNeed)} FI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Multiplier:</span>
                    <span className="font-semibold">
                      {buyIssuerState.multiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Maturity Lock:
                    </span>
                    <span className="font-semibold">
                      {formatMaturityDate(buyIssuerState.creditMaturity)}
                    </span>
                  </div>
                </div>
              )}
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
              variant="brand"
              className="w-full h-12 rounded-full text-[15px] font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Buying credit...
                </>
              ) : (
                <>
                  <Banknote className="size-4 mr-2" />
                  Buy Credit
                </>
              )}
            </Button>
          </form>

          <Separator />

          <form onSubmit={handlePayback} className="space-y-4.5">
            <h3 className="font-display text-base font-semibold">
              Pay Back Loan
            </h3>
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
                  <span className="font-semibold">
                    {fromNano(personalBalance)}
                  </span>
                </p>
              )}
              {personalBalanceError && (
                <p className="text-xs text-destructive">
                  {personalBalanceError}
                </p>
              )}
              {paybackIssuerState?.creditMaturity &&
                Number(paybackIssuerState.creditMaturity) * 1000 >
                  Date.now() && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 mt-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Loan Not Matured</div>
                      <div>
                        This issuer's loan is locked until{' '}
                        <span className="font-bold">
                          {formatMaturityDate(
                            paybackIssuerState.creditMaturity,
                          )}
                        </span>
                        . Early payback before maturity will be rejected and
                        refunded.
                      </div>
                    </div>
                  </div>
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
                <>
                  <Undo2 className="size-4 mr-2" />
                  Pay Back
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="issue" className="mt-5 space-y-6">
          <form onSubmit={handleIssue} className="space-y-4.5">
            <h3 className="font-display text-base font-semibold">
              Create Personal Token
            </h3>
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Token Name
                </Label>
                <Input
                  placeholder="My Personal Token"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Symbol
                </Label>
                <Input
                  placeholder="PTK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Decimals
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="18"
                  value={tokenDecimals}
                  onChange={(e) => setTokenDecimals(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Issuer Owner
                </Label>
                <InputScan toAddr={issuerAddr} setToAddr={setIssuerAddr} />
                <p className="text-xs text-muted-foreground">
                  The Member whose FI account backs this token (defaults to
                  you).
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                placeholder="Describe your personal token..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Image URL
              </Label>
              <Input
                type="text"
                placeholder="https://example.com/logo.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Deploys a Personal Token minter for your FI wallet and points your
              wallet at it.
            </p>

            <Button
              variant="brand"
              className="w-full h-12 rounded-full text-[15px] font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Deploying...
                </>
              ) : (
                'Create Personal Token'
              )}
            </Button>
          </form>

          {deployedAddress && (
            <Card>
              <CardContent className="text-center py-5">
                <div className="mb-3.5 flex justify-center text-success">
                  <CheckCircle className="size-9" strokeWidth={1.5} />
                </div>
                <div className="text-base font-bold mb-1.5">
                  Personal Token Deployed
                </div>
                <p className="text-sm text-muted-foreground mb-4.5">
                  Buyers can now lend you FI in exchange for your token.
                </p>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  <Button asChild className="rounded-full h-10">
                    <a
                      href={`${network === 'testnet' ? 'https://testnet.tonviewer.com' : 'https://tonviewer.com'}/${deployedAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4 mr-1.5" />
                      View on Tonviewer
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full h-10"
                    onClick={() => {
                      navigator.clipboard.writeText(deployedAddress);
                    }}
                  >
                    <Copy className="size-4 mr-1.5" />
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="debt-need" className="mt-5 space-y-6">
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <div className="p-4 rounded-xl bg-secondary/40 border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Current Debt
              </div>
              <div className="font-display text-xl font-bold mt-1 text-destructive">
                {fromNano(fiWalletState?.debt || 0n)} TON / FI
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/40 border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Credit Need Limit
              </div>
              <div className="font-display text-xl font-bold mt-1 text-primary">
                {fromNano(fiWalletState?.creditNeed || 0n)} FI
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/40 border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Active Maturity
              </div>
              <div className="font-display text-sm font-semibold mt-2 text-foreground">
                {formatMaturityDate(fiWalletState?.creditMaturity)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSetCreditNeed} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Set Credit Need & Maturity Lock
              </Label>
              <p className="text-xs text-muted-foreground">
                Specifies how much credit you can receive in incoming loan
                transfers and sets the maturity lock.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Credit Need Amount (FI)
              </Label>
              <Input
                type="text"
                placeholder="1000"
                value={creditNeedAmount}
                onChange={(e) => setCreditNeedAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Maturity Date & Time
                </Label>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() =>
                      setCreditMaturityDate(getFutureIsoDateString(7))
                    }
                  >
                    +7d
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() =>
                      setCreditMaturityDate(getFutureIsoDateString(30))
                    }
                  >
                    +30d
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() =>
                      setCreditMaturityDate(getFutureIsoDateString(90))
                    }
                  >
                    +90d
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() =>
                      setCreditMaturityDate(getFutureIsoDateString(180))
                    }
                  >
                    +180d
                  </Button>
                </div>
              </div>
              <Input
                type="datetime-local"
                value={creditMaturityDate}
                onChange={(e) => setCreditMaturityDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              Update Credit Need & Maturity
            </Button>
          </form>

          <form onSubmit={handleSetMultiplier} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Credit Multiplier
              </Label>
              <p className="text-xs text-muted-foreground">
                Integer multiplier scaling your credit capacity.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                placeholder="2"
                value={multiplierVal}
                onChange={(e) => setMultiplierVal(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                Set Multiplier
              </Button>
            </div>
          </form>

          <form onSubmit={handleRepayDebt} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Repay Outstanding Debt
              </Label>
              <p className="text-xs text-muted-foreground">
                Pay down your account debt using your available FI balance.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="50"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="destructive"
                disabled={loading || (fiWalletState?.debt || 0n) === 0n}
              >
                Repay Debt
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
