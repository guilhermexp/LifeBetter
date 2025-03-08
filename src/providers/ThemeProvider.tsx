import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeToggle } from '@/hooks/useThemeToggle';

// Define the context type
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeUtils = useThemeToggle();
  
  return (
    <ThemeContext.Provider value={themeUtils}>
      {children}
    </ThemeContext.Provider>
  );
}
