export interface ArticleBodyProps {
  /** HTML from `renderDocument` — first-party markdown, compiled at build time. */
  html: string;
}

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="prose prose-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
