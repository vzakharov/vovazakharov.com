import { redirect } from 'next/navigation';

import { routing } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import {
  CV_VARIANTS,
  cvRoute,
  generateCvMetadata,
  toCvVariant,
  type WithStringVariant,
} from '@/pages/cv';

type Props = WithParams<WithStringVariant>;

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
