/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';

import { ArrowUpRight, ArrowDownLeft, Vote } from 'lucide-react';

import { DashboardActionButton } from '../dashboard-action-button';
import { ReceiveModal } from '@/features/wallets/components/receive-modal';
import { useIsNetworkMember, NonMemberCard } from '@/features/brotherhood';

export const DashboardActions: React.FC = () => {
  const navigate = useNavigate();
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const { isMember, isLoading, refetch } = useIsNetworkMember();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DashboardActionButton
          icon={<ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />}
          iconContainerClassName="jewel-btn-send"
          label="Send"
          onClick={() => navigate('/send')}
          testId="send-button"
          className="min-w-[100px] shrink-0 snap-start"
        />
        <DashboardActionButton
          icon={<ArrowDownLeft className="w-5 h-5" strokeWidth={2.5} />}
          iconContainerClassName="jewel-btn-receive"
          label="Receive"
          onClick={() => setIsReceiveOpen(true)}
          testId="receive-button"
          className="min-w-[100px] shrink-0 snap-start"
        />
        <DashboardActionButton
          icon={<Vote className="w-5 h-5" strokeWidth={2.5} />}
          iconContainerClassName="jewel-btn-vote"
          label="Vote"
          onClick={() => navigate('/brotherhood', { search: { tab: 'vote' } })}
          testId="vote-button"
          className="min-w-[100px] shrink-0 snap-start"
        />
      </div>

      {/* Non-member status banner if not verified */}
      {isLoading ? (
        <div className="h-16 bg-secondary/40 border border-border/50 rounded-2xl animate-pulse" />
      ) : !isMember ? (
        <NonMemberCard onRefresh={refetch} />
      ) : null}

      <ReceiveModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />
    </div>
  );
};
