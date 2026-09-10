import React, {
  memo, useMemo, useState,
} from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { Theme } from '../../../../global/types';

import { IS_AGENT_ENABLED, IS_EXPLORE_ENABLED, IS_MARKET_ENABLED } from '../../../../config';
import { selectCurrentAccountSettings } from '../../../../global/selectors';
import { ACCENT_COLORS } from '../../../../util/accentColor/constants';
import buildClassName from '../../../../util/buildClassName';
import buildStyle from '../../../../util/buildStyle';
import { ANIMATED_STICKERS_PATHS } from '../../../ui/helpers/animatedAssets';

import useAppTheme from '../../../../hooks/useAppTheme';
import useDraggablePill from '../../../../hooks/useDraggablePill';
import useEffectOnce from '../../../../hooks/useEffectOnce';
import useFlag from '../../../../hooks/useFlag';
import { getIsBottomBarHidden, subscribeToBottomBarVisibility } from '../../../../hooks/useHideBottomBar';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Pill from '../../../common/Pill';
import AnimatedIconWithPreview from '../../../ui/AnimatedIconWithPreview';
import Button from '../../../ui/Button';

import styles from './BottomBar.module.scss';

interface StateProps {
  theme: Theme;
  areSettingsOpen?: boolean;
  isAgentOpen?: boolean;
  isExploreOpen?: boolean;
  isMarketOpen?: boolean;
  isBrotherhoodFiOpen?: boolean;
  isPersonalJettonOpen?: boolean;
  isCityNetworkOpen?: boolean;
  accentColorIndex?: number;
}

type IconKey = 'iconWallet' | 'iconMarket' | 'iconAgent' | 'iconExplore' | 'iconSettings' | 'iconEarn';

interface TabConfig {
  index: number;
  label: string;
  iconKey: IconKey;
  onClick: NoneToVoidFunction;
  isActive: boolean;
}

const ICON_SIZE_PX = 38;
const ANIMATED_STICKER_SPEED = 2;

function BottomBar({
  theme, areSettingsOpen, isAgentOpen, isExploreOpen, isMarketOpen, isBrotherhoodFiOpen, isPersonalJettonOpen, isCityNetworkOpen, accentColorIndex,
}: StateProps) {
  const {
    switchToWallet,
    switchToAgent,
    switchToExplore,
    switchToMarket,
    switchToSettings,
    switchToBrotherhoodFi,
    switchToPersonalJetton,
    switchToCityNetwork,
  } = getActions();

  const lang = useLang();
  const [isHidden, setIsHidden] = useState(getIsBottomBarHidden());
  const appTheme = useAppTheme(theme);
  const stickerPaths = ANIMATED_STICKERS_PATHS[appTheme];
  const accentColor = accentColorIndex !== undefined ? ACCENT_COLORS[appTheme][accentColorIndex] : undefined;

  useEffectOnce(() => {
    return subscribeToBottomBarVisibility(() => {
      setIsHidden(getIsBottomBarHidden());
    });
  });

  const tabs: TabConfig[] = useMemo(() => {
    const isWalletActive = !isAgentOpen && !isExploreOpen && !isMarketOpen && !areSettingsOpen && !isBrotherhoodFiOpen && !isPersonalJettonOpen && !isCityNetworkOpen;
    const rawTabs = [
      {
        label: 'Wallet',
        iconKey: 'iconWallet' as const,
        onClick: switchToWallet,
        isActive: isWalletActive,
      },
      {
        label: 'Personal',
        iconKey: 'iconMarket' as const,
        onClick: switchToPersonalJetton,
        isActive: Boolean(isPersonalJettonOpen),
      },
      {
        label: 'City',
        iconKey: 'iconExplore' as const,
        onClick: switchToCityNetwork,
        isActive: Boolean(isCityNetworkOpen),
      },
      {
        label: 'Fi',
        iconKey: 'iconEarn' as const,
        onClick: switchToBrotherhoodFi,
        isActive: Boolean(isBrotherhoodFiOpen),
      },
      ...(IS_MARKET_ENABLED ? [{
        label: 'Market',
        iconKey: 'iconMarket' as const,
        onClick: switchToMarket,
        isActive: Boolean(isMarketOpen),
      }] : []),
      ...(IS_AGENT_ENABLED ? [{
        label: 'Agent',
        iconKey: 'iconAgent' as const,
        onClick: switchToAgent,
        isActive: Boolean(isAgentOpen),
      }] : []),
      ...(IS_EXPLORE_ENABLED ? [{
        label: 'Explore',
        iconKey: 'iconExplore' as const,
        onClick: switchToExplore,
        isActive: Boolean(isExploreOpen),
      }] : []),
      {
        label: 'Settings',
        iconKey: 'iconSettings' as const,
        onClick: switchToSettings,
        isActive: Boolean(areSettingsOpen),
      },
    ];

    return rawTabs.map((tab, index) => ({
      ...tab,
      index,
    }));
  }, [
    switchToWallet,
    switchToPersonalJetton,
    switchToCityNetwork,
    switchToBrotherhoodFi,
    switchToMarket,
    switchToAgent,
    switchToExplore,
    switchToSettings,
    isPersonalJettonOpen,
    isCityNetworkOpen,
    isBrotherhoodFiOpen,
    isAgentOpen,
    isExploreOpen,
    isMarketOpen,
    areSettingsOpen,
  ]);

  const activeTab = tabs.find((tab) => tab.isActive) || tabs[0];
  const activeIndex = activeTab ? activeTab.index : 0;
  const tabCount = tabs.length;

  const switchToTabByIndex = useLastCallback((index: number) => {
    tabs.find((tab) => tab.index === index)?.onClick();
  });

  const {
    capsuleRef,
    isDragging,
    squeeze,
    renderedActiveIndex,
    pointerHandlers,
  } = useDraggablePill({
    tabCount,
    activeIndex,
    onCommit: switchToTabByIndex,
  });

  const rootStyle = buildStyle(
    `--tab-count: ${tabCount}`,
    `--active-index: ${activeIndex}`,
  );

  return (
    <div
      className={buildClassName(styles.root, isHidden && styles.hidden)}
      style={rootStyle}
    >
      <div
        ref={capsuleRef}
        className={buildClassName(styles.capsule, isDragging && styles.dragging)}
        {...pointerHandlers}
      >
        <Pill isDragging={isDragging} squeeze={squeeze} />
        {tabs.map(({ index, label, iconKey, onClick }) => {
          const isActive = renderedActiveIndex === index;
          const variant = (iconKey === 'iconEarn'
            ? (isActive ? 'iconEarnPurple' : 'iconEarn')
            : (isActive ? `${iconKey}Solid` : iconKey)) as keyof typeof stickerPaths;

          return (
            <TabButton
              key={index}
              isActive={isActive}
              label={lang(label)}
              tgsUrl={stickerPaths[variant]}
              previewUrl={stickerPaths.preview[variant]}
              accentColor={accentColor}
              onClick={onClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export default memo(withGlobal((global): StateProps => {
  const {
    areSettingsOpen,
    isAgentOpen,
    isExploreOpen,
    isMarketOpen,
    isBrotherhoodFiOpen,
    isPersonalJettonOpen,
    isCityNetworkOpen,
  } = global;

  return {
    theme: global.settings.theme,
    areSettingsOpen,
    isAgentOpen,
    isExploreOpen,
    isMarketOpen,
    isBrotherhoodFiOpen,
    isPersonalJettonOpen,
    isCityNetworkOpen,
    accentColorIndex: selectCurrentAccountSettings(global)?.accentColorIndex,
  };
})(BottomBar));

const TabButton = memo(({
  isActive, label, tgsUrl, previewUrl, accentColor, onClick,
}: {
  isActive?: boolean;
  label: string;
  tgsUrl: string;
  previewUrl: string;
  accentColor?: string;
  onClick: NoneToVoidFunction;
}) => {
  const [isAnimating, startAnimation, stopAnimation] = useFlag();

  const handleClick = useLastCallback(() => {
    startAnimation();
    onClick();
  });

  return (
    <Button
      isSimple
      className={buildClassName(styles.button, isActive && styles.active)}
      onClick={handleClick}
    >
      <AnimatedIconWithPreview
        play={isAnimating}
        size={ICON_SIZE_PX}
        speed={ANIMATED_STICKER_SPEED}
        nonInteractive
        forceOnHeavyAnimation
        className={styles.icon}
        color={accentColor}
        tgsUrl={tgsUrl}
        previewUrl={previewUrl}
        onEnded={stopAnimation}
      />
      <span className={styles.label}>{label}</span>
    </Button>
  );
});
