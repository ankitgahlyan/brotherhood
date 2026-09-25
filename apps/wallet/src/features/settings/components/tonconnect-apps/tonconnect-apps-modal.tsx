/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio,
  Unlink,
  ExternalLink,
  Globe,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTonConnect } from '@demo/wallet-core';
import type { TONConnectSession } from '@ton/walletkit';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';

interface TonconnectAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TonconnectAppsModal: React.FC<TonconnectAppsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    connectedSessions,
    loadConnectedSessions,
    disconnectSession,
    disconnectAllSessions,
  } = useTonConnect();

  const [isLoading, setIsLoading] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [isDisconnectingAll, setIsDisconnectingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setIsLoading(true);
      });
      loadConnectedSessions()
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, loadConnectedSessions]);

  const handleDisconnectSingle = useCallback(
    async (session: TONConnectSession) => {
      setDisconnectingId(session.sessionId);
      try {
        await disconnectSession(session.sessionId);
        toast.success(
          `Disconnected from ${session.dAppName || session.domain || 'dApp'}`,
        );
      } catch (_err) {
        toast.error('Failed to disconnect');
      } finally {
        setDisconnectingId(null);
      }
    },
    [disconnectSession],
  );

  const handleDisconnectAll = useCallback(async () => {
    setIsDisconnectingAll(true);
    try {
      await disconnectAllSessions();
      toast.success('Disconnected from all dApps');
    } catch (_err) {
      toast.error('Failed to disconnect all apps');
    } finally {
      setIsDisconnectingAll(false);
    }
  }, [disconnectAllSessions]);

  const sessions = connectedSessions || [];

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2 max-w-lg"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <span>Connected dApps</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-4 pb-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading active connections...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Globe className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                No Connected dApps
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                When you connect your wallet to TON dApps via TonConnect, they
                will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Connections ({sessions.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                loading={isDisconnectingAll}
                onClick={handleDisconnectAll}
                className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Unlink className="w-3.5 h-3.5 mr-1" />
                <span>Disconnect All</span>
              </Button>
            </div>

            <div className="divide-y divide-border/40 border border-border rounded-xl overflow-hidden bg-card">
              {sessions.map((session) => {
                const displayName =
                  session.dAppName || session.domain || 'Unknown dApp';
                const dateStr = session.createdAt
                  ? new Date(session.createdAt).toLocaleDateString()
                  : undefined;

                return (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-3.5 gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {session.dAppIconUrl ? (
                        <img
                          src={session.dAppIconUrl}
                          alt={displayName}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 bg-muted/50 border border-border/50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </span>
                          {session.isJsBridge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-secondary text-muted-foreground">
                              Extension
                            </span>
                          )}
                        </div>
                        {session.dAppUrl && (
                          <a
                            href={session.dAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors truncate flex items-center gap-1 mt-0.5"
                          >
                            <span className="truncate">
                              {session.domain || session.dAppUrl}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        )}
                        {dateStr && (
                          <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                            Connected {dateStr}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      loading={disconnectingId === session.sessionId}
                      onClick={() => handleDisconnectSingle(session)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Remove</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal.Container>
  );
};
