/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from '@/core/routing';

import {
  ArrowUpRight,
  ArrowDownLeft,
  Vote,
  Coins,
  Sparkles,
  Building2,
  Ticket,
  MapPin,
} from 'lucide-react';

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

      {/* BrotherHood Ecosystem Features (Members Only) */}
      {isLoading ? (
        <div className="h-16 bg-secondary/40 border border-border/50 rounded-2xl animate-pulse" />
      ) : isMember ? (
        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => navigate('/brotherhood')}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-0 bg-secondary/60 border border-border/70 rounded-2xl text-center hover:bg-secondary active:scale-[0.95] transition-all cursor-pointer shadow-xs"
            data-testid="brotherhood-button"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="block text-[10px] font-semibold text-foreground truncate w-full text-center">
              Fi
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/personal-jetton')}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-0 bg-secondary/60 border border-border/70 rounded-2xl text-center hover:bg-secondary active:scale-[0.95] transition-all cursor-pointer shadow-xs"
            data-testid="personal-jetton-button"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="block text-[10px] font-semibold text-foreground truncate w-full text-center">
              My Coin
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dao')}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-0 bg-secondary/60 border border-border/70 rounded-2xl text-center hover:bg-secondary active:scale-[0.95] transition-all cursor-pointer shadow-xs"
            data-testid="dao-button"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="block text-[10px] font-semibold text-foreground truncate w-full text-center">
              DAO
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/lottery')}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-0 bg-secondary/60 border border-border/70 rounded-2xl text-center hover:bg-secondary active:scale-[0.95] transition-all cursor-pointer shadow-xs"
            data-testid="lottery-button"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="block text-[10px] font-semibold text-foreground truncate w-full text-center">
              Lottery
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/city-network')}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-0 bg-secondary/60 border border-border/70 rounded-2xl text-center hover:bg-secondary active:scale-[0.95] transition-all cursor-pointer shadow-xs"
            data-testid="city-network-button"
            title="NeighbourHOOD"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="block text-[10px] font-semibold text-foreground truncate w-full text-center">
              Cities
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
