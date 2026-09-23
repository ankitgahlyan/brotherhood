/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DateHeader, getDayStartSeconds } from '../date-header';
import { TransactionRow } from '../transaction-row';
import type { TransactionRowModel } from '../../utils/map-transaction-row';
import { useAnimationSettings } from '@/core/motion/motion-provider';

export interface ActivityListProps {
  rows: TransactionRowModel[];
  isSyncing?: boolean;
}

export interface DayGroup {
  dayStart: number;
  rows: TransactionRowModel[];
}

/** Renders a list of transactions grouped into daily cards with floating date pills between them. */
export const ActivityList: React.FC<ActivityListProps> = ({
  rows,
  isSyncing = false,
}) => {
  const { isReduced, isRich } = useAnimationSettings();

  const dayGroups = useMemo<DayGroup[]>(() => {
    if (!rows || rows.length === 0) return [];

    const groups: DayGroup[] = [];
    let currentGroup: DayGroup | null = null;

    for (const row of rows) {
      const dayStart = getDayStartSeconds(row.timestamp || 0);
      if (!currentGroup || currentGroup.dayStart !== dayStart) {
        currentGroup = { dayStart, rows: [] };
        groups.push(currentGroup);
      }
      currentGroup.rows.push(row);
    }

    return groups;
  }, [rows]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      {dayGroups.map((group, groupIndex) => (
        <div key={group.dayStart} className="space-y-1.5">
          <DateHeader
            timestamp={group.dayStart}
            isUpdating={groupIndex === 0 && isSyncing}
          />
          <div className="bg-card/60 backdrop-blur-xs rounded-2xl border border-border/60 divide-y divide-border/40 overflow-hidden shadow-2xs">
            <AnimatePresence initial={false}>
              {group.rows.map((row) => (
                <motion.div
                  key={row.id}
                  layout={isRich ? 'position' : undefined}
                  initial={isReduced ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={isReduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <TransactionRow {...row} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};
