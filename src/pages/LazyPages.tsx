import React, { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
);

// Lazy load pages with error boundaries
export const LazyIndex = lazy(() => import('./Index'));
export const LazyToday = lazy(() => import('./Today'));
export const LazyPlanner = lazy(() => import('./Planner'));
export const LazyMindfulness = lazy(() => import('./Mindfulness'));
export const LazyAchievements = lazy(() => import('./Achievements'));
export const LazySettings = lazy(() => import('./Settings'));
export const LazyProfileEdit = lazy(() => import('./ProfileEdit'));
export const LazyAssistant = lazy(() => import('./Assistant'));
export const LazyAuth = lazy(() => import('./Auth'));
export const LazyNotFound = lazy(() => import('./NotFound'));

// Error fallback component
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="p-6 max-w-md bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        We encountered an error while loading this page. Please try refreshing or go back to the home page.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
);

// Wrapper components with Suspense and ErrorBoundary
export const IndexPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyIndex />
    </Suspense>
  </ErrorBoundary>
);

export const TodayPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyToday />
    </Suspense>
  </ErrorBoundary>
);

export const PlannerPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyPlanner />
    </Suspense>
  </ErrorBoundary>
);

export const MindfulnessPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyMindfulness />
    </Suspense>
  </ErrorBoundary>
);

export const AchievementsPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyAchievements />
    </Suspense>
  </ErrorBoundary>
);

export const SettingsPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazySettings />
    </Suspense>
  </ErrorBoundary>
);

export const ProfileEditPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyProfileEdit />
    </Suspense>
  </ErrorBoundary>
);

export const AssistantPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyAssistant />
    </Suspense>
  </ErrorBoundary>
);

export const AuthPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyAuth />
    </Suspense>
  </ErrorBoundary>
);

export const NotFoundPage = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<PageLoading />}>
      <LazyNotFound />
    </Suspense>
  </ErrorBoundary>
);
