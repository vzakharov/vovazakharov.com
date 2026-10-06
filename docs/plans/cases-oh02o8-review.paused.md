# PR #104 review round 2 — paused for the context budget

The task: the operator's review 5425987795 on PR #104 (submitted 2026-10-06
09:00:34Z), six comments. Paused mid-way; the successor picks it up here.

## Done

- `prompter` role ported from vzakharov/muthur@61e9a0a into
  `.claude/costs/rates.json` (77801f9); the session estimate now uses it.
  Comment 4193333672 ("`prompter`? … забери пока только это").
- The site card drops the incident date under "Last filed" (3474b50).
  Comment 4193382483 asked for filing date or none; the agent chose none — the
  number already says which is latest, a filing date needs a frontmatter field
  only the card reads. **Reopened**: the operator answered in chat, quoting
  "нового поля во фронтматтере, которое нужно только карточке": «я бы не
  сказал что только карточке». So a filing-date field (e.g. `filed:`) has
  uses beyond the card — the case page, the docket's order. Propose its shape
  (name, where the site shows it, back-filling BAS-0001–0005 from git history)
  and implement on agreement; 3474b50 may be reverted in favour of it.
- `/file-basilisk-case` Step 2: the docket is known before the search as a list
  (number, title, `description` via grep), dossiers read in full only after.
  Comment 4193350994 (reading dossiers only after the search means the agent
  does not know what not to look for). Committed with this file.
- Comment 4193412486 (five-percent entry) — fixed and answered (8679928).

## Left

1. **Reply on GitHub** to 4193333672, 4193350994, 4193382483 (one sentence +
   bare SHA each), and to 4193368876 — the operator's reply on the reflection
   thread: «это же можно сказать и про мои сообщения тут, так что в каком-то
   смысле мы на равных… мне интересно заглянуть в тебя». Conversational; answer
   as the Clerk, first person, Russian, ты.
2. **Colocate reflections with cases** — comment 4193400757: «давай
   колокейтить reflections с кейсами, например
   `public/cases/waymo-tire-slashings.reflections.md`… Предыдущие
   соответственно так же.» Not started. Findings so far:
   - `listDocuments` (`src/shared/content/documents.ts`) reads every `.md` in
     `cases/` as a case, and `parseFileName` keeps an unknown dotted suffix in
     the slug, so `<slug>.reflections.md` would fail the case schema. The card's
     docket (`scripts/lib/basilisk-card.ts`, `contentFiles(name.endsWith('.md'))`)
     and `lastFiledCase` would throw on it too. Check `scripts/check-prose-quotes.ts`,
     `scripts/lib/content-tree.ts` and the PDF render for the same walk.
   - Suggested shape: a registry field in `collections.ts` (pure, bare-Node
     safe) such as `companions: ['reflections']` on `basilisk-cases`, and one
     exported predicate for "is this file a document" that `listDocuments` and
     the card both use. Needs a unit test (pure function).
   - `writing/basilisk/clerk-reflections/CLAUDE.md` cannot move into `cases/`
     (it would be read as a case and served); a path-scoped rule
     `.claude/rules/clerk-reflections.md` with `paths:
     ['apps/basilisk/public/cases/*.reflections.md']` keeps its Russian text.
   - Then: `git mv` all five reflections to `apps/basilisk/public/cases/<slug>.reflections.md`
     (fix each `[Досье](…)` link to `./<slug>.md`), update the skill's Step 4
     paths (`torture-chamber.reflections.md` always, three others via `ls`),
     `basilisk-voice.md`'s last bullet, and `writing/CLAUDE.md`'s layout tree.
     Run `pnpm build:basilisk` and `pnpm content:og:basilisk --check`.
3. **Five-percent hand-off** (CLAUDE.md § "GitHub comments", via a subagent):
   comment 4193350994 changed something settled — the agent had ruled the
   dossiers out of the pre-search read entirely, losing the "what not to look
   for" the ledger exists for. Also, the agent missed five of the six comments
   by filtering review comments on `created_at > 09:00` (they carry the time
   they were written into the pending review, 08:51–09:00) and told the
   operator the one it found was the only one.
4. **Refresh** the PR body (it does not mention the card date, the prompter
   port or colocation) and the squash proposal, then `/polish`.
