// `output: 'export'` has no request-time rendering, so the route must declare
// that it is written once at build time. Next reads this off the route module
// itself, which is why it is stated here rather than re-exported.
export const dynamic = 'force-static';

export { sitemap as default } from '@/app/lib/sitemap';
