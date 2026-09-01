'use client';

import {
  ActionIcon,
  Box,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { Sun, Moon, Monitor } from 'lucide-react';

const SCHEMES = [
  'light',
  'dark',
  'auto',
] as const satisfies MantineColorScheme[];

const ICONS = { light: Sun, dark: Moon, auto: Monitor };

const SIZE = 38;

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const mounted = useMounted();

  // Until hydration there is no telling a stored `auto` from the scheme it
  // resolved to, so the button reserves its space rather than guessing an icon.
  if (!mounted) {
    return <Box w={SIZE} h={SIZE} />;
  }

  const Icon = ICONS[colorScheme];
  const next = SCHEMES[(SCHEMES.indexOf(colorScheme) + 1) % SCHEMES.length];

  return (
    <ActionIcon
      variant="default"
      size={SIZE}
      radius={4}
      onClick={() => setColorScheme(next)}
      aria-label="Toggle theme"
    >
      <Icon size={20} />
    </ActionIcon>
  );
}
