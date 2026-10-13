> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Fixed radio

A **Radio** button beside **Shuffle all** on `/music`, and a round radio toggle in the player bar to the right of shuffle. Pressed, it plays what every other listener who pressed it hears at that moment — the same song, at the same second — **with no server**: the song and the second are a pure function of the current Unix time and the catalogue the page was built with. Any action on playback — pause, seek, skip, shuffle, picking a song — releases it. The radio also has a page of its own, `/music/radio`, with its own link card, to share.

## The station

The station is a timetable with no beginning, laid over Unix time, which is milliseconds since 1970 UTC on every device in every time zone — so the time zone question answers itself.

- **Cycles.** One cycle is the whole public catalogue (`listSongs()`, the player's own starting queue — never a hidden song appended later), played back to back in a permutation. Its length is the sum of the tracks' `seconds`. Cycle `k` covers `[k·L, (k+1)·L)` from the epoch.
- **Each cycle's order is a seeded shuffle**, the seed being `k` itself: `shuffleOrder` from `player-state.ts` with the cycle index as its seed. That is the "deterministic but high-entropy" part — nobody can predict cycle 20 371 without running the function, and everybody who runs it gets the same answer.
- **No song twice in a row across a cycle boundary.** When cycle `k+1` would open on the song cycle `k` closed on, that song swaps with its neighbour. Pure, and costs one comparison.
- **Lookup.** `stationAt(durations, nowMs)` → `{ cycle, order, cursor, offset }`: which cycle, its order, which slot in it, and how many seconds into that slot's song. Lives in a new pure `src/pages/music/lib/station.ts`, unit-tested.
- **A cycle is a list of slots, not a permutation of songs.** The lookup walks slots — cumulative durations, then a binary search — and never assumes a song fills exactly one. Today every song gets one slot per cycle, so the two coincide; the distinction is what lets ratings land later (below) as a change to how a cycle is filled, with the lookup, the handover and the timing untouched.

**A deploy that changes the catalogue redraws the station from that moment.** Two listeners are in sync while their pages were built from the same catalogue; a tab left open from before a deploy plays the old station until reloaded. Accepted: it is the price of no server, and the same property is what lets a re-rated catalogue take effect on its next deploy.

**Ratings, later and not in this change.** The operator means to rate songs, and the shuffle to favour the higher-rated. For the radio that is a weight per song: a song rated `w` gets `w` slots per cycle, its copies spread across the cycle rather than drawn at random — each copy's place keyed `(j + u)/w` for copy `j` and a seeded `u` per song — so a favourite comes round often but never twice running. The cycle's length stays a constant sum, which keeps the lookup O(log n) at any date. Two things that change will need doing then: released from the radio, the player's queue holds catalogue positions once each, so it takes the cycle's order with repeats dropped; and the bar's own shuffle, a permutation by design so that _previous_ returns to whatever _next_ reached, needs a weighting of its own — a biased order rather than repeats.

## Staying on time

The function says where the station _is_; the `<audio>` element has to be put there and kept there.

- **Seek after the load, not at the click.** The offset is recomputed from the clock at the moment the element can seek (`loadedmetadata`, or at once when the source is already loaded) — so however long the master takes to arrive, the listener joins the station where it is _then_, not where it was at the click.
- **A track's end hands over to the next slot, never to a fresh lookup.** `seconds` is an integer, so the file's real length differs from its slot by up to a second. A fresh lookup at `ended` can land back inside the song that just ended and loop on it; the handover instead plays the next slot, at `max(0, now − slotStart)` into it.
- **A stall is caught up.** After the element recovers from buffering (`waiting` → `playing`), a drift of more than a second from the station is re-seeked away.
- **The clock is the device's.** Phones and computers keep NTP time, well under a second apart; a device whose clock is wrong by a minute plays the station a minute off, and nothing can tell it so without a server.

## Pressed and released

`PlayerState` gains `radio: boolean`, and the reducer a `tune` action carrying the station's `{ order, cursor }`: the queue becomes the whole catalogue, the order the current cycle's, `shuffled: true`, `playing: true`, `radio: true`. **Every other action sets `radio: false`**, which is the whole of "any action releases it" — in the reducer, so it cannot be forgotten at one call site, and a new action releases by default.

- **Released means playback carries on from the action.** Pause pauses, a seek seeks, next goes to the song after this one in the cycle's order — which is the station's next song anyway, just early. Off the radio, the queue is still that cycle's shuffle, so the shuffle button stays lit and works as it does today.
- **Any pause releases, including one the reader did not make** — headphones pulled, a call, a song's video opened. Radio pressed means "playing live", and a playback resumed after a pause is no longer live. **A pause the element reports while it is changing source is not one**: an `AbortError` from an interrupted `play()` must not release the radio, and the implementation has to show it does not.
- **The bar's radio button, pressed, releases on click** and the music keeps playing. Unpressed, it tunes in — so does the big button, always, even when the radio is already on: a press there is "take me to the live moment".
- **The big button shows no pressed state**: it is a launcher, as **Shuffle all** is.
- **Nothing is stored.** The radio is a live state; a reload starts silent, as autoplay rules require anyway.

## The radio's own page — `/music/radio`

A static export serves it like any other page, because nothing on it differs between visitors: the HTML is the same for everyone, and what is on air is computed by the browser from its clock, exactly as the player does. The server's absence costs nothing here.

- **Addresses**: `/music/radio`, `/music/radio/en`, `/music/radio/ru` — the section's usual alias-plus-locales. `radio` joins `RESERVED_SEGMENTS` in `songs.ts`, so a song can never take the address, and `parseMusicSegments` gains a `radio` page. The two locale addresses go into `musicCatalogueRoutes()`, the section's share of the sitemap.
- **A doorway, not a now-playing screen.** The site's now-playing screen is the song's own page, which the bar opens on every track change; a second one would be a concept the site has nowhere else. So the page is where a shared link lands, and holds four things, top to bottom: the heading **Vova’s Radio** («Радио Вовы»), the radio's one-line pitch, **Now playing: _song_ — _artist_** (filled on mount, a build not knowing the hour it will be read at, and changed when the song does — no ticking clock), and **Tune in**, which starts the radio and takes the reader to the song's page. Once the radio plays, the bar follows the song to its page here as everywhere, and from then on the bar is the radio's only control — the page has no part in listening. A reader who comes back to it while the radio plays finds the on-air line linking to the song's page and no button, there being nothing left to press.
- **It tries to play at once.** On load the page tunes in and calls `play()`. Whether that is allowed is the browser's call: Chrome allows it on a site whose media the reader has played before (its media-engagement score, which is how YouTube autoplays) and after any in-site click, a client-side navigation keeping the gesture; Safari and Firefox refuse a cold visit by default. Allowed, the radio plays and the bar takes the reader to the song, as **Tune in** would have. Refused, the page stays as it is and **Tune in** is the press the browser asked for; it tunes in afresh, so the wait costs no sync.
- **The attempt commits nothing until the browser says yes.** Tuning in the ordinary way puts a track in the player, which mounts the bar and sends the reader to the song's page at once — before `play()` has answered. A refusal arriving after that would leave the reader on a song's page with a paused bar, released from a radio they never chose. So the landing attempt loads the station's track into the element and calls `play()` with the player's state untouched, and dispatches `tune` only when the promise resolves; until then, and on a refusal, the page is exactly as it loaded.
- **Silent is a look, not a muted stream.** Playing muted would autoplay everywhere, but 157 of the 170 masters are FLAC, tens of megabytes a song, which would stream to every visitor who never unmutes — on a phone, over their data plan. A refused autoplay downloads nothing.
- **The link to share is in the hint.** Tuning in moves the address bar to the song's page, so the hint over the bar's radio button carries the radio's own address as a copy link.
- **Its link card is static**: one image, rendered once by `pnpm content:og:vova` and committed beside `music.og.jpg`. A link preview is fetched by the platform once and cached, so it could never show what is on air anyway; the card says what the radio is instead. It is drawn by `scripts/lib/music-collage.ts` — the covers collage the index unfurls as — with a band across it reading **Radio** and the hint's line. The `og:title`/`og:description` carry the same words.

## The hint

Each time the radio turns on, from any of its buttons, a popover rises over the bar's radio button for about five seconds, closing early on any click outside it. Under the line it carries `vovazakharov.com/music/radio` with a copy button. `PlayerBar` opens it on `state.radio` going from `false` to `true`, which catches both buttons with no plumbing between them; Mantine's `Popover` is what `noted-span.tsx` already uses and whose stylesheet the theme already loads.

Copy:

- **en**: “Same song, same second, for everyone on the radio.”
- **ru**: «Та же песня, та же секунда — у всех, кто включил радио.»

## Changes

1. `lib/station.ts` + `station.test.ts` — the timetable: `stationAt`, the next-slot handover, the boundary swap. Tests: same `nowMs` → same answer; a slot's last millisecond and the next one's first; a cycle boundary; the no-repeat swap; an empty catalogue.
2. `lib/player-state.ts` (+ tests) — `radio` in the state, the `tune` action, every other action releasing it.
3. `lib/use-audio-player.ts` — `controls.radio()` (tune in) and `controls.unradio()`; the deferred seek; `ended` handing over in radio mode; the stall catch-up; `storeShuffle(true)` on tuning, as `shuffleAll` does, so the stored switch does not undo the cycle's order. The file is at 351 lines and this is its largest addition: if it passes ~450, the radio's element-side half moves to its own `use-station.ts` hook beside it.
4. `ui/player-bar.tsx` — the radio `ActionIcon` (lucide `Radio`) right of shuffle, `aria-pressed`, the popover. A fifth control in the strip: check the phone-width layout with `/preview`.
5. `ui/shuffle-all-button.tsx` → `ui/launch-buttons.tsx` — **Shuffle all** and **Radio** side by side, the second in the `default` variant so shuffle stays the primary action.
6. `lib/songs.ts`, `lib/music-urls.ts`, `lib/music-route-params.ts` — the reserved `radio` segment, `radioPath(locale?)`, the `radio` page in the parse, its addresses in the static params and the sitemap.
7. `ui/radio-page.tsx` (server) + `ui/on-air.tsx` (client) — the page, and the block it hosts: the now-playing line, the autoplay attempt, and **Tune in**; `ui/music-route.tsx` dispatches to it, with its metadata.
8. `scripts/lib/music-collage.ts` and its caller — the radio's card, `music/radio.og.jpg`, rendered and committed.
9. `src/shared/i18n/messages/{en,ru}.json` — `music.radio` (the big button), `music.player.radio` (the bar's label), `music.player.radioHint`, the hint's copy-link label, and the page's own words (`music.radioPage`: **Vova’s Radio**, the pitch, **Now playing**, **Tune in**).

## DRY notes

- **The cycle's order reuses `shuffleOrder`** (and through it `randomFrom`) from `player-state.ts` — the seeded permutation the shuffle already trusts to be reproducible from its seed. No second PRNG.
- **The queue the station walks is `listSongs()`'s**, the provider's existing `catalogue` prop; no second song list is built for it.
- **Releasing lives in the reducer once**, not as `setRadio(false)` beside each of a dozen controls, keyboard handlers and media-session actions.
- **The two launch buttons share one client component**, `launch-buttons.tsx`, rather than a near-copy of `ShuffleAllButton`; a generic `LaunchButton({icon, label, onClick})` would be an abstraction over two call sites in one file, so they stay two inline `<Button>`s.
- **Now playing and the player read one function.** `on-air.tsx` calls the same `stationAt` the player tunes by, with the same `catalogue`, so the page cannot show a song the radio is not playing.
- **The page's address goes through the section's own machinery** — `RESERVED_SEGMENTS`, the catch-all's parse, `musicCatalogueRoutes()` — rather than a separate `app/music/radio/` route beside the catch-all.
- **The card reuses the collage renderer** and its hash-cached manifest, adding a band, rather than a second card pipeline.
- **The hint is not a toast system.** One popover on one button; a notifications package would be a dependency for one sentence.

## Open questions

Each has its recommendation already written into the plan above; silence keeps it.

1. **A pause the reader did not make** (headphones, a call, a video): **a) releases the radio** _(recommended — "pressed" stays honest)_; b) leaves it pressed, and resuming re-tunes to the live moment.
2. **Shuffle button while the radio plays**: **a) lit** _(recommended — the order is a shuffle, and stays one after release)_; b) dark, lit only once released.
3. **The hint's words**: **a) as above** _(recommended)_; b) your own.
4. **What `/music/radio` is**: **a) a doorway** — pitch, the on-air line, one button, then the song's page as everywhere _(recommended — the song's page already is the now-playing screen)_; b) a now-playing screen of its own, which keeps the reader on it.
5. **On landing**: **a) try to play at once; refused, wait for Tune in** _(recommended — an in-site click or a Chrome regular skips the press)_; b) always wait for Tune in; c) play muted, unmute on press — instant everywhere, at the cost of streaming FLAC to everyone who never unmutes.
6. **The radio's link card**: **a) the covers collage with a "Radio" band** _(recommended — one renderer, and it looks like the section it belongs to)_; b) a typographic card of its own, an SVG drawn for it.
