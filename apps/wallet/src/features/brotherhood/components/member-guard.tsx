/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { useNavigate } from '@/core/routing';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { NonMemberCard } from './non-member-card';
import { useIsNetworkMember } from '../hooks/use-is-network-member';

interface MemberGuardProps {
  title: string;
  children: React.ReactNode;
}

export const MemberGuard: React.FC<MemberGuardProps> = ({
  title,
  children,
}) => {
  const navigate = useNavigate();
  const { isMember, isLoading, refetch } = useIsNetworkMember();

  if (isLoading) {
    return (
      <NewLayout
        header={
          <ScreenHeader title={title} onBack={() => navigate('/wallet')} />
        }
      >
        <div className="space-y-3 p-4 bg-card border border-border rounded-2xl animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-10 bg-secondary rounded" />
          <div className="h-20 bg-secondary/60 rounded" />
        </div>
      </NewLayout>
    );
  }

  if (!isMember) {
    return (
      <NewLayout
        header={
          <ScreenHeader title={title} onBack={() => navigate('/wallet')} />
        }
      >
        <NonMemberCard onRefresh={refetch} />
      </NewLayout>
    );
  }

  return <>{children}</>;
};
