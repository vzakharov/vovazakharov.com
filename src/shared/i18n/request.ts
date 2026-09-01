import { getRequestConfig } from 'next-intl/server';
import { loadMessages } from './load-messages';
import { routing } from './routing';

export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: loadMessages(locale),
  };
});
