import React, { memo } from '../../../../lib/teact/teact';
import { withGlobal } from '../../../../global';

import { ContentTab } from '../../../../global/types';

import { selectCurrentAccountId } from '../../../../global/selectors';
import buildClassName from '../../../../util/buildClassName';

import Agent from '../../../agent/AgentRuntime';
import BrotherhoodFiScreen from '../../../brotherhood/BrotherhoodFiScreen';
import CityNetworkScreen from '../../../city/CityNetworkScreen';
import Explore from '../../../explore/Explore';
import Market from '../../../market/Market';
import PersonalJettonScreen from '../../../personal/PersonalJettonScreen';
import Portfolio from '../../../portfolio/Portfolio';
import Settings from '../../../settings/Settings';
import Transition from '../../../ui/Transition';
import LandscapeContent from '../Content/LandscapeContent';

import styles from './LandscapeLayout.module.scss';

interface OwnProps {
  onStakedTokenClick: NoneToVoidFunction;
}

interface StateProps {
  areSettingsOpen?: boolean;
  isAgentOpen?: boolean;
  isExploreOpen?: boolean;
  isMarketOpen?: boolean;
  isPortfolioOpen?: boolean;
  isBrotherhoodFiOpen?: boolean;
  isPersonalJettonOpen?: boolean;
  isCityNetworkOpen?: boolean;
}

function LandscapeLayout({
  onStakedTokenClick,
  areSettingsOpen,
  isAgentOpen,
  isExploreOpen,
  isMarketOpen,
  isPortfolioOpen,
  isBrotherhoodFiOpen,
  isPersonalJettonOpen,
  isCityNetworkOpen,
}: OwnProps & StateProps) {
  function renderSlide(isActive: boolean, _isFrom: boolean, currentKey: ContentTab) {
    switch (currentKey) {
      case ContentTab.PersonalJetton:
        return (
          <div className={styles.standaloneWrapper}>
            <PersonalJettonScreen />
          </div>
        );
      case ContentTab.CityNetwork:
        return (
          <div className={styles.standaloneWrapper}>
            <CityNetworkScreen />
          </div>
        );
      case ContentTab.BrotherhoodFi:
        return (
          <div className={styles.standaloneWrapper}>
            <BrotherhoodFiScreen />
          </div>
        );
      case ContentTab.Agent:
        return (
          <div className={styles.standaloneWrapper}>
            <Agent isActive={isActive} />
          </div>
        );
      case ContentTab.Explore:
        return (
          <div className={styles.standaloneWrapper}>
            <Explore isActive={isActive} />
          </div>
        );
      case ContentTab.Market:
        return (
          <div className={buildClassName(styles.standaloneWrapper, styles.marketWrapper)}>
            <Market isActive={isActive} />
          </div>
        );
      case ContentTab.Settings:
        return (
          <div className={styles.settingsWrapper}>
            <Settings isActive={isActive} />
          </div>
        );
      case ContentTab.Portfolio:
        return (
          <div className={buildClassName(styles.standaloneWrapper, styles.portfolioWrapper)}>
            <Portfolio isActive={isActive} />
          </div>
        );
      default:
        return <LandscapeContent onStakedTokenClick={onStakedTokenClick} />;
    }
  }

  function getActiveKey() {
    if (areSettingsOpen) return ContentTab.Settings;
    if (isPersonalJettonOpen) return ContentTab.PersonalJetton;
    if (isCityNetworkOpen) return ContentTab.CityNetwork;
    if (isBrotherhoodFiOpen) return ContentTab.BrotherhoodFi;
    if (isAgentOpen) return ContentTab.Agent;
    if (isExploreOpen) return ContentTab.Explore;
    if (isMarketOpen) return ContentTab.Market;
    if (isPortfolioOpen) return ContentTab.Portfolio;

    return ContentTab.Overview;
  }

  const activeKey = getActiveKey();

  return (
    <Transition
      name="semiFade"
      activeKey={activeKey}
      className={styles.transition}
      slideClassName={styles.slide}
    >
      {renderSlide}
    </Transition>
  );
}

export default memo(
  withGlobal<OwnProps>(
    (global): StateProps => {
      const {
        areSettingsOpen,
        isAgentOpen,
        isExploreOpen,
        isMarketOpen,
        isPortfolioOpen,
        isBrotherhoodFiOpen,
        isPersonalJettonOpen,
        isCityNetworkOpen,
      } = global;

      return {
        areSettingsOpen,
        isAgentOpen,
        isExploreOpen,
        isMarketOpen,
        isPortfolioOpen,
        isBrotherhoodFiOpen,
        isPersonalJettonOpen,
        isCityNetworkOpen,
      };
    },
    (global, _, stickToFirst) => stickToFirst(selectCurrentAccountId(global)),
  )(LandscapeLayout),
);
