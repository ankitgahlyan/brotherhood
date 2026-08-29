/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { useNavigate } from '@/core/routing';

import { DashboardActionButton } from '../dashboard-action-button';

import { SwapIcon, SendIcon, StakeIcon } from '@/core/components/ui/icons';

export const DashboardActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-2">
            <div className="flex items-stretch gap-2">
                <DashboardActionButton
                    icon={<SendIcon className="w-6 h-6" />}
                    label="Send"
                    onClick={() => navigate('/send')}
                    testId="send-button"
                />
                <DashboardActionButton
                    icon={<SwapIcon className="w-6 h-6" />}
                    label="Swap"
                    onClick={() => navigate('/swap')}
                    testId="swap-button"
                />
                <DashboardActionButton
                    icon={<StakeIcon className="w-6 h-6" />}
                    label="Stake"
                    onClick={() => navigate('/staking')}
                    testId="stake-button"
                />
            </div>

            {/* BrotherHood Ecosystem Features */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
                <button
                    onClick={() => navigate('/brotherhood')}
                    className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
                    data-testid="brotherhood-button"
                >
                    <span className="block text-[11px] font-semibold text-foreground">FossFi</span>
                </button>
                <button
                    onClick={() => navigate('/personal-jetton')}
                    className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
                    data-testid="personal-jetton-button"
                >
                    <span className="block text-[11px] font-semibold text-foreground">Personal</span>
                </button>
                <button
                    onClick={() => navigate('/dao')}
                    className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
                    data-testid="dao-button"
                >
                    <span className="block text-[11px] font-semibold text-foreground">DAO</span>
                </button>
                <button
                    onClick={() => navigate('/lottery')}
                    className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
                    data-testid="lottery-button"
                >
                    <span className="block text-[11px] font-semibold text-foreground">Lottery</span>
                </button>
                <button
                    onClick={() => navigate('/city-network')}
                    className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
                    data-testid="city-network-button"
                >
                    <span className="block text-[11px] font-semibold text-foreground">Cities</span>
                </button>
            </div>
        </div>
    );
};
