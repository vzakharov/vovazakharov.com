import { Group } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';
import {
  type ArticleFrontmatter,
  AUTHORS,
  documentDateTime,
  formatDocumentDate,
  type WithFrontmatter,
  type WithReadingMinutes,
} from '@/kernel/shared/content';
import { cx } from '@/kernel/shared/lib/class-names';
import type { WithOptionalClassName } from '@/kernel/shared/typings';

import { NameLink } from '@/shell/shared/ui';

import { messages } from '@/blog/shared/i18n';

import classes from './document-meta.module.scss';

export type DocumentMetaProps = WithFrontmatter<ArticleFrontmatter> &
  WithReadingMinutes &
  WithOptionalClassName;

/**
 * A document's byline — the same one on an index card and above the article.
 * It is the document entity's own UI, which the card beside it and the article
 * header a page slice up both reach down to.
 */
export function DocumentMeta({
  frontmatter,
  readingMinutes,
  className,
}: DocumentMetaProps) {
  const { name, href } = AUTHORS[frontmatter.author];
  const { locale } = SITE_CONFIG;
  const copy = messages(locale);

  return (
    <Group
      component="p"
      gap={12}
      wrap="wrap"
      fz="sm"
      opacity={0.7}
      className={cx(classes['meta'], className)}
    >
      <span>
        {copy.by} <NameLink {...{ href }}>{name}</NameLink>
      </span>
      <span aria-hidden>·</span>
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
