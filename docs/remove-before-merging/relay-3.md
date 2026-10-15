# Relay 3 — derive every song file's URL

## Standing constraints

None stated in this session.

## The conversation

1. **Operator** (`/from-branch claude/radio-webkit-seek-mnv6xc`, with a
   screenshot of the earlier session asking them to open the raw MP4 URL on an
   iPhone): «так, ну оно у меня просто скачалось и, скачавшийсь, заиграло -- не
   уверен, что это что-то подтверждает. мы можем опять собрать тестовую страницу
   на pages на репе /sultan и протестировать?»

   **Agent**: attached to the branch (PR #157). Explained that opening a raw URL
   directly makes Safari download an `application/octet-stream` file, which
   proves nothing about the `<audio>` element. Added a fourth source to
   `vovas-music/sultan`'s `seek-test/index.html`: the site's own MP4 from
   raw.githubusercontent.com, placed second so the "same second, other file"
   swap from the MP3 lands on it. Committed to sultan `main` (7dd0508) and
   turned Pages on.

2. **Operator**: «всё работает ок везде кроме flac-а (как и предполагается, я
   так понимаю)»

   **Agent**: confirmed that the raw-host MP4 seeks exactly. Ticked `raw-host`
   in PR #157's QA checklist, turned sultan's Pages off, and recorded the result
   in `seek-test/README.md` (sultan 1f4160f). The remaining QA rows (`download`,
   `iphone-seek`, `iphone-radio`) can only be checked on the live site, so they
   come after the merge; next step is `/finalize`.

3. **Operator** (screenshot of a song's frontmatter diff adding `stream:`): «не
   нравится разнобой с названиями ключей с аудио, тут просто audio, там mp3,
   здесь вдруг stream / учитывая что у нас теперь конвенция (я так понимаю vet
   не пропустит, если не будет всех трёх), достаточно в принципе только указать
   mp3 bytes (если они до сих пор и на самом деле нужны), а остальное
   вычисляется программно?»

   **Agent**: measured all 170 songs. Every `mp3.url` is the master's URL with
   `.mp3`, and every `stream` sits beside the master. The URLs carry only two
   facts the catalogue lacks: where the master lives (~30 songs keep it in an
   album repo rather than their `repo`, and 13 URLs use branch `master`) and
   whether a FLAC exists (13 songs are MP3-mastered). `bytes` stays, because the
   RSS enclosure needs `length` and the tag run writes it. Offered two options:
   (1) keep `audio` as the one literal URL and derive the other two; or (2)
   remove the URLs entirely and take the current file location from
   `tag-renders.json`. Recommended (1).

4. **Operator**, answering point by point:

   > quiet-snow repo: sneg, а файл в dng_album;

   «перенести файл в репу (что логично)»

   > у 13 песен ветка master, а не main;

   «исправить на main»

   > 13 песен вообще без FLAC …

   «булевый флаг, true если отсутствует лосслесс»

   **Agent**: read this as option (2), with every URL derived. Wrote the design
   to `docs/plans/derived-media-urls.paused.md` and paused there, because the
   context budget warning came before any code. Then ran this relay.

## Intent

A song's frontmatter holds only what cannot be derived: `repo`, `seconds`, the
lossy flag and the MP3 size. The master, MP3 and stream URLs, and the download
names, are all computed from `repo`, the flag and the billing. PR #157's
iPhone fix (stream the MP4 rewrap) stays as it is. Only how its URL is stated
changes.

## Decisions

- **Masters move into the song's own repository**; **every branch is `main`**;
  **a boolean marks a song without a lossless master**. These are the
  operator's decisions.
- The rest are the agent's, recorded in the plan as open to the operator:
  - naming: `lossy: true` and top-level `mp3Bytes`;
  - files are copied and `main` is created beside `master`, so the live site
    keeps working until the deploy; `prune` and deleting the `master` branches
    by hand come after it;
  - the tag run takes each song's current file from `tag-renders.json`, which
    makes the move itself just a `tag` run;
  - the scaffolder writes a new song's manifest entry.
- The five repos whose default branch is `master`: `golodnaa`, `lake`,
  `like-that`, `love`, `meow`. The album repos `Divine-Discontent--album-` and
  others are on `master` too, but their masters move out.

## Errors and dead ends

- Opening a raw URL directly on the iPhone downloads the file, so it was not a
  test (operator's message 1).
- Deleting the auto-branch `claude/radio-webkit-seek-test-b3bc2w` returned
  `stale info`. It was never pushed, so there was nothing to delete.

## State

- Branch `claude/radio-webkit-seek-mnv6xc`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/157 (draft, base `main`).
  Last pushed commit: ff6b145 (the plan). Nothing is running and nothing is
  subscribed.
- Plan: `docs/plans/derived-media-urls.paused.md`. Nothing is implemented yet.
  The earlier plan `radio-webkit-seek.completed.md` is finished.
- In `vovas-music/sultan`, Pages is off. Its seek test page now has the raw-host
  source.
- Estimate: this session's is 0.75 h middle qa (the device check of the hosting
  difference) + 1 h senior developer (the test page source and the redesign
  measured against 170 songs, the live repos' branches and the manifest). The
  remainder handed on is 6 h senior developer: deriving every media URL reworks
  the player, the feed, the downloads, the scaffolder and the tag run's source
  lookup, and moves 30 masters and 5 branches across live repositories without
  breaking the deployed site.

## Pointers

- `docs/plans/derived-media-urls.paused.md` holds the design, steps and DRY
  notes.
- Code: `src/shared/music-catalogue/frontmatter.ts` (the schema);
  `src/pages/music/lib/{songs,song-files,song-downloads,song-feed,master-url}.ts`;
  `scripts/lib/{song-tag-source,song-tagging,song-tag-rewrites,music-repo}.ts`;
  `scripts/scaffold-song.ts`; `scripts/masters.ts`.
- Manifest: `apps/vova/public/music/tag-renders.json`.
- Re-check the repo defaults with
  `gh api repos/vovas-music/<repo> --jq .default_branch`.
- Predecessor transcript:
  https://claude.ai/code/session_013MEGG94kUKHYEZqYVfERaE

## Next step

Resume the paused plan `docs/plans/derived-media-urls.paused.md` with `/go`.
The operator's decisions above are the go-ahead. Name the agent-taken choices
(`lossy`, `mp3Bytes`, manifest-as-source) in the first reply, and keep working
while the operator weighs them.
