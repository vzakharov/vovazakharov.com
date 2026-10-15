# PR #162: feat(vova): a volume control in the player bar, MP3 by default with HQ for FLAC

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/162
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/player-volume-hq-wlrh1o
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-15T07:47:10Z
- **Updated:** 2026-10-15T18:26:30Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:13 — unresolved — last: @vzakharov (human) 2026-10-15T18:24:28Z — "ну тогда просто поповер не нужен, оставляем только кнопку hq" → [↓](#t01)
- **T02** `src/pages/music/lib/use-audio-player.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-15T18:25:23Z — "раздуло, давай резать" → [↓](#t02)

---

## Body

## Summary

- The player bar gains a volume button: right of the seek bar on wide screens, at the right end of the buttons' row on narrow ones. It opens a vertical volume slider with an **[HQ]** toggle above it.
- Playback is MP3 by default now that every song has one; **HQ** switches to the lossless master (FLAC), and switching mid-song resumes at the same moment — on the radio too, which then re-syncs to the station.
- Volume and HQ are remembered per browser beside shuffle and the time readout: `useStoredFlag` becomes `useStoredSetting`, which stores a number as well as a switch.
- iOS ignores a page's volume, so there the slider is left out and the popover holds HQ alone. The player's tracks carry their MP3 URL through `mp3Url`, which the downloads and the feeds now share.

## QA Checklist

- [ ] `default-mp3` — in a fresh browser, play a song: the network tab shows the `.mp3` loading, not the `.flac`
- [ ] `layout-wide` — at desktop width the volume button sits right of the time readout, at the bar's right edge
- [ ] `layout-narrow` — on a phone the volume button sits on the buttons' row, pushed to its right end, with the seek bar below
- [ ] `volume` — open the popover and drag the slider: loudness follows, the loud end is at the top, and the icon drops to one wave below half and to a cross at zero
- [ ] `hq-switch` — mid-song, press **HQ**: it fills in, the `.flac` loads, and playback carries on from the same moment rather than the top
- [ ] `hq-radio` — tuned in to the radio, toggle **HQ**: the song keeps playing in step with the station
- [ ] `persist` — reload the page: the volume and HQ come back as left; in a private window they hold for the visit
- [ ] `ios` — on an iPhone the popover shows **HQ** without a slider, and the hardware buttons control loudness

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `default-mp3` | unit | ✅ | `use-stored-setting.test` — `lossless` defaults to off; `trackSource` picks `mp3` then |
| `layout-wide` | manual-only | — | Visual placement; checked by headless capture at 1280px |
| `layout-narrow` | manual-only | — | Visual placement; checked by headless capture at 390px |
| `volume` | e2e | ❌ | Drive the slider over CDP, assert the element's `volume` and the icon |
| `hq-switch` | e2e | ❌ | Checked by hand over CDP: `.mp3` → `.flac`, playback continued past the switch point |
| `hq-radio` | manual-only | — | Needs the live station clock against a real network load |
| `persist` | unit | ✅ | `use-stored-setting.test` — parse of stored values and the fallbacks |
| `ios` | manual-only | — | Real iOS Safari's read-only `volume` |

https://claude.ai/code/session_015ud6PDz3sFNYKiNAuCfYz5

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-15T07:47:26Z — "Proposed squash body: ``` Every song now has an MP3 beside i…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-15T07:47:26Z

[https://github.com/vzakharov/vovazakharov.com/pull/162#issuecomment-6187177332](https://github.com/vzakharov/vovazakharov.com/pull/162#issuecomment-6187177332)

Proposed squash body:

```
Every song now has an MP3 beside its master, so the player plays the
MP3 by default and leaves the lossless FLAC to a reader who asks for
it.

The player bar gains a volume button — right of the seek bar on wide
screens, at the right end of the buttons' row on narrow ones. It opens
a vertical volume slider with an [HQ] toggle above it, which switches
playback to the master; a switch mid-song resumes at the same moment,
and on the radio the station re-syncs it. iOS ignores a page's volume,
so there the popover holds HQ alone.

Volume and HQ are remembered per browser beside shuffle and the time
readout: `useStoredFlag` becomes `useStoredSetting`, which stores a
number as well as a switch. The player's tracks carry their MP3 URL,
resolved by `mp3Url`, which the downloads and the feeds share.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:13 — unresolved — last: @vzakharov (human) 2026-10-15T18:24:28Z — "ну тогда просто поповер не нужен, оставляем только кнопку hq" → [↓](#t01)
- **T02** `src/pages/music/lib/use-audio-player.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-15T18:25:23Z — "раздуло, давай резать" → [↓](#t02)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:13 — unresolved

```diff
@@ -0,0 +1,25 @@
… 8 lines elided …
+screens, at the right end of the buttons' row on narrow ones. It opens
+a vertical volume slider with an [HQ] toggle above it, which switches
+playback to the master; a switch mid-song resumes at the same moment,
+and on the radio the station re-syncs it. iOS ignores a page's volume,
+so there the popover holds HQ alone.
```

**@vzakharov (human)** — 2026-10-15T18:24:28Z

ну тогда просто поповер не нужен, оставляем только кнопку hq

---

<a id="t02"></a>

### `src/pages/music/lib/use-audio-player.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-15T18:25:23Z

раздуло, давай резать

---

## Timeline (status, references, and other events)

- **2026-10-15T18:26:30Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/162#pullrequestreview-5537976930.
