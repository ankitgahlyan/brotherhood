import React, { useState, useMemo } from 'react';
import { Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { decodeGetterResponse } from '../../../core/lib/getter-decoder';

interface PayloadViewerProps {
  title: string;
  payload: string | null | undefined;
  requestPayload?: string | null | undefined;
  isRequest?: boolean;
}

// Helper to detect if a string looks like a large BoC or base64 blob
function isLargeBase64Blob(str: string): boolean {
  if (typeof str !== 'string' || str.length < 100) return false;
  // Common BoC prefix in TON is te6cc...
  if (str.startsWith('te6cc')) return true;
  // Generic base64 pattern (alphanumeric + '+' + '/' with optional '=' padding)
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// Clean JSON-RPC noise: strips "jsonrpc", "id", "@extra" and unwraps params/result if helpful
function cleanJsonRpcPayload(data: unknown, isRequest?: boolean): unknown {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => cleanJsonRpcPayload(item, isRequest));
  }

  const obj = data as Record<string, unknown>;

  // Check if it's standard JSON-RPC
  const isRpc = 'jsonrpc' in obj || 'id' in obj;

  if (isRpc) {
    if (isRequest && 'method' in obj && 'params' in obj) {
      return {
        _rpcMethod: obj.method,
        ...(cleanJsonRpcPayload(obj.params, isRequest) as Record<
          string,
          unknown
        >),
      };
    }

    if (!isRequest && 'result' in obj) {
      const cleanedResult = cleanJsonRpcPayload(obj.result, isRequest);
      if (typeof cleanedResult === 'object' && cleanedResult !== null) {
        const { ...rest } = cleanedResult as Record<string, unknown>;
        delete rest['@extra'];
        return rest;
      }
      return cleanedResult;
    }
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'jsonrpc' || key === '@extra') continue;
    cleaned[key] = cleanJsonRpcPayload(value, isRequest);
  }

  return cleaned;
}

// Component to render a collapsible long base64/BoC blob
const CollapsibleBlob: React.FC<{ value: string }> = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const approxBytes = Math.round((value.length * 3) / 4);
  const isBoc = value.startsWith('te6cc');

  if (isExpanded) {
    return (
      <span className="inline">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded border border-amber-500/20 font-sans cursor-pointer hover:bg-amber-500/20 mr-1 select-none"
        >
          <ChevronDown className="w-2.5 h-2.5" /> Collapse
        </button>
        <span className="text-emerald-600 dark:text-emerald-400 break-all select-all">
          &quot;{value}&quot;
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsExpanded(true)}
      className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono cursor-pointer transition-colors"
      title="Click to view full blob"
    >
      <ChevronRight className="w-3 h-3" />
      <span>
        {isBoc ? 'BoC Cell' : 'Base64 Blob'} ({formatBytes(approxBytes)})
      </span>
      <span className="text-muted-foreground opacity-70">
        [{value.slice(0, 8)}...{value.slice(-6)}]
      </span>
    </button>
  );
};

// Interactive JSON tree / highlighter
const FormattedValue: React.FC<{ value: unknown; depth?: number }> = ({
  value,
  depth = 0,
}) => {
  const indent = '  '.repeat(depth);

  if (value === null) {
    return <span className="text-rose-500 dark:text-rose-400">null</span>;
  }
  if (typeof value === 'boolean') {
    return (
      <span className="text-purple-600 dark:text-purple-400">
        {value ? 'true' : 'false'}
      </span>
    );
  }
  if (typeof value === 'number') {
    return (
      <span className="text-sky-600 dark:text-sky-400 font-mono">{value}</span>
    );
  }
  if (typeof value === 'string') {
    if (isLargeBase64Blob(value)) {
      return <CollapsibleBlob value={value} />;
    }
    return (
      <span className="text-emerald-600 dark:text-emerald-400 break-all select-all">
        &quot;{value}&quot;
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">[]</span>;
    }
    return (
      <span className="space-y-0.5">
        <span className="text-muted-foreground">[</span>
        <div className="pl-4 border-l border-border/40 my-0.5 space-y-0.5">
          {value.map((item, idx) => (
            <div key={idx} className="flex items-start">
              <FormattedValue value={item} depth={depth + 1} />
              {idx < value.length - 1 && (
                <span className="text-muted-foreground">,</span>
              )}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">{indent}]</span>
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-muted-foreground">{'{}'}</span>;
    }

    return (
      <span className="space-y-0.5">
        <span className="text-muted-foreground">{'{'}</span>
        <div className="pl-4 border-l border-border/40 my-0.5 space-y-0.5">
          {entries.map(([k, v], idx) => (
            <div key={k} className="flex flex-wrap items-start gap-1">
              <span
                className={`font-semibold select-all ${
                  k === '_rpcMethod' || k === '$'
                    ? 'text-amber-500 font-bold'
                    : k.startsWith('_')
                      ? 'text-purple-500 font-medium'
                      : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                &quot;{k}&quot;
              </span>
              <span className="text-muted-foreground mr-1">:</span>
              <FormattedValue value={v} depth={depth + 1} />
              {idx < entries.length - 1 && (
                <span className="text-muted-foreground">,</span>
              )}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">
          {indent}
          {'}'}
        </span>
      </span>
    );
  }

  return <span>{String(value)}</span>;
};

export const PayloadViewer: React.FC<PayloadViewerProps> = ({
  title,
  payload,
  requestPayload,
  isRequest = false,
}) => {
  // Parse JSON if possible
  const { parsedJson } = useMemo(() => {
    if (!payload) return { parsedJson: null };
    try {
      const parsed = JSON.parse(payload);
      return { parsedJson: parsed };
    } catch {
      return { parsedJson: null };
    }
  }, [payload]);

  // Try decoding contract getter responses
  const decodedGetter = useMemo(() => {
    if (isRequest) return null;
    return decodeGetterResponse(requestPayload, payload);
  }, [requestPayload, payload, isRequest]);

  // Set default view mode: 'decoded' if getter decoded, else 'clean'
  const [selectedMode, setSelectedMode] = useState<
    'decoded' | 'clean' | 'raw' | null
  >(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Prepared clean payload
  const cleanPayload = useMemo(() => {
    if (!parsedJson) return null;
    return cleanJsonRpcPayload(parsedJson, isRequest);
  }, [parsedJson, isRequest]);

  if (!payload) return null;

  // Active mode resolution
  const activeMode: 'decoded' | 'clean' | 'raw' =
    selectedMode ?? (decodedGetter ? 'decoded' : 'clean');

  const handleCopy = async () => {
    try {
      let textToCopy: string;
      if (activeMode === 'decoded' && decodedGetter) {
        textToCopy = JSON.stringify(decodedGetter.data, null, 2);
      } else if (activeMode === 'clean' && cleanPayload) {
        textToCopy = JSON.stringify(cleanPayload, null, 2);
      } else {
        textToCopy = payload;
      }
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      toast.success(`${title} copied to clipboard`);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error(`Failed to copy ${title.toLowerCase()}`);
    }
  };

  const isJson = parsedJson !== null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-muted-foreground text-[11px]">
            {title}:
          </span>
          {decodedGetter && activeMode === 'decoded' && (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {decodedGetter.structName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isJson && (
            <div className="inline-flex rounded-md bg-muted/60 p-0.5 border border-border text-[10px]">
              {decodedGetter && (
                <button
                  type="button"
                  onClick={() => setSelectedMode('decoded')}
                  className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activeMode === 'decoded'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Decoded
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedMode('clean')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  activeMode === 'clean'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Clean
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('raw')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  activeMode === 'raw'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Raw
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            title={`Copy ${title}`}
          >
            {hasCopied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] overflow-x-auto text-foreground max-h-80 overflow-y-auto">
        {activeMode === 'decoded' && decodedGetter ? (
          <FormattedValue value={decodedGetter.data} />
        ) : activeMode === 'clean' && cleanPayload ? (
          <FormattedValue value={cleanPayload} />
        ) : (
          <pre className="whitespace-pre-wrap break-all text-foreground font-mono">
            {payload}
          </pre>
        )}
      </div>
    </div>
  );
};
