import type { Locale } from '@/shared/i18n';

/** The ids are the source of truth; `CvVariant` and `CvAddress` derive from them. */
export const CV_VARIANTS = ['cto', 'dev'] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

export type WithCvVariant = { variant: CvVariant };

/** One rendered sheet: which framing, in which language. */
export type CvEdition = WithCvVariant & { locale: Locale };

/** What an address that names no variant serves, in place rather than by redirect. */
export const DEFAULT_CV_VARIANT = 'cto' satisfies CvVariant;
