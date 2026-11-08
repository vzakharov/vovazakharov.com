import Link from 'next/link';

import { SITE_CONFIG } from '@/kernel/shared/config';

import { collectionRoute, feedRoutes } from '@/blog/shared/content';

import { POSTS } from '@/unsquatted/shared/content';
import { COPY } from '@/unsquatted/shared/i18n';

import classes from './masthead.module.scss';

type MastheadProps = {
  /** Whether a page inside the blog names it after the site's name. */
  inBlog?: boolean;
};

/** The site's mark: a U, drawn as the favicon draws it. */
function Mark() {
  return (
    <svg className={classes['mark']} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" />
      <path d="M10 9v8.5a6 6 0 0 0 12 0V9" />
    </svg>
  );
}

/** The blog's pages' top line: the site, where in it, and the way elsewhere. */
export function Masthead({ inBlog = false }: MastheadProps) {
  const blog = collectionRoute(POSTS.id);
  const [feed] = feedRoutes(POSTS.id, []);

  return (
    <header className={`print-hidden ${classes['masthead']}`}>
      <Link href="/" className={classes['site']}>
        <Mark />
        {SITE_CONFIG.name}
      </Link>
      {inBlog && (
        <span className={classes['crumb']}>
          / <Link href={blog}>{COPY.masthead.blog}</Link>
        </span>
      )}
      <nav className={classes['nav']}>
        <Link href="/">{COPY.masthead.checker}</Link>
        <Link href={blog}>{COPY.masthead.blog}</Link>
        {feed && <a href={feed.route}>{COPY.masthead.rss}</a>}
      </nav>
    </header>
  );
}
