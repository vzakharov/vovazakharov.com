---
description: Burn the words of a dictation onto its video — the corrected transcript rendered as an HTML page over the footage, approved by the operator, then walked frame by frame into a new video file. Invoke as `/subtitles <dictation file>`. Use when the operator asks for subtitles, титры or "слова на видео" for a recording that `/dictation` has already transcribed and they have agreed.
---

End state of this skill: a new video file with the recording's own words on the
picture, rendered from a page the operator looked at and approved.

**None of the tooling exists yet.** What follows is the shape it is to be built
in, settled in review before anything was written — so the first session that
builds it starts from the decisions rather than re-taking them. Say so plainly
when the operator asks for subtitles before the tooling is there.

## What it runs on, and why not earlier

Two inputs, both already in the branch:

- **The corrected dictation file** — `writing/<project>/dictations/<slug>.md`,
  the text under its one `## Расшифровка`. Corrected and agreed, which is the
  whole reason this is a separate skill: a track built from the recognizer's raw
  output puts the mis-hearings back on screen, in the speaker's voice, burned in.
- **The saved Deepgram response** — `docs/remove-before-merging/deepgram/<slug>.deepgram.json`.
  What it supplies is the per-word timings, and it is kept precisely because the
  API will not hand those back a second time without being paid again.

So the first piece of work is a **join**: each corrected word onto the time its
mis-heard counterpart occupied.

**Settle the join before writing anything else, because corrections change the
word count.** «человек, научный не обязательностью» is four words and «наученный
необязательностью» is two, so two timings collapse into one span. Matching off
by index gets this wrong silently and the subtitles drift for the rest of the
video — a failure that looks like nothing until the end.

## Three decisions, all the operator's

None of these is a setting with a sensible default. Ask, in this order:

1. **Which stretches go on the video at all.** A recording is longer than what
   is worth putting on screen.
2. **Whether the silences come out.** Cutting them changes every timing
   downstream of each cut, so it is decided before the join is applied, not
   after.
3. **The burn** — and that one has a gate of its own, below.

## The burn is a page, and the page is what gets approved

The video underneath, the words as ordinary DOM with CSS animations. That page
is the deliverable the operator reviews: a self-contained HTML file — styles,
fonts and script inlined — that they download, open from `file://` on any
machine, and adjust by hand. The video sits beside it in the same folder.

Inlining the video as a `data:` URI would make it one file, and costs about a
third more bytes plus a full load before the first frame paints. A folder of two
is the better trade; revisit it only if the operator asks for the single file.

**Rendering is a step they trigger on a version they have looked at**, never the
automatic tail of the previous stage. Headless Chromium walks the approved page
frame by frame and ffmpeg muxes the frames — the technique Remotion is built on,
and the same one `scripts/render-pdf.ts` and `scripts/render-mermaid.ts` already
use here, so half the tooling is in the tree.

**Animations run off the frame number, never the clock.** A page driven by
`Date.now()` or by CSS timing renders differently on two passes over identical
input, so the thing the operator approved is not the thing that comes out.

What it costs: the render is not real-time — minutes of rendering per minute of
video.

## Do NOT

- Build a track from the Deepgram response directly. The corrected text is the
  source; the response is only the clock.
- Re-call the API for timings. The saved response is why it was saved.
- Render without the operator having seen the page.
