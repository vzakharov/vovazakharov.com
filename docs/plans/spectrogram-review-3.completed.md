# Three more of Vova's ear on the spectrograms

## The task

Vova's review of PR #138, 2026-10-21 (`docs/pr/138/pr.md`, T05–T07), verbatim:

- **T05** on `intertwined/intertwined.png`: «после 2:00 -- вполне себе полноценный снэр, (на каждый второй кик, стандартно) -- тут он, кажется, не определился совсем.» Section 4 is 1:28–2:30 at 120 BPM, so a snare on beats 2 and 4 from 2:00 that the row does not light.
- **T06** on `just-because/3.png` (section 3, 0:23–0:45, 89 BPM): «тут с самого начала вполне различимый закрытый хет на шестнадцатые (дважды на бочку)» — closed hats every sixteenth (~0.17 s) that the cymbals lane misses.
- **T07** on `sorry/3.png` (section 3, 0:30–0:45, 130 BPM): «кажется, границы тактов (но не детальнее) всё же стоить поставить. если они конечно определяются» — bar lines on the zooms, no finer grid. The beat grid was removed in a8bf324 because the lines confused him; bars alone are the ask.

## Done

- **T05 fixed** (51c7a58): the snare on intertwined's backbeat sits on a kick, and its top bands fit the snare and the crash alike, so removing either lane alone cost nothing and neither lit. `joined` in `drums.py` adds lanes, most fitted power first, while the needed lanes alone miss the hit by `JOINED_DB` (5) more than the whole kit; only on hits a lane was needed for. Intertwined 2:00–2:30: a second lane on 24/30 backbeats (snare mostly, cymbals on some — the shapes are ambiguous), 0/30 downbeats; 0:48–1:17 still kick only; birds, hello, world-as-it-is still silent where they should be. New test `test_snare_on_a_kick`.
- **T06 tried, not fixed** — one honest attempt, per «загоняться — не надо». just-because 0:23–0:45: the kicks fall every eighth (0.34 s), and the off-kick sixteenth hats sit −16…−36 dB under the stem's loud frames in total power, so `BLEED_DB` (−25) drops most, and those it keeps are under `GUESS_DB` (−15) with no lane needed. No gate tried separates them from what must stay dark: their top band (5 kHz+) against that band's loud frames is −23…−5, birds' pre-1:20 noise reaches −10.5; the stem's share of the mix in the hit's loudest band is −25…0, birds' noise reaches −4 and intertwined's pre-0:48 riser −0.4. `BLEED_DB −30` alone lights 2 more. What would work is periodicity (quiet onsets on the sixteenth grid), which is the over-engineering Vova ruled out — so the reply asks him rather than building it.
- Stems of all eleven are cut in this session's container only (gone with it). Probes used, worth rewriting in `tmp/` if needed: a per-onset dump of level, unexplained share, band gains, per-lane removal cost and lit lanes (relay 6's probe plus `cost`); and a ground-truth counter — lit hits per lane over birds 0–1:19.5 (nothing), birds 1:19.5–1:40, hello 0–1:19 (nothing), hello 1:19–1:36, intertwined 0–0:48 (nothing), 0:48–1:17.5 (kick only), 2:00–2:30, just-because 0:23–0:45, world-as-it-is whole (nothing).

## What is left

1. ~~Probe T05/T06~~ (above).
2. **Bar lines on the zooms**: every fourth beat of `facts.beats` (`song_facts.measure`), with the phase found from the song — e.g. the beat where the kick lane or the low-band onsets are strongest, or chord changes — and drawn only where the phase is clear ("если они конечно определяются"). Ask Vova's ear on a song if the meter is not 4/4.
3. Re-render all eleven, reply on T05–T07 in Russian with bare SHAs (never resolve), then `/go` Step 3 (`/polish`) and Step 4 (`/pr`).
