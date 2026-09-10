/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Globe,
  RefreshCw,
  Zap,
  ShieldAlert,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCustomApiKey,
  setCustomApiKey,
  getCustomApiUrl,
  setCustomApiUrl,
  getTestnetApiProvider,
  setTestnetApiProvider,
  testToncenterConnection,
  testTonapiConnection,
  type TestnetProvider,
  type PingResult,
} from '@/core/lib/network-api-keys';

export const NetworkApiKeys: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProviderState] = useState<TestnetProvider>(() =>
    getTestnetApiProvider(),
  );

  const [toncenterUrl, setToncenterUrlState] = useState(
    () => getCustomApiUrl('toncenter') || '',
  );
  const [toncenterKey, setToncenterKeyState] = useState(
    () => getCustomApiKey('toncenter', 'testnet') || '',
  );

  const [tonApiUrl, setTonApiUrlState] = useState(
    () => getCustomApiUrl('tonapi') || '',
  );
  const [tonApiKey, setTonApiKeyState] = useState(
    () => getCustomApiKey('tonapi', 'testnet') || '',
  );

  const [showToncenterKey, setShowToncenterKey] = useState(false);
  const [showTonApiKey, setShowTonApiKey] = useState(false);

  const [toncenterPing, setToncenterPing] = useState<PingResult | null>(null);
  const [toncenterTesting, setToncenterTesting] = useState(false);

  const [tonApiPing, setTonApiPing] = useState<PingResult | null>(null);
  const [tonApiTesting, setTonApiTesting] = useState(false);

  const hasToncenterCustom =
    Boolean(toncenterUrl.trim()) || Boolean(toncenterKey.trim());
  const hasTonApiCustom =
    Boolean(tonApiUrl.trim()) || Boolean(tonApiKey.trim());
  const hasAnyCustom = hasToncenterCustom || hasTonApiCustom;

  const handleProviderSelect = (p: TestnetProvider) => {
    setProviderState(p);
    setTestnetApiProvider(p);
    toast.success(
      `Active Testnet RPC set to ${
        p === 'tonapi' ? 'TonAPI' : p === 'orbs' ? 'Orbs' : 'Toncenter'
      }`,
    );
  };

  const handleTestToncenter = async () => {
    setToncenterTesting(true);
    setToncenterPing(null);
    try {
      const res = await testToncenterConnection(toncenterUrl, toncenterKey);
      setToncenterPing(res);
      if (res.ok) {
        toast.success(`Toncenter reachable (${res.latencyMs}ms)`);
      } else {
        toast.error(res.error || res.statusText || 'Toncenter check failed');
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Connection test failed';
      setToncenterPing({ ok: false, error: msg, statusText: msg });
      toast.error(msg);
    } finally {
      setToncenterTesting(false);
    }
  };

  const handleTestTonapi = async () => {
    setTonApiTesting(true);
    setTonApiPing(null);
    try {
      const res = await testTonapiConnection(tonApiUrl, tonApiKey);
      setTonApiPing(res);
      if (res.ok) {
        toast.success(`TonAPI reachable (${res.latencyMs}ms)`);
      } else {
        toast.error(res.error || res.statusText || 'TonAPI check failed');
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Connection test failed';
      setTonApiPing({ ok: false, error: msg, statusText: msg });
      toast.error(msg);
    } finally {
      setTonApiTesting(false);
    }
  };

  const handleSaveSettings = () => {
    setCustomApiUrl('toncenter', 'testnet', toncenterUrl);
    setCustomApiKey('toncenter', 'testnet', toncenterKey);
    setCustomApiUrl('tonapi', 'testnet', tonApiUrl);
    setCustomApiKey('tonapi', 'testnet', tonApiKey);
    setTestnetApiProvider(provider);
    toast.success('Testnet network settings updated and reloaded!');
  };

  const handleResetDefaults = () => {
    setToncenterUrlState('');
    setToncenterKeyState('');
    setTonApiUrlState('');
    setTonApiKeyState('');
    setToncenterPing(null);
    setTonApiPing(null);

    setCustomApiUrl('toncenter', 'testnet', null);
    setCustomApiKey('toncenter', 'testnet', null);
    setCustomApiUrl('tonapi', 'testnet', null);
    setCustomApiKey('tonapi', 'testnet', null);

    setProviderState('toncenter');
    setTestnetApiProvider('toncenter');
    toast.info('Network settings reset to official defaults');
  };

  const renderPingBadge = (ping: PingResult | null, isTesting: boolean) => {
    if (isTesting) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Testing...
        </span>
      );
    }
    if (!ping) return null;
    if (ping.ok) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <Wifi className="w-3 h-3" />
          Connected ({ping.latencyMs}ms)
        </span>
      );
    }
    if (ping.isAuthError) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <ShieldAlert className="w-3 h-3" />
          Invalid API Key
        </span>
      );
    }
    if (ping.isRateLimited) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <ShieldAlert className="w-3 h-3" />
          429 Rate Limited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
        <WifiOff className="w-3 h-3" />
        {ping.error || ping.statusText || 'Offline'}
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-secondary/60 border border-border overflow-hidden transition-all">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <KeyRound className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Testnet Network & API Keys
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                hasAnyCustom
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasAnyCustom ? 'Custom Configured' : 'Official RPC (1 rps)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[11px] font-mono lowercase">{provider}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-3.5 pt-1 space-y-4 border-t border-border/60 text-xs">
          {/* Provider Pill Selector */}
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
              Active Testnet RPC Provider
            </span>
            <div className="grid grid-cols-3 gap-1 bg-background/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => handleProviderSelect('toncenter')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-medium transition-all ${
                  provider === 'toncenter'
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Toncenter</span>
                {provider === 'toncenter' && (
                  <Check className="w-3 h-3 text-blue-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleProviderSelect('tonapi')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-medium transition-all ${
                  provider === 'tonapi'
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>TonAPI</span>
                {provider === 'tonapi' && (
                  <Check className="w-3 h-3 text-blue-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleProviderSelect('orbs')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-medium transition-all ${
                  provider === 'orbs'
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Orbs</span>
                {provider === 'orbs' && (
                  <Check className="w-3 h-3 text-blue-500" />
                )}
              </button>
            </div>
          </div>

          {/* Toncenter Section */}
          <div className="p-3 bg-background/40 border border-border/70 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Toncenter (JSON-RPC)</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  hasToncenterCustom
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {hasToncenterCustom ? '10 req/s' : '1 req/s'}
              </span>
            </div>

            {/* Custom Toncenter URL */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">
                Custom Endpoint URL
              </span>
              <input
                type="text"
                value={toncenterUrl}
                onChange={(e) => setToncenterUrlState(e.target.value)}
                placeholder="https://testnet.toncenter.com/api/v2/jsonRPC"
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Toncenter Key */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">
                API Key
              </span>
              <div className="relative flex items-center">
                <input
                  type={showToncenterKey ? 'text' : 'password'}
                  value={toncenterKey}
                  onChange={(e) => setToncenterKeyState(e.target.value)}
                  placeholder="Enter Toncenter API Key..."
                  className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono pr-8 placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToncenterKey(!showToncenterKey)}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                  title={showToncenterKey ? 'Hide key' : 'Show key'}
                >
                  {showToncenterKey ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Ping result */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={toncenterTesting}
                onClick={handleTestToncenter}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary hover:bg-muted border border-border rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Test Connection</span>
              </button>
              {renderPingBadge(toncenterPing, toncenterTesting)}
            </div>
          </div>

          {/* TonAPI Section */}
          <div className="p-3 bg-background/40 border border-border/70 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>TonAPI (REST)</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  hasTonApiCustom
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {hasTonApiCustom ? '10 req/s' : '1 req/s'}
              </span>
            </div>

            {/* Custom TonAPI URL */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">
                Custom Base URL
              </span>
              <input
                type="text"
                value={tonApiUrl}
                onChange={(e) => setTonApiUrlState(e.target.value)}
                placeholder="https://testnet.tonapi.io"
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* TonAPI Key */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">
                API Key (Bearer)
              </span>
              <div className="relative flex items-center">
                <input
                  type={showTonApiKey ? 'text' : 'password'}
                  value={tonApiKey}
                  onChange={(e) => setTonApiKeyState(e.target.value)}
                  placeholder="Enter TonAPI Bearer Token..."
                  className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono pr-8 placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowTonApiKey(!showTonApiKey)}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                  title={showTonApiKey ? 'Hide key' : 'Show key'}
                >
                  {showTonApiKey ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Ping result */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={tonApiTesting}
                onClick={handleTestTonapi}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary hover:bg-muted border border-border rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Test Connection</span>
              </button>
              {renderPingBadge(tonApiPing, tonApiTesting)}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Personal keys and custom/local endpoints run on isolated 10 req/s
            queues. Unkeyed public endpoints operate under a safe 1 req/s rate
            limit.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
