import { QrCode } from 'lucide-react';
import { Input } from './ui/input';
import { QrScanner } from './QrScanner';
import { useCallback, useState } from 'react';

function InputScan({
  toAddr,
  setToAddr,
  // loading,
}: {
  toAddr: string;
  setToAddr: (value: string) => void;
  // loading: boolean;
}) {
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const handleClose = useCallback(() => setIsScannerVisible(false), []);

  const handleScan = useCallback(
    (data: string) => {
      if (!data) return;
      setToAddr(data.trim());
      setIsScannerVisible(false);
    },
    [setToAddr],
  );

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="EQA..."
        value={toAddr}
        onChange={(e) => setToAddr(e.target.value)}
        // disabled={loading}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => setIsScannerVisible(true)}
        aria-label="Scan QR code"
        className="shrink-0 size-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-colors hover:bg-accent active:scale-95"
      >
        <QrCode className="size-4.5" />
      </button>
      <QrScanner
        isVisible={isScannerVisible}
        onClose={handleClose}
        onScan={handleScan}
      />
    </div>
  );
}

export { InputScan };
