# The spelling switch: where it shows, and which lyric lines it switches

## The task as asked

The `EN / Abc` spelling switch shows on the radio for songs with nothing to
transliterate (Vova, in the session). Follow-ups widened it:

1. Each page offers the switch by its own names — index tab, artist, album, song
   — and, regardless of the page, while the player bar shows a track that has
   names in another script.
2. Replace the "most of the letters" lyric criterion with a deterministic one: a
   line gets a Latin spelling where it has a letter the reader may not read;
   Russian goes by rule, any other language from an authored section — and for a
   secondary language that section holds **only the lines with its letters**, in
   order, so nobody rewrites the whole text. A line with no source fails the
   build. Vova chose that (option 1) and asked for the romanizations to be
   written for Artemis' Greek lines and Farewell's Chinese lines.
3. "И тогда нужно из подсказок соответствующих транслитерацию убрать, раз она
   будет нативно": the footnotes that carry a pronunciation lose it.

## Done

- d9a44dc — the radio's chip follows the song on air (`OnAirScriptChip`,
  `useClock`, `CurrentChip` in `shared/ui`).
- e5746ab — the chip falls back from the page's sample to the playing track's
  (`PlayerTrack.samples`, `ScriptChip` renders the plain chip when neither has
  one). Verified in a built site: Divine Discontent alone is `EN`, with После
  нас playing it is `EN / Abc`.
- The commit carrying this file — part 2's code, unverified past `tsc`:
  `wordsInLatin` in `src/pages/music/lib/transliteration.ts` (per-line, the
  language's script from `Intl.Locale(...).maximize()`, Hans/Hant → Han),
  `song-text.ts` calling it, `mostlyNeedsLatin` removed, a Han sample `一二三`
  in `SCRIPT_SAMPLES`, `Transliteration` entries now `string | undefined`.

## Left

- Run `pnpm exec tsc --noEmit -p apps/vova/tsconfig.json` and eslint on
  `src/pages/music src/shared`; `romanizeStanzas` is gone, so
  `transliteration.test.ts` still imports it — replace that block with tests for
  `wordsInLatin`: Russian by rule on `en` and nothing on `ru`; a secondary
  section consumed in order; too few / too many lines; a line in an unlisted
  script; a mixed entry romanized line by line; the main language's full section
  filtered per locale.
- Content, `apps/vova/public/music/songs/`:
  - `farewell.md`: `language: [ru, zh]`; a `<!-- lyrics:zh-latn -->` section
    with the three pinyin lines (taken from the `[^wangwei-en]` note); drop the
    readings from `[^wangwei-ru]` (Palladius) and `[^wangwei-en]` (pinyin),
    keeping the attribution and translation. The `lyrics:en` crib repeats the
    Chinese lines; the section is consumed only by the sung column, so check the
    crib needs nothing.
  - `artemis.md` (`[en, el]`): a `<!-- lyrics:el-latn -->` section, one line per
    words line with Greek letters, in order (7 lines: `Είμαι η Άρτεμις…`,
    `Hello, dear, ετοιμάσου`, `I’m Άρτεμις, I’ve come for you`, `Άγιος…`,
    `Θήραμα…`, `Ήρθα για σένα…` ×2), each the whole line in Latin (the English
    kept), from the `-en` notes' “pronounced” readings. Drop “pronounced _…_”
    from the `-en` notes; the `-ru` notes are nothing but a Cyrillic reading, so
    they and their markers go — tell Vova that the Russian page loses them.
- The song page's sample (`song-page.tsx`) still reads `wordsText` of every line
  when a transliteration exists; fine, but check Farewell `ru` samples `一二三`.
- `pnpm build:vova`, then look at Farewell and Artemis in both locales and both
  spellings (`tmp/preview/serve.mjs apps/vova/out` serves the export on 4321).
- `.claude/rules/songs.md` § "Body", the paragraph opening **Words mostly in a
  script the reader may not read** — rewrite it for the per-line rule and the
  secondary-language section.
- `/polish`, then refresh the PR body and squash proposal
  (`docs/remove-before-merging/squash-message.md`) for parts 2 and 3.
