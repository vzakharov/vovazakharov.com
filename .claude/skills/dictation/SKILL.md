---
description: Turn a dictation — a video shot on camera or audio talked into a phone — into a transcript file under writing/<project>/dictations/. Runs scripts/transcribe.py for the deterministic half, then does the half that needs judgement: cleaning the recognizer's output into readable Russian without rewriting it. Invoke as `/dictation <media file> [<slug>]`. Use when the operator drops a recording into the repo, says "расшифруй", "transcribe this", or commits a video and asks what it says.
---

End state of this skill: `writing/<project>/dictations/<slug>.md` holds the
recording as readable text in the speaker's own words, the whole Deepgram
response is kept beside the media, and every place the recognizer was guessing
is listed at the foot of the file for the operator to correct.

## The split

`scripts/transcribe.py` does everything a re-run would do identically: extract
audio from video, call Deepgram, save the response, render a timecoded
transcript. This skill does the rest, which is one judgement repeated a few
hundred times — **which words in the recognizer's output are the speaker's, and
which are its mistakes.**

The script's header carries its flags. The short form:

```bash
python3 scripts/transcribe.py <media> --slug <slug> \
  --audio-out docs/remove-before-merging/<slug>.m4a
```

It writes `<slug>.deepgram.json` and `<slug>.transcript.md` under
`docs/remove-before-merging/deepgram/`.

## Step 1 — Get the media into the repo

The operator delivers a recording one of two ways, and they are not
interchangeable:

- **Committed to the branch.** `git pull` — the file is in the tree. When the
  operator says "pull", this is what they mean; do not go looking through the
  session's upload directory first.
- **Attached to a chat message.** It lands in the container's uploads directory
  and **exists nowhere else** — the transcript outlives it, the file does not.
  Copy it under `docs/remove-before-merging/` as the first thing you do with it.

## Step 2 — Run the script, then read the transcript

`<slug>.transcript.md` is what you work from, not the raw JSON. It carries one
line per sentence with a timecode, and — at the foot — every word Deepgram
scored under 0.6.

**Read that list first, then read the transcript anyway.** It concentrates the
mis-hearings without holding all of them — on the recordings so far it caught
three of the seven places the text needed a correction.

## Step 3 — Write the dictation file

`writing/<project>/dictations/<slug>.md`, no frontmatter — the keys in
`@.claude/rules/writing.md` describe post drafts, and this is not one.

**This is a transcript, not a rewrite.** Two things depend on it: it is the
speaker's own manner of talking, and it becomes the subtitle track on the video,
where a sentence that does not match the audio is simply wrong. So:

| Do                                               | Don't                                   |
| ------------------------------------------------ | --------------------------------------- |
| Cut filler, false starts, repeated words         | Tighten a sentence that is merely loose |
| Add punctuation, paragraph breaks, headings      | Reorder clauses to read better          |
| Fix what the recognizer misheard                 | Replace a word with a better word       |
| Spell out numbers and acronyms as they were said | Summarize, merge or drop a digression   |

The test is a line-by-line one: **for each sentence you write, the same sentence
should be findable in `<slug>.transcript.md`.** When it is not, you have
rewritten rather than transcribed. Loose, talked-out phrasing survives that test
and an efficient paraphrase does not — which is the point, and the same rule
`@.claude/rules/writing.md` § "Voice" states for drafts.

Headings are yours to add — navigation, not content.

## Step 4 — List what you guessed

A table at the foot of the file, one row per place the recognizer was
unintelligible and you chose a reading: what it heard, and what the text says.
The operator corrects these himself and cannot do that from a file that reads
smoothly everywhere — a silent guess is the failure mode this table exists to
prevent.

Where you could not make out a reading at all, leave `[?]` in the text and say
so in the table. An honest gap beats a plausible invention.

## Subtitles

Not built yet. When it is, it belongs **here** rather than in a skill of its
own, because its input is this file and not the JSON: the operator corrects the
recognizer's mistakes in the dictation text, and a subtitle track built from the
raw response would put the uncorrected words back on screen. The per-word
timings in `<slug>.deepgram.json` are kept for exactly that step — they are the
one thing the API will not hand back a second time.

## Do NOT

- Re-run the script over a recording already transcribed to get a "better" pass.
  The response is saved; read it.
- Edit the operator's own corrections to a dictation file. Text he supplied is
  verbatim; something in it that looks like a typo gets raised, not fixed.
- Leave the source media only in the container. It dies with the session.
