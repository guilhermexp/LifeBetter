import { useCallback, useEffect, useRef, useState } from 'react';

interface UseOptimizedRenderOptions {
  /** Whether to enable optimizations */
  enabled?: boolean;
  /** Delay in ms before rendering */
  delay?: number;
  /** Whether to use requestIdleCallback */
  useIdleCallback?: boolean;
  /** Priority of the render (1-5, 1 being highest) */
  priority?: 1 | 2 | 3 | 4 | 5;
  /** Callback when component is rendered */
  onRender?: () => void;
}

/**
 * Hook for optimizing component rendering
 * 
 * Features:
 * - Deferred rendering
 * - Priority-based rendering
 * - Idle time rendering
 * - Conditional rendering
 */
export function useOptimizedRender({
  enabled = true,
  delay = 0,
  useIdleCallback = true,
  priority = 3,
  onRender,
}: UseOptimizedRenderOptions = {}) {
  const [shouldRender, setShouldRender] = useState(!enabled || priority === 1);
  const timeoutRef = useRef<number | null>(null);
  const idleCallbackRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number>(Date.now());

  // Calculate actual delay based on priority
  const actualDelay = useCallback(() => {
    if (!enabled) return 0;
    
    // Base delay by priority
    const priorityDelay = {
      1: 0,      // Highest priority - render immediately
      2: 50,     // High priority - render quickly
      3: 100,    // Medium priority - standard delay
      4: 200,    // Low priority - longer delay
      5: 500,    // Lowest priority - significant delay
    }[priority];
    
    // Add user-specified delay
    return priorityDelay + delay;
  }, [enabled, delay, priority]);

  // Schedule rendering
  useEffect(() => {
    if (!enabled || shouldRender) return;
    
    const renderComponent = () => {
      setShouldRender(true);
      if (onRender) onRender();
    };
    
    const delay = actualDelay();
    
    // If using idle callback and it's available
    if (useIdleCallback && 'requestIdleCallback' in window) {
      // Clear any existing idle callback
      if (idleCallbackRef.current !== null) {
        cancelIdleCallback(idleCallbackRef.current);
      }
      
      // Schedule with idle callback
      idleCallbackRef.current = requestIdleCallback(
        (deadline) => {
          // If we have enough time or we've waited too long, render immediately
          if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
            renderComponent();
          } else {
            // Otherwise, use a regular timeout as fallback
            timeoutRef.current = window.setTimeout(renderComponent, delay);
          }
        },
        { timeout: delay + 500 } // Add a timeout to ensure it eventually runs
      );
    } else {
      // Use regular timeout if idle callback is not available or not requested
      timeoutRef.current = window.setTimeout(renderComponent, delay);
    }
    
    return () => {
      // Clean up any pending callbacks
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      
      if (idleCallbackRef.current !== null && 'cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackRef.current);
      }
    };
  }, [enabled, shouldRender, useIdleCallback, actualDelay, onRender]);

  // Track render time for performance monitoring
  useEffect(() => {
    if (shouldRender && enabled) {
      const renderTime = Date.now() - mountTimeRef.current;
      if (renderTime > 500) {
        console.warn(`Component rendered after ${renderTime}ms, which exceeds recommended threshold.`);
      }
    }
  }, [shouldRender, enabled]);

  // Force render if component has been deferred too long
  useEffect(() => {
    if (!enabled || shouldRender) return;
    
    const forceRenderTimeout = window.setTimeout(() => {
      if (!shouldRender) {
        console.warn('Forcing render after timeout');
        setShouldRender(true);
        if (onRender) onRender();
      }
    }, 2000); // Force render after 2 seconds max
    
    return () => {
      clearTimeout(forceRenderTimeout);
    };
  }, [enabled, shouldRender, onRender]);

  return shouldRender;
}

// Polyfill for requestIdleCallback and cancelIdleCallback
if (typeof window !== 'undefined') {
  if (!('requestIdleCallback' in window)) {
    (window as any).requestIdleCallback = function(cb: IdleRequestCallback) {
      const start = Date.now();
      return window.setTimeout(function() {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        } as IdleDeadline);
      }, 1);
    };
  }

  if (!('cancelIdleCallback' in window)) {
    (window as any).cancelIdleCallback = function(id: number) {
      clearTimeout(id);
    };
  }
}
