// Declares the one environment variable this repository reads, so `site-config`
// can spell it as a property. The spelling is load-bearing rather than
// cosmetic: the bundler inlines `process.env.NEXT_PUBLIC_SITE` by matching that
// exact member expression, and a bracketed or destructured read reaches the
// browser unsubstituted.

/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration
   merging into a library's own type is only expressible as an `interface`, so
   this augmentation cannot satisfy the project-wide preference for `type`.
   Permanent, and scoped to the one declaration that merges. */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Which site is being built — one of `SITE_IDS`, checked at load. */
    NEXT_PUBLIC_SITE?: string;
  }
}
