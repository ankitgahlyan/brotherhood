import { QrCode } from 'lucide-react';
import { Input } from './ui/input';
import { QrScanner } from './QrScanner';
import { useState } from 'react';

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
        onClose={() => setIsScannerVisible(false)}
        onScan={(data: string) => {
          if (!data) return;
          setToAddr(data.trim());
          setIsScannerVisible(false);
        }}
      />
    </div>
  );
}

export { InputScan };
