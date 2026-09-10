import { Cell, toNano } from '@ton/core';
import { getActions, getGlobal } from '../../global';
import { DEFAULT_TRANSFER_TOKEN_SLUG } from '../../config';
import { callApi } from '../../api';
import { selectCurrentAccountId, selectEnclaveToken } from '../../global/selectors';
import type { ApiSubmitTransferOptions } from '../../api/types';

export interface FiMessage {
  toAddress: string;
  amount: bigint;
  payload: Cell;
  stateInit?: Cell;
}

/**
 * Triggers MyTonWallet's native transfer confirmation modal with custom TON BOC payload.
 */
export function openFiTransactionModal(message: FiMessage) {
  const actions = getActions();
  const base64Payload = message.payload.toBoc().toString('base64');
  const base64StateInit = message.stateInit ? message.stateInit.toBoc().toString('base64') : undefined;

  actions.startTransfer({
    tokenSlug: DEFAULT_TRANSFER_TOKEN_SLUG,
    toAddress: message.toAddress,
    amount: message.amount,
  });

  actions.submitTransferInitial({
    tokenSlug: DEFAULT_TRANSFER_TOKEN_SLUG,
    toAddress: message.toAddress,
    amount: message.amount,
    binPayload: message.payload.toBoc().toString('base64'),
    stateInit: base64StateInit,
  });
}

/**
 * Directly submits transfer via MyTonWallet api when session is authenticated.
 */
export async function submitDirectFiTransfer(message: FiMessage): Promise<boolean> {
  const global = getGlobal();
  const accountId = selectCurrentAccountId(global);
  if (!accountId) throw new Error('No active account');

  const enclaveToken = selectEnclaveToken(global);
  const options: ApiSubmitTransferOptions = {
    accountId,
    enclaveToken,
    toAddress: message.toAddress,
    amount: message.amount,
    payload: { type: 'base64', data: message.payload.toBoc().toString('base64') },
    stateInit: message.stateInit ? message.stateInit.toBoc().toString('base64') : undefined,
  };

  const result = await callApi('submitTransfer', 'ton', options);
  return result ? ('txId' in result) : false;
}
