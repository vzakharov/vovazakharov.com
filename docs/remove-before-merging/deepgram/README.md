# Raw Deepgram responses

Written by `scripts/transcribe.py`, one pair per recording:
`<slug>.deepgram.json` is the whole API response, `<slug>.transcript.md` the
timecoded reading of it. `@.claude/skills/dictation/SKILL.md` is what turns the
second into the dictation files under `writing/late-stage-agentic/dictations/`.

The responses are kept because the per-word timings and confidences are what a
subtitle track is built from, and the API will not hand them back a second time
without another call.

| Slug            | Source                                                           |
| --------------- | ---------------------------------------------------------------- |
| `p1-the-idea`   | `../p1-the-idea.m4a`, 4:33, dictated to a phone                  |
| `p2-the-limits` | `../first-content.mp4`, 6:42, on camera → `../p2-the-limits.m4a` |
