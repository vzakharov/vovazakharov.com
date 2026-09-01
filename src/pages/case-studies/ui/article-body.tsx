import type { WithHtml } from '@/shared/lib/content';

export function ArticleBody({ html }: WithHtml) {
  return (
    <div
      className="prose prose-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
