'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';

import { useMounted } from '@/hooks/use-mounted';

export function LocalePicker() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const mounted = useMounted();
  const t = useTranslations('ui');

  const isI18nPage = pathname === '/cv';

  if (!mounted || !isI18nPage) {
    return null;
  }

  const currentLocale = locale;
  const nextLocale = currentLocale === 'en' ? 'ru' : 'en';
  const currentFlag = currentLocale === 'en' ? '🇬🇧' : '🇷🇺';

  const toggleLocale = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="p-2 rounded border border-foreground/40 hover:bg-foreground hover:text-background transition-colors text-lg"
      aria-label={t(
        nextLocale === 'en' ? 'switchToEnglish' : 'switchToRussian',
      )}
    >
      {currentFlag}
    </button>
  );
}
