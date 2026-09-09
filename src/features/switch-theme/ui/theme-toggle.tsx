'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  type PickedColorScheme,
  preferredColorScheme,
} from '../lib/color-scheme';
import classes from './theme-toggle.module.scss';

const SIZE = 38;

const OPPOSITE = {
  light: 'dark',
  dark: 'light',
} as const satisfies Record<PickedColorScheme, PickedColorScheme>;

// Read at click time rather than through `useComputedColorScheme`, whose first
// render reports `light` whatever the reader's OS says.
function systemColorScheme(): PickedColorScheme {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Two visible states over a three-value store; the rule is in `../lib`. */
export function ThemeToggle() {
  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();
  const t = useTranslations('ui');

  function switchScheme() {
    const system = systemColorScheme();
    const onScreen = colorScheme === 'auto' ? system : colorScheme;
    const preferred = preferredColorScheme(OPPOSITE[onScreen], system);

    if (preferred === 'auto') {
      clearColorScheme();
    } else {
      setColorScheme(preferred);
    }
  }

  return (
    <ActionIcon
      variant="default"
      size={SIZE}
      radius={4}
      onClick={switchScheme}
      aria-label={t('toggleTheme')}
      className="print-hidden"
    >
      {/* The icon names the scheme a click gets you, not the one you are in. */}
      <Moon size={20} aria-hidden className={classes['whenLight']} />
      <Sun size={20} aria-hidden className={classes['whenDark']} />
    </ActionIcon>
  );
}
