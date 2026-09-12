/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './bufferPolyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initDevTelemetry } from '@/core/lib/dev-telemetry';
import { initServiceWorker } from '@/core/lib/service-worker';
import '@fontsource-variable/inter';
import './index.css';
import App from './App.tsx';

initDevTelemetry();
initServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
