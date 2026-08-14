# Handoff Report: TonConnect Removal & Embedded Wallet Context Integration

**Agent**: `explorer_m2_3_gen2`  
**Working Directory**: `/home/zeta/jetton/.agents/explorer_m2_3_gen2`  
**Milestone**: M2 — Wallet Context & UI Integration  
**Date**: 2026-08-11  

---

## 1. Observation

Direct code analysis of target integration components and specifications yielded the following findings:

### 1.1 `src/providers/AppProviders.tsx` (Lines 1–83)
- **Current Imports**:
  ```tsx
  import {
    TonConnectUIProvider,
    THEME,
    useTonConnectUI,
  } from '@tonconnect/ui-react';
  ```
- **Current Setup**: Uses `manifestUrl` (`'https://ankitgahlyan.github.io/brotherhood/tonconnect-manifest.json'`), theme color objects (`darkColors`, `lightColors`), and helper component `<TonConnectThemeSync />` that manipulates `tonConnectUI.uiOptions`.
- **Tree Hierarchy**:
  ```tsx
  <QueryClientProvider client={queryClient}>
    <TonConnectUIProvider ...>
      <TonConnectThemeSync />
      {children}
    </TonConnectUIProvider>
  </QueryClientProvider>
  ```

### 1.2 `src/components/Header.tsx` (Lines 1–173)
- **Current Imports**:
  ```tsx
  import { TonConnectButton } from '@tonconnect/ui-react';
  ```
- **Current Element**: Renders `<TonConnectButton />` on Line 162 in the right action toolbar alongside theme toggle and settings buttons.

### 1.3 `src/components/wallet-selector.tsx` (Lines 1–161)
- **Current Imports**:
  ```tsx
  import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
  import type { WalletInfo } from '@tonconnect/ui';
  ```
- **Current Functions**:
  - `const [tonConnectUI] = useTonConnectUI();`
  - `const wallet = useTonWallet();`
  - `tonConnectUI.getWallets()` (Line 42)
  - `tonConnectUI.openModal()` (Line 66)
  - `tonConnectUI.disconnect()` (Line 70)

### 1.4 `src/pages/manage/common.tsx` (Lines 1–100)
- **Current Imports**:
  ```tsx
  import { WalletSelector } from '@/components/wallet-selector';
  ```
- **Current Component**:
  ```tsx
  export function WalletRequired() {
    return (
      <EmptyState
        icon={<Wallet className="size-8" />}
        title="Wallet not connected"
        description="Connect your wallet to perform this action"
        action={<WalletSelector className="rounded-full max-w-55 mx-auto" />}
      />
    );
  }
  ```
- No direct `@tonconnect/ui-react` imports exist in `common.tsx`.

---

## 2. Logic Chain

1. **Provider Transformation (`AppProviders.tsx`)**:
   - `TonConnectUIProvider` and `TonConnectThemeSync` strictly depend on `@tonconnect/ui-react`.
   - Removing TonConnect requires eliminating `TonConnectUIProvider`, `TonConnectThemeSync`, `manifestUrl`, `darkColors`, `lightColors`, and `readInitialTheme()`.
   - Wrapping `{children}` with `WalletProvider` (exported from `src/providers/WalletContext.tsx`) inside `QueryClientProvider` provides the embedded wallet state context (`activeWallet`, `wallets`, `isUnlocked`, `balance`, `secretKey`, `TonClient` instance) to all descendant components.

2. **Header Wallet Status Widget Replacement (`Header.tsx`)**:
   - `<TonConnectButton />` relies on TonConnect UI overlay.
   - Replacing it with an in-app `<HeaderWalletButton />` backed by `useWallet()` enables three visual & interactive states:
     - **State 1: No Active Wallet (`!activeWallet`)**: Displays `"Connect Wallet"` with primary accent (`bg-[#ff4e00]`). Clicking triggers `openWalletModal('create')` or `openWalletModal()`.
     - **State 2: Wallet Created but Locked (`activeWallet && !isUnlocked`)**: Displays amber lock icon (`<Lock className="size-3.5 text-amber-500" />`) with shortened address (`shortenAddress(activeWallet.address)`). Clicking triggers `openUnlockModal()`.
     - **State 3: Wallet Connected & Unlocked (`activeWallet && isUnlocked`)**: Displays pulse status dot (`<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />`), balance formatted in TON (`(Number(balance)/1e9).toFixed(2)`), and shortened address. Clicking opens the wallet management modal (`openWalletModal()`).

3. **Wallet Selector & Common UI Refactoring (`wallet-selector.tsx` & `common.tsx`)**:
   - `wallet-selector.tsx` currently queries TonConnect's remote bridge wallets (`tonConnectUI.getWallets()`).
   - Refactoring it to consume `useWallet()` turns it into an in-app wallet selection and management dropdown:
     - Displays the currently active local wallet address and status.
     - Lists saved local wallets (`wallets.map(...)`) allowing 1-click active wallet switching (`setActiveWallet(w.id)`).
     - Provides quick actions: `"Create New Wallet"`, `"Import Mnemonic"`, `"Lock Wallet"`, `"Unlock Wallet"`, `"Manage Seed"`.
   - `common.tsx` (`WalletRequired`) delegates UI action to `WalletSelector`. Sourcing connection/lock state from `useWallet()` allows `WalletRequired` to dynamically differentiate between "Wallet Not Found" and "Wallet Locked", rendering appropriate prompts and actions without breaking contract interfaces.

4. **Zero Broken Imports Guarantee**:
   - Sourcing all wallet hooks from `WalletContext` (`useWallet()`) eliminates all references to `@tonconnect/ui-react` across `AppProviders.tsx`, `Header.tsx`, `wallet-selector.tsx`, and `common.tsx`.

---

## 3. Caveats

- **Read-Only Scope**: This report provides the complete architectural design and code snippets for implementation by `implementer`/`worker` agents. No edits were made to files under `src/`.
- **WalletContext Export Schema**: Implementation assumes `WalletContext.tsx` exports `WalletProvider` and `useWallet()` returning:
  ```ts
  {
    activeWallet: SavedWallet | null;
    wallets: SavedWallet[];
    isUnlocked: boolean;
    balance: bigint;
    setActiveWallet: (id: string) => void;
    lockWallet: () => void;
    openWalletModal: (mode?: 'create' | 'import' | 'manage' | 'switch') => void;
    openUnlockModal: () => void;
  }
  ```
- **Styling**: All proposed replacements use existing Tailwind v4 utilities and shadcn UI primitives (`Button`, `DropdownMenu`, `Badge`).

---

## 4. Conclusion & Implementation Strategy

### 4.1 Detailed Implementation Specs

#### Component 1: `src/providers/AppProviders.tsx`
```tsx
import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../lib/ton';
import { WalletProvider } from './WalletContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
}
```

#### Component 2: `src/components/Header.tsx`
Replace `import { TonConnectButton } from '@tonconnect/ui-react';` with:
```tsx
import { Wallet, Lock, Unlock } from 'lucide-react';
import { useWallet } from '../providers/WalletContext';
import { shortenAddress } from '../pages/manage/common';
```
Replace `<TonConnectButton />` on line 162 with `<HeaderWalletButton />`:
```tsx
function HeaderWalletButton() {
  const { activeWallet, isUnlocked, balance, openWalletModal, openUnlockModal } = useWallet();

  if (!activeWallet) {
    return (
      <Button
        variant="default"
        size="sm"
        className="rounded-xl bg-[#ff4e00] hover:bg-[#e04500] text-white font-mono font-semibold text-xs gap-1.5 h-9 px-3.5 shadow-md transition-all"
        onClick={() => openWalletModal('create')}
      >
        <Wallet className="size-4" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  if (!isUnlocked) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-semibold text-xs gap-2 h-9 px-3 transition-all"
        onClick={() => openUnlockModal()}
        title="Wallet locked. Click to unlock."
      >
        <Lock className="size-3.5 text-amber-500" />
        <span>{shortenAddress(activeWallet.address)}</span>
      </Button>
    );
  }

  const formattedBalance = (Number(balance) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl bg-secondary hover:bg-secondary/80 border border-white/5 font-mono text-xs gap-2.5 h-9 px-3 transition-all"
      onClick={() => openWalletModal('manage')}
    >
      <div className="flex items-center gap-1.5 font-bold text-foreground">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{formattedBalance} TON</span>
      </div>
      <div className="w-px h-3.5 bg-border" />
      <span className="text-muted-foreground font-semibold">
        {shortenAddress(activeWallet.address)}
      </span>
    </Button>
  );
}
```

#### Component 3: `src/components/wallet-selector.tsx`
```tsx
import { Wallet2, ChevronDown, Lock, Plus, LogOut, Check, KeyRound } from 'lucide-react';
import { useWallet } from '@/providers/WalletContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shortenAddress } from '@/pages/manage/common';

export function WalletSelector({ className }: { className?: string }) {
  const {
    activeWallet,
    wallets,
    isUnlocked,
    setActiveWallet,
    lockWallet,
    openWalletModal,
    openUnlockModal,
  } = useWallet();

  const connected = !!activeWallet;
  const triggerLabel = connected
    ? shortenAddress(activeWallet.address)
    : 'Connect Wallet';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={connected ? (isUnlocked ? 'outline' : 'destructive') : 'default'}
          className={className}
        >
          {connected && !isUnlocked ? (
            <Lock className="size-4 text-amber-500" />
          ) : (
            <Wallet2 className="size-4" />
          )}
          <span className="max-w-35 truncate">{triggerLabel}</span>
          {connected && <ChevronDown className="size-3 opacity-60" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
        {connected ? (
          <>
            <div className="px-2.5 py-2">
              <div className="text-sm font-semibold flex items-center justify-between">
                <span>{activeWallet.name || 'Active Wallet'}</span>
                {isUnlocked ? (
                  <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Locked
                  </span>
                )}
              </div>
              <div className="font-mono text-[12px] text-muted-foreground">
                {shortenAddress(activeWallet.address)}
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        ) : (
          <div className="px-2.5 py-2 text-sm text-muted-foreground font-medium">
            Select or Create Wallet
          </div>
        )}

        {wallets.map((w) => {
          const isActive = w.id === activeWallet?.id;
          return (
            <DropdownMenuItem
              key={w.id}
              onClick={() => setActiveWallet(w.id)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
            >
              <div className="flex items-center gap-2 truncate">
                <Wallet2 className="size-4 text-muted-foreground" />
                <span className="truncate">{w.name || shortenAddress(w.address)}</span>
              </div>
              {isActive && <Check className="size-4 text-[#ff4e00]" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => openWalletModal('create')}
          className="rounded-lg px-3 py-2.5"
        >
          <Plus className="size-4" />
          Create New Wallet
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => openWalletModal('import')}
          className="rounded-lg px-3 py-2.5"
        >
          <KeyRound className="size-4" />
          Import Seed Phrase
        </DropdownMenuItem>

        {connected && isUnlocked && (
          <DropdownMenuItem
            onClick={() => lockWallet()}
            className="rounded-lg px-3 py-2.5 text-amber-600 dark:text-amber-400"
          >
            <Lock className="size-4" />
            Lock Wallet
          </DropdownMenuItem>
        )}

        {connected && !isUnlocked && (
          <DropdownMenuItem
            onClick={() => openUnlockModal()}
            className="rounded-lg px-3 py-2.5 text-emerald-600 dark:text-emerald-400"
          >
            <Lock className="size-4" />
            Unlock Wallet
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Component 4: `src/pages/manage/common.tsx` (`WalletRequired`)
```tsx
import { Lock, Wallet } from 'lucide-react';
import { useWallet } from '@/providers/WalletContext';
import { WalletSelector } from '@/components/wallet-selector';
import { Button } from '@/components/ui/button';

export function WalletRequired() {
  const { activeWallet, isUnlocked, openWalletModal, openUnlockModal } = useWallet();

  if (activeWallet && !isUnlocked) {
    return (
      <EmptyState
        icon={<Lock className="size-8 text-amber-500" />}
        title="Wallet locked"
        description="Unlock your wallet with your password to perform contract transactions"
        action={
          <Button
            onClick={() => openUnlockModal()}
            variant="outline"
            className="rounded-full border-amber-500/40 text-amber-600 dark:text-amber-400 max-w-55 mx-auto"
          >
            Unlock Wallet
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Wallet className="size-8" />}
      title="Wallet not connected"
      description="Connect or create an in-app wallet to perform this action"
      action={<WalletSelector className="rounded-full max-w-55 mx-auto" />}
    />
  );
}
```

---

## 5. Verification Method

1. **Static Analysis & Import Verification**:
   ```bash
   grep -rn "@tonconnect" src/providers/AppProviders.tsx src/components/Header.tsx src/components/wallet-selector.tsx src/pages/manage/common.tsx
   ```
   *Expected Result*: 0 matches.

2. **TypeScript Compilation Verification**:
   ```bash
   nub run typecheck
   ```
   *Expected Result*: Typecheck passes with 0 errors across the application.

3. **Frontend Production Build**:
   ```bash
   nub run build
   ```
   *Expected Result*: Application builds clean static bundle without `@tonconnect/ui-react` chunking errors.

4. **Smoke Test Verification**:
   ```bash
   nub run smoke
   ```
   *Expected Result*: Application header and page rendering pass cleanly without runtime provider crashes.
