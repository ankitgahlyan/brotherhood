import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { buildDestroyBody } from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { WalletRequired, type Network } from './common';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusAlert } from '../DeployPage';

export function DestroyTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const { sendTransaction, loading, status } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  async function sendDestroy() {
    const body = buildDestroyBody();
    // const client = getTonClient(network);
    const walletAddr = await getWalletAddress(
      // client,
      // Address.parse(contractAddr),
      owner,
    );

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.6'),
          payload: body,
        },
      ],
      successMessage: 'Destroy transaction sent!',
      fallbackError: 'Txn failed',
    });
  }

  return (
    <div className="space-y-4.5">
      <Button
        variant="brand"
        className="h-12 rounded-full text-[15px] font-bold"
        disabled={loading}
        onClick={() => sendDestroy()}
      >
        {loading ? (
          <>
            <span className="spinner" /> Sending Txn...
          </>
        ) : (
          <>
            <Trash2 className="size-4" />
            Destroy Account
          </>
        )}
      </Button>
      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
