import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface HeadersViewerProps {
  headers: Record<string, string>;
}

const NOISY_HEADERS = new Set([
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-ch-ua-platform',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'priority',
  'cache-control',
  'pragma',
  'dnt',
  'connection',
  'host',
  'origin',
  'referer',
]);

export const HeadersViewer: React.FC<HeadersViewerProps> = ({ headers }) => {
  const [showAll, setShowAll] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const allEntries = useMemo(() => Object.entries(headers), [headers]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter(([key]) => {
      const lower = key.toLowerCase();
      return !NOISY_HEADERS.has(lower) && !lower.startsWith('sec-');
    });
  }, [allEntries]);

  const displayedEntries =
    showAll || filteredEntries.length === 0 ? allEntries : filteredEntries;
  const hasHiddenHeaders = allEntries.length > displayedEntries.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(headers, null, 2));
      setHasCopied(true);
      toast.success('Headers copied to clipboard');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Failed to copy headers');
    }
  };

  if (allEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-muted-foreground text-[11px]">
          Request Headers:
        </span>
        <div className="flex items-center gap-1.5">
          {hasHiddenHeaders && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-[10px] text-blue-500 hover:underline font-mono cursor-pointer"
            >
              Show all ({allEntries.length})
            </button>
          )}
          {showAll && allEntries.length > filteredEntries.length && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground font-mono cursor-pointer"
            >
              Filter noise ({filteredEntries.length})
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Copy headers JSON"
          >
            {hasCopied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      <div className="p-2 rounded-lg bg-background border border-border font-mono text-[11px] overflow-x-auto text-foreground space-y-1">
        {displayedEntries.map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="text-blue-500 font-semibold select-all flex-shrink-0">
              {key}:
            </span>
            <span className="text-foreground/90 break-all select-all">
              {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
