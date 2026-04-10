import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '@/lib/firebase';

export interface ZafProduct {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  enabled: boolean;
  sortOrder: number;
}

const FALLBACK_PRODUCTS: ZafProduct[] = [
  {
    id: '1',
    title: 'ZAF Product 1',
    description: 'Meditation support product for your daily practice.',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: '2',
    title: 'ZAF Product 2',
    description: 'Create a calm environment with selected sounds and scents.',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: '3',
    title: 'ZAF Product 3',
    description: 'Track and strengthen your mindfulness habit.',
    enabled: true,
    sortOrder: 3,
  },
  {
    id: '4',
    title: 'ZAF Product 4',
    description: 'Curated items for a deeper meditation experience.',
    enabled: true,
    sortOrder: 4,
  },
];

let productCache: ZafProduct[] | null = null;
let cacheUpdatedAtMs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;
const STORAGE_KEY = '@odza/zaf_products_cache_v1';
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

type StoredProductCache = {
  updatedAtMs: number;
  products: ZafProduct[];
};

export type ZafProductsLoadResult = {
  products: ZafProduct[];
  source: 'network' | 'cache' | 'fallback';
  stale: boolean;
};

let storageReadPromise: Promise<void> | null = null;

function normalizeProduct(
  id: string,
  data: { title?: string; description?: string; imageUrl?: string; enabled?: boolean; sortOrder?: number },
): ZafProduct | null {
  const title = (data.title ?? '').trim();
  const description = (data.description ?? '').trim();
  if (!title || !description) return null;
  return {
    id,
    title,
    description,
    imageUrl: data.imageUrl?.trim() || undefined,
    enabled: data.enabled !== false,
    sortOrder: Number.isFinite(data.sortOrder) ? Number(data.sortOrder) : Number.MAX_SAFE_INTEGER,
  };
}

function sanitizeProducts(products: ZafProduct[]): ZafProduct[] {
  return products
    .filter((p) => p.enabled)
    .sort((a, b) => (a.sortOrder === b.sortOrder ? a.title.localeCompare(b.title) : a.sortOrder - b.sortOrder));
}

async function readProductsFromStorageOnce(): Promise<void> {
  if (storageReadPromise) return storageReadPromise;
  storageReadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredProductCache;
      if (!parsed || !Array.isArray(parsed.products) || typeof parsed.updatedAtMs !== 'number') return;
      if (Date.now() - parsed.updatedAtMs > STORAGE_TTL_MS) return;
      const sanitized = sanitizeProducts(parsed.products);
      if (sanitized.length > 0) {
        productCache = sanitized;
        cacheUpdatedAtMs = parsed.updatedAtMs;
      }
    } catch {
      // Ignore storage parse/read errors and continue with network.
    }
  })();
  await storageReadPromise;
}

async function writeProductsToStorage(products: ZafProduct[]): Promise<void> {
  try {
    const payload: StoredProductCache = {
      updatedAtMs: Date.now(),
      products,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write errors.
  }
}

export async function getZafProducts(): Promise<ZafProduct[]> {
  const result = await getZafProductsWithStatus();
  return result.products;
}

export async function getZafProductsWithStatus(): Promise<ZafProductsLoadResult> {
  await readProductsFromStorageOnce();
  if (productCache && Date.now() - cacheUpdatedAtMs < CACHE_TTL_MS) {
    return { products: productCache, source: 'cache', stale: false };
  }
  try {
    const snapshot = await getDocs(collection(db, 'zaf_products'));
    const products = sanitizeProducts(
      snapshot.docs
      .map((d) => normalizeProduct(d.id, d.data() as any))
      .filter((p): p is ZafProduct => !!p),
    );
    if (products.length > 0) {
      productCache = products;
      cacheUpdatedAtMs = Date.now();
      await writeProductsToStorage(products);
      return { products, source: 'network', stale: false };
    }
    productCache = FALLBACK_PRODUCTS;
    cacheUpdatedAtMs = Date.now();
    await writeProductsToStorage(FALLBACK_PRODUCTS);
    return { products: FALLBACK_PRODUCTS, source: 'fallback', stale: false };
  } catch {
    if (productCache && productCache.length > 0) {
      return { products: productCache, source: 'cache', stale: true };
    }
    return { products: FALLBACK_PRODUCTS, source: 'fallback', stale: true };
  }
}

export async function getZafProductById(id: string): Promise<ZafProduct> {
  await readProductsFromStorageOnce();
  if (productCache) {
    const hit = productCache.find((p) => p.id === id);
    if (hit) return hit;
  }
  try {
    const snap = await getDoc(doc(db, 'zaf_products', id));
    if (snap.exists()) {
      const parsed = normalizeProduct(snap.id, snap.data() as any);
      if (parsed && parsed.enabled) return parsed;
    }
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback ?? FALLBACK_PRODUCTS[0];
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback ?? FALLBACK_PRODUCTS[0];
  }
}
