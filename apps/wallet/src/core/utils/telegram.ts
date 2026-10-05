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

/** True when the input is a plain @handle / username (not a URL, URI scheme, or domain). */
export function isBareTelegramHandle(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^@?[a-zA-Z0-9_]{1,64}$/.test(trimmed);
}

/**
 * Normalizes a FiWallet profile username input:
 * - Bare @handle -> strips leading @ (e.g. "@alice" -> "alice")
 * - .bro domain -> strips leading @/# and lowercases (e.g. "@Alice.bro" -> "alice.bro")
 * - Social/messenger URL or URI (simplex:, briar:, https://x.com/..., etc.) -> preserved trimmed
 */
export function normalizeProfileUsernameInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';
  const cleanBro = trimmed.replace(/^[@#]+/, '').toLowerCase();
  if (
    /^[a-z0-9][a-z0-9-]{0,62}\.bro$/.test(cleanBro) &&
    !trimmed.includes('/') &&
    !trimmed.includes(':')
  ) {
    return cleanBro;
  }
  if (isBareTelegramHandle(trimmed)) {
    return cleanTelegramUsername(trimmed);
  }
  return trimmed;
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
import { toast } from 'sonner';
import {
  detectSocialPlatform,
  resolveBroDomainContact,
  type SocialPlatform,
} from '@/core/lib/dns';
import {
  useContactBookStore,
  normalizeContactAddress,
} from '@/core/storage/useContactBookStore';
import { useDnsStore } from '@/features/dns/store/dns-store';

/**
 * Formats a wallet address as non-bounceable (`0Q...` on testnet), copies it to clipboard,
 * and opens `@tnfaucet_bot` with `?text=<address>` prefilled in the Telegram message input box.
 */
export function openTestnetFaucet(
  walletAddress?: Address | string | null,
  network: string = 'testnet',
): void {
  let formattedAddress = '';
  if (walletAddress) {
    try {
      const addr =
        typeof walletAddress === 'string'
          ? Address.parse(walletAddress.trim())
          : walletAddress;
      formattedAddress = addr.toString({
        urlSafe: true,
        bounceable: false,
        testOnly: network === 'testnet',
      });
    } catch {
      formattedAddress =
        typeof walletAddress === 'string' ? walletAddress.trim() : '';
    }
  }

  if (
    formattedAddress &&
    typeof navigator !== 'undefined' &&
    navigator.clipboard
  ) {
    void navigator.clipboard
      .writeText(formattedAddress)
      .then(() => {
        toast.success('Wallet address copied for faucet');
      })
      .catch(() => {
        /* ignore clipboard errors */
      });
  }

  const url = formattedAddress
    ? `https://t.me/tnfaucet_bot?text=${encodeURIComponent(formattedAddress)}`
    : 'https://t.me/tnfaucet_bot/';
  openTelegramLink(url);
}

/**
 * Opens any detected social or messenger link:
 * - Telegram links open via Telegram SDK / t.me
 * - Custom app schemes (`simplex:/`, `briar://`, `tg://`, `smp://`, `xftp://`)
 *   trigger the native OS intent handler directly (allowing the Android app chooser
 *   between ThatsApp and SimpleX without opening a blank browser tab)
 * - HTTP/HTTPS profile URLs open in a new tab
 */
export function openSocialLink(rawLink: string): void {
  const trimmed = rawLink.trim();
  if (!trimmed) return;
  const detected = detectSocialPlatform(trimmed);
  if (detected?.platform === 'telegram' && detected.href) {
    openTelegramLink(detected.href);
    return;
  }
  const targetHref = detected?.href || trimmed;
  if (/^(simplex|briar|thatsapp|smp|xftp|tg):/i.test(targetHref)) {
    const a = document.createElement('a');
    a.href = targetHref;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  window.open(targetHref, '_blank', 'noopener,noreferrer');
}

/** Open a user's Telegram profile/chat via native Telegram Mini App deeplink or browser. */
export function openTelegramProfile(username: string): void {
  const trimmed = username.trim();
  if (!trimmed) return;
  if (!isBareTelegramHandle(trimmed)) {
    openMemberContact({ username: trimmed });
    return;
  }
  const clean = cleanTelegramUsername(trimmed);
  if (!clean) return;
  const url = getTelegramProfileUrl(clean);
  openTelegramLink(url);
}

export interface MemberContactOptions {
  contactLink?: string | null;
  dnsDomain?: string | null;
  username?: string | null;
  fallbackLabel?: string;
  network?: string;
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

function findCachedDomainContactLink(
  domainName: string,
  network: string = 'testnet',
): string | undefined {
  const clean = domainName
    .trim()
    .toLowerCase()
    .replace(/^[@#]+/, '');
  if (!clean) return undefined;
  const fullBro = clean.endsWith('.bro') ? clean : `${clean}.bro`;
  const base = fullBro.slice(0, -4);

  const nets: ('testnet' | 'mainnet')[] =
    network === 'mainnet' ? ['mainnet', 'testnet'] : ['testnet', 'mainnet'];
  for (const net of nets) {
    const dnsDomains = useDnsStore.getState().domainsByNetwork[net] ?? [];
    for (const d of dnsDomains) {
      const dName = d.name.toLowerCase();
      if (dName === base || dName === fullBro) {
        if (d.contactLink?.trim()) return d.contactLink.trim();
      }
    }
    const contacts =
      useContactBookStore.getState().contactsByNetwork[net] ?? {};
    for (const c of Object.values(contacts)) {
      if (c?.dnsDomain?.toLowerCase() === fullBro && c.contactLink?.trim()) {
        return c.contactLink.trim();
      }
    }
  }
  return undefined;
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
  domainHint?: string | null,
): { dnsDomain?: string; contactLink?: string } {
  const net = network === 'mainnet' ? 'mainnet' : 'testnet';
  const rawSet = new Set<string>();
  for (const a of addresses) {
    if (!a) continue;
    const str = typeof a === 'string' ? a.trim() : a.toString();
    if (!str) continue;
    rawSet.add(normalizeContactAddress(str));
  }

  let dnsDomain: string | undefined;
  let contactLink: string | undefined;

  if (domainHint) {
    const cleanHint = domainHint
      .trim()
      .toLowerCase()
      .replace(/^[@#]+/, '');
    if (cleanHint.endsWith('.bro')) {
      dnsDomain = cleanHint;
      contactLink = findCachedDomainContactLink(cleanHint, net);
    }
  }

  if (rawSet.size === 0) return { dnsDomain, contactLink };

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

  if (dnsDomain && !contactLink) {
    contactLink = findCachedDomainContactLink(dnsDomain, net);
  }

  return { dnsDomain, contactLink };
}

/**
 * Computes display label, platform icon, and action metadata for a FiWallet member.
 * Prioritizes .bro DNS contact / domain when set over profile username, and parses
 * social links, messenger URIs (ThatsApp/SimpleX, Briar), .bro domains, or @handles
 * stored in `profile.username`.
 */
export function getMemberContactDisplay(
  options?: MemberContactOptions | null,
): MemberContactDisplay {
  const opts = options ?? {};
  const cleanDns =
    opts.dnsDomain
      ?.trim()
      .toLowerCase()
      .replace(/^[@#]+/, '') || '';
  const rawUser = opts.username?.trim() || '';
  const userDetected = rawUser ? detectSocialPlatform(rawUser) : null;
  const userIsBro = userDetected?.platform === 'bro';
  const userIsBareTg = isBareTelegramHandle(rawUser);
  const userIsSocialLink = Boolean(rawUser && !userIsBro && !userIsBareTg);

  const effectiveDns =
    cleanDns || (userIsBro ? rawUser.replace(/^[@#]+/, '').toLowerCase() : '');

  const cachedDnsLink =
    !opts.contactLink?.trim() && effectiveDns
      ? findCachedDomainContactLink(effectiveDns, opts.network)
      : undefined;

  const effectiveLink =
    opts.contactLink?.trim() ||
    cachedDnsLink ||
    (userIsSocialLink ? rawUser : '');

  if (effectiveLink || effectiveDns) {
    const detected = effectiveLink ? detectSocialPlatform(effectiveLink) : null;
    const cleanBareUser = userIsBareTg ? cleanTelegramUsername(rawUser) : '';

    const label = effectiveDns
      ? effectiveDns
      : cleanBareUser
        ? `@${cleanBareUser}`
        : detected?.shortLabel ||
          detected?.label ||
          opts.fallbackLabel ||
          '@member';

    const hasLinkAction = Boolean(
      effectiveLink && (detected?.href || effectiveLink),
    );
    const hasDnsAction = Boolean(effectiveDns);
    const hasFallbackTg = !hasLinkAction && Boolean(cleanBareUser);
    const hasAction = hasLinkAction || hasDnsAction || hasFallbackTg;

    const platform: SocialPlatform | null =
      detected?.platform ??
      (hasFallbackTg ? 'telegram' : effectiveDns ? 'bro' : null);
    const platformLabel =
      detected?.label ??
      (hasFallbackTg ? 'Telegram' : effectiveDns ? '.bro Domain' : 'Social');
    const platformIcon = detected?.icon ?? (effectiveDns ? '🌐' : null);
    const isCustomApp = Boolean(platform && platform !== 'telegram');

    const title = hasLinkAction
      ? `Open ${label} on ${detected?.label || 'App'} (${effectiveLink})`
      : hasFallbackTg
        ? `Open @${cleanBareUser} on Telegram`
        : effectiveDns
          ? `Open ${effectiveDns} contact`
          : undefined;

    return {
      label,
      displayLabel: label,
      hasAction,
      canOpen: hasAction,
      isDns: Boolean(effectiveDns),
      isCustomApp,
      platform,
      platformLabel,
      platformIcon,
      icon: platformIcon,
      title,
      actionTitle: title,
    };
  }

  if (userIsBareTg) {
    const cleanUser = cleanTelegramUsername(rawUser);
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
 * Formats a member's username / domain / social link into a clean display label
 * without erroneously prepending `@` to URLs or `.bro` domains.
 */
export function formatProfileUsernameDisplay(
  username?: string | null,
  dnsDomain?: string | null,
  fallback = '',
): string {
  if (!username?.trim() && !dnsDomain?.trim()) return fallback;
  return getMemberContactDisplay({
    username,
    dnsDomain,
    fallbackLabel: fallback,
  }).displayLabel;
}

/**
 * Opens a member's configured DNS contact link or social profile link in its respective app
 * (ThatsApp/SimpleX via `simplex:/`, Briar, Telegram, X, Instagram, GitHub, etc.).
 * If a `.bro` domain is set and its contact record isn't cached yet, resolves it on-chain first.
 */
export function openMemberContact(options?: MemberContactOptions | null): void {
  if (!options) return;
  const cleanDns =
    options.dnsDomain
      ?.trim()
      .toLowerCase()
      .replace(/^[@#]+/, '') || '';
  const rawUser = options.username?.trim() || '';
  const userDetected = rawUser ? detectSocialPlatform(rawUser) : null;
  const userIsBro = userDetected?.platform === 'bro';
  const userIsBareTg = isBareTelegramHandle(rawUser);
  const userIsSocialLink = Boolean(rawUser && !userIsBro && !userIsBareTg);

  const effectiveDns =
    cleanDns || (userIsBro ? rawUser.replace(/^[@#]+/, '').toLowerCase() : '');

  const cachedDnsLink =
    !options.contactLink?.trim() && effectiveDns
      ? findCachedDomainContactLink(effectiveDns, options.network)
      : undefined;

  const effectiveLink =
    options.contactLink?.trim() ||
    cachedDnsLink ||
    (userIsSocialLink ? rawUser : '');

  if (effectiveLink) {
    openSocialLink(effectiveLink);
    return;
  }

  if (effectiveDns) {
    const net: 'mainnet' | 'testnet' =
      options.network === 'mainnet' ? 'mainnet' : 'testnet';
    void resolveBroDomainContact(effectiveDns, net).then((parsed) => {
      const link = parsed?.contactLink?.trim() || parsed?.channelLink?.trim();
      if (link) {
        if (parsed?.walletRecord || parsed?.ownerAddress) {
          useContactBookStore
            .getState()
            .saveDnsDomain(
              (parsed.walletRecord || parsed.ownerAddress)!,
              effectiveDns,
              net,
              link,
            );
        }
        openSocialLink(link);
        return;
      }
      if (userIsBareTg) {
        openTelegramProfile(rawUser);
        return;
      }
      toast.info(
        `No social contact record set on ${effectiveDns}. Opening domain details…`,
      );
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'dns');
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
    return;
  }

  if (rawUser) {
    openTelegramProfile(rawUser);
  }
}
