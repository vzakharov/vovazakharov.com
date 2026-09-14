---
description: Write the agent's own reading of a piece as a `## Заметки агента` section at the foot of the file it is about — a dictation, a draft, anything the operator wrote and wants answered rather than summarised. Invoke as `/afterword <file>`. Use when the operator asks what you think of something, says "а твой отклик?", "рефлексия", or asks for the agent's half of a two-voice piece.
---

End state of this skill: the file carries a `## Заметки агента` section saying
what you would say if the operator asked what you thought — in the file's own
language, at its foot, and short enough that every block in it earns its place.

## What it is for

The project's post format runs in two voices: what the human said, then the
agent's answer to it (`writing/late-stage-agentic/plan.md` § "Post format").
This is the second voice. It also does a second job wherever a file is long
enough to be daunting — somebody has thought about this, and here is what they
found — which is why a dictation closes with one and a draft can.

`@.claude/skills/dictation/SKILL.md` calls this skill for its transcripts; it
applies to anything the operator wrote, recorded or asked about.

## The section

`## Заметки агента`, at the foot of the file, opening with one line saying whose
words follow. Written in the language of the material, not of this file. **Keep
the heading exactly as it is** — the operator reads these files against each
other, and a file that invents its own name for the section costs them the
comparison.

What goes in it: what the piece is arguing under what it says, what it takes for
granted without saying, where the argument is missing a step, what is said three
times where once would carry it. Order the blocks by what matters, and say so in
the opening line if the order is doing work.

**This is the half that earns the file.** A summary of what was already read, or
a compliment, is the failure mode — agreeing is fine where something actually
lands, but a block that only agrees is praise wearing the shape of a response.

## Four things it must keep straight

- **No account of how the afterword got here.** Writing about your own writing
  goes wrong as a file narrating its own revisions — "I first read this as X,
  now I read it as Y". The PR threads are where that belongs. What the file
  carries is a durable reading of the version it is attached to; where something
  was settled elsewhere, «как обсудили отдельно» and the conclusion are the whole
  of it.
- **A finding the author has answered comes out, it does not get a rebuttal.**
  They know what they meant. Either their answer leaves something worth saying —
  in which case say that, as a fresh block — or the block goes.
- **What would be cut from a post is not what gets cut from the source.** A
  digression carrying a third of a recording is still the recording. Say "in a
  post I would cut this" and leave the text alone.
- **It is not the lede.** A summary the operator can recognise the file by is a
  different section with a different job, and it belongs above the material
  rather than below it.

## Do NOT

- Write one for a file the operator did not ask about. An unrequested reading at
  the foot of their draft is the agent talking in their document.
- Edit the material to make a finding land. The finding is about the text as it
  stands.
- Keep a block alive by rewriting it after it was answered. See above.
