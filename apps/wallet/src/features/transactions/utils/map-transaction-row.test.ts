import { describe, it, expect } from 'bun:test';
import { mapEventToRow } from './map-transaction-row';
import type {
  Event,
  SmartContractExecAction,
  TonTransferAction,
} from '@ton/walletkit';

describe('map-transaction-row', () => {
  const myAddress = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsGvvqqduugbmW3AwgDc';
  const otherAddress = 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N';

  it('prioritizes SmartContractExec over TonTransfer for the same event', () => {
    const tonTransferAction = {
      type: 'TonTransfer',
      id: '0x01' as any,
      status: 'success' as const,
      simplePreview: {
        name: 'Gram Transfer',
        description: 'Transferring 1 GRAM',
        value: '1 GRAM',
        accounts: [
          { address: myAddress, isScam: false, isWallet: true },
          { address: otherAddress, isScam: false, isWallet: false },
        ],
      },
      baseTransactions: ['0x01' as any],
      TonTransfer: {
        sender: { address: myAddress, isScam: false, isWallet: true },
        recipient: { address: otherAddress, isScam: false, isWallet: false },
        amount: 1_000_000_000n,
      },
    } as TonTransferAction;

    const smartContractExecAction = {
      type: 'SmartContractExec',
      id: '0x02' as any,
      status: 'success' as const,
      simplePreview: {
        name: 'Invite Member',
        description: 'ActInvite executed on contract',
        value: '1 GRAM',
        accounts: [
          { address: myAddress, isScam: false, isWallet: true },
          { address: otherAddress, isScam: false, isWallet: false },
        ],
      },
      baseTransactions: ['0x02' as any],
      SmartContractExec: {
        executor: { address: myAddress, isScam: false, isWallet: true },
        contract: { address: otherAddress, isScam: false, isWallet: false },
        tonAttached: 1_000_000_000n,
        operation: '0x00001051', // ActInvite
        payload: '',
      },
    } as SmartContractExecAction;

    const event = {
      eventId: '0x1234' as any,
      account: { address: myAddress, isScam: false, isWallet: true },
      timestamp: 1700000000,
      actions: [tonTransferAction, smartContractExecAction],
      isScam: false,
      lt: 100,
      inProgress: false,
    } as Event;

    const row = mapEventToRow(event, myAddress, 'testnet');
    expect(row).not.toBeNull();
    // Title should be the friendly action name
    expect(row!.title).toBe('Invite Member');
    // Struct name should be ActInvite
    expect(row!.tolkStructName).toBe('ActInvite');
    expect(row!.rawType).toBe('SmartContractExec');
  });

  it('formats pure TonTransfer correctly when no contract opcode is present', () => {
    const tonTransferAction = {
      type: 'TonTransfer',
      id: '0x03' as any,
      status: 'success' as const,
      simplePreview: {
        name: 'Gram Transfer',
        description: 'Transferring 5 GRAM',
        value: '5 GRAM',
        accounts: [
          { address: myAddress, isScam: false, isWallet: true },
          { address: otherAddress, isScam: false, isWallet: true },
        ],
      },
      baseTransactions: ['0x03' as any],
      TonTransfer: {
        sender: { address: myAddress, isScam: false, isWallet: true },
        recipient: { address: otherAddress, isScam: false, isWallet: true },
        amount: 5_000_000_000n,
      },
    } as TonTransferAction;

    const event = {
      eventId: '0x5678' as any,
      account: { address: myAddress, isScam: false, isWallet: true },
      timestamp: 1700000000,
      actions: [tonTransferAction],
      isScam: false,
      lt: 101,
      inProgress: false,
    } as Event;

    const row = mapEventToRow(event, myAddress, 'testnet');
    expect(row).not.toBeNull();
    expect(row!.title).toBe('Sent TON');
    expect(row!.tolkStructName).toBeUndefined();
    expect(row!.amount).toBe('-5 GRAM');
  });

  it('decodes raw fallback transactions when actions array is empty', () => {
    const event = {
      eventId: '0x9abc' as any,
      account: { address: myAddress, isScam: false, isWallet: true },
      timestamp: 1700000000,
      actions: [],
      isScam: false,
      lt: 102,
      inProgress: false,
      transactions: {
        'tx-hash-1': {
          account: myAddress,
          hash: 'tx-hash-1',
          lt: '1000',
          now: 1700000000,
          orig_status: 'active',
          end_status: 'active',
          total_fees: '10000000',
          in_msg: null,
          out_msgs: [
            {
              source: myAddress,
              destination: otherAddress,
              value: '1000000000',
              opcode: '0x00001147', // BuyCredit
              created_lt: '1001',
              fwd_fee: '0',
              ihr_fee: '0',
              import_fee: '0',
            } as any,
          ],
        } as any,
      },
    } as Event;

    const row = mapEventToRow(event, myAddress, 'testnet');
    expect(row).not.toBeNull();
    expect(row!.title).toBe('Buy Credit');
    expect(row!.tolkStructName).toBe('BuyCredit');
  });
});
