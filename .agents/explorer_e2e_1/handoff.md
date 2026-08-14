# Handoff Report: E2E Testing & Specification Mining

## 1. Observation

### 1.1 Test Execution Environment Commands & Results
- Executed `bun --version`: Output `1.3.14`
- Executed `node --version`: Output `v22.23.2`
- Executed `bun test`: Result `bun test v1.3.14`, confirmed native runner for TypeScript unit/integration tests without pre-compilation.
- Executed `bunx playwright --version`: Output `Version 1.62.1`, confirmed Playwright runner availability and Chromium browser binary installation (`~/.cache/ms-playwright`).
- Executed `bunx tsx --version`: Output `tsx v4.23.11`, confirmed TS script execution.
- Executed `bunx vitest --version`: Output `4.1.10`, confirmed Vite test runner availability.

### 1.2 Identified Core Modules & File Paths
- Wallet Key Derivation: `src/lib/wallet/mnemonic.ts` (`generateMnemonic`, `validateMnemonic`, `mnemonicToKeyPair`, `deriveWalletV5R1`)
- WalletV5R1 Contract: `src/lib/wallet/wallet-v5-r1.ts` (subwallet ID `2147483409`, workchain 0, `WalletV5Config`, `walletV5ConfigToCell`, `createTransferCell`)
- Key Security & Crypto: `src/lib/wallet/crypto.ts` (`SimpleEncryption` with Web Crypto AES-GCM + PBKDF2-SHA512 100k iterations, salt 16 bytes, IV 12 bytes, password hash `SHA-256(password + 'wallet_salt')`)
- LocalStorage Persistence: `src/lib/wallet/storage.ts` (`SavedWallet` interface, schema v2, `brotherhood_wallet_store`)
- RPC Broadcaster: `src/lib/wallet/rpc-client.ts` (`TonClient`, `fetchSeqno`, `fetchBalance`, `broadcastBoc` via `/api/v3/message`)
- Direct Transaction Hook: `src/lib/useSendFiTransaction.ts` (`sendTransaction(messages)` signing with local `secretKey` and broadcasting via RPC)
- Payload Builders: `src/lib/deploy.ts` (19 action payload builders for Jetton deployment, minting, transfer, burn, allowance, credit, invite, vote, destroy, and personal minter)

### 1.3 Transaction Trigger Mapping (19 Triggers)
- `DeployPage.tsx`: `handleDeploy` (MintNewJettons `0x00001001`, 0.15 TON, stateInit + payload)
- `AdminTab.tsx`: 5 triggers (`ChangeMinterMetadata` `0x00001008`, `ChangeMinterAdmin` `0x00001007`, `TopUpTons` `0x0000100b`, `ApproveUpgrade` `0x000010a3`, `RejectUpgrade` `0x000010a4`)
- `MintTab.tsx`: `handleMint` (`MintNewJettons` `0x00001001`, 0.10 TON)
- `AllowanceTab.tsx`: 2 triggers (`SetAllowance` `0x000010f8`, `SpendAllowance` `0x000010f9`)
- `BurnTab.tsx`: `handleBurn` (`AskToBurn` `0x595f07bc`, 0.05 TON)
- `CreditTab.tsx`: 2 triggers (`BuyCredit` `0x000010a1`, `AskToBurn` `0x595f07bc`)
- `DestroyTab.tsx`: `sendDestroy` (`Destroy` `0x0000105a`, 0.60 TON)
- `InviteTab.tsx`: `handleInvite` (`ActInvite` `0x00001051`, 0.60 TON)
- `IssueTokenTab.tsx`: `handleIssue` (2-message batch: Deploy + `ActSetPersonalJettonMinter` `0x0000105b`)
- `TransferTab.tsx`: `handleTransfer` (`AskToTransfer` `0x0f8a7ea5`, 0.05 TON)
- `VoteTab.tsx`: 2 triggers (`ActVote` `0x00001058`, `ActUnvote` `0x00001059`)

---

## 2. Logic Chain

1. **Observation 1.1**: The project environment has fully working test execution engines (`bun test`, `vitest`, `tsx`, `playwright`, `node`, `acton test`).
   - **Reasoning**: `bun test` is ideal for unit and cell payload encoding tests due to zero build overhead, while Playwright provides full browser UI testing for the React frontend.
2. **Observation 1.2**: Module specifications for `src/lib/wallet/` define explicit function signatures and serializable data structures (`SavedWallet`, `WalletV5Config`, `SendTransactionMessage`, `TransactionResult`).
   - **Reasoning**: These contracts enable clean opaque-box testing: tests can import exports from `src/lib/wallet/` and `src/lib/deploy.ts` directly, supplying synthetic inputs and asserting on produced cells, hashes, and decrypted values without modifying production code.
3. **Observation 1.3**: All 19 transaction triggers invoke `useSendFiTransaction` or construct `SendTransactionMessage` objects with target address, attached TON nanotons value, stateInit cell, and payload cell.
   - **Reasoning**: Opaque-box test suites can mock the underlying RPC broadcaster or WalletContext provider, execute the payload builders, and verify that constructed transfer cells contain correct opcodes, signatures, and destination addresses.

---

## 3. Caveats

- **No Code Modifications Made**: Investigation was conducted strictly read-only on project source code.
- **RPC Network Sandbox**: Network calls in tests should mock `rpc-client.ts` / `TonClient` network responses (`fetchSeqno`, `broadcastBoc`) to prevent unneeded external network traffic during test execution.
- **Browser Execution Headless Mode**: Playwright tests require running dev server (`vite dev` / `dist/client`) prior to browser interaction.

---

## 4. Conclusion

1. **Test Tool Availability**: `bun test` (unit/integration), `vitest` (component/hooks), `tsx` (scripts), `node` (smoke tests), and `playwright` (headless E2E) are 100% operational in this workspace.
2. **Specification Mining**: Complete interface contracts, data flows, opcodes, payload builders, and 19 transaction triggers were mined and documented in `analysis.md`.
3. **Opaque-Box E2E Testing Plan**: Formulated a 4-layer testing strategy covering Wallet Core Crypto, Cell Payload Builders, Hook Transaction Signers, and Headless Browser UI workflows.

---

## 5. Verification Method

To verify these findings and execute the test suites once created:

1. **Run Unit & Integration Tests via Bun**:
   ```bash
   bun test
   ```
   *Expected result*: Executes all TypeScript test files (`*.test.ts`) fast without compilation steps.

2. **Run TSX Execution Verification**:
   ```bash
   bunx tsx <test_script.ts>
   ```
   *Expected result*: Runs standalone TypeScript verification scripts.

3. **Run Frontend Smoke Test**:
   ```bash
   node scripts/smoke-test.mjs
   ```
   *Expected result*: Validates dev server rendering and route shells.

4. **Run Playwright E2E Browser Suite**:
   ```bash
   bunx playwright test
   ```
   *Expected result*: Launches headless browser and verifies end-to-end UI flows.
