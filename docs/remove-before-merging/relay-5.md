# Relay 5: Latin-first spelling for songs

## 1. Standing constraints

Same as relays 1–4: none beyond the repo's own rules. Mithqal's behaviour comes from a flag, «а не "в mithqal вот так"».

## 2. The conversation

This session started from `/relay take claude/latin-first-transliteration-ymni59`. Its first reply asked the open lint question: may the head script in `root-layout.tsx` carry a point-of-use suppression of `@eslint-react/dom-no-dangerously-set-innerhtml`?

Vova's one message, sent mid-turn, quoted a restatement of that question and then asked:

> ох.. а какие ещё есть варианты?

The reply listed three other options and recommended the first:

1. **Backtick strings in the script** (recommended). React escapes only `" & ' < >` in a `<script>` child, so a script whose strings use backticks renders as `<script>{SCRIPT_PREFERENCE_SCRIPT}</script>`, with no `dangerouslySetInnerHTML` and no suppression. A unit test asserting the string holds none of those five characters stops a later `'` from silently breaking it.
2. **A static `public/script-preference.js`** loaded by `<script src>`: one more render-blocking request per page, and a copy in each of the four sites' `public/`.
3. **`next/script` with `beforeInteractive`**: the App Router runs it from Next's bootstrap, with no guarantee it runs before first paint, which is the flash the head script exists to prevent.

It said option 1 would be done once he agreed. **No answer had arrived when this session paused.**

## 3. Intent

Unchanged from `relay-1.md` § 3.

## 4. Decisions

The plan's `## Progress` records them. This session added:

- **Closing the first-visit tip is `choose('latin')`.** That is how "closing is remembered" works without a flag of its own: once a choice is stored, the first-visit tip never opens again.
- **`Lyrics` picks its mode through `data-spelling` too**, like `<Spelling>`. A switch therefore re-renders no lyric, and hydration matches the server's HTML. A `keepsScript` song's romanized line is `.transliteration` (block, smaller, faint) with `data-spelling="latin"`. Any other song's Latin line replaces the original line at full size.
- **The title is a switch wherever the title or the words have a Latin spelling** (`switchable` in `song-page.tsx`).
- **`useScriptPreference` lives in `shared/lib/use-script-preference.ts`.** The root layout is a server component and imports `SCRIPT_PREFERENCE_SCRIPT`; with the hook in the same module, `next build` failed. That bug dates from step 6, and earlier sessions never ran a build.

## 5. Errors and dead ends

- Once, vet's eslint crashed with ENOENT on `.claude/costs/sessions/test-*`, because the costs test deletes its temp directory while eslint walks the tree. The next run passed. It is not this branch's bug.
- There is no Playwright package in the repo. The previews drive Chromium over the DevTools Protocol, as `/preview` says (`tmp/preview-switch.mjs`, gitignored).

## 6. State

- **Branch:** `claude/latin-first-transliteration-ymni59`, pushed. Head is 6f186b0 plus this summary's commit.
- **Draft PR:** #148, base `main`, MERGEABLE/CLEAN at the start of this session.
- **Plan:** `docs/plans/latin-first-transliteration.paused.md`. All 12 steps are done. What remains is the open question, then `/go` Step 3 (`/polish`, never yet run on this branch) and Step 4 (`/pr`).
- **Vet:** green except the one eslint error the open question is about.
- **Nothing is running.**
- **Estimate:** this session, 2.5 h senior developer + 0.5 h middle QA + 0.5 h middle copywriter. Remainder handed on: 1 h senior developer (the head-script fix once Vova answers, and the polish passes over the whole branch) + 0.5 h middle QA (the PR's checklist across both locales and modes).

## 7. Pointers

- `docs/plans/latin-first-transliteration.paused.md`: `## Progress` and its **Next** line.
- `src/pages/music/ui/script-switch.tsx`, `src/pages/music/ui/lyrics.tsx`, `src/shared/lib/script-preference.ts` + `use-script-preference.ts`, `src/app/ui/root-layout.tsx` (the head script, lines ~59–61).
- Transcripts: this session https://claude.ai/code/session_01VEkkMrxg3iyo1H6ezvwyM3; earlier relays are listed in `relay-4.md` § 7.

## 8. Next step

Vova's latest request was «а какие ещё есть варианты?», and it has been answered; his choice among them is pending. Resume the paused plan with `/go` from its Step 1 (the go-ahead from relay 1: «давай начинать»). Run Step 3 `/polish` and Step 4 `/pr`, neither of which waits on the answer. Remind Vova of the choice in a line, recommending option 1. Once he answers, implement the option he picks; option 1 is the one the plan's Next line spells out.
