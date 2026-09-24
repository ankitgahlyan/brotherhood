# Instructions

- **Be concise.** Only change code directly related to the current task; leave unrelated parts untouched.
- **Reuse** existing types, functions and components. Search before creating a new one.
- **No new libraries.** Use existing dependencies only. If a task truly can't be done without a new library, stop and explain why.
- **Only** write tests when directly prompted to do so.

- **After your solution:**
  1. Think like on a code review and identify any shortcomings.
  2. Fix those issues. Repeat review-fix cycle until you are sure about code quality.
  3. Present the improved result.

- **When deeper debugging is needed:**
  1. Outline clear, step-by-step debugging instructions in your output.
  2. Remove any temporary debug code once the issue is resolved.

- when exploring or editing files, if you find any inconsistencies or bugs, point them to me after current request is complete.
- **Codify All Failures into Rules:** Whenever a bug, test failure, runtime error, or framework violation (e.g. React infinite re-render loops, TVM execution errors, serialization mismatch, selector instability) is identified and resolved, formulate and append the underlying invariant as an explicit rule under the relevant section of `AGENTS.md` to prevent future regressions.

## Agent Skills

### Issue tracker

GitHub Issues are the issue tracker for this repository. Use the `gh` CLI for all issue operations (create, view, comment, label, close). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context layout for domain documentation. The glossary lives in `CONTEXT.md` at the repo root. See `docs/agents/domain.md`.

### Contracts & TON domain

- Use `acton` skill for Acton CLI, Tolk, wrappers, tests, scripts, deployment, and `Acton.toml` tasks.
- Use `tolk` skill for tolk smart contracts related tasks.
- Use `ton-blockchain` skill for ton blockchain related tasks.
- Treat the contracts under `contracts/src/` as the source of truth.
- Treat all contracts as a coupled system. Keep storage, message formats, tests, wrappers, TypeScript wrappers, scripts, and frontend flows consistent across both sides.
- Treat files in `wrappers`, `wrappers-ts` as generated output. Regenerate them only for changed contracts from the contract ABI instead of hand-editing them when the ABI changes.
- Keep `contracts/tests/`, `contracts/wrappers/`, `contracts/scripts/`, `wrappers-ts/`, and the frontend code in `src/` aligned with contract changes.
- Prefer this validation loop when feasible: `acton run loop` `bun typecheck`, `bun format`.
- Before proposing broadcast deployment changes or metadata changes, verify the contract flow with `acton run deploy-emulation` first.
- For the Personal Token issuer onboarding flow, verify with `acton run verify-personal` (emulates deploy + wallet pointer + buy credit) before proposing a real `acton run deploy-personal`.
- When command syntax or flags are unclear, verify them with `acton --help`, `acton <command> --help`, `bun run`, or the existing project config.

#### Contract rules

- separate struct/msg files for each contract instead of unnecessarily bloating other contracts and common file for common structs/msg.
- report any circular dependency issues.
- use fail-fast approach, use assertions early at msg entry into contracts.
- **Deterministic Proxy Bytecode & Storage Migration:** Minimal proxy contracts (`BaseFiWallet`) used for deterministic child address derivation must never self-import their own compiled bytecode artifact (preventing compiler cycles). Storage migration logic must reside in the target upgraded contract (`FossFiWallet` / `storage-migration.tolk`) rather than bloating the proxy. The proxy executes `setCodePostponed`, replaces `c3` via `setTvmRegisterC3`, and invokes migration via `@method_id(2223)`. Target contracts must preserve `@method_id(2223)` in their compiled code dictionary against dead-code elimination. Operational messages (token transfers, mints, lottery prizes) require an onboarded wallet; un-onboarded proxies accept only `TopUpTons` or `InternalInvite`.

### Frontend (TanStack Start)

**Skill loading.** Before substantial frontend edits, run `bunx @tanstack/intent@latest list` from the workspace root; if a listed skill matches, run `bunx @tanstack/intent@latest load <package>#<skill>` and follow its `SKILL.md`.

**Stack & integrations:** React, TanStack Start + Router + Query, Tailwind v4, shadcn/ui (Radix), `@tanstack/ai` + `@tanstack/ai-openai`, TonConnect + `@ton/ton`, PWA (`vite-plugin-pwa` manifest-only).

**Routes:** `/` → `src/pages/manage/ManagePage` (tab in URL as a zod-validated `?tab=` search param), `/deploy` → `src/pages/DeployPage` deep-linkable state lives in the URL, not React state.

**Env vars:** `VITE_BASE` (Vite `base` + Router `basepath`, keep in sync with `src/router.tsx` and `vite.config.ts`; default `/brotherhood/` for the GH Pages project site), `TONCENTER_MAINNET_API_KEY` / `TONCENTER_TESTNET_API_KEY` (client-exposed, higher Toncenter rate limits), `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` (server-only, used by `/api/chat`). Local Cloudflare dev keys go in `.dev.vars`; on Workers bind them as secrets/vars.

**Deployment:** Static-first. `.github/workflows/pages.yml` runs `bun run build:ghpages` and uploads `dist/client` to GitHub Pages (works because every route is `ssr: false` and the build prerenders shells + `404.html`). Cloudflare Workers SSR is optional via `bun run deploy:workers` (`wrangler.jsonc`); server routes only run on a server runtime (dev or Workers) and 404 on a static host.

**Testing:** `playwright` is a devDependency for headless checks (browser binary in `~/.cache/ms-playwright`, installed once via `bunx playwright install chromium`). `bun run smoke` runs `scripts/smoke-test.mjs` against the dev server (or pass a URL, e.g. against a served `dist/client`). Use it after frontend changes to catch client-side render regressions — especially because routes are `ssr: false` and only the shell is server-rendered.

You have access to local Cloudflare services (KV, R2, D1, Durable Objects, and Workflows) for this app via the Explorer API.
API endpoint: http://localhost:3000/cdn-cgi/local/explorer/api
Fetch the OpenAPI schema from API endpoint to discover available operations. Use these endpoints to list, query, and manage local resources during development.

**Gotchas:**

- `tsr generate` will not emit the `@tanstack/react-start` `Register` augmentation because this router uses `createTanStackRouter` (no `createStart`). It lives in `src/start-router-register.ts` (eslint-disabled, mirrors TanStack's generated block). Don't delete it — `/api/chat`'s `server.handlers` option stops typechecking without it.
- `vite-plugin-pwa` only injects `manifest.webmanifest` in this multi-env build; `public/sw.js` is hand-authored. Cache name is `brotherhood-pwa-*`.
- `src/routeTree.gen.ts` is regenerated non-prettier-style on every `vite build`, so it's prettier-ignored and `tsr generate`-overwritten.
- `vite preview` is hijacked by the Cloudflare Vite plugin into SSR/Workers mode (raw assets 404 there). For static verification serve `dist/client` directly.
- `.dev.vars` is copied into `dist/server` at build (dev keys only; never commit real secrets).
- On Cloudflare Workers, module-scope `process.env` is undefined — read env vars inside the handler.
- Client chunks are split via `build` `environments.client.rolldownOptions.output.codeSplitting` groups (react, react-router, tanstack-query, tanstack-store, ton-sdk, tonconnect, radix-ui, floating-ui, lucide-react, zod). SSR build stays monolithic.
- Floating overlays (e.g. `PwaInstallBanner`, promotional badges) must never be displayed on onboarding or authentication routes (`/welcome`, `/setup-password`, `/create-wallet`, `/import-wallet`, `/unlock`, `/ledger`) or when `hasWallet` is `false`. Onboarding screens pin their primary action buttons to the bottom viewport footer (`CenteredScreen`); fixed bottom banners intercept pointer clicks. Inside the main app, always position banners above `BottomNav` (e.g. `bottom-20`).
- When unlocking from `UnlockScreen` (passcode or biometrics), always check `hasWallet` before navigating to `/wallet`. An account with a passcode set but no active wallet will fail `<ProtectedRoute requiresWallet>` on `/wallet` and bounce back to `/welcome`, causing an infinite redirection loop.

### In-Memory Contract State Ingestion & Batching Rules

- **Universal Batch Account Ingestion:** Prefer batch querying `accountStates?include_boc=true` in chunks of 30 over dispatching individual `runGetMethod` calls. Deserialize contract storage in-memory using pure Tolk wrapper functions (`FiWalletStore.fromSlice`, `PersonalStore.fromSlice`, `LocationStore.fromSlice`, etc.).
- **Zero Getter Fallback on Code Hash Mismatch:** When an account's `code_hash` does not match the latest release compiled hash and in-memory `fromSlice` fails, never fall back to on-chain `runGetMethod` calls (as updated wrapper tuple parsers will throw anyway). Instead, flag `isOutdatedCode: true`, serve cached state if available, and prompt the user/member with an upgrade banner.
- **Off-Chain Address Derivation:** Derive child contract addresses deterministically off-chain using wrappers' `fromStorage` / `calculateDeployedAddress` (e.g. `PersonalWallet.fromStorage`) to allow querying parent and child contract states concurrently in the very first batch request.

### Wallet & RPC Routing Rules (Wallet V2)

- **Direct Mode Guard:** Never allow enabling "Direct Testnet Calls" without at least one tested and verified API key or custom self-hosted endpoint.
- **Per-Provider Proxy Fallback:** When Direct Mode is active, each provider must independently check for a configured key/custom URL. Any unkeyed provider must continue routing through the local proxy with origin spoofing to avoid public endpoint 429 rate limit errors.
- **Circuit Breaker Hygiene:** Always call `resetCircuitBreakers()` and `resetThrottledProviderFetchers()` whenever network settings or API keys are updated or saved.
- **Resilient Polling & Activity Streams:** Always catch and suppress `CircuitOpenError` and `ApiServerError` in background catch-up/polling loops (`activityStream.ts`, `fallbackPollingScheduler.ts`) to avoid spamming debug logs or entering tight retry loops during breaker cooldown windows.

### State Management & Selector Stability Rules (Zustand & React)

- **Stable Fallback References in Selectors:** Never use inline object/array literals as selector fallbacks (e.g. `foo ?? []` or `bar ?? {}`) and never invoke state methods that compute or allocate fresh collections inside selector functions (e.g. `state.getContactsList(network)`). Inline allocations produce new memory references on every selector pass, defeating `useShallow` / `useSyncExternalStore` equality checks and causing React to throw _"The result of getSnapshot should be cached to avoid an infinite loop"_ and _"Maximum update depth exceeded"_. Always subscribe directly to the raw slice state property with a module-level frozen fallback singleton (e.g. `state.contactsByNetwork[network] || EMPTY_CONTACTS_MAP`, `EMPTY_ARRAY = Object.freeze([])`, `EMPTY_OBJECT = Object.freeze({})`) and perform filtering or derivation inside `useMemo`.
- **Decouple Background Hydration from Subscribed State:** Do not place mutable slice state objects (e.g. `brotherhoodByAddress`, `jettonsByAddress`) in `useCallback` or `useEffect` dependency arrays of sync/hydration routines. Instead, access the latest state imperatively via `storeApi.getState()` (or `useWalletStoreApi().getState()`) to avoid circular invalidation feedback loops.
- **Change Guards in Slice Setters:** Guard slice mutation methods (e.g. `setBrotherhoodMemberData`, `setLocationContract`) against redundant updates. Check existing values before calling `set(...)` to prevent triggering spurious store change events.
- **No Side Effects or Setters in Render / useMemo:** Never invoke store setters, persistence helpers (e.g. `saveUsernameAddressMapping`), or storage writes directly inside `useMemo` or during the component render phase. Always defer side effects to `useEffect` or wrap in `queueMicrotask` to prevent React from throwing _"Cannot update a component while rendering a different component"_.
- **Persist Middleware Parity:** Whenever a slice is added to `partialize`, ensure it is also explicitly handled in `persist.merge(...)` within `createWalletStore.ts`. Otherwise, persisted data will be wiped and reset to initial state upon rehydration.

### Animation, Motion, and Fluid UI Rules (Framer Motion & Zustand)

- **3-Way Animation Level Parity:** Always respect the active `animationLevel` (`none`, `performance`, `full`) from `usePreferences()` / `useAnimationSettings()`. When `none` (Disabled), suppress spring and layout transitions (`reducedMotion="always"`) to save battery and minimize CPU footprint on low-end devices. When `performance` (TMA/Mobile default), use lightweight opacity crossfades and rolling balance numbers. When `full` (Desktop/Rich default), enable full spring physics, layout shifts (`layout="position"`), and gesture overscroll.
- **Re-Render-Free Dynamic Values (No RAF setState):** Never use `requestAnimationFrame` loops with React `useState` / `setState` for animated balance tickers or rolling counters. Instead, use Framer Motion's `useSpring` and `useTransform` subscribed directly to the DOM element's `textContent` (e.g. `<AnimatedBalance />`) to update figures smoothly at 60fps without scheduling Virtual DOM component re-renders.
- **Optimistic Transaction Ingestion & Reconciliation:** Always append newly broadcast transfers (TON, Jettons, FI, Personal Tokens, Swaps) to `pendingTransactions` via `addPendingTransaction` immediately with a pending badge and optimistic balance calculation. Let the WebSocket streaming / on-chain event ingestion stream (`loadEvents`) automatically reconcile and prune the pending record once the block is indexed.
- **Zero-Redundant Routing & Background Sync:** Do not poll or trigger balance/event sync on window focus or tab visibility changes when WebSocket streaming is active. Rely exclusively on WebSocket streaming (`watchBalance`, `watchTransactions`), network reconnect (`window.online`), and explicit user pull-to-refresh. In store slices (`loadUserJettons`, `loadEvents`, `batchHydrateUniversal`), protect with 60s TTL guards against redundant route transitions (`/` <-> `/send`), allowing bypass only when `force = true`.
- **Time-Sliced In-Process Worker Fallback:** When offloading heavy BOC decoding or cryptographic hashing to Web Workers, always pair worker dispatch with an asynchronous, chunked fallback (e.g. `processAccountItemsAsync` in chunks of 5 yielding via `requestAnimationFrame` / `setTimeout(0)`) with an 8s timeout to eliminate main-thread UI freeze violations in fallback/test environments.

### Telegram Mini App (TWA) & Mobile Rules

- **Biometric Authentication in TWA:** Never use `window.PublicKeyCredential` (WebAuthn) inside Telegram WebViews as it is blocked by default. Always use Telegram's native `BiometricManager` (`init`, `requestAccess`, `updateBiometricToken`, `authenticate`) inside TWA, falling back to WebAuthn only on standard Web/PWA.
- **Fullscreen & Safe Area Insets:** In Bot API 8.0+ fullscreen mode, total top safe area is `safeAreaInset.top + contentSafeAreaInset.top`. Always listen to `safeAreaChanged`, `contentSafeAreaChanged`, `fullscreenChanged`, `fullscreenFailed`, and `viewportChanged` events to update `--tg-safe-area-top` and `--tg-safe-area-bottom` so top headers and action buttons are never obscured by the phone status bar.
- **Eager BackButton Binding & Basepath:** Always attach Telegram BackButton listeners eagerly on application bootstrap (never lazily on first modal opening). Always normalize router paths against `VITE_BASE` / `BASE_URL` (`/brotherhood/`) when evaluating root route vs sub-routes to avoid unintentional TMA minimization.
- **Modal History & Back-Stack Hygiene on Web vs TWA:** Never push or pop raw `window.history` entries (`window.history.pushState({ modalId })` / `window.history.back()`) for component modals on Web. In SPAs using TanStack Router, synthetic history mutations corrupt router internal state keys (`__TSR_key`, `__TSR_index`), and calling `window.history.back()` on modal unmount races with user navigations out of modals, firing `popstate` events that abort the transition and bounce users back. Reserve back-stack coordination strictly for Telegram's native `BackButton` via `showTelegramBackButton` / `handleGlobalBack()`, leaving Web modal dismissals to React state and Radix/Vaul ESC/backdrop handlers (`syncHistory: false` by default).

### Test Runner Isolation & Framework Boundaries

This repository uses separate test frameworks suited for specific workspace targets:

- **`apps/wallet/src` & `packages/wallet-core`:** Tested via **Bun Test** (`bun test` / `bun run test:unit` or `bun test apps/wallet/src`).
- **`packages/walletkit`:** Tested via **Vitest** (`bun run test:walletkit` / `bun run --cwd packages/walletkit test`) because tests depend on Vitest-specific globals (`vi.stubGlobal`, `vi.mocked`, `vi.runOnlyPendingTimersAsync`, `vi.advanceTimersByTimeAsync`).
- **`apps/wallet/e2e`:** Tested via **Playwright** (`bun run test:e2e` / `bunx playwright test`). Never run directly via `bun test`.
- **`apps/wallet-v2`:** Tested via **Jest** (`bun run --cwd apps/wallet-v2 test`). Never run directly via `bun test`.
- **`contracts/tests`:** Tested via **Acton / Tolk** (`acton test`).
- **Root `bunfig.toml`:** Always retain `pathIgnorePatterns` for `packages/walletkit/**`, `apps/wallet/e2e/**`, and `apps/wallet-v2/**` to ensure raw `bun test` only executes Bun-native unit tests without false failures.

### Store Slice Mock Invariants in Tests

- **Mirror Full Slice Shapes in Mocks:** When manually constructing mock store states in unit tests for slice factories (e.g. `createBrotherhoodSlice`), always supply all default slice properties defined in `initialState` (e.g. `pendingDeferredByAddress: {}`, `brotherhoodByAddress: {}`) to prevent property traversal errors during cleanup/removal routines.
- **Unconditional LocalStorage Mock Isolation:** When providing `localStorage` memory mocks in Bun unit tests, unconditionally assign `(globalThis as any).localStorage = mockLocalStorage` (and `globalThis.window.localStorage`) and invoke `globalThis.localStorage.clear()` in `beforeEach` to prevent persistent store rehydration state from leaking across parallel test suites.
- **Friendly vs Raw Opcode Assertions:** When testing utility helpers like `getPayloadMessageName`, verify the formatted user-facing friendly name (e.g. `'Send Token'`) when a friendly mapping exists, rather than the raw opcode identifier.

### Wallet History Ingestion & Ecosystem Opcode Rules

- **Multi-Account Batch Event Attribution:** In multi-account event fetching (e.g. `ApiClientToncenter`), match queried accounts dynamically (`accounts.some(acc => sameAddress(acc, myAddress))`) rather than hardcoding `accounts[0]` to ensure events on secondary wallets are attributed accurately.
- **Zero-Redundant History Fetching:** Guard history queries with cache checks (`address in eventsByAddress`). Never refetch transaction history solely due to active wallet switching; fetch once per saved address and load incremental events only when a new account is registered or during explicit user pull-to-refresh.
- **Off-Chain Contract Address Pre-Registration:** Register known derived deterministic contract addresses (`FiWallet`, `PersonalWallet`) in `associatedAddressesByAddress` upon account discovery to permit batch event indexing across both member wallets and parent contracts.
- **Ecosystem Opcode and Exit Code Parity:** Keep `KNOWN_OPCODES`, `FRIENDLY_OPCODE_TITLES`, `KNOWN_PROJECT_OPCODES`, and `TVM_EXIT_CODES` synchronized with all message structs and errors defined in Tolk contracts (`contracts/src/**/messages.tolk` and `contracts/src/common/errors.tolk`). Never output generic `"Contract call (0x00000000)"` for standard text comments or plain TON transfers.
