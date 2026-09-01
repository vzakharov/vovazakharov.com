'use client';

import { ActionIcon } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/shared/i18n';

export function LocalePicker() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  // `usePathname` only knows the route after hydration, and the picker is
  // rendered for exactly one route.
  const mounted = useMounted();

  const isI18nPage = pathname === '/cv';

  if (!mounted || !isI18nPage) {
    return null;
  }

  const nextLocale = locale === 'en' ? 'ru' : 'en';
  const currentFlag = locale === 'en' ? '🇬🇧' : '🇷🇺';

  return (
    <ActionIcon
      variant="default"
      size={38}
      radius={4}
      fz={18}
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'Russian'}`}
    >
      {currentFlag}
    </ActionIcon>
  );
}
