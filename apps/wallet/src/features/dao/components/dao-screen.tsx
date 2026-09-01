/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { Button } from '@/core/components/ui/button';
import { InputScan } from '@/core/components/ui/input-scan';
import { CopyButton } from '@/core/components/ui/copy-button';
import { useFormatAddress } from '@/core/utils/formatters';
import {
  MemberGuard,
  ActivationBanner,
  useIsNetworkMember,
} from '@/features/brotherhood';

import { useProposals } from '../hooks/use-proposals';
import { useSubmitProposal } from '../hooks/use-submit-proposal';
import { useVoteProposal } from '../hooks/use-vote-proposal';

type Tab = 'proposals' | 'submit' | 'vote';

export const DaoScreen: React.FC = () => {
  const navigate = useNavigate();
  const walletKit = useWalletKit();
  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  const { formatWalletAddress } = useFormatAddress();
  const { canOperate } = useIsNetworkMember();

  const [activeTab, setActiveTab] = useState<Tab>('proposals');

  const [daoAddrInput, setDaoAddrInput] = useState('');
  const [voteProposalId, setVoteProposalId] = useState('');
  const [voteYes, setVoteYes] = useState(true);

  const proposals = useProposals(daoAddrInput);

  const submitter = useSubmitProposal({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    daoAddress: daoAddrInput,
    network,
  });

  const voter = useVoteProposal({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    daoAddress: daoAddrInput,
    proposalId: voteProposalId,
    voteYes,
    network,
  });

  return (
    <MemberGuard title="DAO Governance">
      <NewLayout
        header={
          <ScreenHeader
            title="DAO Governance"
            onBack={() => navigate('/wallet')}
          />
        }
      >
        <div className="space-y-4">
          <ActivationBanner />

          {/* Global DAO Contract Address Input */}
          <div className="bg-card text-card-foreground p-3 border border-border rounded-2xl shadow-sm text-xs space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-foreground">
                Target DAO Contract Address
              </label>
              {daoAddrInput && (
                <CopyButton address={daoAddrInput} type="contract" size="xs" />
              )}
            </div>
            <InputScan
              value={daoAddrInput}
              onChange={setDaoAddrInput}
              placeholder={`DAO Address (${network === 'mainnet' ? 'EQ...' : 'kQ...'})`}
              data-testid="dao-address-input"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/70 border border-border p-1 rounded-xl text-xs font-medium">
            {(['proposals', 'submit', 'vote'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-card shadow-sm text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                data-testid={`dao-tab-${tab}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          {activeTab === 'proposals' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-base">Active Proposals</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => proposals.refetch()}
                >
                  Refresh
                </Button>
              </div>

              {proposals.isLoading ? (
                <p className="text-muted-foreground text-xs">
                  Loading proposals from DAO contract…
                </p>
              ) : proposals.proposals.length > 0 ? (
                <div className="space-y-2">
                  {proposals.proposals.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 border border-border/60 rounded-xl bg-secondary/50 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>Proposal #{p.id}</span>
                        <span>{p.executed ? 'Executed' : 'Active'}</span>
                      </div>
                      <p className="text-muted-foreground break-all">
                        Proposer: {formatWalletAddress(p.proposer, true)}
                      </p>
                      <div className="flex gap-4 pt-1 font-medium">
                        <span className="text-emerald-500 font-semibold">
                          Yes: {p.yesVotes.toString()}
                        </span>
                        <span className="text-rose-500 font-semibold">
                          No: {p.noVotes.toString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {daoAddrInput
                    ? 'No proposals found in this DAO.'
                    : 'Enter a DAO contract address above.'}
                </p>
              )}
            </div>
          )}

          {/* Submit Proposal */}
          {activeTab === 'submit' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">
                Submit Governance Proposal
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Submitting a proposal requires target message payload and DAO
                contract address.
              </p>
              <Button
                onClick={() => submitter.submit()}
                disabled={!canOperate || submitter.isDisabled}
                loading={submitter.isSending}
                fullWidth
                data-testid="dao-submit-proposal-btn"
              >
                Submit Proposal
              </Button>
            </div>
          )}

          {/* Vote on Proposal */}
          {activeTab === 'vote' && (
            <div className="space-y-3 bg-card text-card-foreground p-4 border border-border rounded-2xl shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-1">Vote on Proposal</h3>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Proposal ID
                </label>
                <input
                  type="number"
                  value={voteProposalId}
                  onChange={(e) => setVoteProposalId(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="dao-vote-proposal-id"
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-medium my-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-foreground">
                  <input
                    type="radio"
                    name="voteRadio"
                    checked={voteYes}
                    onChange={() => setVoteYes(true)}
                  />
                  Vote YES
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-foreground">
                  <input
                    type="radio"
                    name="voteRadio"
                    checked={!voteYes}
                    onChange={() => setVoteYes(false)}
                  />
                  Vote NO
                </label>
              </div>
              <Button
                onClick={() => voter.vote()}
                disabled={!canOperate || voter.isDisabled}
                loading={voter.isSending}
                fullWidth
                data-testid="dao-vote-submit-btn"
              >
                Cast Vote
              </Button>
            </div>
          )}
        </div>
      </NewLayout>
    </MemberGuard>
  );
};
