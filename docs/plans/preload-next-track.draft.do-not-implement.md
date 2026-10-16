> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Preload the next track for seamless playback

## Why there is a gap today

The player is one `Audio` element (`src/pages/music/lib/use-audio-player.ts`).
When a track ends, `ended` dispatches `step`, React re-renders, and the effect
assigns the next track's `src` to the same element. Only then does the browser
start fetching it from `raw.githubusercontent.com` — a cold request, then
buffering, then decode. The silence between songs is that whole chain, and on a
`segue` pair (a song written to run into the next) it breaks the music in two.

## Approach — two decks

Two `Audio` elements, like a DJ's two decks: the **active** one plays, the
**standby** one loads the upcoming track in advance. At `ended`, the standby
starts playing **inside the `ended` handler itself**, synchronously, before the
reducer round-trip — which is what removes the gap rather than shortening it —
and the two swap roles. The reducer then steps as it does today; the source
effect finds the active deck already holding the wanted `src` and loads nothing.

### What moves where

1. **`player-state.ts` — `upcomingTrack(state)`**: the catalogue position
   `step by: 1` would land on (wrapping, as `step` does), or `undefined` before
   anything plays or when the queue holds one track. Pure, tested in
   `player-state.test.ts`.
2. **`use-station.ts` — `upNext()`**: on the radio, the track of the slot after
   the current one (`nextStation` at the current slot's end), so a radio
   hand-over is seamless too. Undefined off the radio.
3. **New `use-decks.ts`** (keeps `use-audio-player.ts` under the size line):
   owns the two elements and which one is active.
   - `active()` replaces `audioRef.current` everywhere it is read, including the
     `element` the station is handed.
   - Element listeners are wired on both decks; each handler acts only when its
     deck is the active one, so the standby's own `play`/`pause`/`ended` never
     reach the reducer.
   - Volume is applied to both.
   - **Arming**: once the active deck has `PRELOAD_LEAD` (30 s) or less left,
     the standby gets `preload = 'auto'` and the upcoming track's `src` (in the
     current quality, via the existing `source`). Re-armed whenever the upcoming
     track, the quality or the radio state changes; a standby whose `src` no
     longer matches the upcoming track is simply re-pointed.
   - **Swap at `ended`**: if the standby holds the source the next step wants,
     `standby.play()`, swap, then dispatch as today. Otherwise today's path.
   - **Swap on a manual change too**: when the source effect is about to load a
     `src` the standby already holds (the reader pressed next near the end), it
     swaps instead of reloading.
4. **`use-audio-player.ts`**: the element-construction effect and the source
   effect move onto `useDecks`; the controls keep their shape.

### The fallback is today's behaviour

A browser may refuse `play()` on an element the reader never touched — iOS
Safari on a locked screen is the likeliest. A rejected standby `play()` (other
than `AbortError`) falls back to assigning the `src` to the active deck exactly
as today, so the worst case is the current gap, never silence or a stuck player.
The refusal itself is the browser's answer, not an error to swallow: it is the
same autoplay state the existing `play()` catch already handles.

### Accepted costs

- **Bandwidth**: the upcoming track's first ~30 s is fetched even when the
  reader then skips elsewhere — ~1 MB of MP3, ~4 MB of FLAC per skip inside the
  last 30 s. Arming earlier would buy nothing on top of 30 s and cost more.
- **Not sample-accurate.** `ended` fires a few milliseconds late, and an MP3
  carries encoder padding unless the browser trims it from the LAME header
  (Chrome and Firefox do). Expect a gap of tens of milliseconds at worst,
  inaudible between songs, faintly audible on a segue. Sample-accurate joins
  need Web Audio with the whole file decoded into memory — ~190 MB for a
  nine-minute FLAC — which this plan does not do.
- `raw.githubusercontent.com` sends `cache-control: max-age=300`; the decks do
  not depend on the HTTP cache at all, since the standby holds its own buffer.

## Alternatives not taken

- **Prefetch into the HTTP cache, one element** (a hidden element or `fetch`
  warms the cache, the active element still switches `src`): smaller, but the
  switch still waits on the React round-trip, the element's reset and decode
  start — a shorter gap, not none. Moving from it to two decks later would be a
  rewrite of the same code, not an amendment.
- **Web Audio with decoded buffers**: truly gapless, but the memory cost above
  and the loss of streaming rule it out.

## Verification

- `pnpm test` over `player-state.test.ts` (`upcomingTrack`) and
  `station.test.ts` (the radio's upcoming slot).
- `/preview` of the music page in headless Chromium: play a `segue` pair, seek
  to 5 s before the end, and log the time between the outgoing deck's `ended`
  and the incoming deck's `playing`; check the network panel shows the next file
  requested ~30 s before the end and not earlier.
- Manual on a phone (QA checklist): lock screen across a track change, and radio
  hand-over.

## DRY notes

- **Reused**: `trackSource`/`source` for the standby's `src`; `step`'s wrap rule
  is the one `upcomingTrack` mirrors — it is written beside `step` so the two
  stay one rule, and its test pins them together; `nextStation` for the radio.
- **Shared, not duplicated**: the listener table in `use-audio-player.ts` is
  wired onto both decks by one loop, with the active-deck guard in one place,
  rather than a second table for the standby.
- **Not extracted**: the two-deck logic stays in `pages/music/lib`, its one
  consumer; the mushrooms page's audio is Web Audio synthesis and shares nothing
  with a media-element player.
