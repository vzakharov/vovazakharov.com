# Relay 1 — the spelling switch and per-line lyric romanization

## 1. Standing constraints

None stated by the operator beyond the repo's own rules.

## 2. The conversation

**Operator (with a screenshot of the radio showing `EN / Abc` on "Alive" by
GENERATED):** «переключатель транслитерации (`[EN / Abc]`) показывается (по
крайней мере в радио) даже в песнях, где транслитерировать нечего. При этом на
самих страницах песен правильно: добавка про транслитерация появляется только
тогда, когда в песнях есть другой скрипт»

**Agent:** Routed via `/task` → planless `/go`. Cause: `radio-page.tsx` sampled
the script of every song the station plays. Fix (d9a44dc): a sample per song,
the chip following the song on air in the browser. Verified by stubbing
`Date.now` in headless Chromium over 16 songs. `/polish` (629c4d6), draft
[PR #156](https://github.com/vzakharov/vovazakharov.com/pull/156), squash
proposal posted. The muthur sync offer was made; do not make it again.

**Operator:** «мне кажется мы как-то не так смотрим. на каждой странице нужно
смотреть, что там может быть со скриптом, например главная: есть ли исполнители
с другим скриптом (ответ да) исполнитель: есть ли такие альбомы или песни
(потому что все песни исполнителя там перечисляются под альбомами) альбом: есть
ли такие песни на альбоме и отдельно, вне зависимости от страницы, играет ли
сейчас такая песня (потому что она отображается в контролах снизу) я хочу
чего-то слишком мудрёного?»

**Agent:** Not too clever: index, artist, album and song pages already sample
their own names; only the radio was wrong. The missing piece is the player bar —
proposed falling back to the playing track's sample, page winning when both
have one. Asked whether to add it to PR #156.

**Operator:** «> а текст только если у него есть транслитерация. этот критерий
что значит?»

**Agent:** Explained `mostlyNeedsLatin`: lyrics get a Latin version only where
more than half their letters are unreadable to the locale's reader; names use
`needsLatin` (any letter).

**Operator:** «кажется какой-то на-коленках критерий про "половину текста"; мне
кажется у нас можно придумать более детерминированный, учитывая что мы знаем,
что и где и как пишем (например, если бы мы в farewell написали transliterated
вариант для этих китайских строк, то наверное мы могли бы задать какой-то
переключатель, чтобы там он тоже работал -- а не какое-то произвольное
"половина слов") добавить плеер - да, но с тем что сверху тоже надо разобраться
и тоже уже заодно тогда»

**Agent:** Implemented the player part (e5746ab), verified (Divine Discontent
alone `EN`; with После нас playing `EN / Abc`). Proposed the per-line rule: a
line gets Latin where it has a letter the reader may not read; Russian by rule;
anything else from an authored section. Asked what to do with a line that has
no source: 1. fail the build and write the romanizations for Artemis' Greek and
Farewell's Chinese lines (recommended), or 2. leave the line as written.

**Operator:** «ну давай напишем латиницу там и там. вопрос только, нам ВЕСЬ
текст придётся переписывать, или есть какой-то маркап, который позволит сделать
это для отдельных строчек (DRY)?»

**Agent (mid-turn, interrupted by the pause):** No whole-text rewrite: a
secondary language's `lyrics:<lang>-latn` section holds only the lines with that
language's letters, in order. Started implementing.

**Operator (mid-turn):** «и тогда нужно из подсказок соответствующих
транслитерацию убрать, раз она будет нативно»

**Agent:** Accepted; noted that Farewell's notes lose their readings (Palladius
in `-ru`, pinyin in `-en`) and Artemis' `-ru` notes are nothing but a Cyrillic
reading, so they go entirely. The session then hit the 300k context pause and
relayed. That answer to the DRY question was not yet delivered to the operator
in a finished reply — the successor's first reply should give it.

## 3. Intent

The spelling switch appears exactly where it switches something on screen: the
page's own names, the song on air on the radio, the track in the player bar,
and lyric lines that have a Latin spelling. Lyric Latin is decided per line,
deterministically, from what is authored — no thresholds.

## 4. Decisions

- **Page wins over the player** when both have a sample: the page's names are
  most of the screen.
- **Per-line rule** replaces `mostlyNeedsLatin` (removed): a line gets Latin
  where `needsLatin(line, locale)`. Sources: the main language's full
  `-latn` section (line-aligned, as for mithqal, babay-minem, in-the-end) wins
  for every line; otherwise each line with a non-Latin language's letters takes
  the next line of that language's own `lyrics:<lang>-latn` section (consumed in
  order, counted regardless of locale), else Russian by rule, else the build
  fails. A line with letters of no listed language fails ("name the language in
  its `language`"). A line mixing two languages' letters fails.
- **Option 1** (fail the build) over leaving lines unromanized — operator chose
  it: «ну давай напишем латиницу там и там».
- **Footnote readings go** where the line is now romanized natively — operator's
  ask.
- A language's script comes from `Intl.Locale(lang).maximize().script`;
  Hans/Hant map to Unicode's `Han`.

## 5. Errors and dead ends

- `pkill -f tmp/preview/serve.mjs` inside a compound Bash command killed the
  shell itself (exit 144); kill the server in a call of its own.
- The first `/listen/i` regex in `tmp/preview/playing.mjs` had matched nothing
  (the button's text is "Listen"); fixed.

## 6. State

- Branch `claude/radio-transliteration-toggle-23la56`, head 0d00854 (pushed),
  draft PR #156, squash proposal posted as a comment and tracked in
  `docs/remove-before-merging/squash-message.md` — it describes only the radio
  fix and needs re-syncing.
- Plan: `docs/plans/script-switch.paused.md` — what is done and the exact list
  of what is left. Resume it.
- 0d00854 is a `wip:` commit: `tsc` passed after the last edit, but
  `transliteration.test.ts` still imports the removed `romanizeStanzas`, and
  nothing past `tsc` has run.
- Estimate: this session 4 h senior developer ("the switch's rule spans
  build-time pages, a client player and a clock-driven radio, each verified by
  driving a built site; the per-line lyric rule's code is drafted") + 0.5 h
  middle qa ("the chip depends on what is on air and what is playing…").
  Remainder for the successor: 2.5 h senior developer — the per-line rule's
  tests, the two songs' romanizations and notes, songs.md — + 0.5 h middle qa —
  Farewell and Artemis in both locales and both spellings.
- Nothing running: no CI on PRs, no subscription, no check-in.

## 7. Pointers

- `src/pages/music/lib/transliteration.ts` — `wordsInLatin`, `romanizeLine`,
  `romanizeLines`, `forReader`.
- `src/pages/music/lib/song-text.ts` — `songLyrics` calls it.
- `src/pages/music/ui/script-chip.tsx`, `on-air-script-chip.tsx`,
  `locale-chips.tsx`, `use-clock.ts`; `src/pages/music/lib/songs.ts`
  (`PlayerTrack.samples`).
- `apps/vova/public/music/songs/farewell.md`, `artemis.md`.
- `.claude/rules/songs.md` § "Body" — the paragraph to rewrite.
- Preview scripts (gitignored, recreate if missing): `tmp/preview/serve.mjs`
  (serves `apps/vova/out` on 4321 with `.html` fallback), `radio.mjs`
  (walks the clock), `playing.mjs` (plays a song, navigates with
  `window.next.router.push`).
- Predecessor transcript: https://claude.ai/code/session_01FmmxvjwmNLNFj9PSoCNjHz

## 8. Next step

Resume the paused plan `docs/plans/script-switch.paused.md` per `/go` Step 1.
The first reply answers the operator's open question — «нам ВЕСЬ текст придётся
переписывать, или есть какой-то маркап…» — with the secondary-language section
(only the lines with that language's letters, in order) and a two-line example
from Farewell, then carries on with the plan's "Left" list.
