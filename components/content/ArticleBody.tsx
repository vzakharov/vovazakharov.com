import type { WithHtml } from '@/lib/content/render';

export function ArticleBody({ html }: WithHtml) {
  return (
    <div
      className="prose prose-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
