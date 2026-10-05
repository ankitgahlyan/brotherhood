/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState } from 'react';
import { assetUrl } from '@/core/utils/asset';

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

const IMAGE_CACHE_STORAGE_KEY = 'brotherhood_cached_token_images_v1';
const IMAGE_DATA_URL_STORAGE_KEY = 'brotherhood_cached_image_data_v1';
const CACHE_STORAGE_NAME = 'brotherhood-images';
const IDB_NAME = 'brotherhood_offline_images_db';
const IDB_STORE = 'blobs';
const MAX_INLINE_DATA_URL_BYTES = 48 * 1024; // 48 KB for synchronous L1 localStorage cache
const MAX_L1_ENTRIES = 60;

function getStoredLoadedUrls(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function getStoredDataUrls(): Map<string, string> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(IMAGE_DATA_URL_STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

/** Global module-level cache of successfully loaded image URLs. */
const LOADED_IMAGE_URLS = getStoredLoadedUrls();

/** Synchronous in-memory map of original URL -> data: or blob: URL (pre-seeded from localStorage). */
const RESOLVED_IMAGE_URLS = getStoredDataUrls();

/** Track in-flight caching operations so we don't duplicate fetches for the same URL. */
const IN_FLIGHT_CACHE_OPS = new Map<string, Promise<string | null>>();

function saveL1DataUrl(url: string, dataUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    RESOLVED_IMAGE_URLS.delete(url);
    RESOLVED_IMAGE_URLS.set(url, dataUrl);

    const dataEntries = Array.from(RESOLVED_IMAGE_URLS.entries()).filter(
      ([, val]) => val.startsWith('data:'),
    );
    const trimmed = dataEntries.slice(-MAX_L1_ENTRIES);
    localStorage.setItem(
      IMAGE_DATA_URL_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(trimmed)),
    );
  } catch {
    // Ignore quota errors
  }
}

function openImageIdb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getBlobFromIdb(url: string): Promise<Blob | null> {
  const db = await openImageIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(url);
      req.onsuccess = () => {
        resolve(req.result instanceof Blob ? req.result : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function putBlobInIdb(url: string, blob: Blob): Promise<void> {
  const db = await openImageIdb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(blob, url);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string | null> {
  if (typeof FileReader === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function resolveFromLocalCaches(url: string): Promise<string | null> {
  const mem = RESOLVED_IMAGE_URLS.get(url);
  if (mem) return mem;

  // 1. Check IndexedDB blob store
  const idbBlob = await getBlobFromIdb(url);
  if (idbBlob && idbBlob.size > 0) {
    if (idbBlob.size <= MAX_INLINE_DATA_URL_BYTES) {
      const dataUrl = await blobToDataUrl(idbBlob);
      if (dataUrl) {
        saveL1DataUrl(url, dataUrl);
        return dataUrl;
      }
    }
    const objUrl = URL.createObjectURL(idbBlob);
    RESOLVED_IMAGE_URLS.set(url, objUrl);
    return objUrl;
  }

  // 2. Check CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_STORAGE_NAME);
      const match = await cache.match(url, { ignoreVary: true });
      if (match && match.ok) {
        const blob = await match.blob();
        if (blob.size > 0) {
          void putBlobInIdb(url, blob);
          if (blob.size <= MAX_INLINE_DATA_URL_BYTES) {
            const dataUrl = await blobToDataUrl(blob);
            if (dataUrl) {
              saveL1DataUrl(url, dataUrl);
              return dataUrl;
            }
          }
          const objUrl = URL.createObjectURL(blob);
          RESOLVED_IMAGE_URLS.set(url, objUrl);
          return objUrl;
        }
      }
    } catch {
      // Ignore CacheStorage errors
    }
  }

  return null;
}

export function persistLoadedUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(null);
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return Promise.resolve(url);
  }

  try {
    LOADED_IMAGE_URLS.add(url);
    const urls = Array.from(LOADED_IMAGE_URLS).slice(-300);
    localStorage.setItem(IMAGE_CACHE_STORAGE_KEY, JSON.stringify(urls));
  } catch {
    /* ignore */
  }

  const existingMem = RESOLVED_IMAGE_URLS.get(url);
  if (existingMem) return Promise.resolve(existingMem);

  const inFlight = IN_FLIGHT_CACHE_OPS.get(url);
  if (inFlight) return inFlight;

  const task = (async (): Promise<string | null> => {
    try {
      const fromCache = await resolveFromLocalCaches(url);
      if (fromCache) return fromCache;

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return null;
      }

      // Try CORS fetch first to capture readable Blob for IndexedDB + DataURL
      try {
        const res = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
        });
        if (res.ok) {
          if ('caches' in window) {
            void caches
              .open(CACHE_STORAGE_NAME)
              .then((c) => c.put(url, res.clone()))
              .catch(() => {});
          }
          const blob = await res.blob();
          if (blob.size > 0) {
            void putBlobInIdb(url, blob);
            if (blob.size <= MAX_INLINE_DATA_URL_BYTES) {
              const dataUrl = await blobToDataUrl(blob);
              if (dataUrl) {
                saveL1DataUrl(url, dataUrl);
                return dataUrl;
              }
            }
            const objUrl = URL.createObjectURL(blob);
            RESOLVED_IMAGE_URLS.set(url, objUrl);
            return objUrl;
          }
        }
      } catch {
        // Do not store opaque (mode: 'no-cors', status: 0) responses in CacheStorage:
        // Chromium pads every opaque CacheStorage entry by ~7 MB toward origin storage quota.
      }
    } catch {
      /* ignore */
    } finally {
      IN_FLIGHT_CACHE_OPS.delete(url);
    }
    return null;
  })();

  IN_FLIGHT_CACHE_OPS.set(url, task);
  return task;
}

export async function clearFallbackImageCaches(): Promise<void> {
  for (const val of RESOLVED_IMAGE_URLS.values()) {
    if (val.startsWith('blob:') && typeof URL !== 'undefined') {
      try {
        URL.revokeObjectURL(val);
      } catch {
        /* ignore */
      }
    }
  }
  LOADED_IMAGE_URLS.clear();
  RESOLVED_IMAGE_URLS.clear();
  IN_FLIGHT_CACHE_OPS.clear();
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(IMAGE_CACHE_STORAGE_KEY);
    localStorage.removeItem(IMAGE_DATA_URL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const db = await openImageIdb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

// Pre-warm core built-in token & domain icons so they are available offline immediately
if (typeof window !== 'undefined') {
  const prewarmCoreAssets = () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const coreAssets = [
      assetUrl('gram.svg'),
      assetUrl('ton.png'),
      assetUrl('fi.svg'),
      assetUrl('bro-domain-nft.svg'),
      assetUrl('favicon.svg'),
    ];
    for (const url of coreAssets) {
      if (!RESOLVED_IMAGE_URLS.has(url)) {
        void persistLoadedUrl(url);
      }
    }
  };
  if (document.readyState === 'complete') {
    setTimeout(prewarmCoreAssets, 500);
  } else {
    window.addEventListener(
      'load',
      () => {
        setTimeout(prewarmCoreAssets, 500);
      },
      { once: true },
    );
  }
}

const toList = (src: string | string[] | undefined): string[] =>
  (Array.isArray(src) ? src : src ? [src] : []).filter((url): url is string =>
    Boolean(url),
  );

interface ImageLoadState {
  status: ImageStatus;
  resolvedSrc: string | undefined;
}

const getInitialImageState = (src: string | undefined): ImageLoadState => {
  if (!src) return { status: 'idle', resolvedSrc: undefined };
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return { status: 'loaded', resolvedSrc: src };
  }
  const cachedResolved = RESOLVED_IMAGE_URLS.get(src);
  if (cachedResolved) {
    return { status: 'loaded', resolvedSrc: cachedResolved };
  }
  const isOnlineNow =
    typeof navigator === 'undefined' || navigator.onLine !== false;
  if (LOADED_IMAGE_URLS.has(src) && isOnlineNow) {
    return { status: 'loaded', resolvedSrc: src };
  }
  return { status: 'loading', resolvedSrc: src };
};

const useImageStatus = (src: string | undefined): ImageLoadState => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [state, setState] = useState<ImageLoadState>(() =>
    getInitialImageState(src),
  );

  if (prevSrc !== src) {
    setPrevSrc(src);
    setState(getInitialImageState(src));
  }

  useEffect(() => {
    if (!src) return;
    if (src.startsWith('data:') || src.startsWith('blob:')) return;

    const cachedMem = RESOLVED_IMAGE_URLS.get(src);
    if (cachedMem) {
      queueMicrotask(() =>
        setState({ status: 'loaded', resolvedSrc: cachedMem }),
      );
      return;
    }

    let cancelled = false;

    void (async () => {
      // 1. Check local IndexedDB / CacheStorage first
      const cachedUrl = await resolveFromLocalCaches(src);
      if (cancelled) return;
      if (cachedUrl) {
        setState({ status: 'loaded', resolvedSrc: cachedUrl });
        return;
      }

      // 2. If offline and not in local caches, fail fast so next candidate or fallback renders
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setState({ status: 'error', resolvedSrc: undefined });
        return;
      }

      // 3. Load from network and persist in offline cache
      const image = new window.Image();
      image.src = src;

      if (image.complete && image.naturalWidth > 0) {
        const persisted = await persistLoadedUrl(src);
        if (!cancelled) {
          setState({ status: 'loaded', resolvedSrc: persisted || src });
        }
        return;
      }

      const onLoad = () => {
        if (cancelled) return;
        void persistLoadedUrl(src).then((persisted) => {
          if (!cancelled) {
            setState({ status: 'loaded', resolvedSrc: persisted || src });
          }
        });
      };
      const onError = () => {
        if (cancelled) return;
        setState({ status: 'error', resolvedSrc: undefined });
      };
      image.addEventListener('load', onLoad, { once: true });
      image.addEventListener('error', onError, { once: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return state;
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
 * falling back to the next on error (404 / 403 / CSP / network). Automatically
 * caches downloaded images in browser IndexedDB + CacheStorage + L1 DataURL storage
 * so token and NFT assets render reliably when opening the app offline.
 */
export const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  fallback = null,
  alt = '',
  onError: userOnError,
  ...props
}) => {
  const sources = toList(src);
  const key = sources.join(' ');

  const [prevKey, setPrevKey] = useState(key);
  const [index, setIndex] = useState(0);
  const [lastHandledErrorIndex, setLastHandledErrorIndex] = useState(-1);
  const [imgElementError, setImgElementError] = useState(false);

  if (prevKey !== key) {
    setPrevKey(key);
    setIndex(0);
    setLastHandledErrorIndex(-1);
    setImgElementError(false);
  }

  const current = sources[index];
  const { status, resolvedSrc } = useImageStatus(current);

  const effectiveStatus = imgElementError ? 'error' : status;

  if (
    effectiveStatus === 'error' &&
    index < sources.length - 1 &&
    lastHandledErrorIndex !== index
  ) {
    setLastHandledErrorIndex(index);
    setImgElementError(false);
    setIndex(index + 1);
  }

  if (effectiveStatus === 'loaded' && (resolvedSrc || current)) {
    return (
      <img
        src={resolvedSrc || current}
        alt={alt}
        onError={(e) => {
          setImgElementError(true);
          userOnError?.(e);
        }}
        {...props}
      />
    );
  }
  return <>{fallback}</>;
};
