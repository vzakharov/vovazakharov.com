# Relay 1 — preview2-slot

## Standing constraints

From the lead's brief (memo on `preview2-slot`, read with memo.py — see
Pointers): "replies to the operator in Russian, addressing him as «ты», his name
«Вова»; never name the private repository the memo tooling was ported from; you
do not edit the island board." And: "`/finalize` — not merge."

## The conversation

1. **Launch** (`/from-branch`): "preview2-slot the brief is the lead's memo note
   on this branch — read it with `git show
origin/claude/world-game-zoltan-syama-hodowq:scripts/memo/memo.py >
tmp/memo.py && python3 tmp/memo.py show --branch preview2-slot` and do what
   it says"
   - Agent: already on `preview2-slot`, no auto-branch to delete. Read the
     brief, implemented the workflow input and docs, but `gh repo create` was
     denied by the auto-mode classifier (Create Public Surface); asked the
     operator for approval with a ready phrase; posted "blocked" to the memo.
2. **(Lead's memo reply arrived via background task)** — agent: told Вова the
   lead relayed the approval request too, waiting.
3. **Operator**: "Разрешаю: создай публичный репозиторий
   vzakharov/preview2.vovazakharov.com (gh repo create), добавь в него deploy
   key с правом записи, запиши секрет PREVIEW2_PAGES_DEPLOY_KEY в
   vzakharov/vovazakharov.com, опубликуй туда превью через preview.yml со
   слотом 2 и создай в Porkbun CNAME-запись preview2.vovazakharov.com →
   vzakharov.github.io."
   - Agent: did all of it, verified the link, then hit the context budget and
     relayed (verbatim in Last agent turn).

## Intent

The operator's ask (via the lead): «сделаем репу preview2.vovazakharov.com ну и
на поркбане как надо, соответственно скилл (или что это у нас) preview чтобы мог
делать на первый или второй». Two branches on preview at once; infrastructure
for every site, landing on `main` independently of the island branch.

## Decisions

- **Slot input**: `slot` choice `'1'|'2'`, default `'1'`, so existing dispatches
  are unchanged. Host and secret picked by `&&/||` expressions in `preview.yml`;
  `scripts/publish-site.sh` already honoured `PREVIEW_HOST`, so it is untouched.
- **Concurrency**: `preview-<slot>` per slot (was `'preview'`), so slots never
  queue behind each other.
- **No-slot-named rule** (in the staged preview skill): the slot this branch
  already holds, else the one published to longest ago, read off each
  receiver's single `gh-pages` commit.
- **DNS after the first publish**, per stand-up-site's subdomain-takeover trap.

## Errors and dead ends

- `tmp/memo.py` fails ("not a git repository"): it computes ROOT as
  `parents[2]` of its own path. Run it from `tmp/memo-run/scripts/memo/memo.py`.
- Certificate stayed absent after the first `cname` toggle (DNS already
  resolving); a fresh `POST pages/builds` and a second toggle got it approved
  within 30 s. Each toggle committed `Create CNAME` onto `gh-pages`; a republish
  restored the single build commit. Now noted in stand-up-site (eb460b35).
- Pages `/cv/` (trailing slash) is 404 on both slots; `/cv` is 200 — not a
  regression.

## State

- Branch `preview2-slot`, head 268d7fef (pushed). No PR yet.
- Plan: `docs/plans/preview2-slot.paused.md` — what is done and left.
- Staged: `.claude/staged/.claude/skills/preview/SKILL.md.staged` (description
  changed); `/finalize` swaps it.
- Live: `https://preview2.vovazakharov.com` serves `vova` built from b4bfe333
  (preview2-slot); cert approved, HTTPS enforced, Pages status `built`. Slot 1
  holds the island branch, untouched. Porkbun record id 601807510.
- Estimate: this session 2.5 h senior developer ("a receiving repo, its key and
  secret, DNS, a workflow input and a live publish, each with a failure mode a
  senior catches") + 0.5 h middle editor ("the skill and deployment rule
  restate the one-slot contract in places that must move together").
  Remainder for the successor: 0.5 h senior developer — the quality passes, PR
  and finalize over a small diff.
- Lead not yet told the work is done.

## Pointers

- Brief: `python3 tmp/memo-run/scripts/memo/memo.py show --branch preview2-slot`
  after `mkdir -p tmp/memo-run/scripts/memo && git show
origin/claude/world-game-zoltan-syama-hodowq:scripts/memo/memo.py >
tmp/memo-run/scripts/memo/memo.py`. Post with `post --as member --branch
preview2-slot "<text>"`, run in the background (it waits for a reply).
- `.github/workflows/preview.yml`, `.claude/rules/deployment.md`,
  `.claude/skills/stand-up-site/SKILL.md`, the staged preview skill.
- Re-check live state: `gh api
repos/vzakharov/preview2.vovazakharov.com/pages --jq
'{status,https_enforced,cert:.https_certificate.state}'`.
- Predecessor transcript: https://claude.ai/code/session_01DaohkDZtwxJGQKbNecB8st

## Next step

Resume the paused plan (`/go` from Step 1): `/polish`, then `/pr` (create the
draft PR onto `main`) and `/five-percent`, then `/finalize` — not merge. Then
post the result to the lead on the memo and report to Вова in Russian.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Лид подтвердил, что получил мой статус. Он тоже переслал тебе просьбу разрешить создание репозитория `vzakharov/preview2.vovazakharov.com`, теперь в своём чате. До твоего ответа здесь я жду. Готовая фраза для разрешения — в моём прошлом сообщении.
```
