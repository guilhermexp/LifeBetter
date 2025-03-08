import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Custom hook for managing theme with optimized callbacks
 * 
 * Features:
 * - Persists theme preference in localStorage
 * - Syncs with system preference when set to 'system'
 * - Provides optimized callbacks for theme operations
 * - Applies theme to document element for CSS variables
 */
export function useThemeToggle() {
  // Get initial theme from localStorage or default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      return savedTheme || 'system';
    }
    return 'system';
  });

  // Get the actual theme based on system preference if theme is 'system'
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme !== 'system') {
      return theme;
    }
    
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light';
  });

  // Set theme with localStorage persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  // Reset to system theme
  const resetTheme = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  // Apply theme to document element and update when system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    // Update resolved theme initially
    updateResolvedTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateResolvedTheme();
    
    // Add event listener with modern API if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Apply theme to document element
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light-theme', 'dark-theme', 'dark');
    
    // Add the appropriate class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.add('dark'); // Add the 'dark' class for Tailwind
    } else {
      root.classList.add('light-theme');
    }
    
    // Also set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    resetTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
}
