import React, { memo, useEffect, useState } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { GlobalState } from '../../global/types';

import useLang from '../../hooks/useLang';
import useLastCallback from '../../hooks/useLastCallback';

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
};

type TestStatus = 'idle' | 'testing' | 'done';
type PingResult = { ok: boolean; latencyMs?: number; error?: string };

function SettingsApiKeysModal({
  isOpen,
  onClose,
  isDirectTestnetApi: initialIsDirect,
  customToncenterTestnetKey: initialToncenterKey = '',
  customTonapiTestnetKey: initialTonapiKey = '',
}: OwnProps & StateProps) {
  const lang = useLang();
  const { setTestnetApiSettings, showToast } = getActions();

  const [isDirect, setIsDirect] = useState(Boolean(initialIsDirect));
  const [toncenterKey, setToncenterKey] = useState(initialToncenterKey || '');
  const [tonapiKey, setTonapiKey] = useState(initialTonapiKey || '');

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [toncenterResult, setToncenterResult] = useState<PingResult | undefined>();
  const [tonapiResult, setTonapiResult] = useState<PingResult | undefined>();

  useEffect(() => {
    if (isOpen) {
      setIsDirect(Boolean(initialIsDirect));
      setToncenterKey(initialToncenterKey || '');
      setTonapiKey(initialTonapiKey || '');
      setTestStatus('idle');
      setToncenterResult(undefined);
      setTonapiResult(undefined);
    }
  }, [isOpen, initialIsDirect, initialToncenterKey, initialTonapiKey]);

  const handleToggleDirect = useLastCallback((checked: boolean) => {
    setIsDirect(checked);
  });

  const handleTestConnection = useLastCallback(async () => {
    setTestStatus('testing');
    setToncenterResult(undefined);
    setTonapiResult(undefined);

    // Test Toncenter Testnet
    const toncenterStart = Date.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (toncenterKey.trim()) {
        headers['X-Api-Key'] = toncenterKey.trim();
      }
      const res = await fetch('https://testnet.toncenter.com/api/v3/transactions?limit=1', {
        method: 'GET',
        headers,
      });
      const latency = Date.now() - toncenterStart;
      if (res.ok) {
        setToncenterResult({ ok: true, latencyMs: latency });
      } else {
        setToncenterResult({ ok: false, error: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      setToncenterResult({ ok: false, error: e?.message || 'Connection failed' });
    }

    // Test TonAPI Testnet
    const tonapiStart = Date.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tonapiKey.trim()) {
        headers['Authorization'] = `Bearer ${tonapiKey.trim()}`;
      }
      const res = await fetch('https://testnet.tonapi.io/v2/rates?tokens=ton&currencies=usd', {
        method: 'GET',
        headers,
      });
      const latency = Date.now() - tonapiStart;
      if (res.ok) {
        setTonapiResult({ ok: true, latencyMs: latency });
      } else {
        setTonapiResult({ ok: false, error: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      setTonapiResult({ ok: false, error: e?.message || 'Connection failed' });
    }

    setTestStatus('done');
  });

  const handleSave = useLastCallback(() => {
    setTestnetApiSettings({
      isDirectTestnetApi: isDirect,
      customToncenterTestnetKey: toncenterKey.trim() || undefined,
      customTonapiTestnetKey: tonapiKey.trim() || undefined,
    });
    showToast({ message: lang('Settings saved') || 'Settings saved' });
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCompact
      title={lang('Network & API Keys') || 'Network & API Keys'}
    >
      <div className={styles.container}>
        <p className={styles.description}>
          {lang('Configure direct connection to TON testnet APIs and provide optional personal API keys.')
            || 'Configure direct connection to TON testnet APIs and provide optional personal API keys.'}
        </p>

        <div className={styles.switchRow} onClick={() => handleToggleDirect(!isDirect)}>
          <div className={styles.switchLabel}>
            <span className={styles.switchTitle}>{lang('Direct Testnet Calls') || 'Direct Testnet Calls'}</span>
            <span className={styles.switchSubtitle}>
              {isDirect
                ? (lang('Calls go directly to toncenter.com & tonapi.io (1 req/sec without API key)')
                  || 'Calls go directly to toncenter.com & tonapi.io (1 req/sec without API key)')
                : (lang('Calls go through MyTonWallet proxy')
                  || 'Calls go through MyTonWallet proxy')}
            </span>
          </div>
          <Switcher
            checked={isDirect}
            onCheck={handleToggleDirect}
            shouldStopPropagation
          />
        </div>

        <div className={styles.inputsGroup}>
          <Input
            label="Toncenter Testnet API Key (Optional)"
            placeholder="Enter Toncenter API Key"
            value={toncenterKey}
            onInput={setToncenterKey}
          />
          <Input
            label="TonAPI Testnet API Key (Optional)"
            placeholder="Enter TonAPI Bearer Key"
            value={tonapiKey}
            onInput={setTonapiKey}
          />
        </div>

        <div className={styles.testSection}>
          <Button
            isSecondary
            isSmall
            isLoading={testStatus === 'testing'}
            onClick={handleTestConnection}
          >
            {lang('Test Connection') || 'Test Connection'}
          </Button>

          {testStatus === 'done' && (
            <div className={styles.testResults}>
              <div className={styles.testItem}>
                <span>Toncenter Testnet:</span>
                {toncenterResult?.ok ? (
                  <span className={styles.testSuccess}>
                    {lang('Connected')} ({toncenterResult.latencyMs}ms)
                  </span>
                ) : (
                  <span className={styles.testFail}>
                    {toncenterResult?.error || lang('Failed')}
                  </span>
                )}
              </div>
              <div className={styles.testItem}>
                <span>TonAPI Testnet:</span>
                {tonapiResult?.ok ? (
                  <span className={styles.testSuccess}>
                    {lang('Connected')} ({tonapiResult.latencyMs}ms)
                  </span>
                ) : (
                  <span className={styles.testFail}>
                    {tonapiResult?.error || lang('Failed')}
                  </span>
                )}
              </div>
            </div>
          )}
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
    };
  })(SettingsApiKeysModal),
);
