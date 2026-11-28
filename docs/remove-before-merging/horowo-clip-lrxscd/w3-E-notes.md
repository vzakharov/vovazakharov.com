# Wave 3, package E — notes

Status: **done**, report sent to the lead. Nothing next unless the lead asks.

## Built and wired

- `jaw` (`src/clip/shared/score/jaw.ts`) — the vocal stem's loudness, ungated by
  word spans; past the stem's end, a syllable bump inside each word.
  `jaw.test.ts` pins stanza 1: every voiced word opens ≥0.5, shut at each line
  break, held «бы» open.
- `PREROLL = 13`, `FILM_END = SONG_SECONDS + 5` (`score/song.ts`, barrel
  exports `FILM_END`; `POSTROLL` is private).
- `IDENT_CUES` (`pages/horowo-clip/ui/ident-cues.ts`, film seconds): warning
  0–6.6, black, snow 7, test card 8.2, lines 9/9.7/10.4, address 11.1, first
  hit 13.
- `warningCard` (`ui/warning-card.ts`, colours in `ui/palette-warning.ts`) and
  `IDENT_SHOTS` (`ui/shots-ident.ts`): warning → black → snow → test card
  (`testCard(pen, lines, unaddressed)` in `shared/tape/test-card.ts`).
- `identSound` / `renderedIdent` (`ui/ident-sound.ts`): band-passed hiss plus
  1 kHz beeps on the cues. The page plays it on an `AudioContext` from the
  player (`ui/player.ts`, its own clock through pre-roll and post-roll); the
  film calls `ClipFilmHook.sound()` (`shared/film/hook.ts`), which returns the
  `OfflineAudioContext` render as a base64 WAV (`lib/wav.ts`).
- `film:clip` (`src/clip/scripts/film-clip.ts`) films -PREROLL…FILM_END and
  mixes that WAV with the song delayed by PREROLL (`SOUND` filter).

## Measured

- **Jaw offset: none.** The cross-correlation of the vocal stem envelope with the
  master's vocal band peaks at lag 0. The fault lay in the word spans: Whisper
  ends held vowels early and opens words up to ~0.2 s late, and the singer runs
  most lines together, so the span-gated jaw shut mid-note ~20 times in stanza 1.
- The stem goes silent at the line breaks (2.24–2.39, 6.17–6.28, 10.36–10.48,
  12.08–12.26, 14.48–14.61, 15.88–16.10, 16.31–16.64 s). «ради|И» is sung
  through, so the jaw stays open there.
- The stem is loud with no Whisper word at ~17.9–19.8 s (held «хорошо») and
  ~23.8–24.3 s (a shout); the jaw opens on both.
- Filmed -7…1.5 s: hiss −33 dB over the snow, −40 dB under the card, beeps
  −25/−20 dB on their cues, song from the first hit. Checked by level only,
  never heard.

## Weaker

- The post-roll draws the last shot until package D's ending fills it.
- This branch still has the old meadow intro (package I replaces it).
