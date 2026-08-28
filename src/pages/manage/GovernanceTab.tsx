import { useState, type SyntheticEvent } from 'react';
import { Address, toNano, comment, beginCell } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  buildVoteBody,
  buildUnvoteBody,
  buildSubmitProposalBody,
  buildVoteProposalBody,
} from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';
import {
  Vote,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Send,
  Sparkles,
} from 'lucide-react';

export function GovernanceTab({
  fiWalletState,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  fiWalletState: FiWalletStore | null;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess?: () => void;
}) {
  const [subTab, setSubTab] = useState<'endorsements' | 'dao'>('endorsements');

  // Endorsement Vote states
  const [delegateAddr, setDelegateAddr] = useState('');

  // DAO Submit states
  const [daoAddr, setDaoAddr] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');

  // DAO Vote states
  const [voteDaoAddr, setVoteDaoAddr] = useState('');
  const [proposalId, setProposalId] = useState('');

  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  async function handleEndorsementVote(positive: boolean) {
    if (!ownerAddress) return;
    const recipientAddr = tryParseAddress(delegateAddr);
    if (!recipientAddr) {
      setStatus({
        type: 'error',
        message: 'Invalid candidate delegate address',
      });
      return;
    }

    const body = positive
      ? buildVoteBody({ transferRecipient: recipientAddr })
      : buildUnvoteBody({ transferRecipient: recipientAddr });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage: positive
        ? 'Endorsement vote cast successfully!'
        : 'Endorsement vote revoked successfully!',
      fallbackError: 'Endorsement voting failed',
      onSuccess: () => {
        setDelegateAddr('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleSubmitProposal(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;

    const parsedDao = tryParseAddress(daoAddr);
    if (!parsedDao) {
      setStatus({ type: 'error', message: 'Invalid DAO contract address' });
      return;
    }
    if (!proposalDescription.trim()) {
      setStatus({
        type: 'error',
        message: 'Proposal description/action is required',
      });
      return;
    }

    const targetPayload = comment(proposalDescription.trim());
    const body = buildSubmitProposalBody({
      daoAddress: parsedDao,
      targetMsg: targetPayload,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.2'),
          payload: body,
        },
      ],
      successMessage:
        'DAO proposal submitted! 1,000 FI proposal fee paid from balance.',
      fallbackError: 'Failed to submit DAO proposal',
      onSuccess: () => {
        setProposalDescription('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleVoteProposal(voteYes: boolean) {
    if (!ownerAddress) return;

    const parsedDao = tryParseAddress(voteDaoAddr);
    if (!parsedDao) {
      setStatus({ type: 'error', message: 'Invalid DAO contract address' });
      return;
    }
    const propIdNum = parseInt(proposalId.trim(), 10);
    if (isNaN(propIdNum) || propIdNum <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid Proposal ID' });
      return;
    }

    const body = buildVoteProposalBody({
      daoAddress: parsedDao,
      proposalId: propIdNum,
      vote: voteYes,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.2'),
          payload: body,
        },
      ],
      successMessage: `Vote ${voteYes ? 'YES' : 'NO'} cast on proposal #${propIdNum}!`,
      fallbackError: 'Failed to vote on DAO proposal',
      onSuccess: () => {
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as 'endorsements' | 'dao')}
      >
        <TabsList className="grid grid-cols-2 w-full h-10 bg-secondary/60">
          <TabsTrigger value="endorsements" className="text-xs font-semibold">
            <Vote className="size-3.5 mr-1.5" />
            Member Endorsements
          </TabsTrigger>
          <TabsTrigger value="dao" className="text-xs font-semibold">
            <Scale className="size-3.5 mr-1.5" />
            DAO Proposals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endorsements" className="mt-5 space-y-5">
          <div className="p-4 rounded-xl bg-secondary/40 border flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Endorsement Votes Endowment
              </div>
              <div className="font-display text-xl font-bold mt-1">
                {fiWalletState?.votes ?? 0}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  votes available (out of 10)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Received Endorsements
              </div>
              <div className="font-display text-xl font-bold mt-1 text-primary">
                {fiWalletState?.receivedVotes ?? 0}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Moral & Regional Governance
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every Member receives a fixed endowment of 10 Votes to endorse
              trusted peers in their Country. Accumulating votes elevates an
              account to Authority. Voting power is moral and equal—never
              weighted by FI balance or capital.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Candidate Delegate Address
              </Label>
              <InputScan toAddr={delegateAddr} setToAddr={setDelegateAddr} />
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <Button
                variant="brand"
                className="h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading || !delegateAddr.trim()}
                onClick={() => handleEndorsementVote(true)}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Voting...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="size-4 mr-1.5" />
                    Endorse Candidate
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                className="h-12 rounded-full font-bold text-xs uppercase tracking-wider"
                disabled={loading || !delegateAddr.trim()}
                onClick={() => handleEndorsementVote(false)}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Revoking...
                  </>
                ) : (
                  <>
                    <ThumbsDown className="size-4 mr-1.5" />
                    Revoke Endorsement
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dao" className="mt-5 space-y-6">
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">
                Submit New DAO Proposal
              </h3>
              <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                Fee: 1,000 FI
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                DAO Contract Address
              </Label>
              <InputScan toAddr={daoAddr} setToAddr={setDaoAddr} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Proposal Description / Action Payload
              </Label>
              <Textarea
                placeholder="Describe proposal intent or parameters..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
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
                  <span className="spinner" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-1.5" />
                  Submit Proposal (1,000 FI Fee)
                </>
              )}
            </Button>
          </form>

          <div className="border-t pt-5 space-y-4">
            <h3 className="font-display text-base font-semibold">
              Vote on Active Proposal
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                DAO Contract Address
              </Label>
              <InputScan toAddr={voteDaoAddr} setToAddr={setVoteDaoAddr} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Proposal ID
              </Label>
              <Input
                type="number"
                placeholder="1"
                min="1"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <Button
                variant="brand"
                className="h-11 rounded-lg font-bold text-xs uppercase tracking-wider bg-success hover:bg-success/90 text-white"
                disabled={loading || !proposalId.trim()}
                onClick={() => handleVoteProposal(true)}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Voting...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="size-4 mr-1.5" />
                    Vote YES
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                className="h-11 rounded-lg font-bold text-xs uppercase tracking-wider"
                disabled={loading || !proposalId.trim()}
                onClick={() => handleVoteProposal(false)}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Voting...
                  </>
                ) : (
                  <>
                    <ThumbsDown className="size-4 mr-1.5" />
                    Vote NO
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
