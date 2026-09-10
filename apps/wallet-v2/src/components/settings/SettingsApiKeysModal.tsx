import React, { memo, useEffect, useState } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { GlobalState } from '../../global/types';

import useLang from '../../hooks/useLang';
import useLastCallback from '../../hooks/useLastCallback';
import { resetTonClients } from '../../lib/brotherhood/ton';
import buildClassName from '../../util/buildClassName';
import { resetCircuitBreakers } from '../../util/fetch';
import { resetThrottledProviderFetchers } from '../../util/ThrottledFetcher';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Switcher from '../ui/Switcher';

import styles from './SettingsApiKeysModal.module.scss';

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

type StateProps = {
  isDirectTestnetApi?: boolean;
  customToncenterTestnetKey?: string;
  customTonapiTestnetKey?: string;
  customToncenterTestnetUrl?: string;
  customTonapiTestnetUrl?: string;
};

type PingResult = {
  ok: boolean;
  latencyMs?: number;
  statusText?: string;
  error?: string;
  isRateLimited?: boolean;
  isAuthError?: boolean;
};

function SettingsApiKeysModal({
  isOpen,
  onClose,
  isDirectTestnetApi: initialIsDirect,
  customToncenterTestnetKey: initialToncenterKey = '',
  customTonapiTestnetKey: initialTonapiKey = '',
  customToncenterTestnetUrl: initialToncenterUrl = '',
  customTonapiTestnetUrl: initialTonapiUrl = '',
}: OwnProps & StateProps) {
  const lang = useLang();
  const { setTestnetApiSettings, showToast } = getActions();

  const [isDirect, setIsDirect] = useState(Boolean(initialIsDirect));
  const [toncenterUrl, setToncenterUrl] = useState(initialToncenterUrl || '');
  const [toncenterKey, setToncenterKey] = useState(initialToncenterKey || '');
  const [tonapiUrl, setTonapiUrl] = useState(initialTonapiUrl || '');
  const [tonapiKey, setTonapiKey] = useState(initialTonapiKey || '');

  const [isTestingToncenter, setIsTestingToncenter] = useState(false);
  const [isTestingTonapi, setIsTestingTonapi] = useState(false);
  const [toncenterResult, setToncenterResult] = useState<PingResult | undefined>();
  const [tonapiResult, setTonapiResult] = useState<PingResult | undefined>();

  const defaultToncenterUrl = isDirect
    ? 'https://testnet.toncenter.com'
    : '/toncenter-testnet-proxy';

  const defaultTonapiUrl = isDirect
    ? 'https://testnet.tonapi.io'
    : '/tonapiio-testnet-proxy';

  const isToncenterVerified = Boolean(
    toncenterResult?.ok
    || (Boolean(toncenterKey.trim() || toncenterUrl.trim()) && toncenterResult === undefined && Boolean(initialToncenterKey.trim() || initialToncenterUrl.trim())),
  );

  const isTonapiVerified = Boolean(
    tonapiResult?.ok
    || (Boolean(tonapiKey.trim() || tonapiUrl.trim()) && tonapiResult === undefined && Boolean(initialTonapiKey.trim() || initialTonapiUrl.trim())),
  );

  const canEnableDirect = isToncenterVerified || isTonapiVerified;

  useEffect(() => {
    if (isOpen) {
      setIsDirect(Boolean(initialIsDirect));
      setToncenterUrl(initialToncenterUrl || '');
      setToncenterKey(initialToncenterKey || '');
      setTonapiUrl(initialTonapiUrl || '');
      setTonapiKey(initialTonapiKey || '');
      setToncenterResult(undefined);
      setTonapiResult(undefined);
    }
  }, [isOpen, initialIsDirect, initialToncenterKey, initialTonapiKey, initialToncenterUrl, initialTonapiUrl]);

  const handleToggleDirect = useLastCallback((checked: boolean) => {
    if (checked && !canEnableDirect) {
      showToast({
        message: lang('Please test and verify at least one API key/URL successfully before enabling direct calls.')
          || 'Please test and verify at least one API key/URL successfully before enabling direct calls.',
      });
      return;
    }
    setIsDirect(checked);
  });

  const testToncenterKey = useLastCallback(async () => {
    setIsTestingToncenter(true);
    setToncenterResult(undefined);

    const baseUrl = toncenterUrl.trim() || defaultToncenterUrl;
    const key = toncenterKey.trim();
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key) {
        headers['X-Api-Key'] = key;
      }

      const url = `${baseUrl.replace(/\/+$/, '')}/api/v2/getMasterchainInfo`;

      const res = await fetch(url, {
        method: 'GET',
        headers,
      });

      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        setToncenterResult({ ok: true, latencyMs, statusText: 'Connected' });
      } else if (res.status === 401 || res.status === 403) {
        setToncenterResult({
          ok: false,
          isAuthError: true,
          error: `Invalid API Key (HTTP ${res.status})`,
        });
      } else if (res.status === 429) {
        setToncenterResult({
          ok: false,
          isRateLimited: true,
          error: 'Rate Limited (HTTP 429) - 1 req/sec limit',
        });
      } else {
        setToncenterResult({ ok: false, error: `HTTP ${res.status}: ${res.statusText || 'Error'}` });
      }
    } catch (e: any) {
      setToncenterResult({ ok: false, error: e?.message || 'Connection failed' });
    } finally {
      setIsTestingToncenter(false);
    }
  });

  const testTonapiKey = useLastCallback(async () => {
    setIsTestingTonapi(true);
    setTonapiResult(undefined);

    const baseUrl = tonapiUrl.trim() || defaultTonapiUrl;
    const key = tonapiKey.trim();
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key) {
        headers['Authorization'] = `Bearer ${key}`;
      }

      const url = `${baseUrl.replace(/\/+$/, '')}/v2/rates?tokens=ton&currencies=usd`;

      const res = await fetch(url, {
        method: 'GET',
        headers,
      });

      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        setTonapiResult({ ok: true, latencyMs, statusText: 'Connected' });
      } else if (res.status === 401 || res.status === 403) {
        setTonapiResult({
          ok: false,
          isAuthError: true,
          error: `Invalid Bearer Token (HTTP ${res.status})`,
        });
      } else if (res.status === 429) {
        setTonapiResult({
          ok: false,
          isRateLimited: true,
          error: 'Rate Limited (HTTP 429)',
        });
      } else {
        setTonapiResult({ ok: false, error: `HTTP ${res.status}: ${res.statusText || 'Error'}` });
      }
    } catch (e: any) {
      setTonapiResult({ ok: false, error: e?.message || 'Connection failed' });
    } finally {
      setIsTestingTonapi(false);
    }
  });

  const handleTestAll = useLastCallback(async () => {
    await Promise.all([testToncenterKey(), testTonapiKey()]);
  });

  const handleSave = useLastCallback(() => {
    setTestnetApiSettings({
      isDirectTestnetApi: isDirect && canEnableDirect,
      customToncenterTestnetUrl: toncenterUrl.trim() || undefined,
      customToncenterTestnetKey: toncenterKey.trim() || undefined,
      customTonapiTestnetUrl: tonapiUrl.trim() || undefined,
      customTonapiTestnetKey: tonapiKey.trim() || undefined,
    });
    resetTonClients();
    resetThrottledProviderFetchers();
    resetCircuitBreakers();
    showToast({ message: lang('Settings saved') || 'Settings saved' });
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCompact
      title={lang('Network & API Providers') || 'Network & API Providers'}
    >
      <div className={styles.container}>
        <p className={styles.description}>
          {lang('Configure custom self-hosted RPC endpoints, direct connections, and API keys for TON testnet.')
            || 'Configure custom self-hosted RPC endpoints, direct connections, and API keys for TON testnet.'}
        </p>

        <div className={styles.switchRow} onClick={() => handleToggleDirect(!isDirect)}>
          <div className={styles.switchLabel}>
            <span className={styles.switchTitle}>{lang('Direct Testnet Calls') || 'Direct Testnet Calls'}</span>
            <span className={styles.switchSubtitle}>
              {isDirect
                ? (lang('Calls go directly for verified providers (1 req/sec without API key)')
                  || 'Calls go directly for verified providers (1 req/sec without API key)')
                : (lang('Calls go through proxy middleware with MyTonWallet spoof')
                  || 'Calls go through proxy middleware with MyTonWallet spoof')}
            </span>
          </div>
          <Switcher
            checked={isDirect}
            onCheck={handleToggleDirect}
            shouldStopPropagation
          />
        </div>

        <div className={styles.inputsGroup}>
          {/* Toncenter Provider Card */}
          <div className={styles.providerSection}>
            <div className={styles.providerHeader}>
              <div className={styles.providerTitleGroup}>
                <span className={styles.providerTitle}>Toncenter RPC</span>
                {isDirect ? (
                  isToncenterVerified ? (
                    <span className={buildClassName(styles.routeBadge, styles.routeBadgeDirect)}>Direct</span>
                  ) : (
                    <span className={buildClassName(styles.routeBadge, styles.routeBadgeProxy)}>Proxy Fallback</span>
                  )
                ) : (
                  <span className={styles.routeBadge}>Proxy</span>
                )}
              </div>
              <div className={styles.providerHeaderActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setToncenterUrl('https://testnet.toncenter.com')}
                >
                  {lang('Use Default') || 'Use Default'}
                </button>
                {Boolean(toncenterUrl) && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => setToncenterUrl('')}
                  >
                    {lang('Reset') || 'Reset'}
                  </button>
                )}
              </div>
            </div>
            <Input
              label="Toncenter Base URL"
              placeholder={defaultToncenterUrl}
              value={toncenterUrl}
              onInput={setToncenterUrl}
            />
            <Input
              label="Toncenter API Key (Optional)"
              placeholder="Enter Toncenter API Key"
              value={toncenterKey}
              onInput={setToncenterKey}
            />
            <Button
              isSecondary
              className={styles.testBtn}
              isLoading={isTestingToncenter}
              onClick={testToncenterKey}
            >
              {lang('Test Toncenter') || 'Test Toncenter'}
            </Button>
            {toncenterResult && (
              <div className={styles.fieldStatus}>
                <span>Status:</span>
                {toncenterResult.ok ? (
                  <span className={styles.testSuccess}>
                    ✓ {toncenterResult.statusText} ({toncenterResult.latencyMs}ms)
                  </span>
                ) : toncenterResult.isRateLimited ? (
                  <span className={styles.testWarn}>
                    ⚠ {toncenterResult.error}
                  </span>
                ) : (
                  <span className={styles.testFail}>
                    ✗ {toncenterResult.error}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* TonAPI Provider Card */}
          <div className={styles.providerSection}>
            <div className={styles.providerHeader}>
              <div className={styles.providerTitleGroup}>
                <span className={styles.providerTitle}>TonAPI Indexer</span>
                {isDirect ? (
                  isTonapiVerified ? (
                    <span className={buildClassName(styles.routeBadge, styles.routeBadgeDirect)}>Direct</span>
                  ) : (
                    <span className={buildClassName(styles.routeBadge, styles.routeBadgeProxy)}>Proxy Fallback</span>
                  )
                ) : (
                  <span className={styles.routeBadge}>Proxy</span>
                )}
              </div>
              <div className={styles.providerHeaderActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setTonapiUrl('https://testnet.tonapi.io')}
                >
                  {lang('Use Default') || 'Use Default'}
                </button>
                {Boolean(tonapiUrl) && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => setTonapiUrl('')}
                  >
                    {lang('Reset') || 'Reset'}
                  </button>
                )}
              </div>
            </div>
            <Input
              label="TonAPI Base URL"
              placeholder={defaultTonapiUrl}
              value={tonapiUrl}
              onInput={setTonapiUrl}
            />
            <Input
              label="TonAPI Bearer Key (Optional)"
              placeholder="Enter TonAPI Bearer Key"
              value={tonapiKey}
              onInput={setTonapiKey}
            />
            <Button
              isSecondary
              className={styles.testBtn}
              isLoading={isTestingTonapi}
              onClick={testTonapiKey}
            >
              {lang('Test TonAPI') || 'Test TonAPI'}
            </Button>
            {tonapiResult && (
              <div className={styles.fieldStatus}>
                <span>Status:</span>
                {tonapiResult.ok ? (
                  <span className={styles.testSuccess}>
                    ✓ {tonapiResult.statusText} ({tonapiResult.latencyMs}ms)
                  </span>
                ) : tonapiResult.isRateLimited ? (
                  <span className={styles.testWarn}>
                    ⚠ {tonapiResult.error}
                  </span>
                ) : (
                  <span className={styles.testFail}>
                    ✗ {tonapiResult.error}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.testSection}>
          <Button
            isSecondary
            isSmall
            isLoading={isTestingToncenter || isTestingTonapi}
            onClick={handleTestAll}
          >
            {lang('Test All Connections') || 'Test All Connections'}
          </Button>
        </div>

        <div className={styles.actions}>
          <Button isPrimary onClick={handleSave}>
            {lang('Save') || 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default memo(
  withGlobal((global: GlobalState): StateProps => {
    return {
      isDirectTestnetApi: global.settings.isDirectTestnetApi,
      customToncenterTestnetKey: global.settings.customToncenterTestnetKey,
      customTonapiTestnetKey: global.settings.customTonapiTestnetKey,
      customToncenterTestnetUrl: global.settings.customToncenterTestnetUrl,
      customTonapiTestnetUrl: global.settings.customTonapiTestnetUrl,
    };
  })(SettingsApiKeysModal),
);
