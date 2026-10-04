# PR #57 — source digest, part 2 (frames, plan & bites, notes, costs, PR/issue)

Continues `tmp/case-study/digest.md` (whose §§ 1–7 stand). This file covers that file's § 8 items 1–6.
All shas are on `refs/pr/57` (PR head `c10d1379`) unless said otherwise.

## 1. Frames inventory

### 1a. How the frames lived

- Directory: `docs/remove-before-merging/frames/<bite>/` on the PR branch; 162 commits touched it (`git log refs/pr/57 -- docs/remove-before-merging/frames`).
- **Frames begin at bite 4**: first frame commit `3b9c1c99` 2026-09-26 22:32 UTC "docs: frames from bite 4's review play run" (≈1.5 h after the "frames" rule was born in relay 014). Bites 1–3 have **no frames**.
- **Retirement was not per bite at first.** Bites 4–12 accumulated side by side (346 files at `6f1e193a`) and were retired together at `df305486` (2026-10-02 22:06, "chore(mushrooms): retire past bites' working notes and frames"). From bite 12b on, each bite retired the previous one's frames when it committed its own.
- Tombstone: `frames/retired.md`, last at `09ee4ae7` (= `c84b2f28^`, 2026-10-04 15:40, the sweep before landing). `c84b2f28` deleted the whole `docs/remove-before-merging/` directory. At `09ee4ae7` the directory held only bite 18's three frames + `retired.md`.
- All 162 commits combined: **582 distinct paths, 633 distinct blobs (some frames were re-shot under the same name), ~357 MB** (611 PNG, 1 WebP, 15 `.md` READMEs/reports, 5 JSON + 1 `.ts.txt` sweep data in `bite-12b/review/`).
- Viewports in file names: `tabL`/`tabP` (tablet landscape/portrait, 2360×1640), `phoneL`/`phoneP` (2532×1170), `phoneS` (small phone), plus one-off `280x600`. "The five screens" = tabL, tabP, phoneL, phoneP, phoneS.

### 1b. Table (bite → frames → holding commit)

"Holding sha" is the tombstone's "last commit containing it" (read files with `git show <sha>:docs/remove-before-merging/frames/<dir>/<file>`). "Paths" counts every path ever committed under the dir, so it exceeds the tombstone's live count where frames were pruned or replaced mid-bite.

| Dir | Tombstone files | Paths ever (blobs) | Size (MB) | First frame commit (UTC) | Holding sha | Example files |
|---|---|---|---|---|---|---|
| `bite-4/` | 8 | 8 (13) | 2.8 | `3b9c1c99` 09-26 22:32 | `6f1e193a9f` | `review-tabL-windows.png`, `review-phoneP-both-mice.png`, `review-tabL-sinking.png` |
| `bite-5/` | 22 | 23 (23) | 4.6 | `42d0e246` 09-27 00:58 | `6f1e193a9f` | `tabL-b5-resting.png`, `review/phoneP-flight-closed-wings-read-as-sticks.png` |
| `bite-6/` | 18 | 27 (28) | 6.7 | `13b65304` 09-27 06:12 | `6f1e193a9f` | `phoneL-sun-sits-on-the-horizon.png`, `review/phoneP-bees-hide-the-flowers-they-sit-on.png` |
| `bite-7/` | 38 | 38 (37) | 14.2 | `7a28d15a` 09-28 14:15 | `6f1e193a9f` | `tabL-opening-meadow.png`, `tabL-bee-inked-close.png`, `review/tabL-stem-foot-plank-cut.png` |
| `bite-8/` | 29 | 39 (39) | 13.5 | `4651e948` 09-28 18:38 | `6f1e193a9f` | `meadow-mixed-portrait-tabP.png`, `porcini-close-tabL.png`, `russula-close-tabP.png` |
| `bite-9/` | 27 | 27 (28) | 23.7 | `8295361c` 09-29 17:00 | `6f1e193a9f` | `six-meadow-crowded-tabL.png`, `six-meadow-plus-refused-tabP.png` |
| `bite-10/` | 24 | 24 (26) | 15.3 | `1f797883` 09-30 01:11 | `6f1e193a9f` | `house-picker-phoneL.png`, `tufts-before-tabL-forest-61-tufts.png`, `sound.md` (drum/note render report) |
| `bite-10-review/` | 14 | 14 (15) | 8.6 | `4b6b6a0a` 09-30 02:16 | `6f1e193a9f` | player-agent review frames + README |
| `bite-11/` | 8 | 8 (12) | 9.8 | `fb464075` 09-30 21:17 | `6f1e193a9f` | `tabL-pan-dragged.png`, `phoneL-pan-right-end.png` |
| `bite-11-review/` | 6 | 6 (6) | 5.1 | `9670fedd` 09-30 23:21 | `6f1e193a9f` | review player frames |
| `bite-12/` | 146 | 146 (153) | 94.1 | `81ffe900` 10-01 06:03 | `6f1e193a9f` | lens/brow/veer plays, `operator/butterfly-shadow-unseen.webp` (the operator's own screenshot) |
| `bite-12b/` | 46 | 46 (46) | 30.4 | `dc8adaf3` 10-02 21:39 | `4d1112afaa` | `phoneL-final-forest.png`, `mottles-at-0.7-0.4-far-out.png`, `review/*.json` sweep data |
| `bite-13/` | 26 | 26 (26) | 20.1 | `bb6eabe0` 10-03 05:11 | `28b2b66911` | `phoneP-r7-rainbow.png`, `tabL-rain-3s.png`, `f-tabL-sun-dimmed.png` |
| `bite-14/` | 34 | 34 (32) | 30.3 | `3be34bf7` 10-03 08:23 | `e3a77fb976` | `rb-phoneP-sprouts-3-up.png`, `a3-tabL-shed-p42.png`, `operator-chanterelle-mouse.png` |
| `bite-15/` | 18 | 30 (30) | 7.7 | `5b87beaa` 10-03 12:32 | `28a6277009` | `r7-tabL-two-mice.png`, `w4-tabL-crawl.png`, `review/rw-tabL-russula-peek.png` |
| `bite-16/` | 9 | 12 (20) | 8.2 | `4484b81e` 10-03 18:26 | `20d0fd4df3` | `tabL-m4-open-planted.png` (map), `tufts-turned-before/after.png` |
| `bite-17/` | 22 | 70 (71) | 45.6 | `2aa143d2` 10-04 05:09 | `ab42be53f5` | `a4-tabL-dusk.png`, `fe-flight.png`, `end/contact-sheet.png` |
| `bite-18/` | 3 (live at `09ee4ae7`) | 3 (6) | 6.4 | `50b12af6` 10-04 14:33 | `09ee4ae7` | `tabL-keep-before/after/new.png` |

Bites 1, 2, 3 and 12's sibling directories outside `frames/`: none. There is no frames dir for bite 12b's "review" beyond `bite-12b/review/`.

### 1c. Local copies

All 633 blobs are copied to `tmp/case-study/frames/<dir>/<path>` (342 MB). Where a path had several versions, the newest keeps the plain name and older ones are `<name>__older-<blob7>.<ext>`. Downscaled samples and contact sheets: `tmp/case-study/work/thumbs/` (`g1.jpg`–`g4.jpg`).

### 1d. What sample frames show (looked at)

- **bite-4 `review-tabL-windows.png`** — two fly-agaric houses on a cartoon meadow; the selected one ringed yellow; a mouse peeks from each stem's door; caps carry windows; a row of window/door shape buttons across the top; `+`/`−`/house buttons on the right; big petalled sun, flat clouds.
- **bite-5 `tabL-b5-resting.png`** — the same clump with four butterflies (peacock-eye wings) perched on caps and a flower, one in flight; small species buttons in a cloud at top; a butterfly button at left.
- **bite-6 `phoneL-sun-sits-on-the-horizon.png`** — phone landscape: butterfly, fly and bee buttons top-left, the sun dipped into a notch between hills (the bug that bite 7's "sun stands whole" fix answered).
- **bite-7 `tabL-opening-meadow.png`** — the "one light" bite: softer, shaded hills, haloed sun, lit caps with highlights, contact shadows; HUD moved to the left column.
- **bite-8 `meadow-mixed-portrait-tabP.png`** — the four species together: fly agarics, a yellow chanterelle funnel, a lilac russula, a brown porcini.
- **bite-9 `six-meadow-crowded-tabL.png`** — six mushrooms at the cap, the `+` greyed out, butterflies and a bee working.
- **bite-10 `house-picker-phoneL.png`** — phone landscape with the house picker open: insect buttons, then four window shapes and a door in a row along the top.
- **bite-11 `tabL-pan-dragged.png`** — the meadow panned sideways: the clump pushed to the right edge, open grass with scattered flowers.
- **bite-12b `phoneL-final-forest.png`** — the panoramic/curved-brow world: a rounded horizon line with many small mushrooms standing along it, a mottled lawn, nearer mushrooms at the edges.
- **bite-13 `phoneP-r7-rainbow.png`** — phone portrait after a shower: a rainbow across the hills, an empty meadow below.
- **bite-14 `rb-phoneP-sprouts-3-up.png`** — rain mid-shower: grey clouds, dimmed sun, rain streaks, puddle rings on the grass, a small new fly agaric sprouting beside the clump.
- **bite-15 `r7-tabL-two-mice.png`** — close-up of the house clump: arched wooden doors in both stems, a pink worm on one cap, two grey mice running in a row on the grass.
- **bite-16 `tabL-m4-open-planted.png`** — the folded map open: a top-down mottled lawn with tiny mushroom and flower markers and a pale view-cone wedge from the player's dot; a ✕ close button.
- **bite-17 `a4-tabL-dusk.png`** — dusk: violet sky with stars, a pale moon-face disc where the sun was, lilac clouds, darkened meadow; a map button now top-left. **`fe-flight.png`** — daytime "flight" view (the risen eye) with a steps/flight toggle beside the map button.
- **bite-18 `tabL-keep-new.png`** — the final day meadow with map + footsteps buttons top-left: close to the bite-7 look but with the curved brow and mottled lawn.

### 1e. Other image/video artifacts on the branch

No GIF, MP4 or audio file was ever committed on the branch (`git log 250bab9..refs/pr/57 --diff-filter=A --name-only` over png/jpg/gif/webp/mp4/webm/mov/svg/wav/mp3/ogg). Outside `frames/` there are 31 images, all copied to `tmp/case-study/frames/_other/`:

| Path | Added | Size | What it is |
|---|---|---|---|
| `docs/remove-before-merging/syama-drawing.webp` | `f94fc67a` (author 09-17, committer 09-26) | 110 KB | **Syama's drawing**: blue ballpoint on squared paper — a big mushroom with a butterfly on the cap; a column of words «БАБОЧКА / МУХА / ПЧЕЛА» (butterfly / fly / bee) each with a tick box; small icons of a mushroom with `+` and a mushroom with `−`; window and door shapes (arched, round, square, a tall door) across the top and bottom — i.e. he drew the UI (insect buttons, +/−, window/door picker). |
| `docs/pr/57/attachments/44a2f807-….png` | `9ff63422` 09-29 ("docs: #57 refresh the PR export") | 207 KB | A screenshot of a **pixel-art top-down room game** (fireplace, tables, avatars, a chat line "There are 3 rooms so far that you can explore!"). Attached to some PR comment; not referenced in that export's `pr.md` by path. See § 5 / Open questions. |
| `docs/remove-before-merging/bite-11/look/*.png` (26 files) | `27acd7fa`, `a1afce76`, `a5ddedbe`, 09-30 | 0.3–1.2 MB each | bite 11's before/after looks at the far hills (pressed under the sun), the pan's left/right ends and the "sideways wash", on all five screens. |
| `docs/remove-before-merging/bite-12/brow-round/{1,2,3}.webp` | `33fa6767` 10-01 | 78–88 KB | The operator's screenshots for the "brow follows the D_SEE circle" decision (commit subject says "the operator's screenshots"). Not opened. |

The game itself is an Artifact (https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG, v30), not committed media.

## 2. Plan and bites

Plan files were read at `6e61b42^` (`6e61b42b` 10-04 15:39 "chore: sweep the plan and PR exports before landing" deleted them); copies are in `tmp/case-study/plan/` (main plan 399 lines / 3,839 words; 35 files under `mushroom-game-syama/`, ~45k words in all; the biggest are `bite-14.md` 3,487 w, `bite-15.md` 3,276 w, `bite-12.md` 2,772 w).

### 2a. Plan history: from a form to an elephant

| When (author date, UTC) | Commit | What happened to the plan file |
|---|---|---|
| 09-17 09:38 | `f94fc67a` | **First draft** added: `docs/plans/mushroom-game-syama.draft.do-not-implement.md` ("docs: plan the mushroom toy from Syama's drawing"), 1,687 words. |
| 09-17 09:40 | `c2847499` | Flipped to `.in-progress.md` under `/task`'s conditional go-ahead from the opening prompt «давай сделаем игрушку про мухоморы по рисунку и описанию Сямы». |
| 09-17 09:44 | `419fd519` | **Flipped back to draft**: «и нет, давай таки plan, не спеши». No source had been touched. |
| 09-17 12:10 | `e38488bb` | "raise the plan's bar — a real game in Phaser, not a form" |
| 09-17 16:33 | `5b3d166c` | "narrow the plan to stage one — a static meadow, the rest in #65" |
| 09-17 16:55 | `0b31bae1` | "no sprites — mushrooms grown by a seeded generator, drawn by code" |
| (9-day gap) | | |
| 09-26 08:20 | `e6163b69` | "plan the whole game as an elephant, eaten by an autonomous relay loop" (9 bites) |
| 09-26 08:22 | `b5d09745` | **The go-ahead flip** to `.in-progress.md`, commit subject quoting «(потирает ручки) ну, что, поехали?» + «весь процесс должен пройти полностью автономно, без единого моего вмешательства». Session `01MpLJGEigosCVuf9kvADaiS`. |
| 09-26 08:43 → 10-04 15:09 | 154 renames in all | paused ↔ in-progress at every session hand-off (`git log -M --name-status -- 'docs/plans/mushroom-game-syama.*'`) |
| 10-04 15:09 | `9bcb67b1` | → `.completed.md`: "fold bite 18, the last; the elephant is eaten" |
| 10-04 15:39 | `6e61b42b` | plan + bite files swept before landing |

The first seven commits carry author date 09-17 but committer date 09-26 08:17 (the branch was rebased onto main when the run started).

**What the first draft (09-17) foresaw:** a React page, not a game. Routes `/mushrooms`, `/mushrooms/en`, `/mushrooms/ru` with locales; Mantine `Button`s labelled from the i18n catalogue (matching the drawing's word-plus-square); **inline SVG in `currentColor` with hatched fills and no colour literals** — "an ink-drawing toy in the site's foreground colour"; a `useReducer` over `toy.ts` with `MAX_MUSHROOMS = 8`, `MAX_INSECTS = 24`; four cap kinds read off the drawing (spotted, plain, dark-top, dark-bottom); insects landing by CSS transition, off under `prefers-reduced-motion`. It read the drawing's top-right mark as "the page's own icon".

**What the elephant plan (09-26, `e6163b69`) foresaw — 9 bites:** 1 meadow still (Phaser; "if Turbopack and Phaser 4 disagree, that is the one stop-and-report"), 2 alive and heard, 3 `+`/`−`/picker/forest, 4 mouse house, 5 butterfly, 6 fly and bee — **MPP line** —, 7 dusk, 8 around the canvas (a way home, reduced motion, a hidden HTML button row for assistive tech, footer link), 9 the Artifact, then `/relay /finalize`.

**What got built — 19 bites (1–12, 12b, 13–18).** Bites 1–6 are the elephant's 1–6 almost as written. Then the run grew sideways: atmosphere (7), real species replacing the drawing's four cap patterns (8), the operator's two ideas (9 → walking meadow, flower keyboard), a flower instrument (10), panning (11), walking 360° (12), an edgeless field (12b), rain (13), its aftermath (14), mice/worms (15), the map (16). **Dusk, planned as bite 7, became bite 17.** "Around the canvas" (bite 8) was **dropped**: «сейчас это развлечение для одного ребёнка, а не продукт для апстора». The Artifact (bite 9) became a per-bite habit instead of a bite. Saving (18) was in neither plan; the operator asked for it. Locales, SVG, Mantine buttons and labelled controls all went: "no text anywhere".

**Striking small thing:** the completed plan's "What a child sees" calls the child **"she"** ("the sun, the clouds and the hills go round as she turns", "a drag … steps her along") although Syama is a boy and the plan's own intro says "the player is six … in his words".

### 2b. Bites: goal and dates

Dates are UTC committer dates of commits whose subject names the bite (`git log 250bab9..refs/pr/57 --format='%ci %s' | grep -i 'bite N'`), so overlapping ranges mean review fixes landing after the next bite opened. Numbering caveat: in `## Eaten so far` 12b is item 13, so `bite-13.md` is item 14 and so on.

| Bite | Title (plan) | Goal, one or two lines | Dates (first → last commit naming it) | Commits |
|---|---|---|---|---|
| 1 | The meadow, still | `/mushrooms` paints a sunny meadow and two spotted fly agarics from seeded genes; Phaser, model/ui split. | 09-26 08:21 → 09:08 | 11 |
| 2 | The meadow alive, and heard | Clouds drift, grass sways, mushrooms breathe; tap wobbles + spore puff; seven flowers chime; synthesized sound, mute button. | 09-26 09:09 → 09:55 | 11 |
| 3 | More mushrooms, and a forest | `+`/`−` as Syama drew them, a four-cap picker, select glow, a forest laid in depth. | 09-26 09:58 → 17:56 | 13 |
| 4 | The mouse house | House button; Syama's window row + door furnish a cap/stem; a mouse peeks out. First frames. | 09-26 17:57 → 23:56 | 21 |
| 5 | The butterfly | Butterfly button; flies in on a curve, drinks at flowers, rests on caps, tap sends it off; max 4. | 09-26 23:56 → 09-27 03:46 | 17 |
| 6 | The fly and the bee — the MPP line | Flies favour fly agarics; bees carry pollen and plant flowers in a ring. Every control in the drawing works. | 09-27 (one mention 09-26) → 09-28 11:06 | 29 |
| 7 | Atmosphere | One light (`sunLight`) and air between layers: graded sky, haloed sun, misting hills, lit ground, inked creatures. | 09-28 11:06 → 17:10 | 28 |
| 8 | Real mushrooms | The four cap patterns become four real species: fly agaric, porcini, chanterelle, russula. | 09-28 17:10 → 09-29 10:58 | 23 |
| 9 | The operator's two ideas weighed, and the meadow on the ground | Mushrooms get feet on the ground; two Russian idea docs (walking meadow, flower keyboard) written for the operator's call. | 09-29 08:55 → 21:29 | 47 |
| 10 | The flowers as an instrument, and the child plants them | Every flower a note or drum (20 voices, darker = lower); tap a tuft → colour→shape picker plants a flower. | 09-29 15:46 → 09-30 17:52 | 29 |
| 11 | A wider meadow, panned | World 5.764 units wide (two tablet screens); the screen a crop the child drags. | 09-30 17:49 → 10-01 05:04 | 37 |
| 12 | Walking the meadow | Turn 360° and step along the heading on a plane through a panoramic lens; the round brow; keys. 146 frames, 9 topic files. | 10-01 05:07 → 10-02 16:11 | 59 |
| 12b | The meadow has no edge | Structural: an edgeless field, every rule judged from the snapped eye; frame cost. Kept its own review session. | 10-02 16:12 → 10-03 06:26 | 49 |
| 13 | Rain | A tapped cloud brings a shower: wash, drops, flowers fold to buds, caps swell, a rainbow after. | 10-03 04:38 → 11:13 | 20 |
| 14 | After the rain | Insects shelter under caps; shed spores sprout into little mushrooms; the ground under the finger. | 10-03 07:10 → 16:25 | 35 |
| 15 | The house's dwellers | The operator's three asks after playing 14: mice run only to another door, a mouse sized to its door, a window tap brings a worm. | 10-03 12:11 → 18:57 | 32 |
| 16 | The map | Idea 1's last piece: a folded-map button replaces the mute button; a top-down map with side pictures. | 10-03 17:19 → 10-04 12:28 | 31 |
| 17 | Dusk | Tap the sun → dusk (glowing windows, fireflies, crickets, mice out, fliers settle, flowers close); the moon brings day; steps/flight toggle. Artifact v29. | 10-04 04:22 → 14:33 | 27 |
| 18 | The meadow is kept | IndexedDB save, meadows numbered in the URL hash, versioned zod record. Artifact v30. | 10-04 12:58 → 15:10 | 19 |

Bites 1–3 each took well under an hour of wall time (bite 1: claimed 08:24, `feat` 08:35, paused 08:43); from bite 9 on a bite took 12–30 h.

### 2c. Decisions log (`decisions.md`, 1,867 words) — notable entries

- **No text anywhere** → no locales; every control a pictogram drawn by code.
- **No sprites, no asset files** — every creature a seeded generator (seed → genes) painted with Phaser `Graphics`; sound synthesized; "Sound off is the device's; the top-left circle is the map's."
- **Phaser 4** on this route alone, dynamic import, `Scale.NONE` with a device-pixel buffer (`Scale.RESIZE` blurred retina tablets), no physics engine.
- **A pure model decides, the scene reconciles** — a resize repaints, never destroys; randomness injected.
- **Made for a six-year-old's hands** — ≥ ~64 CSS px targets, one drag with a 24 px slop and axis lock, one long press (on a flower), no double taps; tablet landscape primary.
- **The child walks a small round world** — the sun as compass, the brow on the `D_SEE` circle, far things sink and pale.
- **"Juice is the product"** — squash/stretch, `Back.Out`, idle motion; "Checked by frames, not by reading code".
- **The meadow is a small ecosystem — the twist** (operator: «какие-то экологические штучки должны прослеживаться»), **shown, never taught** («это не должно быть в виде назойливого научения»); nothing starves, dies or is lost.
- **No tap is ever answered with a shrug** — `−` with no selection sinks the newest; an impossible action shakes its head with a "nuh-uh".
- **A tap on a resting insect goes through it**; **a tap on fliers reaches the body nearest the finger**, not the top-drawn one.
- **Butterflies are a meadow, not siblings** — many base colours; cruise at two-thirds of bite 5's speed so a finger can catch one.
- **Mandala-inspired ornament** (Leysan's), echoing the plan's four-loves line «от Сямы идея, от меня любовь к процедуркам, от Золтана к экологии, от Лейсан к Мандалам».
- **The `palette*.ts` modules hold every colour literal.**

### 2d. `to-check.md` (the operator's hand-check box, in Russian)

«просто держи копилочку того что нужно проверить из сессии в сессию». At the end: **46 open items, 7 checked** — all seven checked on 10-02 in his words (e.g. «движения когда тыкаешь по насекомым -- шикарно», «громкости -- ок», «звук взлёта шикарный», «скорости -- порой странно, но не будем заморачиваться пока», the shadowless butterfly «спишем пока на плоский билборд бабочки», with `frames/bite-12/operator/butterfly-shadow-unseen.webp`). Nothing was checked after 10-02, so the hand checks of bites 12b–18 were all open at merge.

### 2e. Standing rules in the plan (§ "How this elephant is eaten")

- Review moved **into the bite's tail as a subagent** after the operator agreed separate review/`/handle` sessions cost ~40% of spend and doubled relays («да»); 12b kept its own review session.
- Relay chain capped at 8 deep: «менять relay на что-то другое в этот подход megabeast-a точно не надо».
- `the-five-percent.md` **frozen** for the run: «пятипроцентник зафиксируй и НЕ пополняй, учитывая что все код ревью будут НЕ от меня».
- Every session and subagent on Opus, named explicitly («в этой задаче все новые должны идти опусом»; the operator's default is Sonnet).
- Megabeast notes filled at the end of every session, before the relay.
- Stop only for the unrecoverable: «взломать весь интернет, стереть мой локальный диск».
- A play run fixes game bugs; harness-hard checks go to `to-check.md`; «не трёхэтажные сценарии».
- Frames committed every bite («хранить всякие скриншоты в remove-before-merging вместо tmp, хочу периодически на них посматривать»), old ones retired with tombstones («давай введём в привычку их ретайрить — оставляя thombstones … но не храня всё это в живой ветке»).
- An Artifact at every bite's end («атефакт в конце каждого байта, чтобы по ходу дела тоже можно было тестировать без установки»).
- Performance waits: «к перформанс улучшениям вернёмся когда и если это станет критичным» — the 26 ms frame line prints, never fails.

## 3. Megabeast notes and the five percent

`.claude/skills/megabeast/notes/` on main: README + 6 theme files, 17,681 words (contract 2,105 · pickup-and-relay 2,330 · subagents 4,551 · gates 2,134 · play-run-and-frames 2,873 · quality 3,392). Not a skill yet: "no `SKILL.md`, so nothing loads it". The operator's ask, verbatim in the README: «файлик будущего скилла, который будет это всё автоматизировать (рабочее название megabeast). Не сам скилл, а именно соображения…»; «заполнять в конце каждой сессии перед релеем». Full list of ~150 bold lead-ins, by file and section: `tmp/case-study/work/megabeast-leads.txt`.

Lessons most useful for the post (file in brackets):

- The loop lived in the plan, and that worked; standing constraints travel verbatim, or they stop applying; the model is named, never inherited [contract.md].
- An operator playing the build mid-bite is the richest input the loop gets; each note is a plan edit, never a queue [contract.md].
- "Pause, I'll take it manually" is a relay with a reset depth [contract.md].
- The base context eats half the budget before the bite starts (bite 2: ~115k of 200k before a line was written) [pickup-and-relay.md].
- A structural bite does not fit one session, even orchestrated (bite 11 crossed 200k with one of five packages built; the core agent ended at 254k); more than two sequential packages is two bites [pickup-and-relay.md].
- Reading an Artifact before republishing costs ~40k tokens [pickup-and-relay.md].
- A relay chain stops at eight deep, and the operator's paste is part of the loop; read the depth, never count it [pickup-and-relay.md].
- Every session is an orchestrator from its first turn; an agent lands one step, maybe two, whatever the brief lists [subagents.md].
- The review is fresh-eyed subagents in the bite's tail, not two sessions [subagents.md].
- The export's authorship label reads the loop's own review as answered (every thread showed `@vzakharov (agent)`) [subagents.md].
- A container restart or usage limit kills running agents silently; bite 16's session woke only on the operator's «что это всё остановилось?» [subagents.md].
- Each agent in its own worktree; waves grouped by the files they touch [subagents.md].
- Vet at every bite's end pays for itself (bite 1's first vet: 17 lint errors, four gates red) [gates.md].
- **A branch's commit count is mostly the loop's own noise**: at bite 15, 2,896 commits = 990 cost rows + 423 pull merges, code under a quarter; operator: «откуда стока?»; fix: agents land one squash commit each, the cost hook commits only after a human record (`52f6bf0b`) [gates.md].
- **The play run's cost can outgrow the build**: by bite 12 the operator stopped the five-screen runs («эти прогоны занимают больше времени (и токенов) чем собственно написание игры») → `to-check.md`; later restored with the game-red / harness-red split [play-run-and-frames.md].
- Step the simulation, never time a screenshot; seed `Math.random`; read drawn sizes, not model state; sound is reviewed by rendering it; "drawn" is not "seen" [play-run-and-frames.md].
- The orchestrator looks at frames itself, however green the reports; frames catch what code reads past [play-run-and-frames.md].
- The operator's own play finds what the frames miss (bite 12: sinking read as burying; the fix agent's trace found the plan's description of the code wrong) [play-run-and-frames.md].
- **When the checks start finding the checks, stop the chase** (bite 12 veer play: four rounds, one real defect, two the play's own errors; the operator asked whether anyone had spiralled) [quality.md].
- **The operator at the keyboard finds what no play measures** (bite 17: 20 fps at dusk on a real Mac while every headless play passed 26 ms; a swipe flying ~50 m since bite 14; tufts pinned under the horizon that a test asserted; the moon's tap lost to a cloud) → publish the Artifact mid-bite [quality.md].
- A subagent's report is a lead, not a citation; every comment carries an `Ask:` with a checkable property [quality.md].
- A bound the code makes true by construction tests nothing; a sweep kept as a test is broken on purpose once [quality.md].

**the-five-percent.md** (main, 379 lines, 3,754 words): a grep for mushroom / Сям / Syama / bite / megabeast / #57 / meadow / мухомор finds **no entry**. That fits the plan's standing rule that the file was **frozen** for the run («пятипроцентник зафиксируй и НЕ пополняй, учитывая что все код ревью будут НЕ от меня»). Its taxonomy (headings with counts: "What it was handed, it treats as fixed (×37)", "An account that explains the code stands in for running it (×16)", …) was the reviewer subagents' reading list. Not checked: whether any entry dated 09-17…10-04 came from #57 without naming it.

## 4. Costs

The chain's total at Claude API rates: **$1,777.15 over 92 sessions** — $449.85 in the sessions' own turns, $1,294.57 in subagents (the rest falls in neither bucket). 4.61 billion cache-read tokens, 4.15 million output tokens. The five most expensive sessions: $69, $64, $48, $44, $40. Window 2026-09-17 09:33 → 2026-10-04 17:41 UTC. Agent estimates mid-run: $904 / 47 sessions (relay 052), $1,634 (relay 077). The last cost-row commit's "total 4.47 USD" is one session's, not the chain's.

```python
import json, glob
m = [json.load(open(f)) for f in glob.glob('.claude/costs/sessions/*/*.json')]
m = [r for r in m if r.get('branch') == 'claude/mushroom-game-syama-lbirv7' or 57 in (r.get('prs') or [])]
print(len(m), sum(r['total']['costUsd'] for r in m))
```

## 5. PR and issue — not done; bite 1 does it

To do: `gh issue view 65 --comments` (spec, drawing attachment URLs); `gh pr view 57 --json reviews,comments`; `gh api repos/vzakharov/vovazakharov.com/pulls/57/comments --paginate`. Note that every loop review posts as `vzakharov` (agent), so human comments must be told apart by content/language or the export's "(agent)" label.

## Open questions

1. The pixel-art room-game screenshot `docs/pr/57/attachments/44a2f807-….png` (added 09-29 by a PR-export refresh): which comment attached it, and why? A reference the operator offered for the map's style («как в старых пиксельных ходилках вида сверху», bite 16)?
2. Chain total cost in USD (§ 4).
3. Which PR comments are the operator's own (§ 5).
4. Whether any the-five-percent entry dated in the run came from #57 unnamed.
5. The completed plan calls the child "she" — keep as a detail for the post, or ignore?
6. 46 open hand checks at merge, none checked after 10-02: did the operator check them on Syama's tablet before merging?

