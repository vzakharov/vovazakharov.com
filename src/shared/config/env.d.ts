// So `site-config` can spell the variable as a property, which is load-bearing:
// the bundler inlines `process.env.NEXT_PUBLIC_SITE` by matching that exact
// member expression, and a bracketed or destructured read reaches the browser
// unsubstituted.

/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration
   merging into a library's own type is only expressible as an `interface`, so
   this augmentation cannot satisfy the project-wide preference for `type`.
   Permanent, and scoped to the one declaration that merges. */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Which site is being built — one of `SITE_IDS`, checked at load. */
    NEXT_PUBLIC_SITE?: string;
    /** Set by `scripts/play-mushrooms.ts` for the build it plays. */
    NEXT_PUBLIC_MUSHROOM_PROBE?: string;
  }
}
