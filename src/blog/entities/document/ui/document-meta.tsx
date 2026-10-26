import { Group } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';
import type { WithOptionalClassName } from '@/kernel/shared/typings';

import { NameLink } from '@/shell/shared/ui';

import {
  type ArticleFrontmatter,
  author,
  documentDateTime,
  formatDocumentDate,
  type WithFrontmatter,
  type WithReadingMinutes,
<<<<<<< HEAD:src/blog/entities/document/ui/document-meta.tsx
} from '@/blog/shared/content';
import { messages } from '@/blog/shared/i18n';
=======
} from '@/shared/content';
import { loadMessages, type WithOptionalLocale } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalClassName } from '@/shared/typings';
import { NameLink } from '@/shared/ui';
>>>>>>> origin/main:src/entities/document/ui/document-meta.tsx

import classes from './document-meta.module.scss';

export type DocumentMetaProps = WithFrontmatter<ArticleFrontmatter> &
  WithReadingMinutes &
  WithOptionalClassName &
  WithOptionalLocale;

/**
 * A document's byline — the same one on an index card and above the article.
 * It is the document entity's own UI, which the card beside it and the article
 * header a page slice up both reach down to.
 */
export function DocumentMeta({
  frontmatter,
  readingMinutes,
  className,
  locale = SITE_CONFIG.locale,
}: DocumentMetaProps) {
<<<<<<< HEAD:src/blog/entities/document/ui/document-meta.tsx
  const { name, href } = AUTHORS[frontmatter.author];
  const { locale } = SITE_CONFIG;
  const copy = messages(locale);
=======
  const { name, href } = author(frontmatter.author, locale);
  const copy = loadMessages(locale).documents;
>>>>>>> origin/main:src/entities/document/ui/document-meta.tsx

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
