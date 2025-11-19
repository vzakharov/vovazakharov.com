'use client';

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Card } from "@/components/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocalePicker } from "@/components/LocalePicker";

type CVPageProps = {
  locale: string;
};

export default function CVPage(_props: CVPageProps) {
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
            className="border border-foreground/40 px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            {t('printButton')}
          </button>
          <div className="flex gap-2">
            <LocalePicker />
            <ThemeToggle />
          </div>
        </div>

        {/* CV Header */}
        <header className="text-center space-y-4 pb-8 border-b border-foreground/20 print:space-y-2 print:pb-4">
          <h1 className="text-4xl sm:text-5xl font-bold print:text-3xl">{t('header.name')}</h1>
          <p className="text-xl opacity-80 print:text-base">{t('header.tagline')}</p>
          <p className="opacity-70 print:text-sm">
            <a href={`mailto:${t('header.email')}`} className="underline">
              {t('header.email')}
            </a>
          </p>
        </header>

        {/* Profile Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">{t('profile.title')}</h2>
          <Card className="space-y-4 print:space-y-2">
            <p className="leading-relaxed">
              {t.rich('profile.paragraph1', {
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <p className="leading-relaxed">
              {t('profile.paragraph2')}
            </p>
          </Card>
        </section>

        {/* What I Offer Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">{t('whatIOffer.title')}</h2>
          <Card>
            <div className="space-y-4 print:space-y-2">
              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('whatIOffer.coreCapabilities.title')}</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  <li>{t('whatIOffer.coreCapabilities.item1')}</li>
                  <li>{t('whatIOffer.coreCapabilities.item2')}</li>
                  <li>{t('whatIOffer.coreCapabilities.item3')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('whatIOffer.workingStyle.title')}</h3>
                <p className="leading-relaxed mb-2 print:mb-1">
                  {t('whatIOffer.workingStyle.paragraph1')}
                </p>
                <p className="leading-relaxed">
                  {t('whatIOffer.workingStyle.paragraph2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('whatIOffer.aiExpertise.title')}</h3>
                <p className="leading-relaxed">
                  {t('whatIOffer.aiExpertise.paragraph')}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Experience Section */}
        <section className="space-y-6 print:space-y-3">
          <h2 className="text-3xl font-bold print:text-2xl">{t('experience.title')}</h2>

          <div className="space-y-6 print:space-y-3">
            <Card>
              <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">{t('experience.project1.title')}</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">{t('experience.project1.period')}</h4>
              <p className="mb-3 print:mb-1">
                {t('experience.project1.description')}
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-4 print:space-y-0 print:mb-1">
                {t.raw('experience.project1.items').map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="text-sm font-mono opacity-60">
                {t('experience.project1.tech')}
              </p>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">{t('experience.project2.title')}</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">{t('experience.project2.period')}</h4>
              <p className="mb-3 print:mb-1">
                {t('experience.project2.description')}
              </p>
              <p className="mb-3 print:mb-1">{t('experience.project2.intro')}</p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-4 print:space-y-0 print:mb-1">
                {t.raw('experience.project2.items').map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="text-sm font-mono opacity-60">
                {t('experience.project2.tech')}
              </p>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">{t('experience.randddb.title')}</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">{t('experience.randddb.period')}</h4>
              <p className="mb-3 print:mb-1">
                {t('experience.randddb.description')}
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-4 print:space-y-0 print:mb-1">
                {t.raw('experience.randddb.items').map((item: { label: string; text: string }, idx: number) => (
                  <li key={idx}><strong>{item.label}</strong> {item.text}</li>
                ))}
              </ul>
              <p className="text-sm font-mono opacity-60 mb-2">{t('experience.randddb.tech')}</p>
              <p className="text-sm italic opacity-70">{t('experience.randddb.demo')}</p>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">{t('experience.independent.title')}</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">{t('experience.independent.period')}</h4>
              <p className="mb-3 print:mb-1">{t('experience.independent.intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                {t.raw('experience.independent.items').map((item: { label: string; text: string }, idx: number) => (
                  <li key={idx}><strong>{item.label}</strong> {item.text}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">{t('experience.voicemod.title')}</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90 print:text-base print:mb-1">{t('experience.voicemod.period')}</h4>
              <p className="mb-3 print:mb-1">{t('experience.voicemod.description')}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                {t.raw('experience.voicemod.items').map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">{t('techStack.title')}</h2>
          <Card>
            <div className="space-y-3 print:space-y-2">
              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('techStack.backend.title')}</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t.raw('techStack.backend.items').map((item: { label: string; text: string }, idx: number) => (
                    <li key={idx}><strong>{item.label}</strong> {item.text}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('techStack.frontend.title')}</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t.raw('techStack.frontend.items').map((item: { label: string; text: string }, idx: number) => (
                    <li key={idx}><strong>{item.label}</strong> {item.text}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">{t('techStack.serverless.title')}</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 print:space-y-0">
                  {t.raw('techStack.serverless.items').map((item: { label: string; text: string }, idx: number) => (
                    <li key={idx}><strong>{item.label}</strong> {item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Education Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">{t('education.title')}</h2>
          <Card>
            <h3 className="text-xl font-bold mb-2 print:text-base print:mb-1">{t('education.school')}</h3>
            <p className="opacity-80 print:text-sm">{t('education.degree')}</p>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="space-y-4 print:space-y-2">
          <h2 className="text-3xl font-bold print:text-2xl">{t('contact.title')}</h2>
          <Card>
            <p className="print:text-xs flex gap-2 justify-center">
              <a href={`mailto:${t('header.email')}`} className="underline hover:opacity-70">
                {t('header.email')}
              </a>
              ·
              <a href={`https://${t('contact.github')}`} className="underline hover:opacity-70" target="_blank" rel="noopener noreferrer">
                {t('contact.github')}
              </a>
              ·
              <a href={`https://${t('contact.linkedin')}`} className="underline hover:opacity-70" target="_blank" rel="noopener noreferrer">
                {t('contact.linkedin')}
              </a>
              ·
              <a href={`https://${t('contact.x')}`} className="underline hover:opacity-70" target="_blank" rel="noopener noreferrer">
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
          <p>{t('footer.printFooter')}&nbsp;
            <a href={`https://${t('footer.website')}`} className="underline hover:opacity-100">{t('footer.website')}</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
