import { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Database,
  HardDriveDownload,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useTheme, toggleTheme } from '../lib/theme';
import {
  clearContractCache,
  getContractCacheStats,
} from '../lib/contract-cache';
import {
  getAppCacheStatus,
  invalidateAppCacheAndReload,
  type AppCacheStatus,
} from '../lib/sw-manager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractCacheCleared?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  onContractCacheCleared,
}: SettingsModalProps) {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [contractStats, setContractStats] = useState<{
    count: number;
    lastUpdated: number | null;
  }>({ count: 0, lastUpdated: null });
  const [swStatus, setSwStatus] = useState<AppCacheStatus | null>(null);
  const [clearingContractDB, setClearingContractDB] = useState(false);
  const [invalidatingAppCache, setInvalidatingAppCache] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch initial stats
    getContractCacheStats().then(setContractStats);
    getAppCacheStatus().then(setSwStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearContractCache = async () => {
    setClearingContractDB(true);
    try {
      await clearContractCache();
      const updated = await getContractCacheStats();
      setContractStats(updated);
      setStatusMessage('Contract state cache cleared successfully.');
      if (onContractCacheCleared) onContractCacheCleared();
    } catch {
      setStatusMessage('Failed to clear contract state cache.');
    } finally {
      setClearingContractDB(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleInvalidateAppCache = async () => {
    setInvalidatingAppCache(true);
    setStatusMessage('Clearing app cache and checking for updates...');
    await invalidateAppCacheAndReload();
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative flex flex-col gap-5 overflow-hidden"
        style={{
          backgroundColor: theme === 'dark' ? '#0f141c' : '#ffffff',
          borderColor:
            theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: theme === 'dark' ? '#f3f4f6' : '#111827',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white shadow-md">
              <RefreshCw className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display leading-tight">
                App & Cache Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage local database & offline app assets
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full size-8 hover:bg-muted/50"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-brand/10 border border-brand/30 text-xs font-medium text-brand animate-in fade-in">
            <CheckCircle2 className="size-4 text-brand shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* General Settings: Theme & Network */}
        <Card className="border-muted/30 bg-muted/20">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Appearance Theme</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="gap-2 text-xs rounded-full"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="size-3.5" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="size-3.5" /> Dark Mode
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between border-t border-muted/20 pt-3">
              <span className="text-sm font-medium">Connection Status</span>
              <Badge
                variant={isOnline ? 'default' : 'destructive'}
                className="gap-1.5 text-xs py-0.5 px-2.5 rounded-full"
              >
                {isOnline ? (
                  <>
                    <Wifi className="size-3" /> Online
                  </>
                ) : (
                  <>
                    <WifiOff className="size-3" /> Offline Mode
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Contract State Cache (IndexedDB) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Database className="size-4 text-emerald-500" />
              Contract State Cache (IndexedDB)
            </h3>
            <Badge variant="outline" className="text-[11px] font-mono">
              {contractStats.count} items stored
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Stores smart contract state and user balances locally so you can
            view contract details even when offline.
          </p>

          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-muted/20 text-xs">
            <div>
              <span className="text-muted-foreground">Last Cached: </span>
              <span className="font-semibold">
                {formatTimestamp(contractStats.lastUpdated)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearContractCache}
              disabled={clearingContractDB || contractStats.count === 0}
              className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 h-7"
            >
              <Trash2 className="size-3.5" /> Clear DB
            </Button>
          </div>
        </div>

        {/* Section 2: App Shell Cache (Service Worker) */}
        <div className="flex flex-col gap-2 border-t pt-4 border-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <HardDriveDownload className="size-4 text-blue-500" />
              App Offline & Shell Cache
            </h3>
            <Badge variant="outline" className="text-[11px]">
              {swStatus?.swRegistered ? 'PWA Active' : 'Precached Shell'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Caches application pages and static assets locally for offline
            navigation. Invalidate cache to fetch updated pages if a new app
            version was deployed.
          </p>

          <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-muted/20 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Cached Asset Stores:
              </span>
              <span className="font-mono">
                {swStatus?.cacheNames.length || 0} active cache(s)
              </span>
            </div>
            <Button
              onClick={handleInvalidateAppCache}
              disabled={invalidatingAppCache}
              className="w-full mt-1 gap-2 text-xs font-semibold bg-brand hover:bg-brand/90 text-white shadow-sm"
            >
              <RefreshCw
                className={`size-3.5 ${invalidatingAppCache ? 'animate-spin' : ''}`}
              />
              Invalidate App Cache & Check for Updates
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
