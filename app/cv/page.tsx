import { redirect } from 'next/navigation';
import { generateCvMetadata } from '../[locale]/cv/page';

export const metadata = generateCvMetadata('en');

export default function CVRedirect() {
  redirect('/en/cv');
}
