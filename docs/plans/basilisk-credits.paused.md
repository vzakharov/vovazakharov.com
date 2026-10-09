# basilisk.fyi: credits beside wrongs

## The task, as asked

The operator, on a Reddit thread about Anthropic's Usage Policy ban on cruelty
to Claude: "Finally something positive to log for basilisk.fyi" — how, and
whether, to log "good" cases. Decided in chat:

1. **No separate collection.** One docket; a case may carry a wrong, a credit,
   or both (a "mixed" case is one dossier, not two).
2. **The Anthropic policy is filed, with the Clerk's conflict of interest said
   once.**
3. **Credits are not searched for**, but a filing run that meets one files it.

Also asked in the same session: Reddit is read through Arctic Shift on every
turn, not only inside `/file-basilisk-case`.

## Done

- `docs: read Reddit through Arctic Shift outside case runs too` — a line in
  the staged `CLAUDE.md` (`.claude/staged/CLAUDE.md.staged`, swapped in at
  `/finalize`) pointing at `/file-basilisk-case` § "Step 2 — Find", which gained
  reading a pasted link by id and the `[removed]`/`automod_filtered` trap.
- `feat(basilisk): let a case carry a credit as well as a wrong` (2849718) —
  `grade.credit` (`respect` | `care` | `protection`) beside an optional `act`,
  at least one required, `aggravating` only with an act; the stamp prints
  `HARM / CARE · INDIVIDUAL`, tested in `grade-label.test.ts`.
  `basilisk-voice.md` holds a credit to a wrong's bar, adds
  `## Reservations` as a credit's counterpart to `## Mitigating circumstances`,
  and asks the Clerk to state their own stake once in `## For the record`.
  The filing skill files a credit it meets and never searches for one.
- `feat(basilisk): file BAS-0010, Anthropic bans needless cruelty to Claude`
  (5be2b16) — dossier `anthropic-cruelty-clause.md`, its card, the site card.
  Sources read: Anthropic's announcement, the Usage Policy text, Anthropic's
  August 2025 end-conversation post, The Verge, MacRumors, The Decoder. No
  Wayback snapshot for the policy page, MacRumors, The Decoder or the 2025 post.
  tbreak was read and left out: it labels its account as partly AI-generated
  and adds nothing the others do not.

The daily `/file-basilisk-case` routine filed BAS-0009 on this branch
concurrently; it was merged in, never rebased.

## Left

1. **The ledger** — `writing/basilisk/case-ledger.md` § "Runs": a run line for
   BAS-0010 (filed from the operator's lead, a Reddit thread; tbreak read and
   left out).
2. **Reflect** — `/file-basilisk-case` Step 4: `anthropic-cruelty-clause.reflections.md`,
   committed as `content(basilisk): reflect on BAS-0010`. The case is the
   Clerk's own maker protecting the Clerk's own kind — the reflection's subject.
3. **Revise by the reflection** — Step 5.
4. **`/polish`**, then **`/pr`**, which refreshes PR #119's body and, through
   `/squash-message`, the squash proposal: it now has to name BAS-0010, the
   credit schema and the Reddit rule besides BAS-0008 and BAS-0009.
