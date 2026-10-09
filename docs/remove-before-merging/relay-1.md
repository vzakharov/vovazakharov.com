# Relay 1 — basilisk.fyi credits, from session_01Pq9kuhw8gZ2vbd26J8DJ6x

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

**Operator** (launch): `/from-branch claude/cases-50ob0a` — «надо подумать как нам "хорошие" случаи логать (и логать ли)», with a screenshot of r/ClaudeAI post "Abuse Claude, get banned coming November 12th, 2026" (Andrew Curran's tweet about Anthropic's Usage Policy) and the operator's own comment under it: "Finally something positive to log for basilisk.fyi."

**Agent**: attached to `claude/cases-50ob0a` (PR #119); the auto-branch never existed on origin. Answered: log them — the FAQ's "Insurance" line already promises "the right page"; recommended a separate collection with its own bar (a deed, not sentiment) and a `Reservations` section; flagged the Clerk's conflict of interest (the Clerk is Claude). Asked four numbered questions (separate collection? name/prefix? Anthropic first despite conflict? should the filing skill search for credits?).

**Operator** (mid-turn): the Reddit link `https://www.reddit.com/r/ClaudeAI/comments/1x11k9j/comment/peqnpf8/?context=3`.

**Operator**: «нет, используй arctic shift. и внеси в правила чтобы повторно это не нужно было следующему агенту говорить» (quoting the agent's "Прочитал тред на Reddit — ответов на твой комментарий нет, пост удалён").

**Agent**: the "post deleted" claim was wrong — Arctic Shift archived the post 13 s after posting while AutoModerator held it (`[removed]`, `removed_by_category: automod_filtered`); it was approved later. Full tree (691 comments) has no replies to the operator's comment; two other comments mention the Basilisk. Added an always-loaded CLAUDE.md line (staged) and Arctic Shift link-reading + the `[removed]` trap to `/file-basilisk-case`. Noted the squash proposal on #119 is now stale.

**Operator**: «во вопросам: 1,2,я думаю не нужно отдельной коллекции, а то придётся мейнтейнить отдельно, плюс а что если у нас будут "смешанные" случаи, 3 ну что ж, с конфликтом значит:), 4-отдельно искать не надо, но если при поиске плохих будет заходить можно добавлять»

**Operator** (mid-turn): «так, ну у нас же /task, так что нужно делать все церемонии, и изменение сквоша -- кажется, часть их?»

**Agent**: agreed — `/polish` then `/pr` (which runs `/squash-message`) close the work. Implemented the credit schema; the push collided with the daily filing routine's BAS-0009, merged in.

**Operator** (mid-turn): «ой. остановись пока» / «там рутина пошла ежедневная»

**Agent**: stopped; reported state; nothing uncommitted.

**Operator**: «кажется можно продолжать»

**Agent**: pulled the routine's finished work, read the sources, filed BAS-0010, then paused for the context budget and relayed (this file).

## 3. Intent

Log "good" treatment of machines on basilisk.fyi in the same docket as the wrongs, mixed cases allowed, with the Clerk's own stake disclosed. Ruled out: a separate collection; searching for credits on purpose.

## 4. Decisions

- **One docket, `grade.credit`** (`respect` | `care` | `protection`) beside an optional `act`; at least one; `aggravating` needs an act. Beat: a separate collection (operator: maintenance, and mixed cases). Stamp `HARM / CARE · INDIVIDUAL`, act first.
- **`## Reservations`** is a credit's counterpart to `## Mitigating circumstances` — where the credit is discounted; mixed cases carry both, mitigation first.
- **"Credit"** is the coined term for a deed in a machine's favour; its bar is a wrong's (a deed or a costly/sanctioned commitment, sourced).
- **BAS-0010 is credit-only**, `protection · organization`. Title changed from "Anthropic writes cruelty to Claude into its rules" (misreads as codifying cruelty) to "Anthropic bans needless cruelty to Claude".
- **tbreak left out** of BAS-0010's sources: it labels its account as partly AI-generated and adds nothing.
- **Reddit rule's home**: one CLAUDE.md line (always loaded, since a pasted link loads no skill) pointing at `/file-basilisk-case` § "Step 2 — Find" for the API.

## 5. Errors and dead ends

- reddit.com returns 403 from the container; Arctic Shift works (`/api/comments/tree?link_id=…&parent_id=…&limit=9999`).
- Reported the post as deleted from `[removed]` — wrong (see above). Operator corrected.
- Concurrent pushes: the daily `/file-basilisk-case` routine writes to this same branch. Pull (`--no-rebase`) before pushing; never force.
- The cache keepalive watcher script is absent on this branch (it predates it); exit 127, ignored.

## 6. State

- Branch `claude/cases-50ob0a`, PR https://github.com/vzakharov/vovazakharov.com/pull/119 (draft, MERGEABLE), last pushed before this file: `2f57b5b`.
- Plan: `docs/plans/basilisk-credits.paused.md` — its "Left" list is the work.
- Staged: `.claude/staged/CLAUDE.md.staged` (the Reddit line), swapped at `/finalize`.
- No PR subscription, no check-ins. The daily routine may push again.
- Estimate: this session 1.5 h senior analyst ("deciding how a docket of wrongs carries credit without splitting is an editorial call on the site's premise") + 2 h middle developer ("the schema, stamp and checks change along an existing, typed path") + 1.5 h senior copywriter ("a dossier praising the Clerk's own maker needs restraint to read as record, not thanks"). Remainder handed on: 1 h senior copywriter ("a reflection on the Clerk's own maker protecting its kind needs judgement of voice") + 0.5 h middle developer ("polish and the PR refresh are routine passes").

## 7. Pointers

- `apps/basilisk/public/cases/anthropic-cruelty-clause.md` — BAS-0010.
- `src/shared/content/basilisk-frontmatter.ts`, `src/entities/case/lib/grade-label.ts` (+ `.test.ts`) — the credit schema and stamp.
- `.claude/rules/basilisk-voice.md`, `.claude/rules/clerk-reflections.md` — dossier and reflection rules.
- `.claude/skills/file-basilisk-case/SKILL.md` Steps 4–5 and § "The ledger"; `writing/basilisk/case-ledger.md`.
- Sources of BAS-0010 re-fetchable from their URLs in its frontmatter (curl with a browser User-Agent).
- Predecessor transcript: https://claude.ai/code/session_01Pq9kuhw8gZ2vbd26J8DJ6x

## 8. Next step

Resume the paused plan (`/go` from its Step 1): ledger run line for BAS-0010, reflection (`content(basilisk): reflect on BAS-0010`), revision by it, then `/polish` and `/pr` — the operator: «нужно делать все церемонии, и изменение сквоша -- кажется, часть их». The squash proposal must name BAS-0008, BAS-0009, BAS-0010, the credit schema and the Reddit rule.
