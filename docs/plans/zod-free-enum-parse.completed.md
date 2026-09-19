# A zod-free enum parse, and the apparatus it un-builds

## The finding

Three of the five zod uses in the tree parse nothing: they check one string against a
closed list of literals. Each carries `import 'server-only'` and a docstring naming the
same reason — zod is ~90 kB gzipped in any chunk that touches it, so the check is kept
off the client by fencing the module that performs it.

| Module                                 | What zod does there                        |
| -------------------------------------- | ------------------------------------------ |
| `src/shared/config/site.env.unsafe.ts` | `z.enum(SITE_IDS)` — two literals          |
| `src/shared/i18n/locale-schema.ts`     | `z.enum(routing.locales)`                  |
| `src/pages/cv/lib/cv-route-params.ts`  | `z.enum(CV_VARIANTS)` inside a tuple union |

The fences are not free. `resolveSiteId` being unreachable from a client component is
why `shared/config` split into three barrels, why `SITE_ID` is server-only, and —
through that — why `InternalLink` stopped deriving paper's copy of its own href and
started being handed one. The `printed` prop, `linkTo`, `LinkedPerMedium`, and the
`PerMedium` union added in `8be92aa` all exist as consequences of a ~90 kB dependency
doing a `.includes()`.

So the change is not "swap zod for a guard in one file". Removing the weight removes the
reason for the fence, and the fence is load-bearing for a page component's API. This plan
takes both.

**What it does not touch:** `src/shared/content/frontmatter.ts` and
`scripts/lib/render-manifest.ts` keep zod. Both parse real shapes with optional fields and
coercion, which is what zod is for, and the script never reaches a browser.

## The helper

A single sub-library under `shared/lib`, per `@.claude/rules/fsd.md` — one file, its own
public API, addressed directly as `@/shared/lib/one-of`:

```ts
/**
 * Whether a value is one of the listed literals. The list is widened to
 * `readonly string[]` before `.includes()` because a literal tuple's own
 * `includes` accepts only a member, which is the one thing a caller cannot
 * promise.
 */
export const isOneOf =
  <const T extends readonly string[]>(values: T) =>
  (value: unknown): value is T[number] =>
    typeof value === 'string' && (values as readonly string[]).includes(value);

/**
 * The same check as a parse: the value, or a throw naming what was being read.
 * The subject is the caller's word for it — an environment variable, a route
 * segment — because the reader is whoever supplied the bad value.
 */
export function oneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
  subject: string,
): T[number];
```

Two exports rather than one because the three call sites want different things: two throw
on a miss and one branches on it (`isKnown` in
`src/shared/content/plugins/remark-content-directives.ts`, which this replaces).

This satisfies CLAUDE.md § "Derive types and schemas from the source of truth" — the values
stay a `const` array and the type is derived from it; a membership check with a type
predicate is a parse, not a cast.

**It is ours to write, not to copy.** `Playgramai/playgramapp` has no such helper — only an
ad-hoc `isColorScheme` in `scripts/preview/shots.ts`, carrying a comment about the same
`.includes()` widening trap. Once this one exists and proves out, it is a candidate to push
_there_, which is the direction `pick` and `EitherOr` travel in reverse.

## What changes, in dependency order

1. **Write `src/shared/lib/one-of.ts`** with a test beside it (`one-of.test.ts`) — a pure
   function of its input, which is what `CLAUDE.md` § "Testing" says belongs in the suite
   rather than in a QA row.

2. **`site.env.unsafe.ts` → `site-env.ts`.** `resolveSiteId` becomes `oneOf(SITE_IDS, …)`,
   keeping its current message. The `.unsafe.` suffix goes with the rename: that name exists
   only to warn that a direct import costs zod, and there is no longer a cost to warn about.
   Its sibling import keeps the explicit `.ts` — bare Node still reads this file through
   `index.node-safe.ts`, and the helper import spells its extension for the same reason.

3. **`locale-schema.ts` folds into `shared/i18n/index.ts`** as `parseLocale` /`isLocale`.
   `localeSchema` has exactly one consumer (step 4), so nothing else moves.

4. **`cv-route-params.ts` hand-writes its tuple parse.** The catch-all's segments are
   `[]`, `[variant]` or `[variant, locale]`; without zod that is a `switch` on length with
   `oneOf` per segment and a throw otherwise — roughly fifteen lines, and it reads more
   plainly than the nested `z.union([z.tuple…])` does. This is what lets
   `src/shared/i18n/index.server-only.ts` be deleted: `localeSchema` is its only export.

5. **`BUILD_YEAR` moves to `src/shared/config/build-year.ts`**, keeping `import 'server-only'`
   and its export from `index.server-only.ts`. It must not be evaluated in the browser: in a
   static export the module runs both at build and at hydration, so a client copy would print
   the build year in the prerendered HTML and the reader's year after hydration next January.
   This is the one thing in `resolved-site.ts` that is server-only for a reason zod never
   supplied.

6. **`resolved-site.ts` drops `server-only`** and its exports — `SITE_ID`, `SITE_CONFIG`,
   `getAbsoluteUrl`, `pageFile`, `printedUrl`, `linkTo` — move to the plain `index.ts`
   barrel. `index.server-only.ts` survives holding `BUILD_YEAR` alone; a barrel for one
   export is still the right shape, because the axis it names is the client bundle, not the
   count.

7. **Re-check the other `server-only` fences that existed for zod's sake**, each on its own
   merits rather than by sweep: `shared/seo/index.server-only.ts` (`constructMetadata` reads
   only `getAbsoluteUrl` and `SITE_CONFIG`), and every module under `shared/content`, which
   stays fenced regardless — `fs`, `gray-matter` and the unified pipeline are its real
   reason, and `frontmatter.ts` keeps zod.

8. **Revert the printed-link apparatus**, which is what steps 2–6 make unnecessary:
   - `InternalLink` derives `printed = printedUrl(href)` again; the `printed` and
     `noPrintedCopy` props go, and with them `PerMedium`, `NoPrintedCopy`, `WithPrinted`,
     `LinkedPerMedium` and `EitherOr` from `shared/typings`.
   - `linkTo` goes; its call sites pass `href={route}` as they did before.
   - The seven call sites that state a medium stop stating one. They sit inside
     `print-hidden` containers, which is what actually keeps them off paper — the fact was
     being spelled twice, once in CSS and once in props.
   - `CaseStudyLink` keeps taking `href` from the server. That crossing is unrelated:
     `FEATURED_CASE_STUDY_ROUTE` comes from `shared/content`, which is build-time-only
     because of `fs`, not zod.
   - `printedSite` in `cv-page`/`cv-sheet` can also go — `cv-sheet` is `'use client'` and
     can now call `printedUrl(SITE_CONFIG.url)` itself.

   Net effect on `8be92aa`: **superseded**. It solved a problem that this plan deletes.
   Keeping both would leave a required prop whose only answer is derivable from another
   prop.

9. **Re-render the PDFs** (`pnpm content:pdf:vova`, `pnpm content:pdf:lsa`) and commit them.
   `src/shared/ui` and `src/pages/cv` are hashed wholesale, so every PDF re-flags; the
   printed markup should come out identical to what is on `main` today, which is worth
   checking rather than assuming.

## What keeps zod

`frontmatter.ts` — a document's front matter is a real shape with optional fields, a date to
coerce and a failure the author must be told about by field name. `render-manifest.ts` — a
build script, no bundle to grow. Both keep their current form; neither gains a
`server-only` it did not have.

## DRY notes

**Genuinely shared, and extracted:** the membership check. Four sites perform it today — the
three zod enums and one hand-rolled `isKnown` — and each spells the same widening dance or
pays 90 kB to avoid spelling it. One helper, four consumers, and the fourth is the proof it
is not speculative: it was already written by hand once.

**Reused rather than added:** `SITE_IDS`, `routing.locales`, `CV_VARIANTS` and
`BLOCK_DIRECTIVES` stay exactly where they are as the source of truth; the helper derives
from them and declares nothing. `oneOf` is built on `isOneOf` rather than repeating the
predicate.

**Deliberately not extracted:** the tuple parse in step 4. It is one route's shape, in one
module, with one consumer — a `parseSegments` abstraction would have a single call site and
would have to grow a vocabulary for tuples, defaults and per-position types, which is zod's
job description. Hand-writing fifteen concrete lines beats owning a small bad zod.

**Deliberately deleted rather than kept for later:** `EitherOr` and the `WithPrinted` family
lose their only consumer in step 8. Keeping an unused generic in `shared/typings` because it
might return is the standing tax CLAUDE.md § "Writing things down" argues against; it is one
`gh` call from playgramapp when something needs it.

## Verification

- `./scripts/vet.sh` — both builds, the twelve concurrent checks, the PDF hashes.
- **Measure the claim.** Client `First Load JS` before and after, from the two builds' own
  output, recorded in the PR body. The ~90 kB figure is inherited from the commit that found
  the regression and has never been re-measured here; if the saving turns out to be small,
  that is worth knowing in the open rather than repeating.
- `/preview` on the CV and one Bible article, both themes — step 8 touches every internal
  link on the site, and the build only proves the pages render.
- Diff the re-rendered PDFs against `main`'s for identical printed markup.

## Open questions

Each is written with the recommendation already in force above, so silence resolves them.

1. **The CV route parse (step 4).**
   **(a) Hand-write the tuple parse — recommended.** It is the last thing keeping
   `shared/i18n/index.server-only.ts` alive, and fifteen literal lines read better than the
   nested tuple union.
   (b) Keep zod there. `cv-route-params.ts` is build-time only, so its zod costs no runtime
   bytes — but then `localeSchema` and the i18n server-only barrel both stay, for one caller.

2. **`SITE_ID` becoming readable from a client component (step 6).** The fence was zod's
   weight, not a design rule — but it did incidentally stop site-specific branching from
   leaking into client code.
   **(a) Accept it — recommended.** Which site a component is on is legitimate knowledge, and
   keeping it out is a review concern, not a bundler one.
   (b) Keep `SITE_ID` server-only and export only the derived helpers (`printedUrl`,
   `getAbsoluteUrl`). Costs a second barrel entry and buys a boundary nothing currently
   tests.

3. **Scope of this branch.** It already carries `8be92aa`, which step 8 reverts.
   **(a) One branch, reverting it here — recommended.** The revert is only legible next to
   the reason for it, and the squash gives `main` one subject either way.
   (b) Drop `8be92aa` from the branch first, so the diff shows only the new state. Cleaner
   diff, but loses the record of why the prop existed for two days.
