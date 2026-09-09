import React, { useState, useEffect, useMemo } from 'react';
import {
  devTelemetry,
  type ComponentStat,
  type TelemetryMetrics,
} from '@/core/lib/dev-telemetry';
import {
  Activity,
  Zap,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Layers,
  ArrowDownRight,
} from 'lucide-react';

export const ComponentAnalyticsView: React.FC = () => {
  const [componentStats, setComponentStats] = useState<ComponentStat[]>(() =>
    devTelemetry.getComponentStats(),
  );
  const [metrics, setMetrics] = useState<TelemetryMetrics>(() =>
    devTelemetry.getMetrics(),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = devTelemetry.subscribe(() => {
      setComponentStats(devTelemetry.getComponentStats());
      setMetrics(devTelemetry.getMetrics());
    });
    return unsubscribe;
  }, []);

  const filteredStats = useMemo(() => {
    return componentStats.filter((stat) => {
      if (categoryFilter !== 'all' && stat.callerCategory !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stat.callerName.toLowerCase().includes(q);
        const matchesMethods = Object.keys(stat.methods).some((m) =>
          m.toLowerCase().includes(q),
        );
        return matchesName || matchesMethods;
      }
      return true;
    });
  }, [componentStats, categoryFilter, searchQuery]);

  const totalBandwidthBytes = useMemo(() => {
    return componentStats.reduce((acc, curr) => acc + curr.totalBytes, 0);
  }, [componentStats]);

  const mostActive = componentStats[0] || null;

  const maxCalls = useMemo(() => {
    return componentStats.length > 0
      ? Math.max(...componentStats.map((s) => s.totalCalls))
      : 1;
  }, [componentStats]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getCategoryColor = (category: ComponentStat['callerCategory']) => {
    switch (category) {
      case 'hook':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'rpc':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'system':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getBarColor = (category: ComponentStat['callerCategory']) => {
    switch (category) {
      case 'hook':
        return 'bg-blue-500';
      case 'rpc':
        return 'bg-amber-500';
      case 'system':
        return 'bg-purple-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Total API Calls</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {metrics.totalApiCalls}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {componentStats.length} callers tracked
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Most Active Caller</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div
            className="text-sm font-extrabold text-amber-500 font-mono truncate"
            title={mostActive?.callerName || 'None'}
          >
            {mostActive ? mostActive.callerName : 'None'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {mostActive ? `${mostActive.totalCalls} calls` : '0 calls'}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Data Volume</span>
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-500 font-mono">
            {formatBytes(totalBandwidthBytes)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            JSON-RPC payloads
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Failed Calls</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              metrics.failedApiCalls > 0 ? 'text-red-500' : 'text-foreground'
            }`}
          >
            {metrics.failedApiCalls}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {metrics.totalApiCalls > 0
              ? `${((metrics.failedApiCalls / metrics.totalApiCalls) * 100).toFixed(1)}% error rate`
              : '0% error rate'}
          </div>
        </div>
      </div>

      {/* Minimization & Optimization Status Banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Call Minimization & Cache Optimizations</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="flex items-start gap-1.5 bg-background/60 p-2 rounded-lg border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Deterministic Wallet Cache
              </span>
              <span className="text-muted-foreground">
                ADR 0013 active. Eliminates repeated address resolution RPCs.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-background/60 p-2 rounded-lg border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Unified Balance Derivation
              </span>
              <span className="text-muted-foreground">
                Reuses FiWallet state balance. Eliminates duplicate
                /jetton/wallets.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-background/60 p-2 rounded-lg border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                RPC Probe Throttling
              </span>
              <span className="text-muted-foreground">
                5-minute TTL on testnet candidate health checks.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Call Volume Breakdown (Bar Graph) */}
      {componentStats.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-foreground">
                Call Volume Distribution
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Top callers by request frequency
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {componentStats.slice(0, 7).map((stat) => {
              const pct = Math.round((stat.totalCalls / maxCalls) * 100);
              const shareOfAll = metrics.totalApiCalls
                ? Math.round((stat.totalCalls / metrics.totalApiCalls) * 100)
                : 0;

              return (
                <div key={stat.callerName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${getCategoryColor(
                          stat.callerCategory,
                        )}`}
                      >
                        {stat.callerCategory}
                      </span>
                      <span
                        className="font-medium text-foreground truncate"
                        title={stat.callerName}
                      >
                        {stat.callerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-shrink-0">
                      <span>
                        <strong className="text-foreground">
                          {stat.totalCalls}
                        </strong>{' '}
                        calls
                      </span>
                      <span className="text-[10px]">({shareOfAll}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                        stat.callerCategory,
                      )}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by component name or RPC method..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 hidden sm:inline" />
          {['all', 'hook', 'rpc', 'system', 'other'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium capitalize transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component Attribution Detail Cards / Table */}
      <div className="space-y-2">
        {filteredStats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
            <Layers className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No component telemetry recorded
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Outgoing queries and RPC requests will be automatically attributed
              here.
            </p>
          </div>
        ) : (
          filteredStats.map((stat) => (
            <div
              key={stat.callerName}
              className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2.5 transition-all hover:border-border/80"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getCategoryColor(
                        stat.callerCategory,
                      )}`}
                    >
                      {stat.callerCategory}
                    </span>
                    <h4 className="text-xs font-bold text-foreground font-mono truncate">
                      {stat.callerName}
                    </h4>
                    {stat.failedCalls > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-bold">
                        {stat.failedCalls} failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-secondary border border-border">
                    {stat.totalCalls} {stat.totalCalls === 1 ? 'call' : 'calls'}
                  </span>
                </div>
              </div>

              {/* Methods & Operations Triggered */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" /> Ops:
                </span>
                {Object.entries(stat.methods).map(([methodName, count]) => (
                  <span
                    key={methodName}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border flex items-center gap-1"
                  >
                    <span>{methodName}</span>
                    <span className="font-bold text-foreground">×{count}</span>
                  </span>
                ))}
              </div>

              {/* Metrics Footer */}
              <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>
                    Avg{' '}
                    <strong className="text-foreground">
                      {stat.avgDurationMs}ms
                    </strong>
                  </span>
                </div>

                {stat.totalBytes > 0 && (
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-muted-foreground" />
                    <span>
                      Vol{' '}
                      <strong className="text-foreground">
                        {formatBytes(stat.totalBytes)}
                      </strong>
                    </span>
                  </div>
                )}

                <div className="ml-auto text-[10px]">
                  Last active {new Date(stat.lastCalledAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
