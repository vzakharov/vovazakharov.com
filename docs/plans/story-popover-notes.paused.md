# Popover notes in rendered prose

## Status — paused, waiting on #181

Steps 1–5 are done and polished (542f281 … 1e5b63a): the plugin and its tests,
`NotedSpan` in `shared/ui`, `ContentSpan`, the print rules, the docs. Checked by
eye on a throwaway note in `slime.md` (reverted): popover with an image at 1280
and 390, plain footnote in print. `pnpm build:vova` and `check:mantine-styles`
pass.

Left: step 6. Resume when #181 is merged — merge `main`, then in `invitation.md`
drop both `'aside'` images and the album links, and hang a note on «если бы он
стал-таки «Таркосом»» / “had it ended up as “Tarkos” after all” holding a short
line on the cover that never was and `![…](../assets/nostalgia-tarkos.jpg)` on
its own indented paragraph. Then `/preview` the song in both locales and refresh
the PR.

## Task

A footnote hung off a phrase — `[phrase][^label]` — in any prose the content
pipeline renders (a song's, album's or artist's story included) opens as the
same popover the lyrics use (`NotedSpan`), and its note may hold an image. On
paper it stays an ordinary footnote. Then, once PR #181 is on `main`,
`invitation.md`'s armadillo aside becomes such a note on «если бы он стал-таки
«Таркосом»» (and its English counterpart).

## What GFM emits today (checked in `tmp/gfm-probe.mts`)

`[phrase][^label]` → the text `[phrase]` (inline marks inside it stay elements),
then `<sup><a data-footnote-ref href="#user-content-fn-label">1</a></sup>`. The
definition becomes `<li id="user-content-fn-label">` in a trailing
`<section data-footnotes>`, its paragraphs ending in a backref `↩` link. A bare
`[^label]` is untouched by this work and stays a footnote on screen too.

## Steps

1. **`rehypeFootnoteNotes`** (`shared/content/plugins/`), right after
   `rehypeRaw` so the copied note passes through links, image dimensions and
   layout like the rest of the body:
   - for each `sup > a[data-footnote-ref]` whose preceding siblings end in a
     text `]` and reach back to an unmatched `[`, cut the brackets off and wrap
     phrase + note in `span[data-content-note]` → `[span(words), span(note)]`,
     the `sup` kept after it and marked `print-only`;
   - the note is the definition's paragraphs, backref dropped, joined by `br` —
     phrasing content only, since it sits inside the paragraph's `<p>`; any
     other block in a note fails the build naming the file;
   - each definition so carried gets `print-only`; the section too when all of
     its items are; every `li` gets an explicit `value`, so a screen list with
     items hidden keeps its numbers.
2. **`NotedSpan` → `shared/ui`**, with `.notedSpan`/`.note` moving to its own
   `noted-span.module.scss`. Its dropdown renders as a `span` (`renderRoot`),
   which is valid in a `<p>` and in the lyrics' `div`s alike; its content may be
   an image, sized to the popover. Print: the popover hidden, the words
   unmarked. `lyrics.tsx` imports it from `@/shared/ui`.
3. **`ContentSpan`** in `entities/document/ui`, mapped as `span` in
   `CONTENT_COMPONENTS`: a `data-content-note` span becomes `NotedSpan` with its
   two children as words and note; every other span renders as itself.
4. **Tests** beside the plugin: phrase with marks, bare ref untouched, the
   numbering/`print-only` marks, a note with an image, a block note failing.
5. **Docs**: `content.md` § "The four things a document can author" gains the
   note; `songs.md` gets a pointer from the lyrics' note paragraph (same syntax,
   story notes come from the pipeline). The `CONTENT_COMPONENTS` trap gains
   `span`.
6. **After #181 merges**: merge `main`, convert both locales of `invitation.md`,
   `/preview` the popover, `vet`.

## DRY notes

- `NotedSpan` is reused, not duplicated: it moves down a layer so the pipeline's
  renderer and the lyrics share one component and one stylesheet.
- The lyrics keep their own reader (`lyric-notes.ts`): they are cut into lines
  by the page, never compiled by the pipeline, so the rehype plugin cannot serve
  them. The two share the syntax, not the code — a common parser would have to
  abstract over a string reader and a hast walk with nothing in common but the
  regex.
- `replaceElements`/`visitElements` (`hast-elements.ts`) and `hastText` are
  reused for the walk; `print-only` is the global class `print.scss` already
  owns.
