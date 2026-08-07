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
        className="glass flex items-center justify-between px-7 h-15 border-b sticky top-0 z-50 max-sm:px-4 max-sm:h-auto max-sm:flex-wrap max-sm:gap-2.5 max-sm:py-3"
        style={{
          borderBottomColor:
            theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-6 max-sm:gap-2.5 max-sm:w-full max-sm:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[17px] font-bold max-sm:text-[15px] font-display"
          >
            <div className="w-8 h-8 bg-brand-gradient rounded-[9px] flex items-center justify-center text-white shadow-[0_4px_14px_-4px_rgba(229,77,94,0.6)] max-sm:w-7 max-sm:h-7 max-sm:rounded-[7px]">
              <Diamond className="size-4 max-sm:size-3.5" />
            </div>
            <span>
              Brother<span className="text-gradient">Hood</span>
            </span>
          </Link>

          <nav className="flex gap-0.5 p-0.75 h-10 rounded-full items-center max-sm:h-9">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-full px-4 h-8.5 text-[15px] font-bold max-sm:h-7.5 max-sm:px-3.5 max-sm:text-[13px] flex items-center"
              activeProps={{
                className:
                  'rounded-full px-4 h-8.5 text-[15px] font-bold max-sm:h-7.5 max-sm:px-3.5 max-sm:text-[13px] bg-brand-gradient text-white flex items-center shadow-[0_4px_14px_-4px_rgba(229,77,94,0.6)]',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:text-foreground flex items-center',
              }}
            >
              Manage
            </Link>
            <Link
              to="/deploy"
              className="rounded-full px-4 h-8.5 text-[15px] font-bold max-sm:h-7.5 max-sm:px-3.5 max-sm:text-[13px] flex items-center"
              activeProps={{
                className:
                  'rounded-full px-4 h-8.5 text-[15px] font-bold max-sm:h-7.5 max-sm:px-3.5 max-sm:text-[13px] bg-brand-gradient text-white flex items-center shadow-[0_4px_14px_-4px_rgba(229,77,94,0.6)]',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:text-foreground flex items-center',
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
              className="gap-1 text-[11px] px-2 py-0.5 max-sm:hidden"
            >
              <WifiOff className="size-3" /> Offline Mode
            </Badge>
          )}

          {/* Manual Contract State Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-10 max-sm:size-9 bg-secondary"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh contract state & save to DB"
          >
            <RefreshCw
              className={`size-4.5 ${isRefreshing ? 'animate-spin text-brand' : ''}`}
            />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-10 max-sm:size-9 bg-secondary"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="size-4.5" />
            ) : (
              <Moon className="size-4.5" />
            )}
          </Button>

          {/* App Settings Modal Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-10 max-sm:size-9 bg-secondary"
            onClick={() => setIsSettingsOpen(true)}
            title="App Settings & Offline Cache"
          >
            <Settings className="size-4.5" />
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
