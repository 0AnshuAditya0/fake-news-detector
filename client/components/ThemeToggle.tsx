'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="relative w-16 h-8 rounded-full bg-gray-200">
        <div className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-16 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-cyan-400 dark:to-blue-500 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 dark:hover:shadow-cyan-500/50 transition-all duration-300 ease-in-out transform hover:scale-110"
      aria-label="Toggle theme"
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-cyan-400 dark:to-blue-500 transition-all duration-300" />
      
      {/* Slider */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-cyan-400 animate-pulse" />
        ) : (
          <Sun className="w-4 h-4 text-indigo-600 animate-spin-slow" />
        )}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-400/30 to-cyan-400/30 blur-md" />
    </button>
  );
}
