import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Cache expiration time in milliseconds */
  expiresIn?: number;
  /** Whether to return stale data while fetching */
  staleWhileRevalidate?: boolean;
  /** Key to use for caching */
  cacheKey?: string;
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  expiresIn: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
};

// In-memory cache
const globalCache: Record<string, CacheItem<any>> = {};

/**
 * Custom hook for caching Supabase queries
 * 
 * Features:
 * - In-memory caching with expiration
 * - Stale-while-revalidate pattern
 * - Automatic cache invalidation
 * - Type-safe
 */
export function useSupabaseCache<T>(
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Merge default options with provided options
  const { expiresIn, staleWhileRevalidate, cacheKey } = {
    ...DEFAULT_CACHE_OPTIONS,
    ...options,
  };

  // Generate a cache key if not provided
  const effectiveCacheKey = cacheKey || fetchFn.toString();

  // Function to fetch data and update cache
  const fetchData = useCallback(async (skipCache = false) => {
    // Check if we have cached data
    const cachedItem = globalCache[effectiveCacheKey];
    const now = Date.now();
    
    // If we have valid cached data and we're not skipping cache, use it
    if (!skipCache && cachedItem && cachedItem.expiresAt > now) {
      setData(cachedItem.data);
      return;
    }
    
    // If we have stale data and staleWhileRevalidate is true, use it while fetching
    if (!skipCache && staleWhileRevalidate && cachedItem) {
      setData(cachedItem.data);
    }
    
    // Start loading
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Update cache
      if (isMounted.current) {
        globalCache[effectiveCacheKey] = {
          data: freshData,
          timestamp: now,
          expiresAt: now + (expiresIn || 0),
        };
        
        // Update state
        setData(freshData);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [effectiveCacheKey, expiresIn, fetchFn, staleWhileRevalidate]);

  // Function to manually invalidate cache
  const invalidateCache = useCallback(() => {
    delete globalCache[effectiveCacheKey];
  }, [effectiveCacheKey]);

  // Function to manually refresh data
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidateCache,
  };
}

/**
 * Manually invalidate a cache entry
 */
export function invalidateCache(cacheKey: string): void {
  delete globalCache[cacheKey];
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  Object.keys(globalCache).forEach((key) => {
    delete globalCache[key];
  });
}
