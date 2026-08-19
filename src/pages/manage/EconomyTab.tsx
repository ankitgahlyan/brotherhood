import { useState, type SyntheticEvent } from 'react';
import { Address, beginCell, comment, toNano, fromNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  buildTransferBody,
  buildGoldCoinsTransferBody,
  buildBurnBody,
  parseUnits,
} from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import {
  tryParseAddress,
  WalletRequired,
  type Network,
} from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';
import { Send, Coins, Flame, CircleDollarSign } from 'lucide-react';

export function EconomyTab({
  decimals,
  fiWalletState,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  decimals: number;
  fiWalletState: FiWalletStore | null;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess?: () => void;
}) {
  const [subTab, setSubTab] = useState<'transfer' | 'gold' | 'burn'>('transfer');

  // FI Transfer
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [commentText, setCommentText] = useState('');

  // Gold Coins
  const [goldReceiver, setGoldReceiver] = useState('');
  const [goldAmount, setGoldAmount] = useState('');

  // Burn FI
  const [burnAmount, setBurnAmount] = useState('');

  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  async function handleTransferFi(e: SyntheticEvent) {
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

    const payload = commentText.trim()
      ? comment(commentText.trim())
      : beginCell().endCell();
    const body = buildTransferBody({
      toAddress: recipientAddr,
      amount: parseUnits(amount.trim(), decimals),
      responseAddress: ownerAddress,
      forwardTonAmount: commentText.trim() ? toNano('0.01') : 0n,
      forwardPayload: payload,
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
      successMessage: 'FI transfer transaction sent!',
      fallbackError: 'FI transfer failed',
      onSuccess: () => {
        setAmount('');
        setToAddr('');
        setCommentText('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleTransferGold(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const recipientAddr = tryParseAddress(goldReceiver);
    if (!recipientAddr) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const coinsParsed = parseInt(goldAmount.trim(), 10);
    if (isNaN(coinsParsed) || coinsParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid positive number of Gold Coins' });
      return;
    }

    const body = buildGoldCoinsTransferBody({
      receiver: recipientAddr,
      amount: coinsParsed,
      sendExcessesTo: ownerAddress,
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
      successMessage: `${coinsParsed} Gold Coin(s) transferred successfully!`,
      fallbackError: 'Gold Coins transfer failed',
      onSuccess: () => {
        setGoldReceiver('');
        setGoldAmount('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleBurnFi(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const amountParsed = parseFloat(burnAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid amount to burn' });
      return;
    }

    const body = buildBurnBody(
      parseUnits(burnAmount.trim(), decimals),
      ownerAddress,
    );
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'FI tokens burned successfully!',
      fallbackError: 'Burn failed',
      onSuccess: () => {
        setBurnAmount('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as 'transfer' | 'gold' | 'burn')}
      >
        <TabsList className="grid grid-cols-3 w-full h-10 bg-secondary/60">
          <TabsTrigger value="transfer" className="text-xs font-semibold">
            <Send className="size-3.5 mr-1.5" />
            Transfer FI
          </TabsTrigger>
          <TabsTrigger value="gold" className="text-xs font-semibold">
            <Coins className="size-3.5 mr-1.5" />
            Gold Coins
          </TabsTrigger>
          <TabsTrigger value="burn" className="text-xs font-semibold">
            <Flame className="size-3.5 mr-1.5" />
            Burn FI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="mt-5 space-y-4.5">
          <form onSubmit={handleTransferFi} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recipient Address
              </Label>
              <InputScan toAddr={toAddr} setToAddr={setToAddr} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount (FI)
              </Label>
              <Input
                type="text"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Comment (Optional)
              </Label>
              <Input
                type="text"
                placeholder="Memo or note"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              variant="brand"
              className="w-full h-12 rounded-full font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Sending FI...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Transfer FI
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="gold" className="mt-5 space-y-4.5">
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Coins className="size-5 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-foreground">Available Gold Coins</div>
                <div className="text-xs text-muted-foreground">Transferable store-of-value units</div>
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-amber-500">
              {fiWalletState?.goldCoins ?? 0}
            </div>
          </div>

          <form onSubmit={handleTransferGold} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recipient Address
              </Label>
              <InputScan toAddr={goldReceiver} setToAddr={setGoldReceiver} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gold Coins Amount
              </Label>
              <Input
                type="number"
                placeholder="1"
                min="1"
                max={String(fiWalletState?.goldCoins ?? 0)}
                value={goldAmount}
                onChange={(e) => setGoldAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              variant="brand"
              className="w-full h-12 rounded-full font-bold bg-amber-500 hover:bg-amber-600 text-black"
              disabled={loading || (fiWalletState?.goldCoins ?? 0) === 0}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Transferring Gold Coins...
                </>
              ) : (
                <>
                  <Coins className="size-4 mr-2" />
                  Transfer Gold Coins
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="burn" className="mt-5 space-y-4.5">
          <p className="text-xs text-muted-foreground">
            Burning FI permanently removes tokens from circulation and reduces your
            account balance.
          </p>
          <form onSubmit={handleBurnFi} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount to Burn (FI)
              </Label>
              <Input
                type="text"
                placeholder="100"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full h-12 rounded-full font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Burning tokens...
                </>
              ) : (
                <>
                  <Flame className="size-4 mr-2" />
                  Burn FI
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
