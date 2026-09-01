import type { WithHtml } from '@/shared/content';

export function ArticleBody({ html }: WithHtml) {
  return (
    <div
      className="prose prose-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
