import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Height of the container in pixels */
  height: number;
  /** Width of the container (default: 100%) */
  width?: string | number;
  /** Number of items to render above/below the visible area */
  overscan?: number;
  /** Class name for the container */
  className?: string;
  /** Whether to add a fade effect at the top/bottom */
  fadeEdges?: boolean;
  /** Callback when an item becomes visible */
  onItemVisible?: (index: number) => void;
}

/**
 * A virtualized list component for efficiently rendering large lists
 * 
 * Features:
 * - Only renders items that are visible in the viewport
 * - Smooth scrolling
 * - Customizable item rendering
 * - Optimized for performance
 */
function VirtualizedListComponent<T>({
  items,
  itemHeight,
  renderItem,
  height,
  width = '100%',
  overscan = 3,
  className = '',
  fadeEdges = false,
  onItemVisible,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  // Calculate which items should be visible
  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current) return;
    
    const currentScrollTop = containerRef.current.scrollTop;
    setScrollTop(currentScrollTop);
    
    // Calculate the range of visible items
    const startIndex = Math.max(0, Math.floor(currentScrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((currentScrollTop + height) / itemHeight) + overscan
    );
    
    // Create an array of visible indices
    const newVisibleIndices = [];
    for (let i = startIndex; i <= endIndex; i++) {
      newVisibleIndices.push(i);
    }
    
    setVisibleIndices(newVisibleIndices);
    
    // Notify when items become visible
    if (onItemVisible) {
      const visibleStartIndex = Math.floor(currentScrollTop / itemHeight);
      const visibleEndIndex = Math.ceil((currentScrollTop + height) / itemHeight);
      
      for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
        if (i >= 0 && i < items.length) {
          onItemVisible(i);
        }
      }
    }
  }, [height, itemHeight, items.length, onItemVisible, overscan]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    requestAnimationFrame(calculateVisibleItems);
  }, [calculateVisibleItems]);

  // Initialize and clean up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate initial visible items
    calculateVisibleItems();
    
    // Add scroll event listener
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleItems, handleScroll]);

  // Recalculate when items change
  useEffect(() => {
    calculateVisibleItems();
  }, [items, calculateVisibleItems]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto relative ${className}`}
      style={{ height, width }}
      data-testid="virtualized-list"
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: items.length * itemHeight }} />
      
      {/* Render only visible items */}
      {visibleIndices.map((index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: index * itemHeight,
            height: itemHeight,
            width: '100%',
          }}
          data-index={index}
        >
          {renderItem(items[index], index)}
        </div>
      ))}
      
      {/* Fade edges if enabled */}
      {fadeEdges && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
              opacity: scrollTop > 10 ? 1 : 0,
              transition: 'opacity 0.2s ease',
              zIndex: 1,
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{ 
              background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
              opacity: scrollTop < (items.length * itemHeight - height - 10) ? 1 : 0,
              transition: 'opacity 0.2s ease',
              zIndex: 1,
            }}
          />
        </>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;
