import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ThemeToggle } from '@/features/switch-theme';
import {
  COLLECTIONS,
  VARIANTS,
  listDocuments,
  loadDocument,
  renderDocument,
  siblingVariants,
  type Variant,
} from '@/shared/lib/content';
import { constructArticleMetadata } from '@/shared/seo';
import { ArticleBody } from './article-body';
import { ArticleHeader } from './article-header';
import { BackToHome } from './back-to-home';
import { TableOfContents } from './table-of-contents';

const COLLECTION = 'case-studies';

type Props = {
  params: Promise<{ slug: string[] }>;
};

/**
 * One catch-all covers the full document and each of its cuts, so a new
 * markdown file in the collection is a new page with no route work.
 */
export function generateArticleParams() {
  return listDocuments(COLLECTION).map(({ slug, variant }) => ({
    slug: variant ? [slug, variant] : [slug],
  }));
}

/** `[slug]` is the full document, `[slug, variant]` one of its shorter cuts. */
function parseSegments(
  segments: string[]
): { slug: string; variant?: Variant } | undefined {
  if (segments.length === 1) return { slug: segments[0] };

  if (segments.length === 2) {
    const [slug, variant] = segments;

    return (VARIANTS as readonly string[]).includes(variant)
      ? { slug, variant: variant as Variant }
      : undefined;
  }

  return undefined;
}

async function resolve(params: Props['params']) {
  const parsed = parseSegments((await params).slug);
  const document =
    parsed && loadDocument(COLLECTION, parsed.slug, parsed.variant);

  if (!document) notFound();

  return { document, rendered: await renderDocument(document) };
}

export async function generateArticleMetadata({ params }: Props) {
  const { document, rendered } = await resolve(params);

  return constructArticleMetadata(document, rendered.title);
}

export async function ArticlePage({ params }: Props) {
  const { document, rendered } = await resolve(params);

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-12 lg:p-16 print:p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        <nav className="flex items-center justify-between print:hidden">
          <Link
            href={COLLECTIONS[COLLECTION].routeBase}
            className="text-sm underline hover:opacity-70"
          >
            ← {COLLECTIONS[COLLECTION].label}
          </Link>
          <ThemeToggle />
        </nav>

        {/*
          Three grid children rather than an article and a rail, so one DOM
          order serves both layouts: stacked, the reader gets the title, then
          the outline, then the prose; on a wide viewport the outline moves
          into its own column beside both.
        */}
        <article className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <ArticleHeader
              document={document}
              title={rendered.title}
              readingMinutes={rendered.readingMinutes}
              availableVariants={siblingVariants(COLLECTION, document.slug)}
            />
          </div>

          <aside className="my-10 lg:my-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <TableOfContents headings={rendered.headings} />
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-10">
            <ArticleBody html={rendered.html} />
          </div>
        </article>

        <BackToHome />
      </div>
    </div>
  );
}
