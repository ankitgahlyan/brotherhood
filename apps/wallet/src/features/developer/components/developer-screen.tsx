import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/core/routing';
import {
  Terminal,
  Trash2,
  Copy,
  Check,
  Search,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
  Clock,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  devTelemetry,
  type TelemetryItem,
  type ApiCallLog,
  type ConsoleLogEntry,
  type TelemetryMetrics,
} from '@/core/lib/dev-telemetry';
import { useDeveloperMode } from '@/core/lib/developer-mode';
import { Button } from '@/core/components/ui/button';
import { HeadersViewer } from './headers-viewer';
import { PayloadViewer } from './payload-viewer';

export interface DeveloperScreenProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const DeveloperScreen: React.FC<DeveloperScreenProps> = ({
  onClose,
  isModal: _isModal = false,
}) => {
  const navigate = useNavigate();
  const [developerMode, setDeveloperMode] = useDeveloperMode();
  const [items, setItems] = useState<TelemetryItem[]>(() =>
    devTelemetry.getItems(),
  );
  const [metrics, setMetrics] = useState<TelemetryMetrics>(() =>
    devTelemetry.getMetrics(),
  );

  const [activeTab, setActiveTab] = useState<'all' | 'api' | 'console'>('api');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<
    'all' | 'error' | 'warn' | 'success'
  >('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = devTelemetry.subscribe(() => {
      setItems(devTelemetry.getItems());
      setMetrics(devTelemetry.getMetrics());
    });
    return unsubscribe;
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClear = () => {
    devTelemetry.clear();
    setExpandedIds({});
    toast.success('Logs and telemetry cleared');
  };

  const handleCopyAll = async () => {
    try {
      const dataStr = JSON.stringify(items, null, 2);
      await navigator.clipboard.writeText(dataStr);
      setHasCopied(true);
      toast.success('Copied telemetry logs to clipboard');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'api' && item.type !== 'api') return false;
      if (activeTab === 'console' && item.type !== 'console') return false;

      // Quick filter
      if (filterLevel === 'error') {
        if (
          item.type === 'api' &&
          item.status !== 'failed' &&
          (typeof item.status !== 'number' || item.status < 400)
        ) {
          return false;
        }
        if (item.type === 'console' && item.level !== 'error') {
          return false;
        }
      } else if (filterLevel === 'warn') {
        if (item.type === 'console' && item.level !== 'warn') return false;
        if (item.type === 'api') return false;
      } else if (filterLevel === 'success') {
        if (
          item.type !== 'api' ||
          typeof item.status !== 'number' ||
          item.status < 200 ||
          item.status >= 300
        ) {
          return false;
        }
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      if (item.type === 'api') {
        return (
          item.url.toLowerCase().includes(q) ||
          item.method.toLowerCase().includes(q) ||
          String(item.status).toLowerCase().includes(q) ||
          (item.responsePreview &&
            item.responsePreview.toLowerCase().includes(q)) ||
          (item.requestBody && item.requestBody.toLowerCase().includes(q)) ||
          (item.error && item.error.toLowerCase().includes(q))
        );
      } else {
        return (
          item.level.toLowerCase().includes(q) ||
          item.messages.some((msg) => msg.toLowerCase().includes(q))
        );
      }
    });
  }, [items, activeTab, filterLevel, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose ? onClose : () => navigate('/')}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold border border-border transition-colors flex items-center gap-1 cursor-pointer"
              aria-label={onClose ? 'Close diagnostics' : 'Back to wallet'}
            >
              {onClose ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </>
              ) : (
                <span>← Back</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              <h1 className="text-base font-bold text-foreground">
                Developer Diagnostics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Developer Mode
            </span>
            <button
              type="button"
              onClick={() => {
                const nextState = !developerMode;
                setDeveloperMode(nextState);
                if (!nextState) {
                  toast.info('Developer Mode disabled');
                  if (onClose) onClose();
                } else {
                  toast.success('Developer Mode enabled');
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors cursor-pointer ${
                developerMode
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {developerMode ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Total API Calls</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground font-mono">
              {metrics.totalApiCalls}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Active / In-Flight</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  metrics.activeApiCalls > 0
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-muted'
                }`}
              />
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-mono">
              {metrics.activeApiCalls}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Failed API Calls</span>
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                metrics.failedApiCalls > 0 ? 'text-red-500' : 'text-foreground'
              }`}
            >
              {metrics.failedApiCalls}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Console Errors</span>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                metrics.consoleErrors > 0 ? 'text-red-500' : 'text-foreground'
              }`}
            >
              {metrics.consoleErrors}
            </div>
          </div>
        </div>

        {/* Action Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex rounded-xl bg-secondary/80 p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'api'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              API Calls ({metrics.totalApiCalls})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'console'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Console Logs ({items.filter((i) => i.type === 'console').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({items.length})
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs h-8 gap-1.5"
            >
              {hasCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{hasCopied ? 'Copied' : 'Copy JSON'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Search & Severity Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL, method, error, payload..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterLevel('all')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                filterLevel === 'all'
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('error')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                filterLevel === 'error'
                  ? 'bg-red-500 text-white border-red-500 font-semibold'
                  : 'bg-card text-red-500 border-border hover:bg-red-500/10'
              }`}
            >
              Errors
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('warn')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                filterLevel === 'warn'
                  ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                  : 'bg-card text-amber-500 border-border hover:bg-amber-500/10'
              }`}
            >
              Warnings
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('success')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                filterLevel === 'success'
                  ? 'bg-emerald-500 text-white border-emerald-500 font-semibold'
                  : 'bg-card text-emerald-500 border-border hover:bg-emerald-500/10'
              }`}
            >
              2xx Success
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
              <Terminal className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No telemetry entries recorded
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? 'No matching calls or logs for your search query.'
                  : 'Outgoing API calls and console output will appear here in real time.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              if (item.type === 'api') {
                return (
                  <ApiCard
                    key={item.id}
                    item={item}
                    isExpanded={!!expandedIds[item.id]}
                    onToggle={() => toggleExpand(item.id)}
                  />
                );
              } else {
                return (
                  <ConsoleCard
                    key={item.id}
                    item={item}
                    isExpanded={!!expandedIds[item.id]}
                    onToggle={() => toggleExpand(item.id)}
                  />
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ApiCard: React.FC<{
  item: ApiCallLog;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ item, isExpanded, onToggle }) => {
  const isPending = item.status === 'pending';
  const isFailed =
    item.status === 'failed' ||
    (typeof item.status === 'number' && item.status >= 400);
  const isSuccess =
    typeof item.status === 'number' && item.status >= 200 && item.status < 300;

  const timeStr = new Date(item.timestamp).toLocaleTimeString();

  const rpcMethod = useMemo(() => {
    if (!item.requestBody) return null;
    try {
      const parsed = JSON.parse(item.requestBody);
      return typeof parsed?.method === 'string' ? parsed.method : null;
    } catch {
      return null;
    }
  }, [item.requestBody]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs">
      <div
        onClick={onToggle}
        className="p-3 flex items-start gap-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
              item.method === 'POST'
                ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                : item.method === 'GET'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}
          >
            {item.method}
          </span>
          {rpcMethod && (
            <span
              className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 max-w-[70px] truncate text-center"
              title={rpcMethod}
            >
              {rpcMethod}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                isPending
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                  : isSuccess
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : isFailed
                      ? 'bg-red-500/10 text-red-500 border-red-500/30'
                      : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {item.status} {item.statusText || ''}
            </span>

            {item.durationMs !== undefined && (
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.durationMs}ms
              </span>
            )}

            <span className="text-[10px] text-muted-foreground ml-auto">
              {timeStr}
            </span>
          </div>

          <p className="text-xs font-mono text-foreground break-all mt-1.5 select-text font-medium">
            {item.url}
          </p>
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
          aria-label="Toggle details"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-secondary/30 p-3 space-y-3 text-xs">
          {item.error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[11px] break-all">
              <strong>Error:</strong> {item.error}
            </div>
          )}

          {item.requestHeaders &&
            Object.keys(item.requestHeaders).length > 0 && (
              <HeadersViewer headers={item.requestHeaders} />
            )}

          {item.requestBody && (
            <PayloadViewer
              title="Request Body"
              payload={item.requestBody}
              isRequest
            />
          )}

          {item.responsePreview && (
            <PayloadViewer
              title="Response Body"
              payload={item.responsePreview}
            />
          )}
        </div>
      )}
    </div>
  );
};

const ConsoleCard: React.FC<{
  item: ConsoleLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ item, isExpanded, onToggle }) => {
  const isError = item.level === 'error';
  const isWarn = item.level === 'warn';
  const isInfo = item.level === 'info';
  const timeStr = new Date(item.timestamp).toLocaleTimeString();

  const joinedText = item.messages.join(' ');
  const isLong = joinedText.length > 200 || item.messages.length > 1;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all shadow-xs ${
        isError
          ? 'bg-red-500/5 border-red-500/30'
          : isWarn
            ? 'bg-amber-500/5 border-amber-500/30'
            : 'bg-card border-border'
      }`}
    >
      <div
        onClick={isLong ? onToggle : undefined}
        className={`p-3 flex items-start gap-2.5 ${isLong ? 'cursor-pointer hover:bg-muted/30' : ''}`}
      >
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 pt-0.5 ${
            isError
              ? 'bg-red-500/10 text-red-500 border-red-500/30'
              : isWarn
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : isInfo
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {item.level}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="font-mono">console.{item.level}</span>
            <span>{timeStr}</span>
          </div>

          <pre
            className={`text-xs font-mono text-foreground break-all whitespace-pre-wrap select-text ${
              !isExpanded && isLong ? 'line-clamp-2' : ''
            }`}
          >
            {joinedText}
          </pre>
        </div>

        {isLong && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
            aria-label="Toggle details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {isExpanded && isLong && item.messages.length > 1 && (
        <div className="border-t border-border bg-secondary/20 p-3 space-y-2 text-xs">
          <span className="font-semibold text-muted-foreground block text-[11px]">
            Arguments:
          </span>
          {item.messages.map((msg, i) => (
            <pre
              key={i}
              className="p-2 rounded-lg bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all text-foreground"
            >
              {msg}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
};
