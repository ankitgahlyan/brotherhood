## Agent Skills

### Issue tracker

GitHub Issues are the issue tracker for this repository. Use the `gh` CLI for all issue operations (create, view, comment, label, close).

### Domain docs

This repository uses a single-context layout for domain documentation. The glossary lives in `CONTEXT.md` at the repo root.

- Use `acton` skill for Acton CLI, Tolk, wrappers, tests, scripts, deployment, and `Acton.toml` tasks.
- Treat the contracts under `contracts/src/` as the source of truth, especially `fossFi/fossFi.tolk`, `fossFi/fossFiWallet.tolk`, `fossFi/storage.tolk`, `personalMinter/personal.tolk`, `personalMinter/personalWallet.tolk`, `common/messages.tolk`, and `common/errors.tolk`.
- Treat the minter and wallet contracts as a coupled system. Keep storage, message formats, tests, wrappers, TypeScript wrappers, scripts, and frontend flows consistent across both sides.
- Treat `wrappers-ts/FossFi.gen.ts`, `wrappers-ts/FossFiWallet.gen.ts`, `wrappers-ts/Personal.gen.ts`, and `wrappers-ts/PersonalWallet.gen.ts` as generated output. Prefer regenerating them from the contract ABI instead of hand-editing them when the ABI changes.
- Keep `contracts/tests/`, `contracts/wrappers/`, `contracts/scripts/`, `wrappers-ts/`, and the frontend code in `app/` aligned with contract changes.
- Prefer this validation loop when feasible: `acton build`, `acton test`, `npm run typecheck`, `npm run build`.
- Before proposing broadcast deployment changes or metadata changes, verify the contract flow with `acton run deploy-emulation` first.
- When command syntax or flags are unclear, verify them with `acton --help`, `acton <command> --help`, `npm run`, or the existing project config.
