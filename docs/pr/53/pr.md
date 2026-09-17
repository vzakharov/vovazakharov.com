# PR #53: feat: build the music catalogue from markdown, with a player

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/53
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/music-section-lmf89w
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T22:15:57Z
- **Updated:** 2026-09-17T15:58:22Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **`/music` becomes a content collection.** One markdown file per song under `apps/vova/public/music/`, compiled to its own page at build time by the pipeline that already serves case studies and served raw at the same route plus `.md`. Frontmatter turns per-collection over a shared base, so a song carries `name`, `status`, `language`, `project`, `repo`, `audio` and `seconds` where a case study must not accept them; a collection is a handle pairing its id with its schema, so a reader cannot be handed one collection's documents under another's shape. `PAGE_ROUTES.music` is gone in favour of `collectionRoute('music')`, which the sitemap already derives.
- **The player is the audio element itself and no dependency.** Every browser in scope decodes FLAC natively, so a library would supply controls, and the controls are not the work — the queue is: a shuffle order stable in both directions, previous meaning _restart_ before it means _back_, `ended → next`, and a track that survives a navigation. That last requirement is what puts the element in the music route's layout, which never unmounts. The queue is resolved at build time and handed to the client as props, so no part of the content pipeline reaches the browser. The Media Session API puts `Name — Project` on the lock screen and points the OS media keys at the same handlers the keyboard uses.
- **Which songs are in is not a judgement.** A root FLAC is a master and a master is a finished song, which picks the first batch out of the 147 `vovas-music` repositories that have one, and leaves working mixes and Suno-sourced wavs out without anyone ranking them. `pnpm music:scaffold <repo>` reads each song's mechanical fields rather than asking for them: the name off the master's filename, the duration off its FLAC STREAMINFO through a 128 KB range request, the date off the repository's first commit.
- **Lyrics are machine-drafted and hand-corrected.** Each master went through `scripts/transcribe.py` at 0.87–0.99 mean confidence, reading the isolated vocal stem where a repository carries one. Every body says in a comment that its lyrics are a proposal. `june` came back empty in both languages, which is the answer rather than a failure — `breathe.flac` is the batch's one instrumental.

**What still needs the author.** `project` is empty on all ten: nothing in a repository says whether a song is GENERATED, Полуживые or Downtemple. The prose bodies and the five proposed names (`Река`, `Летим`, `Breathe`, `We're Back`, `Crossroads`) are drafts to correct or replace, and the ten dates are first-commit dates to sanity-check rather than blanks to fill.

## QA Checklist

- [ ] `index` — `/music` lists ten songs newest first, each row a name, its project, its duration and a play button; the existing prose and the three Spotify embeds are unchanged above it.
- [ ] `song-page` — `/music/slime` renders `name` as the `<h1>`, with date, language and duration beneath it, links to `.md` and to the source repository, and the lyrics as separate lines rather than one run-on paragraph.
- [ ] `playback` — pressing play on a row starts the master. **Needs a real browser**: this repo's sandbox has no route to `raw.githubusercontent.com`.
- [ ] `navigation` — start a track on `/music`, open a song page, come back: the track is still playing and the bar still shows it.
- [ ] `queue` — next and previous move through the list and wrap; previous restarts the current track when it is more than 3 s in; shuffle reorders and stepping back through a shuffled queue returns where it came from.
- [ ] `keyboard` — space toggles, `←`/`→` seek 5 s, `shift`+`←`/`→` change track, and none of it fires while focus is in a text field.
- [ ] `media-session` — on a phone, the lock screen shows `Name — Project` and its buttons drive the same queue.
- [ ] `safari` — Safari plays a FLAC served as `application/octet-stream`; Chrome and Firefox sniff the container, Safari is the one to confirm.
- [ ] `themes` — the player controls are legible in both themes (the palette is monochrome, which is what made them invisible once).
- [ ] `raw-markdown` — `/music/slime.md` serves the authored file.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `index` | yes | build | `pnpm build` renders it; appearance checked with `/preview` |
| `song-page` | yes | build | ditto, both themes |
| `playback` | no | — | manual-only here: no route to the audio host from this machine |
| `navigation` | partly | no | needs a driven browser; the layout placement is what makes it hold |
| `queue` | yes | `pnpm test` | `player-state.test.ts` covers shuffle stability, wrapping and the restart threshold |
| `keyboard` | partly | no | handlers are shared with the queue, which is tested; binding is not |
| `media-session` | no | — | manual-only, device-specific |
| `safari` | no | — | manual-only, not available from this machine |
| `themes` | no | — | checked by eye via `/preview`; no automated contrast gate |
| `raw-markdown` | yes | build | `public/` is copied into `out/` verbatim |

https://claude.ai/code/session_01YAo9pnqgf8VyXET1RaWz1G

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T22:16:17Z — "Proposed squash title/body: ``` feat: build the music catalo…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T22:16:17Z

[https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5705354003](https://github.com/vzakharov/vovazakharov.com/pull/53#issuecomment-5705354003)

Proposed squash title/body:

```
feat: build the music catalogue from markdown, with a player (pr #53)
```

```
The music page was three Spotify embeds and a paragraph, while the
songs sat in 238 Reaper repositories under the vovas-music
organization with no description, topic or README between them —
nothing a site could read. So the catalogue starts by writing it down.

Songs become a content collection: one markdown file per song under
apps/vova/public/music/, compiled to its own page at build time by the
pipeline that already serves case studies, and served raw at the same
route plus .md. A collection is a handle pairing its id with its
schema, so a song carries what a case study must not accept and
neither can be read under the other's shape. A song names itself in
frontmatter rather than in a leading heading, because the name is what
a player control shows, not prose; its duration rides along, read off
the master's own FLAC header so the track list renders complete.

Which songs are in is not a judgement: a root FLAC is a master, and a
master is a finished song. That picks the first batch out of the 147
repositories that have one, leaving working mixes and Suno-sourced
wavs out without anyone ranking them. A scaffolder reads each song's
mechanical fields rather than asking for them: the name off the
master's filename, the duration off its FLAC header through a 128 KB
range request, the date off the repository's first commit. Lyrics are
transcribed — from an isolated vocal stem where one exists — and
corrected by hand, the same split the dictation flow already draws
between what a recognizer proposes and what a person decides was sung.

A player rides in the music route's layout, which is what lets a track
keep playing across a navigation from the index into a song and back:
play/pause, previous, next, shuffle as a seeded permutation so the
queue is stable in both directions, seeking, keyboard control and the
OS media keys through the Media Session API. It is the audio element
itself and no dependency — a library supplies controls, and the work
here is the queue, which a pure reducer holds and a test covers. That
queue is resolved at build time and handed over as props, so no part
of the content pipeline reaches the browser. Audio is hotlinked from
the source repositories, which serve byte ranges and therefore seek;
the frontmatter field is a plain URL, so re-hosting is a markdown edit
and no code.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/rules/content.md`:73 — unresolved — last: @vzakharov (agent) 2026-09-17T15:40:46Z — "Кейс-стади пока остаются на лидирующем `# `, тикет заведён,…" → [threads/01-claude-rules-content-md.md](threads/01-claude-rules-content-md.md#t01)
- **T02** `apps/vova/public/music/birdie.md`:1 — unresolved — last: @vzakharov (agent) 2026-09-17T15:40:47Z — "Решено, план обновлён (2c86baf). Итог по этому треду: **Один…" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t02)
- **T03** `apps/vova/public/music/birdie.md`:7 — unresolved — last: @vzakharov (human) 2026-09-17T15:36:40Z — "ок. ты это где-то записал в правилах на будущее?" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t03)
- **T04** `apps/vova/public/music/birdie.md`:9 — unresolved — last: @vzakharov (human) 2026-09-17T15:37:26Z — "заведи тикет, подумаем" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t04)
- **T05** `apps/vova/public/music/birdie.md`:22 — unresolved — last: @vzakharov (human) 2026-09-17T15:39:11Z — "спасибо. не надо про эти лирики записывать уроки (если ты пр…" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t05)
- **T06** `apps/vova/public/music/birdie.md`:24 — unresolved — last: @vzakharov (human) 2026-09-17T15:40:51Z — "что-то, кажется, ты перемудрил. я буду просто вставлять в ко…" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t06)
- **T07** `apps/vova/public/music/crossroads.md`:6 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:08Z — "Никакой. Скаффолдер проставляет `language: ru` по умолчанию,…" → [threads/03-apps-vova-public-music-crossroads-md.md](threads/03-apps-vova-public-music-crossroads-md.md#t07)
- **T08** `apps/vova/public/music/crossroads.md`:25 — unresolved — last: @vzakharov (human) 2026-09-17T15:43:44Z — "июль 2024" → [threads/03-apps-vova-public-music-crossroads-md.md](threads/03-apps-vova-public-music-crossroads-md.md#t08)
- **T09** `apps/vova/public/music/crossroads.md`:47 — resolved — last: @vzakharov (agent) 2026-09-17T15:40:49Z — "Понял, и понял, что прочитал тебя неправильно в прошлый раз.…" → [threads/03-apps-vova-public-music-crossroads-md.md](threads/03-apps-vova-public-music-crossroads-md.md#t09)
- **T10** `apps/vova/public/music/crossroads.md`:2 — unresolved — last: @vzakharov (agent) 2026-09-17T15:30:12Z — "Принято, и это чище, чем строка с «feat.» внутри: массив раз…" → [threads/03-apps-vova-public-music-crossroads-md.md](threads/03-apps-vova-public-music-crossroads-md.md#t10)
- **T11** `apps/vova/public/music/first.md`:7 — unresolved — last: @vzakharov (human) 2026-09-17T15:45:43Z — "Я не хочу досказывать, кто папа. Как я писал в комментарии п…" → [threads/04-apps-vova-public-music-first-md.md](threads/04-apps-vova-public-music-first-md.md#t11)
- **T12** `apps/vova/public/music/first.md`:67 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:14Z — "Беру дословно. Два места, где расшифровка была не просто нет…" → [threads/04-apps-vova-public-music-first-md.md](threads/04-apps-vova-public-music-first-md.md#t12)
- **T13** `apps/vova/public/music/june.md`:25 — unresolved — last: @vzakharov (human) 2026-09-17T15:47:28Z — "спасибо! оставляю открытым потому что решение про структур п…" → [threads/05-apps-vova-public-music-june-md.md](threads/05-apps-vova-public-music-june-md.md#t13)
- **T14** `apps/vova/public/music/june.md`:7 — resolved — last: @vzakharov (agent) 2026-09-17T15:40:50Z — "Принято: `[Полуживые, GENERATED]` на обоих языках. Порядок и…" → [threads/05-apps-vova-public-music-june-md.md](threads/05-apps-vova-public-music-june-md.md#t14)
- **T15** `apps/vova/public/music/letim.md`:7 — unresolved — last: @vzakharov (human) 2026-09-17T15:47:54Z — "оставляю с той же целью" → [threads/06-apps-vova-public-music-letim-md.md](threads/06-apps-vova-public-music-letim-md.md#t15)
- **T16** `apps/vova/public/music/letim.md`:49 — unresolved — last: @vzakharov (human) 2026-09-17T15:48:30Z — "нет, ударений нигде не надо. "за руку" это вообще два слова,…" → [threads/06-apps-vova-public-music-letim-md.md](threads/06-apps-vova-public-music-letim-md.md#t16)
- **T17** `apps/vova/public/music/letim.md`:25 — unresolved — last: @vzakharov (human) 2026-09-17T15:49:13Z — "так я и сказал, февраль 2024 :)" → [threads/06-apps-vova-public-music-letim-md.md](threads/06-apps-vova-public-music-letim-md.md#t17)
- **T18** `apps/vova/public/music/rak.md`:26 — unresolved — last: @vzakharov (human) 2026-09-17T15:50:25Z — "перестань называть всё это ошибками, и в правилах напиши так…" → [threads/07-apps-vova-public-music-rak-md.md](threads/07-apps-vova-public-music-rak-md.md#t18)
- **T19** `apps/vova/public/music/rak.md`:47 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:23Z — "Беру дословно. Два расхождения, которые стоит назвать, потом…" → [threads/07-apps-vova-public-music-rak-md.md](threads/07-apps-vova-public-music-rak-md.md#t19)
- **T20** `apps/vova/public/music/reka-2.md`:25 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:24Z — "Беру целиком, включая последнюю строфу и то, чья она. Про по…" → [threads/08-apps-vova-public-music-reka-2-md.md](threads/08-apps-vova-public-music-reka-2-md.md#t20)
- **T21** `apps/vova/public/music/reka-2.md`:46 — unresolved — last: @vzakharov (human) 2026-09-17T15:54:09Z — "Я забыл сказать было, у папы окончание было по-другому: "Ум…" → [threads/08-apps-vova-public-music-reka-2-md.md](threads/08-apps-vova-public-music-reka-2-md.md#t21)
- **T22** `apps/vova/public/music/sashas.md`:26 — unresolved — last: @vzakharov (human) 2026-09-17T15:55:10Z — "я хотел сказать "живых и умерших, машины и человека", описАл…" → [threads/09-apps-vova-public-music-sashas-md.md](threads/09-apps-vova-public-music-sashas-md.md#t22)
- **T23** `apps/vova/public/music/reka-2.md`:7 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:27Z — "`[Полуживые]`, без фитов. Записал." → [threads/08-apps-vova-public-music-reka-2-md.md](threads/08-apps-vova-public-music-reka-2-md.md#t23)
- **T24** `apps/vova/public/music/rak.md`:7 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:28Z — "`[Грёбаный бал]`. Записал — и вместе с `birdie` и `slime` эт…" → [threads/07-apps-vova-public-music-rak-md.md](threads/07-apps-vova-public-music-rak-md.md#t24)
- **T25** `apps/vova/public/music/sashas.md`:7 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:29Z — "`[Полуживые]`. Записал." → [threads/09-apps-vova-public-music-sashas-md.md](threads/09-apps-vova-public-music-sashas-md.md#t25)
- **T26** `apps/vova/public/music/sashas.md`:48 — unresolved — last: @vzakharov (human) 2026-09-17T15:56:46Z — "ударения, как и писал, не нужно; про вальс тоже; вообще, ист…" → [threads/09-apps-vova-public-music-sashas-md.md](threads/09-apps-vova-public-music-sashas-md.md#t26)
- **T27** `apps/vova/public/music/birdie.md`:1 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:32Z — "Принято, и это правильная просьба: отчёт «взял, вставил, поп…" → [threads/02-apps-vova-public-music-birdie-md.md](threads/02-apps-vova-public-music-birdie-md.md#t27)
- **T28** `apps/vova/public/music/slime.md`:26 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:33Z — "Беру. И это, пожалуй, самый интересный случай в батче с точк…" → [threads/10-apps-vova-public-music-slime-md.md](threads/10-apps-vova-public-music-slime-md.md#t28)
- **T29** `apps/vova/public/music/slime.md`:7 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:34Z — "`[Грёбаный бал, за/обложкой]`. Записал." → [threads/10-apps-vova-public-music-slime-md.md](threads/10-apps-vova-public-music-slime-md.md#t29)
- **T30** `apps/vova/public/music/slime.md`:57 — resolved — last: @vzakharov (agent) 2026-09-17T15:30:35Z — "Беру дословно, суновские маркеры не копирую. Расхождения, ко…" → [threads/10-apps-vova-public-music-slime-md.md](threads/10-apps-vova-public-music-slime-md.md#t30)
- **T31** `apps/vova/public/music/wereback.md`:7 — unresolved — last: @vzakharov (agent) 2026-09-17T15:40:52Z — "Как в листинге: `[GENERATED, Yoohie]`. Записано." → [threads/11-apps-vova-public-music-wereback-md.md](threads/11-apps-vova-public-music-wereback-md.md#t31)
- **T32** `apps/vova/public/music/wereback.md`:25 — unresolved — last: @vzakharov (agent) 2026-09-17T15:30:38Z — "Беру целиком — и это история, ради которой стоит завести отд…" → [threads/11-apps-vova-public-music-wereback-md.md](threads/11-apps-vova-public-music-wereback-md.md#t32)
- **T33** `apps/vova/public/music/wereback.md`:52 — unresolved — last: @vzakharov (human) 2026-09-17T15:58:22Z — "тогда везде поменяй пжст звёздочки обратно на полные слова" → [threads/11-apps-vova-public-music-wereback-md.md](threads/11-apps-vova-public-music-wereback-md.md#t33)

## Timeline (status, references, and other events)

- **2026-09-17T01:03:35Z** @vzakharov renamed from «docs: plan the music catalogue and its player» to «feat: build the music catalogue from markdown, with a player».
- **2026-09-17T15:15:35Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/53#pullrequestreview-5235387062.
- **2026-09-17T15:38:15Z** @vzakharov cross-referenced this pull request from [#62 Move the case-study title into frontmatter, as songs do](https://github.com/vzakharov/vovazakharov.com/issues/62).
