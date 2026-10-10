# Relay 1 — vendor the site fonts (PR #132)

## 1. Standing constraints

- The squash type is **not** a publishing type. Operator: «не, если это технически не фикс, то и не фикс. ну и плюс нам ведь действительно сейчас непринципиально всё это деплоить -- сейчас-то сайты уже работают». Keep `chore:`.
- Preload Cyrillic **only on Russian pages**. Operator: «да, только на русских».

## 2. The conversation

1. **Operator** (opening prompt, condensed past its first paragraph): «давай завендорим шрифты, чтобы сборка не ходила в сеть за ними.» Context given: `src/app/ui/root-layout.tsx` loaded Merriweather and JetBrains Mono via `next/font/google`; `./scripts/vet.sh` failed on 2026-10-10 at `build:lsa` because Turbopack could not fetch a Merriweather file from gstatic; deploy has the same dependency. Proposed `next/font/local` over `@fontsource/merriweather` and `@fontsource/jetbrains-mono`, same weights, subsets (Latin + Cyrillic), CSS variables; check PDF/OG renders and `PRINT_SOURCES` in `scripts/render-pdf.ts`; nothing else may hit Google Fonts at build.
   **Agent**: routed via `/task` → no plan. Implemented with fontsource packages + `next/font/local`, found the Turbopack trap (variable names the family after the JS binding), proved an offline build, screenshotted en/ru CV. knip then flagged the packages as unused (paths are strings); offered (1) commit the woff2 files and drop the deps, recommended, or (2) knip `ignoreDependencies`.
2. **Operator**: «1 звучит норм. к тому же мне ж нравится сейчас как выглядит -- а что если новая версия будет вылгядеть как comic sans :)»
   **Agent**: committed the files with OFL licences, dropped deps, vet green, ran `/polish`, opened draft PR #132 with squash type `fix:` (argued a non-publishing merge would let the font change ride silently).
3. **Operator**: «не, если это технически не фикс, то и не фикс. ну и плюс нам ведь действительно сейчас непринципиально всё это деплоить -- сейчас-то сайты уже работают»
   **Agent**: switched title, squash comment and file to `chore:`.
4. **Operator**: «кажется, это что-то для пятипроцентника»
   **Agent**: a subagent added an entry to `writing/notes/the-five-percent.md` ("the deploy switch read as the type's meaning"); committed.
5. **Operator**: quoted the squash paragraph about two calls per family and asked «а как с остальными? с арабским в Mithqal например, с греческим в Agios o skopos»
   **Agent**: Merriweather never had Arabic/Greek (Google served cyrillic, cyrillic-ext, latin, latin-ext, vietnamese; mono also greek), so those always came from the system. But dropping latin-ext/cyrillic-ext/vietnamese was a real regression (Mithqal transliteration ā ī ū ḥ ʿ, farewell pinyin, Tatar in minem-babay, yat, Vietnamese in river). Vendored every subset Google served.
6. **Operator** (mid-turn, with a screenshot of the Mithqal lyrics): «а это какой тогда?» — then «какие квадратики? я просто спрашивал, какой там шрифт? выглядит красиво»
   **Agent**: the Arabic is the system's serif fallback for `lang="ar"`, not a site font; which one depends on the operator's OS — check via DevTools → Computed → Rendered Fonts. Offered to pin it for `lang="ar"` if they name it. (The "boxes" were only in the container's own screenshot.) **Unanswered offer — operator has not named the font.**
7. **Operator**: «мне кажется или src/app/ui/fonts.ts у нас не особо DRY?»
   **Agent**: agreed; only Latin needs `next/font` (preload, sized fallback, variable). Moved the nine other subsets into a Sass `@each` loop in `src/app/styles/fonts.scss`; `fonts.ts` keeps two Latin calls and imports the sheet first so Latin stays last. Built CSS unchanged.
8. **Operator**: «это ничего плохого не сделает с загрузкой русскоязычных страниц?»
   **Agent**: measured — en CV loads only the 4 Latin files; ru CV adds Merriweather Cyrillic 400 + 700. Same as before the PR.
9. **Operator**: «> текст рисуется подогнанным Times и затем подменяется на Merriweather — какой это порядок задержки?»
   **Agent**: about one extra round trip after the CSS: ~50–150 ms on a good link, 300–600 ms on slow mobile; zero when cached. An estimate, offered a throttled measurement.
10. **Operator**: «можно ли сделать чтобы оба грузил сразу? это же может делаться параллельно, гонки тут нет?»
    **Agent**: yes, no race. Options: preload Cyrillic only on `/ru` pages (recommended) or everywhere (+~50 KB on English first visits). Only the weights actually used (400, 700).
11. **Operator**: «да, только на русских» and «> В обоих вариантах предзагружал бы только реально используемые начертания — это ок, только как мы узнаем, что что-то нужно поменять, если нм понадобится другое начертание?»
    **Agent**: proposed a vet check in Chromium (see Decisions). Measured all 213 Russian pages: 210 load exactly Merriweather Cyrillic 400 + 700; `/music/breathe/ru` adds mono Cyrillic; `/music/minem-babay/ru` and `/music/ultimate-abstraction/ru` add Merriweather Cyrillic-ext 400. Started implementing; paused mid-way (see State).
12. **Operator** (mid-turn): «замечание в сторону: заметил, что я несколько раз запрашиваю scope creep, а оценки для сессии всё не меняются. Давай поменяем и заведи тикет в muthur что агент должен быть готов это делать»
    **Agent**: revised the estimate (2.26 → 5.51 senior-hours) and filed https://github.com/vzakharov/muthur/issues/177.
13. **Operator** (mid-turn): «ещё вопрос, почему оценка меняется каким-то скриптом, а не просто Edit-ом? Как будто конфликтуем с собственными принципами. Там есть что-то такое, что обычный Edit не даст?»
    **Agent**: **not yet answered** — see Next step.

## 3. Intent

The build must never fetch fonts from the network, and the sites must look exactly as before (same faces, same subsets Google served). Russian pages should get their Cyrillic files as early as Latin ones, with a mechanism that tells us when the preload list goes stale. No deploy needed for this merge.

## 4. Decisions

- **Committed woff2 files, not fontsource deps** (beat: knip `ignoreDependencies`). Pins the faces; no network; no lint exemption.
- **Only Latin through `next/font/local`; other subsets as plain `@font-face` from a Sass loop** (beat: one `localFont` call per subset, 290 lines of literals). `next/font` takes only literals; non-Latin faces need none of its features.
- **Family name = the Latin call's const name** (`merriweather`, `jetbrainsMono`): Turbopack's CSS variable names the family after the JS binding, not the `declarations` font-family. CSS family names are case-insensitive.
- **Latin declared last** (`fonts.ts` imports `fonts.scss` before its calls): overlapping ranges resolve to the last-declared face, so the preloaded Latin file wins, as in Google's sheet.
- **Font files moved to `src/shared/ui/fonts/`** so the preload component in `shared/ui` can reference them without pointing up to the app layer. `PRINT_SOURCES` already hashes `src/shared/ui`, plus `src/app/styles/fonts.scss` and `src/app/ui/fonts.ts`.
- **Locale preload design**: `src/shared/ui/locale-fonts.tsx` exports `LocaleFonts({ locale })`, a `Record<Locale, string[]>` of URLs built with `new URL('./fonts/…woff2', import.meta.url).href`, preloaded via React 19 `preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })`. To be rendered by every localized page: `src/pages/cv/ui/cv-page.tsx` and the music pages `song-page.tsx`, `album-page.tsx`, `artist-page.tsx`, `music-page.tsx` (`src/pages/music/ui/`). `MusicLayout` cannot — a layout is never handed the locale (`.claude/rules/i18n.md`).
- **The check (`pnpm check:font-preloads`, to be written)**: per site's `out/`, for Russian pages (locale = last path segment per `addressLocale` in `src/shared/i18n/locales.ts`) the preloaded non-Latin font set must equal the **intersection** of non-Latin fonts loaded across all Russian pages; every other page must preload no non-Latin font. Fails on: a weight every ru page uses but nobody preloads, a preloaded file some ru page doesn't use, a ru page missing `LocaleFonts`. Content-specific extras (Tatar, mono) fall outside the intersection and are ignored. Preloads can be read statically from HTML; "loaded" needs Chromium (`scripts/lib/cdp.ts` `launch()`), ru pages only — ~31 s sequential for 213 pages, parallel tabs would cut it. Wire into `scripts/vet.sh` after the builds (it reads `apps/*/out`, like `check:mantine-styles`).
- **Squash type `chore:`** — standing constraint.

## 5. Errors and dead ends

- Picked `fix:` to force a deploy; operator: not a fix, deploy unnecessary. Five-percent entry written.
- Initially dropped latin-ext/cyrillic-ext/vietnamese — a regression caught by the operator's question about other scripts.
- Called the 11-call `fonts.ts` unavoidable because of `next/font`'s literal rule; operator flagged it as non-DRY; the Sass split fixed it.
- Did not revise the estimate across five scope additions until the operator pointed it out (muthur#177).
- `sed -i` / `cat >` in Bash are refused by a hook — use Edit/Write.

## 6. State

- Branch `claude/vendor-fonts`, head `b1967d7` (`wip: move the font files to shared/ui and add LocaleFonts`), pushed. Draft PR https://github.com/vzakharov/vovazakharov.com/pull/132, base `main`.
- **Unfinished in the WIP commit**: `LocaleFonts` is rendered by no page yet (knip will flag it); whether `new URL(…, import.meta.url)` under Turbopack emits the **same** `/_next/static/media/…woff2` URL as the Sass `url()` is **unverified** — if not, the preload double-downloads; `check:font-preloads` does not exist (the component's docstring already names it); vet not run on the WIP.
- Squash proposal: `docs/remove-before-merging/squash-message.md` and PR comment 6097372383 — needs a paragraph for the Russian preload once it lands; the PR body's Summary/QA too.
- No CI on PRs here; no subscriptions or check-ins.
- Estimate: this session 3.5 h senior developer ("next/font cannot range-split a family, so faces split between next/font and a Sass loop; Turbopack names the variable after the binding; measuring which subsets 213 Russian pages load needs a browser harness") + 1 h middle qa ("a font swap is checked by eye on both locales and offline, then across every subset the site's text uses — Arabic, Tatar, Vietnamese"). **Remainder for the successor**: 1.5 h senior developer — "locale preloads must match the CSS-emitted URLs, and a browser-driven vet check has to keep the preload list honest across 213 Russian pages".

## 7. Pointers

- `src/app/ui/fonts.ts` — the two Latin `next/font/local` calls and the family-name trap.
- `src/app/styles/fonts.scss` — every other subset, ranges written once.
- `src/shared/ui/locale-fonts.tsx` — the WIP preload component.
- `src/shared/ui/fonts/` — the 23 woff2 files (Fontsource 5.3.0) and two OFL licences.
- `scripts/render-pdf.ts` `PRINT_SOURCES`.
- `scripts/lib/cdp.ts` — headless Chromium over CDP; the measurement used `Target.createTarget` / `attachToTarget` (flatten), `Page.navigate`, wait `Page.loadEventFired`, then `Runtime.evaluate` of `document.fonts.ready.then(() => performance.getEntriesByType('resource')…)` with `awaitPromise`, serving `apps/vova/out` from a tiny `node:http` server (extensionless path → `.html`).
- `.claude/costs/estimate.py`, `.claude/costs/hooks/estimate-notice.sh`, `.claude/costs/CLAUDE.md` § "Human-hour estimates" — for the open question below.
- Predecessor transcript: https://claude.ai/code/session_013zKGUXqSuCHtmo91Dcn87Z

## 8. Next step

1. Set this session's estimate to the remainder above, then **answer the operator's open question** (msg 13), in Russian: why the estimate goes through `estimate.py` rather than an `Edit`. What the predecessor found reading it: `set` stamps the estimate with an `at` timestamp (of a row's copy and the pending one, the later wins — that is how a running session's update survives the `Stop` hook regenerating the row), validates every part's role and grade against `.claude/costs/rates.json` and the hours as numbers (`checked` in `lib/estimate.py`), resolves the session id from `CLAUDE_CODE_SESSION_ID`, and writes the pending copy to gitignored `tmp/estimates/<id>.json`, which the `Stop` hook folds into a row it rewrites wholly from the transcript each turn — so the committed row isn't a hand-maintained file an `Edit` would durably change. The Edit/Write principle is about reviewable diffs of source; this is a validated data entry into a generated record. Verify against `lib/estimate.py` / `lib/rows.py` before stating it.
2. Finish the Russian preload per § 4: verify the URL match on a vova build (`grep -o 'rel="preload"[^>]*' apps/vova/out/cv/cto/ru.html` vs the Sass-emitted names in the CSS), render `LocaleFonts` on the five page components, write `check:font-preloads` and wire it into `vet.sh` (and `package.json`), run `./scripts/vet.sh`, update the PR body and squash proposal (keep `chore:`), commit and push.
3. Still open from msg 6: the operator may name their Arabic system font; pinning it for `lang="ar"` was offered, not agreed.
