# PR #149 review — four threads

The operator's review on PR #149 (export committed in `docs/pr/149/pr.md`, threads T01–T04), worked through `/handle`'s review lane.

## Done (uncommitted work committed as WIP, branch does not build yet)

- **T01 — `podcast` → `mp3`.** The operator: "why call it `podcast` if it's just the master as MP3? Going forward we need it for non-lossless playback." The field is renamed in the schema (`src/shared/music-catalogue/frontmatter.ts`, docstring now "the master as an MP3, for whatever refuses or cannot afford FLAC"), `song-feed.ts`, `scaffold-song.ts` (emits `mp3:`), and `scripts/song-intake/CLAUDE.md`.
- **T04 — "& download?"** The songs feed item closes with a second paragraph, `Download: MP3 · FLAC` (`feedDownload` message, en "Download" / ru «Скачать»; FLAC only where `audio` is a FLAC), built by `downloadLinks` in `song-feed.ts`.

## Left

1. **Rename the key in the 170 song files**: `^podcast:$` → `mp3:` in `apps/vova/public/music/songs/*.md`. A `sed -i` over them was refused by the auto-mode classifier ("Irreversible Local Destruction"); ask the operator for a phrase naming that exact command, don't route around it. Until then the build fails on the schema.
2. **T02 — caption on the podcast cover** like the radio card's band. `musicCollage` already takes `band`; its CSS pins the band at `top: 380px`, tuned for the 1200×630 card, so the band's position needs to come from the layout (`LAYOUTS` in `scripts/lib/music-collage.ts`) for the 1500×1500 square. Proposed text: title `Vova Zakharov — Songs` (the feed's title without the locale), line the `music.metaDescription` in English, as every collage is English-only. Re-render with `pnpm content:og:vova` and commit `music.podcast.jpg` and its manifest.
3. **T03 — a feed reader to screenshot.** The operator asks whether a reader can be installed in the environment to see items for music and non-music without running locally. Answer: real GUI readers don't fit (NetNewsWire is macOS-only; Miniflux/FreshRSS need a database or PHP server); Chromium is here, and a reader's pane is a webview of `content:encoded`, so render one song item and one Bible item from the built feeds in a reader-like page and screenshot them, committing the PNGs under `docs/pr/149/` and linking them in the reply. Offer to make it a script if the operator wants it repeatable.
4. Build (`pnpm build:vova`), check one songs feed item carries the download paragraph, then reply on each of T01–T04 with the commit SHA (CLAUDE.md § "GitHub comments"; threads stay open). Then `/go`'s tail: `/polish`, `/pr` (body and squash proposal mention `mp3` instead of `podcast`).

## Also raised in chat, unanswered

- The operator asked how `add_repo` is better than plain `gh`. Answer: both push the same commit; `gh` with the operator's token reaches every repository they can, past the session's scope, so the classifier reads a push through it as a bypass — which is what blocked the pushes; `add_repo` adds the repository to the session's scope (`check_repo_access` says `vovas-music` repos are now attachable for push), after which a plain `git push` goes through the session proxy as an ordinary action.
- The operator's ask to package the external-repository work into a script: proposed `scripts/song-intake/podcast-copy.py` (encode `<stem>.master.mp3`, commit, plain `git push` after `add_repo`, record `mp3` frontmatter, verify links), access either per session by phrase or by an `add_repo` allow rule in `.claude/settings.json`. Awaiting the operator's choice; a separate PR.
- The muthur sync offer was made; do not make it again.
