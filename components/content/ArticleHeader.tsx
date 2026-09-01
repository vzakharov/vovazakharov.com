import Link from 'next/link';
import { FileText } from 'lucide-react';

import {
  VARIANTS,
  type CollectionId,
  type Variant,
  documentRoute,
} from '@/lib/content/collections';
import type { ContentDocument } from '@/lib/content/documents';

/** How each cut is offered to the reader. `undefined` is the full document. */
const CUT_LABELS: Record<Variant | 'full', string> = {
  full: 'Full',
  mini: 'Mini',
  micro: 'Micro',
};

interface CutSwitcherProps {
  collection: CollectionId;
  slug: string;
  current?: Variant;
  available: Variant[];
}

function CutSwitcher({
  collection,
  slug,
  current,
  available,
}: CutSwitcherProps) {
  const cuts: (Variant | undefined)[] = [
    undefined,
    ...VARIANTS.filter((variant) => available.includes(variant)),
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm print:hidden">
      {cuts.map((cut) => {
        const label = CUT_LABELS[cut ?? 'full'];

        return cut === current ? (
          <span
            key={label}
            aria-current="page"
            className="border border-foreground bg-foreground text-background px-3 py-1"
          >
            {label}
          </span>
        ) : (
          <Link
            key={label}
            href={documentRoute(collection, slug, cut)}
            className="border border-foreground/40 px-3 py-1 hover:bg-foreground hover:text-background transition-colors"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export interface ArticleHeaderProps {
  document: ContentDocument;
  title: string;
  readingMinutes: number;
  availableVariants: Variant[];
}

export function ArticleHeader({
  document,
  title,
  readingMinutes,
  availableVariants,
}: ArticleHeaderProps) {
  const { frontmatter, collection, slug, variant, rawUrl } = document;

  return (
    <header className="space-y-6 pb-8 border-b border-foreground/20">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          {title}
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          {frontmatter.description}
        </p>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-70">
        <time dateTime={frontmatter.date.toISOString().slice(0, 10)}>
          {DATE_FORMAT.format(frontmatter.date)}
        </time>
        <span aria-hidden>·</span>
        <span>{readingMinutes} min read</span>
        {frontmatter.part && (
          <>
            <span aria-hidden>·</span>
            <span>Part {frontmatter.part}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <CutSwitcher
          collection={collection}
          slug={slug}
          current={variant}
          available={availableVariants}
        />

        {/* The authored markdown, served straight out of `public/`. */}
        <a
          href={rawUrl}
          className="flex items-center gap-1.5 text-sm underline hover:opacity-70 print:hidden"
        >
          <FileText className="w-4 h-4" aria-hidden />
          Markdown
        </a>
      </div>
    </header>
  );
}
