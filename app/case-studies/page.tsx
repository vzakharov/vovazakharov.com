import Link from 'next/link';

import { Card } from '@/components/Card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackToHome } from '@/components/content/BackToHome';
import { DocumentMeta } from '@/components/content/DocumentMeta';
import { COLLECTIONS, documentRoute } from '@/lib/content/collections';
import { renderPrimaryDocuments } from '@/lib/content/render';
import { constructMetadata } from '@/lib/metadata';

const COLLECTION = 'case-studies';

const DESCRIPTION =
  'Long-form write-ups of work I have shipped, with the numbers behind them.';

export const metadata = constructMetadata({
  title: `${COLLECTIONS[COLLECTION].label} - Vova Zakharov`,
  description: DESCRIPTION,
  path: COLLECTIONS[COLLECTION].routeBase,
});

export default async function CaseStudiesPage() {
  const cards = await renderPrimaryDocuments(COLLECTION);

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
          {cards.map(({ document, rendered, variants }) => (
            <Card key={document.slug}>
              <Link href={document.route} className="block group">
                <h2 className="text-2xl font-bold mb-2 group-hover:underline">
                  {rendered.title}
                </h2>
              </Link>
              <DocumentMeta
                frontmatter={document.frontmatter}
                readingMinutes={rendered.readingMinutes}
                className="mb-3"
              />
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

        <BackToHome />
      </div>
    </div>
  );
}
