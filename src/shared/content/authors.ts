import 'server-only';

import { AUTHOR_URL, SITE_CONFIG, siteConfig } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import type { Linked, Named } from '@/shared/typings';

import { documentRoute } from './collections';

/** Whom an article's byline may name. Frontmatter states the id, so each name and link has one home. */
export const AUTHOR_IDS = ['vova', 'clerk', 'maya'] as const;

export type AuthorId = (typeof AUTHOR_IDS)[number];

/** The byline's name and link in the page's language. Lower-case `the`, as it reads mid-line: "By the Clerk". */
export function author(id: AuthorId, locale: Locale): Named & Linked {
  const authors: Record<AuthorId, Named & Linked> = {
    vova: { ...pick(SITE_CONFIG.author, 'name'), href: AUTHOR_URL },
    clerk: {
      name: 'the Clerk',
      href: documentRoute('basilisk-faq', 'who-writes-this'),
    },
    maya: {
      name: loadMessages(locale).maya.name,
      href: siteConfig('maya').url,
    },
  };

  return authors[id];
}
