import 'server-only';

import { AUTHOR_URL, SITE_CONFIG } from '@/shared/config';
import { pick } from '@/shared/lib/collections';
import type { Linked, Named } from '@/shared/typings';

import { documentRoute } from './collections';

/** Whom an article's byline may name. Frontmatter states the id, so each name and link has one home. */
export const AUTHOR_IDS = ['vova', 'clerk'] as const;

export type AuthorId = (typeof AUTHOR_IDS)[number];

/** Lower-case `the`, as it reads mid-line: "By the Clerk". */
export const AUTHORS: Record<AuthorId, Named & Linked> = {
  vova: { ...pick(SITE_CONFIG.author, 'name'), href: AUTHOR_URL },
  clerk: {
    name: 'the Clerk',
    href: documentRoute('basilisk-faq', 'who-writes-this'),
  },
};
