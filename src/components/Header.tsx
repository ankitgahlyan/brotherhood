import { Link } from '@tanstack/react-router';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Diamond, Moon, Sun } from 'lucide-react';
import { useTheme, toggleTheme, type Theme } from '../lib/theme';
import { Button } from './ui/button';

export default function Header() {
  const theme: Theme = useTheme();

  return (
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

      <div className="flex items-center gap-2.5">
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
        <TonConnectButton />
      </div>
    </header>
  );
}
