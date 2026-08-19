import { useState, type SyntheticEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  buildFollowBody,
  buildUnfollowBody,
  buildSetAllowanceBody,
  buildSpendAllowanceBody,
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
import {
  Users,
  UserCheck,
  UserMinus,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function SocialTab({
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
  const [subTab, setSubTab] = useState<'following' | 'allowance'>('following');

  // Following states
  const [followTarget, setFollowTarget] = useState('');

  // Allowance states
  const [allowanceMode, setAllowanceMode] = useState<'grant' | 'spend'>('grant');
  const [granteeAddr, setGranteeAddr] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [grantorAddr, setGrantorAddr] = useState('');
  const [spendReceiverAddr, setSpendReceiverAddr] = useState('');
  const [spendAmount, setSpendAmount] = useState('');

  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  const socialMaps = fiWalletState?.maps?.ref?.social?.ref;
  const followingCount = socialMaps ? Number(socialMaps.followingCount) : 0;
  const followersCount = socialMaps ? Number(socialMaps.followersCount) : 0;

  async function handleFollow(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const target = tryParseAddress(followTarget);
    if (!target) {
      setStatus({ type: 'error', message: 'Invalid target member address' });
      return;
    }

    const body = buildFollowBody({
      followee: target,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.5'),
          payload: body,
        },
      ],
      successMessage: 'Follow link initialized! 1,000 FI trust reward minted to followee.',
      fallbackError: 'Failed to follow member',
      onSuccess: () => {
        setFollowTarget('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleUnfollow(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const target = tryParseAddress(followTarget);
    if (!target) {
      setStatus({ type: 'error', message: 'Invalid target member address' });
      return;
    }

    const body = buildUnfollowBody({
      followee: target,
      initiator: ownerAddress,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.3'),
          payload: body,
        },
      ],
      successMessage: 'Unfollow link dispatched! 1,000 FI burned from followee and rent recovered.',
      fallbackError: 'Failed to unfollow member',
      onSuccess: () => {
        setFollowTarget('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleGrantAllowance(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const grantee = tryParseAddress(granteeAddr);
    if (!grantee) {
      setStatus({ type: 'error', message: 'Invalid grantee address' });
      return;
    }
    const amountParsed = parseFloat(grantAmount);
    if (isNaN(amountParsed) || amountParsed < 0) {
      setStatus({ type: 'error', message: 'Enter a valid allowance amount' });
      return;
    }

    const body = buildSetAllowanceBody({
      grantee,
      amount: parseUnits(grantAmount.trim(), decimals),
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
      successMessage: 'Allowance granted successfully!',
      fallbackError: 'Failed to grant allowance',
      onSuccess: () => {
        setGranteeAddr('');
        setGrantAmount('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleSpendAllowance(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const grantor = tryParseAddress(grantorAddr);
    if (!grantor) {
      setStatus({ type: 'error', message: 'Invalid friend/grantor address' });
      return;
    }
    const receiver = tryParseAddress(spendReceiverAddr.trim() || ownerAddress.toString());
    if (!receiver) {
      setStatus({ type: 'error', message: 'Invalid receiver address' });
      return;
    }
    const amountParsed = parseFloat(spendAmount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid spend amount' });
      return;
    }

    const body = buildSpendAllowanceBody({
      amount: parseUnits(spendAmount.trim(), decimals),
      receiver,
      sendExcessesTo: ownerAddress,
    });
    const grantorWalletAddr = await getWalletAddress(grantor);

    await sendTransaction({
      messages: [
        {
          address: grantorWalletAddr.toString(),
          amount: toNano('0.15'),
          payload: body,
        },
      ],
      successMessage: 'Allowance spent successfully!',
      fallbackError: 'Failed to spend allowance',
      onSuccess: () => {
        setGrantorAddr('');
        setSpendReceiverAddr('');
        setSpendAmount('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as 'following' | 'allowance')}
      >
        <TabsList className="grid grid-cols-2 w-full h-10 bg-secondary/60">
          <TabsTrigger value="following" className="text-xs font-semibold">
            <Users className="size-3.5 mr-1.5" />
            Following & Trust Graph
          </TabsTrigger>
          <TabsTrigger value="allowance" className="text-xs font-semibold">
            <KeyRound className="size-3.5 mr-1.5" />
            Friend Allowances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="p-4 rounded-xl bg-secondary/40 border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Following
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  {followingCount}
                </div>
              </div>
              <UserCheck className="size-8 text-primary/40" />
            </div>
            <div className="p-4 rounded-xl bg-secondary/40 border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Followers
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  {followersCount}
                </div>
              </div>
              <Sparkles className="size-8 text-primary/40" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Directional Trust Economics
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Following another member deploys an on-chain child Following contract
              and mints <strong>1,000 FI</strong> of trust supply to the Followee.
              Unfollowing burns the 1,000 FI and destroys the child contract to recover
              TON storage rent.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Member TON Address
              </Label>
              <InputScan toAddr={followTarget} setToAddr={setFollowTarget} />
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <Button
                variant="brand"
                className="h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading || !followTarget.trim()}
                onClick={handleFollow}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Processing...
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4 mr-1.5" />
                    Follow (+1,000 FI)
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                className="h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading || !followTarget.trim()}
                onClick={handleUnfollow}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Processing...
                  </>
                ) : (
                  <>
                    <UserMinus className="size-4 mr-1.5" />
                    Unfollow (-1,000 FI)
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allowance" className="mt-5 space-y-5">
          <div className="flex rounded-lg bg-secondary/80 p-1">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                allowanceMode === 'grant'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setAllowanceMode('grant')}
            >
              Grant Allowance
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                allowanceMode === 'spend'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setAllowanceMode('spend')}
            >
              Spend Friend's Allowance
            </button>
          </div>

          {allowanceMode === 'grant' ? (
            <form onSubmit={handleGrantAllowance} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Friend Address (Grantee)
                </Label>
                <InputScan toAddr={granteeAddr} setToAddr={setGranteeAddr} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Allowance Amount (FI)
                </Label>
                <Input
                  type="text"
                  placeholder="50"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                variant="brand"
                className="w-full h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Granting...
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4 mr-1.5" />
                    Set Allowance
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSpendAllowance} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Friend Address (Grantor)
                </Label>
                <InputScan toAddr={grantorAddr} setToAddr={setGrantorAddr} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recipient Address (Defaults to You)
                </Label>
                <InputScan
                  toAddr={spendReceiverAddr}
                  setToAddr={setSpendReceiverAddr}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount to Spend (FI)
                </Label>
                <Input
                  type="text"
                  placeholder="25"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                variant="brand"
                className="w-full h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Spending...
                  </>
                ) : (
                  <>
                    <ArrowRight className="size-4 mr-1.5" />
                    Spend Allowance
                  </>
                )}
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
