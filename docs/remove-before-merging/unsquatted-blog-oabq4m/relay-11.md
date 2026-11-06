# Relay 11 — unsquatted blog: reaction widget done, vet nearly green

## 1. Standing constraints

- The preview is this branch's: republish after each visible change pushed
  (`gh workflow run preview.yml --ref claude/unsquatted-blog-oabq4m -f site=unsquatted`),
  but not faster than Pages deploys (relay 9 § 5).
- The .si post teases but stays off politics: «и со стёбом, и не про политику».
- The muthur sync offer was made; do not make it again.

## 2. The conversation

The session opened on
`/relay take claude/unsquatted-blog-oabq4m — ранний виджет и копирование картинкой сделаны, но имена в виджете не отвечают на «что я об этом думаю», а vet после слияния main красный; источники для ссылок найдены`.
No operator message followed.

**Agent**: attached, claimed the plan, reproduced the red build locally and
fixed it, redid the early widget as the reaction names, cleared prettier,
stylelint, type-overlap, knip and the listed lint, started vet on GitHub, then
paused the plan for the context budget and relayed, all in the one turn, so
there is no earlier reply for a Last agent turn section
(`relay-last-reply.py`: "no turn before this one wrote any text").

## 3. Intent

Unchanged from relay 9 § 3 and relay 10 § 3: the early widget is the Unnamed's
sarcastic reply to the news, in names, without insults; the post links its
sources.

## 4. Decisions

- **The reaction names**: `lolok.si` (the operator's), `slowclap.si`,
  `yeahright.si`, `ohnoanyway.si`, category `AI becomes SI`, form `phrase`
  (`slowclap` `compound`). The lines under the widget gloss each in the
  Unnamed's voice; `yeahright` is about renaming a thing to make it smarter, not
  about who renamed it. Not yet shown to the operator: their verdict is open.
- **The build fix** (b4da4c15): `SharePopover` takes the link in `open()` into
  state, since the closed dropdown is prerendered with no `location`.
- **Type-overlap** (6784b961): `OccasionLink = WithLink & WithOccasion` and
  `AnchoredList`, `Listed`, `Worded` live in `unsquatted/shared/content` (types
  through `index.node-safe.ts`); `WithDomain` moved to kernel's typings; the
  widget placeholder's `source` became `fileName` (it was the authored file,
  `WithFileName`), the hast/props names with it (`dataWidgetFileName`,
  `data-widget-file-name`); the card template's `note` became `footnote`.

## 5. Errors and dead ends

- `require('playwright')` in `mockups/pages.cjs` and `mockups/shoot.cjs` fails
  `@typescript-eslint/no-require-imports`; ESM `import('playwright')` fails
  with `ERR_MODULE_NOT_FOUND` because the global install resolves only through
  `NODE_PATH`. So it needs the operator's yes for a suppression, or retiring the
  two scripts (they drew the approved mockups; the PNGs stay). Not yet asked.

## 6. State

- **Branch** `claude/unsquatted-blog-oabq4m`; PR
  https://github.com/vzakharov/vovazakharov.com/pull/249, draft, base `main`,
  MERGEABLE/CLEAN at session start.
- **Plan** `docs/plans/unsquatted-blog.paused.md`; `## Rest of the bite` is
  current.
- **Commits this session**: 2c51b433 (claim), b4da4c15 (build fix), 52d6b03f
  (reaction widget), 2d415c6e (prettier, stylelint), 6784b961 (type-overlap,
  knip), 30841c09 (mockup lint), a5364101 (pause).
- **Vet** running on 30841c09 at session end:
  https://github.com/vzakharov/vovazakharov.com/actions/runs/42235108725 —
  expect the two `require` findings; read it before anything else.
- **Preview** not republished.
- **Estimate**: this session 1 h middle developer, 0.5 h senior persona, 0.25 h
  middle analyst. Remainder handed on: 0.5 h middle developer (the vet tail and
  the snapshot's browser check), 5 h senior persona (three November posts and
  reflections), 1.25 h middle analyst (the posts' links, fact checks), 1 h
  middle designer (widget, image and card checks).

## 7. Pointers

- `docs/plans/unsquatted-blog.paused.md` — the contract and what is left.
- `docs/remove-before-merging/unsquatted-blog-oabq4m/relay-10.md` § 5 — the
  posts' sources, one link per claim.
- `sites/unsquatted/public/blog/super-intelligence.md` — the post.
- `src/unsquatted/scripts/RUNBOOK.md` — the naming runbook.
- This session: https://claude.ai/code/session_01DaohkFTxZnZa8Hj8p1qSsh.
  Earlier ones: `relay-10.md` § 7.

## 8. Next step

Show the operator the reaction widget (lolok, slowclap, yeahright, ohnoanyway
and the lines under it) and ask about the mockups' `require` (suppression or
retire the scripts) — both asked, not waited on. Meanwhile read the vet run; fix
what else it reports; look at the snapshot copy in a browser in both themes and
at phone width; add the posts' links from relay 10 § 5; republish the preview.

Pending with the operator, from relay 8: the index subtitle and the closing
"Thank you for your attention to this matter."

Then `/polish full`, `/pr`, and bite 3.
