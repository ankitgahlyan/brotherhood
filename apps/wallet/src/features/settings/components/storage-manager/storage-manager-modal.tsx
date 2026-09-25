/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Database,
  Trash2,
  Sparkles,
  RefreshCw,
  HardDrive,
  History,
  Coins,
  Network,
  Users,
  Radio,
  Search,
  Plus,
  Edit2,
  Download,
  Upload,
  ShieldAlert,
  X,
  FileCode,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWalletStore, useWalletStoreApi } from '@demo/wallet-core';
import { useContactBookStore } from '@/core/storage/useContactBookStore';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';

export function safeJsonStringify(value: unknown, space?: number): string {
  try {
    return JSON.stringify(
      value,
      (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
      space,
    );
  } catch {
    return String(value);
  }
}

interface StorageCategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  itemCount: number;
  estimatedBytes: number;
  onClear: () => void;
}

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StorageTab = 'overview' | 'explorer';

interface SliceDefinition {
  id: string;
  name: string;
  description: string;
  isProtected: boolean;
  icon: React.ReactNode;
}

const SLICE_DEFINITIONS: SliceDefinition[] = [
  {
    id: 'eventsByAddress',
    name: 'Transaction History (eventsByAddress)',
    description: 'Cleaned transaction events and opcode history per address',
    isProtected: false,
    icon: <History className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'jettonsByAddress',
    name: 'Jetton Balances (jettonsByAddress)',
    description:
      'Cached token lists, verification tags, and balances per address',
    isProtected: false,
    icon: <Coins className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'brotherhoodByAddress',
    name: 'Brotherhood State (brotherhoodByAddress)',
    description:
      'Cached brotherhood memberships, credit lines, and member records',
    isProtected: false,
    icon: <Network className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'pendingDeferredByAddress',
    name: 'Deferred Payments (pendingDeferredByAddress)',
    description: 'Pending and uncollected deferred payouts per address',
    isProtected: false,
    icon: <Network className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'associatedAddressesByAddress',
    name: 'Associated Contracts (associatedAddresses)',
    description: 'Derived deterministic contract addresses and child pointers',
    isProtected: false,
    icon: <HardDrive className="w-4 h-4 text-pink-400" />,
  },
  {
    id: 'contactsByNetwork',
    name: 'Contact Book (contactsByNetwork)',
    description: 'Custom nicknames, addresses, and user notes',
    isProtected: false,
    icon: <Users className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'recentByNetwork',
    name: 'Recent Recipients (recentByNetwork)',
    description: 'Recent recipient addresses for send suggestions',
    isProtected: false,
    icon: <Users className="w-4 h-4 text-orange-400" />,
  },
  {
    id: 'requestQueue',
    name: 'TonConnect Requests (requestQueue)',
    description: 'Active and queued TonConnect bridge signatures',
    isProtected: false,
    icon: <Radio className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'savedWallets',
    name: 'Saved Wallets (savedWallets)',
    description: 'Active wallet accounts and network configurations',
    isProtected: true,
    icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getJsonByteSize(obj: unknown): number {
  try {
    return new Blob([safeJsonStringify(obj || {})]).size;
  } catch {
    return 0;
  }
}

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const storeApi = useWalletStoreApi();
  const [activeTab, setActiveTab] = useState<StorageTab>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPruning, setIsPruning] = useState(false);

  // Store Explorer State
  const [selectedSliceId, setSelectedSliceId] =
    useState<string>('eventsByAddress');
  const [explorerSearch, setExplorerSearch] = useState('');

  // Entry Editor Modal State
  const [editingEntryKey, setEditingEntryKey] = useState<string | null>(null);
  const [editingJsonText, setEditingJsonText] = useState('');
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(
    null,
  );

  // Add Entry Modal State
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntryKey, setNewEntryKey] = useState('');
  const [newEntryJson, setNewEntryJson] = useState('{}');
  const [newEntryError, setNewEntryError] = useState<string | null>(null);

  // Import Slice Modal State
  const [isImportingSlice, setIsImportingSlice] = useState(false);
  const [importSliceJson, setImportSliceJson] = useState('');
  const [importSliceError, setImportSliceError] = useState<string | null>(null);

  // Read full state from store
  const fullStoreState = useWalletStore((state) => state);
  const eventsByAddress = fullStoreState.walletManagement?.eventsByAddress;
  const jettonsByAddress = fullStoreState.jettons?.jettonsByAddress;
  const brotherhoodByAddress = fullStoreState.brotherhood?.brotherhoodByAddress;
  const pendingDeferredByAddress =
    fullStoreState.brotherhood?.pendingDeferredByAddress;
  const associatedAddressesByAddress =
    fullStoreState.walletManagement?.associatedAddressesByAddress;
  const requestQueue = fullStoreState.tonConnect?.requestQueue?.items;
  const savedWallets = fullStoreState.walletManagement?.savedWallets;

  const contactsByNetwork = useContactBookStore(
    (state) => state.contactsByNetwork,
  );
  const recentByNetwork = useContactBookStore((state) => state.recentByNetwork);

  // Total localStorage usage
  const totalStorageBytes = useMemo(() => {
    // Depend on live store slices to re-evaluate storage usage when state mutations occur
    if (
      !refreshKey &&
      !eventsByAddress &&
      !jettonsByAddress &&
      !brotherhoodByAddress &&
      !contactsByNetwork
    ) {
      // noop
    }
    if (typeof window === 'undefined') return 0;
    try {
      let total = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          total +=
            (key.length + (window.localStorage.getItem(key)?.length || 0)) * 2;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }, [
    refreshKey,
    eventsByAddress,
    jettonsByAddress,
    brotherhoodByAddress,
    contactsByNetwork,
  ]);

  // Overview Categories
  const categories = useMemo<StorageCategoryInfo[]>(() => {
    const historyEventsCount = Object.values(eventsByAddress || {}).reduce(
      (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
      0,
    );
    const historyBytes = getJsonByteSize(eventsByAddress);

    const jettonsCount = Object.values(jettonsByAddress || {}).reduce(
      (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
      0,
    );
    const jettonsBytes = getJsonByteSize(jettonsByAddress);

    const brotherhoodCount =
      Object.keys(brotherhoodByAddress || {}).length +
      Object.keys(pendingDeferredByAddress || {}).length;
    const brotherhoodBytes =
      getJsonByteSize(brotherhoodByAddress) +
      getJsonByteSize(pendingDeferredByAddress);

    const tonConnectCount = requestQueue?.length || 0;
    const tonConnectBytes = getJsonByteSize(requestQueue);

    const totalContacts = Object.values(contactsByNetwork || {}).reduce(
      (acc, netMap) => acc + Object.keys(netMap || {}).length,
      0,
    );
    const contactsCount =
      totalContacts + Object.keys(associatedAddressesByAddress || {}).length;
    const contactsBytes =
      getJsonByteSize(contactsByNetwork) +
      getJsonByteSize(associatedAddressesByAddress);

    return [
      {
        id: 'history',
        name: 'Transaction History',
        description: 'Cached events, opcodes, and transaction display rows',
        icon: <History className="w-4 h-4 text-blue-400" />,
        itemCount: historyEventsCount,
        estimatedBytes: historyBytes,
        onClear: () => {
          storeApi.setState((state) => ({
            walletManagement: {
              ...state.walletManagement,
              eventsByAddress: {},
              events: [],
              confirmedTraceIds: [],
              confirmedExternalHashes: [],
            },
          }));
          toast.success('Transaction history cache cleared');
          setRefreshKey((k) => k + 1);
        },
      },
      {
        id: 'jettons',
        name: 'Jetton Balances',
        description: 'Cached token lists, verification tags, and balances',
        icon: <Coins className="w-4 h-4 text-emerald-400" />,
        itemCount: jettonsCount,
        estimatedBytes: jettonsBytes,
        onClear: () => {
          storeApi.setState((state) => ({
            jettons: state.jettons
              ? {
                  ...state.jettons,
                  jettonsByAddress: {},
                  lastJettonsUpdate: 0,
                }
              : state.jettons,
          }));
          toast.success('Jetton cache cleared');
          setRefreshKey((k) => k + 1);
        },
      },
      {
        id: 'brotherhood',
        name: 'Brotherhood Contract State',
        description: 'Cached membership data, credit, and deferred payments',
        icon: <Network className="w-4 h-4 text-purple-400" />,
        itemCount: brotherhoodCount,
        estimatedBytes: brotherhoodBytes,
        onClear: () => {
          storeApi.setState((state) => ({
            brotherhood: state.brotherhood
              ? {
                  ...state.brotherhood,
                  brotherhoodByAddress: {},
                  pendingDeferredByAddress: {},
                }
              : state.brotherhood,
          }));
          toast.success('Brotherhood state cache cleared');
          setRefreshKey((k) => k + 1);
        },
      },
      {
        id: 'tonconnect',
        name: 'TonConnect Queue',
        description: 'Pending dApp request items and signatures',
        icon: <Radio className="w-4 h-4 text-cyan-400" />,
        itemCount: tonConnectCount,
        estimatedBytes: tonConnectBytes,
        onClear: () => {
          storeApi.setState((state) => ({
            tonConnect: state.tonConnect
              ? {
                  ...state.tonConnect,
                  requestQueue: {
                    items: [],
                    currentRequestId: undefined,
                    isProcessing: false,
                  },
                }
              : state.tonConnect,
          }));
          toast.success('TonConnect queue cleared');
          setRefreshKey((k) => k + 1);
        },
      },
      {
        id: 'contacts',
        name: 'Contacts & Nicknames',
        description: 'Saved address book contacts and known contracts',
        icon: <Users className="w-4 h-4 text-amber-400" />,
        itemCount: contactsCount,
        estimatedBytes: contactsBytes,
        onClear: () => {
          useContactBookStore.setState({
            contactsByNetwork: {},
            recentByNetwork: {},
          });
          storeApi.setState((state) => ({
            walletManagement: {
              ...state.walletManagement,
              associatedAddressesByAddress: {},
            },
          }));
          toast.success('Address book and contact entries cleared');
          setRefreshKey((k) => k + 1);
        },
      },
    ];
  }, [
    eventsByAddress,
    jettonsByAddress,
    brotherhoodByAddress,
    pendingDeferredByAddress,
    requestQueue,
    contactsByNetwork,
    associatedAddressesByAddress,
    storeApi,
  ]);

  // Clean and prune action
  const handlePruneTracesAndSanitize = useCallback(() => {
    setIsPruning(true);
    try {
      storeApi.setState((state) => ({
        walletManagement: {
          ...state.walletManagement,
          eventsByAddress: Object.fromEntries(
            Object.entries(state.walletManagement.eventsByAddress || {}).map(
              ([addr, list]) => [
                addr,
                (list || []).slice(0, 20).map((ev) => {
                  const {
                    trace: _trace,
                    transactions: _transactions,
                    ...clean
                  } = ev as any;
                  return clean;
                }),
              ],
            ),
          ),
        },
      }));

      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('bro-store');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.walletManagement?.eventsByAddress) {
              const cleaned: Record<string, any[]> = {};
              for (const [addr, list] of Object.entries(
                parsed.state.walletManagement.eventsByAddress,
              )) {
                if (Array.isArray(list)) {
                  cleaned[addr] = list.slice(0, 20).map((ev: any) => {
                    if (!ev || typeof ev !== 'object') return ev;
                    const {
                      trace: _trace,
                      transactions: _transactions,
                      ...clean
                    } = ev;
                    return clean;
                  });
                }
              }
              parsed.state.walletManagement.eventsByAddress = cleaned;
              window.localStorage.setItem(
                'bro-store',
                safeJsonStringify(parsed),
              );
            }
          } catch {
            // Ignore parse error
          }
        }
      }

      toast.success(
        'Cleaned storage and pruned heavy trace data successfully!',
      );
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error('Failed to prune storage');
    } finally {
      setIsPruning(false);
    }
  }, [storeApi]);

  // Clear all transient caches
  const handleClearAllCaches = useCallback(() => {
    storeApi.setState((state) => ({
      walletManagement: {
        ...state.walletManagement,
        eventsByAddress: {},
        events: [],
        confirmedTraceIds: [],
        confirmedExternalHashes: [],
      },
      jettons: state.jettons
        ? {
            ...state.jettons,
            jettonsByAddress: {},
            lastJettonsUpdate: 0,
          }
        : state.jettons,
      brotherhood: state.brotherhood
        ? {
            ...state.brotherhood,
            brotherhoodByAddress: {},
            pendingDeferredByAddress: {},
          }
        : state.brotherhood,
      tonConnect: state.tonConnect
        ? {
            ...state.tonConnect,
            requestQueue: {
              items: [],
              currentRequestId: undefined,
              isProcessing: false,
            },
          }
        : state.tonConnect,
    }));

    toast.success(
      'All transient caches cleared. Wallets and passwords preserved.',
    );
    setRefreshKey((k) => k + 1);
  }, [storeApi]);

  // --- STORE EXPLORER DATA RESOLUTION ---
  const currentSliceDef = useMemo(
    () =>
      SLICE_DEFINITIONS.find((s) => s.id === selectedSliceId) ||
      SLICE_DEFINITIONS[0],
    [selectedSliceId],
  );

  const rawSliceData = useMemo(() => {
    switch (selectedSliceId) {
      case 'eventsByAddress':
        return eventsByAddress || {};
      case 'jettonsByAddress':
        return jettonsByAddress || {};
      case 'brotherhoodByAddress':
        return brotherhoodByAddress || {};
      case 'pendingDeferredByAddress':
        return pendingDeferredByAddress || {};
      case 'associatedAddressesByAddress':
        return associatedAddressesByAddress || {};
      case 'contactsByNetwork':
        return contactsByNetwork || {};
      case 'recentByNetwork':
        return recentByNetwork || {};
      case 'requestQueue':
        return requestQueue || [];
      case 'savedWallets':
        return savedWallets || [];
      default:
        return {};
    }
  }, [
    selectedSliceId,
    eventsByAddress,
    jettonsByAddress,
    brotherhoodByAddress,
    pendingDeferredByAddress,
    associatedAddressesByAddress,
    contactsByNetwork,
    recentByNetwork,
    requestQueue,
    savedWallets,
  ]);

  // Convert slice data into inspectable entries [key, value]
  const sliceEntries = useMemo<{ key: string; value: any }[]>(() => {
    if (Array.isArray(rawSliceData)) {
      return rawSliceData.map((item, index) => ({
        key: `Item #${index}`,
        value: item,
      }));
    }
    if (rawSliceData && typeof rawSliceData === 'object') {
      return Object.entries(rawSliceData).map(([key, value]) => ({
        key,
        value,
      }));
    }
    return [];
  }, [rawSliceData]);

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    if (!explorerSearch.trim()) return sliceEntries;
    const q = explorerSearch.toLowerCase();
    return sliceEntries.filter((entry) => {
      const keyMatch = entry.key.toLowerCase().includes(q);
      const valMatch = safeJsonStringify(entry.value).toLowerCase().includes(q);
      return keyMatch || valMatch;
    });
  }, [sliceEntries, explorerSearch]);

  // Update Slice Entry Function
  const updateSliceData = useCallback(
    (newSliceValue: any) => {
      if (currentSliceDef.isProtected) {
        toast.error('Cannot modify protected slice');
        return;
      }

      switch (selectedSliceId) {
        case 'eventsByAddress':
          storeApi.setState((state) => ({
            walletManagement: {
              ...state.walletManagement,
              eventsByAddress: newSliceValue,
            },
          }));
          break;
        case 'jettonsByAddress':
          storeApi.setState((state) => ({
            jettons: state.jettons
              ? { ...state.jettons, jettonsByAddress: newSliceValue }
              : state.jettons,
          }));
          break;
        case 'brotherhoodByAddress':
          storeApi.setState((state) => ({
            brotherhood: state.brotherhood
              ? { ...state.brotherhood, brotherhoodByAddress: newSliceValue }
              : state.brotherhood,
          }));
          break;
        case 'pendingDeferredByAddress':
          storeApi.setState((state) => ({
            brotherhood: state.brotherhood
              ? {
                  ...state.brotherhood,
                  pendingDeferredByAddress: newSliceValue,
                }
              : state.brotherhood,
          }));
          break;
        case 'associatedAddressesByAddress':
          storeApi.setState((state) => ({
            walletManagement: {
              ...state.walletManagement,
              associatedAddressesByAddress: newSliceValue,
            },
          }));
          break;
        case 'contactsByNetwork':
          useContactBookStore.setState({ contactsByNetwork: newSliceValue });
          break;
        case 'recentByNetwork':
          useContactBookStore.setState({ recentByNetwork: newSliceValue });
          break;
        case 'requestQueue':
          storeApi.setState((state) => ({
            tonConnect: state.tonConnect
              ? {
                  ...state.tonConnect,
                  requestQueue: {
                    ...state.tonConnect.requestQueue,
                    items: newSliceValue,
                  },
                }
              : state.tonConnect,
          }));
          break;
        default:
          break;
      }
      setRefreshKey((k) => k + 1);
    },
    [currentSliceDef.isProtected, selectedSliceId, storeApi],
  );

  // Edit Single Entry Handlers
  const handleOpenEditEntry = (key: string, value: any) => {
    if (currentSliceDef.isProtected) {
      toast.error('This slice is read-only to protect wallet credentials');
      return;
    }
    setEditingEntryKey(key);
    setEditingJsonText(safeJsonStringify(value, 2));
    setJsonValidationError(null);
  };

  const handleSaveEditEntry = () => {
    if (!editingEntryKey) return;
    try {
      const parsed = JSON.parse(editingJsonText);
      if (Array.isArray(rawSliceData)) {
        const index = parseInt(editingEntryKey.replace('Item #', ''), 10);
        const next = [...rawSliceData];
        if (!isNaN(index) && index >= 0 && index < next.length) {
          next[index] = parsed;
          updateSliceData(next);
          toast.success(`Updated ${editingEntryKey}`);
        }
      } else if (rawSliceData && typeof rawSliceData === 'object') {
        const next = { ...rawSliceData, [editingEntryKey]: parsed };
        updateSliceData(next);
        toast.success(`Updated entry "${editingEntryKey}"`);
      }
      setEditingEntryKey(null);
    } catch (err) {
      setJsonValidationError(
        err instanceof Error ? err.message : 'Invalid JSON format',
      );
    }
  };

  // Delete Single Entry Handler
  const handleDeleteEntry = (key: string) => {
    if (currentSliceDef.isProtected) {
      toast.error('Cannot delete from protected slice');
      return;
    }
    if (Array.isArray(rawSliceData)) {
      const index = parseInt(key.replace('Item #', ''), 10);
      const next = rawSliceData.filter((_, i) => i !== index);
      updateSliceData(next);
      toast.success(`Deleted ${key}`);
    } else if (rawSliceData && typeof rawSliceData === 'object') {
      const next = { ...rawSliceData };
      delete next[key];
      updateSliceData(next);
      toast.success(`Deleted key "${key}"`);
    }
  };

  // Add New Entry Handlers
  const handleSaveNewEntry = () => {
    if (!newEntryKey.trim()) {
      setNewEntryError('Key name is required');
      return;
    }
    try {
      const parsed = JSON.parse(newEntryJson);
      if (Array.isArray(rawSliceData)) {
        updateSliceData([...rawSliceData, parsed]);
        toast.success('New item appended to list');
      } else if (rawSliceData && typeof rawSliceData === 'object') {
        updateSliceData({ ...rawSliceData, [newEntryKey.trim()]: parsed });
        toast.success(`Added new entry "${newEntryKey.trim()}"`);
      }
      setIsAddingEntry(false);
      setNewEntryKey('');
      setNewEntryJson('{}');
      setNewEntryError(null);
    } catch (err) {
      setNewEntryError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  // Export Slice JSON
  const handleExportSlice = () => {
    try {
      const dataStr = safeJsonStringify(rawSliceData, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSliceId}-backup.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedSliceId} JSON`);
    } catch {
      toast.error('Failed to export slice');
    }
  };

  // Import Slice JSON
  const handleApplyImportSlice = () => {
    try {
      const parsed = JSON.parse(importSliceJson);
      updateSliceData(parsed);
      setIsImportingSlice(false);
      setImportSliceJson('');
      setImportSliceError(null);
      toast.success(`Imported and merged ${selectedSliceId}`);
    } catch (err) {
      setImportSliceError(
        err instanceof Error ? err.message : 'Invalid JSON format',
      );
    }
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2 max-w-xl"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          <span>Storage & Store Manager</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-4 pb-2 max-h-[82vh] overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-1 bg-secondary/80 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Storage Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Store Explorer & Editor</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Total Storage Banner */}
            <div className="flex items-center justify-between p-3.5 bg-secondary/50 border border-border rounded-xl">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Local App Storage Used
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {formatBytes(totalStorageBytes)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="gray"
                onClick={handlePruneTracesAndSanitize}
                loading={isPruning}
                className="text-xs h-8 gap-1.5 border-primary/40 hover:bg-primary/10 text-primary cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Clean & Prune Traces</span>
              </Button>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Data Categories
              </div>

              <div className="divide-y divide-border/40 border border-border rounded-xl overflow-hidden bg-card">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-muted/60 shrink-0">
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {cat.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {cat.description}
                        </div>
                        <div className="text-[11px] text-muted-foreground/80 mt-0.5 flex items-center gap-2">
                          <span>{cat.itemCount} items</span>
                          <span>•</span>
                          <span>{formatBytes(cat.estimatedBytes)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={cat.itemCount === 0 && cat.estimatedBytes < 10}
                      onClick={cat.onClear}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Clear</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="gray"
                onClick={handleClearAllCaches}
                className="w-full justify-center gap-2 h-10 text-sm font-medium border-border hover:bg-muted cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span>Clear All Caches (Preserve Wallets)</span>
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: STORE EXPLORER & EDITOR */}
        {activeTab === 'explorer' && (
          <div className="flex flex-col gap-3.5">
            {/* Slice Selector Dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Target Store Slice
              </label>
              <select
                value={selectedSliceId}
                onChange={(e) => {
                  setSelectedSliceId(e.target.value);
                  setExplorerSearch('');
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SLICE_DEFINITIONS.map((def) => (
                  <option key={def.id} value={def.id}>
                    {def.name}{' '}
                    {def.isProtected ? '(Protected - Read Only)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Slice Info Header */}
            <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-muted/80 shrink-0">
                  {currentSliceDef.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {currentSliceDef.name}
                    </span>
                    {currentSliceDef.isProtected ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        Read-Only
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        Editable
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {sliceEntries.length} entries •{' '}
                    {formatBytes(getJsonByteSize(rawSliceData))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="gray"
                  onClick={handleExportSlice}
                  title="Export JSON"
                  className="h-8 px-2 text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {!currentSliceDef.isProtected && (
                  <>
                    <Button
                      size="sm"
                      variant="gray"
                      onClick={() => {
                        setImportSliceJson(safeJsonStringify(rawSliceData, 2));
                        setImportSliceError(null);
                        setIsImportingSlice(true);
                      }}
                      title="Import / Replace JSON"
                      className="h-8 px-2 text-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewEntryKey('');
                        setNewEntryJson('{}');
                        setNewEntryError(null);
                        setIsAddingEntry(true);
                      }}
                      title="Add Entry"
                      className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                placeholder="Search keys or JSON content…"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {explorerSearch && (
                <button
                  type="button"
                  onClick={() => setExplorerSearch('')}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Entries List */}
            <div className="border border-border rounded-xl divide-y divide-border/40 bg-card overflow-hidden max-h-64 overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  {explorerSearch
                    ? 'No matching entries found'
                    : 'Slice is currently empty'}
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className="p-2.5 flex items-start justify-between gap-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-bold text-foreground truncate">
                        {entry.key}
                      </div>
                      <pre className="text-[10px] font-mono text-muted-foreground mt-0.5 max-h-12 overflow-hidden text-ellipsis line-clamp-2 bg-background/50 p-1 rounded border border-border/50">
                        {typeof entry.value === 'object'
                          ? safeJsonStringify(entry.value)
                          : String(entry.value)}
                      </pre>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {!currentSliceDef.isProtected && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEditEntry(entry.key, entry.value)
                            }
                            title="Edit Entry JSON"
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry.key)}
                            title="Delete Entry"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {currentSliceDef.isProtected && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              safeJsonStringify(entry.value, 2),
                            );
                            toast.success('Copied JSON to clipboard');
                          }}
                          title="Copy JSON"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      {/* SUB-MODAL 1: EDIT ENTRY JSON */}
      <Modal.Container
        isOpened={editingEntryKey !== null}
        onOpenChange={(open) => !open && setEditingEntryKey(null)}
        className="px-2 max-w-md"
      >
        <Modal.Header onClose={() => setEditingEntryKey(null)}>
          <Modal.Title className="text-sm font-mono truncate">
            Edit: {editingEntryKey}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="gap-3 p-4">
          <div className="text-xs text-muted-foreground">
            Modify JSON structure below. Syntax is verified live before saving.
          </div>
          <textarea
            value={editingJsonText}
            onChange={(e) => {
              setEditingJsonText(e.target.value);
              try {
                JSON.parse(e.target.value);
                setJsonValidationError(null);
              } catch (err) {
                setJsonValidationError(
                  err instanceof Error ? err.message : 'Invalid JSON',
                );
              }
            }}
            rows={10}
            className="w-full font-mono text-xs p-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {jsonValidationError && (
            <div className="text-[11px] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {jsonValidationError}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setEditingEntryKey(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              fullWidth
              disabled={jsonValidationError !== null}
              onClick={handleSaveEditEntry}
            >
              Save Changes
            </Button>
          </div>
        </Modal.Body>
      </Modal.Container>

      {/* SUB-MODAL 2: ADD NEW ENTRY */}
      <Modal.Container
        isOpened={isAddingEntry}
        onOpenChange={(open) => !open && setIsAddingEntry(false)}
        className="px-2 max-w-md"
      >
        <Modal.Header onClose={() => setIsAddingEntry(false)}>
          <Modal.Title className="text-sm">
            Add Entry to {currentSliceDef.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="gap-3 p-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Key Name / Identifier
            </label>
            <input
              type="text"
              value={newEntryKey}
              onChange={(e) => {
                setNewEntryKey(e.target.value);
                setNewEntryError(null);
              }}
              placeholder="e.g. 0:abcd... or custom_key"
              className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              JSON Value
            </label>
            <textarea
              value={newEntryJson}
              onChange={(e) => {
                setNewEntryJson(e.target.value);
                setNewEntryError(null);
              }}
              rows={6}
              className="w-full font-mono text-xs p-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {newEntryError && (
            <div className="text-[11px] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {newEntryError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsAddingEntry(false)}
            >
              Cancel
            </Button>
            <Button size="sm" fullWidth onClick={handleSaveNewEntry}>
              Add Entry
            </Button>
          </div>
        </Modal.Body>
      </Modal.Container>

      {/* SUB-MODAL 3: IMPORT / REPLACE SLICE JSON */}
      <Modal.Container
        isOpened={isImportingSlice}
        onOpenChange={(open) => !open && setIsImportingSlice(false)}
        className="px-2 max-w-md"
      >
        <Modal.Header onClose={() => setIsImportingSlice(false)}>
          <Modal.Title className="text-sm">
            Import / Replace {currentSliceDef.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="gap-3 p-4">
          <div className="text-xs text-muted-foreground">
            Paste complete JSON object or array to replace the contents of this
            slice.
          </div>
          <textarea
            value={importSliceJson}
            onChange={(e) => {
              setImportSliceJson(e.target.value);
              setImportSliceError(null);
            }}
            rows={10}
            className="w-full font-mono text-xs p-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {importSliceError && (
            <div className="text-[11px] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {importSliceError}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsImportingSlice(false)}
            >
              Cancel
            </Button>
            <Button size="sm" fullWidth onClick={handleApplyImportSlice}>
              Apply Import
            </Button>
          </div>
        </Modal.Body>
      </Modal.Container>
    </Modal.Container>
  );
};
