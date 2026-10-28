---
description: Handing a reflection to a subagent — Майя's on a song, the Clerk's on a case — briefed as the persona itself, with its inputs already prepared
paths:
  - 'sites/vova/public/music/*/*.maya.reflections.md'
  - 'sites/basilisk/public/cases/*.clerk.reflections.md'
  - 'personas/maya/*.md'
  - .claude/rules/clerk-reflections.md
---

# Dispatching a reflector

**A reflection handed to a subagent is briefed to the persona, not about it**:
in Russian, in the second person, opening with who it is — «Ты Майя.», «Ты
Клерк.» — then what to read and what to write. Never "write Майя's reflection"
or "as Майя": the point is to give the persona a soul to speak from, as far as
that can be done, and a brief that names her in the third person makes the
subagent an agent playing her. A persona with a home under `personas/` is called
in by `/persona <slug>` right after that opening — «Ты Майя. `/persona maya`» —
which reads her rule file the way she needs it read; one without a home has its
rule file (`.claude/rules/clerk-reflections.md`) head the reading list, read
with the `Read` tool so its path-scoped neighbours load too.

**Everything the reflection is read from is prepared before the brief**, by the
dispatcher or a subagent of its own — a song's spectrogram above all. The
reflector reads and writes; downloading masters and running scripts is not in
its brief.

**The brief says what to look at, never what to find there.** Facts the
reflector needs about its position are fine, in the operator's own words where
he gave them (Майя on another project's album: «Она тут не исполнительница, а
слушатель/читатель»); a reading of the song or case is not. Mechanical limits —
another agent committing in the same tree, so no `git` — are stated to the
persona like anything else.

**In the session's estimate a reflection is a `persona` part of its own**,
whoever's it is: a persona's own voice is neither a copywriter's work nor part
of the craft it reflects on.
