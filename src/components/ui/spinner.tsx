import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom class name */
  className?: string;
  /** Color of the spinner */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
}

/**
 * Spinner component for loading states
 * 
 * Features:
 * - Multiple sizes
 * - Color variants
 * - Customizable with className
 * - Accessible with aria attributes
 */
export const Spinner = ({
  size = 'md',
  className,
  variant = 'primary',
}: SpinnerProps) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  // Variant mappings
  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    primary: 'border-gray-300 border-t-primary',
    secondary: 'border-gray-300 border-t-secondary',
    ghost: 'border-gray-200 border-t-gray-400',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
