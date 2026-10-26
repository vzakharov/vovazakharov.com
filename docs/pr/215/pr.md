# PR #215: fix(vova): one audio element on iOS, the next song fetched into memory

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/215
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/ios-one-deck-sezifk
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T08:49:21Z
- **Updated:** 2026-10-26T09:13:42Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:4 — unresolved — last: @vzakharov (human) 2026-10-26T09:08:03Z — "не всегда, конечно -- но иногда всплывало" → [↓](#t01)

---

## Body

## Summary

- On an iPhone the current song and the next one were heard playing over each other. The player preloads the next track on a second audio element, and iOS is where that second element has been heard starting beside the first; the report came without a way to reproduce it.
- iOS (iPadOS included) now gets a single element. Once the playing track can play through, the next one is fetched whole into a blob, and changing to it — at a track's end or on a skip — points the same element at that in-memory copy, so the change still starts without a request. A copy no longer due is aborted and released; a failed fetch surfaces as an error and that track loads from the network, the gap the player had before preloading.
- Every other browser keeps the two decks: a standby deck is already decoded when the outgoing track ends, so it joins songs tighter than one element changing its source can, which segues written to run straight on need.
- Both kinds of audio answer the same `Decks` contract, which now names the file loaded itself (`loaded`, `load`) rather than leaving the player and the radio to read the element's `src` — on iOS a blob URL.

## QA Checklist

- [ ] `ios-end` — On an iPhone, play a song, scrub to its last seconds and let it end: the next song starts, and only one song is ever heard.
- [ ] `ios-skip` — On an iPhone, wait ~30 s into a song, press Next: the next song starts at once, alone.
- [ ] `ios-segue` — On an iPhone, play the track before a segue (PSCHPTHY → Normal) to its end: Normal follows with at most a short gap, nothing overlaps.
- [ ] `ios-lock` — On an iPhone, start a song, lock the screen, let it end: the next one plays from the lock screen, alone, and the lock screen shows its title.
- [ ] `ios-radio` — On an iPhone, tune in the radio and let a slot change: the next slot's song plays, on the station's time, alone.
- [ ] `ios-hq` — On an iPhone, switch HQ on and off mid-song: playback picks up where it was, and the next track still preloads.
- [ ] `desktop` — On desktop Chrome or Firefox, repeat `ios-end` and the segue: the join is as tight as before.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `ios-end` | manual-only | — | The bug is WebKit's on a real iPhone; headless Chromium with an iPhone UA showed one element and a blob-sourced next track, which is not iOS |
| `ios-skip` | manual-only | — | Same: the headless check saw the skip play from the prefetched blob |
| `ios-segue` | manual-only | — | The gap is heard, not asserted |
| `ios-lock` | manual-only | — | Lock-screen playback and Now Playing exist only on the device |
| `ios-radio` | manual-only | — | Needs real iOS playback against the station clock |
| `ios-hq` | manual-only | — | AVFoundation's seek on the MP4 rewrap is device behaviour |
| `desktop` | manual-only | — | A join's tightness is heard, not asserted |

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T08:49:44Z — "Proposed squash body: ``` On an iPhone the current song and…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T08:49:44Z

[https://github.com/vzakharov/vovazakharov.com/pull/215#issuecomment-6411956417](https://github.com/vzakharov/vovazakharov.com/pull/215#issuecomment-6411956417)

Proposed squash body:

```
On an iPhone the current song and the next were heard playing over
each other. The player preloads the next track on a second audio
element, and iOS is where that second element has been heard starting
beside the first.

iOS, iPadOS included, now gets a single element. Once the playing
track can play through, the next one is fetched whole into a blob, and
changing to it, at a track's end or on a skip, points the same element
at that in-memory copy, so the change still starts without a request.
A copy no longer due is aborted and released; a failed fetch surfaces
as an error and that track loads from the network.

Every other browser keeps the two decks, whose standby is already
decoded when a track ends and so joins segues tighter than one element
changing its source. Both answer the same Decks contract, which now
names the file loaded itself (`loaded`, `load`), the player and the
radio no longer reading the element's src, a blob URL on iOS.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:4 — unresolved — last: @vzakharov (human) 2026-10-26T09:08:03Z — "не всегда, конечно -- но иногда всплывало" → [↓](#t01)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:4 — unresolved

```diff
@@ -0,0 +1,27 @@
+Proposed squash body:
+
+```
+On an iPhone the current song and the next were heard playing over
```

**@vzakharov (human)** — 2026-10-26T09:08:03Z

не всегда, конечно -- но иногда всплывало

---

## Timeline (status, references, and other events)

- **2026-10-26T09:13:42Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/215#pullrequestreview-5649641646.
