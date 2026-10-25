'use client';

import { usePathname, useRouter } from 'next/navigation';

import { DEFAULT_LOCALE } from '@/kernel/shared/i18n';

import { usePlayer } from './player-provider';

/** Whether the reader is on the radio's page, in either language. */
export function useOnRadioPage(): boolean {
  const { radioRoute } = usePlayer();
  const pathname = usePathname();

  // The locale-less alias is the default language's page, so it is spelled
  // with that locale appended before it is compared.
  return [pathname, `${pathname}/${DEFAULT_LOCALE}`].includes(radioRoute);
}

/**
 * Opens the radio's page, unless the reader is already on it, tuning in first
 * where the radio is off.
 */
export function useOpenRadio(): () => void {
  const { state, tuneIn, radioRoute } = usePlayer();
  const onRadioPage = useOnRadioPage();
  const router = useRouter();

  return () => {
    if (!state.radio) tuneIn();
    if (!onRadioPage) router.push(radioRoute);
  };
}
