import type { WithHeadings } from '@/lib/content/render';

/**
 * The document's outline as plain anchors — no JavaScript, so it works without
 * hydration. `h1` is a part divider here, so `h2` entries indent under one.
 */
export function TableOfContents({ headings }: WithHeadings) {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className="lg:sticky lg:top-8 text-sm print:hidden"
    >
      <h2 className="font-bold mb-3 uppercase tracking-wide text-xs opacity-60">
        On this page
      </h2>
      <ol className="space-y-1.5 border-l border-foreground/20">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.depth === 1
                ? 'pl-3 -ml-px border-l-2 border-foreground/40 font-bold'
                : 'pl-6'
            }
          >
            <a
              href={`#${heading.id}`}
              className="block hover:opacity-100 opacity-75 hover:underline leading-snug"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
