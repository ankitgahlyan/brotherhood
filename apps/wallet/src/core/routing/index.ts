/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  useNavigate as useTanStackNavigate,
  useLocation as useTanStackLocation,
  Link,
  Navigate,
} from '@tanstack/react-router';

export { Link, Navigate };

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
  search?: Record<string, any>;
  params?: Record<string, any>;
}

export function useNavigate() {
  const tanstackNavigate = useTanStackNavigate();

  return React.useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        if (to === -1) {
          window.history.back();
        } else {
          window.history.go(to);
        }
        return;
      }

      if (options?.state) {
        window.history.replaceState(
          { ...window.history.state, __customState: options.state },
          '',
        );
      }

      tanstackNavigate({
        to: to as any,
        replace: options?.replace,
        search: options?.search,
        params: options?.params,
      });
    },
    [tanstackNavigate],
  );
}

export function useLocation() {
  const loc = useTanStackLocation();
  const state =
    (window.history.state as any)?.__customState ?? window.history.state;
  return {
    ...loc,
    pathname: loc.pathname,
    state,
  };
}

export * from './protected-route';
