# Relay 2 — vendor the site fonts (PR #132)

Written without a successor: the session idled through the cache keepalive's last wake. `relay-1.md` holds everything before this session.

## 1. Standing constraints

- The squash type is **not** a publishing type. Operator (relay 1): «не, если это технически не фикс, то и не фикс. ну и плюс нам ведь действительно сейчас непринципиально всё это деплоить -- сейчас-то сайты уже работают». Keep `chore:`.
- Preload Cyrillic **only on Russian pages**. Operator (relay 1): «да, только на русских».

## 2. The conversation

0. **Pickup** (`/relay take claude/vendor-fonts`). A forward from the predecessor said msg 13 of relay 1 (why the estimate goes through `estimate.py`) was already answered there; verified against its transcript, skipped. **Agent**: set the remainder estimate; rendered `LocaleFonts` on `CvPage` and the four music pages (`SongPage`, `AlbumPage`, `ArtistPage`, `MusicPage`); confirmed the component's `new URL()` and the Sass `url()` emit the identical hashed file (no double download); wrote `pnpm check:font-preloads` and wired it into vet; it found that `/cv/<variant>/ru/profile` counts as English under `addressLocale` (locale not last), so the check takes the last segment naming a locale. Extracted the `apps/*/out` walk into `scripts/lib/built-sites.ts`. Vet green except a load-sensitive race in `.claude/keepalive/test_keepalive.py` (reads `sess.json` mid-write; passes alone in 2 s vs 17 s under vet). Committed bbec084, updated PR body and squash comment.
1. **Operator**: «блин... что-то тема с сованием <LocaleFonts везде смущает. во-первых, WET; но важнее -- можно банально забыть»
   **Agent**: noted vet already catches a forgotten page; proposed an inline script in the root layout reading `location.pathname` and injecting the preloads (one place, never forgotten), cost: inline JS on every page. Asked to proceed.
2. **Operator**: «звучит одновременно и элегантно и хачно. что из этого больше? :)»
   **Agent**: ~60/40 elegant; the hack is deciding at runtime a fact known at build time, because Next doesn't tell the root layout its page — visible as the address rule living twice (TS for the check, a string in the script). A post-build HTML rewrite would be hackier still.
3. **Operator**: «а при сборке мы же знаем, какую страницу собираем -- почему там нельзя "подсунуть"?»
   **Agent**: only the page knows at build time; a layout is a shared shell kept across client navigations, so Next never hands it the segments below. Proposed **variant 2**: move `LocaleFonts` into what each section cannot omit — `MusicNav` (on all four music page kinds, already takes `locale`) and `CvPage` (already one place) — two call sites, no JS, scanner-visible. Recommended it over the script.
4. **Operator**: «а ещё раз, как это всё работало до этого пиара? почему тогда приложение знало что и когда грузить?»
   **Agent**: it never knew; the browser decides via each `@font-face`'s `unicode-range`, fetching Cyrillic only on meeting a Cyrillic letter. `main` had `subsets: ['latin']`, so only Latin was preloaded and Russian pages always had the one-round-trip swap; the preload is a new optimization from relay-1 msg 10. Put three options: (1) no preload, as before; (2) `MusicNav` + `CvPage`; (3) layout script. Recommended 2 if the swap is noticeable, 1 if not.
5. **Operator**: «в случае 2 по-прежнему vet будет падать если мы случайно положим куда-то локализуемое, а на обёртку не повесим метакомпонент?»
   **Agent**: yes — the check reads built HTML and keys language off the address, so a new `/ru` page without the preload fails with "does not preload …, which every ru page uses" (unit test `reports a file every page uses and one page does not preload`; never exercised on a real build with a page deliberately left out). Blind spots: a localized page without `/ru` in its address (already against `.claude/rules/i18n.md`), and a Russian page with no Cyrillic, which fails loudly the other way. Asked «Перевожу на вариант 2?» — **unanswered**.

## 3. Intent

Builds never fetch fonts; the sites look as before. Russian pages may get Cyrillic early, but the operator wants that without a per-page component someone can forget, and is weighing whether the optimization is worth any mechanism at all.

## 4. Decisions

- Relay 1's decisions stand (committed woff2, Latin-only `next/font/local`, Sass loop for the rest, family name = the const name, files in `src/shared/ui/fonts/`).
- **Language of a built page = the last address segment naming a locale** (`pageLocale` in `scripts/check-font-preloads.ts`), beating `addressLocale`, which reads `/cv/cto/ru/profile` as English.
- **Used fonts are read from `document.fonts` faces with status `loaded`**, matched to `CSSFontFaceRule`s by family/style/weight/unicode-range, not from resource timing — a preloaded file shows up as fetched whether used or not. An unmatched face fails the run.
- **The layout preloads are the intersection over pages carrying any preload** — the not-found pages carry none.
- **Pending, not decided**: variant 1 / 2 / 3 of § 2 msg 4. Agent recommends 2.

## 5. Errors and dead ends

- First run took the shared set over all pages; `/404` and `/_not-found` (no preloads) made it empty.
- `unicorn/relative-url-style` made the `new URL()` specifiers drop `./`; re-verified the emitted URLs still match after the change.

## 6. State

- Branch `claude/vendor-fonts`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/132, base `main`. Last code commit bbec084; this summary's commit follows the cost rows.
- Code: `LocaleFonts` rendered by the five page components; `check:font-preloads` in `scripts/vet.sh` and `.claude/rules/stack.md`. Vet green apart from the keepalive race (not this branch's code).
- PR body and squash comment 6097372383 describe the five-page version; variant 2 would change only the "rendered by" wording.
- `/polish` not yet run on this session's diff (`/finalize` runs it).
- No CI on PRs; no subscriptions or check-ins.
- Estimate: this session 1.25 h senior developer (preload + browser check). **Remainder**: 0.5 h senior developer — "moving the preload to the one component each localized section cannot omit, and re-proving the check on a real build with a page deliberately left out".

## 7. Pointers

- `src/shared/ui/locale-fonts.tsx` — `LOCALE_FONTS` and `LocaleFonts`.
- `src/pages/music/ui/music-nav.tsx` — variant 2's home for the music pages; `src/pages/cv/ui/cv-page.tsx` — the CV's.
- `scripts/check-font-preloads.ts`, `scripts/lib/font-preloads.ts` (+ `.test.ts`), `scripts/lib/built-sites.ts`.
- `relay-1.md` for everything earlier.
- This session's transcript: https://claude.ai/code/session_018z5Pg9qko2KLXemqTn6fiP

## 8. Next step

Wait for the operator: their answer to «Перевожу на вариант 2?» (§ 2 msg 5). On yes — move `<LocaleFonts>` from the four music page components into `MusicNav`, keep it in `CvPage`, rebuild vova, prove the check fails with it removed from one page and passes with it restored, update the PR body's "rendered by" line, vet, commit, push. On variant 1 — remove `LocaleFonts`, `check:font-preloads` and their vet/stack.md wiring, keep `built-sites.ts`, and drop the preload paragraph from the PR body and squash proposal.

Still open from relay 1: the operator may name their Arabic system font for `lang="ar"`; pinning it was offered, not agreed.
