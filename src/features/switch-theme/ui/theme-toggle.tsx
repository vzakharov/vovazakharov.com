'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { Moon, Sun } from 'lucide-react';

import { cx } from '@/shared/lib/class-names';
import type { Labeled } from '@/shared/typings';

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

/**
 * Two visible states over a three-value store; the rule is in `../lib`.
 *
 * The label is a prop, not a `useTranslations` call: this is the site's only
 * client component outside the CV, so reading it here would put next-intl's
 * client runtime into every page's bundle for one string.
 */
export function ThemeToggle({ label }: Labeled) {
  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();

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
      variant="transparent"
      size={SIZE}
      onClick={switchScheme}
      aria-label={label}
      className={cx(classes['toggle'], 'print-hidden')}
    >
      {/* The icon names the scheme a click gets you, not the one you are in. */}
      <Moon size={20} aria-hidden className={classes['whenLight']} />
      <Sun size={20} aria-hidden className={classes['whenDark']} />
    </ActionIcon>
  );
}
