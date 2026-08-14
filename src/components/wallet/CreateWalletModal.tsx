import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Sparkles, X } from 'lucide-react';
import { MnemonicGrid } from './MnemonicGrid';
import { useAppWallet } from '@/providers/WalletContext';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createNewWallet } = useAppWallet();
  const [step, setStep] = useState<'initial' | 'display' | 'confirm'>('initial');
  const [walletName, setWalletName] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [confirmedBackup, setConfirmedBackup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartGenerate = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const { mnemonic } = await createNewWallet(
        walletName.trim() || undefined
      );
      setGeneratedMnemonic(mnemonic);
      setStep('display');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFinish = () => {
    setStep('initial');
    setWalletName('');
    setGeneratedMnemonic([]);
    setConfirmedBackup(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-amber-500/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-100 text-lg">
                Create TON WalletV5R1
              </h3>
              <p className="text-xs text-stone-400">
                Generate in-app wallet seed phrase
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'initial' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Wallet Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Wallet Contract: WalletV5R1</span>
                </div>
                <p>
                  Your seed phrase will be generated securely in your browser and encrypted locally.
                </p>
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
                  onClick={handleStartGenerate}
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Generating...' : 'Generate 24 Words'}
                </button>
              </div>
            </div>
          )}

          {step === 'display' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90">
                Write down these 24 words in sequence. Keep them stored safely offline.
              </div>

              <MnemonicGrid mnemonic={generatedMnemonic} />

              <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedBackup}
                    onChange={(e) => setConfirmedBackup(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/20 w-4 h-4"
                  />
                  <span>I have saved my seed phrase securely</span>
                </label>

                <button
                  type="button"
                  disabled={!confirmedBackup}
                  onClick={handleFinish}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-40"
                >
                  Activate Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
