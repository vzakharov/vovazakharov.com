import { loadMessages, type Locale, type Messages } from '@/shared/i18n';

import type { CvVariant } from './cv-variants';

/**
 * The CV's messages in one framing. `dev` is the base catalogue and every other
 * variant an override subtree merged over it a section at a time, so a key the
 * variant does not restate cannot drift from the base. Both the page and its
 * metadata resolve here, so neither merges anything itself.
 */
export function cvMessages(locale: Locale, variant: CvVariant): Messages {
  const messages = loadMessages(locale);

  if (variant === 'dev') return messages;

  const { cv } = messages;
  const { metadata, header, profile } = cv.variants[variant];

  return {
    ...messages,
    cv: {
      ...cv,
      metadata: { ...cv.metadata, ...metadata },
      header: { ...cv.header, ...header },
      profile: { ...cv.profile, ...profile },
    },
  };
}
