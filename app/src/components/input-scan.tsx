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
    <div className="flex">
      <Input
        type="text"
        placeholder="EQA..."
        value={toAddr}
        onChange={(e) => setToAddr(e.target.value)}
        // disabled={loading}
      />
      <button
        type="button"
        onClick={() => setIsScannerVisible(true)}
        className={'p-1'}
      >
        <QrCode />
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
