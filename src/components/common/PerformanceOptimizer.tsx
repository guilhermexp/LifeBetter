import { memo, useEffect, useRef } from 'react';

interface PerformanceOptimizerProps {
  /** Whether to enable performance optimizations */
  enabled?: boolean;
  /** Whether to log performance metrics to console */
  debug?: boolean;
  /** Callback when metrics are collected */
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceMetrics {
  /** First Contentful Paint in ms */
  fcp: number | null;
  /** Largest Contentful Paint in ms */
  lcp: number | null;
  /** First Input Delay in ms */
  fid: number | null;
  /** Cumulative Layout Shift score */
  cls: number | null;
  /** Time to Interactive in ms */
  tti: number | null;
  /** Total Blocking Time in ms */
  tbt: number | null;
}

/**
 * Component for optimizing and monitoring performance
 * 
 * Features:
 * - Monitors Core Web Vitals
 * - Applies performance optimizations
 * - Reports metrics for analysis
 */
const PerformanceOptimizerComponent = ({
  enabled = true,
  debug = false,
  onMetrics,
}: PerformanceOptimizerProps) => {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    tbt: null,
  });

  // Apply performance optimizations
  useEffect(() => {
    if (!enabled) return;

    // Optimize rendering
    const optimizeRendering = () => {
      // Disable non-critical animations during initial load
      document.documentElement.classList.add('optimize-animations');
      
      // Re-enable animations after initial load
      setTimeout(() => {
        document.documentElement.classList.remove('optimize-animations');
      }, 2000);
      
      // Defer non-critical operations
      setTimeout(() => {
        // Preconnect to origins
        const origins = [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ];
        
        origins.forEach(origin => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = origin;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
        
        // Preload critical assets
        const criticalAssets = [
          '/favicon.ico',
        ];
        
        criticalAssets.forEach(asset => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = asset;
          link.as = 'image';
          document.head.appendChild(link);
        });
      }, 1000);
    };
    
    optimizeRendering();
    
    // Apply requestIdleCallback polyfill
    if (!('requestIdleCallback' in window)) {
      (window as any).requestIdleCallback = (callback: Function) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        }, 1);
      };
      
      (window as any).cancelIdleCallback = (id: number) => {
        clearTimeout(id);
      };
    }
    
    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    };
    
    // Run image optimization when idle
    (window as any).requestIdleCallback(() => {
      optimizeImages();
    });
    
    // Optimize font loading
    document.documentElement.classList.add('optimize-fonts');
  }, [enabled]);

  // Monitor performance metrics
  useEffect(() => {
    if (!enabled) return;
    
    // First Contentful Paint
    const observePaint = () => {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.fcp = entry.startTime;
            if (debug) console.log('FCP:', entry.startTime);
          }
        }
      });
      
      observer.observe({ type: 'paint', buffered: true });
      return observer;
    };
    
    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
        if (debug) console.log('LCP:', lastEntry.startTime);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      return observer;
    };
    
    // First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          metricsRef.current.fid = entry.processingStart - entry.startTime;
          if (debug) console.log('FID:', metricsRef.current.fid);
        }
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      return observer;
    };
    
    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      let clsEntries: any[] = [];
      
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = clsEntries.length === 0;
            const timestampDelta = firstSessionEntry ? 0 : (entry as any).startTime - clsEntries[clsEntries.length - 1].startTime;
            
            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds have passed since the first entry,
            // include the entry in the current session. Otherwise, start a new session.
            if (firstSessionEntry || timestampDelta < 1000 && (entry as any).startTime - clsEntries[0].startTime < 5000) {
              clsEntries.push(entry);
            } else {
              clsEntries = [entry];
            }
            
            // Calculate CLS value for the current session
            let sessionValue = 0;
            clsEntries.forEach(entry => {
              sessionValue += (entry as any).value;
            });
            
            // Update CLS with the maximum session value
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              metricsRef.current.cls = clsValue;
              if (debug) console.log('CLS:', clsValue);
            }
          }
        }
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      return observer;
    };
    
    // Report metrics
    const reportMetrics = () => {
      if (onMetrics) {
        onMetrics(metricsRef.current);
      }
      
      if (debug) {
        console.log('Performance Metrics:', metricsRef.current);
      }
    };
    
    // Initialize observers
    const observers: PerformanceObserver[] = [];
    
    try {
      if ('PerformanceObserver' in window) {
        observers.push(observePaint());
        observers.push(observeLCP());
        observers.push(observeFID());
        observers.push(observeCLS());
      }
    } catch (e) {
      console.error('Error setting up performance observers:', e);
    }
    
    // Report metrics when page is fully loaded
    window.addEventListener('load', () => {
      // Use requestIdleCallback to avoid blocking the main thread
      (window as any).requestIdleCallback(() => {
        reportMetrics();
      });
    });
    
    // Report metrics before unload
    window.addEventListener('beforeunload', reportMetrics);
    
    // Cleanup
    return () => {
      observers.forEach(observer => observer.disconnect());
      window.removeEventListener('beforeunload', reportMetrics);
    };
  }, [enabled, debug, onMetrics]);

  // This component doesn't render anything
  return null;
};

// Memoize the component to prevent unnecessary re-renders
export const PerformanceOptimizer = memo(PerformanceOptimizerComponent);
