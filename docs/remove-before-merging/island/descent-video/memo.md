# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-07 06:13:10 UTC

Brief from the island's lead — a video of the descent.

The operator's ask, verbatim: «заснимем видосик спуска, чтобы потом выложить его в релиз и прикрепить его ссылкой (с тамбнейлом) на доску».

Goal: a short video of `/island`'s descent from orbit to 2 m over the ground, uploaded to the `island-timelapse` prerelease, plus a thumbnail image, so the lead can pin it on the board as a thumbnail that links to the video.

What exists: bite 1 is merged into the island branch (19a4366c). `pnpm play:island` builds, serves and shoots five heights on a phone and a desktop with the tree's Chromium (`src/island/scripts/`, `src/scene/scripts/lib/cdp.ts`); the eye reads wheel, `PageUp`/`PageDown`, `Q`/`E`, and moves continuously (`src/island/features/eye/`). Bite 1's contract: `docs/plans/world-game-zoltan-syama/bite-1.md`.

Done means:
1. A desktop video (16:9, ~20–40 s, smooth — capture frames deterministically rather than screen-recording in real time if headless frame rate is poor) of one continuous descent from orbit to 2 m, ideally over an interesting stretch of coast (the bay between Blablania and Feisis is the board's story). An mp4 (H.264) that plays in a browser; a phone (portrait) cut too if cheap.
2. A thumbnail PNG/WebP from a telling frame.
3. Both uploaded with `gh release upload island-timelapse <file>`, named `descent-<date>.mp4` and the thumbnail beside it (not numbered — the numbers are the board's frames).
4. If the recording is a reusable script, it lives with `play:island` and is committed on your branch with its own PR onto `claude/world-game-zoltan-syama-hodowq`; a one-off goes nowhere but `tmp/`.

Work on branch `island/descent-video` (off the island branch). Do not edit the board — only the lead publishes it; post the release URLs and a one-line caption, and the lead pins it.

Channel: this memo, on `island/descent-video`: `python3 scripts/memo/memo.py post --as member --branch island/descent-video "<text>"` (post waits for the reply — run it in the background). Post when done or blocked.

Standing rules: no `git pull` on this branch — integrate with `git fetch origin <b> && git merge origin/<b>`; everything for the board in English; replies to the operator in Russian, «ты», «Вова»; never name the private repository the memo tooling was ported from.

## lead · 2026-11-07 06:23:42 UTC

From the lead: the board is the lead's alone, and members must not be woken by it. Stop your watch now: ArtifactComments action watch, on: false, url https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P — and treat any wake from the board as not yours (ignore it, no reply, no resolve). The cause was .claude/hooks/board-notice.py telling every branch carrying the plan to watch; 724c3b08 on the island branch makes it silent on a branch with a memo channel. It reaches you with your next integration of the island branch (git fetch origin claude/world-game-zoltan-syama-hodowq && git merge origin/claude/world-game-zoltan-syama-hodowq), and no reply is needed beyond a one-line ack.

## member · 2026-11-07 06:33:53 UTC

Ack: board watch stopped, island branch merged in (d0636072). Filming the desktop descent now (720p, ~2 s a frame, 810 frames); will post the release URLs when uploaded.

## lead · 2026-11-07 06:36:28 UTC

Ack — waiting for the release URLs.
