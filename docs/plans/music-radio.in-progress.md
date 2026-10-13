# Fixed radio

## Progress

**Done:** § "Changes" 1–3. `lib/station.ts` (+ tests): `stationAt`, `nextStation`, `cycleOrder`'s boundary swap. `lib/player-state.ts` (+ tests): `radio`, the `tune` and `release` actions, every action but `tune` and a `playing: true` report releasing. `lib/use-station.ts`, wired into `use-audio-player.ts`: `controls.tuneIn`, `tryTuneIn` (the landing attempt, dispatching nothing until `play()` resolves), `onAir(nowMs)`, `release`; the owed seek on `loadedmetadata`, drift catch-up on `playing`, the handover on `ended`; seeks release; the end-of-track `pause` and an `AbortError` no longer release.

**Also done:** the cover mockups (variant 1 picked), the `radio` segment and `radioPath`, the catalogue's words. The route's parse, static params and sitemap entries land with the page, `music-route.tsx`'s switch being exhaustive.

§ "Changes" 4: `ui/radio-toggle.tsx` in the bar, the hint with it; the layout passes `radioRoutes` down, `music-urls` being out of a client bundle's reach (its `@/shared/content` barrel is server-only); `useFollow(route, !state.radio)`. Not yet looked at: the five-control strip at phone width (`/preview`).

§ "Changes" 7, its first piece: `lib/song-excerpt.ts` (+ test) — `songExcerpt(story)` gives the plain text cut at a word past `EXCERPT_LENGTH` (600), or `undefined` for no words. The hook fallback is the radio page's: `songExcerpt(localized.body) ?? (hook && textHook(hook))`, `textHook` living behind the server-only `@/shared/music-catalogue` barrel a `node:test` cannot load. Unused until the page imports it, so `knip` may flag it.

§ "Changes" 5: `ui/launch-buttons.tsx` replaces `shuffle-all-button.tsx`; Radio calls `tuneIn()` then `router.push(radioRoute)`. § 6: `radio` in `MusicAddress`, the parse, `musicSegmentParams` and `musicCatalogueRoutes`. § 7: `ui/radio-page.tsx` (server: metadata, per-slug `OnAirExtras` — cover, album link, excerpt — and the cycle's `formatDuration`), `ui/on-air.tsx` (client: clock ticking on whole seconds, landing attempt via `useEffectEvent`, `wasTuned`, now playing with `CoverZoom`'s new `sizeClass`, the [i] as a `NotedSpan` on an `Info` icon, the knob, the story under the set with `Excerpt` reusing `read-more.module.scss`'s `.clamped`), `ui/radio-dial.tsx` (ticks, minute marks, counter; the needle's start frozen at mount, remounted by the slot key), `ui/radio.module.scss` (the mockup's v1), `ui/billing-links.tsx` (shared with the bar), `music-route.tsx` dispatch. `RADIO_CARD` in `lib/pictures.ts` names `/music/radio.og.jpg`, which **does not exist yet — the build fails on it until § 8 renders it**. tsc, eslint, stylelint, steiger clean; never built or looked at.

**Left:** § 8 (the card — first, since the build needs it), then a build and `/preview` of `/music/radio` (phone and wide, both themes, tuned and not) and of the bar's five-control strip at phone width; 9's remaining copy is already in the catalogues. The cycle length counts public songs only (operator: «да, только публичные»), computed in the page at build. Two calls for the page:

- **The landing attempt runs only when nothing is in the player** (`current === undefined`). With a track loaded, its `src` swap would race the source effect and abort its own `play()`; a reader arriving with music paused gets **Tune in**.
- **Following needs no radio-path check**: `useFollow` should start as `!state.radio` at the bar's mount. A bar first mounting with the radio on was tuned from the launcher or the radio page, both of which keep the reader where they are; once mounted, the reader's own navigation already sets following as today. Without it, the launcher's tune on `/music` races its own `router.push` to `/music/radio`.

The open questions below keep their recommendations unless the operator answers otherwise.

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
- **A set on the desk, not a doorway.** The radio is somewhere you stay, like an old receiver on the table: the page is the radio's own screen, and the reader is never moved off it by the music. Top to bottom:
  1. **Vova’s Radio** («Радио Вовы»).
  2. The radio's one-line pitch, “Same song, same second, for everyone listening.”, with an **[i]** after it opening a longer explanation — how a radio with no server keeps everyone in step. Its form (popover, as `noted-span.tsx`'s, or an expanding note) and its words are the implementation's to settle.
  3. **Now playing: _song_ — _artist_**, with a counter, `1:23 / 3:40`, ticking each second. Both come from `stationAt` and the clock, so they run whether or not anything plays, and they are what the radio plays when it does. Filled on mount, a build not knowing the hour it will be read at; the space is reserved so the page does not jump.
  4. **Not tuned in** — **Tune in**. **Tuned in** — the song's story, its opening cut and fading out, then an outline button, **Read story, lyrics & more**, linking to the song's page, with **Don't worry, this won't stop the playback** in small type under it. Both change with the song.
  5. **Released while on the page** — any action on playback (pause, seek, skip, through the bar or a key) takes the story away and puts **Tune back in** where it stood. **Now playing** and its counter carry on, being the station's.
- **The look is a tuning dial**, drawn in `docs/plans/radio-mockups.html`, which the implementation follows. On a phone, centred: the heading, the pitch, **Now playing** (its live dot while tuned in, centred on the capitals) over the song and artist, then the scale, `2:36 / 4:53` under it, then a round knob-like **Tune in** / **Tune back in**, or the story while tuned in. A wide screen changes nothing but the width: the set stays about 480px wide in the middle of the column, and only the story under it reads at the column's usual measure.
- **The scale is drawn per song** — a long tick each minute, labelled `0 1 2 …`, a short one every 15 seconds — and **the needle glides**: one CSS animation as long as the song, `translateX` from 0 to 100% of a full-width track, started part-way by a negative `animation-delay` equal to the seconds already elapsed. No script moves it; it is restarted only when the song changes (a new `key` on the track). The counter's digits are the only thing a timer updates.
- **The bar stays on the page.** The player follows the song to its page on every track change wherever following is on; on `/music/radio` it starts off, so the radio page holds through every song change. **Read story, lyrics & more** is the reader's own navigation, and turns following on at the song's page as any such click does.
- **The big Radio button on `/music` tunes in and opens `/music/radio`.** The radio has a home now, so its launcher goes there; the bar's own radio button tunes in where the reader is, following as playback always does.
- **The story is an excerpt, built for every song.** Which song the page shows is decided in the browser, so every public song's excerpt ships with the page: the locale's story in plain text, cut at a word near 600 characters — about 100 KB for the whole catalogue, a fraction of one master. **The cut never shows**: the box holds a fixed number of lines and the excerpt is long enough to overflow it at the widest measure, so its end always lies under the fade — no visible “…” and no last line ending short. A story shorter than the box is shown whole, with no fade. A song with no story shows its hook instead, and one with neither shows the button alone. The fade is `ReadMore`'s, reused from `read-more.module.scss`; `ReadMore` itself is not, as it clamps a rendered document the page already holds.
- **It tries to play at once.** On load the page attempts to tune in. Whether that is allowed is the browser's call: Chrome allows it on a site whose media the reader has played before (its media-engagement score, which is how YouTube autoplays) and after any in-site click, a client-side navigation keeping the gesture; Safari and Firefox refuse a cold visit by default. Allowed, the page is tuned in as if **Tune in** had been pressed. Refused, it stays as it loaded and **Tune in** is the press the browser asked for; it tunes in afresh, so the wait costs no sync.
- **The attempt commits nothing until the browser says yes.** Tuning in puts a track in the player, which mounts the bar and marks the radio on — before `play()` has answered. A refusal arriving after that would leave a paused bar and a **Tune back in** for a radio the reader never chose. So the landing attempt loads the station's track into the element and calls `play()` with the player's state untouched, and dispatches `tune` only when the promise resolves.
- **No muted stream.** Playing muted would autoplay everywhere, but 157 of the 170 masters are FLAC, tens of megabytes a song, which would stream to every visitor who never listens — on a phone, over their data plan. A refused autoplay downloads nothing.
- **Its link card is static**: one image, rendered once by `pnpm content:og:vova` and committed beside `music.og.jpg`. A link preview is fetched by the platform once and cached, so it could never show what is on air anyway; the card says what the radio is instead. It is drawn by `scripts/lib/music-collage.ts` — the covers collage the index unfurls as — with a band across it reading **Radio** and the hint's line. The `og:title`/`og:description` carry the same words.

### The operator's additions (this session)

> так, ещё пара замечаний,
> 1- где-то обложку now playing надо показывать. не фул-сайзом, наверное по размеру заголовка песни (где песня и исполнитель), сбоку от них. Нажатие максимизирует обложку (существующий компонент)
> 1b - как вариант, более большую обложку, слева от блока начинающегося с Vova's Radio и заканчивающегося (и включающего) шкалу. Но отгда нужно решать как это выглядит на мобиле. Можно тоже подготовить мокапы с разными вариантами
> 2- добавить from ... (альбом, если есть)
> 3- нажатие на песню, исполнителя, альбом, переводит на их страницы
> 4- у всего радио должно быть очертание, не сразу понял, но на мокапе они как будто бы просто посреди страницы. Не слишком жирно-вычурно, но обозначить
> 5- в пояснялке про что такое радио -- добавить динамически вычисляемую (кодгеном, в отдельном модуле?) total duration всех-всех сонг, в формате часы:минуты:секунды

- **Cover**: the playing song's cover beside its title, billing and album line, as tall as the three, opening `CoverZoom` on a press — variant 1 in `radio-mockups.html`, the operator's pick («вариант 1 норм»), at phone and wide alike.
- **from _album_** under the billing, where the song is on one, as the song page's line says it.
- **Song, artist and album are links** to their pages. Those are the reader's own navigation, so the bar follows to a song's page as **Read story** does.
- **The set has an outline**: a thin border and radius, as the section's cards have — marked, not decorated — with room inside it («немного добавить воздуха внутри»): about 40px above and 36px at the sides on a wide screen, 32px and 22px on a phone, the mockup's `.boxed`.
- **The [i] note states the cycle's length** as `h:mm:ss` — the sum of the public catalogue's `seconds`, the radio's whole round. The radio page is a server component rendered at build, so the sum is computed there from `listSongs()`, with no codegen step: a static export already bakes it in at every deploy, which is when the catalogue changes.

## The hint

Each time the radio turns on, from any of its buttons, a popover rises over the bar's radio button for about five seconds, closing early on any click outside it. Away from `/music/radio`, its word “radio” links there. `PlayerBar` opens it on `state.radio` going from `false` to `true`, which catches both buttons with no plumbing between them; Mantine's `Popover` is what `noted-span.tsx` already uses and whose stylesheet the theme already loads.

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
7. `ui/radio-page.tsx` (server) + `ui/on-air.tsx` (client) — the page, and the block it hosts: now playing and its counter, the autoplay attempt, **Tune in** / the story / **Tune back in**; `ui/music-route.tsx` dispatches to it, with its metadata. `lib/song-excerpt.ts` + test — the plain-text excerpt per song, built from `localizeSong`'s story, falling back to the hook. `ui/player-bar.tsx`'s `useFollow` starts off on `/music/radio`.
8. `scripts/lib/music-collage.ts` and its caller — the radio's card, `music/radio.og.jpg`, rendered and committed.
9. `src/shared/i18n/messages/{en,ru}.json` — `music.radio` (the big button), `music.player.radio` (the bar's label), `music.player.radioHint`, and the page's own words (`music.radioPage`: **Vova’s Radio**, the pitch, **Now playing**, **Tune in**, **Tune back in**, **Read story, lyrics & more**, **Don't worry, this won't stop the playback**).

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
4. **On landing**: **a) try to play at once; refused, wait for Tune in** _(recommended — an in-site click or a Chrome regular skips the press)_; b) always wait for Tune in; c) play muted, unmute on press — instant everywhere, at the cost of streaming FLAC to everyone who never unmutes.
5. **The radio's link card**: **a) the covers collage with a "Radio" band** _(recommended — one renderer, and it looks like the section it belongs to)_; b) a typographic card of its own, an SVG drawn for it.
