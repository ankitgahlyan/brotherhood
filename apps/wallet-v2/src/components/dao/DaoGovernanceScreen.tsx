import React, { memo, useState, useMemo, useCallback, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import { Address, toNano } from '@ton/core';
import TabList, { TabWithProperties } from '../ui/TabList';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { fetchDaoProposals, ProposalItem } from '../../lib/brotherhood/dao';
import { buildVoteProposalMessage } from '../../lib/brotherhood/messages';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';

import styles from './DaoGovernanceScreen.module.scss';

interface StateProps {
  currentAddress?: string;
  isTestnet?: boolean;
}

const TABS: readonly TabWithProperties[] = [
  { id: 0, title: 'Proposals' },
  { id: 1, title: 'Cast Vote' },
  { id: 2, title: 'DAO Proxy' },
];

function DaoGovernanceScreen({ currentAddress, isTestnet }: StateProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pollAddressInput, setPollAddressInput] = useState<string>('');
  const [proposalIdInput, setProposalIdInput] = useState<string>('1');
  const [loading, setLoading] = useState<boolean>(false);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [daoDetails, setDaoDetails] = useState<any>(null);

  const loadProposals = useCallback(async () => {
    if (!pollAddressInput) return;
    setLoading(true);
    try {
      const res = await fetchDaoProposals(pollAddressInput, isTestnet ? 'testnet' : 'mainnet');
      if (res) {
        setProposals(res.proposals || []);
        setDaoDetails(res.daoProxy || null);
      } else {
        setProposals([]);
        setDaoDetails(null);
      }
    } catch {
      setProposals([]);
      setDaoDetails(null);
    } finally {
      setLoading(false);
    }
  }, [pollAddressInput, isTestnet]);

  useEffect(() => {
    if (pollAddressInput) {
      loadProposals();
    }
  }, [pollAddressInput, loadProposals]);

  const handleVote = useCallback((proposal: ProposalItem, vote: boolean) => {
    if (!currentAddress || !pollAddressInput) return;
    try {
      const pollAddr = Address.parse(pollAddressInput);
      const voterOwner = Address.parse(currentAddress);
      const propId = BigInt(proposal.id);

      const msg = buildVoteProposalMessage({
        pollAddress: pollAddr,
        voterOwner,
        proposalId: propId,
        vote,
      });

      openFiTransactionModal(msg);
    } catch (err) {
      console.error('Failed to prepare vote message', err);
    }
  }, [currentAddress, pollAddressInput]);

  const handleManualVote = useCallback((vote: boolean) => {
    if (!currentAddress || !pollAddressInput || !proposalIdInput) return;
    try {
      const pollAddr = Address.parse(pollAddressInput);
      const voterOwner = Address.parse(currentAddress);
      const propId = BigInt(proposalIdInput);

      const msg = buildVoteProposalMessage({
        pollAddress: pollAddr,
        voterOwner,
        proposalId: propId,
        vote,
      });

      openFiTransactionModal(msg);
    } catch (err) {
      console.error('Failed to prepare vote message', err);
    }
  }, [currentAddress, pollAddressInput, proposalIdInput]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DAO Governance</h1>
        <span className={styles.badge}>On-Chain</span>
      </div>

      <TabList
        tabs={TABS}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        className={styles.tabList}
      />

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Poll / DAO Address</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter Poll or DAO contract address..."
            value={pollAddressInput}
            onChange={(e) => setPollAddressInput((e.target as HTMLInputElement).value.trim())}
          />
        </div>
        <Button isPrimary onClick={loadProposals} disabled={!pollAddressInput || loading}>
          {loading ? 'Querying State...' : 'Inspect Contract'}
        </Button>
      </div>

      {activeTab === 0 && (
        <>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <Spinner />
            </div>
          ) : proposals.length > 0 ? (
            proposals.map((prop) => (
              <div key={prop.id} className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>Proposal #{prop.id}</span>
                  <span className={styles.badge} style={{ backgroundColor: prop.executed ? '#10b981' : '#f59e0b' }}>
                    {prop.executed ? 'Executed' : 'Active'}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Proposer</span>
                  <span className={styles.value}>{prop.proposer.slice(0, 8)}...{prop.proposer.slice(-6)}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Total Eligible Accounts</span>
                  <span className={styles.value}>{prop.totalAccounts.toString()}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Deadline</span>
                  <span className={styles.value}>
                    {prop.deadline > 0 ? new Date(prop.deadline * 1000).toLocaleString() : 'No expiry'}
                  </span>
                </div>

                <div className={styles.voteStats}>
                  <div className={styles.statBox}>
                    <span className={styles.label}>YES Votes</span>
                    <span className={`${styles.statValue} ${styles.statYes}`}>{prop.yesVotes.toString()}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.label}>NO Votes</span>
                    <span className={`${styles.statValue} ${styles.statNo}`}>{prop.noVotes.toString()}</span>
                  </div>
                </div>

                {!prop.executed && (
                  <div className={styles.actions}>
                    <Button isPrimary onClick={() => handleVote(prop, true)} style={{ flex: 1, backgroundColor: '#10b981' }}>
                      Vote YES
                    </Button>
                    <Button isDestructive onClick={() => handleVote(prop, false)} style={{ flex: 1 }}>
                      Vote NO
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <p>No active proposals loaded.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Enter a Poll or DAO proxy contract address above to load on-chain voting items.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Direct Cast Vote</h2>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Proposal ID</label>
            <input
              type="number"
              className={styles.input}
              placeholder="e.g. 1"
              value={proposalIdInput}
              onChange={(e) => setProposalIdInput((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Voter Address</label>
            <input
              type="text"
              className={styles.input}
              value={currentAddress || ''}
              disabled
            />
          </div>

          <div className={styles.actions}>
            <Button
              isPrimary
              onClick={() => handleManualVote(true)}
              disabled={!pollAddressInput || !proposalIdInput}
              style={{ flex: 1, backgroundColor: '#10b981' }}
            >
              Vote YES
            </Button>
            <Button
              isDestructive
              onClick={() => handleManualVote(false)}
              disabled={!pollAddressInput || !proposalIdInput}
              style={{ flex: 1 }}
            >
              Vote NO
            </Button>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>DAO Proxy Info</h2>
          {daoDetails ? (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Admin</span>
                <span className={styles.value}>{daoDetails.admin?.toString?.() || 'N/A'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>FossFi Wallet Code</span>
                <span className={styles.value}>Stored</span>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>No DAO Proxy contract loaded.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(
  withGlobal((global: GlobalState): StateProps => {
    const account = selectCurrentAccount(global);
    return {
      currentAddress: account?.address,
      isTestnet: global.settings.isTestnet,
    };
  })(DaoGovernanceScreen),
);
