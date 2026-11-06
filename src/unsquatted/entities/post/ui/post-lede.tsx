import { ledeSpans } from '@/unsquatted/shared/content/index.node-safe';

type PostLedeProps = { lede: string; className?: string };

/** A post's lede, its `_…_` runs set in italics: under the title and on the index. */
export function PostLede({ lede, className }: PostLedeProps) {
  return (
    <p {...{ className }}>
      {ledeSpans(lede).map(({ text, italic }, index) =>
        italic ? <em key={index}>{text}</em> : text,
      )}
    </p>
  );
}
