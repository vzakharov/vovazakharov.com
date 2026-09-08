import { redirect } from 'next/navigation';

import { routing } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import {
  cvRoute,
  cvVariantParams,
  cvVariantParamsSchema,
  generateCvMetadata,
  type WithOptionalVariantSegments,
} from '@/pages/cv';

type Props = WithParams<WithOptionalVariantSegments>;

/** The unlocalized entry points, one per localized address minus the locale. */
export function generateStaticParams() {
  return cvVariantParams();
}

export async function generateMetadata({ params }: Props) {
  const { variant } = cvVariantParamsSchema.parse(await params);

  return generateCvMetadata(routing.defaultLocale, variant);
}

export default async function CvRedirect({ params }: Props) {
  const { variant } = cvVariantParamsSchema.parse(await params);

  redirect(cvRoute(routing.defaultLocale, variant));
}
