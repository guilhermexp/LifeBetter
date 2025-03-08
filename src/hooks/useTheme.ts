import { useContext } from 'react';
import { ThemeContext } from '@/providers/ThemeProvider';

/**
 * Custom hook to use the theme context
 * 
 * This hook provides access to the theme context and its utilities
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
