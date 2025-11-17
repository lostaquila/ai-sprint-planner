'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-12 h-12 rounded-xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center transition-all duration-200"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 via-indigo-500 to-coral-500 dark:from-teal-600 dark:via-indigo-600 dark:to-pink-600 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-xl group overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-indigo-400 to-coral-400 dark:from-teal-500 dark:via-indigo-500 dark:to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon */}
      {theme === 'dark' ? (
        // Sun icon for light mode
        <svg
          className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:rotate-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

