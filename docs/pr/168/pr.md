# PR #168: feat(vova): HQ switches without a gap, the old file playing on

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/168
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/seamless-quality-switch-i2xtai
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-16T11:23:13Z
- **Updated:** 2026-10-16T12:38:08Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/pages/music/lib/deck-swap.ts`:34 — unresolved — last: @vzakharov (human) 2026-10-16T12:37:48Z — "никаких Pick, см. #158 (пока не доехал, но будем заранее гот…" → [↓](#t01)

---

## Body

## Summary

- **HQ switches without the song going quiet.** A change of quality used to reload the playing element, so the song stopped for as long as the other file took to arrive. Now the standby deck (the second `<audio>` that already preloads the next track) takes the switch: it loads the other file, seeks to where the song is so it fetches from there rather than from the top, and once it holds a second past the song's current moment it aligns there and starts — the old file playing on until the new one sounds.
- **The cut lands within ~10 ms.** Measured in headless Chromium against a local server with Range support, a 400 ms first-byte delay and a bandwidth cap barely above a FLAC-in-MP4's bitrate: 0 ms of silence, the new file starting 8–10 ms behind where the old one stopped.
- **Every interleaving has an answer.** A switch while paused swaps at once; switching back, or a new track loading onto the active deck, calls a switch under way off; a seek meanwhile realigns it; a switch in a song's last second still lands. The HQ chip's spinner stays up until the swap lands.
- **The fallback is the old behaviour, not silence.** Where the standby deck cannot take over — a browser refusing a deck the reader never started (WebKit, before the first gapless transition), or the file failing to load there — the active deck loads the file in place and resumes where it was, exactly as before.

## QA Checklist

- [ ] `swap-playing` — Play a song with an HQ chip, toggle HQ on: the song keeps playing with no pause, and the spinner gives way to the lit chip once the lossless file takes over.
- [ ] `swap-back` — Toggle HQ off again mid-song: same, back to MP3, no pause.
- [ ] `call-off` — Toggle HQ on and immediately off again: playback never stops, the chip ends unlit with no spinner left over.
- [ ] `swap-paused` — Pause, toggle HQ, press play: the song resumes from where it was paused, in the new quality.
- [ ] `seek-mid-swap` — Toggle HQ and seek straight away: the song plays from the seek point, and the swap lands there.
- [ ] `next-track` — After a switch, let the song end: the next track still starts gaplessly (the standby deck re-preloads it).
- [ ] `radio` — With the radio tuned in, toggle HQ: the station stays on time.
- [ ] `ios` — On an iPhone, play the first song and toggle HQ before any track change: playback switches, with at most the short gap the old behaviour had.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `swap-playing` | e2e | ❌ | Scripted Chromium sampling both decks every 10 ms — gap and cut offset; run ad hoc for this PR, not in the suite (the suite covers no component or route) |
| `swap-back` | e2e | ❌ | Same harness, reverse direction |
| `call-off` | e2e | ❌ | Same harness, `swapIn` back within 300 ms |
| `swap-paused` | e2e | ❌ | Same harness, paused before `swapIn` |
| `seek-mid-swap` | e2e | ❌ | Same harness, seek 400 ms into the swap |
| `next-track` | e2e | ❌ | Drive the player to a track's end after a swap, assert the standby deck was re-armed |
| `radio` | manual-only | — | Wall-clock station timing against a real clock |
| `ios` | manual-only | — | WebKit's per-element autoplay policy; headless Chromium does not reproduce it |

https://claude.ai/code/session_01CUX3SSQcqu7TRBpW2LhEdX

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-16T11:23:32Z — "Proposed squash body: ``` A change of quality reloaded the p…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-16T11:23:32Z

[https://github.com/vzakharov/vovazakharov.com/pull/168#issuecomment-6214426178](https://github.com/vzakharov/vovazakharov.com/pull/168#issuecomment-6214426178)

Proposed squash body:

```
A change of quality reloaded the playing element, so the song went
quiet for as long as the other file took to arrive.

The standby deck, which already preloads the next track, now takes the
switch: it loads the other file, seeks to where the song is so it
fetches from there rather than from the top, and once it holds a second
past the song's moment it aligns there and starts, the active deck
playing on until it sounds. The cut lands within ~10 ms. A switch while
paused swaps at once; switching back or a new track calls one under way
off; a seek meanwhile realigns it.

Where the standby deck cannot take over — a browser refusing a deck the
reader never started, or the file failing there — the active deck loads
the file in place and resumes where it was, as before.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/pages/music/lib/deck-swap.ts`:34 — unresolved — last: @vzakharov (human) 2026-10-16T12:37:48Z — "никаких Pick, см. #158 (пока не доехал, но будем заранее гот…" → [↓](#t01)

<a id="t01"></a>

### `src/pages/music/lib/deck-swap.ts`:34 — unresolved

```diff
@@ -0,0 +1,332 @@
… 30 lines elided …
+ * resumes at once its length is known.
+ */
+type TakenInPlace = Bringing &
+  Pick<SwapDone, 'onLanded'> & { resumeAt: number; sought: boolean };
```

**@vzakharov (human)** — 2026-10-16T12:37:48Z

никаких Pick, см. #158 (пока не доехал, но будем заранее готовы)

---

## Timeline (status, references, and other events)

- **2026-10-16T11:23:33Z** @vzakharov renamed from «feat(vova): switch HQ without a gap, the old file playing until the new one can» to «feat(vova): HQ switches without a gap, the old file playing on».
- **2026-10-16T12:38:08Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/168#pullrequestreview-5547857471.
