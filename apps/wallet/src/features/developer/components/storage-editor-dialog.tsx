import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/core/components/ui/dialog/dialog';
import { Button } from '@/core/components/ui/button';
import { Sparkles, AlertCircle } from 'lucide-react';

interface StorageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
  initialValue?: string;
  isNewKey?: boolean;
  onSave: (key: string, value: string) => void;
}

export const StorageEditorDialog: React.FC<StorageEditorDialogProps> = ({
  isOpen,
  onClose,
  initialKey = '',
  initialValue = '',
  isNewKey = false,
  onSave,
}) => {
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKey(initialKey);
      setValue(initialValue);
      setJsonError(null);
    }
  }, [isOpen, initialKey, initialValue]);

  const validateJson = (text: string) => {
    if (!text.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    validateJson(val);
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e) {
      setJsonError('Cannot prettify invalid JSON: ' + (e as Error).message);
    }
  };

  const handleSave = () => {
    if (isNewKey && !key.trim()) return;
    onSave(key.trim(), value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-5 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {isNewKey ? 'Add Storage Key' : `Edit: ${key}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isNewKey
              ? 'Enter key name and value. JSON strings are automatically parsed and formatted.'
              : 'Modify the value directly. Values are stored as strings in LocalStorage.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 flex-1 overflow-y-auto">
          {isNewKey && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Key Name:
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. app_settings"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">
                Value:
              </label>
              <button
                type="button"
                onClick={handlePrettify}
                className="text-[11px] text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Prettify JSON</span>
              </button>
            </div>

            <textarea
              rows={10}
              value={value}
              onChange={handleValueChange}
              placeholder="Value string or JSON object..."
              className="w-full p-3 font-mono text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500 resize-y"
            />

            {jsonError && (
              <div className="flex items-center gap-1.5 text-amber-500 text-[11px] mt-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Notice (stored as plain string): {jsonError}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isNewKey && !key.trim()}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
