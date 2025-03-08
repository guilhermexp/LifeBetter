import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  /** CSS class name */
  className?: string;
  /** Whether to show a pulse animation */
  pulse?: boolean;
  /** Whether to show a shimmer animation */
  shimmer?: boolean;
  /** Whether to use a gradient background */
  gradient?: boolean;
  /** Whether to use a rounded shape */
  rounded?: boolean;
  /** Whether to use a circle shape */
  circle?: boolean;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
}

/**
 * Base skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = memo(({
  className,
  pulse = true,
  shimmer = false,
  gradient = false,
  rounded = true,
  circle = false,
  width,
  height,
}) => {
  return (
    <div
      className={cn(
        'bg-muted relative overflow-hidden',
        pulse && 'animate-pulse',
        shimmer && 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        gradient && 'bg-gradient-to-r from-muted to-muted/80',
        rounded && 'rounded-md',
        circle && 'rounded-full',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton for a card component
 */
export const CardSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-[125px] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Skeleton for a task item
 */
export const TaskSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('flex items-center space-x-4 p-2', className)}>
      <Skeleton circle width={20} height={20} />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-3 w-[40%]" />
      </div>
      <Skeleton width={40} height={20} />
    </div>
  );
});

TaskSkeleton.displayName = 'TaskSkeleton';

/**
 * Skeleton for a productivity summary
 */
export const ProductivitySummarySkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-5 w-[60%] mb-4" />
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2 p-3 border rounded-md">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-6 w-[40%]" />
        </div>
        <div className="space-y-2 p-3 border rounded-md">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-6 w-[40%]" />
        </div>
        <div className="space-y-2 p-3 border rounded-md">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-6 w-[40%]" />
        </div>
      </div>
    </div>
  );
});

ProductivitySummarySkeleton.displayName = 'ProductivitySummarySkeleton';

/**
 * Skeleton for an area card
 */
export const AreaCardSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('space-y-2 p-4 border rounded-md', className)}>
      <div className="flex items-center space-x-3">
        <Skeleton circle width={32} height={32} />
        <Skeleton className="h-5 w-[60%]" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="pt-2">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-2 w-full mt-2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-[50%]" />
        <Skeleton className="h-4 w-[20%]" />
      </div>
    </div>
  );
});

AreaCardSkeleton.displayName = 'AreaCardSkeleton';

/**
 * Skeleton for a welcome header
 */
export const WelcomeHeaderSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('p-4 rounded-md bg-primary/10', className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[240px]" />
        </div>
        <Skeleton circle width={40} height={40} />
      </div>
    </div>
  );
});

WelcomeHeaderSkeleton.displayName = 'WelcomeHeaderSkeleton';

/**
 * Skeleton for an insights card
 */
export const InsightsCardSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('p-4 rounded-md bg-secondary/10', className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Skeleton circle width={24} height={24} />
          <Skeleton className="h-5 w-[140px]" />
        </div>
        <Skeleton circle width={20} height={20} />
      </div>
      <Skeleton className="h-3 w-[80%] mt-2" />
    </div>
  );
});

InsightsCardSkeleton.displayName = 'InsightsCardSkeleton';

/**
 * Skeleton for the home page
 */
export const HomePageSkeleton: React.FC<{ className?: string }> = memo(({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <WelcomeHeaderSkeleton />
      <InsightsCardSkeleton />
      <ProductivitySummarySkeleton />
      
      <div className="space-y-2">
        <Skeleton className="h-5 w-[200px] mb-4" />
        <div className="space-y-4">
          <AreaCardSkeleton />
          <AreaCardSkeleton />
          <AreaCardSkeleton />
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4">
        <Skeleton circle width={56} height={56} />
      </div>
    </div>
  );
});

HomePageSkeleton.displayName = 'HomePageSkeleton';
