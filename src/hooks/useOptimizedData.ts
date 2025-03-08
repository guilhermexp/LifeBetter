import { useCallback, useEffect, useRef, useState } from 'react';

interface DataCache<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  timestamp: number;
  expiresAt: number;
  controller: AbortController | null;
}

interface UseOptimizedDataOptions<T> {
  /** Key for caching */
  cacheKey: string;
  /** Function to fetch data */
  fetchFn: () => Promise<T>;
  /** Cache expiration time in ms */
  expiresIn?: number;
  /** Whether to enable caching */
  caching?: boolean;
  /** Whether to return stale data while revalidating */
  staleWhileRevalidate?: boolean;
  /** Whether to revalidate on focus */
  revalidateOnFocus?: boolean;
  /** Whether to revalidate on reconnect */
  revalidateOnReconnect?: boolean;
  /** Whether to revalidate on mount */
  revalidateOnMount?: boolean;
  /** Whether to deduplicate requests */
  dedupingInterval?: number;
  /** Callback when data is loaded */
  onSuccess?: (data: T) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Whether to suspend while loading */
  suspense?: boolean;
  /** Whether to retry on error */
  retry?: boolean;
  /** Number of retries */
  retryCount?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
  /** Whether to use optimistic updates */
  optimistic?: boolean;
}

// Global cache for sharing data between hooks
const globalCache = new Map<string, DataCache<any>>();

// In-flight promises for deduplication
const inFlightPromises = new Map<string, Promise<any>>();

/**
 * Hook for optimized data loading
 * 
 * Features:
 * - Caching with expiration
 * - Stale-while-revalidate pattern
 * - Revalidation on focus and reconnect
 * - Deduplication of requests
 * - Suspense support
 * - Retry on error
 * - Optimistic updates
 */
export function useOptimizedData<T = any>({
  cacheKey,
  fetchFn,
  expiresIn = 5 * 60 * 1000, // 5 minutes
  caching = true,
  staleWhileRevalidate = true,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  revalidateOnMount = true,
  dedupingInterval = 2000, // 2 seconds
  onSuccess,
  onError,
  suspense = false,
  retry = true,
  retryCount = 3,
  retryDelay = 1000,
  optimistic = false,
}: UseOptimizedDataOptions<T>) {
  // State for the hook instance
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
    isValidating: boolean;
  }>(() => {
    // Initialize from cache if available
    const cachedData = globalCache.get(cacheKey);
    
    if (cachedData && (cachedData.expiresAt > Date.now() || staleWhileRevalidate)) {
      return {
        data: cachedData.data,
        error: cachedData.error,
        loading: false,
        isValidating: false,
      };
    }
    
    return {
      data: null,
      error: null,
      loading: true,
      isValidating: false,
    };
  });
  
  // Refs for tracking state between renders
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);
  
  // Promise for suspense
  const suspensePromiseRef = useRef<Promise<T> | null>(null);
  
  // Function to fetch data
  const fetchData = useCallback(async (config: { 
    skipCache?: boolean;
    dedupe?: boolean;
    retry?: boolean;
  } = {}) => {
    const { skipCache = false, dedupe = true, retry: shouldRetry = retry } = config;
    
    // Check if we have valid cached data
    const cachedData = globalCache.get(cacheKey);
    const now = Date.now();
    
    if (
      !skipCache &&
      caching &&
      cachedData &&
      cachedData.expiresAt > now
    ) {
      setState((prev) => ({
        ...prev,
        data: cachedData.data,
        error: null,
        loading: false,
        isValidating: false,
      }));
      
      return cachedData.data;
    }
    
    // Check for in-flight requests to deduplicate
    if (dedupe && dedupingInterval > 0) {
      const existingPromise = inFlightPromises.get(cacheKey);
      
      if (existingPromise) {
        const promiseTimestamp = globalCache.get(cacheKey)?.timestamp || 0;
        
        if (now - promiseTimestamp < dedupingInterval) {
          return existingPromise;
        }
      }
    }
    
    // Set loading state
    setState((prev) => ({
      ...prev,
      loading: prev.data === null,
      isValidating: true,
    }));
    
    // Create abort controller for the request
    const controller = new AbortController();
    
    // Create the fetch promise
    const fetchPromise = (async () => {
      try {
        // Fetch data
        const data = await fetchFn();
        
        if (unmountedRef.current) return null;
        
        // Update cache
        if (caching) {
          globalCache.set(cacheKey, {
            data,
            error: null,
            loading: false,
            timestamp: Date.now(),
            expiresAt: Date.now() + expiresIn,
            controller,
          });
        }
        
        // Update state
        setState((prev) => ({
          ...prev,
          data,
          error: null,
          loading: false,
          isValidating: false,
        }));
        
        // Call success callback
        if (onSuccess) {
          onSuccess(data);
        }
        
        // Reset retry count
        retryCountRef.current = 0;
        
        return data;
      } catch (error) {
        if (unmountedRef.current) return null;
        
        const typedError = error instanceof Error ? error : new Error(String(error));
        
        // Update cache with error
        if (caching) {
          globalCache.set(cacheKey, {
            ...globalCache.get(cacheKey) || {
              data: null,
              loading: false,
              timestamp: Date.now(),
              expiresAt: Date.now(),
              controller: null,
            },
            error: typedError,
            loading: false,
          });
        }
        
        // Update state
        setState((prev) => ({
          ...prev,
          error: typedError,
          loading: false,
          isValidating: false,
        }));
        
        // Call error callback
        if (onError) {
          onError(typedError);
        }
        
        // Retry if enabled
        if (shouldRetry && retryCountRef.current < retryCount) {
          retryCountRef.current += 1;
          
          if (retryTimeoutRef.current !== null) {
            window.clearTimeout(retryTimeoutRef.current);
          }
          
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!unmountedRef.current) {
              fetchData({ skipCache: true, dedupe: false });
            }
          }, retryDelay * retryCountRef.current);
        }
        
        throw typedError;
      } finally {
        // Remove in-flight promise
        if (inFlightPromises.get(cacheKey) === fetchPromise) {
          inFlightPromises.delete(cacheKey);
        }
      }
    })();
    
    // Store the promise for deduplication
    inFlightPromises.set(cacheKey, fetchPromise);
    
    // Store for suspense
    suspensePromiseRef.current = fetchPromise;
    
    return fetchPromise;
  }, [
    cacheKey,
    fetchFn,
    expiresIn,
    caching,
    retry,
    retryCount,
    retryDelay,
    onSuccess,
    onError,
    dedupingInterval,
  ]);
  
  // Function to manually invalidate cache
  const invalidateCache = useCallback(() => {
    globalCache.delete(cacheKey);
  }, [cacheKey]);
  
  // Function to manually refresh data
  const refresh = useCallback(() => {
    return fetchData({ skipCache: true });
  }, [fetchData]);
  
  // Function to update data optimistically
  const mutate = useCallback(
    (
      dataOrUpdater: T | ((currentData: T | null) => T),
      shouldRevalidate = true
    ) => {
      // Get current cache
      const cachedData = globalCache.get(cacheKey);
      
      // Calculate new data
      const newData =
        typeof dataOrUpdater === 'function'
          ? (dataOrUpdater as Function)(cachedData?.data || null)
          : dataOrUpdater;
      
      // Update cache
      if (caching) {
        globalCache.set(cacheKey, {
          ...cachedData || {
            error: null,
            loading: false,
            timestamp: Date.now(),
            expiresAt: Date.now() + expiresIn,
            controller: null,
          },
          data: newData,
        });
      }
      
      // Update state
      setState((prev) => ({
        ...prev,
        data: newData,
        error: null,
      }));
      
      // Revalidate if needed
      if (shouldRevalidate) {
        return fetchData({ skipCache: true });
      }
      
      return Promise.resolve(newData);
    },
    [cacheKey, expiresIn, caching, fetchData]
  );
  
  // Set up revalidation on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;
    
    const handleFocus = () => {
      fetchData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [revalidateOnFocus, fetchData]);
  
  // Set up revalidation on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;
    
    const handleOnline = () => {
      fetchData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [revalidateOnReconnect, fetchData]);
  
  // Fetch data on mount
  useEffect(() => {
    if (revalidateOnMount) {
      fetchData();
    }
    
    return () => {
      unmountedRef.current = true;
      
      // Clear any pending retries
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      
      // Abort any in-flight requests
      const cachedData = globalCache.get(cacheKey);
      
      if (cachedData?.controller) {
        cachedData.controller.abort();
      }
    };
  }, [cacheKey, revalidateOnMount, fetchData]);
  
  // Handle suspense
  if (suspense && state.loading && !state.data && !state.error) {
    if (!suspensePromiseRef.current) {
      suspensePromiseRef.current = fetchData();
    }
    
    throw suspensePromiseRef.current;
  }
  
  return {
    ...state,
    refresh,
    invalidateCache,
    mutate,
  };
}

// Utility functions for working with the cache
export const optimizedDataUtils = {
  // Clear the entire cache
  clearCache: () => {
    globalCache.clear();
    inFlightPromises.clear();
  },
  
  // Invalidate a specific cache entry
  invalidateCache: (cacheKey: string) => {
    globalCache.delete(cacheKey);
  },
  
  // Get a cache entry
  getCache: <T>(cacheKey: string): T | null => {
    return globalCache.get(cacheKey)?.data || null;
  },
  
  // Set a cache entry
  setCache: <T>(cacheKey: string, data: T, expiresIn = 5 * 60 * 1000) => {
    globalCache.set(cacheKey, {
      data,
      error: null,
      loading: false,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiresIn,
      controller: null,
    });
  },
  
  // Check if a cache entry exists
  hasCache: (cacheKey: string): boolean => {
    return globalCache.has(cacheKey);
  },
  
  // Get all cache keys
  getCacheKeys: (): string[] => {
    return Array.from(globalCache.keys());
  },
};
