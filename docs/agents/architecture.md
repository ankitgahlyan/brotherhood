# BrotherHood Web & Smart Contracts (`/home/zeta/jetton`) — Architectural Map & Cross-Platform Reference

This document maps the architecture of the `/home/zeta/jetton` monorepo (`ankitgahlyan/brotherhood`) for agents maintaining the web app, Tolk smart contracts, and the companion native Android port at `/home/zeta/connected/ton/android` (`ankitgahlyan/brotherhood-android`).

---

## 1. Monorepo Package Map

```
/home/zeta/jetton/
├── contracts/
│   ├── src/                           # 16 Tolk smart contracts (Single source of truth)
│   │   ├── common/                    # constants.tolk, errors.tolk, types.tolk, messages.tolk
│   │   ├── foss-fi.tolk               # FossFi ($FI) Minter contract
│   │   ├── foss-fi-wallet.tolk        # Member Account contract (FiWalletStore)
│   │   ├── base-fi-wallet.tolk        # Minimal deterministic proxy for Account address derivation
│   │   ├── personal-minter.tolk       # Member Personal Token Minter (5 decimals)
│   │   ├── personal-wallet.tolk       # Personal Token Wallet
│   │   ├── base-personal-wallet.tolk  # Minimal proxy for Personal Token Wallet
│   │   ├── location.tolk              # Uber H3 spatial index child contract (SHARD_DEPTH = 8)
│   │   ├── dao.tolk / poll.tolk / voter.tolk # On-chain Governance (DAO Proxy, Poll, Voter)
│   │   ├── lottery.tolk               # Commit-reveal Lottery contract
│   │   ├── holding.tolk               # 72-hour Deferred Payment escrow contract
│   │   ├── following.tolk             # Ephemeral social link contract (1,000 FI mint/burn)
│   │   └── dns-*.tolk / root-dns.tolk # .bro Domain Name System & English Auction contracts
│   ├── scripts/                       # Acton deployment, upgrade, and verification scripts
│   └── tests/                         # Acton Tolk contract test suites (`acton test`)
├── wrappers-ts/                       # Generated TypeScript contract wrappers, 32-bit opcodes & fromSlice codecs
├── packages/
│   ├── walletkit/                     # @ton/walletkit — TON wallets (V4R2, V5R1), TonConnect, Swap, Staking, Gasless
│   ├── wallet-core/                   # @demo/wallet-core — Zustand + Immer store (`bro-store`, 12 slices)
│   └── v4ledger-adapter/              # @demo/v4ledger-adapter — Hardware Ledger V4R2 adapter
└── apps/
    └── wallet/                        # Main React 19 + TanStack Router + Tailwind v4 Web/TMA App
        └── src/
            ├── routes/                # File-based routes (`_auth.*`, `_app/wallet.*`, `brotherhood`, `personal-jetton`, `city-network`, `dao`, `lottery`, `dns`, `send`, `swap`, `developer`)
            ├── features/              # Feature modules matching routes
            └── lib/brotherhood/       # config.ts, account-state-hydrator.ts, account-hydrator.worker.ts, contract-cache.ts, rate-limiter.ts
```

---

## 2. Core Architectural Pipelines

### A. Zero-Getter Batch BOC Hydration (`apps/wallet/src/lib/brotherhood/`)
1. **`account-state-hydrator.ts`**: Collects requested addresses across a **50ms debounce window**, chunks into **30 addresses per batch**, and calls Toncenter v3 `GET /api/v3/accountStates?address=...&include_boc=true`.
2. **`account-hydrator.worker.ts`**: Matches each account's base64 `code_hash` against `KNOWN_CODE_HASHES` and runs `FiWalletStore.fromSlice`, `FiStore.fromSlice`, `PersonalStore.fromSlice`, `PersonalWalletStore.fromSlice`, `LocationStore.fromSlice`, `LotteryStorage.fromSlice`, or `PollStore.fromSlice`.
3. **`contract-cache.ts`**: Two-tier L1 memory + L2 IndexedDB (`brotherhood_contract_db`: `contract_cache`, `metadata_cache`, `address_book_cache`) keyed by `lt` (logical time).

### B. Deterministic Off-Chain Address Derivation (`SHARD_DEPTH = 8`)
- **`FossFiWallet`**: Derived off-chain from `(ownerAddress, FI_ADDRESS, baseFiWalletCode)`.
  - *Invariant*: `FiWalletStore.invitees` (`maps.invited`) already holds deployed `FiWallet` addresses, not owner addresses.
- **`PersonalMinter`**: Deployed in two phases:
  1. Deploy with `metadataUri: null` (`adminAddress = ownerAddress`, `SHARD_DEPTH = 8`) + `ActSetPersonalJetton` (`0x00001149`) on `FiWallet`.
  2. Send `ChangeMinterMetadata` (`0x00001005`) post-deploy.
- **`Location`**: Derived from `(h3Cell, FI_ADDRESS, locationCode)` with `SHARD_DEPTH = 8`.

---

## 3. Cross-Repo Synchronization with BrotherHood Android (`/home/zeta/connected/ton/android`)

When modifying smart contracts (`contracts/src/*.tolk`), protocol constants (`apps/wallet/src/lib/brotherhood/config.ts`), or wrapper codecs (`wrappers-ts/*.ts`), keep the Android repository synchronized across these corresponding layers:

| Web / Contract Source (`/home/zeta/jetton`) | Android Target (`/home/zeta/connected/ton/android`) |
|---|---|
| `CONTEXT.md` & `docs/adr/*.md` | `GLOSSARY.md` & `docs/adr/*.md` |
| `apps/wallet/src/lib/brotherhood/config.ts` | `:lib:brotherhood` (`BrotherhoodConfig.kt`) |
| `wrappers-ts/*.ts` (`fromSlice`, opcodes, `StateInit`) | `:lib:brotherhood` (`store/*.kt`, `messages/*.kt`, `derivation/*.kt`) |
| `apps/wallet/src/lib/brotherhood/domain/*` (`fi-account-projector.ts`) | `:lib:brotherhood` (`domain/FiAccountProjector.kt`) |
| `account-state-hydrator.ts`, `contract-cache.ts` & `synchronizer.ts` | `:apps:wallet:data:brotherhood` (`AccountStateHydrator.kt`, `BrotherhoodDatabase.kt`, `BrotherhoodSynchronizer.kt`) |
| `use-auto-fiwallet-funding.ts` | `:apps:wallet:data:brotherhood` (`AutoFiWalletFunder.kt`) |
| `packages/wallet-core/src/store/slices/*` | `:apps:wallet:data:brotherhood` Repositories + `:apps:wallet:features:brotherhood` `GraphViewModel`s |
| `apps/wallet/src/features/*` (7 main tabs & 11 BrotherHood sub-tabs) | `:apps:wallet:features:brotherhood` Compose screens + `MoonNav` routers |

