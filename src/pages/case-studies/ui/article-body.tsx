import { Typography } from '@mantine/core';
import type { WithHtml } from '@/shared/content';

export function ArticleBody({ html }: WithHtml) {
  // The class goes on the element holding the markup, not on `Typography`:
  // `prose-content > h1` keys the part dividers off direct children.
  return (
    <Typography>
      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Typography>
  );
}
