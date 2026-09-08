import { redirect } from 'next/navigation';

import { routing } from '@/shared/i18n';

import { cvRoute, generateCvMetadata } from '@/pages/cv';

export const metadata = generateCvMetadata(routing.defaultLocale);

export default function CvRedirect() {
  redirect(cvRoute(routing.defaultLocale));
}
