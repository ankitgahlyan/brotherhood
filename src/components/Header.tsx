import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Diamond, Moon, Sun, RefreshCw, Settings, WifiOff } from 'lucide-react';
import { useTheme, toggleTheme, type Theme } from '../lib/theme';
import { useRefreshContractQueries } from '../lib/queries';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SettingsModal } from './SettingsModal';

export default function Header() {
  const theme: Theme = useTheme();
  const refreshContractState = useRefreshContractQueries();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshContractState();
    } catch (err) {
      console.warn('[Header] Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <>
      <header
        className="glass flex items-center justify-between px-7 h-16 border-b sticky top-0 z-50 max-sm:px-4 max-sm:h-auto max-sm:flex-wrap max-sm:gap-2.5 max-sm:py-3 transition-colors"
        style={{
          borderBottomColor:
            theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-6 max-sm:gap-2.5 max-sm:w-full max-sm:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[17px] font-bold max-sm:text-[15px] font-display group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ff4e00] flex items-center justify-center text-white shadow-[0_4px_16px_-2px_rgba(255,78,0,0.5)] group-hover:scale-105 transition-transform max-sm:w-7 max-sm:h-7">
              <Diamond className="size-4 text-[#fbf0df] max-sm:size-3.5" />
            </div>
            <span className="tracking-tight font-extrabold flex items-center gap-1.5">
              Brother<span className="text-[#ff4e00]">Hood</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30 max-sm:hidden">
                v1.3
              </span>
            </span>
          </Link>

          <nav className="flex gap-1 p-1 bg-secondary/80 rounded-xl items-center max-sm:h-9">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-lg px-4 h-8 text-[14px] font-mono font-semibold max-sm:h-7.5 max-sm:px-3 max-sm:text-[13px] flex items-center transition-all"
              activeProps={{
                className:
                  'rounded-lg px-4 h-8 text-[14px] font-mono font-bold max-sm:h-7.5 max-sm:px-3 max-sm:text-[13px] bg-[#ff4e00] text-white flex items-center shadow-[0_4px_14px_-3px_rgba(255,78,0,0.5)]',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:text-foreground flex items-center hover:bg-black/5 dark:hover:bg-white/5',
              }}
            >
              Manage
            </Link>
            <Link
              to="/deploy"
              className="rounded-lg px-4 h-8 text-[14px] font-mono font-semibold max-sm:h-7.5 max-sm:px-3 max-sm:text-[13px] flex items-center transition-all"
              activeProps={{
                className:
                  'rounded-lg px-4 h-8 text-[14px] font-mono font-bold max-sm:h-7.5 max-sm:px-3 max-sm:text-[13px] bg-[#ff4e00] text-white flex items-center shadow-[0_4px_14px_-3px_rgba(255,78,0,0.5)]',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:text-foreground flex items-center hover:bg-black/5 dark:hover:bg-white/5',
              }}
            >
              Create
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isMounted && !isOnline && (
            <Badge
              variant="destructive"
              className="gap-1 text-[11px] font-mono px-2 py-0.5 max-sm:hidden"
            >
              <WifiOff className="size-3" /> Offline Mode
            </Badge>
          )}

          {/* Bun Engine Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-mono text-muted-foreground border border-white/5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>bun v1.3.14</span>
          </div>

          {/* Manual Contract State Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg size-9 bg-secondary hover:bg-secondary/80"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh contract state & save to DB"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? 'animate-spin text-[#ff4e00]' : ''}`}
            />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg size-9 bg-secondary hover:bg-secondary/80"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {/* App Settings Modal Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg size-9 bg-secondary hover:bg-secondary/80"
            onClick={() => setIsSettingsOpen(true)}
            title="App Settings & Offline Cache"
          >
            <Settings className="size-4" />
          </Button>

          <TonConnectButton />
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
