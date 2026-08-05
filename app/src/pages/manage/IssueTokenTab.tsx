import { useState, type FormEvent } from 'react';
import { Address, beginCell, storeStateInit, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import {
  buildPersonalMinterDeploy,
  buildPointPersonalMinterBody,
} from '../../lib/deploy';
import { getWalletAddress, getFiWalletState } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import { tryParseAddress, WalletRequired, type Network } from './common';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { StatusAlert } from '../DeployPage';

export function IssueTokenTab({
  network,
  tonConnectUI,
  ownerAddress,
}: {
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
}) {
  const [name, setName] = useState('My Personal Token');
  const [symbol, setSymbol] = useState('PTK');
  const [decimals, setDecimals] = useState('9');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [issuerAddr, setIssuerAddr] = useState('');
  const { sendTransaction, loading, status, setStatus } =
    useSendFiTransaction(tonConnectUI, network);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  if (!ownerAddress) return <WalletRequired />;
  const owner = ownerAddress;

  async function handleIssue(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !symbol.trim()) {
      setStatus({ type: 'error', message: 'Name and symbol are required' });
      return;
    }
    const dec = parseInt(decimals);
    if (isNaN(dec) || dec < 0 || dec > 18) {
      setStatus({
        type: 'error',
        message: 'Decimals must be between 0 and 18',
      });
      return;
    }

    const issuerOwnerRaw = issuerAddr.trim() || owner.toString();
    const issuerOwner = tryParseAddress(issuerOwnerRaw);
    if (!issuerOwner) {
      setStatus({ type: 'error', message: 'Invalid issuer address' });
      return;
    }

    setStatus({ type: 'info', message: 'Preparing deployment...' });

    const issuerWallet = await getWalletAddress(issuerOwner);
    let issuerActive = true;
    try {
      await getFiWalletState(issuerOwner);
    } catch {
      issuerActive = false;
    }
    if (!issuerActive) {
      setStatus({
        type: 'info',
        message:
          'Issuer FI wallet not found; deploy and activate it first, or the pointer step will fail.',
      });
    }

    const { contractAddress, stateInit } = await buildPersonalMinterDeploy({
      issuerWallet,
      adminAddress: owner,
      metadata: {
        name: name.trim(),
        symbol: symbol.trim(),
        decimals,
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined,
      },
    });

    const friendlyAddr = contractAddress.toString({
      bounceable: true,
      testOnly: network === 'testnet',
    });

    const pointerBody = buildPointPersonalMinterBody({
      personalMinter: contractAddress,
    });

    await sendTransaction({
      messages: [
        {
          address: contractAddress.toString(),
          amount: toNano('1'),
          stateInit: beginCell().store(storeStateInit(stateInit)).endCell(),
        },
        {
          address: issuerWallet.toString(),
          amount: toNano('0.6'),
          payload: pointerBody,
        },
      ],
      successMessage:
        'Personal Token minter deployed and issuer wallet pointed at it!',
      fallbackError: 'Deployment failed',
      onSuccess: () => setDeployedAddress(friendlyAddr),
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleIssue} className="space-y-4.5">
        <h3 className="text-base font-semibold">Create Personal Token</h3>
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Token Name
            </Label>
            <Input
              placeholder="My Personal Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Symbol
            </Label>
            <Input
              placeholder="PTK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Decimals
            </Label>
            <Input
              type="number"
              min="0"
              max="18"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Issuer Owner
            </Label>
            <InputScan toAddr={issuerAddr} setToAddr={setIssuerAddr} />
            <p className="text-xs text-muted-foreground">
              The Member whose FI account backs this token (defaults to you).
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </Label>
          <Textarea
            placeholder="Describe your personal token..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Image URL
          </Label>
          <Input
            type="text"
            placeholder="https://example.com/logo.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Deploys a Personal Token minter for your FI wallet and points your
          wallet at it. You are set as the minter admin.
        </p>

        <Button
          className="w-full h-12 rounded-full text-[15px] font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Deploying...
            </>
          ) : (
            'Create Personal Token'
          )}
        </Button>
        {status && !deployedAddress && (
          <StatusAlert type={status.type} message={status.message} />
        )}
      </form>

      {deployedAddress && (
        <Card>
          <CardContent className="text-center py-5">
            <div
              className="mb-3.5 flex justify-center"
              style={{ color: 'var(--success)' }}
            >
              <CheckCircle className="size-9" strokeWidth={1.5} />
            </div>
            <div className="text-base font-bold mb-1.5">
              Personal Token Deployed
            </div>
            <p className="text-sm text-muted-foreground mb-4.5">
              Buyers can now lend you FI in exchange for your token.
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <Button asChild className="rounded-full h-10">
                <a
                  href={`${network === 'testnet' ? 'https://testnet.tonviewer.com' : 'https://tonviewer.com'}/${deployedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                  View on Tonviewer
                </a>
              </Button>
              <Button
                variant="secondary"
                className="rounded-full h-10"
                onClick={() => {
                  navigator.clipboard.writeText(deployedAddress);
                }}
              >
                <Copy className="size-4" />
                Copy Address
              </Button>
            </div>
            <p className="mt-3.5 font-mono text-xs text-muted-foreground break-all">
              {deployedAddress}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
