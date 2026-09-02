import { redirect } from 'next/navigation';

import { routing } from '@/shared/i18n';

import { generateCvMetadata } from '@/pages/cv';

export const metadata = generateCvMetadata(routing.defaultLocale);

export default function CvRedirect() {
  redirect(`/${routing.defaultLocale}/cv`);
}
