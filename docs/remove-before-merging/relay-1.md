# Relay 1 — music songs under /music/songs, /music/all retired

## 1. Standing constraints

- «backward comp не нужен» — no redirects or aliases for old song URLs.
- «env-флаг можно оставить» — `SHOW_HIDDEN` (in `src/shared/content/documents.ts`) stays.

## 2. The conversation

1. **Operator:** «пусть песни сидят под /music/songs, а не просто /music, Ordnung muss sein. backward comp не нужен»
   **Agent:** Routed as a change → `/task` → decided planless (mechanical move, one obvious call per step). Renamed branch to `claude/music-songs-route-ub8ny7`, moved songs, vetted, committed `1da2a59`, polished (`7b0a6dc`), opened draft PR #146 with QA checklist, posted squash proposal (`3089b44`).
2. **Operator (mid-turn):** «что лучше songs или tracks?»
   **Agent:** `songs` — a track is a slot on a release (`track` already means album position in `album-tracks.ts`), the tab `/music/songs` already existed, the collection is labelled "Songs". Kept `songs`.
3. **Operator (mid-turn):** «вообще, философсикй вопрос, песня в которой не поют, это всё ещё песня/song? :)»
   **Agent:** Strictly no, but Mendelssohn's «Lieder ohne Worte» set the precedent; kept `songs`.
4. **Operator:** «давай заодно декомиссионируем /music/all и всё что с ним связано, учитывая что все песни какие были загружены уже открыты. env-флаг можно оставить»
   **Agent:** Confirmed no song carries `hidden: true`. Removed the whole `everything` dimension from `src/pages/music` and committed WIP `51587f1` (typecheck clean). Context budget hit 300k → auto-relay before vet/polish.

## 3. Intent

Tidy URL hierarchy for the music section: `/music` (artists tab), `/music/albums`, `/music/songs` (tabs), `/music/artists/<slug>`, `/music/albums/<slug>`, `/music/songs/<slug>`. No `/music/all` whole-catalogue view any more. No backward compatibility.

## 4. Decisions

- **Collection base `music/songs`** (in `src/shared/content/collections.ts`) rather than keeping files at `public/music/` with only the route changed — content.md's rule is "a document's file sits at its route plus an extension". Song files moved to `apps/vova/public/music/songs/`; `albums/`, `artists/`, `assets/` stay under `public/music/`.
- **`MUSIC_ROUTE = '/music'`** in `src/shared/music-catalogue/names.ts` — the section root, since `collectionRoute('music')` is now `/music/songs`. Read by `pages/music/lib/music-urls.ts` and `pages/home/ui/home-page.tsx` (home cannot import `pages/music` sideways). Not shared with the collection base because `collections.ts` runs under bare Node and may only import types.
- **Feeds moved** to `/music/songs/<locale>/feed.xml` (route files under `apps/vova/app/music/songs/`), derived from the base rather than special-cased.
- **Album/artist text** loads via `loadProse('music', '../albums/<slug>')` (`catalogue-text.ts`).
- **Reserved-segment check** in `songs.ts` shrank to locales only (song slugs no longer share a namespace with `all`/`artists`/`albums`/`songs`).
- **/music/all decommission scope:** removed `EVERYTHING_SEGMENT`, `WithEverything`, `CatalogueView`, `CataloguePageProps`, `indexPath` (folded into `musicPath`), the catalogue argument on `tabPath`/`artistPath`/`albumPath`, `catalogueSongs`'s argument, the second `cataloguePages` set, and the `hidden: everything` noindex. Kept: frontmatter `hidden`, `isListed`, `SHOW_HIDDEN`, the player's handling of tracks outside the queue (`player-state.ts`) — generic, shared across collections. Known edge: a future hidden song whose artist has no listed song would link to an artist page that is not built.
- `CatalogueTabsProps` was dropped for `IndexPageProps` (same `WithLocale & WithTab` combination; `pnpm type-overlap` floors combinations at 2).

## 5. Errors and dead ends

- A blanket sed `apps/vova/public/music/` → `…/songs/` wrongly hit `assets/` paths in `scripts/song-intake/CLAUDE.md` and `.claude/rules/maya-reflections.md`; reverted those.
- First vet failed only on import order (`music-urls.ts`) and formatting (`scripts/check-masked-words.test.ts`); fixed and rechecked with eslint/prettier, full vet not re-run then.

## 6. State

- Branch `claude/music-songs-route-ub8ny7`, pushed, head `51587f1` (then this relay file and a cost row).
- PR https://github.com/vzakharov/vovazakharov.com/pull/146 — open, draft. Body describes only the `/music/songs` move; squash proposal comment and `docs/remove-before-merging/squash-message.md` describe only the move too.
- No plan file (planless). No CI on PRs in this repo. No subscriptions or check-ins.
- Estimate: this session 3.5 h middle developer ("a route move across a registry, a URL parser and ~190 files, then a catalogue dimension removed from every music path and page…"). Remainder handed on: 0.5 h middle developer — vet, polish and the PR/squash refresh for the decommission.

## 7. Pointers

- `src/pages/music/lib/music-urls.ts`, `music-route-params.ts`, `songs.ts`, `music-metadata.ts`, `pictures.ts`, `catalogue.ts` — the decommission's core.
- `src/pages/music/ui/{music-page,catalogue-tabs,song-page,song-facts,album-page,artist-page}.tsx` — catalogue prop removed.
- `src/shared/content/frontmatter.ts` — `hidden` docstring no longer mentions `/music/all`.
- Predecessor transcript: https://claude.ai/code/session_019cMfo68uBV7EbXApG3AYt2

## 8. Next step

Finish the operator's latest request («декомиссионируем /music/all и всё что с ним связано»):

1. `./scripts/vet.sh` — fix anything it reports (likely only lint/format, if any; knip may flag a now-unused export).
2. Grep prose for leftovers: `/music/all`, "whole catalogue", "public or whole" in `src/`, `.claude/rules/`, `scripts/` (not `.claude/costs/sessions/`).
3. `/polish` (floor is `7b0a6dc`).
4. `/pr` refresh mode: add the decommission to PR #146's Summary and QA checklist (e.g. `/music/all` answers 404); then `/squash-message` to update the proposal (title could become `feat(vova): /music/songs for songs, /music/all retired (pr #146)`).
5. Report to the operator in Russian, «ты», name «Вова».
