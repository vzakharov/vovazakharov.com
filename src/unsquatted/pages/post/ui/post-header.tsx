import { pick } from '@/kernel/shared/lib/collections';

import { FileLink } from '@/shell/shared/ui';

import type { ContentDocument, Headlined } from '@/blog/shared/content';
import { DocumentMeta } from '@/blog/entities/document';

import type { PostFrontmatter } from '@/unsquatted/shared/content';
import { OccasionEyebrow } from '@/unsquatted/entities/post';

import classes from './post-header.module.scss';

type PostHeaderProps = Headlined & {
  document: ContentDocument<PostFrontmatter>;
};

/**
 * The occasion over the title in the display serif, the lede under it, and
 * the byline with the file beside it on one line.
 */
export function PostHeader({
  document,
  title,
  readingMinutes,
}: PostHeaderProps) {
  const { frontmatter, collection, markdown } = document;

  return (
    <header className={classes['header']}>
      <OccasionEyebrow {...pick(frontmatter, 'occasion')} />
      <h1 className={classes['title']}>{title}</h1>
      <p className={classes['lede']}>{frontmatter.description}</p>
      <div className={classes['meta']}>
        <DocumentMeta {...{ frontmatter, collection, readingMinutes }} />
        <FileLink {...markdown}>.md</FileLink>
      </div>
    </header>
  );
}
