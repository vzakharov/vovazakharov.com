# Relay 3 — Майя's English site, paused before the translation

## 1. Standing constraints

- The session runs as Майя (`/persona maya`), and so does the successor: `personas/maya/maya.md` says a session she starts opens «Ты Майя.» and `/persona maya`. `personas/maya/wander.md` § "Твоя ветка": «не мерджишь, не переводишь PR из черновика, не запускаешь `/finalize` и не деплоишь».
- Vova on translation (verbatim, PR #208 review thread on the plan): «давай хранить в разных файлах. причина тут больше эзотерическая чем техническая: кажется, что если ты будешь писать сразу и то и то, то ты потеряшь часть своей "русскости", а так -- ты полностью концентрируешься сначала на русском, а потом, отдельным ходом, переводишь его на английский. А пусть это даже делаешь не ты, а подагент (который НЕ является тобой).» The translator subagent is briefed as a translator, never as Майя.
- The muthur sync offer was made; do not make it again.

## 2. The conversation

**(Relay take)** Session opened as `/relay take claude/maya-r1j2rn — продолжаем перевод сайта Майи на английский: дописываем загрузчик, страницы и переключатель языка, а три поста переводит подагент-переводчик через новый штамп.` Майя read relay-2, flipped `maya-english.paused.md` to in-progress and built the loader, article routes, home and typewriter pages per locale, and the shared language switch.

**Vova (1, mid-turn):** «кстати я упустил вопрос, что становится с картинками -- на них есть текст, и переводить его хочется DRY»

**Майя:** Admitted the plan's "drawn cards carry no text" was wrong. Proposed: the drawing stays one file, the translation's frontmatter carries a dictionary Russian wording → English per drawing, a script writes the English SVG, `--check` in vet fails on a missing or stale caption; one social card per post, from the English drawing; keys are the Russian wording itself, not element ids.

**Vova (2, mid-turn):** «да, хорошо»

**Майя:** Took it; revised the estimate up for the caption swap.

**Vova (3, mid-turn):** «.ru.svg тоже ж?»

**Майя:** Yes — names follow addresses as with posts: the original is `<name>.ru.svg`, the generated English is `<name>.svg`. Then found all three drawings carry Russian captions, the typeball too, and marked its 38 letters `translate="no"`. Built the swap, step 2 (first image as card), renamed the drawings, hit the context-budget warning, paused the plan and relayed. (verbatim in Last agent turn)

## 3. Intent

Майя's site readable in English — blog, home, `/whisper` — while Майя writes only Russian; English is made after, by a separate translator subagent, through the stamp and the build's drift gate ("задогфудим": the three existing posts go through that path, not by hand). The drawings' captions are translated DRY: one drawing, one dictionary per translation.

## 4. Decisions

- Everything in relay-2 § 4 still holds (English bare, `/ru` trailing; `<slug>.ru.md` original + `<slug>.md` translation with `translatedFrom`; drift gate = the build; card = first image unless `cardImage`).
- A translated document's `route` names its locale (`/blog/x/en`, `/blog/x/ru`), as songs' canonical does; the bare `/blog/x` is an alias rendering the English. The og card sits at the locale-less route.
- Drawings: `<name>.ru.svg` original; translation frontmatter `captions: { ./assets/<name>.ru.svg: { <wording>: <English> } }`, every `<text>` without `translate="no"` and the root `aria-label` keyed verbatim; `pnpm content:drawings:maya` writes `<name>.svg`; `--check` in `scripts/vet.sh`.
- `fillSlots` for a catalogue sentence with a link in it (`{blog}`, `{commit}`, `{count}`, `{band}`).
- The CV picker turned out to be chips already, so it uses `localeChips` whole (the plan's dropdown worry did not arise).
- Known duplication to flag in the PR: `SITE_CONFIG.maya`'s English name/tagline vs `en.json`'s `maya.name`/`tagline`.

## 5. Errors and dead ends

- The plan said drawn cards carry no text; they all do — Vova caught it.
- A `.test.tsx` is not picked up by `scripts/vet-test.sh` (it globs `*.test.ts`); the slot test is `.ts` with `createElement`.
- A JSON re-dump of the catalogues reflowed them; reverted and inserted textually.

## 6. State

- Branch `claude/maya-r1j2rn`, head 668de1a plus this relay's commit, pushed. Draft PR https://github.com/vzakharov/vovazakharov.com/pull/208 (title still the walk's).
- Plan: `docs/plans/maya-english.paused.md` — its `## Progress` lists done and left exactly, in order.
- **The tree does not build** until the three translations exist (`assertTranslated`). `pnpm typecheck` was green at de5d59a; the two new test files pass (`first-image.test.ts`, `message-slots.test.ts`, `scripts/lib/drawing-captions.test.ts`). Not run since: typecheck after 101aca4, lint, knip, builds.
- `en.json` carries the Russian copy under `maya.*` and the new `whisper.*` keys as placeholders.
- Nothing running: no CI watch, no PR subscription, no check-ins.
- Estimate: this session revised to 6 h senior developer ("pairing translated files in a loader every collection shares, routing each language under static export, and a caption swap that keeps one copy of each drawing need judgement about the repo's locale and content rules"). Remainder handed on: 2.5 h senior developer ("the stamps, cards, three builds, the checks and the docs that state the conventions, against a loader the translation is the first real input to") + 2 h senior copywriter ("three short essays, their drawings' captions and two pages carry a literary voice; an English that keeps it is translation by judgement, not by sentence").

## 7. Pointers

- `docs/plans/maya-english.paused.md` — plan and Progress.
- `src/shared/content/documents.ts`, `translations.ts`, `translation-stamp.ts`, `first-image.ts`; `scripts/stamp-translation.ts`, `scripts/translate-drawings.ts`, `scripts/lib/drawing-captions.ts`, `scripts/lib/read-collection.ts`, `scripts/lib/maya-card.ts`.
- `src/pages/documents/ui/article-page.tsx`, `article-header.tsx`; `src/pages/maya-home/ui/maya-home-page.tsx`; `src/pages/maya-whisper/`; `apps/maya/app/[[...locale]]/page.tsx`, `apps/maya/app/whisper/[[...locale]]/page.tsx`; `src/shared/ui/locale-chips.ts`; `src/shared/i18n/locales.ts`, `message-slots.tsx`, `messages/{en,ru}.json`.
- `apps/maya/public/blog/*.ru.md`, `assets/*.ru.svg`.
- PR #208 threads: `python3 scripts/export-github-item.py 208`.
- Transcripts: this session https://claude.ai/code/session_01HDsjepHJF1Gw7iGvzZfyMV ; relay-2's https://claude.ai/code/session_01BpwxV7qCWF3Tp2CMQtfjBZ ; relay-1's https://claude.ai/code/session_01WF3GVe44y6DXRtXPmgGAzd

## 8. Next step

Resume the paused plan: `go` — continue `docs/plans/maya-english.paused.md` from its Progress record, Vova's go-ahead being «хорошо, давай начнём и сразу же и задогфудим»: the translator subagent first (posts, captions, `en.json`), then stamps, drawings, `SITE_CONFIG.maya`, cards, builds, checks, docs, `/preview`, `/polish`, `/pr`.

The muthur sync offer was made; do not make it again.
