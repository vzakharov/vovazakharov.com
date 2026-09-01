'use client';

import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { useMounted } from '@/hooks/use-mounted';

type Theme = 'light' | 'dark' | 'system';

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const ICON: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/** next-themes types `theme` as an open string; anything unrecognized reads as `system`. */
function asTheme(theme: string | undefined): Theme {
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations('ui');

  const cycleTheme = () => {
    setTheme(NEXT_THEME[asTheme(theme)]);
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const Icon = ICON[asTheme(theme)];

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded border border-foreground/40 hover:bg-foreground hover:text-background transition-colors"
      aria-label={t('toggleTheme')}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
