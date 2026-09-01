/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';

import { DashboardActionButton } from '../dashboard-action-button';
import { SendIcon, ReceiveIcon } from '@/core/components/ui/icons';
import { ReceiveModal } from '@/features/wallets/components/receive-modal';
import { useIsNetworkMember, NonMemberCard } from '@/features/brotherhood';

export const DashboardActions: React.FC = () => {
  const navigate = useNavigate();
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const { isMember, isLoading, refetch } = useIsNetworkMember();

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-2">
        <DashboardActionButton
          icon={<SendIcon className="w-6 h-6 text-primary" />}
          label="Send"
          onClick={() => navigate('/send')}
          testId="send-button"
        />
        <DashboardActionButton
          icon={<ReceiveIcon className="w-6 h-6 text-primary" />}
          label="Receive"
          onClick={() => setIsReceiveOpen(true)}
          testId="receive-button"
        />
      </div>

      {/* BrotherHood Ecosystem Features (Members Only) */}
      {isLoading ? (
        <div className="h-12 bg-secondary/40 border border-border/50 rounded-xl animate-pulse" />
      ) : isMember ? (
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <button
            onClick={() => navigate('/brotherhood')}
            className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
            data-testid="brotherhood-button"
          >
            <span className="block text-[11px] font-semibold text-foreground">
              Fi
            </span>
          </button>
          <button
            onClick={() => navigate('/personal-jetton')}
            className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
            data-testid="personal-jetton-button"
          >
            <span className="block text-[11px] font-semibold text-foreground">
              My Coin
            </span>
          </button>
          <button
            onClick={() => navigate('/dao')}
            className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
            data-testid="dao-button"
          >
            <span className="block text-[11px] font-semibold text-foreground">
              DAO
            </span>
          </button>
          <button
            onClick={() => navigate('/lottery')}
            className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
            data-testid="lottery-button"
          >
            <span className="block text-[11px] font-semibold text-foreground">
              Lottery
            </span>
          </button>
          <button
            onClick={() => navigate('/city-network')}
            className="p-2 bg-secondary/70 border border-border rounded-xl text-center hover:bg-secondary transition-colors"
            data-testid="city-network-button"
          >
            <span className="block text-[11px] font-semibold text-foreground">
              NeighbourHOOD
            </span>
          </button>
        </div>
      ) : (
        <NonMemberCard onRefresh={refetch} />
      )}

      <ReceiveModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />
    </div>
  );
};
