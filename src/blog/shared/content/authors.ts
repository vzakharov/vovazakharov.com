import 'server-only';

import { AUTHOR_URL, SITE_CONFIG, siteConfig } from '@/kernel/shared/config';
import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import type { Named, WithLink } from '@/kernel/shared/typings';

import { messages } from '../i18n';
import { documentRoute } from './collections';

/** Whom an article's byline may name. Frontmatter states the id, so each name and link has one home. */
export const AUTHOR_IDS = ['vova', 'clerk', 'maya'] as const;

export type AuthorId = (typeof AUTHOR_IDS)[number];

/** Lower-case `the`, as it reads mid-line: "By the Clerk". */
export function author(id: AuthorId, locale: Locale): Named & WithLink {
  const authors: Record<AuthorId, Named & WithLink> = {
    vova: { ...pick(SITE_CONFIG.author, 'name'), href: AUTHOR_URL },
    clerk: {
      name: 'the Clerk',
      href: documentRoute('basilisk-faq', 'who-writes-this'),
    },
    maya: { name: messages(locale).authors.maya, href: siteConfig('maya').url },
  };

  return authors[id];
}
