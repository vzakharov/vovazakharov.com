/** The ids are the source of truth; `CvVariant` and the route schema derive from them. */
export const CV_VARIANTS = ['cto', 'dev'] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

export type WithCvVariant = { variant: CvVariant };

/** What the bare `/{locale}/cv` serves, in place rather than by redirect. */
export const DEFAULT_CV_VARIANT = 'cto' satisfies CvVariant;
