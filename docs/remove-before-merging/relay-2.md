# Relay 2: Latin-first spelling for songs

## 1. Standing constraints

Same as relay 1: none beyond the repo's own rules. The Mithqal behaviour is driven by a flag, "а не "в mithqal вот так"".

## 2. The conversation

This session had no operator message. It started from `/relay take claude/latin-first-transliteration-ymni59`, which relay 1 seeded, and its only replies were progress lines. The conversation before that is in `relay-1.md` § 2.

## 3. Intent

Unchanged from `relay-1.md` § 3.

## 4. Decisions

`relay-1.md` § 4 has the decisions settled with the operator. This session added three, which are recorded in the plan's `## Progress` § "Deviations":

- **`romanize.ts` and `spelling.ts` live in `src/shared/music-catalogue/`** and are exported from its barrel. `shared/content/feeds.ts` needs them, and `shared` cannot import `pages`. `songTitle(frontmatter, locale)` resolves a song's title to a `Spelled`: the locale's own name if it has one, otherwise the song's title with `titleLatin` and `keepsScript`. `defaultSpelling` gives the string that metadata, feeds and Media Session use.
- **`TitleGloss` is `{ translation }`, and `translation` is required.**
- **The head script, the storage key and the client hook go in `src/shared/lib/script-preference.ts`.** That file has not been written yet. Two reasons: the root layout needs the head script and the key, and the preference applies across the whole site.
- **Title in Latin mode under `keepsScript`:** the intended rendering is the original script followed by the italic Latin (`مِثْقَال` _Mithqāl_). Original mode shows the script alone. The operator never confirmed this for titles; it is the agent's reading of «текст на любом другом скрипте остаётся».

## 5. Errors and dead ends

None. The PreToolUse hook rejects `cat`/`head` and heredoc writes; use Read and Write, or put `BATCH_EDIT=1` in front for a deliberate batch.

## 6. State

- **Branch:** `claude/latin-first-transliteration-ymni59`, pushed.
- **Draft PR:** #148, https://github.com/vzakharov/vovazakharov.com/pull/148.
- **Plan:** `docs/plans/latin-first-transliteration.paused.md`. Its `## Progress` section says steps 1–4 are done (061138c, 53bc142) and step 5 is next.
- **The tree does not type-check** until steps 5–10 land, as the plan says.
- **Nothing is running.**
- **Estimate:**
  - This session: 1.5 h senior developer and 0.5 h middle copywriter.
  - Remainder handed on: 7.5 h senior developer (steps 5–12: lyrics data, `<Spelling>` and the no-flash preference, every name surface, the title switch and tip, metadata and feeds, messages), 1 h middle qa (both locales, both modes, fresh and stored preference), and 0.5 h middle copywriter (the tip copy in two languages).

## 7. Pointers

- `docs/plans/latin-first-transliteration.paused.md` holds steps 5–12.
- `src/shared/music-catalogue/spelling.ts` (+ `.test.ts`) and `romanize.ts` are done.
- The files still on the old shape are listed in `relay-1.md` § 7. These need fixing: `src/pages/music/lib/{song-text,songs,title-gloss,projects,albums,player-state}.ts` and the UI files that read `transliterated` or `gloss.transliteration`.
- Predecessors' transcripts: this session is https://claude.ai/code/session_01AHsevYu798up7h9VTmiWGN, and relay 1's is https://claude.ai/code/session_01DGp7py5xxyXaFxhwa5kzy8.

## 8. Next step

Resume the paused plan with `/go` from its Step 1, starting at plan step 5 (lyrics data). The go-ahead was given in relay 1's session: «давай начинать».
