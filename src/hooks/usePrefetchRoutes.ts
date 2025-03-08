import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PrefetchOptions {
  /** Whether to enable prefetching */
  enabled?: boolean;
  /** Routes to prefetch */
  routes?: string[];
  /** Delay before prefetching in ms */
  delay?: number;
  /** Whether to prefetch on hover */
  prefetchOnHover?: boolean;
  /** Whether to prefetch on focus */
  prefetchOnFocus?: boolean;
  /** Whether to prefetch on mount */
  prefetchOnMount?: boolean;
  /** Callback when a route is prefetched */
  onPrefetch?: (route: string) => void;
}

/**
 * Hook for prefetching routes
 * 
 * Features:
 * - Prefetch routes on hover, focus, or mount
 * - Configurable delay and routes
 * - Optimized to prevent duplicate prefetching
 */
export function usePrefetchRoutes({
  enabled = true,
  routes = [],
  delay = 100,
  prefetchOnHover = true,
  prefetchOnFocus = true,
  prefetchOnMount = false,
  onPrefetch,
}: PrefetchOptions = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefetchedRoutes = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<number | null>(null);

  // Function to prefetch a specific route
  const prefetchRoute = useCallback(async (route: string) => {
    // Skip if already prefetched or current route
    if (prefetchedRoutes.current.has(route) || location.pathname === route) {
      return;
    }

    try {
      // Mark as prefetched to prevent duplicate prefetching
      prefetchedRoutes.current.add(route);
      
      // Get the route component
      const routeModule = await import(`../pages${route === '/' ? '/Index' : route}.tsx`);
      
      // Notify about prefetch
      if (onPrefetch) {
        onPrefetch(route);
      }
      
      if (import.meta.env.DEV) {
        console.log(`Prefetched route: ${route}`);
      }
      
      return routeModule;
    } catch (error) {
      console.error(`Error prefetching route: ${route}`, error);
    }
  }, [location.pathname, onPrefetch]);

  // Function to prefetch all specified routes
  const prefetchRoutes = useCallback(() => {
    if (!enabled || routes.length === 0) return;
    
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a delay to avoid unnecessary prefetching
    timeoutRef.current = window.setTimeout(() => {
      // Use requestIdleCallback if available
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          routes.forEach(prefetchRoute);
        });
      } else {
        // Fallback to setTimeout
        routes.forEach(prefetchRoute);
      }
    }, delay);
  }, [enabled, routes, delay, prefetchRoute]);

  // Set up event listeners for prefetching
  useEffect(() => {
    if (!enabled) return;
    
    // Prefetch on mount if enabled
    if (prefetchOnMount) {
      prefetchRoutes();
    }
    
    // Set up event listeners for prefetching on hover or focus
    if (prefetchOnHover || prefetchOnFocus) {
      const handlePrefetch = (event: MouseEvent | FocusEvent) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        
        if (anchor) {
          const href = anchor.getAttribute('href');
          
          if (href && href.startsWith('/')) {
            // Check if the route is in the list of routes to prefetch
            const shouldPrefetch = routes.length === 0 || routes.includes(href);
            
            if (shouldPrefetch) {
              prefetchRoute(href);
            }
          }
        }
      };
      
      // Add event listeners
      if (prefetchOnHover) {
        document.addEventListener('mouseover', handlePrefetch);
      }
      
      if (prefetchOnFocus) {
        document.addEventListener('focusin', handlePrefetch);
      }
      
      // Clean up event listeners
      return () => {
        if (prefetchOnHover) {
          document.removeEventListener('mouseover', handlePrefetch);
        }
        
        if (prefetchOnFocus) {
          document.removeEventListener('focusin', handlePrefetch);
        }
        
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [enabled, prefetchOnHover, prefetchOnFocus, prefetchOnMount, prefetchRoutes, prefetchRoute, routes]);

  // Function to navigate to a route with prefetching
  const navigateWithPrefetch = useCallback((to: string) => {
    // Prefetch the route before navigating
    prefetchRoute(to).then(() => {
      navigate(to);
    });
  }, [navigate, prefetchRoute]);

  return {
    prefetchRoute,
    prefetchRoutes,
    navigateWithPrefetch,
    prefetchedRoutes: Array.from(prefetchedRoutes.current),
  };
}
