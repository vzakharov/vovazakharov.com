import { caseSealRoute } from '@/basilisk/app/lib';

// `output: 'export'` has no request-time rendering, so the route must declare
// that it is written once at build time, and serves no file it did not list.
// Next reads both off the route module itself.
export const dynamic = 'force-static';
export const dynamicParams = false;

export const { GET, generateStaticParams } = caseSealRoute();
