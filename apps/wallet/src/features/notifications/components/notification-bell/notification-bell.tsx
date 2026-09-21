/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Bell,
  BellRing,
  Zap,
  Coins,
  CheckCircle2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet, useWalletKit, type SavedWallet } from '@demo/wallet-core';
import { useFormatAddress, formatTonAddress } from '@/core/utils/formatters';
import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { useFiMinterState } from '@/lib/brotherhood/queries';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useRequestUpgrade } from '@/features/brotherhood/hooks/use-request-upgrade';
import {
  useWeeklyClaim,
  calculateClaimEligibility,
} from '@/features/brotherhood/hooks/use-weekly-claim';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendNativeNotification,
  type NativeNotificationPermission,
} from '../../lib/native-notifications';

const DISMISSED_STORAGE_PREFIX = 'brotherhood-dismissed-notifications';

function getDismissedKeys(network: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${DISMISSED_STORAGE_PREFIX}-${network}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissedKeys(network: string, keys: Set<string>): void {
  try {
    localStorage.setItem(
      `${DISMISSED_STORAGE_PREFIX}-${network}`,
      JSON.stringify(Array.from(keys)),
    );
  } catch {
    /* ignore */
  }
}

// Swipeable notification card container
interface SwipeableCardProps {
  id: string;
  onDismiss: (id: string) => void;
  children: React.ReactNode;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  id,
  onDismiss,
  children,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null)
      return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Only allow swiping right if diffX > 0 and horizontal movement dominates
    if (diffX > 0 && Math.abs(diffX) > Math.abs(diffY)) {
      setOffsetX(Math.min(diffX, 200));
    }
  };

  const handleTouchEnd = () => {
    if (offsetX > 80) {
      // Swiped far enough right -> dismiss
      setIsDismissing(true);
      setTimeout(() => {
        onDismiss(id);
      }, 200);
    } else {
      // Reset
      setOffsetX(0);
    }
    setIsSwiping(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group select-none">
      {/* Background hint revealed when swiping right */}
      <div
        className="absolute inset-0 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-center px-4 transition-opacity duration-150"
        style={{ opacity: offsetX > 20 ? 1 : 0 }}
      >
        <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Dismiss
        </span>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isDismissing
            ? 'translateX(100%)'
            : `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
          opacity: isDismissing ? 0 : 1,
        }}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
};

// Component for an individual wallet's notification discovery
interface WalletNotificationCollectorProps {
  wallet: SavedWallet;
  isActive: boolean;
  minterVersion: number | null;
  onNotificationChange: (
    walletId: string,
    notifs: Array<{
      id: string;
      type: 'upgrade' | 'claim';
      walletId: string;
      walletName: string;
      walletAddress: string;
      isActive: boolean;
      data: any;
    }>,
  ) => void;
}

const WalletNotificationCollector: React.FC<
  WalletNotificationCollectorProps
> = ({ wallet, isActive, minterVersion, onNotificationChange }) => {
  const account = useFiAccount(wallet.address);

  useEffect(() => {
    if (account.isLoading) return;
    const accountData = account.data;
    const items: Array<{
      id: string;
      type: 'upgrade' | 'claim';
      walletId: string;
      walletName: string;
      walletAddress: string;
      isActive: boolean;
      data: any;
    }> = [];

    // Contract upgrade check
    if (accountData && minterVersion !== null) {
      const walletVer = accountData.version ?? 0;
      if (walletVer < minterVersion) {
        items.push({
          id: `upgrade-${wallet.address}-${minterVersion}`,
          type: 'upgrade',
          walletId: wallet.id,
          walletName: wallet.name || 'Wallet',
          walletAddress: wallet.address,
          isActive,
          data: {
            walletVersion: walletVer,
            minterVersion,
          },
        });
      }
    }

    // Weekly claim check
    if (accountData) {
      const claimResult = calculateClaimEligibility(accountData);
      if (claimResult.isEligible && claimResult.claimAmounts.total > 0n) {
        items.push({
          id: `claim-${wallet.address}-${accountData.lastClaim ?? 0}`,
          type: 'claim',
          walletId: wallet.id,
          walletName: wallet.name || 'Wallet',
          walletAddress: wallet.address,
          isActive,
          data: {
            claimAmountFi: claimResult.claimAmounts.total.toLocaleString(),
          },
        });
      }
    }

    onNotificationChange(wallet.id, items);
  }, [
    wallet.id,
    wallet.name,
    wallet.address,
    isActive,
    account.data,
    account.isLoading,
    minterVersion,
    onNotificationChange,
  ]);

  return null;
};

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationPerm, setNotificationPerm] =
    useState<NativeNotificationPermission>(() =>
      getBrowserNotificationPermission(),
    );

  const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
  const walletKit = useWalletKit();
  const { network } = useFormatAddress();
  const minter = useFiMinterState();
  const minterVersion = minter.data ? Number(minter.data.walletVersion) : null;

  // Track dismissed notifications by key in localStorage
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() =>
    getDismissedKeys(network),
  );

  // Map of walletId -> list of discovered notifications
  const [walletNotifsMap, setWalletNotifsMap] = useState<
    Record<
      string,
      Array<{
        id: string;
        type: 'upgrade' | 'claim';
        walletId: string;
        walletName: string;
        walletAddress: string;
        isActive: boolean;
        data: any;
      }>
    >
  >({});

  const handleNotificationChange = useCallback(
    (
      walletId: string,
      notifs: Array<{
        id: string;
        type: 'upgrade' | 'claim';
        walletId: string;
        walletName: string;
        walletAddress: string;
        isActive: boolean;
        data: any;
      }>,
    ) => {
      setWalletNotifsMap((prev) => {
        if (JSON.stringify(prev[walletId]) === JSON.stringify(notifs)) {
          return prev;
        }
        return { ...prev, [walletId]: notifs };
      });
    },
    [],
  );

  // Active wallet hooks for sending actions
  const activeAccount = useFiAccount(address ?? null);
  const upgrade = useRequestUpgrade({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: activeAccount.data,
    minterVersion,
  });

  const claim = useWeeklyClaim({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: activeAccount.data,
  });

  // Track pending transaction target per action
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(
    null,
  );

  // Aggregate all discovered notifications across all saved wallets
  const allWalletNotifs = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'upgrade' | 'claim';
      walletId: string;
      walletName: string;
      walletAddress: string;
      isActive: boolean;
      data: any;
    }> = [];
    Object.values(walletNotifsMap).forEach((walletItems) => {
      walletItems.forEach((item) => {
        if (!dismissedKeys.has(item.id)) {
          list.push(item);
        }
      });
    });
    return list;
  }, [walletNotifsMap, dismissedKeys]);

  // Total actionable count (active notifications)
  const count = allWalletNotifs.length;

  // Dispatch native notifications for newly discovered actionable items
  useEffect(() => {
    allWalletNotifs.forEach((item) => {
      if (item.type === 'claim' && item.data.claimAmountFi) {
        sendNativeNotification(`Weekly FI Grant Ready (${item.walletName})`, {
          body: `${item.walletName} has ${item.data.claimAmountFi} FI ready to claim.`,
          key: `native-${item.id}`,
        });
      } else if (item.type === 'upgrade') {
        sendNativeNotification(
          `Contract Upgrade Available (${item.walletName})`,
          {
            body: `Upgrade to v${item.data.minterVersion} is available for ${item.walletName}.`,
            key: `native-${item.id}`,
          },
        );
      }
    });
  }, [allWalletNotifs]);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotificationPerm(res);
    if (res === 'granted') {
      toast.success('Native notifications enabled!');
      sendNativeNotification('Notifications Active', {
        body: 'You will receive alerts for weekly claims and app upgrades.',
        key: 'welcome-notification',
      });
    } else if (res === 'denied') {
      toast.error('Notification permission was blocked in browser settings.');
    }
  };

  const handleDismissOne = useCallback(
    (id: string) => {
      setDismissedKeys((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveDismissedKeys(network, next);
        return next;
      });
      toast.info('Notification dismissed');
    },
    [network],
  );

  const handleClearAll = useCallback(() => {
    const allIds = new Set(dismissedKeys);
    allWalletNotifs.forEach((n) => allIds.add(n.id));
    setDismissedKeys(allIds);
    saveDismissedKeys(network, allIds);
    toast.success('All notifications cleared');
  }, [dismissedKeys, allWalletNotifs, network]);

  // Execute upgrade for a specific target wallet
  const handleUpgradeTarget = async (
    notifId: string,
    targetAddress: string,
  ) => {
    setActionInProgressId(notifId);
    try {
      await upgrade.send(targetAddress);
      handleDismissOne(notifId);
      toast.success('Upgrade transaction dispatched');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upgrade failed';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Execute weekly claim for a specific target wallet
  const handleClaimTarget = async (
    notifId: string,
    targetAddress: string,
    amountFi: string,
  ) => {
    setActionInProgressId(notifId);
    try {
      await claim.send(targetAddress);
      handleDismissOne(notifId);
      toast.success(`Claimed ${amountFi} FI for account`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <>
      {/* Background collectors for each saved wallet */}
      {savedWallets.map((w) => (
        <WalletNotificationCollector
          key={w.id}
          wallet={w}
          isActive={w.id === activeWalletId}
          minterVersion={minterVersion}
          onNotificationChange={handleNotificationChange}
        />
      ))}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
        aria-label={`Notifications (${count} unread)`}
        title={`Notifications (${count} unread)`}
        data-testid="header-notification-bell"
      >
        {count > 0 ? (
          <BellRing className="w-4.5 h-4.5 text-primary animate-wiggle" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}

        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background animate-pulse">
            {count}
          </span>
        )}
      </button>

      <Modal.Container
        isOpened={isOpen}
        onOpenChange={setIsOpen}
        className="px-2"
      >
        <Modal.Header onClose={() => setIsOpen(false)}>
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-2">
              <Modal.Title>Notifications & Upgrades</Modal.Title>
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                  {count} action{count > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {count > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                data-testid="notifications-clear-all-btn"
              >
                Clear all
              </button>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="pb-6 flex flex-col gap-3 text-xs">
          {/* Permission Prompt banner if default */}
          {notificationPerm === 'default' && (
            <div className="p-3 bg-secondary/70 border border-border rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-foreground block text-xs truncate">
                    Enable Native Alerts
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    Get alerted when weekly claims or upgrades land.
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="gray"
                onClick={handleRequestPermission}
                className="text-xs px-3 h-8 flex-shrink-0 cursor-pointer"
              >
                Allow
              </Button>
            </div>
          )}

          {/* Swipe Hint */}
          {count > 0 && (
            <p className="text-[10px] text-muted-foreground/80 px-1 -mb-1 flex items-center justify-between">
              <span>Swipe right on any notification to dismiss it.</span>
            </p>
          )}

          {/* Render All Wallet Notifications */}
          {allWalletNotifs.map((item) => {
            const isProcessing =
              actionInProgressId === item.id ||
              (item.type === 'upgrade' && upgrade.isSending) ||
              (item.type === 'claim' && claim.isSending);

            if (item.type === 'upgrade') {
              return (
                <SwipeableCard
                  key={item.id}
                  id={item.id}
                  onDismiss={handleDismissOne}
                >
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-500">
                          <Zap className="w-4 h-4 fill-amber-500/30" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-foreground text-sm">
                              Contract Upgrade
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground border border-border/80">
                              {item.walletName}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            v{item.data.walletVersion} → Latest v
                            {item.data.minterVersion} •{' '}
                            {formatTonAddress(item.walletAddress, {
                              network,
                              shorten: true,
                              count: 4,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() =>
                        handleUpgradeTarget(item.id, item.walletAddress)
                      }
                      className="w-full text-xs font-semibold py-2 rounded-xl cursor-pointer"
                    >
                      {actionInProgressId === item.id
                        ? 'Sending Upgrade...'
                        : 'Upgrade Contract'}
                    </Button>
                  </div>
                </SwipeableCard>
              );
            }

            if (item.type === 'claim') {
              return (
                <SwipeableCard
                  key={item.id}
                  id={item.id}
                  onDismiss={handleDismissOne}
                >
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-500">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-foreground text-sm">
                              Weekly FI Grant Ready
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground border border-border/80">
                              {item.walletName}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            Claimable:{' '}
                            <span className="font-bold text-foreground">
                              {item.data.claimAmountFi} FI
                            </span>{' '}
                            •{' '}
                            {formatTonAddress(item.walletAddress, {
                              network,
                              shorten: true,
                              count: 4,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() =>
                        handleClaimTarget(
                          item.id,
                          item.walletAddress,
                          item.data.claimAmountFi,
                        )
                      }
                      className="w-full text-xs font-semibold py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      {actionInProgressId === item.id
                        ? 'Claiming Grant...'
                        : `Claim ${item.data.claimAmountFi} FI`}
                    </Button>
                  </div>
                </SwipeableCard>
              );
            }

            return null;
          })}

          {/* Empty State */}
          {count === 0 && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="font-bold text-foreground text-sm">
                You're all caught up!
              </span>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                No pending contract upgrades or grant claims at this time across
                your saved accounts.
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal.Container>
    </>
  );
};
