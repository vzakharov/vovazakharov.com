# PR #207: refactor: #170 the player as music's feature, music's app layer

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/207
- **Author:** @vzakharov (human)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/music-player
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-25T19:21:57Z
- **Updated:** 2026-10-26T01:53:19Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/plans/multi-app-sliced-design.paused.md`:241 — unresolved — last: @vzakharov (human) 2026-10-26T01:35:02Z — "что-то пошло не так?" → [↓](#t01)
- **T02** `src/music/features/player/ui/player.module.scss`:8 — unresolved — last: @vzakharov (human) 2026-10-26T01:49:40Z — "> Одно решение за тобой. Миксин fill из двух строк (flex: 1;…" → [↓](#t02)
- **T03** `src/music/pages/music/ui/music-page.tsx`:21 — unresolved — last: @vzakharov (human) 2026-10-26T01:51:48Z — "а этому size не место в catalogueInfo случайно? или это друг…" → [↓](#t03)

---

## Body

Slice 5b of Multi-App Sliced Design (#169), the second of slice 5's three bites: the player becomes a feature of the music app, and music gets an app layer of its own. 5c, the five pages, follows. `docs/plans/multi-app-sliced-design.paused.md` § "Eaten so far" holds what landed.

## Summary

- **The player is `music/features/player`.** Its provider, bar and the controls pages place (`TrackButton`, `SongPlayButton`, `AlbumPlayButton`, `LaunchButtons`) sit in `ui/`, its state and hooks in `model/`, tests beside them. The pages and the app layer both reach it, which is what earns it a slice.
- **The 580-line stylesheet is cut on its seam.** The bar's and its controls' rules leave `music.module.scss` as the feature's `player.module.scss`. No class sits in both. The two-line `fill` mixin is restated in each sheet, each having one use.
- **What the bar and the pages both draw is music's `shared/`.** `Spelling` and `BillingLinks` go to `shared/ui`, `duration.ts` to `shared/lib`.
- **Music's app layer** mounts the player (`MusicLayout`), maps an address to a page (`MusicRoute`) and parses the route (`music-route-params.ts`). The page prop types stay with the pages, whose barrel now exports the five pages and their metadata, ready for 5c. vova's router and sitemap enter the app layer.

## QA Checklist

- [ ] `music-index` — `/music` renders its tabs and grid as before.
- [ ] `shuffle` — "Shuffle all" on `/music` starts a song and the bar appears pinned at the bottom, styled.
- [ ] `bar-controls` — on the bar: pause/play, previous/next, seek, the volume popover with its lossless chip, the radio toggle.
- [ ] `song-page` — a song page's play button and track list buttons drive the bar; its video button pauses the player.
- [ ] `album-page` — an album page's play button queues the album.
- [ ] `radio` — `/music/radio` tunes in and shows what is on air.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `music-index` | Yes, Playwright | Build only | `pnpm build:vova` renders every music route |
| `shuffle` | Yes, Playwright | Looked at | Checked on the built export: the bar renders `position: fixed` with the song playing |
| `bar-controls` | Yes, Playwright | No | |
| `song-page` | Yes, Playwright | No | |
| `album-page` | Yes, Playwright | No | |
| `radio` | Partly, the station depends on the clock | No | |

https://claude.ai/code/session_017PT9kRkm8m3Wpp8cQwf9QK

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-25T19:22:06Z — "Proposed squash body: ``` The second of slice 5's three bite…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-25T19:22:06Z

[https://github.com/vzakharov/vovazakharov.com/pull/207#issuecomment-6402067820](https://github.com/vzakharov/vovazakharov.com/pull/207#issuecomment-6402067820)

Proposed squash body:

```
The second of slice 5's three bites, which turn music from one page
slice into an app of its own. The player, the one thing every music
page shares, sat inside the pages slice, so the pages could not be
split from each other without first taking it out.

music/features/player now holds the player: its provider, bar and the
buttons pages place, its state and hooks under model/. Its rules leave
music.module.scss as player.module.scss, cut on the seam; what the bar
and the pages both draw, Spelling, BillingLinks and duration, goes to
music's shared/.

Music gets an app layer that mounts the player, maps an address to a
page and parses the route. The page prop types stay with the pages,
whose barrel exports the five pages and their metadata, ready for the
last bite.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/plans/multi-app-sliced-design.paused.md`:241 — unresolved — last: @vzakharov (human) 2026-10-26T01:35:02Z — "что-то пошло не так?" → [↓](#t01)
- **T02** `src/music/features/player/ui/player.module.scss`:8 — unresolved — last: @vzakharov (human) 2026-10-26T01:49:40Z — "> Одно решение за тобой. Миксин fill из двух строк (flex: 1;…" → [↓](#t02)
- **T03** `src/music/pages/music/ui/music-page.tsx`:21 — unresolved — last: @vzakharov (human) 2026-10-26T01:51:48Z — "а этому size не место в catalogueInfo случайно? или это друг…" → [↓](#t03)

<a id="t01"></a>

### `docs/plans/multi-app-sliced-design.paused.md`:241 — unresolved

```diff
@@ -215,20 +216,264 @@ stylesheet every layer shares, and a dozen layer calls.
… 20 lines elided …
 roots it finds no FSD root at all (Steiger 0.6.0); it skips gitignored paths, so
 a spike goes in the scratchpad, run from the repo root so its config resolves.
 
+## Rest of the elephant`, so the
+
+elephant's branch holds the current contract once the bite is merged into it.
```

**@vzakharov (human)** — 2026-10-26T01:35:02Z

что-то пошло не так?

---

<a id="t02"></a>

### `src/music/features/player/ui/player.module.scss`:8 — unresolved

```diff
@@ -0,0 +1,213 @@
+@use '../../../../../styles/mantine' as mantine;
+
+// Takes the space its row leaves, and may shrink below its content to do it —
+// a flex or grid item's automatic minimum is otherwise its content's width.
+@mixin fill {
+  flex: 1;
+  min-width: 0;
+}
```

**@vzakharov (human)** — 2026-10-26T01:49:40Z

> Одно решение за тобой. Миксин fill из двух строк (flex: 1; min-width: 0) теперь продублирован в обоих SCSS, по одному использованию в каждом. Я оставил так: общий Sass-партиал ради двух деклараций дороже повтора. Если хочешь иначе, есть два варианта: вписать две строки прямо в классы или завести общий файл в styles/.

давай общий файл, в src/music/shared, получается?

---

<a id="t03"></a>

### `src/music/pages/music/ui/music-page.tsx`:21 — unresolved

```diff
@@ -18,15 +18,15 @@ import {
   trackNames,
 } from '@/music/shared/catalogue';
 import { messages } from '@/music/shared/i18n';
+import { catalogueSize } from '@/music/shared/lib/duration';
```

**@vzakharov (human)** — 2026-10-26T01:51:48Z

а этому size не место в catalogueInfo случайно? или это другое?

---

## Timeline (status, references, and other events)

- **2026-10-26T01:53:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/207#pullrequestreview-5646465184.
