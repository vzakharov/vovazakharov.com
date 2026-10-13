# Relay 6: Latin-first spelling for songs (parked)

## 1. Standing constraints

Same as relays 1–5: none beyond the repo's own rules. Mithqal's behaviour comes from a flag, «а не "в mithqal вот так"».

## 2. The conversation

Vova sent no message in this session. It started from `/relay take claude/latin-first-transliteration-ymni59`, and every later turn was a subagent hand-back or a cache keepalive wake. The predecessor's open question (relay 5 § 2: how to clear `@eslint-react/dom-no-dangerously-set-innerhtml` on the head script, after «ох.. а какие ещё есть варианты?») was still unanswered.

The agent took the predecessor's recommended option 1 rather than block on it (Vova's operator entry: parallelizable questions are asked, not waited on), then finished `/go` and reported:

- option 1 done in 23b3988, with an offer to redo it as another option if he prefers;
- `/dry` (8cfbb72) and `/tend-prose` (699b6e8) done; `.claude/rules/songs.md` rewritten, flagged as worth his read;
- PR #148's body refreshed; vet not run (that is `/finalize`);
- two `/dry` calls put to him as numbered questions, no answer yet (§ 8).

## 3. Intent

Unchanged from `relay-1.md` § 3.

## 4. Decisions

- **The head script is a plain `<script>{SCRIPT_PREFERENCE_SCRIPT}</script>` child**, its strings backtick-quoted, because React HTML-escapes a script child. `src/shared/lib/script-preference.test.ts` pins that it holds none of `" & ' < >`. The built `apps/vova/out/index.html` was checked: it carries the script verbatim. No lint suppression.
- **`/dry` gave the script preference one home for its values**: `SCRIPTS` / `isScript` (via `isOneOf`) and `SCRIPT_ATTRIBUTE` in `script-preference.ts`.
- **`/tend-prose` rewrote `.claude/rules/songs.md`**, which plan step 3 had asked for and earlier sessions skipped, and moved the `keepsScript` rationale there alone.

## 5. Errors and dead ends

- The first `pnpm build:vova` failed on `next/font/google` fetches (network), the rerun passed. Not this branch's bug.
- A subagent's commit raced the cost hook's commit once; resolved without force-push.

## 6. State

- **Branch:** `claude/latin-first-transliteration-ymni59`, pushed; head 4c486d0 before this summary's commit.
- **Draft PR:** #148, base `main`, MERGEABLE/CLEAN; title `feat(vova): Latin-first spelling with the song title as the script switch`; body refreshed with the QA checklist; squash proposal comment current (`docs/remove-before-merging/squash-message.md`).
- **Plan:** `docs/plans/latin-first-transliteration.completed.md`. `/go` is done; the branch awaits `/finalize`.
- **Vet:** not run this session.
- **Nothing is running**; the keepalive stopped at its last wake.
- **Estimate:** this session, 1 h senior developer + 0.5 h middle QA (unchanged; no remainder handed on beyond `/finalize`'s own run).

## 7. Pointers

- `src/shared/lib/script-preference.ts` + `.test.ts`, `src/app/ui/root-layout.tsx`, `.claude/rules/songs.md`.
- `albumTitle` in `src/pages/music/lib/albums.ts`, `projectName` in `src/pages/music/lib/projects.ts`; `track-button.tsx` and `use-audio-player.ts` (the two `/dry` questions).
- Transcripts: this session https://claude.ai/code/session_01831ynLgir5kRLAnKuU7W5M; earlier ones in `relay-5.md` § 7 and back.

## 8. Next step

Wait for Vova. Pending from him:

1. Whether option 1 for the head script stands (it is done; he may want another).
2. `/dry` question 1: extract `spellCatalogueName(text, locale)` into `projects.ts` for `albumTitle` and `projectName` to share. The agent recommends yes.
3. `/dry` question 2: a `useSpelledText(spelled)` hook for `track-button.tsx` and `use-audio-player.ts`. The agent recommends no.

Then `/finalize` (or `finalize and merge`) when he asks for it.
