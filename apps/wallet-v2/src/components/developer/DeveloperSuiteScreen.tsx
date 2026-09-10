import React, { memo, useState, useMemo, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectCurrentAccount } from '../../global/selectors';
import { Address, Cell, fromNano, toNano } from '@ton/core';
import TabList, { TabWithProperties } from '../ui/TabList';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { getTonClient } from '../../lib/brotherhood/ton';
import { openFiTransactionModal } from '../../lib/brotherhood/transactions';

import styles from './DeveloperSuiteScreen.module.scss';

interface StateProps {
  currentAddress?: string;
  isTestnet?: boolean;
}

const TABS: readonly TabWithProperties[] = [
  { id: 0, title: 'Contract Inspector' },
  { id: 1, title: 'Payload Parser' },
  { id: 2, title: 'Raw Caller' },
];

function DeveloperSuiteScreen({ currentAddress, isTestnet }: StateProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Inspector State
  const [inspectAddress, setInspectAddress] = useState<string>('');
  const [inspectLoading, setInspectLoading] = useState<boolean>(false);
  const [contractInfo, setContractInfo] = useState<any>(null);

  // Payload Parser State
  const [payloadHex, setPayloadHex] = useState<string>('');
  const [parsedPayload, setParsedPayload] = useState<any>(null);

  // Raw Caller State
  const [destAddress, setDestAddress] = useState<string>('');
  const [callAmount, setCallAmount] = useState<string>('0.05');
  const [bodyHex, setBodyHex] = useState<string>('');

  const handleInspect = useCallback(async () => {
    if (!inspectAddress) return;
    setInspectLoading(true);
    try {
      const client = getTonClient(isTestnet ? 'testnet' : 'mainnet');
      const targetAddr = Address.parse(inspectAddress);
      const state = await client.getContractState(targetAddr);

      setContractInfo({
        balance: fromNano(state.balance),
        state: state.state,
        codeCell: state.code ? (state.code as Buffer).toString('hex') : null,
        dataCell: state.data ? (state.data as Buffer).toString('hex') : null,
        lastTransaction: state.lastTransaction ? `${state.lastTransaction.lt}:${typeof state.lastTransaction.hash === 'string' ? state.lastTransaction.hash : Buffer.from(state.lastTransaction.hash).toString('hex')}` : null,
      });
    } catch (err: any) {
      setContractInfo({ error: err.message || 'Failed to inspect contract' });
    } finally {
      setInspectLoading(false);
    }
  }, [inspectAddress, isTestnet]);

  const handleParsePayload = useCallback(() => {
    if (!payloadHex) return;
    try {
      const cleaned = payloadHex.replace(/\s+/g, '');
      const cell = Cell.fromBoc(Buffer.from(cleaned, 'hex'))[0];
      const slice = cell.beginParse();
      const op = slice.remainingBits >= 32 ? slice.preloadUint(32) : null;
      const opHex = op !== null ? `0x${op.toString(16).padStart(8, '0')}` : 'N/A';

      setParsedPayload({
        opCode: opHex,
        bits: cell.bits.length,
        refs: cell.refs.length,
        bocLength: cleaned.length / 2,
        hash: cell.hash().toString('hex'),
      });
    } catch (err: any) {
      setParsedPayload({ error: err.message || 'Invalid BoC or Hex string' });
    }
  }, [payloadHex]);

  const handleSendRaw = useCallback(() => {
    if (!destAddress) return;
    try {
      let payloadCell: Cell | undefined;
      if (bodyHex.trim()) {
        payloadCell = Cell.fromBoc(Buffer.from(bodyHex.trim(), 'hex'))[0];
      }

      openFiTransactionModal({
        toAddress: destAddress,
        amount: toNano(callAmount || '0.05'),
        payload: payloadCell,
      });
    } catch (err: any) {
      alert(`Invalid parameters: ${err.message}`);
    }
  }, [destAddress, callAmount, bodyHex]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Developer Suite</h1>
        <span className={styles.badge}>Dev Tools</span>
      </div>

      <TabList
        tabs={TABS}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        className={styles.tabList}
      />

      {activeTab === 0 && (
        <>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Inspect Smart Contract</h2>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Contract Address</label>
              <input
                type="text"
                className={styles.input}
                placeholder="EQ... or 0:..."
                value={inspectAddress}
                onChange={(e) => setInspectAddress((e.target as HTMLInputElement).value.trim())}
              />
            </div>
            <Button isPrimary onClick={handleInspect} disabled={!inspectAddress || inspectLoading}>
              {inspectLoading ? 'Fetching State...' : 'Inspect'}
            </Button>
          </div>

          {inspectLoading ? (
            <div className={styles.loadingWrapper}>
              <Spinner />
            </div>
          ) : contractInfo ? (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>State Result</h2>
              {contractInfo.error ? (
                <div style={{ color: '#ef4444' }}>{contractInfo.error}</div>
              ) : (
                <>
                  <div className={styles.row}>
                    <span className={styles.label}>Balance</span>
                    <span className={styles.value}>{contractInfo.balance} TON</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Account State</span>
                    <span className={styles.value}>{contractInfo.state}</span>
                  </div>
                  {contractInfo.lastTransaction && (
                    <div className={styles.row}>
                      <span className={styles.label}>Last LT</span>
                      <span className={styles.value}>{contractInfo.lastTransaction.slice(0, 16)}...</span>
                    </div>
                  )}
                  {contractInfo.dataCell && (
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Data Cell (Hex BoC)</span>
                      <div className={styles.outputBox}>{contractInfo.dataCell}</div>
                    </div>
                  )}
                  {contractInfo.codeCell && (
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Code Cell (Hex BoC)</span>
                      <div className={styles.outputBox}>{contractInfo.codeCell}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </>
      )}

      {activeTab === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>BoC & Payload Decoder</h2>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Serialized BoC (Hex)</label>
            <textarea
              className={styles.textarea}
              placeholder="Paste hex string of message body / Cell..."
              value={payloadHex}
              onChange={(e) => setPayloadHex((e.target as HTMLTextAreaElement).value.trim())}
            />
          </div>
          <Button isPrimary onClick={handleParsePayload} disabled={!payloadHex}>
            Decode Cell
          </Button>

          {parsedPayload && (
            <div style={{ marginTop: '0.75rem' }}>
              {parsedPayload.error ? (
                <div style={{ color: '#ef4444' }}>{parsedPayload.error}</div>
              ) : (
                <>
                  <div className={styles.row}>
                    <span className={styles.label}>OpCode</span>
                    <span className={styles.value}>{parsedPayload.opCode}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Bits / Refs</span>
                    <span className={styles.value}>{parsedPayload.bits} bits / {parsedPayload.refs} refs</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Hash</span>
                    <span className={styles.value}>{parsedPayload.hash.slice(0, 12)}...{parsedPayload.hash.slice(-8)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Raw Contract Invocation</h2>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Destination Contract</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Contract address..."
              value={destAddress}
              onChange={(e) => setDestAddress((e.target as HTMLInputElement).value.trim())}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Attached Value (TON)</label>
            <input
              type="number"
              step="0.01"
              className={styles.input}
              value={callAmount}
              onChange={(e) => setCallAmount((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Payload BoC (Hex - Optional)</label>
            <textarea
              className={styles.textarea}
              placeholder="b5ee..."
              value={bodyHex}
              onChange={(e) => setBodyHex((e.target as HTMLTextAreaElement).value.trim())}
            />
          </div>

          <Button isPrimary onClick={handleSendRaw} disabled={!destAddress}>
            Prepare & Emulate Transaction
          </Button>
        </div>
      )}
    </div>
  );
}

export default memo(
  withGlobal((global: GlobalState): StateProps => {
    const account = selectCurrentAccount(global);
    return {
      currentAddress: account?.address,
      isTestnet: global.settings.isTestnet,
    };
  })(DeveloperSuiteScreen),
);
