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
- Treat files in `wrappers`, `wrappers-ts` as generated output. Regenerate them from the contract ABI instead of hand-editing them when the ABI changes.
- Keep `contracts/tests/`, `contracts/wrappers/`, `contracts/scripts/`, `wrappers-ts/`, and the frontend code in `src/` aligned with contract changes.
- Prefer this validation loop when feasible: `acton check --fix`, `acton fmt`, `acton build`, `acton test`, `bun run typecheck`, `bun run build`.
- Before proposing broadcast deployment changes or metadata changes, verify the contract flow with `acton run deploy-emulation` first.
- For the Personal Token issuer onboarding flow, verify with `acton run verify-personal` (emulates deploy + wallet pointer + buy credit) before proposing a real `acton run deploy-personal`.
- When command syntax or flags are unclear, verify them with `acton --help`, `acton <command> --help`, `bun run`, or the existing project config.

#### Contract rules
- separate struct/msg files for each contract instead of unnecessarily bloating other contracts and common file for common structs/msg
- report any circular dependency issues

### Frontend (TanStack Start)

The frontend was migrated from the old client-side Vite SPA (`app/`, now removed) into a fresh TanStack Start scaffold merged into this repo. Original scaffold command:

```bash
bunx @tanstack/cli@latest create my-tanstack-app --agent --package-manager pnpm --tailwind --deployment cloudflare --add-ons better-auth,prisma,tanstack-query,shadcn
```

The scaffold lives in a scratch dir (`/home/zeta/tanstack`); this repo is the merged product (bun-based).

**Skill loading.** Before substantial frontend edits, run `bunx @tanstack/intent@latest list` from the workspace root; if a listed skill matches, run `bunx @tanstack/intent@latest load <package>#<skill>` and follow its `SKILL.md` (they also live under `node_modules/@tanstack/*/skills/*/SKILL.md`).

**Stack & integrations:** React, TanStack Start + Router + Query + Store, Tailwind v4, shadcn/ui (Radix), `@tanstack/ai` + `@tanstack/ai-openai`, TonConnect + `@ton/ton`, PWA (`vite-plugin-pwa` manifest-only). The scaffold's `better-auth` and `prisma` add-ons were intentionally **not** ported — no server DB/auth backend yet; revisit when one lands.

**Routes:** `/` → `src/pages/manage/ManagePage` (tab in URL as a zod-validated `?tab=` search param), `/deploy` → `src/pages/DeployPage`, `/api/chat` → Start server route proxying OpenRouter (Chat Completions wire format via `@tanstack/ai-openai` with `baseURL: https://openrouter.ai/api/v1`). The old `app/src/lib/router.ts` is gone; deep-linkable state lives in the URL, not React state.

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

**Next steps:** add a chat UI consumer for `/api/chat`, review `git status`/PR.
