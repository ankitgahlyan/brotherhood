import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  Plus,
  Edit2,
  Copy,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/core/components/ui/button';
import { queryClient } from '@/lib/brotherhood/ton';
import { StorageEditorDialog } from './storage-editor-dialog';

interface LocalStorageEntry {
  key: string;
  value: string;
  sizeBytes: number;
  isJson: boolean;
}

interface IndexedDbInfo {
  name: string;
  version: number;
}

interface QueryCacheEntry {
  queryHash: string;
  queryKey: unknown[];
  status: string;
  fetchStatus: string;
  dataUpdatedAt: number;
  data: unknown;
}

const DEV_MODE_KEY = 'brotherhood_developer_mode';

export const DbStateExplorer: React.FC = () => {
  const [subTab, setSubTab] = useState<
    'localstorage' | 'indexeddb' | 'querycache'
  >('localstorage');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // LocalStorage state
  const [lsEntries, setLsEntries] = useState<LocalStorageEntry[]>([]);
  const [editingItem, setEditingItem] = useState<{
    key: string;
    value: string;
    isNew: boolean;
  } | null>(null);

  // IndexedDB state
  const [idbDatabases, setIdbDatabases] = useState<IndexedDbInfo[]>([]);
  const [loadingIdb, setLoadingIdb] = useState(false);

  // Query cache state
  const [queryEntries, setQueryEntries] = useState<QueryCacheEntry[]>([]);

  // Load LocalStorage entries
  const loadLocalStorage = useCallback(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const entries: LocalStorageEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? '';
      let isJson = false;
      try {
        JSON.parse(value);
        isJson = true;
      } catch {
        isJson = false;
      }
      entries.push({
        key,
        value,
        sizeBytes: new Blob([key, value]).size,
        isJson,
      });
    }
    entries.sort((a, b) => a.key.localeCompare(b.key));
    setLsEntries(entries);
  }, []);

  // Load IndexedDB databases
  const loadIndexedDb = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !window.indexedDB ||
      !('databases' in indexedDB)
    ) {
      setIdbDatabases([]);
      return;
    }
    try {
      setLoadingIdb(true);
      const dbs = await indexedDB.databases();
      setIdbDatabases(
        dbs
          .filter((db) => db.name)
          .map((db) => ({
            name: db.name as string,
            version: db.version ?? 1,
          })),
      );
    } catch {
      setIdbDatabases([]);
    } finally {
      setLoadingIdb(false);
    }
  }, []);

  // Load Query Cache
  const loadQueryCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const list: QueryCacheEntry[] = queries.map((q) => ({
      queryHash: q.queryHash,
      queryKey: q.queryKey as unknown[],
      status: q.state.status,
      fetchStatus: q.state.fetchStatus,
      dataUpdatedAt: q.state.dataUpdatedAt,
      data: q.state.data,
    }));
    setQueryEntries(list);
  }, []);

  useEffect(() => {
    loadLocalStorage();
    loadIndexedDb();
    loadQueryCache();
  }, [loadLocalStorage, loadIndexedDb, loadQueryCache]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = async (id: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // LocalStorage Actions
  const handleSaveLs = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      loadLocalStorage();
      toast.success(`Saved key "${key}"`);
    } catch (e) {
      toast.error(`Failed to save: ${(e as Error).message}`);
    }
  };

  const handleDeleteLs = (key: string) => {
    const previousValue = localStorage.getItem(key);
    try {
      localStorage.removeItem(key);
      loadLocalStorage();
      toast.success(`Deleted key "${key}"`, {
        action: previousValue
          ? {
              label: 'Undo',
              onClick: () => {
                localStorage.setItem(key, previousValue);
                loadLocalStorage();
                toast.info(`Restored "${key}"`);
              },
            }
          : undefined,
      });
    } catch (e) {
      toast.error(`Failed to delete: ${(e as Error).message}`);
    }
  };

  const handleClearLocalStorage = (keepDevMode = true) => {
    const snapshot: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) snapshot[k] = localStorage.getItem(k) ?? '';
    }

    const devModeVal = localStorage.getItem(DEV_MODE_KEY);
    localStorage.clear();

    if (keepDevMode && devModeVal !== null) {
      localStorage.setItem(DEV_MODE_KEY, devModeVal);
    }

    loadLocalStorage();
    toast.success(
      keepDevMode
        ? 'LocalStorage cleared (Developer Mode preserved)'
        : 'LocalStorage cleared completely',
      {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            Object.entries(snapshot).forEach(([k, v]) =>
              localStorage.setItem(k, v),
            );
            loadLocalStorage();
            toast.info('LocalStorage restored');
          },
        },
      },
    );
  };

  // IndexedDB Actions
  const handleDeleteIdb = async (dbName: string) => {
    try {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => {
        toast.success(`IndexedDB "${dbName}" deleted`);
        loadIndexedDb();
      };
      req.onerror = () => {
        toast.error(`Failed to delete IndexedDB "${dbName}"`);
      };
      req.onblocked = () => {
        toast.warning(`Deletion of "${dbName}" blocked. Close open tabs.`);
      };
    } catch (e) {
      toast.error(`Failed to delete: ${(e as Error).message}`);
    }
  };

  // Query Cache Actions
  const handleClearQueryCache = () => {
    queryClient.clear();
    loadQueryCache();
    toast.success('Query cache cleared');
  };

  const handleInvalidateQuery = async (queryKey: unknown[]) => {
    await queryClient.invalidateQueries({ queryKey });
    loadQueryCache();
    toast.success('Query invalidated & refreshed');
  };

  // Nuclear Reset All State
  const handleNuclearReset = () => {
    const snapshotLs: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) snapshotLs[k] = localStorage.getItem(k) ?? '';
    }

    const devModeVal = localStorage.getItem(DEV_MODE_KEY);
    localStorage.clear();
    if (devModeVal !== null) {
      localStorage.setItem(DEV_MODE_KEY, devModeVal);
    }

    queryClient.clear();
    idbDatabases.forEach((db) => {
      try {
        indexedDB.deleteDatabase(db.name);
      } catch {
        // ignore
      }
    });

    loadLocalStorage();
    loadIndexedDb();
    loadQueryCache();

    toast.success('All client state cleared (Dev mode kept)', {
      duration: 6000,
      action: {
        label: 'Undo LS',
        onClick: () => {
          Object.entries(snapshotLs).forEach(([k, v]) =>
            localStorage.setItem(k, v),
          );
          loadLocalStorage();
          toast.info('LocalStorage restored');
        },
      },
    });
  };

  // Filtered lists
  const filteredLsEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return lsEntries;
    return lsEntries.filter(
      (e) =>
        e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
    );
  }, [lsEntries, searchQuery]);

  const filteredQueries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return queryEntries;
    return queryEntries.filter(
      (e) =>
        e.queryHash.toLowerCase().includes(q) ||
        JSON.stringify(e.queryKey).toLowerCase().includes(q),
    );
  }, [queryEntries, searchQuery]);

  const totalLsBytes = useMemo(
    () => lsEntries.reduce((acc, curr) => acc + curr.sizeBytes, 0),
    [lsEntries],
  );

  return (
    <div className="space-y-4">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>LocalStorage</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {lsEntries.length} keys
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            ~{(totalLsBytes / 1024).toFixed(1)} KB used
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>IndexedDB</span>
            <Database className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {idbDatabases.length} DBs
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            Browser databases
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Query Cache</span>
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {queryEntries.length} queries
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            Active in memory
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Nuclear Reset</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleNuclearReset}
            className="w-full text-[11px] h-7 mt-2 bg-rose-600 hover:bg-rose-700 font-semibold"
          >
            Clear All State
          </Button>
        </div>
      </div>

      {/* Sub-tabs and action bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex rounded-xl bg-secondary/80 p-1 border border-border">
          <button
            type="button"
            onClick={() => setSubTab('localstorage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'localstorage'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            LocalStorage ({lsEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('indexeddb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'indexeddb'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            IndexedDB ({idbDatabases.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('querycache')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'querycache'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Query Cache ({queryEntries.length})
          </button>
        </div>

        {/* Action Controls for Current SubTab */}
        <div className="flex items-center gap-2">
          {subTab === 'localstorage' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditingItem({ key: '', value: '', isNew: true })
                }
                className="text-xs h-8 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Add Key</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearLocalStorage(true)}
                className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5"
                title="Clears all keys except Developer Mode flag"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear LocalStorage</span>
              </Button>
            </>
          )}

          {subTab === 'indexeddb' && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadIndexedDb}
              disabled={loadingIdb}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingIdb ? 'animate-spin' : ''}`}
              />
              <span>Refresh DBs</span>
            </Button>
          )}

          {subTab === 'querycache' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={loadQueryCache}
                className="text-xs h-8 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearQueryCache}
                className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${
            subTab === 'localstorage'
              ? 'keys & values'
              : subTab === 'querycache'
                ? 'query keys & hashes'
                : 'databases'
          }...`}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      {/* Content Area */}
      {subTab === 'localstorage' && (
        <div className="space-y-2">
          {filteredLsEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
              <HardDrive className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No LocalStorage keys found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? 'No matching keys found for your filter.'
                  : 'LocalStorage is currently empty.'}
              </p>
            </div>
          ) : (
            filteredLsEntries.map((item) => {
              const isExpanded = !!expandedKeys[item.key];
              const isDevMode = item.key === DEV_MODE_KEY;

              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                >
                  <div className="p-3 flex items-start gap-2.5 hover:bg-muted/30 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.key)}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleExpand(item.key)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 break-all select-all">
                          {item.key}
                        </span>
                        {isDevMode && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold">
                            System Flag
                          </span>
                        )}
                        {item.isJson && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-500 border border-purple-500/30">
                            JSON
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                          {item.sizeBytes < 1024
                            ? `${item.sizeBytes} B`
                            : `${(item.sizeBytes / 1024).toFixed(1)} KB`}
                        </span>
                      </div>

                      {!isExpanded && (
                        <p className="text-xs font-mono text-muted-foreground truncate mt-1">
                          {item.value}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(item.key, item.value, 'Value')
                        }
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                        title="Copy value"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            key: item.key,
                            value: item.value,
                            isNew: false,
                          })
                        }
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                        title="Edit value"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLs(item.key)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold">Value Content:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `${item.key}-key`,
                                item.key,
                                'Key name',
                              )
                            }
                            className="text-[10px] text-blue-500 hover:underline font-mono"
                          >
                            Copy Key
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(item.key, item.value, 'Value')
                            }
                            className="text-[10px] text-blue-500 hover:underline font-mono"
                          >
                            Copy Value
                          </button>
                        </div>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] overflow-x-auto text-foreground whitespace-pre-wrap break-all max-h-72 overflow-y-auto">
                        {item.isJson
                          ? JSON.stringify(JSON.parse(item.value), null, 2)
                          : item.value}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {subTab === 'indexeddb' && (
        <div className="space-y-2">
          {idbDatabases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
              <Database className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No IndexedDB databases found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The browser has not created any IndexedDB databases for this
                origin yet.
              </p>
            </div>
          ) : (
            idbDatabases.map((db) => (
              <div
                key={db.name}
                className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Database className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {db.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2">
                      v{db.version}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteIdb(db.name)}
                  className="text-xs h-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete DB</span>
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'querycache' && (
        <div className="space-y-2">
          {filteredQueries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
              <Layers className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No active queries cached
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? 'No matching queries for your filter.'
                  : 'The TanStack Query cache is currently empty.'}
              </p>
            </div>
          ) : (
            filteredQueries.map((item) => {
              const isExpanded = !!expandedKeys[item.queryHash];
              const queryKeyStr = JSON.stringify(item.queryKey);

              return (
                <div
                  key={item.queryHash}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                >
                  <div className="p-3 flex items-start gap-2.5 hover:bg-muted/30 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.queryHash)}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleExpand(item.queryHash)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all select-all">
                          {queryKeyStr}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                            item.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : item.status === 'error'
                                ? 'bg-red-500/10 text-red-500 border-red-500/30'
                                : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.fetchStatus === 'fetching' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse font-semibold">
                            fetching
                          </span>
                        )}
                      </div>

                      {item.dataUpdatedAt > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Updated:{' '}
                          {new Date(item.dataUpdatedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInvalidateQuery(item.queryKey)}
                        className="text-[11px] h-7 px-2 gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                        title="Invalidate & Refetch"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refetch</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            item.queryHash,
                            JSON.stringify(item.data, null, 2),
                            'Query Data',
                          )
                        }
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                        title="Copy query data"
                      >
                        {copiedKey === item.queryHash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 p-3 space-y-2 text-xs">
                      <span className="font-semibold text-muted-foreground block text-[11px]">
                        Cached Data:
                      </span>
                      <pre className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] overflow-x-auto text-foreground whitespace-pre-wrap break-all max-h-72 overflow-y-auto">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit/Add Dialog */}
      {editingItem && (
        <StorageEditorDialog
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          initialKey={editingItem.key}
          initialValue={editingItem.value}
          isNewKey={editingItem.isNew}
          onSave={handleSaveLs}
        />
      )}
    </div>
  );
};
