/** The ids are the source of truth; `CvVariant` derives from them. */
export const CV_VARIANTS = ['cto', 'dev'] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

export type WithCvVariant = { variant: CvVariant };

/** What `/{locale}/cv` serves, in place rather than by redirect. */
export const DEFAULT_CV_VARIANT = 'cto' satisfies CvVariant;

function isCvVariant(value: string): value is CvVariant {
  return (CV_VARIANTS as readonly string[]).includes(value);
}

// Route params reach the app as bare strings, as with the locale.
export function toCvVariant(value: string): CvVariant {
  if (!isCvVariant(value)) {
    throw new Error(`Unsupported CV variant: ${value}`);
  }

  return value;
}
