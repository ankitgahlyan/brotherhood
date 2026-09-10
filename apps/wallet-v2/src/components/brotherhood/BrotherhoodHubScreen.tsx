import React, { memo, useState } from '../../lib/teact/teact';
import BrotherhoodFiScreen from './BrotherhoodFiScreen';
import CityNetworkScreen from '../city/CityNetworkScreen';
import PersonalJettonScreen from '../personal/PersonalJettonScreen';
import DaoGovernanceScreen from '../dao/DaoGovernanceScreen';
import LotteryScreen from '../lottery/LotteryScreen';
import DeveloperSuiteScreen from '../developer/DeveloperSuiteScreen';

import styles from './BrotherhoodHubScreen.module.scss';

export type EcosystemTab = 'fi' | 'city' | 'personal' | 'dao' | 'lottery' | 'developer';

interface TabItem {
  id: EcosystemTab;
  title: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'fi', title: 'FI Credit', icon: '💳' },
  { id: 'city', title: 'City Network', icon: '🗺️' },
  { id: 'personal', title: 'Personal Token', icon: '🪙' },
  { id: 'dao', title: 'DAO Governance', icon: '🏛️' },
  { id: 'lottery', title: 'Lottery Pool', icon: '🎲' },
  { id: 'developer', title: 'Developer Suite', icon: '🛠️' },
];

function BrotherhoodHubScreen() {
  const [activeTab, setActiveTab] = useState<EcosystemTab>('fi');

  return (
    <div className={styles.hubContainer}>
      <div className={styles.topNavWrapper}>
        <div className={styles.pillScroller}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.pillButton} ${isActive ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.contentArea}>
        {activeTab === 'fi' && <BrotherhoodFiScreen />}
        {activeTab === 'city' && <CityNetworkScreen />}
        {activeTab === 'personal' && <PersonalJettonScreen />}
        {activeTab === 'dao' && <DaoGovernanceScreen />}
        {activeTab === 'lottery' && <LotteryScreen />}
        {activeTab === 'developer' && <DeveloperSuiteScreen />}
      </div>
    </div>
  );
}

export default memo(BrotherhoodHubScreen);
