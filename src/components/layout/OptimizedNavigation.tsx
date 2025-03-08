import React, { memo, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { OptimizedLink } from '@/components/common/OptimizedLink';
import { cn } from '@/lib/utils';
import { useOptimizedRender } from '@/hooks/useOptimizedRender';
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes';

interface NavigationItem {
  /** Path to navigate to */
  path: string;
  /** Label to display */
  label: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is external */
  external?: boolean;
  /** Badge to display */
  badge?: string | number;
  /** Whether to prefetch the route */
  prefetch?: boolean;
}

interface OptimizedNavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** CSS class name */
  className?: string;
  /** Whether to render as vertical navigation */
  vertical?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Whether to use compact mode */
  compact?: boolean;
  /** Whether to use mobile mode */
  mobile?: boolean;
  /** Whether to prefetch all routes on mount */
  prefetchAll?: boolean;
  /** Render priority (1-5, 1 being highest) */
  priority?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Optimized navigation component
 * 
 * Features:
 * - Route prefetching
 * - Optimized rendering
 * - Active state tracking
 * - Responsive design
 * - Accessibility support
 */
const OptimizedNavigationComponent = ({
  items,
  className = '',
  vertical = false,
  showLabels = true,
  showIcons = true,
  showBadges = true,
  compact = false,
  mobile = false,
  prefetchAll = true,
  priority = 1,
}: OptimizedNavigationProps) => {
  const location = useLocation();
  const shouldRender = useOptimizedRender({ priority });
  
  // Prefetch all routes
  const { prefetchRoutes } = usePrefetchRoutes({
    enabled: prefetchAll,
    routes: useMemo(() => items.map(item => item.path), [items]),
    prefetchOnMount: true,
  });
  
  // Determine if an item is active
  const isActive = useCallback(
    (path: string) => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );
  
  // Don't render until optimized render hook allows it
  if (!shouldRender) {
    return null;
  }
  
  return (
    <nav
      className={cn(
        'flex',
        vertical ? 'flex-col' : 'flex-row',
        compact ? 'gap-1' : 'gap-2',
        mobile ? 'overflow-x-auto hide-scrollbar' : '',
        className
      )}
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <OptimizedLink
          key={item.path}
          to={item.path}
          prefetch={item.prefetch !== false}
          disabled={item.disabled}
          external={item.external}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive(item.path)
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground',
            compact ? 'text-sm' : 'text-base',
            vertical ? 'justify-start w-full' : 'justify-center',
            !showLabels && showIcons ? 'p-2' : '',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          {showIcons && item.icon && (
            <span className={cn('flex-shrink-0', compact ? 'text-lg' : 'text-xl')}>
              {item.icon}
            </span>
          )}
          
          {showLabels && (
            <span
              className={cn(
                'transition-opacity',
                compact ? 'text-xs' : 'text-sm',
                !showIcons && 'font-medium'
              )}
            >
              {item.label}
            </span>
          )}
          
          {showBadges && item.badge && (
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground',
                compact ? 'w-4 h-4 text-xs' : 'w-5 h-5 text-xs'
              )}
            >
              {item.badge}
            </span>
          )}
        </OptimizedLink>
      ))}
    </nav>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OptimizedNavigation = memo(OptimizedNavigationComponent);
