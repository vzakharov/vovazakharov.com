import { getRequestConfig } from 'next-intl/server';

import { MESSAGES } from './messages';
import { routing } from './routing';

export default getRequestConfig(() => {
  const locale = routing.defaultLocale;

  return { locale, messages: MESSAGES[locale] };
});
