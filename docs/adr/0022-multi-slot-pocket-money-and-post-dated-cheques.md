# 22. Multi-Slot Pocket Money, Post-Dated Cheques, and V1-to-V2 Storage Migration

Date: 2026-10-03

## Status
Accepted (extends and supersedes the single-slot allowance schema in ADR 0018)

## Context
Previously, a Member's Account (`FossFiWallet`) stored friend spending permissions in `Maps.allowances: map<address, coins>`, supporting only a single bare `coins` cap per grantee with no recurring reset, no start date, no validity end date, and no protection against revocation of committed payments.

To make friend spending permissions (`Pocket Money`) suitable for both everyday family/friend pocket money and binding financial commitments (such as post-dated cheques and fixed-term stipends), Accounts need to support multiple concurrent spending modes per grantee while fitting within TVM's 1023-bit cell limit and migrating cleanly from existing v1 Accounts (`storeVersion == 1`).

## Decision
1. **Multi-Slot `PocketMoney` Cell in `Maps.pocketMoney` (`storage.tolk`, `messages.tolk`)**:
   - Replace `Maps.allowances: map<address, coins>` with `Maps.pocketMoney: map<address, Cell<PocketMoney>>`.
   - Wrapping `PocketMoney` in a dedicated reference cell (`Cell<PocketMoney>`, max ~848 bits across all fields) prevents TVM dictionary leaf cell overflow (`267` key bits + inline value bits > `1023`).
   - Each `PocketMoney` record supports four concurrent modes for the same grantee:
     - **`unrestricted: bool`**: Revocable unlimited access to the granter's FI balance without time or amount cap (for closest trusted loved ones).
     - **`oneTime: OneTimePocketMoney?`**: Irrevocable one-time limit (`remaining`, `startTime`, `validUntil`). When `startTime > now`, acts as a post-dated bank cheque. Cannot be revoked or reduced while active (`remaining > 0` and `validUntil == 0 || now < validUntil`), but allows upward upgrades (`new.remaining >= old.remaining`, `new.startTime <= old.startTime`, and `new.validUntil == 0 || new.validUntil >= old.validUntil`).
     - **`fixedRecurring: FixedRecurringPocketMoney?`**: Irrevocable fixed-term recurring limit (`limit`, `spent`, `period`, `startTime`, `validUntil`). Resets `spent = 0` on anchor-aligned cycles (`startTime + k * period`) until `validUntil`. Cannot be revoked or downgraded before `validUntil`, but allows upward upgrades (`new.limit >= old.limit`, `new.period <= old.period`, `new.validUntil >= old.validUntil`, `new.startTime <= old.startTime`).
     - **`openRecurring: OpenRecurringPocketMoney?`**: Revocable open-ended limit (`limit`, `spent`, `period`, `startTime`) without an end date (`period > 0` for recurring weekly/monthly/custom cycles, or `period == 0` for a revocable non-recurring pool). Can be modified or cancelled (`limit = 0`) at any time.

2. **Waterfall Deduction Order (`SpendPocketMoney` `0x00001144`)**:
   - When `unrestricted == true`, `SpendPocketMoney` deducts directly from `store.jettonBalance` without depleting slot caps.
   - Otherwise, `SpendPocketMoney` automatically normalizes recurring cycles at `blockchain.now()` and deducts across currently active and started (`now >= startTime`) slots in grantee-optimal order:
     1. `openRecurring` (cancellable anytime)
     2. `fixedRecurring` (periodic resetting budget)
     3. `oneTime` (permanent one-time cheque)

3. **Storage Migration (`storage-migration.tolk`)**:
   - `migrateFromInit` (from `BaseFiWallet`) initializes `storeVersion: 2`, `version: walletVersion` (inheriting `msg.version` on `InternalInvite`), and `pocketMoney: []`.
   - `migrateFiWalletFromPrevious` (`@method_id(2222)`) checks `oldStore.version < version` and, when `oldStore.storeVersion < 2`, converts any legacy v1 `map<address, coins>` entries into `PocketMoney { openRecurring: OpenRecurringPocketMoney { limit: amount, spent: 0, period: 0, startTime: blockchain.now() } }` and bumps `storeVersion = 2`.
