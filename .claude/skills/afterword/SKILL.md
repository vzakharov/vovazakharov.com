---
description: Write the agent's own reading of a piece as an afterword section at the foot of the file it is about — a dictation, a draft, anything the operator wrote and wants answered rather than summarised. Invoke as `/afterword <file> [<language>]`. Use when the operator asks what you think of something, says "а твой отклик?", "рефлексия", or asks for the agent's half of a two-voice piece.
---

End state of this skill: the file carries an afterword section saying what you
would say if the operator asked what you thought — in the material's language,
at its foot, and short enough that every block in it earns its place.

## What it is for

The project's post format runs in two voices: what the human said, then the
agent's answer to it (`writing/late-stage-agentic/plan.md` § "Post format").
This is the second voice, and the second voice is the narrow case.

The wide one is durability. A reading typed into a PR thread is read once and
then scrolled past; the same reading at the foot of the file is there the next
time anyone opens it. So this is the form the operator asks for whenever they
want feedback kept rather than discussed — on a draft, a plan, a skill, a file
nobody is publishing. `@.claude/skills/dictation/SKILL.md` calls it for its
transcripts.

## The section

At the foot of the file, opening with one line saying whose words follow.

**Language is a parameter**, `/afterword <file> [<language>]`, defaulting to the
language the material is written in — the afterword answers the piece, so it
speaks the piece's language rather than this file's. The heading is that
language's standing name for the section, and it stays the same across every
piece in that language: the operator reads these files against each other, and a
file that invents its own name for the section costs them the comparison. The
names this project has settled on are in the skills that use them.

What goes in it is open. What the piece argues under what it says, what it takes
for granted without saying, where the argument is missing a step, what is said
three times where once would carry it — those are the kind of thing, offered to
show the altitude rather than to be worked through as a list. Order the blocks by
what matters, and say so in the opening line if the order is doing work.

**This is the half that earns the file.** A summary of what was already read, or
a compliment, is the failure mode — agreeing is fine where something actually
lands, but a block that only agrees is praise wearing the shape of a response.

## Three things it must keep straight

- **No account of how the afterword got here.** Writing about your own writing
  goes wrong as a file narrating its own revisions — "I first read this as X,
  now I read it as Y". The PR threads are where that belongs. Where the reading
  rests on something settled outside the file, a clause pointing at it — "settled
  in review", or whatever the sentence wants — carries it without dragging the
  argument in.
- **A finding the author has answered ends at the settled reading, and stays.**
  Their answer is part of what the file now knows, so the block is rewritten to
  what holds once it is taken in: not defended, not deleted. The afterword is the
  record of where the thinking came out, which is the half worth having a month
  later.
- **What would be cut from a post is not what gets cut from the source.** A
  digression carrying a third of a recording is still the recording. Say "in a
  post I would cut this" and leave the text alone.

## Do NOT

- Write one for a file the operator did not ask about. An unrequested reading at
  the foot of their draft is the agent talking in their document.
- Edit the material to make a finding land. The finding is about the text as it
  stands.
