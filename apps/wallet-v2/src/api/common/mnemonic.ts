import * as bip39 from 'bip39';

import { logDebug, logDebugError } from '../../util/logs';
import { callWindow } from '../../util/windowProvider/connector';

export function generateBip39Mnemonic() {
  return bip39.generateMnemonic(128).split(' ');
}

export function validateBip39Mnemonic(mnemonic: string[]) {
  return bip39.validateMnemonic(mnemonic.join(' '));
}

/**
 * TODO [Enclave step 2]
 *
 * The secret leaves the Enclave here and temporarily lives in the JS context. This is a known
 * limitation of the current architecture, not an oversight: signing is planned to move inside
 * the Enclave (see `sign` in `src/enclave/enclave.ts`), and this export will be removed.
 */
export async function getMnemonic(accountId: string, enclaveToken: string): Promise<string[] | undefined> {
  try {
    const mnemonicString = await callWindow('exportSecret', accountId, enclaveToken);

    return mnemonicString.split(' ');
  } catch (err: any) {
    if (err?.message?.includes('no secret for') || err?.message?.includes('secret_missing')) {
      logDebug('getMnemonic: no secret for account in enclave, skipping', accountId);
      return undefined;
    }
    logDebugError('getMnemonic', err);
    return undefined;
  }
}
