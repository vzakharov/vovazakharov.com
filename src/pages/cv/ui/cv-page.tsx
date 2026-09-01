'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import { ThemeToggle } from '@/features/switch-theme';
import { Card } from '@/shared/ui';
import { LocalePicker } from './locale-picker';

/**
 * Order is a presentation decision, so it lives in code rather than in the
 * catalogs, where `en` and `ru` would be free to disagree about it.
 */
const EXPERIENCE_KEYS = [
  'playgram',
  'englishForKids',
  'orcool',
  'randddb',
  'independent',
  'voicemod',
] as const;

/** Entries use whichever shape suits them; a card renders both. */
type ExperienceItem = string | { label: string; text: string };

function ExperienceCard({ entryKey }: { entryKey: string }) {
  const t = useTranslations('cv.experience');
  const at = (field: string) => `${entryKey}.${field}`;
  const items = t.raw(at('items')) as ExperienceItem[];

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">
        {t(at('title'))}
      </h3>
      <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">
        {t(at('period'))}
      </h4>

      {t.has(at('description')) && (
        <p className="mb-3 print:mb-1">{t(at('description'))}</p>
      )}
      {t.has(at('intro')) && (
        <p className="mb-3 print:mb-1">{t(at('intro'))}</p>
      )}

      <ul className="list-disc list-inside space-y-1 mb-3 ml-4 print:space-y-0 print:mb-1 last:mb-0">
        {items.map((item, index) => (
          <li key={index}>
            {typeof item === 'string' ? (
              item
            ) : (
              <>
                <strong>{item.label}</strong> {item.text}
              </>
            )}
          </li>
        ))}
      </ul>

      {t.has(at('tech')) && (
        <p className="text-sm font-mono opacity-60">{t(at('tech'))}</p>
      )}
      {t.has(at('demo')) && (
        <p className="text-sm italic opacity-70 mt-2">{t(at('demo'))}</p>
      )}
    </Card>
  );
}

export type CvPageProps = {
  /** Resolved by the page: the registry that owns URL shapes is build-time-only. */
  caseStudyHref: string;
};

export function CvPage({ caseStudyHref }: CvPageProps) {
  const t = useTranslations('cv');
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 print:p-0">
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-4">
        {/* Header with theme toggle and print button */}
        <div className="flex justify-between items-start print:hidden">
          <button
            onClick={handlePrint}
            className="border border-foreground/40 p-3 hover:bg-foreground hover:text-background transition-colors"
            aria-label={t('printButton')}
          >
            <span className="flex items-center gap-1">
              <Printer className="w-5 h-5" /> / PDF
            </span>
          </button>
          <div className="flex gap-2">
            <LocalePicker />
            <ThemeToggle />
          </div>
        </div>

        {/* CV Header */}
        <header className="text-center space-y-4 pb-8 border-b border-foreground/20 print:space-y-2 print:pb-4">
          <h1 className="text-4xl sm:text-5xl font-bold print:text-3xl">
            {t('header.name')}
          </h1>
          <p className="text-xl opacity-80 print:text-base">
            {t('header.tagline')}
          </p>
          <p className="opacity-70 print:text-sm">
            <a href={`mailto:${t('header.email')}`} className="underline">
              {t('header.email')}
            </a>
          </p>
        </header>

        {/* Profile Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('profile.title')}
          </h2>
          <Card className="space-y-4 print:space-y-2">
            <p className="leading-relaxed">
              {t.rich('profile.paragraph1', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <p className="leading-relaxed">{t('profile.paragraph2')}</p>
          </Card>
        </section>

        {/* What I Offer Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('whatIOffer.title')}
          </h2>
          <Card>
            <div className="space-y-4 print:space-y-2">
              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('whatIOffer.coreCapabilities.title')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  <li>{t('whatIOffer.coreCapabilities.item1')}</li>
                  <li>{t('whatIOffer.coreCapabilities.item2')}</li>
                  <li>{t('whatIOffer.coreCapabilities.item3')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('whatIOffer.workingStyle.title')}
                </h3>
                <p className="leading-relaxed mb-2 print:mb-1">
                  {t('whatIOffer.workingStyle.paragraph1')}
                </p>
                <p className="leading-relaxed">
                  {t('whatIOffer.workingStyle.paragraph2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('whatIOffer.aiExpertise.title')}
                </h3>
                <p className="leading-relaxed">
                  {t('whatIOffer.aiExpertise.paragraph')}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Experience Section */}
        <section className="space-y-6 print:space-y-3">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('experience.title')}
          </h2>

          <div className="space-y-6 print:space-y-3">
            {EXPERIENCE_KEYS.map((entryKey) => (
              <ExperienceCard key={entryKey} entryKey={entryKey} />
            ))}
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('caseStudies.title')}
          </h2>
          <Card>
            <h3 className="text-xl font-bold mb-2 print:text-base print:mb-1">
              {t('caseStudies.playgram.title')}
            </h3>
            <p className="leading-relaxed mb-3 print:mb-1">
              {t('caseStudies.playgram.description')}
            </p>
            <p className="text-sm">
              <Link href={caseStudyHref} className="underline hover:opacity-70">
                {t('caseStudies.playgram.link')}
              </Link>
            </p>
          </Card>
        </section>

        {/* Tech Stack Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('techStack.title')}
          </h2>
          <Card>
            <div className="space-y-3 print:space-y-2">
              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('techStack.backend.title')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t
                    .raw('techStack.backend.items')
                    .map(
                      (item: { label: string; text: string }, idx: number) => (
                        <li key={idx}>
                          <strong>{item.label}</strong> {item.text}
                        </li>
                      )
                    )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('techStack.frontend.title')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t
                    .raw('techStack.frontend.items')
                    .map(
                      (item: { label: string; text: string }, idx: number) => (
                        <li key={idx}>
                          <strong>{item.label}</strong> {item.text}
                        </li>
                      )
                    )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">
                  {t('techStack.serverless.title')}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t
                    .raw('techStack.serverless.items')
                    .map(
                      (item: { label: string; text: string }, idx: number) => (
                        <li key={idx}>
                          <strong>{item.label}</strong> {item.text}
                        </li>
                      )
                    )}
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Education Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('education.title')}
          </h2>
          <Card>
            <h3 className="text-xl font-bold mb-2 print:text-base print:mb-1">
              {t('education.school')}
            </h3>
            <p className="opacity-80 print:text-sm">{t('education.degree')}</p>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">
            {t('contact.title')}
          </h2>
          <Card>
            <p className="print:text-xs flex gap-2 justify-center">
              <a
                href={`mailto:${t('header.email')}`}
                className="underline hover:opacity-70"
              >
                {t('header.email')}
              </a>
              ·
              <a
                href={`https://${t('contact.github')}`}
                className="underline hover:opacity-70"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.github')}
              </a>
              ·
              <a
                href={`https://${t('contact.linkedin')}`}
                className="underline hover:opacity-70"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.linkedin')}
              </a>
              ·
              <a
                href={`https://${t('contact.x')}`}
                className="underline hover:opacity-70"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.x')}
              </a>
            </p>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20 print:hidden">
          <p>
            <Link href="/" className="underline hover:opacity-100">
              {t('footer.backLink')}
            </Link>
          </p>
        </footer>

        {/* Print-only footer */}
        <footer className="hidden print:block text-center text-sm pt-8">
          <p>
            {t('footer.printFooter')}&nbsp;
            <a
              href={`https://${t('footer.website')}`}
              className="underline hover:opacity-100"
            >
              {t('footer.website')}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
