# MyTonWallet — Local Development Setup Guide

A quickstart guide for setting up and running MyTonWallet locally without needing your own self-hosted backend infrastructure.

---

## 1. Prerequisites

- **Node.js**: Node 24 recommended (Node 26+ works with configured Webpack polyfills).
- **Package Manager**: Use `nub` (the project's native toolchain) or `npm`:
  ```bash
  # Check your node version
  node -v
  ```

---

## 2. Dependencies

Install packages using `npm` or `nub`:
```bash
npm install
```

> [!NOTE]
> When using isolated package stores (`nub`/`pnpm`), direct dependencies (`@noble/hashes`, `@ledgerhq/devices`, `buffer`) are resolved automatically via symlinks in `node_modules` or Webpack aliases.

---

## 3. Starting the Development Server

Start the web development server:
```bash
npm run dev
```

- **URL**: `http://localhost:1235/`
- **Port Note**: The dev server defaults to port `1235` (configurable via `PORT=1235 npm run dev`). Do **not** use port `4321`, as host firewall rules frequently block outgoing connections on port 4321.

---

## 4. How Backend APIs and Blockchain RPCs Work (No Local Node Needed)

You **do not** need to deploy or run a local API backend or blockchain node to develop on MyTonWallet:
- In development mode (`APP_ENV=development`), the Webpack dev server automatically proxies:
  - `/api-backend/*` -> `https://api.mywallet.io` (backend services, tokens, swap rates)
  - `/toncenter-proxy/*` -> `https://toncenter.mytonwallet.org` (TON JSON-RPC)
  - `/tonapiio-proxy/*` -> `https://tonapiio.mytonwallet.org` (TonAPI indexing)
  - `/tron-proxy/*` -> `https://tronapi.mytonwallet.org` (TRON blockchain RPC)
- The proxy rewrites the `Origin` header to `https://mytonwallet.app`, ensuring that browser CORS checks succeed smoothly.
- Live token prices, swap DEX routes, staking pool rates, account balances, and wallet creation load out of the box without errors.

---

## 5. WebGL and Headless Linux Environments

Auth screens feature subtle particle animations powered by WebGL.
- **Graceful Fallback**: If WebGL is unavailable or fails to initialize (e.g. in minimal VMs or containers without hardware acceleration), the canvas falls back gracefully without breaking the UI or throwing unhandled errors.
- **Headless Chrome Warning**: In headless Chrome / Chromium test environments, passing `--enable-unsafe-swiftshader` prevents Chrome's software WebGL deprecation warning.

---

## 6. Optional Environment Configuration & Chain Flags

In `.env`, you can toggle feature flags or set custom keys:

```env
# Focus exclusively on TON (disables Ethereum/EVM, Solana, and TRON to speed up builds and avoid multi-chain CORS / 504 timeouts):
NO_EVM=1
NO_SOLANA=1
NO_TRON=1

# Optional: WalletConnect Cloud project ID (from https://cloud.reown.com)
WALLET_CONNECT_PROJECT_ID=

# Optional: Custom TON Center API key
TONCENTER_MAINNET_KEY=
```

When `NO_EVM=1`, `NO_SOLANA=1`, and `NO_TRON=1` are set, Webpack drops `ethers`, `@solana/web3.js`, and `tronweb` from the build, dramatically speeding up compile times, saving memory, and preventing any 504 or multi-chain background polling errors.

---

## 7. Verification and Testing

```bash
# Typecheck
npx tsc --noEmit

# Unit tests
npm run test

# End-to-end browser tests
npm run test:playwright
```
