# Relay 10 — unsquatted blog: early .si widget, image copy, red vet

## 1. Standing constraints

- The preview is this branch's: republish after each visible change pushed
  (`gh workflow run preview.yml --ref claude/unsquatted-blog-oabq4m -f site=unsquatted`),
  but not faster than Pages deploys (relay 9 § 5).
- The .si post teases but stays off politics: «и со стёбом, и не про политику».
- The muthur sync offer was made; do not make it again.

## 2. The conversation

The session opened on
`/relay take claude/unsquatted-blog-oabq4m — main влит, конфликты разрешены; в посте про .si ждут ранний виджет и ссылки`.

**Agent**: attached, claimed the plan, started vet, ran a naming run and put a
`domains` widget "What I think about this" right after the post's opening
(fkaai.si, renamedagain.si, stillai.si, namingishard.si; mediumintelligence.si
was swapped out because it overflowed the post card), re-rendered the card.

**Operator** (answering relay 9's open question on how "Copy as image" is
made): «ну, как проще. мне важен результат а не способ. но выглядеть должно
без бубнов»

**Agent**: took the DOM snapshot.

**Operator**: «fkaai думаешь поймут?»

**Agent**: no, not without the gloss; swapped it for `aibyanyname.si`
(Juliet's rose), f7b834d6.

**Operator**: «а с саркастичным как? или это оно и есть? просто оно не отвечает
на вопрос "что я об этом думаю" вроде как?»

**Agent**: agreed — the four names joke about the rename and are not his
reaction; reaction names like `slowclap.si`, `yeahright.si`, `noted.si` would
be; handed to the successor, since the context budget warning had come and the
red vet came back at the same time.

## 3. Intent

Unchanged from relay 9 § 3, plus: the early widget is the Unnamed's sarcastic
reply to the news, in names, without insults; the post links its sources.

## 4. Decisions

- **Image copy = DOM snapshot** (`modern-screenshot`, 1fc51d12), chosen over a
  canvas redraw on the operator's "whichever is simpler, but it must look
  clean". `pages/post/ui/snapshot.ts` clones the figure into an offscreen
  `.frame` (page background, 24px padding, heart and share hidden, the domain
  taking the heart's column) and snapshots at scale 2.
- **A widget name must fit the post card's row**: ~15 characters with the
  zone; 21 (`mediumintelligence.si`) wraps "grab →" (check the re-rendered
  `super-intelligence.og.png`).
- **A `pattern` must start with `*`** (`picks.ts`'s schema).

## 5. Errors and dead ends

- **Vet on the merged head is red**, and was before this session's commits
  (run https://github.com/vzakharov/vovazakharov.com/actions/runs/42231740034):
  see the plan's `## Rest of the bite`, first item, for the full list. The
  unsquatted build fails prerendering `/blog/super-intelligence` with "Cannot
  read properties of undefined (reading 'href')" — probably from the merge
  (`main`'s `SharePopover`/`cardLead`, or the post's `name` widgets), not yet
  traced.
- `widgets/field-tools`' `cardLead`, `cardRows`, `shareCard`, `cardText` lost
  their only outside consumer in 1fc51d12, so knip will flag them; drop them
  from the barrel.
- A background agent was hunting the posts' source URLs in the earlier
  sessions' transcripts when this relayed; its result is lost. Its brief: for
  every fact in both posts, the URL behind it, found by `list_events` over
  session_01DaohkFBd3LDkjGBNsJjeGw (the .si post) and session_01DaohkFLy8DV22KR2v28PMa,
  session_01DaohkE55NLPZ6Shpfu2Rvp, session_01DaohkFAogh4KgWtaRvvsd9,
  session_01DaohkEYm1qr1UeGqXdeoHK (one wrote Singles' Day), paged into
  `tmp/sources/` and grepped, with a web search where none turns up.

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`; PR
  https://github.com/vzakharov/vovazakharov.com/pull/249, draft, base `main`,
  MERGEABLE/CLEAN at session start.
- **Plan** `docs/plans/unsquatted-blog.paused.md`; its `## Rest of the bite`
  is current.
- **Commits this session**: b1036e1f (early widget), f7b834d6 (aibyanyname),
  1fc51d12 (snapshot), then the plan's pause.
- **Preview** not republished.
- **Estimate**: this session 0.5 h middle developer, 0.75 h senior persona,
  0.25 h middle analyst. Remainder handed on: 1.25 h middle developer (vet
  fixes and the snapshot's browser check), 5.5 h senior persona (the reaction
  widget, three November posts and reflections), 1.5 h middle analyst (naming
  runs, fact checks, the posts' links), 1 h middle designer (widget, image and
  card checks).

## 7. Pointers

- `docs/plans/unsquatted-blog.paused.md` — the contract and what is left.
- `sites/unsquatted/public/blog/super-intelligence.md` — the early widget sits
  after "I opened a new tab and typed `.si`."
- `src/unsquatted/pages/post/ui/{snapshot.ts,widget-card.tsx,widget-card.module.scss}`.
- `src/unsquatted/scripts/RUNBOOK.md` — the naming runbook; `pnpm names check`
  and `pnpm names reject`.
- This session: https://claude.ai/code/session_01DaohkD2xbbCSgVQCsK3HmH.
  Earlier ones: `relay-9.md` § 7.

## 8. Next step

Redo the early widget as the operator asked last: «а с саркастичным как? или
это оно и есть? просто оно не отвечает на вопрос "что я об этом думаю" вроде
как?» — "What I think about this" lists names that are the Unnamed's sarcastic
reaction (a slow clap, an eye-roll, "sure", "noted"), never insulting and never
about the person; free `.si` picks with `post: super-intelligence`, ≤15
characters each; the four rename names leave the post and the catalogue (into
the ledger), and the lines under the widget follow. Re-render the card.

Then make vet green (plan's `## Rest of the bite`), look at the snapshot copy
in a browser in both themes and at phone width, add the posts' links, and
republish the preview.

Pending with the operator, from relay 8: the index subtitle and the closing
"Thank you for your attention to this matter."

Then `/polish full`, `/pr`, and bite 3.
