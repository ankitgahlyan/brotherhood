/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { LoaderCircle } from '@/core/components/ui/loader-circle';

export const RouteFallback: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <LoaderCircle size="md" />
  </div>
);
