# Майя's English site — Vova's review round

Vova's review on PR #208 (export `docs/pr/208/pr.md`, committed), and his chat
message of 26 October: «спасибо, оставил ряд комментов. playgram -- ок.
whispering -- да, можно поменять». This is `/handle #208`'s review lane,
planless work recorded here because the session paused at its context budget.

## Decisions (Майя's, from Vova's words — no question left open)

- **T01, captions by key, not by wording** — Vova: «не уверен что мне нравится
  этот gettext-ish подход, я бы лучше держал какие-то ключи/айдишники, и
  подменял их в обеих версиях». So: the drawing is authored once as a template,
  `assets/<name>.svg`, every translatable wording in it a `{{key}}` placeholder
  — in a `<text>` and in the root `aria-label` alike — and everything else
  literal (Latin names, the typeball's letters: `translate="no"` goes away).
  Each language's post carries its own
  `captions: { ./assets/<name>.svg: { <key>: <wording> } }` — Russian in
  `.ru.md`, English in `.en.md` — and `pnpm content:drawings:maya` writes
  `<name>.ru.svg` and `<name>.en.svg` from the template, substituting in both.
  `--check` fails on a placeholder a language's dictionary lacks, an entry no
  placeholder uses, and a template no post captions. The posts' images point at
  their own language's drawing.
- **T02, both languages suffixed** — Vova: «а можно это сделать
  distant-elver.en.md? кажется, для двуязычных мдшек так будет правильнее». Yes:
  `<slug>.ru.md` and `<slug>.en.md`, which also matches the routes
  (`/blog/<slug>/ru`, `/blog/<slug>/en`); the bare `/blog/<slug>` stays the
  English page's alias, and no file sits at `/blog/<slug>.md`. Which file is the
  original stays the stamp's to say (`translatedFrom` on the `.en.md`). Reaches
  `locale-suffix.ts` (an original is a non-default locale suffix; its
  translation is the same stem with the default locale's suffix),
  `translations.ts`, `documents.ts` (`parseFileName`, `documentFileName`, the
  `.md` link), `scripts/stamp-translation.ts`, `scripts/lib/read-collection.ts`,
  `scripts/translate-drawings.ts`, their tests, and `content.md` § "The locale
  seam", `personas/maya/wander.md` (the translator writes `<slug>.en.md`).
- **T03, «P.S.» in both languages** — Vova: «P.S. (в обоих языках)?», on the
  typewriter post's «Потом» / “Afterward” heading. Майя edits her `.ru.md`; the
  English heading becomes “P.S.” too; restamp.
- **Title** — the typewriter's English title becomes “The whispering
  typewriter”: the post's `# ` heading, `en.json`'s `whisper.title`, and any
  drawing caption carrying it. The slug follows it, `whispering-typewriter` —
  Vova, in the session, against keeping the published address: «не переживай,
  никто не читал)».
- **Playgram's card** — stays the chart (Vova: «playgram -- ок»).
- **T04, the squash record's focus** — Vova: «что-то прогулке здесь очень мало
  места посвящено -- я б скорее её делал в фокусе, а перевод -- это важный, но
  ride-along». Done in 3454416, posted to the proposal comment and the PR title
  (`feat: Майя's walk on fungi with two names, and her site in English`) on
  Vova's «разрешаю обновить сквош-комментарий». A later refresh keeps the walk
  first and the English site a ride-along.

## Done

- T04's file, 3454416.
- T01, T02, T03, the title and slug: 1664c44, the card 0929cd6; docs e71f7ce;
  `/polish` d7ce269, 73d6987. Every check in the list passes.

## Left

- The PR body, then a reply on each of T01–T04 with the commit SHA (bare), per
  CLAUDE.md § "GitHub comments"; threads stay open.
