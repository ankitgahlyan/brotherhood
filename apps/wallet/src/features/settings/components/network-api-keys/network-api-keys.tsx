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
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCustomApiKey,
  setCustomApiKey,
  getTestnetApiProvider,
  setTestnetApiProvider,
  type TestnetProvider,
} from '@/core/lib/network-api-keys';

export const NetworkApiKeys: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProviderState] = useState<TestnetProvider>(() =>
    getTestnetApiProvider(),
  );

  const [toncenterKey, setToncenterKeyState] = useState(
    () => getCustomApiKey('toncenter', 'testnet') || '',
  );
  const [tonApiKey, setTonApiKeyState] = useState(
    () => getCustomApiKey('tonapi', 'testnet') || '',
  );

  const [showToncenterKey, setShowToncenterKey] = useState(false);
  const [showTonApiKey, setShowTonApiKey] = useState(false);

  const hasCustomToncenter = Boolean(toncenterKey.trim());
  const hasCustomTonApi = Boolean(tonApiKey.trim());
  const hasAnyCustom = hasCustomToncenter || hasCustomTonApi;

  const handleProviderSelect = (p: TestnetProvider) => {
    setProviderState(p);
    setTestnetApiProvider(p);
    toast.success(
      `Active Testnet RPC set to ${p === 'tonapi' ? 'TonAPI' : 'Toncenter'}`,
    );
  };

  const handleSaveKeys = () => {
    setCustomApiKey('toncenter', 'testnet', toncenterKey);
    setCustomApiKey('tonapi', 'testnet', tonApiKey);
    toast.success('Testnet API keys updated and reloaded!');
  };

  const handleResetDefaults = () => {
    setToncenterKeyState('');
    setTonApiKeyState('');
    setCustomApiKey('toncenter', 'testnet', null);
    setCustomApiKey('tonapi', 'testnet', null);
    setProviderState('toncenter');
    setTestnetApiProvider('toncenter');
    toast.info('API keys reset to defaults');
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
              Testnet API Keys
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                hasAnyCustom
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasAnyCustom ? 'Custom Active' : 'Default (1 rps)'}
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
        <div className="px-4 pb-3.5 pt-1 space-y-3 border-t border-border/60 text-xs">
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

          {/* Toncenter Key Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">
                Toncenter Testnet Key
              </span>
              <span className="text-muted-foreground text-[10px]">
                {hasCustomToncenter ? 'Custom key' : 'Default key'}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showToncenterKey ? 'text' : 'password'}
                value={toncenterKey}
                onChange={(e) => setToncenterKeyState(e.target.value)}
                placeholder="Enter Toncenter API Key..."
                className="w-full bg-background/80 border border-border rounded-lg px-3 py-1.5 text-xs font-mono pr-8 placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500"
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

          {/* TonAPI Key Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">
                TonAPI Testnet Key
              </span>
              <span className="text-muted-foreground text-[10px]">
                {hasCustomTonApi ? 'Custom key' : 'Default key'}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showTonApiKey ? 'text' : 'password'}
                value={tonApiKey}
                onChange={(e) => setTonApiKeyState(e.target.value)}
                placeholder="Enter TonAPI Bearer Key..."
                className="w-full bg-background/80 border border-border rounded-lg px-3 py-1.5 text-xs font-mono pr-8 placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500"
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

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Personal API keys grant an isolated 10 req/s rate limit, avoiding
            public shared-IP limits.
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
              onClick={handleSaveKeys}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Keys
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
