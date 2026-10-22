# Relay 6 — the drum row off a demucs stem, rewritten and checked on three songs

## 1. Standing constraints

None stated in this session beyond the repo's own: never resolve a review thread; replies in Russian, the SHA bare.

## 2. The conversation

1. **Operator:** `/relay take claude/spectrogram-reddit-log`
   **Agent:** Resumed the paused plan (flipped to in-progress), built `tmp/demucs-venv`, started cutting drums stems of all eleven songs, rewrote `drums.py`, wired `spectrogram.py --drums`, rewrote the drum tests. Paused for the context budget at 2c4dd1b.
2. **Operator (mid-turn):** «в продолжении предыдущего? librosa значит мимо, а demucs? я правильно понял комментарий, что demucs -- лапочка и всё делает правильно?» (with a screenshot of the predecessor's report)
   **Agent:** librosa — yes, a miss. demucs is a good first storey, not a darling: it settles _when_ drums play (the three timings match), but not _which_ piece, it files the riser as drums, leaves bleed 30–60 dB down, and lags the master ~25 ms; those are on our code.
3. **Operator (mid-turn):** «почитал описание demucs, так это ж вообще то что нам нужно -- для всех стемов?»
   **Agent:** Yes, it could do more for the picture: htdemucs makes four stems (drums, bass, vocals, other) for about the cost of one, so the bass strip could read the bass stem instead of the C4 split (bass harmonics leak up, a low voice leaks down), a vocal melody strip could come off the vocals, the chords off "other". Cost: a 1.2 GB venv and 2–4 min a song per render, stems too big to commit, demucs's mistakes reaching the harmony. **Proposed: finish the drums in this PR, file "strips from stems" as a separate issue with measurements, bass first. Asked him to say if he wants otherwise — no answer yet.**

## 3. Intent

Vova's 2026-10-20 review of PR #138 (`docs/pr/138/pr.md`): T02–T04 the drum row is noise, with his timed ground truth (in the plan). R01 and T01 were settled by the predecessor. New: interest in demucs for every strip, not just drums — proposed as separate work, unconfirmed.

## 4. Decisions

- **A lane lights only where it is needed** (lane ablation: refit without it, light it when the refit's two-sided band misfit is `NEEDED_DB` worse than the whole kit's). Beat share-of-loudest-band gates, which lit toms and snare on nearly every intertwined kick (two kick shapes splitting one kick; the tom shape filling a kick's 120–250 Hz). A one-sided (shortfall-only) misfit was tried too and dropped every hat, since the snare shape covers a hat's high bands if overshoot goes unpunished.
- **Brightness against the lane's own loudest hit, black 24 dB under, no floor** — a floor lit faint leakage.
- **An onset's level is the power it gains**, not its onset frame's, which catches a strike only partly.
- **A third kick shape**, boomy (hello 1:26.93): without it the tom lane lit on hello's kicks.
- Strips from all four stems: **proposed as a separate issue, not this PR** (awaiting Vova).

## 5. Errors and dead ends

- See Decisions for the gates that failed. The crash at intertwined 0:48 is still not marked (it lands on a kick); the crash shape in `PIECES_DB` is a guess, never measured.

## 6. State

- Branch `claude/spectrogram-reddit-log`, PR https://github.com/vzakharov/vovazakharov.com/pull/138 (draft, `CONFLICTING` against `main` — report only; `/finalize` merges the base). Last pushed: 2c4dd1b.
- Plan: `docs/plans/spectrogram-drums-stem.paused.md` — its "Done in relay 6's session" says what is built and verified, "What is left" step 1 is next.
- **`test_tom` and `test_hi_hat` fail** (the other six drum tests pass): `python3 scripts/song-intake/test_song_facts.py Drums` under a venv with numpy.
- T02–T04 still unanswered on GitHub, awaiting the fix's SHA.
- Estimate: this session 2.5 h senior developer. **Remainder handed on:** ~1.5 h senior developer ("the two synthetic tests, checking the lanes over eight more songs' stems, re-rendering eleven songs") + 0.5 h middle analyst ("checking eleven re-rendered drum rows against what is known of each song").
- Nothing in `tmp/` survives. Re-create: `python3 -m venv tmp/demucs-venv && tmp/demucs-venv/bin/pip install --extra-index-url https://download.pytorch.org/whl/cpu torch torchaudio demucs soundfile matplotlib scipy` (~5 min), then `tmp/demucs-venv/bin/python -m demucs --two-stems=drums -n htdemucs -o tmp/stems apps/vova/public/music/assets/<slug>.mp3 …` for the eleven slugs under `apps/vova/public/music/assets/spectrograms/` (~3 min a song; one run takes every core). The WAV, not `--mp3`.
- The probe used to check lanes (it was in the scratchpad, so here in full; run as `tmp/demucs-venv/bin/python probe.py <slug> <from s> <to s>` from the repo root):

```python
import sys
sys.path.insert(0, "scripts/song-intake")
import numpy as np
import drums
from audio import decode, mmss

slug, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
mix = decode(f"apps/vova/public/music/assets/{slug}.mp3")
stem = drums.aligned(decode(f"tmp/stems/htdemucs/{slug}/drums.wav"), mix)
bands, flux, step = drums.band_power(stem)
frames = drums.onsets(flux, step)
w, _ = drums.shapes()
gain = drums.gained(bands, frames)
a = drums.unmix(gain, w)
model = a @ w
loud = np.percentile(bands.sum(axis=1), drums.LOUD_PERCENTILE)
level = 10 * np.log10(np.maximum(gain.sum(axis=1), 1e-30) / loud)
unexpl = ((gain - model) ** 2).sum(axis=1) / np.maximum((gain**2).sum(axis=1), 1e-30)
times, lit = drums.drum_hits(stem)
for f, lv, u, g in zip(frames, level, unexpl, gain):
    t = f * step
    if t0 <= t < t1:
        j = np.flatnonzero(np.isclose(times, t))
        gdb = " ".join(f"{v:4.0f}" for v in 10 * np.log10(np.maximum(g / g.max(), 1e-9)))
        print(f"{mmss(t)}.{int(t % 1 * 100):02d} lvl{lv:6.1f} un{u:5.2f} [{gdb}] -> {lit[j[0]].round(2) if len(j) else '-'}")
```

## 7. Pointers

- `docs/plans/spectrogram-drums-stem.paused.md` — measurements, ground truth, what is done, what is left.
- `scripts/song-intake/drums.py` (the whole detector), `spectrogram.py` (`render`'s `drums`, `main`'s `--drums`), `test_song_facts.py` (`Drums`).
- `docs/pr/138/pr.md` — Vova's comments verbatim.
- This session's transcript: https://claude.ai/code/session_015KBTNKTjgwpaeMyonaNfqQ; the one before: https://claude.ai/code/session_01QtfFbu5XibmrCWX587vMbT

## 8. Next step

Resume the paused plan: `/go` from its Step 1 (`*.paused.md`), starting at "What is left" step 1. The operator's latest message («так это ж вообще то что нам нужно -- для всех стемов?») got a proposal — drums here, strips from stems as a separate issue — and no answer yet: if he answers, follow it; do not widen this PR unasked.
