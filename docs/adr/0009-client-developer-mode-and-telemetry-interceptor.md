# Client Developer Mode and Telemetry Interceptor Architecture

## Context
Developers and QA engineers troubleshooting client-side issues (especially in embedded Telegram Mini App or mobile PWA webviews) do not have native access to browser developer tools, the JavaScript console, or network inspection panels. Diagnosing failed Toncenter RPCs, serialization errors, or API rate-limiting issues on real devices currently requires tethered USB remote debugging or guesswork.

## Decision
1. **Easter Egg Activation Mechanism**:
   - In the Settings modal, tapping the bottom "Brotherhood" brand text 7 times permanently unlocks Developer Mode on that device.
   - Taps are tracked with a 2-second sliding reset interval to prevent accidental activation.
   - Gentle toast feedback is provided on taps 4 through 6, culminating in a confirmation toast and automatic redirect to `/developer` on the 7th tap.
   - Unlocking is persisted in `localStorage` under `brotherhood_developer_mode_enabled`. Once unlocked, a permanent "Developer Diagnostics" navigation entry is rendered in the Settings modal. An explicit disable switch is provided on the Developer Diagnostics screen to revert.

2. **Global Telemetry Interception**:
   - Outgoing HTTP/HTTPS network calls are intercepted by wrapping `window.fetch` at the earliest point of application bootstrap (`main.tsx`).
   - Native console logging methods (`console.log`, `console.info`, `console.warn`, `console.error`, `console.debug`) are hooked to capture messages and arguments while preserving the original console output in browser devtools.
   - Network payloads and console events are recorded into an in-memory circular buffer capped at 1,000 items to prevent unbounded memory growth on constrained mobile devices.

3. **Metrics and Real-Time Inspection View (`/developer`)**:
   - A dedicated diagnostic route (`/developer`) provides real-time visibility into application health.
   - The top banner aggregates key performance indicators: Total API Calls, Active In-Flight Calls, Failed Calls, and Console Errors.
   - A tabbed interface allows engineers to view a combined chronological stream, isolated API calls with response status/latency/payload previews, or filtered console logs with full search and JSON clipboard export.
   - The route does not enforce wallet creation or unlock prerequisites (`requiresWallet={false}`), ensuring engineers can inspect network requests during onboarding, import, or unlock failures.
