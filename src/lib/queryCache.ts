/**
 * Simple in-memory cache for Supabase query results.
 * Survives route switches (module-level state), clears on page reload.
 * Uses stale-while-revalidate: returns cached data immediately,
 * then refreshes in background.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

// Default: consider data fresh for 60 seconds
const DEFAULT_STALE_MS = 60_000

export function getCached<T>(key: string, staleMs = DEFAULT_STALE_MS): { data: T; fresh: boolean } | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  const age = Date.now() - entry.timestamp
  return { data: entry.data, fresh: age < staleMs }
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
