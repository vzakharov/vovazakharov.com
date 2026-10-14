> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# On Apple's engine, play the MP3 copy

## The bug, and what it comes from

On the phone, the radio joins a song at an earlier moment than the dial shows.
When the dial reaches the end and moves on to the next slot, the previous song
keeps playing.

The dial and the song card come from the device's clock (`OnAir`'s `useClock`,
`RadioDial`). They do not come from the `<audio>` element. So the clock is
right, and the element is playing behind it. The element runs out of audio data
later than the slot ends, and only then does it fire `ended`.

The element is behind because **the seek lands short, and the element reports
the time it was asked for anyway**. Every master is a FLAC with no SEEKTABLE
(checked: `sultan.flac`, `dad.flac`, `8849.flac` and others carry only
STREAMINFO and VORBIS_COMMENT). Every browser on an iPhone is WebKit, and WebKit
plays media through AVFoundation. By default, AVFoundation seeks a FLAC without
timing data from an estimate. Apple's forum has a report that FLAC seeks land
wrong there, and that MP3 and M4A are fine
(<https://developer.apple.com/forums/thread/665417>). A page cannot set the
precise-timing option that thread uses to fix it. `keepTime` cannot catch the
gap either, because `currentTime` already reads as the target. Desktop Chrome
and Firefox use their own demuxers, which find a FLAC's frames exactly. That
explains why the bug does not show up on a computer.

The same gap breaks every seek on the phone, not only the radio. The seek bar,
the arrow keys and a song's video, which opens at `position()`, all land short.
The radio is just where it shows, because it is the only part checked against a
clock.

**Unconfirmed until tested on the device.** Before any code changes, try this:
on the phone, open a song you know well and drag its seek bar to the middle.
Then do the same on the computer. If the phone plays an earlier passage than the
computer at the same displayed time, the diagnosis holds.

## The fix

Where the engine is Apple's, the player plays the song's `mp3` copy. It already
exists for every song, as a 320 kbps CBR file with an `Info` header and TOC
(checked on `sultan.master.mp3`). AVFoundation seeks a constant-bitrate MP3
exactly. Everywhere else, the master plays as it does now.

- `PlayerTrack` gets the MP3 copy's address beside `audio`. `songTrack` sets it
  from `mp3.url ?? audio`, so a song whose master is already an MP3 gets the
  same file.
- One pure function picks the source for the engine,
  `trackSource(track, engine)`, with a test next to it. A second function reads
  the engine from `navigator`: any iPhone, iPad or iPod user agent, an iPad in
  desktop mode (`Macintosh` with touch points), or desktop Safari (`Safari`
  without `Chrome`/`Chromium`/`Edg`/`OPR`/`Firefox`). The one `useAudioPlayer`
  reads the engine once, when it mounts.
- The three places that compare or set `src` to `track.audio`
  (`use-audio-player.ts`'s source effect, and `keepTime` and `tryTuneIn` in
  `use-station.ts`) use the picked source instead.
- `playableSchema`'s "played as-is" docstring changes to state the exception and
  why.

## Open questions

1. **Where does the MP3 play?**
   - a) **On Apple's engine only, everywhere in the player (recommended, and the
     plan as written).** It keeps the master wherever the master seeks
     correctly, and it fixes the seek bar and the video on the phone too. The
     cost is user-agent sniffing, held in one tested function.
   - b) On every browser, everywhere. No sniffing, and a third of the data on
     mobile (9 MB against 25 MB for `sultan`). It drops "the master, played
     as-is" as a product decision.
   - c) On the radio only. This leaves the seek bar on the phone broken.
2. **Which phone?** The diagnosis assumes an iPhone. On Android, Chrome seeks a
   FLAC the same way the desktop does, and the cause would be somewhere else.

**Rejected: adding a SEEKTABLE to every master.** `metaflac --add-seekpoint`
rewrites only the header, so the audio, its MD5 and `seconds` all stay the same.
But nothing shows that AVFoundation reads a SEEKTABLE. The indirect evidence
says it seeks FLAC and VBR MP3 without any index
(<https://developer.apple.com/forums/thread/819924>,
<https://pxlnv.com/linklog/vbr-mp3s-and-avfoundation/>). Doing it would also put
a second ~25 MB blob into every `vovas-music` repository's history. This option
comes back only if one song with a seektable seeks correctly on an iPhone.

## DRY notes

- The only new code is the source choice. `trackSource` is the one place that
  decides, and all three `src` call sites go through it. A call site that checks
  `track.audio` itself would compare against the wrong file, and the player
  would reload the track on every pause.
- The engine check goes in `src/pages/music/lib/`. Nothing else on the site
  checks the browser engine, so it gets no `shared/lib` home of its own.
- `songFiles` and `song-feed.ts` already resolve `mp3.url ?? audio` for
  downloads and feeds. `songTrack` makes the same choice for a different
  purpose: what plays, not what is offered. The two stay separate inline
  expressions. A helper for a single `??` would cost more than it saves.
