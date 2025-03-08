import React, { forwardRef, memo, useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes';
import { cn } from '@/lib/utils';

interface OptimizedLinkProps extends Omit<LinkProps, 'to'> {
  /** Route to navigate to */
  to: string;
  /** Whether to prefetch the route */
  prefetch?: boolean;
  /** Delay before prefetching in ms */
  prefetchDelay?: number;
  /** Whether to show a loading indicator */
  showLoading?: boolean;
  /** Whether to disable the link */
  disabled?: boolean;
  /** Whether to open in a new tab */
  external?: boolean;
  /** Whether to use a button instead of a link */
  asButton?: boolean;
  /** CSS class name */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

/**
 * Optimized link component with prefetching
 * 
 * Features:
 * - Route prefetching on hover and focus
 * - Loading indicator
 * - External link support
 * - Button mode
 */
const OptimizedLinkComponent = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  (
    {
      to,
      prefetch = true,
      prefetchDelay = 100,
      showLoading = false,
      disabled = false,
      external = false,
      asButton = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const { prefetchRoute, navigateWithPrefetch } = usePrefetchRoutes({
      enabled: prefetch && !disabled,
      delay: prefetchDelay,
    });

    // Handle click with prefetching
    const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Skip if disabled or external
      if (disabled) {
        e.preventDefault();
        return;
      }

      // Handle external links
      if (external) {
        return;
      }

      // Skip if modifier keys are pressed (e.g., Ctrl+Click to open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      e.preventDefault();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        // Navigate with prefetching
        await navigateWithPrefetch(to);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    // Handle hover with prefetching
    const handleHover = () => {
      if (prefetch && !disabled && !external) {
        prefetchRoute(to);
      }
    };

    // External link
    if (external) {
      return (
        <a
          ref={ref}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            asButton && 'inline-flex items-center justify-center rounded-md text-sm font-medium',
            className
          )}
          onClick={disabled ? (e) => e.preventDefault() : undefined}
          {...props}
        >
          {children}
          {/* External link icon */}
          <svg
            className="ml-1 h-4 w-4 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      );
    }

    // Internal link
    return (
      <Link
        ref={ref}
        to={to}
        className={cn(
          'transition-colors relative',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          asButton && 'inline-flex items-center justify-center rounded-md text-sm font-medium',
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onFocus={handleHover}
        aria-disabled={disabled}
        {...props}
      >
        {children}
        {/* Loading indicator */}
        {isLoading && showLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/80">
            <svg
              className="animate-spin h-4 w-4 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
      </Link>
    );
  }
);

OptimizedLinkComponent.displayName = 'OptimizedLink';

// Memoize the component to prevent unnecessary re-renders
export const OptimizedLink = memo(OptimizedLinkComponent);
