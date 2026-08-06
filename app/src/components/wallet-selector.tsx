import { useEffect, useState } from 'react';
import { Wallet2, ChevronDown, LogOut, Plug } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { WalletInfo } from '@tonconnect/ui';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Address } from '@ton/core';

function formatAddress(address?: string | null) {
    if (!address) return 'Wallet';
    const addr = Address.parse(address).toString({ testOnly: true, bounceable: false, urlSafe: true });
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletSelector({
    className
}: {
    className?: string;
}) {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [wallets, setWallets] = useState<WalletInfo[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(false);

    const connected = !!wallet;
    const connectedAddress = wallet?.account?.address;
    const triggerLabel = connected
            ? formatAddress(connectedAddress)
            : 'Connect'

    useEffect(() => {
        let active = true;

        const loadWallets = async () => {
            setLoadingWallets(true);
            try {
                const availableWallets = await tonConnectUI.getWallets();
                // const availableWallets = await tonConnectUI.getWallets();
                if (active) {
                    setWallets(availableWallets);
                }
            } catch {
                if (active) {
                    setWallets([]);
                }
            } finally {
                if (active) {
                    setLoadingWallets(false);
                }
            }
        };

        void loadWallets();

        return () => {
            active = false;
        };
    }, [tonConnectUI]);

    const openWalletSelector = async () => {
        await tonConnectUI.openModal();
    };

    const disconnectWallet = async () => {
        await tonConnectUI.disconnect();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={connected ? 'outline' : 'default'}
                    className={className}
                >
                    <Wallet2 className="size-4" />
                    <span className="max-w-35 truncate">{triggerLabel}</span>
                    {connected && <ChevronDown className="size-3 opacity-60" />}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                {connected ? (
                    <>
                        <div className="px-2.5 py-2">
                            <div className="text-sm font-semibold">selected wallet</div>
                            <div className="font-mono text-[12px] text-muted-foreground">
                                {formatAddress(connectedAddress)}
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                    </>
                ) : (
                    <div className="px-2.5 py-2 text-sm text-muted-foreground">
                        Choose a wallet
                    </div>
                )}

                {loadingWallets ? (
                    <div className="px-2.5 py-2 text-sm text-muted-foreground">
                        Loading wallets…
                    </div>
                ) : null}

                {wallets.map((walletInfo) => (
                    <DropdownMenuItem
                        key={walletInfo.appName ?? walletInfo.name}
                        onClick={() => void openWalletSelector()}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium"
                    >
                        {walletInfo.imageUrl ? (
                            <img
                                src={walletInfo.imageUrl}
                                alt={walletInfo.name}
                                className="size-6 rounded-full object-cover"
                            />
                        ) : (
                            <Wallet2 className="size-4" />
                        )}
                        <span className="truncate">{walletInfo.name}</span>
                    </DropdownMenuItem>
                ))}

                {wallets.length === 0 && !loadingWallets ? (
                    <DropdownMenuItem
                        onClick={() => void openWalletSelector()}
                        className="rounded-lg px-3 py-2.5"
                    >
                        <Plug className="size-4" />
                        Connect with TON Connect
                    </DropdownMenuItem>
                ) : null}

                <DropdownMenuSeparator />

                {connected ? (
                    <DropdownMenuItem
                        onClick={() => void disconnectWallet()}
                        className="rounded-lg px-3 py-2.5"
                    >
                        <LogOut className="size-4" />
                        Disconnect wallet
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={() => void openWalletSelector()}
                        className="rounded-lg px-3 py-2.5"
                    >
                        <Plug className="size-4" />
                        Connect wallet
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}