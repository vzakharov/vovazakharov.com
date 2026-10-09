import type { WithLocale } from '@/shared/i18n';

/** The ids are the source of truth; `CvVariant` and `CvAddress` derive from them. */
export const CV_VARIANTS = ['cto', 'dev'] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

type WithCvVariant = { variant: CvVariant };

/** One rendered sheet: which framing, in which language. */
export type CvEdition = WithCvVariant & WithLocale;

/** The most pages an edition's PDF may print to; `scripts/render-pdf.ts` fails a print past it. */
export const CV_PAGE_CEILING = 3;

/** What an address that names no variant serves, in place rather than by redirect. */
export const DEFAULT_CV_VARIANT = 'cto' satisfies CvVariant;
