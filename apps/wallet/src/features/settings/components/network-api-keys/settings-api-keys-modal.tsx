/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Globe,
  RefreshCw,
  Zap,
  ShieldAlert,
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';
import {
  getCustomApiKey,
  setCustomApiKey,
  getCustomApiUrl,
  setCustomApiUrl,
  getTestnetRpcRouting,
  setTestnetRpcRouting,
  isCustomEndpointActive,
  setCustomEndpointActive,
  testToncenterConnection,
  testTonapiConnection,
  type RpcRoutingMode,
  type PingResult,
} from '@/core/lib/network-api-keys';

interface SettingsApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsApiKeysModal: React.FC<SettingsApiKeysModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [routingMode, setRoutingMode] = useState<RpcRoutingMode>(() =>
    getTestnetRpcRouting(),
  );

  const [isCustomToncenter, setIsCustomToncenter] = useState(() =>
    isCustomEndpointActive('toncenter'),
  );
  const [toncenterUrl, setToncenterUrl] = useState(
    () => getCustomApiUrl('toncenter') || '',
  );
  const [toncenterKey, setToncenterKey] = useState(
    () => getCustomApiKey('toncenter', 'testnet') || '',
  );

  const [isCustomTonapi, setIsCustomTonapi] = useState(() =>
    isCustomEndpointActive('tonapi'),
  );
  const [tonapiUrl, setTonapiUrl] = useState(
    () => getCustomApiUrl('tonapi') || '',
  );
  const [tonapiKey, setTonapiKey] = useState(
    () => getCustomApiKey('tonapi', 'testnet') || '',
  );

  const [showToncenterKey, setShowToncenterKey] = useState(false);
  const [showTonApiKey, setShowTonApiKey] = useState(false);

  const [toncenterPing, setToncenterPing] = useState<PingResult | null>(null);
  const [isTestingToncenter, setIsTestingToncenter] = useState(false);

  const [tonapiPing, setTonapiPing] = useState<PingResult | null>(null);
  const [isTestingTonapi, setIsTestingTonapi] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setRoutingMode(getTestnetRpcRouting());
      setIsCustomToncenter(isCustomEndpointActive('toncenter'));
      setToncenterUrl(getCustomApiUrl('toncenter') || '');
      setToncenterKey(getCustomApiKey('toncenter', 'testnet') || '');
      setIsCustomTonapi(isCustomEndpointActive('tonapi'));
      setTonapiUrl(getCustomApiUrl('tonapi') || '');
      setTonapiKey(getCustomApiKey('tonapi', 'testnet') || '');
      setToncenterPing(null);
      setTonapiPing(null);
    }
  }, [isOpen]);

  const handleTestToncenter = async () => {
    setIsTestingToncenter(true);
    setToncenterPing(null);
    try {
      const targetUrl =
        isCustomToncenter && toncenterUrl.trim()
          ? toncenterUrl.trim()
          : undefined;
      const res = await testToncenterConnection(targetUrl, toncenterKey);
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
      setIsTestingToncenter(false);
    }
  };

  const handleTestTonapi = async () => {
    setIsTestingTonapi(true);
    setTonapiPing(null);
    try {
      const targetUrl =
        isCustomTonapi && tonapiUrl.trim() ? tonapiUrl.trim() : undefined;
      const res = await testTonapiConnection(targetUrl, tonapiKey);
      setTonapiPing(res);
      if (res.ok) {
        toast.success(`TonAPI reachable (${res.latencyMs}ms)`);
      } else {
        toast.error(res.error || res.statusText || 'TonAPI check failed');
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Connection test failed';
      setTonapiPing({ ok: false, error: msg, statusText: msg });
      toast.error(msg);
    } finally {
      setIsTestingTonapi(false);
    }
  };

  const handleTestAll = async () => {
    await Promise.all([handleTestToncenter(), handleTestTonapi()]);
  };

  const handleSave = () => {
    setTestnetRpcRouting(routingMode);

    setCustomEndpointActive('toncenter', isCustomToncenter);
    setCustomApiUrl(
      'toncenter',
      'testnet',
      isCustomToncenter ? toncenterUrl : null,
    );
    setCustomApiKey('toncenter', 'testnet', toncenterKey);

    setCustomEndpointActive('tonapi', isCustomTonapi);
    setCustomApiUrl('tonapi', 'testnet', isCustomTonapi ? tonapiUrl : null);
    setCustomApiKey('tonapi', 'testnet', tonapiKey);

    toast.success('Network & API Key settings saved!');
    onClose();
  };

  const handleResetDefaults = () => {
    setRoutingMode('direct');
    setIsCustomToncenter(false);
    setToncenterUrl('');
    setToncenterKey('');
    setIsCustomTonapi(false);
    setTonapiUrl('');
    setTonapiKey('');
    setToncenterPing(null);
    setTonapiPing(null);

    setTestnetRpcRouting('direct');
    setCustomEndpointActive('toncenter', false);
    setCustomApiUrl('toncenter', 'testnet', null);
    setCustomApiKey('toncenter', 'testnet', null);
    setCustomEndpointActive('tonapi', false);
    setCustomApiUrl('tonapi', 'testnet', null);
    setCustomApiKey('tonapi', 'testnet', null);

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

  const hasToncenterBoost =
    (isCustomToncenter && Boolean(toncenterUrl.trim())) ||
    Boolean(toncenterKey.trim());
  const hasTonapiBoost =
    (isCustomTonapi && Boolean(tonapiUrl.trim())) || Boolean(tonapiKey.trim());

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title>Network & API Providers</Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-4 text-xs pb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Configure direct official RPCs, decentralized Orbs network access, or
          custom self-hosted endpoints for TON testnet.
        </p>

        {/* RPC Routing Mode Selector */}
        <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              RPC Routing Mode
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                routingMode === 'orbs'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}
            >
              {routingMode === 'orbs' ? 'Orbs Access' : 'Direct RPC'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-background/70 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setRoutingMode('direct')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                routingMode === 'direct'
                  ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct RPC</span>
            </button>
            <button
              type="button"
              onClick={() => setRoutingMode('orbs')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                routingMode === 'orbs'
                  ? 'bg-card text-foreground shadow-sm font-semibold border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Orbs Network</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {routingMode === 'orbs'
              ? 'Toncenter JSON-RPC calls are routed through decentralized Orbs validator nodes. TonAPI handles index queries.'
              : 'Calls connect directly to Toncenter & TonAPI nodes (1 req/s default, 10 req/s with key or custom endpoint).'}
          </p>
        </div>

        {/* Toncenter Provider Card */}
        <div className="p-3.5 bg-secondary/60 border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                Toncenter RPC
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  routingMode === 'orbs'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : isCustomToncenter
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {routingMode === 'orbs'
                  ? 'Orbs'
                  : isCustomToncenter
                    ? 'Custom'
                    : 'Direct'}
              </span>
            </div>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                hasToncenterBoost
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasToncenterBoost ? '10 req/s' : '1 req/s'}
            </span>
          </div>

          {/* Custom Endpoint Toggle Switch */}
          <div className="flex items-center justify-between py-1 border-t border-border/40">
            <div>
              <span className="text-xs font-medium text-foreground block">
                Custom Endpoint
              </span>
              <span className="text-[11px] text-muted-foreground">
                Connect to local or self-hosted RPC node
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isCustomToncenter}
                onChange={(e) => setIsCustomToncenter(e.target.checked)}
              />
              <div className="w-9 h-5 bg-muted border border-border/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>

          {/* Custom URL Input (shown when switch is enabled) */}
          {isCustomToncenter && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Toncenter Base URL
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setToncenterUrl('https://testnet.toncenter.com')
                    }
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Use Default
                  </button>
                  {Boolean(toncenterUrl) && (
                    <button
                      type="button"
                      onClick={() => setToncenterUrl('')}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={toncenterUrl}
                onChange={(e) => setToncenterUrl(e.target.value)}
                placeholder="https://testnet.toncenter.com"
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground block">
              Toncenter API Key (Optional)
            </span>
            <div className="relative flex items-center">
              <input
                type={showToncenterKey ? 'text' : 'password'}
                value={toncenterKey}
                onChange={(e) => setToncenterKey(e.target.value)}
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

          {/* Test Connection Button & Ping Status */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={isTestingToncenter}
              onClick={handleTestToncenter}
              className="flex items-center gap-1.5 px-3 py-1 bg-secondary hover:bg-muted border border-border rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Test Toncenter</span>
            </button>
            {renderPingBadge(toncenterPing, isTestingToncenter)}
          </div>
        </div>

        {/* TonAPI Provider Card */}
        <div className="p-3.5 bg-secondary/60 border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                TonAPI Indexer
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  isCustomTonapi
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isCustomTonapi ? 'Custom' : 'Direct'}
              </span>
            </div>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                hasTonapiBoost
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasTonapiBoost ? '10 req/s' : '1 req/s'}
            </span>
          </div>

          {/* Custom Endpoint Toggle Switch */}
          <div className="flex items-center justify-between py-1 border-t border-border/40">
            <div>
              <span className="text-xs font-medium text-foreground block">
                Custom Endpoint
              </span>
              <span className="text-[11px] text-muted-foreground">
                Connect to local or self-hosted OpenTonAPI
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isCustomTonapi}
                onChange={(e) => setIsCustomTonapi(e.target.checked)}
              />
              <div className="w-9 h-5 bg-muted border border-border/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>

          {/* Custom URL Input (shown when switch is enabled) */}
          {isCustomTonapi && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  TonAPI Base URL
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTonapiUrl('https://testnet.tonapi.io')}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Use Default
                  </button>
                  {Boolean(tonapiUrl) && (
                    <button
                      type="button"
                      onClick={() => setTonapiUrl('')}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={tonapiUrl}
                onChange={(e) => setTonapiUrl(e.target.value)}
                placeholder="https://testnet.tonapi.io"
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Bearer Key Input */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground block">
              TonAPI Bearer Key (Optional)
            </span>
            <div className="relative flex items-center">
              <input
                type={showTonApiKey ? 'text' : 'password'}
                value={tonapiKey}
                onChange={(e) => setTonapiKey(e.target.value)}
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

          {/* Test Connection Button & Ping Status */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={isTestingTonapi}
              onClick={handleTestTonapi}
              className="flex items-center gap-1.5 px-3 py-1 bg-secondary hover:bg-muted border border-border rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Test TonAPI</span>
            </button>
            {renderPingBadge(tonapiPing, isTestingTonapi)}
          </div>
        </div>

        {/* Test All Connections Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="gray"
            disabled={isTestingToncenter || isTestingTonapi}
            onClick={handleTestAll}
            className="w-full text-xs font-medium py-2 rounded-xl"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                isTestingToncenter || isTestingTonapi ? 'animate-spin' : ''
              }`}
            />
            <span>Test All Connections</span>
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <Button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl"
          >
            Save Settings
          </Button>
        </div>
      </Modal.Body>
    </Modal.Container>
  );
};
