/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState } from 'react';

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

const IMAGE_CACHE_STORAGE_KEY = 'brotherhood_cached_token_images_v1';

function getStoredLoadedUrls(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/** Global module-level cache of successfully loaded image URLs, pre-seeded from persistent storage. */
const LOADED_IMAGE_URLS = getStoredLoadedUrls();

function persistLoadedUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  try {
    LOADED_IMAGE_URLS.add(url);
    const urls = Array.from(LOADED_IMAGE_URLS).slice(-300);
    localStorage.setItem(IMAGE_CACHE_STORAGE_KEY, JSON.stringify(urls));

    // Also persist response in browser CacheStorage for offline reliability
    if ('caches' in window) {
      caches
        .open('brotherhood-images')
        .then((cache) => {
          fetch(url, { mode: 'no-cors' })
            .then((res) => {
              if (res.status === 0 || res.ok) {
                cache.put(url, res);
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

const toList = (src: string | string[] | undefined): string[] =>
  (Array.isArray(src) ? src : src ? [src] : []).filter((url): url is string =>
    Boolean(url),
  );

const getInitialImageStatus = (src: string | undefined): ImageStatus => {
  if (!src) return 'idle';
  if (LOADED_IMAGE_URLS.has(src)) return 'loaded';
  return 'loading';
};

const useImageStatus = (src: string | undefined): ImageStatus => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [status, setStatus] = useState<ImageStatus>(() =>
    getInitialImageStatus(src),
  );

  if (prevSrc !== src) {
    setPrevSrc(src);
    setStatus(getInitialImageStatus(src));
  }

  useEffect(() => {
    if (!src || LOADED_IMAGE_URLS.has(src)) return;

    let cancelled = false;
    const image = new window.Image();
    image.src = src;

    if (image.complete && image.naturalWidth > 0) {
      persistLoadedUrl(src);
      void Promise.resolve().then(() => {
        if (!cancelled) setStatus('loaded');
      });
      return;
    }

    const onLoad = () => {
      if (cancelled) return;
      persistLoadedUrl(src);
      setStatus('loaded');
    };
    const onError = () => {
      if (cancelled) return;
      setStatus('error');
    };
    image.addEventListener('load', onLoad);
    image.addEventListener('error', onError);
    return () => {
      cancelled = true;
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
    };
  }, [src]);

  return status;
};

interface FallbackImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  /** One or more candidate URLs, tried in order until one loads. */
  src: string | string[] | undefined;
  /** Rendered while loading or when every candidate fails to load. */
  fallback?: React.ReactNode;
}

/**
 * `<img>` that walks a list of candidate URLs, showing the first that loads and
 * falling back to the next on error (404 / 403 / CSP / network). Renders
 * `fallback` until one succeeds.
 */
export const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  fallback = null,
  alt = '',
  ...props
}) => {
  const sources = toList(src);
  const key = sources.join(' ');

  const [prevKey, setPrevKey] = useState(key);
  const [index, setIndex] = useState(0);
  const [lastHandledErrorIndex, setLastHandledErrorIndex] = useState(-1);

  if (prevKey !== key) {
    setPrevKey(key);
    setIndex(0);
    setLastHandledErrorIndex(-1);
  }

  const current = sources[index];
  const status = useImageStatus(current);

  if (
    status === 'error' &&
    index < sources.length - 1 &&
    lastHandledErrorIndex !== index
  ) {
    setLastHandledErrorIndex(index);
    setIndex(index + 1);
  }

  if (status === 'loaded' && current) {
    return <img src={current} alt={alt} {...props} />;
  }
  return <>{fallback}</>;
};
