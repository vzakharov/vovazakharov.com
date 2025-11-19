'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const themes = ['light', 'dark', 'system'];

  const cycleTheme = () => {
    setTheme(
      themes[((theme ? themes.indexOf(theme) : -1) + 1) % themes.length]
    );
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    } else if (theme === 'light') {
      return <Sun className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded border border-foreground/40 hover:bg-foreground hover:text-background transition-colors"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  );
}
