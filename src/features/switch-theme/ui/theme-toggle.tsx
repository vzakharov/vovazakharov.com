'use client';

import {
  ActionIcon,
  Box,
  type MantineColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

const NEXT_SCHEME = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
} as const satisfies Record<MantineColorScheme, MantineColorScheme>;

const ICONS = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const satisfies Record<MantineColorScheme, LucideIcon>;

const SIZE = 38;

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const mounted = useMounted();
  const t = useTranslations('ui');

  // Until hydration there is no telling a stored `auto` from the scheme it
  // resolved to, so the button reserves its space rather than guessing an icon.
  if (!mounted) {
    return <Box w={SIZE} h={SIZE} />;
  }

  const Icon = ICONS[colorScheme];

  return (
    <ActionIcon
      variant="default"
      size={SIZE}
      radius={4}
      onClick={() => {
        setColorScheme(NEXT_SCHEME[colorScheme]);
      }}
      aria-label={t('toggleTheme')}
    >
      <Icon size={20} />
    </ActionIcon>
  );
}
