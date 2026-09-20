import { describe, expect, it } from 'vitest';
import { parseTraceDag } from './traceDag';
import type { ToncenterTraceItem } from '../../types/toncenter/emulation';

describe('traceDag analyzer', () => {
  it('correctly calculates multi-hop execution route, total fees, and sent/received amounts', () => {
    const mockTrace: ToncenterTraceItem = {
      trace_id: 'dGVzdFRyYWNlMQ==',
      start_lt: '1000',
      end_lt: '1050',
      start_utime: 1700000000,
      end_utime: 1700000005,
      external_hash: 'ext123',
      is_incomplete: false,
      mc_seqno_start: '100',
      mc_seqno_end: '101',
      warning: '',
      trace_info: {
        classification_state: 'complete',
        messages: 2,
        pending_messages: 0,
        trace_state: 'complete',
        transactions: 2,
      },
      transactions_order: ['tx1', 'tx2'],
      trace: {
        tx_hash: 'tx1',
        in_msg_hash: 'msg1',
        children: [
          {
            tx_hash: 'tx2',
            in_msg_hash: 'msg2',
            children: [],
          },
        ],
      },
      transactions: {
        tx1: {
          account:
            '0:1111111111111111111111111111111111111111111111111111111111111111',
          hash: 'tx1',
          lt: '1000',
          now: 1700000000,
          mc_block_seqno: 100,
          trace_external_hash: 'ext123',
          prev_trans_hash: null,
          prev_trans_lt: null,
          orig_status: 'active',
          end_status: 'active',
          total_fees: '5000000',
          total_fees_extra_currencies: {},
          description: {
            type: 'ord',
            aborted: false,
            destroyed: false,
            credit_first: false,
            is_tock: false,
            installed: false,
            storage_ph: {
              storage_fees_collected: '0',
              status_change: 'unchanged',
            },
            compute_ph: { success: true, exit_code: 0 },
            action: { success: true, result_code: 0 },
          } as any,
          block_ref: { workchain: 0, shard: '', seqno: 100 },
          in_msg: {
            hash: 'msg1',
            source:
              '0:1111111111111111111111111111111111111111111111111111111111111111',
            destination:
              '0:2222222222222222222222222222222222222222222222222222222222222222',
            value: '1000000000',
            value_extra_currencies: {},
            fwd_fee: '0',
            ihr_fee: '0',
            created_lt: '999',
            created_at: '1700000000',
            opcode: '0x1674b0a0',
            ihr_disabled: true,
            bounce: false,
            bounced: false,
            import_fee: '0',
            message_content: { hash: '', body: '', decoded: null },
            init_state: null,
          },
          out_msgs: [],
          account_state_before: {} as any,
          account_state_after: {} as any,
          emulated: false,
        },
        tx2: {
          account:
            '0:2222222222222222222222222222222222222222222222222222222222222222',
          hash: 'tx2',
          lt: '1050',
          now: 1700000002,
          mc_block_seqno: 101,
          trace_external_hash: 'ext123',
          prev_trans_hash: null,
          prev_trans_lt: null,
          orig_status: 'active',
          end_status: 'active',
          total_fees: '3000000',
          total_fees_extra_currencies: {},
          description: {
            type: 'ord',
            aborted: false,
            destroyed: false,
            credit_first: false,
            is_tock: false,
            installed: false,
            storage_ph: {
              storage_fees_collected: '0',
              status_change: 'unchanged',
            },
            compute_ph: { success: true, exit_code: 0 },
            action: { success: true, result_code: 0 },
          } as any,
          block_ref: { workchain: 0, shard: '', seqno: 101 },
          in_msg: {
            hash: 'msg2',
            source:
              '0:1111111111111111111111111111111111111111111111111111111111111111',
            destination:
              '0:2222222222222222222222222222222222222222222222222222222222222222',
            value: '500000000',
            value_extra_currencies: {},
            fwd_fee: '0',
            ihr_fee: '0',
            created_lt: '1001',
            created_at: '1700000001',
            opcode: '0x00001001',
            ihr_disabled: true,
            bounce: false,
            bounced: false,
            import_fee: '0',
            message_content: { hash: '', body: '', decoded: null },
            init_state: null,
          },
          out_msgs: [],
          account_state_before: {} as any,
          account_state_after: {} as any,
          emulated: false,
        },
      },
    };

    const userWallet =
      '0:1111111111111111111111111111111111111111111111111111111111111111';
    const analysis = parseTraceDag(mockTrace, userWallet);

    expect(analysis.isSuccess).toBe(true);
    expect(analysis.totalNetworkFee).toBe(8000000n);
    expect(analysis.totalSent).toBe(1500000000n);
    expect(analysis.hops).toHaveLength(2);
    expect(analysis.hops[0].depth).toBe(0);
    expect(analysis.hops[0].opCode).toBe('0x1674b0a0');
    expect(analysis.hops[1].depth).toBe(1);
    expect(analysis.hops[1].opCode).toBe('0x00001001');
  });

  it('marks trace as failed if a child hop compute phase fails', () => {
    const mockTrace: ToncenterTraceItem = {
      trace_id: 'failedTrace',
      start_lt: '1000',
      end_lt: '1050',
      start_utime: 1700000000,
      end_utime: 1700000005,
      external_hash: 'ext123',
      is_incomplete: false,
      mc_seqno_start: '100',
      mc_seqno_end: '101',
      warning: '',
      trace_info: {
        classification_state: 'failed',
        messages: 1,
        pending_messages: 0,
        trace_state: 'complete',
        transactions: 1,
      },
      transactions_order: ['txFail'],
      trace: { tx_hash: 'txFail', in_msg_hash: 'msg1', children: [] },
      transactions: {
        txFail: {
          account:
            '0:2222222222222222222222222222222222222222222222222222222222222222',
          hash: 'txFail',
          lt: '1000',
          now: 1700000000,
          mc_block_seqno: 100,
          trace_external_hash: 'ext123',
          prev_trans_hash: null,
          prev_trans_lt: null,
          orig_status: 'active',
          end_status: 'active',
          total_fees: '2000000',
          total_fees_extra_currencies: {},
          description: {
            type: 'ord',
            aborted: false,
            destroyed: false,
            credit_first: false,
            is_tock: false,
            installed: false,
            storage_ph: {
              storage_fees_collected: '0',
              status_change: 'unchanged',
            },
            compute_ph: { success: false, exit_code: 101 },
            action: { success: true, result_code: 0 },
          } as any,
          block_ref: { workchain: 0, shard: '', seqno: 100 },
          in_msg: null,
          out_msgs: [],
          account_state_before: {} as any,
          account_state_after: {} as any,
          emulated: false,
        },
      },
    };

    const analysis = parseTraceDag(mockTrace);
    expect(analysis.isSuccess).toBe(false);
    expect(analysis.hops[0].isSuccess).toBe(false);
    expect(analysis.hops[0].computeExitCode).toBe(101);
  });
});
