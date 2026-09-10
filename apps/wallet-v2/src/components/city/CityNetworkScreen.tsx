import React, { memo, useState, useEffect, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import {
  useFiWallet,
  useLocationByH3Cell,
  useLocation,
  useLocationMembers,
  calculateLocationAddress,
  getH3ViewerUrl,
  invalidateFiState,
} from '../../lib/brotherhood/queries';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';
import { buildChangeLocationMessage } from '../../lib/brotherhood/messages';
import { Address } from '@ton/core';
import TabList, { TabWithProperties } from '../ui/TabList';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { FI_ADDRESS } from '../../lib/brotherhood/config';

import styles from './CityNetworkScreen.module.scss';

interface StateProps {
  currentAddress?: string;
}

const TABS: readonly TabWithProperties[] = [
  { id: 0, title: 'Location Info' },
  { id: 1, title: 'Direct Lookup' },
  { id: 2, title: 'Calculate' },
  { id: 3, title: 'Verify Member' },
];

function CityNetworkScreen({ currentAddress }: StateProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Connected Fi wallet state (to retrieve user's registered H3 cell)
  const { data: fiWalletState } = useFiWallet(currentAddress);
  const myH3Cell = fiWalletState?.data?.profile?.ref?.h3Cell || '';
  const fiWalletAddress = fiWalletState?.walletAddress;

  // Tab 0: H3 Cell Input & Query
  const [h3CellInput, setH3CellInput] = useState<string>('');
  const [hasInitializedH3, setHasInitializedH3] = useState<boolean>(false);

  // Tab 1: Raw Contract Address Lookup
  const [locationAddrInput, setLocationAddrInput] = useState<string>('');

  // Tab 2: Calculate / Preview
  const [minterAddrInput, setMinterAddrInput] = useState<string>(FI_ADDRESS);
  const [calcH3CellInput, setCalcH3CellInput] = useState<string>('');

  // Tab 3: Verify Member
  const [verifyLocationAddr, setVerifyLocationAddr] = useState<string>('');
  const [targetMemberAddr, setTargetMemberAddr] = useState<string>('');

  // Move location form
  const [newH3CellInput, setNewH3CellInput] = useState<string>('');

  // Prefill Tab 0 with user's registered H3 cell when loaded
  useEffect(() => {
    if (myH3Cell && !hasInitializedH3) {
      setH3CellInput(myH3Cell);
      setHasInitializedH3(true);
    }
  }, [myH3Cell, hasInitializedH3]);

  // Queries
  const locationByH3Query = useLocationByH3Cell(h3CellInput);
  const rawLocationQuery = useLocation(locationAddrInput);
  const locationMembersQuery = useLocationMembers(
    verifyLocationAddr || locationAddrInput,
    targetMemberAddr,
  );

  // Calculated address preview for Tab 2
  let calculatedTab2Address: string | null = null;
  if (minterAddrInput && calcH3CellInput.trim()) {
    try {
      const minter = Address.parse(minterAddrInput.trim());
      calculatedTab2Address = calculateLocationAddress(calcH3CellInput.trim(), minter).toString();
    } catch {
      calculatedTab2Address = null;
    }
  }

  const handleChangeLocation = useCallback(() => {
    if (!fiWalletAddress || !newH3CellInput.trim()) return;
    try {
      const msg = buildChangeLocationMessage(fiWalletAddress, {
        h3Cell: newH3CellInput.trim(),
      });
      openFiTransactionModal(msg);
      setNewH3CellInput('');
    } catch {
      /* ignore error */
    }
  }, [fiWalletAddress, newH3CellInput]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>City Network</h1>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span className={styles.badge}>H3 Spatial</span>
          <Button
            size="smaller"
            isText
            onClick={() => {
              invalidateFiState();
              locationByH3Query.refetch();
              rawLocationQuery.refetch();
              locationMembersQuery.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className={styles.tabList}>
        <TabList
          tabs={TABS}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </div>

      {/* Tab 0: Location Info (H3 Cell Driven) */}
      {activeTab === 0 && (
        <>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Spatial Cell Inspector</span>
              {locationByH3Query.data?.isDeployed ? (
                <span className={`${styles.statusIndicator} ${styles.active}`}>Active On-Chain</span>
              ) : (
                <span className={`${styles.statusIndicator} ${styles.inactive}`}>Auto-Deploy on Join</span>
              )}
            </div>
            <p className={styles.cardDesc}>
              Query Uber H3 hexagonal spatial cluster child contracts.
            </p>

            <div className={styles.inputGroup}>
              <div className={styles.row}>
                <span className={styles.label}>H3 Spatial Cell</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <a
                    href={getH3ViewerUrl(h3CellInput)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    Satellite Viewer ↗
                  </a>
                  {myH3Cell && h3CellInput !== myH3Cell && (
                    <Button
                      size="smaller"
                      isText
                      onClick={() => setH3CellInput(myH3Cell)}
                    >
                      My Cell
                    </Button>
                  )}
                </div>
              </div>
              <input
                type="text"
                className={styles.inputField}
                value={h3CellInput}
                placeholder="e.g. 8828308281fffff"
                onChange={(e: any) => setH3CellInput(e.target.value)}
              />
            </div>

            {locationByH3Query.calculatedAddress && (
              <div className={styles.inputGroup}>
                <span className={styles.label}>Deterministic Contract Address</span>
                <div className={styles.addressText}>
                  {locationByH3Query.calculatedAddress}
                </div>
              </div>
            )}
          </div>

          {locationByH3Query.isLoading ? (
            <div className={styles.card} style="align-items: center; justify-content: center; min-height: 8rem;">
              <Spinner />
            </div>
          ) : locationByH3Query.data ? (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Cell Statistics</div>
              <div className={styles.gridTwo}>
                <div className={styles.statBox}>
                  <span className={styles.label}>Indexed Members</span>
                  <span className={styles.statAmount}>{locationByH3Query.data.memberCount}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.label}>Contract Version</span>
                  <span className={styles.statAmount}>
                    {locationByH3Query.data.version !== null ? `v${locationByH3Query.data.version}` : 'v0.2.0'}
                  </span>
                </div>
              </div>

              {locationByH3Query.data.minterAddress && (
                <div className={styles.row}>
                  <span className={styles.label}>Minter Address</span>
                  <span className={styles.value} style="font-size: 0.75rem;">
                    {locationByH3Query.data.minterAddress.slice(0, 8)}...{locationByH3Query.data.minterAddress.slice(-6)}
                  </span>
                </div>
              )}

              <div className={styles.cardTitle} style="margin-top: 0.5rem;">
                <span>Registered Members ({locationByH3Query.data.members.length})</span>
                {myH3Cell === h3CellInput && myH3Cell !== '' && (
                  <span className={styles.badge} style="font-size: 0.65rem;">Your Cell</span>
                )}
              </div>

              {locationByH3Query.data.members.length > 0 ? (
                <div className={styles.memberList}>
                  {locationByH3Query.data.members.map((member) => (
                    <div key={member} className={styles.memberItem}>
                      <span>{member.slice(0, 12)}...{member.slice(-8)}</span>
                      {currentAddress && member === currentAddress && (
                        <span className={styles.badge} style="font-size: 0.65rem;">You</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyNotice}>
                  {locationByH3Query.data.isDeployed
                    ? 'No members currently in this cell.'
                    : 'This H3 cell has not had any members join yet.'}
                </div>
              )}
            </div>
          ) : null}

          {/* Relocate Form if connected */}
          {fiWalletAddress && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Relocate / Update H3 Cell</div>
              <p className={styles.cardDesc}>
                Update your registered spatial location in Brotherhood. Automatically migrates membership across H3 contracts.
              </p>
              <div className={styles.inputGroup}>
                <span className={styles.label}>New H3 Spatial Index</span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={newH3CellInput}
                  placeholder="e.g. 882a100d31fffff"
                  onChange={(e: any) => setNewH3CellInput(e.target.value)}
                />
              </div>
              <Button
                className={styles.actionButton}
                onClick={handleChangeLocation}
                disabled={!newH3CellInput.trim()}
              >
                Change Location
              </Button>
            </div>
          )}
        </>
      )}

      {/* Tab 1: Direct Contract Address Lookup */}
      {activeTab === 1 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Direct Location Address Lookup</div>
          <p className={styles.cardDesc}>
            Inspect any deployed Location child contract by raw address.
          </p>
          <div className={styles.inputGroup}>
            <span className={styles.label}>Location Contract Address</span>
            <input
              type="text"
              className={styles.inputField}
              value={locationAddrInput}
              placeholder="EQ... or 0:..."
              onChange={(e: any) => setLocationAddrInput(e.target.value)}
            />
          </div>
          <Button
            className={styles.actionButton}
            onClick={() => rawLocationQuery.refetch()}
            disabled={!locationAddrInput.trim() || rawLocationQuery.isLoading}
          >
            {rawLocationQuery.isLoading ? 'Querying...' : 'Query Contract'}
          </Button>

          {rawLocationQuery.location && (
            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
              {rawLocationQuery.location.h3Cell && (
                <div className={styles.row}>
                  <span className={styles.label}>H3 Index</span>
                  <a
                    href={getH3ViewerUrl(rawLocationQuery.location.h3Cell)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    {rawLocationQuery.location.h3Cell} ↗
                  </a>
                </div>
              )}
              <div className={styles.gridTwo}>
                <div className={styles.statBox}>
                  <span className={styles.label}>Indexed Members</span>
                  <span className={styles.statAmount}>{rawLocationQuery.location.memberCount ?? 0}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.label}>Contract Version</span>
                  <span className={styles.statAmount}>v{rawLocationQuery.location.version ?? 0}</span>
                </div>
              </div>
              <div className={styles.cardTitle}>Members ({rawLocationQuery.location.members.length})</div>
              {rawLocationQuery.location.members.length > 0 ? (
                <div className={styles.memberList}>
                  {rawLocationQuery.location.members.map((member) => (
                    <div key={member} className={styles.memberItem}>
                      <span>{member.slice(0, 12)}...{member.slice(-8)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyNotice}>No members registered in this contract.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Calculate Location Address */}
      {activeTab === 2 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Calculate Location Address</div>
          <p className={styles.cardDesc}>
            Derive deterministic StateInit and address for any H3 cell using 8-bit shard depth prefix matching the Minter.
          </p>
          <div className={styles.inputGroup}>
            <span className={styles.label}>Minter Address</span>
            <input
              type="text"
              className={styles.inputField}
              value={minterAddrInput}
              onChange={(e: any) => setMinterAddrInput(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.label}>H3 Spatial Cell Index</span>
            <input
              type="text"
              className={styles.inputField}
              value={calcH3CellInput}
              placeholder="e.g. 8828308281fffff"
              onChange={(e: any) => setCalcH3CellInput(e.target.value)}
            />
          </div>

          {calculatedTab2Address && (
            <div className={styles.inputGroup} style="margin-top: 0.5rem;">
              <span className={styles.label}>Calculated Address</span>
              <div className={styles.addressText}>{calculatedTab2Address}</div>
            </div>
          )}

          <Button
            className={styles.actionButton}
            disabled={!calculatedTab2Address}
            onClick={() => {
              setH3CellInput(calcH3CellInput.trim());
              setActiveTab(0);
            }}
          >
            Inspect in Location Info
          </Button>
        </div>
      )}

      {/* Tab 3: Verify Member */}
      {activeTab === 3 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Verify Member Status</div>
          <p className={styles.cardDesc}>
            Verify on-chain if an address is an active member within a specific Location contract.
          </p>
          <div className={styles.inputGroup}>
            <span className={styles.label}>Location Contract Address</span>
            <input
              type="text"
              className={styles.inputField}
              value={verifyLocationAddr}
              placeholder="Location Address"
              onChange={(e: any) => setVerifyLocationAddr(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.label}>Target Member Address</span>
            <input
              type="text"
              className={styles.inputField}
              value={targetMemberAddr}
              placeholder="User TON Address"
              onChange={(e: any) => setTargetMemberAddr(e.target.value)}
            />
          </div>
          <Button
            className={styles.actionButton}
            onClick={() => locationMembersQuery.refetch()}
            disabled={!verifyLocationAddr.trim() || !targetMemberAddr.trim() || locationMembersQuery.isLoading}
          >
            {locationMembersQuery.isLoading ? 'Checking...' : 'Check Membership'}
          </Button>

          {locationMembersQuery.isTargetMember !== null && (
            <div style="margin-top: 0.75rem;">
              <span
                className={`${styles.statusIndicator} ${
                  locationMembersQuery.isTargetMember ? styles.active : styles.inactive
                }`}
              >
                {locationMembersQuery.isTargetMember
                  ? 'Active member in this location!'
                  : 'NOT a member in this location.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(withGlobal((global: GlobalState): StateProps => {
  const currentAccount = selectCurrentAccount(global);
  return {
    currentAddress: currentAccount?.address,
  };
})(CityNetworkScreen));
