import {useState, useEffect} from 'react';

/**
 * Hook for theme management with dark/light mode toggle
 *
 * Features:
 * - Persists theme preference to localStorage
 * - Detects system preference on first load
 * - Applies theme by adding/removing 'dark' class on document root
 * - Initializes theme before first render to prevent flash
 *
 * Theme priority:
 * 1. localStorage saved preference
 * 2. System preference (prefers-color-scheme)
 * 3. Light mode (default)
 *
 * @returns Current theme state and toggle function
 */
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply initial theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Apply CSS class to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {isDarkMode, toggleTheme};
}
