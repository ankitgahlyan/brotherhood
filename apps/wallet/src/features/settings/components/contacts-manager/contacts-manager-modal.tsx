/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useMemo } from 'react';
import {
  User,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  X,
  FileJson,
} from 'lucide-react';
import { toast } from 'sonner';
import { isValidAddress } from '@ton/walletkit';
import { useWallet } from '@demo/wallet-core';
import {
  useContactBookStore,
  type ContactItem,
} from '@/core/storage/useContactBookStore';
import { useFormatAddress } from '@/core/utils/formatters';
import { Modal } from '@/core/components/ui/modal';
import { Button } from '@/core/components/ui/button';

interface ContactsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactsManagerModal: React.FC<ContactsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { savedWallets, activeWalletId } = useWallet();
  const network =
    savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<ContactItem | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Form states for Add / Edit
  const [formAddress, setFormAddress] = useState('');
  const [formName, setFormName] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const { formatWalletAddress } = useFormatAddress();

  const contactsMap = useContactBookStore(
    (state) => state.contactsByNetwork[network] || {},
  );
  const setCustomName = useContactBookStore((state) => state.setCustomName);
  const deleteContact = useContactBookStore((state) => state.deleteContact);
  const importContacts = useContactBookStore((state) => state.importContacts);
  const exportContacts = useContactBookStore((state) => state.exportContacts);

  const contactsList = useMemo(() => {
    return Object.values(contactsMap).sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    );
  }, [contactsMap]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactsList;
    const q = searchQuery.toLowerCase().replace(/^@+/, '');
    return contactsList.filter((c) => {
      const nameMatch = c.customName && c.customName.toLowerCase().includes(q);
      const userMatch =
        c.onChainUsername && c.onChainUsername.toLowerCase().includes(q);
      const addrMatch =
        c.address.toLowerCase().includes(q) ||
        c.rawAddress.toLowerCase().includes(q);
      const notesMatch = c.notes && c.notes.toLowerCase().includes(q);
      return nameMatch || userMatch || addrMatch || notesMatch;
    });
  }, [contactsList, searchQuery]);

  const handleOpenAdd = () => {
    setFormAddress('');
    setFormName('');
    setFormNotes('');
    setEditingContact(null);
    setIsAddingNew(true);
  };

  const handleOpenEdit = (contact: ContactItem) => {
    setFormAddress(contact.address);
    setFormName(contact.customName || contact.onChainUsername || '');
    setFormNotes(contact.notes || '');
    setEditingContact(contact);
    setIsAddingNew(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = formAddress.trim();
    const cleanName = formName.trim().replace(/^@+/, '');

    if (!cleanAddr || !isValidAddress(cleanAddr)) {
      toast.error('Please provide a valid TON address');
      return;
    }

    setCustomName(cleanAddr, cleanName, formNotes.trim() || undefined, network);
    toast.success(editingContact ? 'Contact updated' : 'Contact added');
    setIsAddingNew(false);
    setEditingContact(null);
  };

  const handleDelete = (address: string) => {
    deleteContact(address, network);
    toast.success('Contact removed');
  };

  const handleExport = () => {
    const jsonStr = exportContacts(network);
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      toast.success('Contacts JSON copied to clipboard!');
    }
    // Also trigger JSON file download
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brotherhood-contacts-${network}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Ignore download errors on platforms without file system access
    }
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      toast.error('Please paste JSON contacts data');
      return;
    }
    const result = importContacts(importJsonText, network);
    if (result.error) {
      toast.error(`Import failed: ${result.error}`);
    } else {
      toast.success(`Successfully imported ${result.importedCount} contacts!`);
      setIsImportModalOpen(false);
      setImportJsonText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setImportJsonText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-md w-full h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-background border border-border"
    >
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Address Book</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-medium">
            {contactsList.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Toolbar & Search */}
      <div className="p-4 border-b border-border/60 flex flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, address, notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-8 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleOpenAdd}
            className="flex-1 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleExport}
            className="text-xs gap-1"
            title="Export / Backup contacts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setIsImportModalOpen(true)}
            className="text-xs gap-1"
            title="Import contacts"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </Button>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <User className="w-10 h-10 mx-auto opacity-40 stroke-1" />
            <p className="text-sm font-medium">No contacts found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? 'Try a different search query'
                : 'Add or import contacts to see them here.'}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const effective =
              contact.customName ||
              contact.onChainUsername ||
              'Unnamed Contact';
            return (
              <div
                key={contact.rawAddress}
                className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-border/60 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                    {effective.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground truncate">
                      <span>@{effective}</span>
                      {contact.customName && (
                        <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.2 rounded font-medium">
                          custom
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      {formatWalletAddress(contact.address, true)}
                    </div>
                    {contact.notes && (
                      <div className="text-[11px] text-muted-foreground/80 truncate italic">
                        {contact.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.address)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isAddingNew && (
        <Modal.Container
          isOpened={isAddingNew}
          onOpenChange={(open) => !open && setIsAddingNew(false)}
          className="max-w-sm w-full p-5 rounded-3xl bg-card border border-border"
        >
          <Modal.Header
            onClose={() => setIsAddingNew(false)}
            className="pb-2 border-b border-border/40"
          >
            <Modal.Title className="text-base font-semibold">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={handleSaveContact} className="space-y-3.5 pt-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                TON Address *
              </label>
              <input
                type="text"
                placeholder="EQ... / 0:..."
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                disabled={Boolean(editingContact)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Contact Nickname *
              </label>
              <input
                type="text"
                placeholder="e.g. Alice"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Work wallet"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save
              </Button>
            </div>
          </form>
        </Modal.Container>
      )}

      {/* Import Contacts Modal */}
      {isImportModalOpen && (
        <Modal.Container
          isOpened={isImportModalOpen}
          onOpenChange={(open) => !open && setIsImportModalOpen(false)}
          className="max-w-sm w-full p-5 rounded-3xl bg-card border border-border"
        >
          <Modal.Header
            onClose={() => setIsImportModalOpen(false)}
            className="pb-2 border-b border-border/40"
          >
            <Modal.Title className="text-base font-semibold flex items-center gap-2">
              <FileJson className="w-4 h-4 text-primary" />
              <span>Import Contacts</span>
            </Modal.Title>
          </Modal.Header>

          <div className="space-y-3.5 pt-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Upload JSON File
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Or Paste JSON Data
              </label>
              <textarea
                rows={5}
                placeholder='{"contacts": [{"address": "EQ...", "customName": "Alice"}]}'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-2 text-xs font-mono rounded-xl bg-secondary/50 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleImportSubmit}
              >
                Import
              </Button>
            </div>
          </div>
        </Modal.Container>
      )}
    </Modal.Container>
  );
};
