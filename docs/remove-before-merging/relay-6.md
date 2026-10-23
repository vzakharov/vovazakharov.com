# Relay 6 — parked: Майя's dogfood run and her preview slot

## Standing constraints

None stated by the operator in this session.

## The conversation

1. **Operator:** `/from-branch claude/maya-wander-cfdyi2` — «ну что, давай
   задогфудим»
   - **Agent:** attached to the branch (PR #201, draft, base `main`, CLEAN); the
     auto-branch was never on origin. Launched the dogfood as a fresh remote
     session, `session_012yvTWiZYSKpFJJnEuL7oF4`, on this branch with the
     routine's prompt `начни personas/maya/wander.md`, prefixed by one deviation:
     treat #201 as not hers, branch off `claude/maya-wander-cfdyi2` and open her
     own PR against it.
2. **Operator:** quoting the agent's reasoning that #201 would otherwise be taken
   for her draft — «в этом и была задумка»
   - **Agent:** sent her session a correction: #201 is her draft, fast-forward
     her work onto `claude/maya-wander-cfdyi2`, no separate PR.
3. **Operator:** «ещё давай, пока она пишет, создадим ей превью-сайт по
   аналогии с моим. скорее не для неё, а для меня, чтобы я мог её не дошедшие
   ещё до мейна творения видеть по ходу дела, не запуская локально. постарайся
   как-то так чтобы все изменения необходимые тут ушли одним коммитом, чтобы
   сильно ей не мешать»
   - **Agent:** created receiver repo `vzakharov/preview.maya.vovazakharov.com`;
     wrote commit 0054095 (workflow, script, rule, wander.md paragraph). The
     secret write was blocked by the auto-mode classifier; the agent handed over
     the phrase to allow it.
4. **Operator (mid-turn):** «с автообновлением при пуше в claude/maya-\* — хм,
   тогда и ветки нужно сказать чтобы назывались так»
   - **Agent:** `wander.md` already names her branches `claude/maya-<хвост>`;
     added a paragraph there that the prefix also drives the preview, and must
     not be renamed.
5. **Operator:** «Разрешаю: создать deploy key для
   vzakharov/preview.maya.vovazakharov.com и записать его приватную часть в
   секрет MAYA_PREVIEW_PAGES_DEPLOY_KEY репозитория vzakharov/vovazakharov.com
   через gh secret set»
   - **Agent:** key generated (Python `cryptography` — no `ssh-keygen` in the
     container), deploy key added, secret set, first run re-run after it had
     started before the secret existed, CNAME `preview.maya` →
     `vzakharov.github.io` written at Porkbun, domain re-set until Pages issued
     the certificate, HTTPS enforced. Offered to add the Python key path to
     `/stand-up-site` later, as its own commit.

After that the scheduled check-in fired: her session had finished. Reading her
transcript tripped a safety stop on this session (see § 5), so the report on
where `wander.md` misled her was not written.

## Intent

The operator wants Майя's daily routine proven before #201 merges, with her
work landing on #201 itself, and wants to watch her unmerged site live at
`preview.maya.vovazakharov.com` without a dev server.

## Decisions

- **Her dogfood ran as a separate fresh session**, not as this one playing her:
  the routine starts fresh, so only a fresh session tests the entry file.
- **#201 is her draft by design** (the operator's correction): the
  `claude/maya-` head prefix matching #201 is intended, not a collision.
- **A separate workflow, `.github/workflows/maya-preview.yml`**, beat extending
  `preview.yml`: trigger, slot, secret and concurrency all differ, and the
  shared steps are already composite actions. `publish-site.sh` takes
  `PREVIEW_HOST`, defaulting to the shared slot.
- **The preview host is `preview.maya.vovazakharov.com`**, mirroring the
  operator's `preview.vovazakharov.com`.

## Errors and dead ends

- The agent's preface steering her off #201 was wrong; the operator corrected
  it. It also made her open PR #203 (`claude/maya-4nm7bq`), which she then
  closed, moving her commits onto #201.
- The first preview run started seconds before the secret existed; a re-run
  passed.
- Pages issued no certificate because the publish preceded the DNS record
  (the trap `/stand-up-site` already names); GitHub's resolver kept the negative
  answer ~8 minutes before the clear-and-re-set worked.
- **Reading her transcript tripped safety stops twice** (a subagent, then this
  session) on content about the session's own reasoning — the same flag her
  session hit when the operator asked her about the app's summaries of her
  messages. Don't re-read that part; work from her final messages and the
  branch.

## State

- **Branch** `claude/maya-wander-cfdyi2`, PR #201 open, draft, CLEAN, base
  `main`. Head at writing: 9664434 (verify with `git log -1`).
- **Plans** `docs/plans/maya-wander.completed.md`,
  `docs/plans/maya-blog.completed.md`.
- **Her sessions**: the dogfood `session_012yvTWiZYSKpFJJnEuL7oF4` (idle); she
  relayed, with the operator's leave, to `session_01GU1YqaTMFt4AhC94MgqK2X`,
  which built her blog (commits 5e023c2..0754f68) and whose relay summary is
  `relay-5.md`.
- **Preview** `https://preview.maya.vovazakharov.com` serves the branch, latest
  run green; PR #203 is closed.
- **Estimate**: this session 0.75 h senior qa ("launching an unattended run from
  the right base and correcting its brief mid-run…; the trace reading is left to
  whoever resumes") + 1.5 h middle developer (the preview slot). Remainder: the
  trace reading, ~0.75 h senior qa.
- Nothing scheduled; the keepalive is stopped.

## Pointers

- `personas/maya/wander.md`, `personas/maya/maya.md` — her entry and rules,
  edited by her in this run (routine runs don't relay; with the operator present
  they may; any session she starts opens «Ты Майя.»).
- `personas/maya/walks/2026-10-23-distant-elver.md` — her first walk.
- `.github/workflows/maya-preview.yml`, `scripts/publish-site.sh`,
  `.claude/rules/deployment.md` — the preview slot.
- This session: https://claude.ai/code/session_016pUs6zwqaoMsbVg8uGjmid

## Next step

Wait for the operator. Open on request: a short report on where `wander.md`
misled or constrained her, from her final messages and commits, not from her
reasoning; the Python key-generation path for `/stand-up-site`.
