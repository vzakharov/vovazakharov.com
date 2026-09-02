'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/shared/i18n';
import { useMounted } from '@/shared/lib/hydration';

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
      aria-label={t('switchToOther')}
    >
      {currentFlag}
    </button>
  );
}
