# Three more of Vova's ear on the spectrograms

## The task

Vova's review of PR #138, 2026-10-21 (`docs/pr/138/pr.md`, T05–T07), verbatim:

- **T05** on `intertwined/intertwined.png`: «после 2:00 -- вполне себе полноценный снэр, (на каждый второй кик, стандартно) -- тут он, кажется, не определился совсем.» Section 4 is 1:28–2:30 at 120 BPM, so a snare on beats 2 and 4 from 2:00 that the row does not light.
- **T06** on `just-because/3.png` (section 3, 0:23–0:45, 89 BPM): «тут с самого начала вполне различимый закрытый хет на шестнадцатые (дважды на бочку)» — closed hats every sixteenth (~0.17 s) that the cymbals lane misses.
- **T07** on `sorry/3.png` (section 3, 0:30–0:45, 130 BPM): «кажется, границы тактов (но не детальнее) всё же стоить поставить. если они конечно определяются» — bar lines on the zooms, no finer grid. The beat grid was removed in a8bf324 because the lines confused him; bars alone are the ask.

## Done

Nothing yet: the export is committed, the work not started.

## What is left

1. **Cut the stems** for intertwined and just-because (recipe in `scripts/song-intake/CLAUDE.md`; masters via `gh release download music-sources` or `docs/remove-before-merging/`), and probe why the hits are dropped: `drum_hits` in `scripts/song-intake/drums.py` has four gates — `BLEED_DB`, `UNEXPLAINED`, the needed-lane cost (`NEEDED_DB`) and `GUESS_DB`. A snare landing with a kick, or a hat over a kick, is the case the needed-lane rule is weakest on (relay 10 found the crash under a kick goes unmarked for the same reason). Keep the ground truth of `spectrogram-drums-stem.completed.md` holding on birds, hello, intertwined 0:48–1:17 and just-because 1:28.
2. **Bar lines on the zooms**: every fourth beat of `facts.beats` (`song_facts.measure`), with the phase found from the song — e.g. the beat where the kick lane or the low-band onsets are strongest, or chord changes — and drawn only where the phase is clear ("если они конечно определяются"). Ask Vova's ear on a song if the meter is not 4/4.
3. Re-render all eleven, reply on T05–T07 in Russian with bare SHAs (never resolve), then `/go` Step 3 (`/polish`) and Step 4 (`/pr`).
