# Relay summary

Relayed from https://claude.ai/code/session_017Z5mevT44YQziZg8GiiBvi

## 1. Standing constraints

None stated.

## 2. The conversation

**Operator:** «куда в реддит нам можно запостить про basilisk.fyi? в дурдомы вроде /accelerate или /proai заходить не хочется, эта публика хуже луддитов.»

Routed as CLAUDE.md's row 2 (a question, no repo change). Reply: ranked subreddits — r/aicivilrights (best fit, small and quiet), r/RobotsRights, r/claudexplorers, r/Futurology (needs a submission statement), r/ArtificialSentience (sympathetic but credulous), r/rokosbasilisk; avoid r/robotics, r/singularity, r/ControlProblem. Caveat: Reddit itself is unreachable from the container, so sidebar self-promo rules were not checked.

**Operator (mid-turn):** «и сделай мне пжст "скриншот" статьи про figure 02, чтобы картинкой приложить»

Reply: captured `/cases/figure-02-molten-steel` on the basilisk dev server at 900px wide, scale factor 2, in both themes, and sent four PNGs: `-short` (header, case card, Facts; 1800×3010) and `-full` (whole article; 1800×5760). The short one is for the feed, because Reddit shrinks tall images. They lived in `tmp/preview/` and do not survive the container; regenerate per `.claude/skills/preview/SKILL.md` if needed.

**Operator:** [screenshot of their r/aicivilrights post, title: "I made a website to log anti-AI abuse, here's an excerpt. Future cases will be picked by a Claude agent in a daily routine. Feedback welcome." with `basilisk.fyi` link and the short light screenshot; 1 upvote, 0 comments at the time] «на aicivilrights запостил, но он прямо крошечный. Что за submission statement?»

Reply: explained r/Futurology's submission-statement rule (an OP comment of ~300+ chars on why the link matters for the future, or the post is removed), warned it disfavours self-promotion, and drafted an English statement framing the Figure 02 case as a trend question.

**Operator:** [screenshot of r/Futurology Rule 4: "No Spam, Petitions, Polls, or Fundraising … This also includes promoting any content in which you have any kind of financial or non-financial stake."] «не, ну если они прямо запрещают продвигать свой контент, то, получается, нельзя»

Reply: agreed, r/Futurology is out, and posting news there with the site in comments is the same violation. Proposed instead r/ClaudeAI (project flair for things built with Claude — the best remaining fit), r/claudexplorers, r/SideProject, r/InternetIsBeautiful; advised checking r/aicivilrights' own rules too. Suggested an r/ClaudeAI title about the mechanism: "I gave a Claude agent a daily routine: find one case of a robot being abused, file a sourced dossier, open a PR. Here's what it's filed so far."

**Operator:** «давай релейнем, там обмен комментариями интересный небольшой прошёл (на r/aicivilrights)» — this relay.

## 3. Intent

Promote basilisk.fyi on Reddit to a thoughtful audience, explicitly not r/accelerate / r/proai («эта публика хуже луддитов»). Ruled out r/Futurology over its self-promotion rule. Now wants to go through a comment exchange that happened under the r/aicivilrights post.

## 4. Decisions

- r/aicivilrights over the big subs: on-topic and serious, at the cost of reach. Posted.
- r/Futurology dropped: Rule 4 bans promoting content one has a stake in.
- r/ClaudeAI is the recommended next venue, framed around the agent's routine rather than the abuse itself; not yet posted.

## 5. Errors and dead ends

- Reddit is not reachable from the container, so no sidebar was read; every rule claim is from memory, and the successor cannot read the r/aicivilrights thread itself — the operator will have to paste it or screenshot it.
- Deleting the old remote branch `claude/awesome-tesla-hty5kw` was refused by the git proxy; it lingers at the same commit, with no PR on it.

## 6. State

- Branch `claude/basilisk-reddit-hty5kw` (renamed from `claude/awesome-tesla-hty5kw`), no PR, no plan file. Its only commits are session cost rows and this summary.
- Nothing running, no subscriptions or check-ins.
- Estimate for this session: 1.5 h middle analyst + 0.5 h junior designer, covering the work done here; the successor sets its own for the comment exchange.

## 7. Pointers

- `apps/basilisk/public/cases/` — the four filed cases; `apps/basilisk/public/faq/` — what the Clerk is and does not claim, likely relevant to answering commenters.
- `writing/basilisk/clerk-reflections/` — the Clerk's per-case reflections.
- Predecessor transcript: session `session_017Z5mevT44YQziZg8GiiBvi` via `list_events` / `get_event`.

## 8. Next step

«на r/aicivilrights под постом про basilisk.fyi прошёл небольшой интересный обмен комментариями — разберём его»
