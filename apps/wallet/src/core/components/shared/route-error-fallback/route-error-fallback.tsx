import React from 'react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/core/components/ui/button';

export const RouteErrorFallback: React.FC<ErrorComponentProps> = ({
  error,
  reset,
}) => {
  const router = useRouter();
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred.';

  const handleReset = () => {
    try {
      reset?.();
    } catch {
      // fallback
    }
    router.invalidate();
  };

  const handleHome = () => {
    try {
      router.navigate({ to: '/wallet' as any });
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4 text-destructive">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-3 font-mono bg-muted/40 p-2 rounded-lg border border-border/50 text-left overflow-x-auto">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={handleReset} className="w-full gap-2 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleHome}
            className="w-full gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Wallet</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
