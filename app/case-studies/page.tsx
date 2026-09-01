import Link from 'next/link';

import { Card } from '@/components/Card';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  COLLECTIONS,
  documentRoute,
  type Variant,
} from '@/lib/content/collections';
import {
  listPrimaryDocuments,
  siblingVariants,
  type ContentDocument,
} from '@/lib/content/documents';
import { renderDocument } from '@/lib/content/render';
import { constructMetadata } from '@/lib/metadata';

const COLLECTION = 'case-studies';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const DESCRIPTION =
  'Long-form write-ups of work I have shipped, with the numbers behind them.';

export const metadata = constructMetadata({
  title: `${COLLECTIONS[COLLECTION].label} - Vova Zakharov`,
  description: DESCRIPTION,
  path: COLLECTIONS[COLLECTION].routeBase,
});

interface IndexCard {
  document: ContentDocument;
  title: string;
  readingMinutes: number;
  variants: Variant[];
}

async function indexCards(): Promise<IndexCard[]> {
  return Promise.all(
    listPrimaryDocuments(COLLECTION).map(async (document) => {
      const { title, readingMinutes } = await renderDocument(document);

      return {
        document,
        title,
        readingMinutes,
        variants: siblingVariants(COLLECTION, document.slug),
      };
    })
  );
}

export default async function CaseStudiesPage() {
  const cards = await indexCards();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            {COLLECTIONS[COLLECTION].routeBase}
          </h1>
          <p className="text-lg opacity-80">{DESCRIPTION}</p>
        </header>

        <div className="space-y-6">
          {cards.map(({ document, title, readingMinutes, variants }) => (
            <Card key={document.slug}>
              <Link href={document.route} className="block group">
                <h2 className="text-2xl font-bold mb-2 group-hover:underline">
                  {title}
                </h2>
              </Link>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-70 mb-3">
                <time
                  dateTime={document.frontmatter.date
                    .toISOString()
                    .slice(0, 10)}
                >
                  {DATE_FORMAT.format(document.frontmatter.date)}
                </time>
                <span aria-hidden>·</span>
                <span>{readingMinutes} min read</span>
                {document.frontmatter.part && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Part {document.frontmatter.part}</span>
                  </>
                )}
              </p>
              <p className="leading-relaxed mb-4">
                {document.frontmatter.description}
              </p>
              <p className="flex flex-wrap gap-3 text-sm">
                <Link href={document.route} className="underline">
                  Read
                </Link>
                {variants.map((variant) => (
                  <Link
                    key={variant}
                    href={documentRoute(COLLECTION, document.slug, variant)}
                    className="underline opacity-70 hover:opacity-100"
                  >
                    {variant} version
                  </Link>
                ))}
              </p>
            </Card>
          ))}
        </div>

        <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20">
          <Link href="/" className="underline">
            ← Back to the home page
          </Link>
        </footer>
      </div>
    </div>
  );
}
