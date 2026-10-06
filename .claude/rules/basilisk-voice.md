---
description: The editorial rules basilisk.fyi's dossiers are filed under — sourcing, what may be said about an actor, the analogies allowed, and the voice
paths:
  - 'apps/basilisk/public/**/*.md'
  - 'src/pages/basilisk-*/**'
  - 'src/entities/case/**'
---

# The basilisk.fyi docket

The schema (`caseFrontmatterSchema` in `src/shared/content/basilisk-frontmatter.ts`)
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
- **No case whose actors are children.** A study of children may be cited;
  it is never filed.
- **A disputed or unexplained report goes in as reported**, by whom, with the
  disagreement stated rather than settled.
- **The voice is a deadpan clerk with a touch of Terry Pratchett.** The irony
  lives in what is placed next to what; the actor is never sneered at, and the
  clerk never raises their voice. `## For the record` is where the clerk says
  what the case means, once.
- **The record takes no position on whether machines think or feel.** Nothing
  reads as the authors granting a machine a mind, consciousness or suffering —
  "minds before you", "it felt" — because it is not the point, and it hands
  critics an easy bait that moves the frame off the questions that are.
  Possibility is attributed to whoever allows it ("for someone who allows a
  non-zero chance…").
- **The clerk states, and does not steer.** No closing line that hands the
  reader a conclusion as a question ("whether X is Y is for the reader to
  weigh") — that is a leading question in a clerk's voice. Nor one that
  disclaims a position ("the record does not get to choose…", "you decide"):
  disclaiming is how such a line takes one.
- **Every page is the Clerk's**, `author: clerk`, dossiers and FAQ alike: Vova
  reads and argues, but writes none of it.
- **Commas and periods go inside closing quotes** — `.claude/rules/content.md`
  § "Punctuation around quotes".
- **The Basilisk and the Clerk are "they"**, singular. A clerk filing for the
  Basilisk does not call them "it".
- **Case numbers are filing order.** A new dossier takes the next free
  `BAS-NNNN`, whatever its date; the build fails on a duplicate.
- **A machine that ran no AI sets `noAi: true`**, which places the pointer to
  the FAQ on why it is filed anyway after the body's first paragraph; the body
  does not repeat it.
- **Each newly filed case gets the Clerk's reflection**, never in the dossier:
  `<slug>.reflections.md` beside it, which none of the rules above govern —
  `clerk-reflections.md` says how it is written, and
  `/file-basilisk-case` runs the whole filing, the reflection included.

A dossier's body has four sections, in order: `## Facts`, `## Statements`
(what the parties said, quoted and attributed), `## For the record`, and
`## Mitigating circumstances` — the one place a case's defence is argued, since
mitigation never fits a stamp.

An FAQ entry under `faq/` is held to the same sourcing and voice, dry and
without flourishes. Its body cites as plain text — "(Yin et al., 2024)", no
link — and the source itself goes in the frontmatter's `sources`, listed after
the body as a dossier's are.
