import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MnemonicGridProps {
  mnemonic: string[];
  hideCopy?: boolean;
}

export const MnemonicGrid: React.FC<MnemonicGridProps> = ({
  mnemonic,
  hideCopy = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy mnemonic:', e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {mnemonic.map((word, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-stone-900/60 border border-stone-800 rounded-lg p-2 text-xs font-mono"
          >
            <span className="text-stone-500 w-5 text-right font-medium">
              {index + 1}.
            </span>
            <span className="text-stone-200 font-semibold truncate">
              {word}
            </span>
          </div>
        ))}
      </div>

      {!hideCopy && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium px-3 py-1.5 rounded-md hover:bg-amber-400/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy recovery phrase</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
