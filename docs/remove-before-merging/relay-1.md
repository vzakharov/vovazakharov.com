# Relay 1 — naming and tagging the song masters

## 1. Standing constraints

None stated by the operator beyond the repo's own rules.

## 2. The conversation

**Operator (1):**

> давай переименуем все мастер-мп3шки и флаки в vovas-music (на которые мы ссылаемся) в `<Песня> - <Исполнитель>.<flac|mp3>` (или порядок наоборот песня-исполнитель, посмотреть как стандартно в идустрии), чтобы мп3 скачивались с нормальным именем. Плюс добавить во все мп3шки (и во флаки если там это поддерживается) нужные теги типа там исполнитель альбом итп

**Agent:** Routed through `/task` → plan and hand off (cross-repo pushes to ~150
public repos, history growth irreversible). Renamed the branch, wrote the plan,
opened draft PR #153. Answered: industry standard is `Artist - Title`. Put five
questions: 1 order (rec. `Artist - Title`), 2 title script (rec. original
Cyrillic), 3 embed lyrics (rec. yes), 4 the two vendored songs (rec. tag them
and set `download`), 5 old files (rec. prune after deploy). Made the muthur
sync offer.

**Operator (2):**

> 2 я бы взял латиницу -- русские латиницу прочтут, а вот нерусскоговорящие кириллицу -- нет. к тому же в случае с mithqal например это была бы вообще "арабица"
> 4 - я бы создал для них репы и туда и перенёс. Хотя кажется hello-human находится в vovas-music/machines, поэтому можно кинуть туда
> 5 - удалять, да
>
> для muthur создай да

**Agent:** Claimed the muthur sync and started session
`session_01UByV3uXANx6qHjoQg5Ebv2` ("🔄 muthur → vovazakharov.com"). Collapsed
the forks: Latin names; vendored songs move to `vovas-music` (`hello-human` is
byte-identical to `machines/protintro.mp3`; `ghostly-blues` gets a new repo);
prune confirmed. New question 6: script of the embedded lyrics (rec. as sung).

**Operator (3):**

> хотя знаешь, давай ссылки у нас будут прямо исходя из локали. Типа, на `RU` и `EN / Абв` у нас кириллица, на `EN / Abc`  -- латиница (названия файлов будут разные, поэтому путаницы возникнуть не должно; хотя чисто гипотетически возможны "сбои" когда например русская песня имеет название на латинице, но тогда можно добавлять какой-то суффикс). Правда, кажется, мы транслитерацию определяем на клиенте только, так что не знаю, насколько это реализцемо
>
> > переносим в vovas-music
>
> hello human перенести тудаже, в machines, segue и всё такое

**Agent:** Feasible statically: the script chip is CSS over server-rendered
`data-spelling` spans, and the selector in `src/app/styles/globals.scss`
matches any element, so one `<a>` per spelling works. Rewrote the plan: names
derived per (locale, script) by one `songFileName`, every name a path to the
same blob (no storage cost, no suffix needed — identical names are the same
file). `hello-human` goes into `machines` beside `trust-in-the-machine`, which
it segues into (segue/track already set). New question 7: one Latin tag set
for all names (rec.) vs a file per spelling (~10 GB growth).

**Operator (4):**

> давай начнём

**Agent:** Flipped the plan (6293ffb, go-ahead quoted), then paused it at
once because the session was past its context budget (~214k), and relayed.

## 3. Intent

Every master the site plays or offers from `vovas-music` downloads under a
readable `<Artist> - <Title>.<ext>` spelled as the page the reader is on spells
it, and carries full tags. Ruled out: one Latin name for everyone (superseded
by per-locale names), keeping old files, keeping vendored MP3s in this repo.

## 4. Decisions

- **`Artist - Title`** over title-first: the foobar2000/Mp3tag/Beatport
  default. Open question 1, recommendation stands unless answered.
- **Names per locale and script chip** over a single Latin name — the
  operator's call. `songFileName(frontmatter, locale, script, ext)` in
  `shared/music-catalogue` names everything; both the links and the upload
  import it.
- **One blob, many paths** — git stores identical content once, so extra
  names cost a tree entry. Tags therefore are one set: Latin (question 7).
- **Frontmatter keeps one URL per file** (the song's own name, original
  script) for the player and feed enclosures; download links derive siblings
  by replacing the last URL segment. The directory comes off `audio:`, never
  `repo:` (they disagree for some songs, e.g. `heres-to-the-virus`; some
  repos use `master`).
- **Two phases**: add new paths beside old, merge/deploy, then `--prune`.
- **No clone**: org is 39 GB; push via Git Data API, paced under ~500
  writes/hour, resumable via `apps/vova/public/music/tag-renders.json`.
- **"Vendored songs"** = `ghostly-blues`, `hello-human`, the two MP3s under
  `apps/vova/public/music/assets/`.

## 5. Errors and dead ends

None in code. Planning reversals are recorded in the plan's "Settled with the
operator" paragraph.

## 6. State

- Branch `claude/music-file-names-and-tags-5hw4ll`, head 3216f15 (pushed),
  then this summary's commit.
- PR https://github.com/vzakharov/vovazakharov.com/pull/153 — draft; squash
  proposal comment posted, tracked in
  `docs/remove-before-merging/squash-message.md`.
- Plan: `docs/plans/music-file-names-and-tags.paused.md` — approved
  (6293ffb), nothing implemented; its `## Status` lists established facts.
- Open questions 1, 3, 6, 7 — all carry recommendations written into the
  plan; implement them as written.
- Muthur sync running in its own session; not this branch's business.
- Estimate: this session 2 h senior architect ("choosing a naming scheme a
  static build can verify offline, a storage-free multi-name layout in git
  and a two-phase rollout across 150 repositories wants someone who has
  designed migrations, not just scripts"). Remainder for the successor:
  7 h senior developer ("a resumable cross-repo upload over the Git Data API
  under a rate limit, tag formats for two containers, and derived file names
  a static build must verify offline") + 2 h middle qa ("downloading every
  spelling and inspecting the files across players and OSes, Cyrillic names
  on Windows included").

## 7. Pointers

- The plan, as above — the whole spec.
- `src/pages/music/ui/song-page.tsx` (`SongFileLink`),
  `src/pages/music/lib/song-feed.ts` (`downloadLinks`, `songEpisode`),
  `src/pages/music/ui/spelling.tsx`, `src/shared/music-catalogue/spelling.ts`
  (`songTitle`, `spelledText`), `src/pages/music/lib/catalogue-files.ts`
  (`localName`), `src/pages/music/lib/pictures.ts` (`songPicture`),
  `scripts/scaffold-song.ts` (`raw()`, `json()` to move to
  `scripts/lib/vovas-music.ts`), `scripts/song-intake/CLAUDE.md`.
- Org access check: `gh api orgs/vovas-music/repos --paginate -q '.[].permissions.push'`.
- Predecessor transcript: https://claude.ai/code/session_015FVowBFW5zv12Bs8vazfKZ

## 8. Next step

> go

The go-ahead the plan's flip quoted: «давай начнём».
