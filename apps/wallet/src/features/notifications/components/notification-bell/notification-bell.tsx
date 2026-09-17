/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Zap,
  Coins,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet, useWalletKit } from '@demo/wallet-core';
import { useFormatAddress } from '@/core/utils/formatters';
import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { useFiMinterState } from '@/lib/brotherhood/queries';
import { useFiAccount } from '@/features/brotherhood/hooks/use-fi-account';
import { useRequestUpgrade } from '@/features/brotherhood/hooks/use-request-upgrade';
import { useWeeklyClaim } from '@/features/brotherhood/hooks/use-weekly-claim';
import {
  onSWUpdateAvailable,
  isUpdateAvailable,
  applyAppUpdate,
  checkForAppUpdates,
} from '@/core/lib/service-worker';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendNativeNotification,
  type NativeNotificationPermission,
} from '../../lib/native-notifications';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSWUpdate, setHasSWUpdate] = useState(() => isUpdateAvailable());
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [notificationPerm, setNotificationPerm] =
    useState<NativeNotificationPermission>(() =>
      getBrowserNotificationPermission(),
    );

  const { currentWallet, address } = useWallet();
  const walletKit = useWalletKit();
  const { network } = useFormatAddress();
  const account = useFiAccount(address ?? null);
  const minter = useFiMinterState();
  const minterVersion = minter.data ? Number(minter.data.walletVersion) : null;

  // Smart Contract Upgrade
  const upgrade = useRequestUpgrade({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
    minterVersion,
  });

  // Weekly Claim
  const claim = useWeeklyClaim({
    wallet: currentWallet,
    walletKit,
    walletAddress: address ?? null,
    network,
    accountData: account.data,
  });

  // Listen to PWA / Service Worker update events
  useEffect(() => {
    return onSWUpdateAvailable((available) => {
      setHasSWUpdate(available);
      if (available) {
        sendNativeNotification('BrotherHood Update Ready', {
          body: 'A new version of BrotherHood Wallet is downloaded and ready to apply.',
          key: 'sw-update-available',
        });
      }
    });
  }, []);

  // Check and dispatch native notifications for contract upgrade or claim readiness
  useEffect(() => {
    if (
      claim.isEligible &&
      claim.claimAmountFi &&
      claim.claimAmountFi !== '0'
    ) {
      sendNativeNotification('Weekly FI Grant Ready!', {
        body: `You have ${claim.claimAmountFi} FI ready to claim.`,
        key: `claim-ready-${address}-${account.data?.lastClaim ?? '0'}`,
      });
    }
  }, [claim.isEligible, claim.claimAmountFi, address, account.data?.lastClaim]);

  useEffect(() => {
    if (upgrade.hasUpgradeAvailable) {
      sendNativeNotification('Contract Upgrade Available', {
        body: `Member contract upgrade to v${upgrade.minterVersion} is available.`,
        key: `contract-upgrade-${upgrade.minterVersion}`,
      });
    }
  }, [upgrade.hasUpgradeAvailable, upgrade.minterVersion]);

  // Total actionable count
  const count =
    (hasSWUpdate ? 1 : 0) +
    (upgrade.hasUpgradeAvailable ? 1 : 0) +
    (claim.isEligible ? 1 : 0);

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

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await checkForAppUpdates();
      if (res.hasUpdate) {
        setHasSWUpdate(true);
        toast.info('New version found and ready to apply!');
      } else {
        toast.success('You are on the latest version.');
      }
    } catch {
      toast.error('Failed to check for updates.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <>
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
          <div className="flex items-center gap-2">
            <Modal.Title>Notifications & Upgrades</Modal.Title>
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                {count} action{count > 1 ? 's' : ''}
              </span>
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

          {/* Frontend App Update Card */}
          {hasSWUpdate && (
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-500">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm block">
                      Frontend Update Ready
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      A newer version of BrotherHood Wallet is downloaded.
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => applyAppUpdate()}
                className="w-full text-xs font-semibold py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                Reload & Update Now
              </Button>
            </div>
          )}

          {/* Smart Contract Upgrade Card */}
          {upgrade.hasUpgradeAvailable && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-500">
                    <Zap className="w-4 h-4 fill-amber-500/30" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm block">
                      Contract Upgrade Available
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Wallet v{upgrade.walletVersion} → Latest v
                      {upgrade.minterVersion}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                disabled={upgrade.isSending || upgrade.isDisabled}
                onClick={() => upgrade.send()}
                className="w-full text-xs font-semibold py-2 rounded-xl cursor-pointer"
              >
                {upgrade.isSending ? 'Sending Upgrade...' : 'Upgrade Contract'}
              </Button>
            </div>
          )}

          {/* Member Weekly Claim Card */}
          {claim.isEligible && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-500">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm block">
                      Weekly FI Grant Ready
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Claimable amount:{' '}
                      <span className="font-bold text-foreground">
                        {claim.claimAmountFi} FI
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                disabled={claim.isSending || claim.isDisabled}
                onClick={() => claim.send()}
                className="w-full text-xs font-semibold py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {claim.isSending
                  ? 'Claiming Grant...'
                  : `Claim ${claim.claimAmountFi} FI`}
              </Button>
            </div>
          )}

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
                No pending app updates, contract upgrades, or grant claims at
                this time.
              </p>
            </div>
          )}

          {/* Footer: Manual Check for Updates */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Version status
            </span>
            <button
              type="button"
              disabled={isCheckingUpdate}
              onClick={handleCheckUpdates}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin text-primary' : ''}`}
              />
              <span>
                {isCheckingUpdate ? 'Checking...' : 'Check for App Update'}
              </span>
            </button>
          </div>
        </Modal.Body>
      </Modal.Container>
    </>
  );
};
