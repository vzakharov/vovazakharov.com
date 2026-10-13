'use client';

import { usePathname, useRouter } from 'next/navigation';

import { DEFAULT_LOCALE } from '@/shared/i18n';

import { usePlayer } from './player-provider';

/** Tunes in and opens the radio's page, unless the reader is already on it. */
export function useOpenRadio(): () => void {
  const { tuneIn, radioRoute } = usePlayer();
  const pathname = usePathname();
  const router = useRouter();

  return () => {
    tuneIn();
    // The locale-less alias is the default language's page, so it is spelled
    // with that locale appended before it is compared.
    if (![pathname, `${pathname}/${DEFAULT_LOCALE}`].includes(radioRoute)) {
      router.push(radioRoute);
    }
  };
}
