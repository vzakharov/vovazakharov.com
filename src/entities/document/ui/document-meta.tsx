import { Group } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config';
import {
  type ArticleFrontmatter,
  author,
  COLLECTIONS,
  documentDateTime,
  formatDocumentDate,
  type WithCollectionId,
  type WithFrontmatter,
  type WithReadingMinutes,
} from '@/shared/content';
import { loadMessages, type WithOptionalLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalClassName } from '@/shared/typings';
import { NameLink } from '@/shared/ui';

import classes from './document-meta.module.scss';

/** Which collection's documents, read in which language. */
export type CollectionInLocale = WithCollectionId & WithOptionalLocale;

export type DocumentMetaProps = WithFrontmatter<ArticleFrontmatter> &
  CollectionInLocale &
  WithReadingMinutes &
  WithOptionalClassName;

/**
 * A document's byline — the same one on an index card and above the article.
 * It is the document entity's own UI, which the card beside it and the article
 * header a page slice up both reach down to.
 */
export function DocumentMeta({
  frontmatter,
  collection,
  readingMinutes,
  className,
  locale = SITE_CONFIG.locale,
}: DocumentMetaProps) {
  const { name, href } = author(frontmatter.author, locale);
  const copy = loadMessages(locale).documents;

  return (
    <Group
      component="p"
      gap={12}
      wrap="wrap"
      fz="sm"
      opacity={0.7}
      className={cx(classes['meta'], className)}
    >
      {COLLECTIONS[collection].bylined && (
        <>
          <span>
            {copy.by} <NameLink {...{ href }}>{name}</NameLink>
          </span>
          <span aria-hidden>·</span>
        </>
      )}
      <time dateTime={documentDateTime(frontmatter.date)}>
        {formatDocumentDate(frontmatter.date, locale)}
      </time>
      <span aria-hidden>·</span>
      <span>
        {copy.readingTime.replace('{minutes}', String(readingMinutes))}
      </span>
      {frontmatter.part !== undefined && (
        <>
          <span aria-hidden>·</span>
          <span>{copy.part.replace('{part}', frontmatter.part)}</span>
        </>
      )}
    </Group>
  );
}
