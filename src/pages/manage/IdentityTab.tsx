import { useState, type SyntheticEvent } from 'react';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import type { FiWalletStore } from '@wrappers/FossFiWallet.gen';
import {
  buildChangeUsernameBody,
  buildChangeCityBody,
  buildChangeCountryBody,
  buildInviteBody,
  buildCloseAccountBody,
} from '../../lib/deploy';
import { getWalletAddress } from '../../lib/ton';
import { useSendFiTransaction } from '../../lib/useSendFiTransaction';
import {
  tryParseAddress,
  WalletRequired,
  type Network,
} from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputScan } from '@/components/input-scan';
import { StatusAlert } from '../DeployPage';
import {
  User,
  MapPin,
  Globe,
  UserPlus,
  AlertTriangle,
  Send,
  Skull,
} from 'lucide-react';

export function IdentityTab({
  fiWalletState,
  isConnected,
  network,
  tonConnectUI,
  ownerAddress,
  onSuccess,
}: {
  fiWalletState: FiWalletStore | null;
  isConnected: boolean;
  network: Network;
  tonConnectUI: TonConnectUI;
  ownerAddress: Address | null;
  onSuccess?: () => void;
}) {
  const [subTab, setSubTab] = useState<'profile' | 'invite' | 'closure'>(
    'profile',
  );

  // Profile states
  const [username, setUsername] = useState(
    () => fiWalletState?.profile?.ref?.username || '',
  );
  const [city, setCity] = useState(() => fiWalletState?.profile?.ref?.city || '');
  const [country, setCountry] = useState(
    () => String(fiWalletState?.profile?.ref?.country ?? 0),
  );

  // Invite states
  const [inviteeAddr, setInviteeAddr] = useState('');
  const [inviteeUsername, setInviteeUsername] = useState('');
  const [inviteeCity, setInviteeCity] = useState('');

  // Close confirmation
  const [closeConfirmed, setCloseConfirmed] = useState(false);

  const { sendTransaction, loading, status, setStatus } = useSendFiTransaction(
    tonConnectUI,
    network,
  );

  if (!isConnected || !ownerAddress) return <WalletRequired />;

  async function handleUpdateUsername(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const trimmed = username.trim();
    if (!trimmed) {
      setStatus({ type: 'error', message: 'Username cannot be empty' });
      return;
    }
    const body = buildChangeUsernameBody({ newUsername: trimmed });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Username updated successfully!',
      fallbackError: 'Failed to update username',
      onSuccess: () => {
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleUpdateCity(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const trimmed = city.trim();
    if (!trimmed) {
      setStatus({ type: 'error', message: 'City name cannot be empty' });
      return;
    }
    const oldCity = fiWalletState?.profile?.ref?.city || '';
    const body = buildChangeCityBody({
      newCity: trimmed,
      oldCity,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.15'),
          payload: body,
        },
      ],
      successMessage: 'City updated and location registry notified!',
      fallbackError: 'Failed to update city',
      onSuccess: () => {
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleUpdateCountry(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const code = parseInt(country.trim(), 10);
    if (isNaN(code) || code <= 0) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid ISO 3166-1 country code',
      });
      return;
    }
    if ((fiWalletState?.votes ?? 0) < 10) {
      setStatus({
        type: 'error',
        message:
          'Country change requires all 10 endorsement votes to be uncast (unvote delegates first).',
      });
      return;
    }
    const body = buildChangeCountryBody({ newCountry: code });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.1'),
          payload: body,
        },
      ],
      successMessage: 'Country code updated!',
      fallbackError: 'Failed to update country',
      onSuccess: () => {
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleInvite(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress) return;
    const recipient = tryParseAddress(inviteeAddr);
    if (!recipient) {
      setStatus({ type: 'error', message: 'Invalid invitee address' });
      return;
    }
    if (!inviteeUsername.trim() || !inviteeCity.trim()) {
      setStatus({
        type: 'error',
        message: 'Invitee username and city are required',
      });
      return;
    }

    const firstChar = inviteeCity.trim().charAt(0).toUpperCase();
    const cityLetter =
      firstChar >= 'A' && firstChar <= 'Z' ? firstChar.charCodeAt(0) - 65 : 0;

    const body = buildInviteBody({
      transferRecipient: recipient,
      username: inviteeUsername.trim(),
      city: inviteeCity.trim(),
      cityLetter,
    });
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('1.0'),
          payload: body,
        },
      ],
      successMessage: 'Invite dispatched! New member account deployed.',
      fallbackError: 'Invite failed',
      onSuccess: () => {
        setInviteeAddr('');
        setInviteeUsername('');
        setInviteeCity('');
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  async function handleCloseAccount(e: SyntheticEvent) {
    e.preventDefault();
    if (!ownerAddress || !closeConfirmed) return;

    const body = buildCloseAccountBody();
    const walletAddr = await getWalletAddress(ownerAddress);

    await sendTransaction({
      messages: [
        {
          address: walletAddr.toString(),
          amount: toNano('0.2'),
          payload: body,
        },
      ],
      successMessage: 'Account voluntarily closed. Residual assets forwarded to nominee.',
      fallbackError: 'Failed to close account',
      onSuccess: () => {
        setCloseConfirmed(false);
        if (onSuccess) setTimeout(onSuccess, 4000);
      },
    });
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as 'profile' | 'invite' | 'closure')}
      >
        <TabsList className="grid grid-cols-3 w-full h-10 bg-secondary/60">
          <TabsTrigger value="profile" className="text-xs font-semibold">
            <User className="size-3.5 mr-1.5" />
            Profile Coordinates
          </TabsTrigger>
          <TabsTrigger value="invite" className="text-xs font-semibold">
            <UserPlus className="size-3.5 mr-1.5" />
            Invite Member
          </TabsTrigger>
          <TabsTrigger value="closure" className="text-xs font-semibold">
            <Skull className="size-3.5 mr-1.5" />
            Nominee & Closure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5 space-y-6">
          <form onSubmit={handleUpdateUsername} className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Username
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="brotherhood_member"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                Save
              </Button>
            </div>
          </form>

          <form onSubmit={handleUpdateCity} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                City Coordinates
              </Label>
              <p className="text-xs text-muted-foreground">
                Changing your city informs the Minter and CityMap registry to update
                regional shards.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tokyo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                Update City
              </Button>
            </div>
          </form>

          <form onSubmit={handleUpdateCountry} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Country (ISO 3166-1)
              </Label>
              <p className="text-xs text-muted-foreground">
                Scopes regional governance representation. Requires all 10 endorsement votes to be uncast.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="840"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={loading || (fiWalletState?.votes ?? 0) < 10}
              >
                Set Country
              </Button>
            </div>
            {(fiWalletState?.votes ?? 0) < 10 && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="size-3.5 shrink-0" />
                You currently have active cast votes. Revoke votes before changing country.
              </p>
            )}
          </form>
        </TabsContent>

        <TabsContent value="invite" className="mt-5 space-y-4.5">
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Invitee TON Address
              </Label>
              <InputScan toAddr={inviteeAddr} setToAddr={setInviteeAddr} />
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Username
                </Label>
                <Input
                  placeholder="alice"
                  value={inviteeUsername}
                  onChange={(e) => setInviteeUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  City
                </Label>
                <Input
                  placeholder="Berlin"
                  value={inviteeCity}
                  onChange={(e) => setInviteeCity(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              variant="brand"
              className="w-full h-12 rounded-full font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Onboard Invitee (1,000 FI Reward)
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="closure" className="mt-5 space-y-5">
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangle className="size-5" />
              Voluntary Account Closure
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Voluntary closure permanently deactivates your member account. All
              remaining FI trust supply is burned, social followings are settled, and
              residual transferable assets (Gold Coins & TON) are forwarded to your
              designated Nominee (or Treasury).
            </p>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="confirmClose"
                checked={closeConfirmed}
                onChange={(e) => setCloseConfirmed(e.target.checked)}
                className="size-4 rounded border-border"
              />
              <label
                htmlFor="confirmClose"
                className="text-xs font-medium cursor-pointer text-foreground"
              >
                I understand this action is permanent and irreversible
              </label>
            </div>

            <Button
              variant="destructive"
              className="w-full h-11 rounded-lg font-bold text-xs uppercase tracking-wider"
              disabled={!closeConfirmed || loading}
              onClick={handleCloseAccount}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Closing Account...
                </>
              ) : (
                <>
                  <Skull className="size-4 mr-1.5" />
                  Close Account Permanently
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {status && <StatusAlert type={status.type} message={status.message} />}
    </div>
  );
}
