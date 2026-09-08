/** The ids are the source of truth; `CvVariant` derives from them. */
export const CV_VARIANTS = ['cto', 'dev'] as const;

export type CvVariant = (typeof CV_VARIANTS)[number];

/** Which framing the CV is read in — the developer one is its own evidence. */
export type WithCvVariant = { variant: CvVariant };

/**
 * What `/{locale}/cv` serves, in place rather than by redirect. Every link on
 * the site points at that address, so this is the framing a reader meets first.
 */
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
