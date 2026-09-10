import React, { memo } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { Theme } from '../../../../global/types';
import { ContentTab } from '../../../../global/types';

import { IS_AGENT_ENABLED, IS_EXPLORE_ENABLED, IS_MARKET_ENABLED } from '../../../../config';
import { selectCurrentAccountSettings } from '../../../../global/selectors';
import { ACCENT_COLORS } from '../../../../util/accentColor/constants';
import buildClassName from '../../../../util/buildClassName';
import { IS_TOUCH_ENV } from '../../../../util/windowEnvironment';
import { ANIMATED_STICKERS_PATHS } from '../../../ui/helpers/animatedAssets';

import useAppTheme from '../../../../hooks/useAppTheme';
import useFlag from '../../../../hooks/useFlag';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import AnimatedIconWithPreview from '../../../ui/AnimatedIconWithPreview';
import Button from '../../../ui/Button';

import styles from './LandscapeNavBar.module.scss';

const ANIMATED_ICON_SIZE_PX = 34;
const ANIMATED_STICKER_SPEED = 2;

interface StateProps {
  areSettingsOpen?: boolean;
  isAgentOpen?: boolean;
  isExploreOpen?: boolean;
  isMarketOpen?: boolean;
  isBrotherhoodFiOpen?: boolean;
  isPersonalJettonOpen?: boolean;
  isCityNetworkOpen?: boolean;
  theme: Theme;
  accentColorIndex?: number;
}

function LandscapeNavBar({
  areSettingsOpen,
  isAgentOpen,
  isExploreOpen,
  isMarketOpen,
  isBrotherhoodFiOpen,
  isPersonalJettonOpen,
  isCityNetworkOpen,
  theme,
  accentColorIndex,
}: StateProps) {
  const {
    switchToWallet,
    switchToPersonalJetton,
    switchToCityNetwork,
    switchToBrotherhoodFi,
    switchToAgent,
    switchToExplore,
    switchToMarket,
    switchToSettings,
    closeNftCollection,
    selectToken,
    setActiveContentTab,
  } = getActions();

  const lang = useLang();
  const appTheme = useAppTheme(theme);
  const stickerPaths = ANIMATED_STICKERS_PATHS[appTheme];
  const accentColor = accentColorIndex !== undefined ? ACCENT_COLORS[appTheme][accentColorIndex] : undefined;

  const isWalletActive = !areSettingsOpen && !isAgentOpen && !isExploreOpen && !isMarketOpen
    && !isBrotherhoodFiOpen && !isPersonalJettonOpen && !isCityNetworkOpen;

  const handleWalletClick = useLastCallback(() => {
    switchToWallet();
    closeNftCollection();
    selectToken({ slug: undefined });
    setActiveContentTab({ tab: ContentTab.Overview });
  });

  return (
    <div className={styles.root}>
      <NavButton
        isActive={isWalletActive}
        label={lang('Wallet')}
        tgsUrl={isWalletActive ? stickerPaths.iconWalletSolid : stickerPaths.iconWallet}
        previewUrl={isWalletActive ? stickerPaths.preview.iconWalletSolid : stickerPaths.preview.iconWallet}
        accentColor={accentColor}
        onClick={handleWalletClick}
      />
      <NavButton
        isActive={Boolean(isPersonalJettonOpen)}
        label={lang('Personal')}
        tgsUrl={isPersonalJettonOpen ? stickerPaths.iconMarketSolid : stickerPaths.iconMarket}
        previewUrl={isPersonalJettonOpen ? stickerPaths.preview.iconMarketSolid : stickerPaths.preview.iconMarket}
        accentColor={accentColor}
        onClick={switchToPersonalJetton}
      />
      <NavButton
        isActive={Boolean(isCityNetworkOpen)}
        label={lang('City')}
        tgsUrl={isCityNetworkOpen ? stickerPaths.iconExploreSolid : stickerPaths.iconExplore}
        previewUrl={isCityNetworkOpen ? stickerPaths.preview.iconExploreSolid : stickerPaths.preview.iconExplore}
        accentColor={accentColor}
        onClick={switchToCityNetwork}
      />
      <NavButton
        isActive={Boolean(isBrotherhoodFiOpen)}
        label={lang('Fi')}
        tgsUrl={isBrotherhoodFiOpen ? stickerPaths.iconEarnPurple : stickerPaths.iconEarn}
        previewUrl={isBrotherhoodFiOpen ? stickerPaths.preview.iconEarnPurple : stickerPaths.preview.iconEarn}
        accentColor={accentColor}
        onClick={switchToBrotherhoodFi}
      />
      {IS_MARKET_ENABLED && (
        <NavButton
          isActive={isMarketOpen}
          label={lang('Market')}
          tgsUrl={isMarketOpen ? stickerPaths.iconMarketSolid : stickerPaths.iconMarket}
          previewUrl={isMarketOpen ? stickerPaths.preview.iconMarketSolid : stickerPaths.preview.iconMarket}
          accentColor={accentColor}
          onClick={switchToMarket}
        />
      )}
      {IS_AGENT_ENABLED && (
        <NavButton
          isActive={isAgentOpen}
          label={lang('Agent')}
          tgsUrl={isAgentOpen ? stickerPaths.iconAgentSolid : stickerPaths.iconAgent}
          previewUrl={isAgentOpen ? stickerPaths.preview.iconAgentSolid : stickerPaths.preview.iconAgent}
          accentColor={accentColor}
          onClick={switchToAgent}
        />
      )}
      {IS_EXPLORE_ENABLED && (
        <NavButton
          isActive={isExploreOpen}
          label={lang('Explore')}
          tgsUrl={isExploreOpen ? stickerPaths.iconExploreSolid : stickerPaths.iconExplore}
          previewUrl={isExploreOpen ? stickerPaths.preview.iconExploreSolid : stickerPaths.preview.iconExplore}
          accentColor={accentColor}
          onClick={switchToExplore}
        />
      )}

      <NavButton
        isActive={areSettingsOpen}
        label={lang('Settings')}
        tgsUrl={areSettingsOpen ? stickerPaths.iconSettingsSolid : stickerPaths.iconSettings}
        previewUrl={areSettingsOpen ? stickerPaths.preview.iconSettingsSolid : stickerPaths.preview.iconSettings}
        accentColor={accentColor}
        onClick={switchToSettings}
      />
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
    areSettingsOpen,
    isAgentOpen,
    isExploreOpen,
    isMarketOpen,
    isBrotherhoodFiOpen,
    isPersonalJettonOpen,
    isCityNetworkOpen,
    theme: global.settings.theme,
    accentColorIndex: selectCurrentAccountSettings(global)?.accentColorIndex,
  };
})(LandscapeNavBar));

function NavButtonInternal({
  label, tgsUrl, previewUrl, isActive, accentColor, onClick,
}: {
  isActive?: boolean;
  label: string;
  tgsUrl: string;
  previewUrl: string;
  accentColor?: string;
  onClick: NoneToVoidFunction;
}) {
  const [isAnimating, startAnimation, stopAnimation] = useFlag();

  const handleClick = useLastCallback(() => {
    if (IS_TOUCH_ENV) startAnimation();
    onClick();
  });

  return (
    <Button
      isSimple
      className={buildClassName(styles.button, isActive && styles.active)}
      onClick={handleClick}
      onMouseEnter={!IS_TOUCH_ENV ? startAnimation : undefined}
    >
      <AnimatedIconWithPreview
        play={isAnimating}
        size={ANIMATED_ICON_SIZE_PX}
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
}

const NavButton = memo(NavButtonInternal);
