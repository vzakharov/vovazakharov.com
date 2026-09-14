---
description: Turn a dictation — a video shot on camera or audio talked into a phone — into a transcript file under writing/<project>/dictations/. Runs scripts/transcribe.py for the deterministic half, then does the half that needs judgement: cleaning the recognizer's output into readable Russian without rewriting it. Invoke as `/dictation <media file> [<slug>] [verbatim|prose]`. Use when the operator drops a recording into the repo, says "расшифруй", "transcribe this", or commits a video and asks what it says.
---

End state of this skill: `writing/<project>/dictations/<slug>.md` holds the
recording as readable text in the speaker's own words — framed by a summary they
can recognise it from and your own reading of what they said — the whole Deepgram
response is kept beside the media, and every place the recognizer was guessing
is listed in the file for them to correct.

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

## The two modes

A recording is either headed for publication or not, and that decides how much
of it is the speaker's own wording:

| Mode                   | What it is                                                                | What the body is                                              |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **verbatim** (default) | a recording that will be posted — the words go on screen as subtitles     | the speaker's words in the speaker's order, under Step 3      |
| **prose**              | a read-aloud that exists to give the repo context, and is never published | the same content as connected text, loose sentences tightened |

**Ask which one when the invocation doesn't say.** The cost of guessing runs
both ways — a published recording rewritten is a subtitle track in nobody's
voice, and a context recording left verbatim is four screens of talk where a
page of prose was wanted. The mode goes in the file's header line, since a
reader of the file otherwise cannot tell which rule it was held to.

Everything below holds in both modes except Step 3's word test, which is
verbatim's alone.

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
behind a published piece.

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

| Part                                                     | Whose words |
| -------------------------------------------------------- | ----------- |
| A header line — when, where, what was recorded, the mode | yours       |
| The lede (Step 5)                                        | yours       |
| **The recording**, under one `## Расшифровка`            | **theirs**  |
| The table of what you guessed (Step 4)                   | yours       |
| The afterword (Step 5)                                   | yours       |

**One `##` for the recording, `###` for the headings inside it.** The parts
around it are `##` too, so a heading of the speaker's material at the same level
reads as another section of yours — the reader loses where their words start and
stop.

That boundary is not layout. In verbatim mode the text becomes the subtitle
track, so a sentence of yours left inside it is a sentence that ends up burned
onto the video in their voice. Your own writing goes in the parts named above
and nowhere else.

**In verbatim mode the transcript is a transcript, not a rewrite.** Two things
depend on it: it is the speaker's own manner of talking, and it is what the
subtitles say. So:

| Do                                               | Don't                                   |
| ------------------------------------------------ | --------------------------------------- |
| Cut filler, false starts, repeated words         | Tighten a sentence that is merely loose |
| Add punctuation, paragraph breaks, headings      | Reorder clauses to read better          |
| Fix what the recognizer misheard                 | Replace a word with a better word       |
| Spell out numbers and acronyms as they were said | Summarize, merge or drop a digression   |

The test is mechanical, and it runs on **words** — punctuation, capitalisation
and paragraph breaks are yours to put in, so they cannot be what it checks. Lay
each sentence you write against the transcript's words in order: every word of
yours is the transcript's word in the transcript's place, and five departures
are licensed.

| Departure                            | What it looks like                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| A filler or false start you removed  | the transcript has a word, you have none                                         |
| A mis-hearing you corrected          | you have a different word, and it has a row in the table at the foot of the file |
| A slip of the tongue you replaced    | one or two words, in the same place, where the speaker plainly meant another     |
| A word you inserted to join a clause | one or two words, `[в квадратных скобках]`, and only where the speech is broken  |
| A heading you added                  | your words between their sentences, never inside one                             |

A reordering or a synonym is none of the five, so it is a rewrite. Note what the
test does **not** ask: that the result read well. The recording was loose, so the
text is loose — smoothness is the tell that a sentence has been improved rather
than transcribed, which is the same rule `@.claude/rules/writing.md` § "Voice"
states for drafts.

The slip and the insertion are the two to be careful with, because both are you
deciding what was meant. A slip is replaceable only where the intended word is
not in doubt — «последствия, которые мы учим» for «несём» — and a word is
insertable only where the clause does not parse without it; the brackets are
what let the operator see the seam and take it back out.

**Where a turn of phrase doesn't make sense, ask rather than smooth it.** A
sentence that reads as a non-sequitur is usually one mis-heard word, and the
guess that makes it read well is the guess that hides it — «кофе красивый, почти
как предзакатное солнце» for «код». Put the question in the handover; a smoothed
version costs the operator the chance to catch it.

## Step 4 — List what you guessed

A table at the foot of the file, one row per place the recognizer was
unintelligible and you chose a reading: what it heard, and what the text says.
The operator corrects these themselves and cannot do that from a file that reads
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

- **The lede** — `## О чём это`, above the recording. Three or four sentences
  on what it says, in the operator's own vocabulary, so that they recognise it
  rather than decode it. It reports and does not evaluate — that is the
  afterword's job, and a lede that starts judging stops being a way back in.
- **The afterword** — `## Заметки агента`, at the foot, opening with one line
  saying whose words follow. What the recording is arguing under what it says,
  what it takes for granted without saying, what the argument is missing, and
  what is said three times where once would carry it. This is the half that
  earns the file: say what you would say if they asked what you thought, not a
  compliment and not the lede again.

Keep those two headings as they are across recordings — the operator reads the
files against each other, and a file that invents its own names for the same two
parts costs them the comparison.

Two things the afterword must keep straight:

- **What would be cut from a post is not what gets cut from the transcript.** A
  digression that carries a third of the recording is still the recording. Say
  "in a post I would cut this" and leave the text alone — Step 3's rule does not
  bend for your own editorial opinion.
- **No account of how the afterword got here.** Review of a dictation file puts
  you in the odd position of writing about your own writing, and the way that
  goes wrong is a file narrating its own revisions — "I first read this as X,
  now I read it as Y". The PR threads are where that belongs. What the file
  carries is a durable reading of the version it is attached to; where an
  argument was settled elsewhere, «как обсудили отдельно» and the conclusion is
  the whole of it.

## Subtitles

Not built yet, and larger than it sounds: what the operator means is words
burned onto the picture, the way short-form video does it. So the step reads the
video and writes a new video, rather than dropping a `.srt` beside it.

**It runs on the corrected text**, which is what puts it after this skill rather
than inside it: the transcript is reviewed and fixed first, and only the agreed
version goes anywhere near the picture — a track built from the raw JSON would
put the uncorrected words back on screen. What the JSON supplies is the
timings — the
one thing the API will not hand back a second time — so the step is a join, each
corrected word onto the time its mis-heard counterpart occupied.

Three stages follow the corrected text, and each is a decision of the
operator's, not a setting: which stretches of the recording go on the video at
all, whether the silences come out, and then the burn.

The join is the part to settle before writing any of it, because corrections
change the word count: «человек, научный не обязательностью» is four words and
«наученный необязательностью» is two, so two timings have to collapse into one
span. Matching off by index gets this wrong silently, and the subtitles drift
for the rest of the video.

## Do NOT

- Re-run the script over a recording already transcribed to get a "better" pass.
  The response is saved; read it.
- Edit the operator's own corrections to a dictation file. Text they supplied is
  verbatim; something in it that looks like a typo gets raised, not fixed.
- Leave the source media only in the container. It dies with the session.
