import { redirect } from 'next/navigation';
import { generateCvMetadata } from './cv-utils';

export const metadata = generateCvMetadata('en');

export default function CVRedirect() {
  redirect('/en/cv');
}
