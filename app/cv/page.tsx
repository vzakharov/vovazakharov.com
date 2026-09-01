import { redirect } from 'next/navigation';
import { generateCvMetadata } from '@/pages/cv';
import { routing } from '@/shared/i18n';

export const metadata = generateCvMetadata(routing.defaultLocale);

export default function CvRedirect() {
  redirect(`/${routing.defaultLocale}/cv`);
}
