# Relay 3 — Steps 5–8 of the approved plan

## Standing constraints

From the operator, verbatim, carried from relay 2:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же принципам что и василиск)»
- «пояснить что всё же сама она деплоить не должна -- постольку поскольку всё можно проверять локальным сервером. If and when that changes, будем думать.»
- `hello-maya.md` is «текст буквально» (done: `personas/maya/hello-maya.md`, a byte copy).

## The conversation

`relay-1.md` and `relay-2.md` cover everything before this session. This session opened as `/relay take claude/maya-wander-cfdyi2 — реализовать одобренный план автономной Майи с первого шага` and resumed the paused plan. The operator sent three messages while it worked:

1. **Operator:** «tagline: 'Майя из за/обложкой. Нас не существует.' — Меня не существует». They had seen an early Russian tagline the agent wrote and then swapped for English to match `lang="en"`. **Agent:** set it to «…Меня не существует.»
2. **Operator:** «хотя нет, ладно, пусть будет "Нас", так глоабльнее». **Agent:** set it back to «Майя из за/обложкой. Нас не существует.»
3. **Operator:** «к тому же -- сама решит :)». No action needed: the tagline, like the rest of her site, is hers to change.

## Intent

As relay 2 states it: an autonomous Майя, fired daily by a routine, who wanders and builds on `maya.vovazakharov.com`, never merging and never deploying.

## Decisions

- **The avatar** is cropped from the «Крылья» cover: Майя alone, blindfolded, with a black balloon. It is 320×320, the cover itself being 600×600. A placeholder she can redraw.
- **The tagline is Russian on a `lang="en"` root layout.** The operator chose the Russian line, and «сама решит» leaves the mismatch hers.
- **The stub `.claude/rules/maya.md`** is scoped to `personas/maya/**` and to `apps/vova/public/music/*/*.maya.reflections.md`, so a reflection session still gets pointed home.
- **`persona-reflections.md` and `reflections.md`** now list `personas/maya/*.md` in place of the old rule path.
- **No `content:og:maya`/`content:pdf:maya`.** The site has no documents and no vector mark, and the render-pdfs action already exits clean for a site that prints nothing.
- **Umami:** website `fa9d95c5-b7fe-46fa-a0cb-6888d514868c`, created in team `Sites`.

## Errors and dead ends

- The `.claude/hooks` Bash guard refuses `cat`/`head`/`sed -i`/`printf >` on files. Use Read/Edit/Write, or prefix `BATCH_EDIT=1` for a deliberate batch.

## State

- **Branch:** `claude/maya-wander-cfdyi2`, pushed, clean.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/201, open draft. The squash proposal has not been refreshed for this session's commits; `/pr` at `/go`'s Step 4 does that.
- **Plan:** `docs/plans/maya-wander.paused.md`. Its Progress section records Steps 1–4 done, with SHAs, and Steps 5–8 left.
- **Known red:** `scripts/check-claude-md-size.sh` fails. The staged CLAUDE.md (`.claude/staged/CLAUDE.md.staged`) takes CLAUDE.md and its imports to 30130 chars, against a 30000 ceiling, and the script asks for a cut to 29000. Its output says to hand the trim to a subagent. It is a vet failure, so it belongs to `/finalize`, but it can be handed off any time.
- **Nothing running:** no CI, PR subscription, routine or check-in.
- **Estimate:** this session is 4 h middle developer ("moving a persona's home with its rule pointers, then a fifth Next site and its deploy wiring, is routine but wide"). Remainder handed on:
  - 2.5 h middle developer: "standing up a receiver repo, deploy key, a subdomain CNAME over Porkbun's API and a pre-merge publish, plus the die script and the routine, is routine wiring with live-infra steps";
  - 2 h senior prompter: "an entry file that makes the session speak as Майя and hands an unattended persona her freedom without steering it needs judgement".
- **Open question:** the operator's timezone for the routine, UTC 06:47 meanwhile.

## Pointers

- `docs/plans/maya-wander.paused.md` — the plan; Steps 5–8 are what is left.
- `.claude/skills/stand-up-site/SKILL.md` — Step 5. Her DNS is one `CNAME` on `maya` in the `vovazakharov.com` zone pointing at `vzakharov.github.io`, not apex records. Umami (its Step 5) is already done. The receiver is `vzakharov/maya.vovazakharov.com`, and its secret is `MAYA_PAGES_DEPLOY_KEY` (the gate derives the name).
- `personas/maya/maya.md`, `reflections.md`, `hello-maya.md`, `drafts/` — her home as it stands.
- `src/shared/config/site-config.ts` (the `maya` entry), `apps/maya/`, `src/pages/maya-home/`.
- Predecessor transcripts: this session, https://claude.ai/code/session_01FGzvX4PGUZKrpkcuTGxLcM; before it, https://claude.ai/code/session_01K5trw7n5rYxDcyNGXx2ngr.

## Next step

Resume the paused plan with `/go`, from Step 5, Stand it up. The go-ahead, quoted in ca675ed: «звучит хорошо, давай начинать».
