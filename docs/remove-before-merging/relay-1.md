# Relay 1 — email subscriptions for the four sites (parked)

A question-only session (CLAUDE.md entry ladder rung 2): no code changed, no
plan, no PR. Parked by the keepalive's last wake on an idle session.

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

**Operator:** «как бы нам на всех наших штуках сделать подписку через email (на
каждой -- свою, конечно)?»

**Agent:** Routed as rung 2 (answer, no change). Static export means the list
and the sending must live in an outside service; three of four sites already
publish RSS (`agentic.bible/feed.xml`, `basilisk.fyi/cases/feed.xml`, vova's
songs feeds `en`/`ru`; case studies have `feed: false`; latestageagentic.com
has no collection and no feed), so RSS-to-email + a plain-HTML `<form
method="post">` per site needs no backend. Recommended Buttondown (Markdown,
HTML form, double opt-in, several newsletters per account). Kit: free to 10k
but RSS paid; self-hosted Listmonk + SES: cheapest but a server to keep alive.
Asked: (1) Buttondown OK or a preferred provider / budget? (2) vova: songs —
two lists `en`/`ru` or one with a language choice, or something not yet fed?
(3) latestageagentic.com: skip or a waitlist? Also flagged the stale muthur
sync lock (see § 7).

**Operator:** «> Свой Listmonk + Amazon SES — а почему не тот же railway где у
нас уже лежит аналитика?»

**Agent:** Conceded the "a server to keep alive" argument: Umami already runs on
Railway (`stats.vovazakharov.com`, `ANALYTICS_SCRIPT_URL` in
`src/shared/config/site-config.ts`), Listmonk could share its Postgres. Three
snags: Railway Hobby blocks outbound SMTP (Pro only) and Listmonk sends over
SMTP; Listmonk has no RSS-to-email, so a `deploy.yml` step would diff the feed
against sent campaigns via its API (must be idempotent, tested); deliverability
plumbing (SES sandbox exit, SPF/DKIM/DMARC ×4, bounces via SES→SNS→webhook).
Asked which Railway plan we are on.

**Operator:** «а если в buttonmonk rss-to-email платно, то как ему подавать
другое забесплатно?» ("buttonmonk" = Buttondown, playful.)

**Agent:** Via Buttondown's API: the same deploy step posts each new feed item
with `POST /v1/emails`, body from `feedEntries()`'s HTML. Pricing page: free to
100 subscribers; add-ons RSS-to-email +$9, multiple newsletters +$29,
automations +$29; custom sending domain in base. API not on the add-on list, so
probably in base, but unconfirmed — settle with one call on a free account. The
deploy step is provider-agnostic. The real cost of "each its own" is the +$29
multiple-newsletters add-on (or four free accounts, ToS unknown).

**Operator:** «а если типа cloudflare workers? что-то меня одно название Amazon
пугает»

**Agent:** Workers + D1 (subscriber list, per site) + Cloudflare Email Sending
removes both Railway and Amazon. Email Sending: beta since April 2026, arbitrary
recipients only on Workers Paid ($5/mo, 3,000 emails included, then $0.35 per
1,000), positioned for transactional but newsletters allowed with unsubscribe,
low starting daily quota. Catches: domains' DNS must move to Cloudflare (limits
are per zone; DNS today at Porkbun, which `/stand-up-site` drives via API — the
skill would need rework); we write a mini-Listmonk (subscribe, confirm,
one-click `List-Unsubscribe`, suppression, deploy send step; unsubscribe tokens
count as auth code → tests). Middle option Workers + Resend keeps Porkbun DNS
but Resend free caps at 100/day. Recommendation: all-own and no Amazon →
Workers + D1 + Email Sending ($5/mo total); works-tomorrow → Buttondown;
Railway + Listmonk loses to both. Replaced the Railway-plan question with:
**move all four domains' DNS to Cloudflare?**

**Operator:** «и ещё, если селф-хостить, то все проблемы с доставляемостью,
спамом и т.п. -- наша личная головная боль?»

**Agent:** No, partly. Three layers: IP reputation / ISP relations — the
sending provider's (ours only with an own MTA, which nobody does); domain
reputation — ours in every option, Buttondown included; list hygiene (instant
unsubscribe, suppressing bounces/complaints so the shared account isn't
suspended and all four sites go silent, form-bot list bombing via double opt-in

- Turnstile) — ours when self-hosting. At our scale the main risk is our own
  bug (double send, broken unsubscribe), handled by tests and idempotency.
  Buttondown removes layer 3; layer 2 stays regardless.

## 3. Intent

Email subscription on each of the four sites, a separate list per site. The
operator leans away from Amazon ("одно название Amazon пугает") and asked about
free paths and self-hosting; no option chosen yet.

## 4. Decisions

None made. Standing comparison:

- **Buttondown** — least work; ~free to 100 subscribers, RSS +$9 or our own API
  step, multiple newsletters +$29.
- **Workers + D1 + Cloudflare Email Sending** — agent's pick if "all ours, no
  Amazon"; $5/mo total; costs a DNS move off Porkbun and a small tested
  project.
- **Railway + Listmonk** — dominated: SMTP needs Railway Pro, plus the same code
  and deliverability work.
- Either self-hosted route shares the **deploy send step**: after publish, diff
  each feed against what was sent and send the new items, idempotently.

## 5. Errors and dead ends

- Listmonk's opt-in template per list: searched, unsettled, left out of the
  answer.
- Deleting the old remote ref `claude/compassionate-einstein-wq13l9` got a 403
  from the git proxy; it lingers on origin at a49fea5 (no PR on it).

## 6. State

- Branch `claude/email-subscriptions-wq13l9` (renamed from
  `claude/compassionate-einstein-wq13l9`), pushed; no PR; no plan file.
- Only commits on it: session cost rows and this summary.
- Estimate: 2 h senior analyst — the whole task was answering the question,
  done here; no remainder handed on.
- No CI, subscription or check-in pending.

## 7. Pointers

- Feeds: `src/shared/content/feeds.ts`, `src/shared/content/collections.ts`
  (`feed:` per collection), routes under `apps/*/app/**/feed.xml`.
- Per-site config: `src/shared/config/site-config.ts` (where a newsletter id
  would go, beside `analyticsId`); footer widget `src/widgets/site-footer`.
- Deploy: `.github/workflows/deploy.yml`; DNS at Porkbun:
  `.claude/skills/stand-up-site/SKILL.md`, `.claude/rules/deployment.md`.
- Pricing sources: https://buttondown.com/pricing,
  https://developers.cloudflare.com/email-service/platform/pricing/,
  https://developers.cloudflare.com/email-service/platform/limits/,
  https://docs.railway.com/networking/outbound-networking.
- Stale muthur sync lock, raised once, operator has not answered: claimed 111h
  ago by https://claude.ai/code/session_01P69aiPC5C6nMymUeQvxjZh as
  `muthur-sync-lock-439f78ff9dc6`; takeover only if the operator says it is
  dead (`scripts/muthur-sync.sh claim --takeover`, then `/update-muthur
claimed`).
- Predecessor transcript:
  https://claude.ai/code/session_01T67NNLxjh84BtNApqBegY1

## 8. Next step

Wait for the operator. Open questions to them: provider choice (Buttondown vs
Workers + Email Sending), whether to move the four domains' DNS to Cloudflare,
what vova's list subscribes to (songs `en`/`ru` as one or two lists), and
latestageagentic.com (skip or waitlist). A request to build it is a routing
point → `/task`.
