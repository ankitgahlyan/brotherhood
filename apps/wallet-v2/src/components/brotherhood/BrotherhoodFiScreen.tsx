import React, { memo, useState, useMemo, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import { useFiWallet, useFiMinter, invalidateFiState } from '../../lib/brotherhood/queries';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';
import {
  buildPayEmiMessage,
  buildRepayDebtMessage,
  buildClaimWeeklyGrantMessage,
  buildSetAllowanceMessage,
  buildSpendAllowanceMessage,
  buildInviteMemberMessage,
} from '../../lib/brotherhood/messages';
import { Address, toNano } from '@ton/core';
import TabList, { TabWithProperties } from '../ui/TabList';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

import styles from './BrotherhoodFiScreen.module.scss';

interface StateProps {
  currentAddress?: string;
}

const TABS: readonly TabWithProperties[] = [
  { id: 0, title: 'Account' },
  { id: 1, title: 'Credit & Repay' },
  { id: 2, title: 'Allowance' },
  { id: 3, title: 'Governance' },
];

function formatFi(amountNano?: bigint | null): string {
  if (amountNano === undefined || amountNano === null) return '0.00';
  return (Number(amountNano) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function BrotherhoodFiScreen({ currentAddress }: StateProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Form states for credit & allowance
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [allowanceGrantee, setAllowanceGrantee] = useState<string>('');
  const [allowanceAmount, setAllowanceAmount] = useState<string>('');
  const [allowanceDays, setAllowanceDays] = useState<string>('30');
  const [spendGrantor, setSpendGrantor] = useState<string>('');
  const [spendRecipient, setSpendRecipient] = useState<string>('');
  const [spendAmount, setSpendAmount] = useState<string>('');
  const [inviteeAddress, setInviteeAddress] = useState<string>('');

  const { data: fiWalletState, isLoading, isFetching, refetch } = useFiWallet(currentAddress);
  const { data: fiMinterState } = useFiMinter();

  const isWalletDeployed = fiWalletState?.isDeployed ?? false;
  const walletData = fiWalletState?.data;
  const fiWalletAddress = fiWalletState?.walletAddress;

  const handlePayEmi = useCallback(() => {
    if (!fiWalletAddress || !currentAddress) return;
    const ownerAddr = Address.parse(currentAddress);
    const msg = buildPayEmiMessage(fiWalletAddress, ownerAddr);
    openFiTransactionModal(msg);
  }, [fiWalletAddress, currentAddress]);

  const handleRepayDebt = useCallback(() => {
    if (!fiWalletAddress || !currentAddress || !repayAmount) return;
    try {
      const ownerAddr = Address.parse(currentAddress);
      const nano = toNano(repayAmount);
      const msg = buildRepayDebtMessage(fiWalletAddress, ownerAddr, nano);
      openFiTransactionModal(msg);
      setRepayAmount('');
    } catch {
      /* invalid amount */
    }
  }, [fiWalletAddress, currentAddress, repayAmount]);

  const handleClaimWeekly = useCallback(() => {
    if (!fiWalletAddress || !currentAddress) return;
    const ownerAddr = Address.parse(currentAddress);
    const msg = buildClaimWeeklyGrantMessage(fiWalletAddress, ownerAddr);
    openFiTransactionModal(msg);
  }, [fiWalletAddress, currentAddress]);

  const handleSetAllowance = useCallback(() => {
    if (!fiWalletAddress || !currentAddress || !allowanceGrantee || !allowanceAmount) return;
    try {
      const ownerAddr = Address.parse(currentAddress);
      const grantee = Address.parse(allowanceGrantee);
      const nano = toNano(allowanceAmount);
      const days = parseInt(allowanceDays, 10) || 30;
      const expireAt = Math.floor(Date.now() / 1000) + days * 86400;
      const msg = buildSetAllowanceMessage(fiWalletAddress, ownerAddr, grantee, nano, expireAt);
      openFiTransactionModal(msg);
      setAllowanceGrantee('');
      setAllowanceAmount('');
    } catch {
      /* invalid inputs */
    }
  }, [fiWalletAddress, currentAddress, allowanceGrantee, allowanceAmount, allowanceDays]);

  const handleSpendAllowance = useCallback(() => {
    if (!fiWalletAddress || !currentAddress || !spendGrantor || !spendRecipient || !spendAmount) return;
    try {
      const ownerAddr = Address.parse(currentAddress);
      const grantor = Address.parse(spendGrantor);
      const recipient = Address.parse(spendRecipient);
      const nano = toNano(spendAmount);
      const msg = buildSpendAllowanceMessage(fiWalletAddress, ownerAddr, grantor, nano, recipient);
      openFiTransactionModal(msg);
      setSpendGrantor('');
      setSpendRecipient('');
      setSpendAmount('');
    } catch {
      /* invalid inputs */
    }
  }, [fiWalletAddress, currentAddress, spendGrantor, spendRecipient, spendAmount]);

  const handleInviteMember = useCallback(() => {
    if (!fiWalletAddress || !currentAddress || !inviteeAddress) return;
    try {
      const ownerAddr = Address.parse(currentAddress);
      const invitee = Address.parse(inviteeAddress);
      const msg = buildInviteMemberMessage(fiWalletAddress, ownerAddr, invitee);
      openFiTransactionModal(msg);
      setInviteeAddress('');
    } catch {
      /* invalid address */
    }
  }, [fiWalletAddress, currentAddress, inviteeAddress]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Brotherhood Fi</h1>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span className={styles.badge}>Testnet</span>
          <Button
            size="smaller"
            isText
            onClick={() => {
              invalidateFiState();
              refetch();
            }}
          >
            {isFetching ? <Spinner /> : '↻ Refresh'}
          </Button>
        </div>
      </div>

      <TabList
        tabs={TABS}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        className={styles.tabList}
      />

      {isLoading && (
        <div style="display: flex; justify-content: center; padding: 3rem 0;">
          <Spinner />
        </div>
      )}

      {!isLoading && !currentAddress && (
        <div className={styles.card}>
          <div className={styles.emptyNotice}>
            Please connect or unlock your wallet to access Brotherhood Fi.
          </div>
        </div>
      )}

      {!isLoading && currentAddress && (
        <>
          {/* TAB 0: ACCOUNT */}
          {activeTab === 0 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Fi Contract Status</h3>
                <div className={styles.row}>
                  <span className={styles.label}>Account Status:</span>
                  <span className={`${styles.statusIndicator} ${isWalletDeployed ? styles.active : styles.inactive}`}>
                    ● {isWalletDeployed ? 'Active Fi Member' : 'Uninitialized'}
                  </span>
                </div>
                {fiWalletAddress && (
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Fi Wallet Contract:</span>
                    <span className={styles.addressText}>{fiWalletAddress.toString()}</span>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Token Balances</h3>
                <div className={styles.balanceRow}>
                  <div className={styles.balanceBox}>
                    <span className={styles.label}>FI Tokens</span>
                    <span className={styles.balanceAmount}>{formatFi(walletData?.jettonBalance)} FI</span>
                  </div>
                  <div className={styles.balanceBox}>
                    <span className={styles.label}>Gold Coins</span>
                    <span className={styles.balanceAmount}>{formatFi(walletData?.goldCoinsBalance)} GC</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Member Invite</h3>
                <div className={styles.inputGroup}>
                  <span className={styles.label}>Invitee TON Address:</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="EQ... or 0:..."
                    value={inviteeAddress}
                    onChange={(e: any) => setInviteeAddress(e.target.value)}
                  />
                  <Button
                    className={styles.actionButton}
                    isDisabled={!inviteeAddress || !isWalletDeployed}
                    onClick={handleInviteMember}
                  >
                    Send Member Invitation
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* TAB 1: CREDIT & REPAY */}
          {activeTab === 1 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Credit Line Overview</h3>
                <div className={styles.row}>
                  <span className={styles.label}>Total Debt Balance:</span>
                  <span className={styles.value}>{formatFi(walletData?.debtBalance)} FI</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Monthly EMI Due:</span>
                  <span className={styles.value}>2,500.00 FI</span>
                </div>
                <Button
                  className={styles.actionButton}
                  isDisabled={!isWalletDeployed}
                  onClick={handlePayEmi}
                >
                  Pay Monthly EMI (2,500 FI)
                </Button>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Repay Custom Debt</h3>
                <div className={styles.inputGroup}>
                  <span className={styles.label}>Amount to Repay (FI):</span>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="e.g. 500"
                    value={repayAmount}
                    onChange={(e: any) => setRepayAmount(e.target.value)}
                  />
                  <Button
                    className={styles.actionButton}
                    isDisabled={!repayAmount || !isWalletDeployed}
                    onClick={handleRepayDebt}
                  >
                    Submit Repayment
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ALLOWANCE */}
          {activeTab === 2 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Grant Spending Allowance</h3>
                <div className={styles.inputGroup}>
                  <span className={styles.label}>Grantee TON Address:</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="EQ... or 0:..."
                    value={allowanceGrantee}
                    onChange={(e: any) => setAllowanceGrantee(e.target.value)}
                  />
                  <span className={styles.label}>Allowance Amount (FI):</span>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="e.g. 1000"
                    value={allowanceAmount}
                    onChange={(e: any) => setAllowanceAmount(e.target.value)}
                  />
                  <span className={styles.label}>Validity (Days):</span>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="30"
                    value={allowanceDays}
                    onChange={(e: any) => setAllowanceDays(e.target.value)}
                  />
                  <Button
                    className={styles.actionButton}
                    isDisabled={!allowanceGrantee || !allowanceAmount || !isWalletDeployed}
                    onClick={handleSetAllowance}
                  >
                    Set Allowance
                  </Button>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Spend Delegated Allowance</h3>
                <div className={styles.inputGroup}>
                  <span className={styles.label}>Grantor Address:</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="EQ..."
                    value={spendGrantor}
                    onChange={(e: any) => setSpendGrantor(e.target.value)}
                  />
                  <span className={styles.label}>Recipient Address:</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="EQ..."
                    value={spendRecipient}
                    onChange={(e: any) => setSpendRecipient(e.target.value)}
                  />
                  <span className={styles.label}>Amount (FI):</span>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="e.g. 50"
                    value={spendAmount}
                    onChange={(e: any) => setSpendAmount(e.target.value)}
                  />
                  <Button
                    className={styles.actionButton}
                    isDisabled={!spendGrantor || !spendRecipient || !spendAmount || !isWalletDeployed}
                    onClick={handleSpendAllowance}
                  >
                    Spend Delegated Allowance
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: GOVERNANCE */}
          {activeTab === 3 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Weekly Grant Claim</h3>
                <p className={styles.label}>
                  Active network members can claim their weekly reward grant of FI tokens.
                </p>
                <Button
                  className={styles.actionButton}
                  isDisabled={!isWalletDeployed}
                  onClick={handleClaimWeekly}
                >
                  Claim Weekly Reward Grant
                </Button>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>DAO Governance</h3>
                <div className={styles.row}>
                  <span className={styles.label}>Governance Model:</span>
                  <span className={styles.value}>Tolk Smart Contract DAO</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Active Proposals:</span>
                  <span className={styles.value}>0 Active</span>
                </div>
                <p className={styles.emptyNotice}>
                  No voting proposals currently pending. You will be able to cast votes here when polls are published.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default memo(withGlobal((global: GlobalState): StateProps => {
  const account = selectCurrentAccount(global);
  return {
    currentAddress: account?.byChain?.ton?.address,
  };
})(BrotherhoodFiScreen));
