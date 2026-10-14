> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# A one-second SEEKTABLE in every FLAC master

**Blocked on [#153](https://github.com/vzakharov/vovazakharov.com/pull/153).**
The operator's call: «предлагаю дождаться #153, а потом таки разметить все».
#153 renames and retags every master, and publishes them, so this plan builds
on its tooling instead of doing the same thing twice.

## The bug, and what it comes from

On an iPhone, the radio joins a song earlier than the dial shows. When the
dial moves on to the next slot, the previous song keeps playing. A manual seek
on the phone lands early too. The operator reproduced this on the device.

The dial runs off the device's clock (`OnAir`'s `useClock`, `RadioDial`). The
`<audio>` element lags behind it. Every browser on iOS is WebKit, which plays
media through AVFoundation. AVFoundation seeks a FLAC that has no SEEKTABLE
(none of the masters had one) by estimating the byte offset. It lands early,
but `currentTime` still reports the requested second, so `keepTime`'s drift
check never sees the gap. Desktop engines find a FLAC's frames exactly.

**Tested:** `vovas-music/sultan#1` added a 1 s SEEKTABLE to `sultan.flac`,
and the file is live. On the iPhone, seeking got much better, with a few
seconds of drift left. The operator: «явно лучше, но несколько секунд,
кажется, рассинхрон таки есть. думаю это best we can do».

## The work

- **Every FLAC master gets a SEEKTABLE with one point per second**
  (`metaflac --add-seekpoint=1s`). Only the header changes: about 4 KB per
  song, and the decoded audio is identical. The interval is 1 s, not `flac`'s
  default of 10 s. A decoder that seeks to a point and plays on from there
  then misses by under a second, which is the radio's `DRIFT`, and each point
  costs only 18 bytes.
- **It goes through #153's `pnpm music:masters`.** `tag` writes the table into
  each FLAC it publishes, and `check` fails on a FLAC master that has none.
  `check` is offline, and an index's presence can be read straight off the
  metadata block headers. Re-read that script once #153 has merged, before
  deciding exactly where each step goes. One run over the catalogue then
  publishes every master, using the Git Data API path #153 already set up.
- **`scripts/song-intake/CLAUDE.md` § "A song's repository"** states that a
  FLAC master carries a 1 s SEEKTABLE, so a new song gets one before its page
  exists.
- **`metaflac` is a toolchain addition.** Wire it into
  `.claude/hooks/install-deps.sh` (the `flac` package) and into `vet.sh` only
  if `check` needs it. The report names what the operator adds to the
  environment's setup script.

**Check after #153 lands:** its renamed copy of `sultan.flac` may have been
built from the file before the table was added. If so, the run above
restores the table for that song along with all the others. Also confirm that
#153's FLAC tag writer (`node-taglib-sharp`) keeps a SEEKTABLE block when it
rewrites tags. If it does not, `tag` has to add the table after writing the
tags, not before.

**Deferred, outside these PRs:** playing the MP3 by default. The operator will
make that switch together with an HQ button: «на проигрывание мп3 по дефолту
мы перейдём, но уже когда введём кнопочку HQ, не в этих пиарах». The player
code stays as it is.

## DRY notes

- The table is written in one place, `music:masters tag`, and checked in one
  place, `check`. Neither gets a script of its own. The publishing (clone, Git
  Data API, large-blob relay) is #153's, reused unchanged.
- Reading block headers to check for the table is a few lines next to `check`.
  If #153's tag code already parses FLAC metadata blocks, the check reuses that
  parser rather than adding a second one.
