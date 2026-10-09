# Relay 10 — PR #115, /music index rework done; two player features next

## Standing constraints

- Repo rules that bite here: merge state is reported, not fixed (PR #115 is `CONFLICTING` with `main`; `/finalize` merges the base); no merging; no `and finalize` was given. Never force-push.
- Operator wants chat replies in Russian, «ты», «Вова».

## The conversation

1. Operator: `/from-branch claude/music-catalogue-hidden-ldz252` with a screenshot of `/music` annotated: a dashed box round the italic pull quote, a dashed ellipse round the «Also on SoundCloud and Suno / All my music is open-source: github.com/vovas-music» lines, «make shorter to fit 3 lines on this width» beside the intro paragraph, and «+ Albums / Songs tabs/links» beside the «Artists» heading.
2. Operator (mid-turn): «the dashed ones: remove»
3. Operator (mid-turn): «хотя чего й то я на английском»
4. Operator (mid-turn): «+добавить где-то сверху primary кнопку которая сразу начинает играть всё (шафлом)»
   - Agent (4d82ab2): quote and links removed (their messages and the unused imports too); intro rewritten to 3 lines in both languages; primary «Shuffle all» / «Всё вперемешку» button under the intro (`shuffleAll` reducer action — fresh shuffle of the whole queue, played from the top; tested); tabs Artists / Albums / Songs, each a static page.
5. Operator (mid-turn, with a screenshot of Йухи's artist page): «+на страницах артистов, песни у которых нет альбомов должны отображаться в списке альбомов с пометкой (сингл)»
6. Operator (mid-turn): «т.е. они должны отображаться как бы как альбомы, не сразу с проигрыванием»
   - Agent (4d82ab2): singles join the artist's album grid as tiles linking to the song page, detail «Сингл · 2025»; newest first together with the albums.
7. Operator (mid-turn, screenshot of the player bar «Ok Loser — Trending Today»): «+название артиста в плеере должно быть кликабельным»
   - Agent (4d82ab2): player bar billing links each artist to its page.
8. Operator (mid-turn): «+давай кредиты к песням переместим под лирику, по строчке на музыка/текст»
   - Agent (c8d5c2a): credits moved from the facts line to a line each under the lyrics, music first.
9. Operator (mid-turn, screenshot «Не торопи / Ne toropi · rus. Do Not Hurry»): «+давай не писать rus. (и любые языки) для переводов названия -- это легко выводится из языков песни»
   - Agent (c8d5c2a): prefix dropped; `languageShort` messages removed. Russian intro trimmed again to fit 3 lines (verified by screenshot at 1280px). Then delegated `/polish` + `/pr` to a subagent (5d381f5, fba74fe).
10. Operator (mid-turn, screenshot of the player bar): «+давай добавим кнопочку (пока не знаю какая лучше иконка, выбери ты), чтобы "следить" за играющей песней, т.е. при переключении песни переключаться на её страницу. можно в новой сессии уже как закончат то что сейчас делают»
    - Agent: queued for the successor; floated `Crosshair` or `LocateFixed` from lucide (map-style "follow"), not decided.
11. Operator (screenshot of the player bar, «Туман над Азовом — Полужи...» truncated): «+когда не вмещается текст в плеере (т.е. большинство времени), пусть вся надпись медленно (и не сразу) "ползёт", так чтобы слева уезжало в многоточия, а с право из них выезжало. Как "доедет" до конца, ждёт немного и опять переключается на начало цикла (начиная с ожидания)»
    - Agent: queued for the successor alongside item 10; relayed.

## Intent

Shape `/music` into a browsable catalogue (artists / albums / songs) with a one-press way to just listen, and make the player bar more useful: links out of it, and — next — a way to follow along with what is playing and a title that can be read in full.

## Decisions

- **Tabs are separate static pages**, not client-side tabs: `/music` (artists), `/music/albums`, `/music/songs`, mirrored under `/music/all/…` and with a trailing locale. `CATALOGUE_TABS`, `tabPath`, `tabBySegment`, `tabLabels` in `src/pages/music/lib/music-urls.ts`; `songs` joined the reserved song slugs (`songs.ts`). Index metadata titles the albums/songs tabs `Music: Albums` etc.
- **«Всё вперемешку» plays the player's queue**, which is the public catalogue (plus any hidden song already appended), not the hidden songs on `/music/all`.
- **A single** = a song with `album: null` whose first `project` is the artist; a song the artist only features on is not listed as their single. `artistReleases` in `src/pages/music/lib/catalogue.ts`. Singles are not on the Albums tab — only artist pages were asked for.
- **`PlayerTrack.billing`** is now `Record<Locale, Billing>`, `Billing = Array<LabeledLink | string>` (`player-state.ts`); `billingText` reads it as text for the song list and the lock screen. Artist links in it point into the song's own catalogue (`/music/all/…` for a hidden song), as the song page does.
- **Credits**: an uncredited role is the author's alone and still goes unsaid (`creditsSchema`'s contract), so a song of his own shows no credit lines. Offered to always show «Вова Захаров» — no answer yet.
- **`titleLanguage`** stays in the schema though nothing reads it any more (two song files set it; `content.md` mentions it when describing a song's title).
- `/polish`'s `/dry` left two duplications for Vova to call: the album tile (link, title, cover) built on both the artist page and the Albums tab; a song's artist links built in both `SongFacts` and `songTrack`'s billing.

## Errors and dead ends

- Deleting the empty auto-branch `claude/peaceful-brahmagupta-t5b93l` on origin was refused `stale info` — most likely it was never pushed. Left as is.
- `pkill -f "next dev"` inside a compound command killed its own shell (exit 144); the dev server was gone anyway.

## State

- Branch `claude/music-catalogue-hidden-ldz252`, head fba74fe (plus this file and the cost row on top), tree clean.
- PR https://github.com/vzakharov/vovazakharov.com/pull/115 — draft, `CONFLICTING` with `main`, base `main`. Body and the `Proposed squash title/body:` comment refreshed by fba74fe.
- `docs/plans/`: only `*.completed.md` files; this work ran planless.
- knip still flags `MusicAlbum` in `src/shared/song/index.node-safe.ts` (pre-existing) — vet will catch it at `/finalize`.
- Estimate: this session's stays 5 h middle developer ("tab pages through a typed catch-all router, a reducer action, a mixed album-and-single release list and linked billing in a client player each touch a different layer of the section") + 0.5 h senior copywriter ("cutting a bilingual intro to a fixed line budget without losing its thesis needs an ear for voice") — it covers only the work done here. Remainder for the successor: 2.5 h middle developer — a client-side navigation tied to the player's track changes, plus a measured, paused CSS marquee that has to hold up across track and width changes.

## Pointers

- Player: `src/pages/music/ui/player-bar.tsx` (the controls `Group` holds previous / play / next / shuffle; the track title + billing sit in `.playerTrack` as one truncated `Text`), `src/pages/music/ui/player-provider.tsx` (context; layout-mounted, survives navigation), `src/pages/music/lib/use-audio-player.ts` (controls, `current`), `src/pages/music/lib/player-state.ts` (reducer, tested in `player-state.test.ts`), `src/pages/music/ui/music.module.scss` (`.playerBar`, `.playerTrack`, `.controlOn` for a pressed toggle like shuffle).
- A track's page in each language is `current.routes[locale]`; the bar's locale is `usePlayer().locale` (from the pathname).
- Index: `src/pages/music/ui/music-page.tsx`, `catalogue-tabs.tsx`, `music-section.tsx`, `shuffle-all-button.tsx`. Artist page: `artist-page.tsx`. Credits: `song-credits.tsx`.
- `/preview` skill: dev server on a spare port, `/opt/pw-browsers/chromium --headless=new … --screenshot`; a marquee needs CDP or several timed captures to be seen moving.
- Predecessor transcript: https://claude.ai/code/session_01AZ154XsgZ3FNVuL2a38SbB

## Next step

добавь в плеер (1) кнопку «следить за песней»: при переключении трека открывать страницу играющей песни, иконку выбери сам; (2) бегущую строку для названия, которое не влезает: пауза, медленный сдвиг (слева уходит в многоточие, справа выезжает из него), пауза в конце, возврат к началу цикла
