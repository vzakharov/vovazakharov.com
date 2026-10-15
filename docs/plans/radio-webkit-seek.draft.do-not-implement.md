> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.

# Every song streams its FLAC rewrapped in MP4

**Blocked on [#153](https://github.com/vzakharov/vovazakharov.com/pull/153).**
#153 renames, retags and republishes every master, so this plan builds on its
tooling instead of doing the same work twice.

## The bug, and what it comes from

On an iPhone, the radio joins a song earlier than the dial shows. When the
dial moves on, the previous song keeps playing. A manual seek lands early too.

AVFoundation plays media for every iOS browser. It seeks a bare FLAC by
estimate and still reports the second it was asked for, so the `<audio>`
element falls behind the clock the dial reads.

**Tested on «Мой султан»**, on the page at
<https://vovas-music.github.io/sultan/>, on Safari 26.6 / iOS 18.7:

- A 1 s SEEKTABLE (vovas-music/sultan#1) brought the FLAC closer, but it still
  lands seconds off.
- The same FLAC stream copied into MP4 (vovas-music/sultan#2, `ffmpeg -c:a
  copy`, decoded audio identical) seeks exactly as the MP3 reference does. The
  operator: «mp4 играет как mp3, flac отстаёт». `canPlayType('audio/mp4;
  codecs="flac"')` answers `probably`.

## The work

- **Each song's repository gets an MP4 rewrap of its FLAC master**, named by
  #153's file-name scheme with an `.mp4` extension. Made with
  `ffmpeg -i <master>.flac -map 0:a -c:a copy -movflags +faststart <name>.mp4`.
  The `+faststart` puts the index first, so playback starts before the whole
  file loads. A song whose master is already an MP3 needs nothing.
- **The frontmatter's `stream` names it**, and the player plays `stream ??
  audio`. `audio` stays the FLAC, which the downloads keep. #160 brings the
  field and sultan's entry.
- **It goes through #153's `pnpm music:masters`.** `tag` writes the rewrap
  after it tags the FLAC, because MP4 carries the FLAC stream and not its
  Vorbis comment. It then publishes the rewrap and repoints `stream`. `check`
  fails on a FLAC song with no `stream`, or with a `stream` older than its
  master. Re-read that script once #153 has merged, before deciding exactly
  where each step goes.
- **`scripts/song-intake/CLAUDE.md` § "A song's repository"** lists the rewrap
  next to the MP3 copy, so a new song gets one before its page exists.
  `.claude/rules/songs.md` names `stream` among the frontmatter fields.
- **A test that the downloads keep `audio` while the player gets `stream`**,
  next to `songFiles`/`songTrack`.

**Cost:** each song's repository holds a second file the size of its FLAC
(~25 MB). The site serves the same bytes in a container AVFoundation can seek.

**Deferred, outside these PRs:** playing the MP3 by default together with an HQ
button: «на проигрывание мп3 по дефолту мы перейдём, но уже когда введём
кнопочку HQ, не в этих пиарах». Once MP4 seeks exactly, the HQ default no
longer depends on this bug.

**Rejected: a SEEKTABLE in every master.** It brought the miss down to a few
seconds but no lower, while the rewrap removes it, for the same publishing
work.

## Open question

1. **Ship sultan alone now?** #160 is the `stream` field plus «Мой султан»'s
   entry, and vet passes. Recommended: merge it now, since it fixes one song
   on the site with the exact file that was tested. Every other song follows
   this plan after #153.

## DRY notes

- The player's source is resolved once, in `songTrack`. All three places that
  set or compare the element's `src` already read `track.audio`, so none of
  them change.
- The rewrap is made and checked in `music:masters`, next to the MP3 copy and
  the tags. The publishing (clone, Git Data API, large-blob relay) is #153's,
  reused unchanged.
