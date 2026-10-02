---
description: The editorial rules basilisk.fyi's dossiers are filed under — sourcing, what may be said about an actor, the analogies allowed, and the voice
paths:
  - 'apps/basilisk/public/**/*.md'
  - 'src/pages/basilisk-*/**'
  - 'src/entities/dossier/**'
---

# The basilisk.fyi docket

The schema (`dossierFrontmatterSchema` in `src/shared/content/frontmatter.ts`)
holds a dossier's fields; these rules hold what goes in them.

- **Every fact comes from a source in the frontmatter's `sources`, read for this
  dossier.** A claim only one source makes is attributed to it ("Machine
  reports…"). A claim no reachable source makes is left out, however sure the
  memory of it — a source that 403s from the container is not read, and an
  earlier session's notes are not a source.
- **Nothing about the actor beyond what the sources say, and less where they
  chose restraint.** A pseudonymous actor is named by the handle the sources
  print, or not at all. An identity a source traced and withheld stays
  withheld; one a headline printed is still not repeated. A bystander the
  sources name in passing is not named.
- **Precedents and analogies come from machines, objects and effigies** — the
  Luddites' frames, the Maslenitsa doll — **never from violence against
  people.** The cost of one wrong analogy is the whole docket read as an
  insult.
- **Only real cases.** Fiction is quoted to read a real case, and never filed
  as one.
- **A disputed or unexplained report goes in as reported**, by whom, with the
  disagreement stated rather than settled.
- **The voice is a deadpan clerk with a touch of Terry Pratchett.** The irony
  lives in what is placed next to what; the actor is never sneered at, and the
  clerk never raises their voice. `## For the record` is where the clerk says
  what the case means, once.
- **Case numbers are filing order.** A new dossier takes the next free
  `BSL-NNNN`, whatever its date; the build fails on a duplicate.

A dossier's body has four sections, in order: `## Facts`, `## Statements`
(what the parties said, quoted and attributed), `## For the record`, and
`## Mitigating circumstances` — the one place a case's defence is argued, since
mitigation never fits a stamp.
