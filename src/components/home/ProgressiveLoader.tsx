import React, { useEffect, useState, useRef, memo } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface ProgressiveLoaderProps {
  /** Children to render */
  children: React.ReactNode[];
  /** Delay between rendering each child in ms */
  delay?: number;
  /** Whether to show loading indicators */
  showLoading?: boolean;
  /** Whether to use a fade-in effect */
  fadeIn?: boolean;
  /** Whether to use a staggered loading effect */
  staggered?: boolean;
  /** Priority order for loading (array of indices) */
  priorityOrder?: number[];
  /** Callback when all children are loaded */
  onComplete?: () => void;
}

/**
 * Component for progressive loading of content
 * 
 * Features:
 * - Loads children progressively to improve perceived performance
 * - Prioritizes critical content
 * - Shows loading indicators
 * - Supports fade-in and staggered effects
 */
const ProgressiveLoaderComponent: React.FC<ProgressiveLoaderProps> = ({
  children,
  delay = 100,
  showLoading = true,
  fadeIn = true,
  staggered = true,
  priorityOrder,
  onComplete,
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const childrenArray = React.Children.toArray(children);
  
  // Determine the order in which to load children
  const loadingOrder = priorityOrder || Array.from({ length: childrenArray.length }, (_, i) => i);
  
  // Load children progressively
  useEffect(() => {
    // Skip if all children are already loaded
    if (loadedCount >= childrenArray.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    // Calculate delay based on whether we're using staggered loading
    const effectiveDelay = staggered
      ? delay * (loadedCount === 0 ? 1 : Math.log(loadedCount + 1) * 0.5)
      : delay;
    
    // Set timeout to load next child
    timeoutRef.current = setTimeout(() => {
      const nextIndex = loadingOrder[loadedCount];
      
      setVisibleIndices((prev) => [...prev, nextIndex]);
      setLoadedCount((prev) => prev + 1);
    }, effectiveDelay);
    
    // Clean up timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadedCount, childrenArray.length, delay, staggered, loadingOrder, onComplete]);
  
  // Log performance metrics
  useEffect(() => {
    return () => {
      const totalTime = Date.now() - mountTimeRef.current;
      console.log(`ProgressiveLoader rendered ${childrenArray.length} children in ${totalTime}ms`);
    };
  }, [childrenArray.length]);
  
  // Render children progressively
  return (
    <>
      {childrenArray.map((child, index) => {
        const isVisible = visibleIndices.includes(index);
        
        if (!isVisible) {
          // Show loading indicator if enabled
          if (showLoading) {
            return (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse bg-muted rounded-md w-full h-24 mb-4"
                aria-hidden="true"
              >
                {index === loadingOrder[loadedCount] && (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
            );
          }
          
          // Otherwise, render nothing
          return null;
        }
        
        // Render child with fade-in effect if enabled
        return (
          <div
            key={`content-${index}`}
            className={fadeIn ? 'animate-fade-in' : ''}
            style={{
              animationDelay: fadeIn ? `${index * 50}ms` : '0ms',
            }}
          >
            {child}
          </div>
        );
      })}
      
      {/* Show loading progress if not all children are loaded */}
      {loadedCount < childrenArray.length && showLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground mr-2">
            Carregando {loadedCount}/{childrenArray.length}
          </div>
          <Spinner size="sm" />
        </div>
      )}
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ProgressiveLoader = memo(ProgressiveLoaderComponent);
