# Relay 5 — the drum row off a demucs stem

## 1. Standing constraints

None stated in this session beyond the repo's own: never resolve a review thread; replies in Russian with the SHA bare.

## 2. The conversation

1. **Operator:** `/handle claude/spectrogram-reddit-log`
   **Agent:** Attached to the branch (PR #138), committed the fresh export (a6fb765). The review lane fired on five items (T01–T04, R01; see § Intent). Moved every song's whole PNG and sidecar into `spectrograms/<slug>/` (6a9e82b), measured why the drum row is noise and that a demucs drums stem fixes the timing, wrote it all into `docs/plans/spectrogram-drums-stem.paused.md` (1af2488), replied on T01 and answered the librosa question as a PR comment, then paused for the context budget and relayed.
2. **Operator (mid-turn):** «а как вот человеческое ухо моментально определяет где хет а где гитара, а DSP-методы -- нет?»
   **Agent:** Answered in the final report: the ear groups sound into sources (timbre over time, pitch continuity, what comes after the attack — a guitar's attack is followed by a held harmonic tone, a hat's by decaying noise), learned over a lifetime; a band-rise heuristic sees only the attack, which is where the two look alike. demucs is the trained-model analogue of that grouping. A question, no change asked.

## 3. Intent

Vova's 2026-10-20 review (`docs/pr/138/pr.md`): T01 keep the whole PNG and `.txt` in the song's subfolder (done); T02–T04 the drum row is mostly noise, with his timed ground truth (in the plan file); R01 "why not install librosa where needed and use it?" (answered).

## 4. Decisions

- **The drum row reads a demucs drums stem, not the mix** — beat calibrating the mix-based row, which measurably cannot work (same stats before and after the first real hit in Птицы), and librosa, which has no drum transcription. demucs already lives in `scripts/song-intake/requirements.txt` for vocals.
- **Align the stem in code by cross-correlation** — beat trusting demucs's output timing: WAV is off by 552 samples at 22 050 Hz, `--mp3` by 1105.
- **Without `--drums <stem>` the row is left out**, the run saying so — beat falling back to the mix-based row, which is noise.
- **The spectrogram CLI is `spectrogram.py <master> <dir>/<slug>.png`**; a re-render clears only numbered zooms.

## 5. Errors and dead ends

- The existing rise-based unmix run on a clean stem lights every lane, several marks per hit (between hits the stem is silent, so every band rises 30–60 dB). Hence the plan's linear-power, one-unmix-per-onset design.
- Level alone does not separate intertwined's noise riser (−12…−22 dB vs the stem's loud frames) from Птицы's closed hat (−18.7); the plan proposes rejecting onsets the piece shapes fit poorly.

## 6. State

- Branch `claude/spectrogram-reddit-log`, PR https://github.com/vzakharov/vovazakharov.com/pull/138 (draft, `CONFLICTING` against `main` — reported only; `/finalize` merges the base).
- Plan: `docs/plans/spectrogram-drums-stem.paused.md` (what is measured, what is left, steps 1–5).
- Replied: T01 (discussion_r4324808701), R01 (issuecomment-6290631162). T02–T04 await the drum fix's SHA.
- A `writing/notes/the-five-percent.md` entry on the drum row (mandatory for this review) was handed to a subagent; check `git log -- writing/notes/the-five-percent.md` that it landed.
- Estimate: this session 2 h senior developer + 0.5 h middle analyst + 0.5 h middle developer. **Remainder handed on:** ~4 h senior developer ("rewriting drum detection as onset-level unmixing on a separated stem, with a rejection test for non-drum noise, tuned against the author's timings") + ~0.5 h middle analyst ("checking eleven re-rendered drum rows against what is known of each song").
- Nothing in `tmp/` survives: re-create `tmp/spec-venv` (matplotlib) and `tmp/demucs-venv` (`pip install --extra-index-url https://download.pytorch.org/whl/cpu torch torchaudio demucs soundfile matplotlib`, ~1.2 GB), and the stems (`python -m demucs --two-stems=drums -n htdemucs -o tmp/stems <master>`, ~3.5 min a song).

## 7. Pointers

- `docs/plans/spectrogram-drums-stem.paused.md` — the measurements and the remaining steps.
- `scripts/song-intake/drums.py`, `spectrogram.py` (`render`, `main`), `test_song_facts.py` — what changes.
- `docs/pr/138/pr.md` — Vova's comments verbatim.
- The predecessor's transcript: https://claude.ai/code/session_01QtfFbu5XibmrCWX587vMbT

## 8. Next step

Resume the paused plan: `/go` from its Step 1 (`*.paused.md` case), plan steps 1–5.
