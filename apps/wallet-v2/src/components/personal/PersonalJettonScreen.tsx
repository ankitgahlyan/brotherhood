import React, { memo, useState, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import { usePersonalJetton, useFiWallet, invalidateFiState } from '../../lib/brotherhood/queries';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';
import {
  buildDeployPersonalMinterMessage,
  buildMintPersonalMessage,
  buildRegisterPersonalJettonMessage,
} from '../../lib/brotherhood/messages';
import { Address, toNano } from '@ton/core';
import TabList, { TabWithProperties } from '../ui/TabList';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

import styles from './PersonalJettonScreen.module.scss';

interface StateProps {
  currentAddress?: string;
}

const TABS: readonly TabWithProperties[] = [
  { id: 0, title: 'Token Info' },
  { id: 1, title: 'Deploy Token' },
  { id: 2, title: 'Mint Tokens' },
  { id: 3, title: 'Register to Fi' },
];

function formatUnits(amountNano?: bigint | null): string {
  if (amountNano === undefined || amountNano === null) return '0.00';
  return (Number(amountNano) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function PersonalJettonScreen({ currentAddress }: StateProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Form states
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [initialSupply, setInitialSupply] = useState<string>('1000000');
  const [mintRecipient, setMintRecipient] = useState<string>('');
  const [mintAmount, setMintAmount] = useState<string>('');

  const { data: personalInfo, isLoading, isFetching, refetch } = usePersonalJetton(currentAddress);
  const { data: fiWalletState } = useFiWallet(currentAddress);

  const isDeployed = personalInfo?.isDeployed ?? false;
  const minterAddress = personalInfo?.minterAddress;
  const personalWalletAddress = personalInfo?.personalWalletAddress;
  const fiWalletAddress = fiWalletState?.walletAddress;

  const handleDeploy = useCallback(() => {
    if (!minterAddress || !currentAddress || !personalInfo?.stateInit) return;
    try {
      const ownerAddr = Address.parse(currentAddress);
      const supplyNano = toNano(initialSupply || '1000000');
      const msg = buildDeployPersonalMinterMessage({
        minterAddress,
        stateInit: personalInfo.stateInit,
        ownerAddress: ownerAddr,
        mintAmount: supplyNano,
      });
      openFiTransactionModal(msg);
    } catch {
      /* invalid deploy params */
    }
  }, [minterAddress, currentAddress, personalInfo, initialSupply]);

  const handleMint = useCallback(() => {
    if (!minterAddress || !mintRecipient || !mintAmount) return;
    try {
      const recipientAddr = Address.parse(mintRecipient);
      const amountNano = toNano(mintAmount);
      const msg = buildMintPersonalMessage({
        minterAddress,
        recipientAddress: recipientAddr,
        jettonAmount: amountNano,
      });
      openFiTransactionModal(msg);
      setMintAmount('');
    } catch {
      /* invalid mint params */
    }
  }, [minterAddress, mintRecipient, mintAmount]);

  const handleRegister = useCallback(() => {
    if (!fiWalletAddress || !minterAddress || !personalWalletAddress) return;
    const msg = buildRegisterPersonalJettonMessage({
      fiWalletAddress,
      personalMinter: minterAddress,
      personalWallet: personalWalletAddress,
    });
    openFiTransactionModal(msg);
  }, [fiWalletAddress, minterAddress, personalWalletAddress]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Personal Jetton</h1>
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
            Please connect or unlock your wallet to manage your Personal Jetton.
          </div>
        </div>
      )}

      {!isLoading && currentAddress && (
        <>
          {/* TAB 0: TOKEN INFO */}
          {activeTab === 0 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Deployment Status</h3>
                <div className={styles.row}>
                  <span className={styles.label}>Contract State:</span>
                  <span className={`${styles.statusIndicator} ${isDeployed ? styles.active : styles.inactive}`}>
                    ● {isDeployed ? 'Active on Chain' : 'Not Deployed Yet'}
                  </span>
                </div>
                {minterAddress && (
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Personal Minter Contract:</span>
                    <span className={styles.addressText}>{minterAddress.toString()}</span>
                  </div>
                )}
                {personalWalletAddress && (
                  <div className={styles.inputGroup}>
                    <span className={styles.label}>Your Personal Jetton Wallet:</span>
                    <span className={styles.addressText}>{personalWalletAddress.toString()}</span>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Token Supply & Holdings</h3>
                <div className={styles.balanceRow}>
                  <div className={styles.balanceBox}>
                    <span className={styles.label}>Total Minted Supply</span>
                    <span className={styles.balanceAmount}>{formatUnits(personalInfo?.minterData?.totalSupply)}</span>
                  </div>
                  <div className={styles.balanceBox}>
                    <span className={styles.label}>Your Token Balance</span>
                    <span className={styles.balanceAmount}>{formatUnits(personalInfo?.walletBalance)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 1: DEPLOY */}
          {activeTab === 1 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Deploy Your Personal Jetton</h3>
              <p className={styles.label}>
                Deploy a personal jetton minter deterministic contract linked to your Fi account.
              </p>
              <div className={styles.inputGroup}>
                <span className={styles.label}>Token Name:</span>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Zeta Personal Token"
                  value={tokenName}
                  onChange={(e: any) => setTokenName(e.target.value)}
                />
                <span className={styles.label}>Token Symbol:</span>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. ZETA"
                  value={tokenSymbol}
                  onChange={(e: any) => setTokenSymbol(e.target.value)}
                />
                <span className={styles.label}>Initial Mint Supply:</span>
                <input
                  type="number"
                  className={styles.inputField}
                  placeholder="1000000"
                  value={initialSupply}
                  onChange={(e: any) => setInitialSupply(e.target.value)}
                />
                <Button
                  className={styles.actionButton}
                  isDisabled={isDeployed || !minterAddress}
                  onClick={handleDeploy}
                >
                  {isDeployed ? 'Token Already Deployed' : 'Deploy Personal Jetton (0.1 TON)'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: MINT */}
          {activeTab === 2 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Mint Personal Tokens</h3>
              <p className={styles.label}>
                Mint additional personal jettons directly to any network member address.
              </p>
              <div className={styles.inputGroup}>
                <span className={styles.label}>Recipient TON Address:</span>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="EQ... or 0:..."
                  value={mintRecipient}
                  onChange={(e: any) => setMintRecipient(e.target.value)}
                />
                <span className={styles.label}>Amount to Mint:</span>
                <input
                  type="number"
                  className={styles.inputField}
                  placeholder="e.g. 5000"
                  value={mintAmount}
                  onChange={(e: any) => setMintAmount(e.target.value)}
                />
                <Button
                  className={styles.actionButton}
                  isDisabled={!isDeployed || !mintRecipient || !mintAmount}
                  onClick={handleMint}
                >
                  Mint Personal Jettons
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER */}
          {activeTab === 3 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Register Pointer to FiWallet</h3>
              <p className={styles.label}>
                Link your Personal Jetton minter and wallet to your Brotherhood FiWallet pointer so other members can discover your token and purchase credit lines.
              </p>
              <Button
                className={styles.actionButton}
                isDisabled={!isDeployed || !fiWalletAddress || !minterAddress || !personalWalletAddress}
                onClick={handleRegister}
              >
                Register Personal Jetton to FiWallet
              </Button>
            </div>
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
})(PersonalJettonScreen));
