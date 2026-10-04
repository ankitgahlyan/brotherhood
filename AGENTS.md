# Instructions

- **Be concise.** Only change code directly related to the current task; leave unrelated parts untouched.
- **Reuse** existing types, functions, and components. Search before creating a new one.
- **No new libraries.** Use existing dependencies only. If a task truly can't be done without a new library, stop and explain why.
- **Only** write tests when directly prompted to do so.
- **After your solution:** Review your diff for edge cases or regressions, fix any issues, and present the result concisely.
- **When deeper debugging is needed:** Outline clear step-by-step debugging instructions and remove temporary debug code once resolved.
- **Report inconsistencies:** When exploring or editing files, point out any unrelated bugs or inconsistencies after completing the current request.
- **User is the Source of Truth on Discrepancies:** Whenever there is any conflict between tests, code, docs, frontend, or smart contracts, **the user is the single source of truth**. Never silently alter contract or test semantics to make a check pass — consult the user (via `ask_question` / `/grill-me`) first.
- **No Redundant Post-Edit Lint, Format, Typecheck, or Test Runs (Rely on Pre-Commit Hook):** Do **not** manually run `bun format`, `bun lint`, `bun typecheck`, `bun test`, or `acton test` after making code changes. The pre-commit hook (`.githooks/pre-commit` → `node scripts/pre-commit-tests.mjs --staged`) automatically runs Prettier, ESLint (`--fix`), Tolk `acton fmt` / `acton check` / `acton test`, scoped TypeScript typechecks, and affected unit tests during `git commit`. Commit directly and only fix and re-commit if the pre-commit hook fails.

## Context Management & Rule Hygiene (`< 16 KB` Budget)

- **Keep `AGENTS.md` Strictly `< 16 KB`:** Antigravity truncates `<RULE>` files at ~23.8 KB. Keep `AGENTS.md` compact so 0 bytes are ever truncated.
- **Codify Failures via Progressive Disclosure:** When a bug, TVM error, React Compiler violation, or state/hydration bug is resolved, codify the underlying invariant by **updating the existing rule in-place** (replacing stale/contradictory text rather than appending duplicates) inside the matching domain file under `docs/agents/` (listed below). Only add a rule directly to `AGENTS.md` if it applies to every single turn across all domains.
- **Delegate Broad Exploration to `research` Subagent:** When a task requires reading >5 files or surveying unfamiliar subsystems, invoke the `research` subagent so raw file dumps do not bloat the main conversation transcript.

## Full-Stack Blast-Radius & Cross-Layer Sync Checklist

Every contract or frontend modification must trace and update every affected downstream layer before completion:

1. **Wrappers, Tests & Scripts:** When `contracts/src/**` structs, messages, getters, constants, or storage change, regenerate `wrappers-ts/*.gen.ts` (`acton build && acton wrapper`), and update `contracts/tests/**` and `contracts/scripts/**`.
2. **Hydration, Payload Builders & Config:** Sync in-memory BOC hydration (`apps/wallet/src/lib/brotherhood/account-hydrator.worker.ts`), domain types (`types.ts`), payload builders (`contract-builders.ts`), and protocol/gas constants (`config.ts`, `use-brotherhood-transaction.ts`).
3. **Transaction History & Trace Decoders:** When any message opcode (`struct (0x...)`) or error code (`enum Errors`) changes in `contracts/src/**/*.tolk`, sync `KNOWN_OPCODES` & `FRIENDLY_OPCODE_TITLES` in `apps/wallet/src/core/utils/payload.ts`, and `TVM_EXIT_CODES`, `getContractContextBadge`, & `FI_STRUCT_NAMES` in `apps/wallet/src/features/transactions/utils/map-transaction-row.ts`.
4. **UI Flows, Naming & Domain Glossary:** Audit all consuming tabs, modals, search/lookup views, hooks, and `CONTEXT.md` across `apps/wallet/src/` and `packages/`.

## Disclosed Domain Invariants & Context Pointers

Read the matching domain reference via `view_file` **before** editing files in that branch:

- **Tolk Smart Contracts, Proxies, `.bro` DNS & Acton (`contracts/**`, `wrappers-ts/**`, `Acton.toml`):** Read [`docs/agents/contracts-invariants.md`](file:///home/zeta/jetton/docs/agents/contracts-invariants.md).
  - _Key invariants:_ Use `acton`, `tolk`, and `ton-blockchain` skills. Single `constants.tolk` & `errors.tolk` (non-transitive Tolk imports); deterministic minimal proxies (`Base*` with `@method_id(2223)` migration, acyclic `BasePersonalWallet` with method `0` re-entry); `MULTIPLIER_SCALE = 1000` fixed-point credit multiplier & manual `creditNeed`; `BounceMode.RichBounce` for multi-ref/large messages; `.bro` `DnsItem` $\le 855$-bit root cell (`extra` ref sub-cell) & `toDnsRecordsCell()`; `testing.setNow()` before actor creation; `build("<Contract>")` in tests/scripts.
- **React 19, Zustand, 2D OKLCH Theme, Caching, Modals & TWA (`apps/wallet/src/**`, `packages/**`):** Read [`docs/agents/frontend-invariants.md`](file:///home/zeta/jetton/docs/agents/frontend-invariants.md).
  - _Key invariants:_ React Compiler purity (`useState(() => Date.now())`) & extracted optional-chain locals before `useMemo`; frozen fallback singletons (`EMPTY_ARRAY`, `EMPTY_OBJECT`) & equality bailouts in Zustand selectors/setters; scoped `[data-theme][data-palette]` CSS selectors & theme token binding (`bg-primary`); 3-tier `FallbackImage` cache (non-opaque `statuses: [200]` only) & per-wallet Receive QR in IndexedDB (`brotherhood_offline_images_db`, never `localStorage`); deferred async `history.back()` in `back-stack-manager.ts` + `resetAuth` on last wallet removal; `simplex:/` custom-scheme contact routing; native `Telegram.WebApp` bridges inside TWA.
- **Zero-Getter BOC Hydration, `.bro` Lookup, History Ingestion & Test Runners (`src/lib/brotherhood/**`, `features/dns/**`, `features/transactions/**`, `*.test.ts`):** Read [`docs/agents/hydration-and-history.md`](file:///home/zeta/jetton/docs/agents/hydration-and-history.md).
  - _Key invariants:_ Batch `accountStates?include_boc=true` in chunks of 30 (zero `runGetMethod` fallback; write `null` cache on `uninit`; never update `CONTRACT_CODE_HASHES` without live `--net` upgrade); silent `2 TON` `FiWallet` auto-funding; `.bro`-only DNS resolution (`0ms` local hit, `3000ms` debounce, 1-char support, `useMyDomains` address migration & auction discovery); on-demand `/wallet/history` trace ingestion (`mapEventToRow`) with 100% local filtering; `rateLimitedFetch` bound to `WalletKit`; workspace test runner isolation (`bun test` vs `vitest` vs `playwright` vs `acton test`).
- **Monorepo Architecture & Android Cross-Platform Map (`/home/zeta/connected/ton/android`):** Read [`docs/agents/architecture.md`](file:///home/zeta/jetton/docs/agents/architecture.md).
- **Domain Glossary:** Read [`CONTEXT.md`](file:///home/zeta/jetton/CONTEXT.md) and [`docs/agents/domain.md`](file:///home/zeta/jetton/docs/agents/domain.md).
- **GitHub Issue Tracker & Triage Labels:** Read [`docs/agents/issue-tracker.md`](file:///home/zeta/jetton/docs/agents/issue-tracker.md) and [`docs/agents/triage-labels.md`](file:///home/zeta/jetton/docs/agents/triage-labels.md).
