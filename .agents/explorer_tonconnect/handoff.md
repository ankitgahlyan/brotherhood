# TonConnect Removal Analysis & Handoff Report

## Executive Summary
This report presents a complete audit of all TonConnect references, components, hooks, context providers, dependency declarations, build configurations, and transaction sending implementations across the application codebase (`/home/zeta/jetton`).

---

## 1. Observation (Exact Locations & Line Ranges)

### 1.1 Dependency & Configuration Declarations
- **`package.json` (Line 54)**
  ```json
  "@tonconnect/ui-react": "^2.4.4",
  ```
- **`vite.config.ts` (Line 71)**
  ```typescript
  { name: 'tonconnect', test: /node_modules[\\/]@tonconnect[\\/]/ },
  ```
  *(Located in `codeSplittingGroups` for Vite client bundle optimization)*
- **`public/tonconnect-manifest.json` (Lines 1–6)**
  ```json
  {
    "url": "https://fossfiat.netlify.app",
    "name": "Fi",
    "iconUrl": "https://fossfiat.netlify.app/icon1.png"
  }
  ```

### 1.2 Provider & Root Theme Sync
- **`src/providers/AppProviders.tsx` (Lines 4–7, 12–35, 37–63, 70–79)**
  ```tsx
  import {
    TonConnectUIProvider,
    THEME,
    useTonConnectUI,
  } from '@tonconnect/ui-react';

  const manifestUrl =
    'https://ankitgahlyan.github.io/brotherhood/tonconnect-manifest.json';
  ```
  `AppProviders` wraps `{children}` with `<TonConnectUIProvider>` and includes `<TonConnectThemeSync />` which updates `tonConnectUI.uiOptions` whenever the app theme changes.

### 1.3 UI Navigation Header & Wallet Selector
- **`src/components/Header.tsx` (Lines 3, 162)**
  ```tsx
  import { TonConnectButton } from '@tonconnect/ui-react';
  ...
  <TonConnectButton />
  ```
- **`src/components/wallet-selector.tsx` (Lines 3–4, 27–28, 33–34, 39–63, 65–71, 109–156)**
  ```tsx
  import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
  import type { WalletInfo } from '@tonconnect/ui';
  ...
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  ```
  Implements custom dropdown with wallet info, available wallets fetched via `tonConnectUI.getWallets()`, modal opening via `tonConnectUI.openModal()`, and disconnection via `tonConnectUI.disconnect()`.

- **`src/pages/manage/common.tsx` (Lines 5, 80–89)**
  ```tsx
  import { WalletSelector } from '@/components/wallet-selector';
  ...
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

### 1.4 Transaction Handling Hook & Pages
- **`src/lib/useSendFiTransaction.ts` (Lines 2, 31–34, 43–52)**
  ```tsx
  import type { TonConnectUI } from '@tonconnect/ui-react';
  ...
  export function useSendFiTransaction(
    tonConnectUI: TonConnectUI,
    network: Network,
  ) {
    ...
    await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 300,
      network: network === 'mainnet' ? '-239' : '-3',
      messages: params.messages.map((m) => ({
        address: m.address,
        amount: m.amount.toString(),
        payload: m.payload?.toBoc().toString('base64'),
        stateInit: m.stateInit?.toBoc().toString('base64'),
      })),
    });
  }
  ```
- **`src/pages/DeployPage.tsx` (Lines 2, 35–36, 54, 58, 64–66, 115–130, 263–267)**
  ```tsx
  import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
  ...
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const ownerAddress = wallet?.account?.address ? Address.parse(wallet.account.address) : null;
  const isConnected = !!wallet;
  ...
  if (!isConnected) { tonConnectUI.openModal(); return; }
  ...
  await tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 300,
    network: network === 'mainnet' ? '-239' : '-3',
    messages: [ ... ],
  });
  ```
- **`src/pages/manage/ManagePage.tsx` (Lines 4, 75–76, 80, 109, 221, 232, 243, 253, 260, 267, 274, 283, 290, 624–636)**
  Reads `wallet = useTonWallet()`, extracts `ownerAddress`, and passes `tonConnectUI` down to all 9 sub-tabs (`AdminTab`, `AllowanceTab`, `BurnTab`, `CreditTab`, `DestroyTab`, `InviteTab`, `IssueTokenTab`, `TransferTab`, `VoteTab`).

### 1.5 Manage Tabs Inventory (10 Tab Files)
All 10 tab components receive `tonConnectUI: TonConnectUI` as a prop and pass it into `useSendFiTransaction(tonConnectUI, network)`:
1. `AdminTab.tsx` (Lines 3, 45, 50, 63, 173)
2. `AllowanceTab.tsx` (Lines 3, 33, 43, 48–49)
3. `BurnTab.tsx` (Lines 3, 25, 30, 35)
4. `CreditTab.tsx` (Lines 3, 35, 42, 89)
5. `DestroyTab.tsx` (Lines 2, 17, 20, 25)
6. `InviteTab.tsx` (Lines 3, 21, 27, 32)
7. `IssueTokenTab.tsx` (Lines 3, 26, 35, 41)
8. `MintTab.tsx` (Lines 3, 34, 40, 45)
9. `TransferTab.tsx` (Lines 3, 25, 30, 35)
10. `VoteTab.tsx` (Lines 3, 21, 25, 30)

---

## 2. Logic Chain

1. **Dependency Analysis**: `@tonconnect/ui-react` is listed in `package.json` dependencies and chunked in `vite.config.ts`. Removing TonConnect requires removing `@tonconnect/ui-react` from `package.json`, updating `vite.config.ts`, and removing `public/tonconnect-manifest.json`.
2. **Provider Analysis**: `AppProviders.tsx` wraps the app in `TonConnectUIProvider` and syncs themes via `TonConnectThemeSync`. Removing TonConnect requires removing both components, leaving `QueryClientProvider` as the outer provider wrapper (or wrapping an in-app wallet context provider).
3. **Wallet Connection State Analysis**: Currently, active wallet address and connection state (`isConnected`, `ownerAddress`) are sourced from `useTonWallet()` in `DeployPage.tsx` and `ManagePage.tsx`. These hooks must be replaced with an in-app Wallet Context hook (e.g. `useWallet()` / `useWalletState()`) providing the active `WalletV5R1` address, balance, and keypair/signer.
4. **Transaction Dispatch Analysis**:
   - Contract interactions in all 10 Manage tabs call `useSendFiTransaction`.
   - `DeployPage.tsx` constructs message payloads inline and calls `tonConnectUI.sendTransaction`.
   - Replacing TonConnect requires updating `useSendFiTransaction` (and `DeployPage.tsx`) to construct the transfer message cell, sign it using the local `WalletV5R1` key pair, and broadcast the signed BOC directly to TON RPC via `TonClient`.
5. **UI & Selector Component Analysis**:
   - `Header.tsx` renders `<TonConnectButton />`. This should be replaced with an in-app Wallet status widget/button (displaying active address, balance, and opening wallet management modal).
   - `wallet-selector.tsx` handles TonConnect modal triggers and wallet listing. It can be refactored into the in-app wallet selection/management UI (create wallet, import seed, switch wallet, view key/seed).
   - `common.tsx`'s `WalletRequired` component renders `<WalletSelector />`. Once `WalletSelector` is refactored into the in-app wallet picker/creator, `WalletRequired` will seamlessly prompt for in-app wallet creation or import.

---

## 3. Caveats

- **No Source Code Changes Made**: This explorer agent operates under read-only rules for `src/`. No edits were made to `src/` or `package.json`.
- **Public Manifest Artifacts**: `dist/client/tonconnect-manifest.json` and `dist/tonconnect-manifest.json` are build artifacts. Removing `public/tonconnect-manifest.json` will clean these up on the next build.
- **Third-Party Styling**: Any CSS classes targeting `.tonconnect-button` or TonConnect modals in stylesheet files were checked; none were found in custom CSS files (styling is scoped within `@tonconnect/ui-react`).

---

## 4. Conclusion & Actionable Replacement Plan

### Summary Table of Code Modifications Required

| File | Action Required |
|---|---|
| `package.json` | Remove `"@tonconnect/ui-react"` dependency |
| `vite.config.ts` | Remove `{ name: 'tonconnect', test: /node_modules[\\/]@tonconnect[\\/]/ }` |
| `public/tonconnect-manifest.json` | Delete file |
| `src/providers/AppProviders.tsx` | Remove `TonConnectUIProvider`, `TonConnectThemeSync`, and `manifestUrl` |
| `src/components/Header.tsx` | Replace `<TonConnectButton />` with in-app Wallet Button/Modal trigger |
| `src/components/wallet-selector.tsx` | Refactor into in-app wallet picker, seed import/export, and wallet switcher |
| `src/lib/useSendFiTransaction.ts` | Refactor to accept in-app WalletV5R1 signer/instance, sign BOC, and broadcast via `TonClient` |
| `src/pages/DeployPage.tsx` | Replace `useTonConnectUI`/`useTonWallet` with in-app wallet hook and direct BOC signing/broadcast |
| `src/pages/manage/ManagePage.tsx` | Replace `useTonConnectUI`/`useTonWallet` with in-app wallet hook, remove `tonConnectUI` prop forwarding |
| `src/pages/manage/common.tsx` | Update `WalletRequired` to trigger in-app wallet setup/unlock |
| `src/pages/manage/*.tsx` (10 Tabs) | Remove `tonConnectUI` prop and update to use refactored `useSendFiTransaction` |

---

## 5. Verification Method

1. **Grep Verification for Lingering References**:
   ```bash
   grep -rn "tonconnect" /home/zeta/jetton/src /home/zeta/jetton/package.json /home/zeta/jetton/vite.config.ts
   ```
   *Expected result after removal*: 0 matches.

2. **TypeScript & Build Check**:
   ```bash
   nub run typecheck
   nub run build
   ```
   *Expected result*: Types check without errors, build succeeds cleanly without TonConnect vendor chunk.
