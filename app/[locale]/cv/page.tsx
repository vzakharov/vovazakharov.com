import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { SITE_CONFIG } from '@/lib/site-config';
import CVPage from './CVPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const description =
    locale === 'ru'
      ? 'Full-stack разработчик с глубокой AI/ML экспертизой с 2019 года. Создаю практичные инструменты на базе LLM, прототипы и продакшн-системы.'
      : 'Full-stack developer with deep AI/ML expertise since 2019. Building practical LLM-powered tools, prototypes, and production systems.';

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription:
      locale === 'ru'
        ? `${description} Физико-математический склад ума встречается с неприхотливым исполнением.`
        : `${description} Physics-math brain meets low-maintenance execution.`,
    path: `/${locale}/cv`,
    ogType: 'profile',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CVPage />
    </NextIntlClientProvider>
  );
}
