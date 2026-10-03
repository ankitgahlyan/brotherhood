/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  init,
  openTelegramLink as openTgLink,
  retrieveLaunchParams,
} from '@telegram-apps/sdk';

// Initialize the SDK so its helpers can reach the native Telegram client.
if (import.meta.env.VITE_APP_TARGET === 'twa') {
  try {
    init();
  } catch {
    /* not inside a Telegram Mini App */
  }
}

/** Telegram user id from the Mini App launch params, or undefined outside Telegram. */
export function getTelegramId(): number | undefined {
  if (import.meta.env.VITE_APP_TARGET === 'web') return undefined;
  try {
    return retrieveLaunchParams(true).tgWebAppData?.user?.id;
  } catch {
    return undefined;
  }
}

/** Open a t.me link inside Telegram, falling back to a new browser tab. */
export function openTelegramLink(url: string): void {
  try {
    if (openTgLink.isAvailable()) {
      openTgLink(url);
      return;
    }
  } catch {
    // fallback
  }

  const rawApp = (
    window as unknown as {
      Telegram?: { WebApp?: { openTelegramLink?: (url: string) => void } };
    }
  ).Telegram?.WebApp;
  if (rawApp?.openTelegramLink) {
    try {
      rawApp.openTelegramLink(url);
      return;
    } catch {
      // fallback
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Strip leading @ and whitespace from a Telegram username. */
export function cleanTelegramUsername(username: string): string {
  return username.replace(/^@+/, '').trim();
}

/** Construct a canonical Telegram profile deep-link URL (e.g. https://t.me/username). */
export function getTelegramProfileUrl(username: string): string {
  const clean = cleanTelegramUsername(username);
  if (!clean || clean.toLowerCase().endsWith('.bro') || clean.includes('.')) {
    return 'https://t.me';
  }
  return `https://t.me/${clean}`;
}

import { Address } from '@ton/core';
import { detectSocialPlatform, type SocialPlatform } from '@/core/lib/dns';
import {
  useContactBookStore,
  normalizeContactAddress,
} from '@/core/storage/useContactBookStore';
import { useDnsStore } from '@/features/dns/store/dns-store';

/** Open a user's Telegram profile/chat via native Telegram Mini App deeplink or browser. */
export function openTelegramProfile(username: string): void {
  const clean = cleanTelegramUsername(username);
  if (!clean || clean.toLowerCase().endsWith('.bro') || clean.includes('.')) {
    return;
  }
  const url = getTelegramProfileUrl(clean);
  openTelegramLink(url);
}

export interface MemberContactOptions {
  contactLink?: string | null;
  dnsDomain?: string | null;
  username?: string | null;
  fallbackLabel?: string;
}

export interface MemberContactDisplay {
  label: string;
  displayLabel: string;
  hasAction: boolean;
  canOpen: boolean;
  isDns: boolean;
  isCustomApp: boolean;
  platform: SocialPlatform | null;
  platformLabel: string;
  platformIcon: string | null;
  icon: string | null;
  title?: string;
  actionTitle?: string;
}

/**
 * Resolves any cached .bro DNS domain and contact link for one or more addresses
 * (e.g. owner wallet address and FiWallet contract address) from useDnsStore & useContactBookStore.
 */
export function resolveCachedDnsContact(
  addresses: (Address | string | null | undefined)[],
  network: string = 'testnet',
  contactsOverride?: Record<string, any>,
  domainsOverride?: any[],
): { dnsDomain?: string; contactLink?: string } {
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const rawSet = new Set<string>();
  for (const a of addresses) {
    if (!a) continue;
    const str = typeof a === 'string' ? a.trim() : a.toString();
    if (!str) continue;
    rawSet.add(normalizeContactAddress(str));
  }
  if (rawSet.size === 0) return {};

  let dnsDomain: string | undefined;
  let contactLink: string | undefined;

  // 1. Check owned / tracked domains in useDnsStore
  const dnsDomains =
    domainsOverride ?? useDnsStore.getState().domainsByNetwork[net] ?? [];
  for (const d of dnsDomains) {
    if (d.hasOwner === false) continue;
    const recRaw = d.walletRecord
      ? normalizeContactAddress(d.walletRecord)
      : '';
    const bidRaw = d.maxBidAddress
      ? normalizeContactAddress(d.maxBidAddress)
      : '';
    if ((recRaw && rawSet.has(recRaw)) || (bidRaw && rawSet.has(bidRaw))) {
      const fullName = d.name.includes('.')
        ? d.name.toLowerCase()
        : `${d.name.toLowerCase()}.${d.zone || 'bro'}`;
      if (!dnsDomain) dnsDomain = fullName;
      if (!contactLink && d.contactLink?.trim()) {
        contactLink = d.contactLink.trim();
      }
    }
  }

  // 2. Check contact book entries in useContactBookStore
  const contacts =
    contactsOverride ??
    useContactBookStore.getState().contactsByNetwork[net] ??
    {};
  for (const raw of rawSet) {
    const c = contacts[raw];
    if (!c) continue;
    if (!dnsDomain && c.dnsDomain) {
      dnsDomain = c.dnsDomain;
    }
    if (!contactLink && c.contactLink) {
      contactLink = c.contactLink;
    }
  }

  return { dnsDomain, contactLink };
}

/**
 * Computes display label, platform icon, and action metadata for a FiWallet member.
 * Prioritizes .bro DNS contact / domain when set over profile Telegram username.
 */
export function getMemberContactDisplay(
  options?: MemberContactOptions | null,
): MemberContactDisplay {
  const opts = options ?? {};
  const cleanDns = opts.dnsDomain?.trim().toLowerCase() || '';
  const cleanLink = opts.contactLink?.trim() || '';
  const rawUser = opts.username?.trim() || '';
  const cleanUser = cleanTelegramUsername(rawUser);
  const userIsBro = cleanUser.toLowerCase().endsWith('.bro');

  const effectiveDns = cleanDns || (userIsBro ? cleanUser.toLowerCase() : '');

  if (cleanLink || effectiveDns) {
    const detected = cleanLink ? detectSocialPlatform(cleanLink) : null;
    const label = effectiveDns
      ? effectiveDns
      : cleanUser
        ? `@${cleanUser}`
        : detected?.label || opts.fallbackLabel || '@member';
    const hasLinkAction = Boolean(cleanLink);
    const hasFallbackTg = !hasLinkAction && Boolean(cleanUser && !userIsBro);
    const hasAction = hasLinkAction || hasFallbackTg;
    const platform = detected?.platform ?? (hasFallbackTg ? 'telegram' : null);
    const platformLabel =
      detected?.label ?? (hasFallbackTg ? 'Telegram' : 'DNS');
    const platformIcon = detected?.icon ?? (effectiveDns ? '🌐' : null);
    const isCustomApp = Boolean(platform && platform !== 'telegram');
    const title = hasLinkAction
      ? `Open ${label} on ${detected?.label || 'App'} (${cleanLink})`
      : hasFallbackTg
        ? `Open @${cleanUser} on Telegram`
        : effectiveDns || undefined;

    return {
      label,
      displayLabel: label,
      hasAction,
      canOpen: hasAction,
      isDns: true,
      isCustomApp,
      platform,
      platformLabel,
      platformIcon,
      icon: platformIcon,
      title,
      actionTitle: title,
    };
  }

  if (cleanUser) {
    const label = `@${cleanUser}`;
    const title = `Open @${cleanUser} on Telegram`;
    return {
      label,
      displayLabel: label,
      hasAction: true,
      canOpen: true,
      isDns: false,
      isCustomApp: false,
      platform: 'telegram',
      platformLabel: 'Telegram',
      platformIcon: null,
      icon: null,
      title,
      actionTitle: title,
    };
  }

  const fallback = opts.fallbackLabel ?? '@member';
  return {
    label: fallback,
    displayLabel: fallback,
    hasAction: false,
    canOpen: false,
    isDns: false,
    isCustomApp: false,
    platform: null,
    platformLabel: '',
    platformIcon: null,
    icon: null,
  };
}

/**
 * Opens a member's configured DNS contact link in its respective app
 * (ThatsApp/SimpleX, Briar, Telegram, etc.), falling back to Telegram username.
 */
export function openMemberContact(options?: MemberContactOptions | null): void {
  if (!options) return;
  const cleanLink = options.contactLink?.trim();
  if (cleanLink) {
    const detected = detectSocialPlatform(cleanLink);
    if (detected?.platform === 'telegram' && detected.href) {
      openTelegramLink(detected.href);
      return;
    }
    const targetHref = detected?.href || cleanLink;
    window.open(targetHref, '_blank', 'noopener,noreferrer');
    return;
  }

  if (options.username) {
    openTelegramProfile(options.username);
  }
}
