import React, { useState } from 'react';
import { Download, KeyRound, ShieldAlert, X } from 'lucide-react';
import { useAppWallet } from '@/providers/WalletContext';

interface ImportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWalletModal: React.FC<ImportWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { importNewWallet } = useAppWallet();
  const [walletName, setWalletName] = useState('');
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setError(null);

      const words = mnemonicInput
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      if (words.length !== 12 && words.length !== 24) {
        throw new Error(
          `Expected 12 or 24 words, but received ${words.length} words.`
        );
      }

      await importNewWallet(words, walletName.trim() || undefined);
      setWalletName('');
      setMnemonicInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMnemonicInput(text);
    } catch (e) {
      console.error('Failed to paste from clipboard:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-amber-500/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-100 text-lg">
                Import TON Wallet
              </h3>
              <p className="text-xs text-stone-400">
                Import using 12 or 24 word seed phrase (WalletV5R1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Wallet Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Imported Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-300">
                Recovery Seed Phrase (12 or 24 words)
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Paste from clipboard
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Enter space-separated 12 or 24 seed phrase words..."
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs font-mono text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-xs text-stone-400 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Calculates keypairs for standard <strong>WalletV5R1</strong> contract standard on workchain 0.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !mnemonicInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/10 transition-all disabled:opacity-40"
            >
              {isImporting ? 'Importing...' : 'Import Wallet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
