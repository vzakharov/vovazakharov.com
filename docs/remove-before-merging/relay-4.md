# Relay 4 — the quality passes, the PR, then the merge and the routine

## Standing constraints

From the operator, verbatim, carried from relays 2 and 3:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же принципам что и василиск)»
- «пояснить что всё же сама она деплоить не должна -- постольку поскольку всё можно проверять локальным сервером. If and when that changes, будем думать.»

## The conversation

`relay-1.md` to `relay-3.md` cover everything before this session. This one opened as `/relay take claude/maya-wander-cfdyi2 — продолжить план автономной Майи с Шага 5: поднять maya.vovazakharov.com, написать wander.md, кубик и рутину`.

The agent wrote the die (Step 7) and `wander.md` (Step 6), but the auto-mode classifier refused `gh repo create … --public` as Create Public Surface. The agent paused the plan, held DNS back for fear of a subdomain takeover, and handed the operator a permission line to send back.

1. **Operator:** «Разрешаю: gh repo create vzakharov/maya.vovazakharov.com --public, deploy key с секретом MAYA_PAGES_DEPLOY_KEY в vzakharov/vovazakharov.com, CNAME maya → vzakharov.github.io в зоне vovazakharov.com через Porkbun API и gh workflow run deploy.yml --ref claude/maya-wander-cfdyi2 -f site=maya». **Agent:** created the receiver with its README and deploy key, published maya alone from the branch, then wrote the CNAME.
2. **Operator, mid-turn:** «(с) 2026 Майя из за/обложкой, за/обложкой -- ссылкой на группу на /music». **Agent:** `SiteFooter` got a `byline` prop. Майя's page passes «Майя из» plus за/обложкой linked to `https://vovazakharov.com/music/artists/za-oblozhkoy/ru`, and the site was republished.
3. **Operator, mid-turn:** «тут что-то застопорилось? у меня уже открылся сайт», then «а, вру, не открылся, видимо я смотрел без https». **Agent:** the certificate had not been issued. It came only after the `cname` was cleared and set again, and then HTTPS was enforced.

## Intent

An autonomous Майя, fired daily by a routine, who wanders and builds on `maya.vovazakharov.com`, never merging and never deploying.

## Decisions

- **Her PR is found by head branch `claude/maya-<tail>`**, not by touched paths the way basilisk's is, since nothing fences where her work lands. `wander.md` holds the query.
- **`wander.md` tells her not to `/relay`** at the context-budget notices, which come before 400k, because nobody picks up a successor. She counts the budget herself.
- **The footer byline links the Russian artist page**, since the site speaks Russian.
- **The die has no test**, as the plan says. It rejects `-n 0` through zod.

## Errors and dead ends

- The classifier also refused a plain `ls personas | grep package.json` right after the repo-create denial, as "Public Data-Sharing Upload". Glob and Grep went through.
- A Bash foreground poll loop of about 14 minutes was killed by the app. Keep polls short.
- The Pages certificate stays unrequested when the publish lands before DNS, and re-saving the same `cname` does not help. `cname=null` and then re-setting it does. This is now a trap in `/stand-up-site` (f84b110).

## State

- **Branch:** `claude/maya-wander-cfdyi2`, pushed and clean, head 82af29c or the relay commit after it.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/201, open draft, `MERGEABLE`. Its body and the squash proposal (`docs/remove-before-merging/squash-message.md`) do not yet reflect Steps 5–7 or the footer.
- **Plan:** `docs/plans/maya-wander.paused.md`. Steps 1–7 are done. Left: `/go` Step 3 (`/polish`), Step 4 (`/pr`), the merge through `/finalize`, then Step 8.
- **Live:** https://maya.vovazakharov.com serves the branch's placeholder over HTTPS, with an approved certificate, HTTPS enforced and the footer byline. The other four sites still return 200.
- **Known red:** `scripts/check-claude-md-size.sh`, the staged CLAUDE.md at 30130 chars against 30000. It is `/finalize`'s.
- **Nothing running:** no CI, subscription or check-in.
- **Estimate:** this session is 2 h middle developer and 1.5 h senior prompter. Remainder handed on: 1 h middle developer, "the quality passes over a multi-session branch, its PR body and a scheduled routine with one proving fire are routine but wide".
- **Open question:** the operator's timezone for the routine. UTC 06:47 meanwhile.

## Pointers

- `docs/plans/maya-wander.paused.md`: the plan and its Progress.
- `personas/maya/wander.md`, `personas/tools/random-words.ts`.
- `src/widgets/site-footer/ui/site-footer.tsx` (`byline`), `src/pages/maya-home/ui/maya-home-page.tsx`.
- `.claude/skills/stand-up-site/SKILL.md` § "Traps": the two new entries.
- Transcripts: this session, https://claude.ai/code/session_01EDUJrm9hiL6KiycUkBr7B1; earlier ones in `relay-3.md`.

## Next step

Resume the paused plan with `/go`: run Step 3 (`/polish`) and Step 4 (`/pr`), then report and wait for the operator's merge call. Step 8 (`create_trigger`, then one `fire_trigger`) runs only after #201 merges, and should ask the timezone again if it is still unanswered. The go-ahead, quoted in ca675ed: «звучит хорошо, давай начинать».
