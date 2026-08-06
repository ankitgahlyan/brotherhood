## Agent Skills

### Issue tracker

GitHub Issues are the issue tracker for this repository. Use the `gh` CLI for all issue operations (create, view, comment, label, close). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context layout for domain documentation. The glossary lives in `CONTEXT.md` at the repo root. See `docs/agents/domain.md`.

- Use `acton` skill for Acton CLI, Tolk, wrappers, tests, scripts, deployment, and `Acton.toml` tasks.
- Use `tolk` skill for tolk smart contracts related tasks.
- Use `ton-blockchain` skill for ton blockchain related tasks.
- Treat the contracts under `contracts/src/` as the source of truth.
- Treat the minter and wallet contracts as a coupled system. Keep storage, message formats, tests, wrappers, TypeScript wrappers, scripts, and frontend flows consistent across both sides.
- Treat files in `wrappers`, `wrappers-ts` as generated output. Regenerate them from the contract ABI instead of hand-editing them when the ABI changes.
- Keep `contracts/tests/`, `contracts/wrappers/`, `contracts/scripts/`, `wrappers-ts/`, and the frontend code in `app/` aligned with contract changes.
- Prefer this validation loop when feasible: `acton fmt`, `acton check`, `acton build`, `acton test`, `npm run typecheck`, `npm run build`.
- Before proposing broadcast deployment changes or metadata changes, verify the contract flow with `acton run deploy-emulation` first.
- For the Personal Token issuer onboarding flow, verify with `acton run verify-personal` (emulates deploy + wallet pointer + buy credit) before proposing a real `acton run deploy-personal`.
- When command syntax or flags are unclear, verify them with `acton --help`, `acton <command> --help`, `npm run`, or the existing project config.
