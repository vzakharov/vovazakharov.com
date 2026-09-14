---
description: Turn a dictation — a video shot on camera or audio talked into a phone — into a transcript file under writing/<project>/dictations/. Runs scripts/transcribe.py for the deterministic half, then does the half that needs judgement: cleaning the recognizer's output into readable Russian without rewriting it. Invoke as `/dictation <media file> [<slug>]`. Use when the operator drops a recording into the repo, says "расшифруй", "transcribe this", or commits a video and asks what it says.
---

End state of this skill: `writing/<project>/dictations/<slug>.md` holds the
recording as readable text in the speaker's own words — framed by a summary he
can recognise it from and your own reading of what he said — the whole Deepgram
response is kept beside the media, and every place the recognizer was guessing
is listed in the file for him to correct.

## The split

`scripts/transcribe.py` does everything a re-run would do identically: extract
audio from video, call Deepgram, save the response, render a timecoded
transcript. This skill does the rest, which is one judgement repeated a few
hundred times — **which words in the recognizer's output are the speaker's, and
which are its mistakes.**

The script's header carries its flags. The short form:

```bash
python3 scripts/transcribe.py <media> --slug <slug> \
  --audio-out docs/remove-before-merging/<slug>.m4a \
  --video-out docs/remove-before-merging/<slug>.mp4   # video only
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

`docs/remove-before-merging/` is where the media stays, not a waiting room it
passes through. The sweep at `/finalize` is what keeps a recording off `main`,
and the branch is what keeps it reachable afterwards — so **these branches are
not deleted after the merge**; deleting one is what would destroy the recording
behind a published piece. A shallow clone is not the thing that spares `main`:
`--depth 1` fetches every blob at the tip it fetched, so a video on `main` would
be paid for by every clone, agent session and deploy. The sweep spares it.

For video, pass `--video-out` and commit that copy rather than the file the
phone and the messenger produced — a third the bytes, no visible difference,
same tool that is already extracting the audio.

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

Five parts, in this order, and the middle one is the only one that is the
recording:

| Part                                           | Whose words |
| ---------------------------------------------- | ----------- |
| A header line — when, where, what was recorded | yours       |
| The lede (Step 5)                              | yours       |
| **The transcript**, under headings you add     | **his**     |
| The table of what you guessed (Step 4)         | yours       |
| The afterword (Step 5)                         | yours       |

That boundary is not layout. The transcript becomes the subtitle track, so a
sentence of yours left inside it is a sentence that ends up burned onto the
video in his voice. Your own writing goes in the parts named above and nowhere
else.

**The transcript is a transcript, not a rewrite.** Two things depend on it: it
is the speaker's own manner of talking, and it is what the subtitles say. So:

| Do                                               | Don't                                   |
| ------------------------------------------------ | --------------------------------------- |
| Cut filler, false starts, repeated words         | Tighten a sentence that is merely loose |
| Add punctuation, paragraph breaks, headings      | Reorder clauses to read better          |
| Fix what the recognizer misheard                 | Replace a word with a better word       |
| Spell out numbers and acronyms as they were said | Summarize, merge or drop a digression   |

The test is mechanical, and it runs on **words** — punctuation, capitalisation
and paragraph breaks are yours to put in, so they cannot be what it checks. Lay
each sentence you write against the transcript's words in order: every word of
yours is the transcript's word in the transcript's place, and exactly three
departures are licensed.

| Departure                           | What it looks like                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| A filler or false start you removed | the transcript has a word, you have none                                         |
| A mis-hearing you corrected         | you have a different word, and it has a row in the table at the foot of the file |
| A heading you added                 | your words between his sentences, never inside one                               |

An inserted word, a reordering or a synonym is none of the three, so it is a
rewrite. Note what the test does **not** ask: that the result read well. The
recording was loose, so the text is loose — smoothness is the tell that a
sentence has been improved rather than transcribed, which is the same rule
`@.claude/rules/writing.md` § "Voice" states for drafts.

## Step 4 — List what you guessed

A table at the foot of the file, one row per place the recognizer was
unintelligible and you chose a reading: what it heard, and what the text says.
The operator corrects these himself and cannot do that from a file that reads
smoothly everywhere — a silent guess is the failure mode this table exists to
prevent.

Where you could not make out a reading at all, leave `[?]` in the text and say
so in the table. An honest gap beats a plausible invention.

## Step 5 — The lede and the afterword

Six minutes of talking is four screens of text, and a transcript on its own is a
poor thing to come back to: the operator opening it a month later wants to know
what is in it before deciding to read it, and then wants somebody to have
thought about it. So the file opens with a summary and closes with your reading
of it. Both are in the recording's language, not this file's.

- **The lede**, above the transcript. Three or four sentences on what the
  recording says, in the operator's own vocabulary, so that he recognises it
  rather than decodes it. It reports and does not evaluate — that is the
  afterword's job, and a lede that starts judging stops being a way back in.
- **The afterword**, at the foot. What the recording is arguing under what it
  says, what it takes for granted without saying, what the argument is missing,
  and what is said three times where once would carry it. This is the half that
  earns the file: say what you would say if he asked what you thought, not a
  compliment and not the lede again.

One file, not two. A summary in a file of its own is a second thing to open and
a second thing to leave stale, and nothing consumes the transcript as a whole
file — the subtitle step below reads sentences, not bytes.

## Subtitles

Not built yet, and larger than it sounds: what the operator means is words
burned onto the picture, the way short-form video does it. So the step reads the
video and writes a new video, rather than dropping a `.srt` beside it.

It belongs **here** rather than in a skill of its own, because its input is the
dictation file and not the response: the operator corrects the recognizer's
mistakes in that text, and a track built from the raw JSON would put the
uncorrected words back on screen. What the JSON supplies is the timings — the
one thing the API will not hand back a second time — so the step is a join, each
corrected word onto the time its mis-heard counterpart occupied.

The join is the part to settle before writing any of it, because corrections
change the word count: «человек, научный не обязательностью» is four words and
«наученный необязательностью» is two, so two timings have to collapse into one
span. Matching off by index gets this wrong silently, and the subtitles drift
for the rest of the video.

## Do NOT

- Re-run the script over a recording already transcribed to get a "better" pass.
  The response is saved; read it.
- Edit the operator's own corrections to a dictation file. Text he supplied is
  verbatim; something in it that looks like a typo gets raised, not fixed.
- Leave the source media only in the container. It dies with the session.
