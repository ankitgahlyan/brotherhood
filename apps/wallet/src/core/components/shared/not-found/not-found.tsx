import React from 'react';
import { useNavigate } from '@/core/routing';
import { Compass } from 'lucide-react';
import { Button } from '@/core/components/ui/button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-2xl p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-secondary/80 border border-border flex items-center justify-center mb-4 text-muted-foreground">
          <Compass className="w-7 h-7 text-primary" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>

        <Button onClick={() => navigate('/')} className="w-full cursor-pointer">
          Return to Wallet
        </Button>
      </div>
    </div>
  );
};
