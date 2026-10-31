import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

// No messages: each app reads its own catalogue, so a page loads only those of
// the apps it renders.
export default getRequestConfig(() => ({ locale: routing.defaultLocale }));
