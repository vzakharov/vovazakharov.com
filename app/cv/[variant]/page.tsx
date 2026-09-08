import { redirect } from 'next/navigation';

import { routing } from '@/shared/i18n';

import { CV_VARIANTS, cvRoute, generateCvMetadata, toCvVariant } from '@/pages/cv';

type Props = {
  params: Promise<{ variant: string }>;
};

export function generateStaticParams() {
  return CV_VARIANTS.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: Props) {
  const { variant } = await params;

  return generateCvMetadata(routing.defaultLocale, toCvVariant(variant));
}

export default async function CvVariantRedirect({ params }: Props) {
  const { variant } = await params;

  redirect(cvRoute(routing.defaultLocale, toCvVariant(variant)));
}
