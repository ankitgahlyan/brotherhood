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
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useWallet,
  useWalletKit,
  useBrotherhood,
  normalizeAddressByNetwork,
  type SavedWallet,
  type PendingDeferredPayment,
} from '@demo/wallet-core';
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
  useCancelDeferredPayment,
  useClaimDeferredPayment,
} from '@/features/brotherhood/hooks/use-deferred-payment';
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

function formatRemainingTime(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return 'Expired';
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

// Swipeable notification card container
interface SwipeableCardProps {
  id: string;
  isSwipeable?: boolean;
  onDismiss: (id: string) => void;
  children: React.ReactNode;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  id,
  isSwipeable = true,
  onDismiss,
  children,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeable) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeable) return;
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
    if (!isSwipeable) return;
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
      {isSwipeable && (
        <div
          className="absolute inset-0 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-center px-4 transition-opacity duration-150"
          style={{ opacity: offsetX > 20 ? 1 : 0 }}
        >
          <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Dismiss
          </span>
        </div>
      )}

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

export type NotificationType =
  'upgrade' | 'claim' | 'deferred_payer_review' | 'deferred_payee_claim';

export interface WalletNotificationItem {
  id: string;
  type: NotificationType;
  walletId: string;
  walletName: string;
  walletAddress: string;
  isActive: boolean;
  data: any;
}

interface WalletNotificationCollectorProps {
  wallet: SavedWallet;
  isActive: boolean;
  minterVersion: number | null;
  pendingDeferredByAddress: Record<string, PendingDeferredPayment[]>;
  nowSec: number;
  onNotificationChange: (
    walletId: string,
    notifs: WalletNotificationItem[],
  ) => void;
}

const WalletNotificationCollector: React.FC<
  WalletNotificationCollectorProps
> = ({
  wallet,
  isActive,
  minterVersion,
  pendingDeferredByAddress,
  nowSec,
  onNotificationChange,
}) => {
  const account = useFiAccount(wallet.address);

  useEffect(() => {
    if (account.isLoading) return;
    const accountData = account.data;
    const items: WalletNotificationItem[] = [];

    // 1. Contract upgrade check
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

    // 2. Weekly claim check
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

    // 3. Deferred Payments Checks
    const walletKey = normalizeAddressByNetwork(wallet.address, false);
    const pendingList = pendingDeferredByAddress[walletKey] || [];
    const now = nowSec;

    for (const item of pendingList) {
      if (item.role === 'payer') {
        // Payer review: visible within 72 hours, auto-clears after 72 hours
        if (now < item.expiresAt) {
          items.push({
            id: `deferred-payer-${item.id}`,
            type: 'deferred_payer_review',
            walletId: wallet.id,
            walletName: wallet.name || 'Wallet',
            walletAddress: wallet.address,
            isActive,
            data: {
              holdingAddress: item.holdingAddress,
              payeeAddress: item.counterpartyAddress,
              amount: item.amount,
              expiresAt: item.expiresAt,
              createdAt: item.createdAt,
            },
          });
        }
      } else if (item.role === 'payee') {
        // Payee claim: becomes visible once 72 hours have elapsed
        if (now >= item.expiresAt) {
          items.push({
            id: `deferred-payee-${item.id}`,
            type: 'deferred_payee_claim',
            walletId: wallet.id,
            walletName: wallet.name || 'Wallet',
            walletAddress: wallet.address,
            isActive,
            data: {
              holdingAddress: item.holdingAddress,
              payerAddress: item.counterpartyAddress,
              amount: item.amount,
              expiresAt: item.expiresAt,
              createdAt: item.createdAt,
            },
          });
        }
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
    pendingDeferredByAddress,
    nowSec,
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
  const { pendingDeferredByAddress, removePendingDeferredPayment } =
    useBrotherhood();

  const [nowSec, setNowSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track dismissed notifications by key in localStorage
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() =>
    getDismissedKeys(network),
  );

  // Map of walletId -> list of discovered notifications
  const [walletNotifsMap, setWalletNotifsMap] = useState<
    Record<string, WalletNotificationItem[]>
  >({});

  const handleNotificationChange = useCallback(
    (walletId: string, notifs: WalletNotificationItem[]) => {
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

  const cancelDeferred = useCancelDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    holdingAddress: '',
    network,
    accountData: activeAccount.data,
  });

  const claimDeferred = useClaimDeferredPayment({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    holdingAddress: '',
    network,
    accountData: activeAccount.data,
  });

  // Track pending transaction target per action
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(
    null,
  );

  // Aggregate all discovered notifications across all saved wallets
  const allWalletNotifs = useMemo(() => {
    const list: WalletNotificationItem[] = [];
    Object.values(walletNotifsMap).forEach((walletItems) => {
      walletItems.forEach((item) => {
        // Payer review notifications are strictly non-dismissible; ignore dismissedKeys
        if (item.type === 'deferred_payer_review') {
          list.push(item);
        } else if (!dismissedKeys.has(item.id)) {
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
      } else if (item.type === 'deferred_payer_review') {
        sendNativeNotification(`Deferred Payment Alert (${item.walletName})`, {
          body: `${item.data.amount} FI requested from ${item.walletName}. Review within 72h to dispute.`,
          key: `native-${item.id}`,
        });
      } else if (item.type === 'deferred_payee_claim') {
        sendNativeNotification(
          `Deferred Payment Ready to Claim (${item.walletName})`,
          {
            body: `${item.data.amount} FI is unlocked and ready to claim for ${item.walletName}.`,
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
        body: 'You will receive alerts for claims, upgrades, and deferred payments.',
        key: 'welcome-notification',
      });
    } else if (res === 'denied') {
      toast.error('Notification permission was blocked in browser settings.');
    }
  };

  const handleDismissOne = useCallback(
    (id: string) => {
      const notif = allWalletNotifs.find((n) => n.id === id);
      // Strictly non-dismissible for payer review
      if (notif?.type === 'deferred_payer_review') {
        toast.info(
          'This alert is non-dismissible and will auto-clear once the 72h dispute window expires.',
        );
        return;
      }

      setDismissedKeys((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveDismissedKeys(network, next);
        return next;
      });
      toast.info('Notification dismissed');
    },
    [allWalletNotifs, network],
  );

  const handleClearAll = useCallback(() => {
    const allIds = new Set(dismissedKeys);
    // Do not dismiss deferred_payer_review alerts
    allWalletNotifs
      .filter((n) => n.type !== 'deferred_payer_review')
      .forEach((n) => allIds.add(n.id));

    setDismissedKeys(allIds);
    saveDismissedKeys(network, allIds);
    toast.success('Dismissible notifications cleared');
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

  // Execute cancellation / dispute of deferred payment by Payer
  const handleCancelDeferredTarget = async (
    notifId: string,
    holdingAddr: string,
    walletAddr: string,
  ) => {
    setActionInProgressId(notifId);
    try {
      await cancelDeferred.send(holdingAddr);
      removePendingDeferredPayment(walletAddr, holdingAddr);
      toast.success('Deferred payment cancelled and disputed');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Execute claim of deferred payment by Payee
  const handleClaimDeferredTarget = async (
    notifId: string,
    holdingAddr: string,
    walletAddr: string,
    amountFi: string,
  ) => {
    setActionInProgressId(notifId);
    try {
      await claimDeferred.send(holdingAddr);
      removePendingDeferredPayment(walletAddr, holdingAddr);
      toast.success(`Claimed ${amountFi} FI deferred payment`);
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
          pendingDeferredByAddress={pendingDeferredByAddress}
          nowSec={nowSec}
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
                    Get alerted when claims, upgrades, or deferred payments
                    arrive.
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
              <span>
                Swipe right on dismissible notifications to remove them.
              </span>
            </p>
          )}

          {/* Render All Wallet Notifications */}
          {allWalletNotifs.map((item) => {
            const isProcessing = actionInProgressId === item.id;

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

            if (item.type === 'deferred_payer_review') {
              const remaining = item.data.expiresAt - nowSec;
              return (
                <SwipeableCard
                  key={item.id}
                  id={item.id}
                  isSwipeable={false}
                  onDismiss={handleDismissOne}
                >
                  <div className="p-3.5 bg-destructive/10 border border-destructive/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center flex-shrink-0 text-destructive">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-destructive text-sm">
                              Deferred Pull Review
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground border border-border/80">
                              {item.walletName}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            Requested:{' '}
                            <span className="font-semibold text-foreground">
                              {item.data.amount} FI
                            </span>{' '}
                            by{' '}
                            {formatTonAddress(item.data.payeeAddress, {
                              network,
                              shorten: true,
                              count: 4,
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRemainingTime(remaining)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isProcessing}
                        onClick={() =>
                          handleCancelDeferredTarget(
                            item.id,
                            item.data.holdingAddress,
                            item.walletAddress,
                          )
                        }
                        className="w-full text-xs font-semibold py-2 rounded-xl cursor-pointer"
                      >
                        {actionInProgressId === item.id
                          ? 'Cancelling...'
                          : 'Cancel & Dispute'}
                      </Button>
                    </div>
                  </div>
                </SwipeableCard>
              );
            }

            if (item.type === 'deferred_payee_claim') {
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
                              Deferred Payment Ready
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground border border-border/80">
                              {item.walletName}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            <span className="font-bold text-foreground">
                              {item.data.amount} FI
                            </span>{' '}
                            from{' '}
                            {formatTonAddress(item.data.payerAddress, {
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
                        handleClaimDeferredTarget(
                          item.id,
                          item.data.holdingAddress,
                          item.walletAddress,
                          item.data.amount,
                        )
                      }
                      className="w-full text-xs font-semibold py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      {actionInProgressId === item.id
                        ? 'Claiming...'
                        : `Claim ${item.data.amount} FI`}
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
                No pending contract upgrades, grant claims, or deferred payment
                reviews at this time across your saved accounts.
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal.Container>
    </>
  );
};
