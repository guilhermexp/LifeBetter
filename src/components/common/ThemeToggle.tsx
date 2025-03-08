import { memo, useCallback } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle component for switching between light, dark, and system themes
 * 
 * Features:
 * - Dropdown menu with theme options
 * - Visual indicators for current theme
 * - Optimized with memo and useCallback
 */
const ThemeToggleComponent = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const { theme, setTheme, isDark } = useTheme();
  
  // Memoize theme selection handlers
  const handleSelectLight = useCallback(() => setTheme('light'), [setTheme]);
  const handleSelectDark = useCallback(() => setTheme('dark'), [setTheme]);
  const handleSelectSystem = useCallback(() => setTheme('system'), [setTheme]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`rounded-full w-9 h-9 ${className}`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          {showLabel && (
            <span className="ml-2">
              {isDark ? 'Dark' : 'Light'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleSelectLight}
          className={theme === 'light' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSelectDark}
          className={theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSelectSystem}
          className={theme === 'system' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ThemeToggle = memo(ThemeToggleComponent);
