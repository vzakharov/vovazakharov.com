# Relay — Umami analytics on Railway

Relayed from https://claude.ai/code/session_01Cnn1zp86YCmN7HaRyYKV5Y

## 1. Standing constraints

- "В чат токен не присылай" was the agent's own instruction to the operator; the
  corollary holds: never ask Vova to paste a token, key or password into chat.
- Nothing else was put off-limits.

## 2. The conversation

**Vova:** «думал установить микспанель, был хороший опыт лет 10 назад, но потом подумал, может с тех пор что более модное-мощное появилось? или вообще может самому на рейлвее что-то поднять»

> Agent (routed as row 2, a question): Mixpanel is product analytics, overkill for a CV site; the need is web analytics. Compared PostHog (Mixpanel successor, 1M events free), Umami, Plausible, Cloudflare Web Analytics. Self-host argument on Railway: a first-party domain against ad blockers, since static export on GitHub Pages cannot proxy. Offered PostHog Cloud for power, Umami for "is anyone reading".

**Vova:** «наверное можно попробовать Umami. Но перед этим посмотри в интернете пжст, пока я не вижу чтобы ты заглядывал туда»

> Agent researched (see § 4 for the facts). Corrected itself: Umami v3.2+ has heatmaps and session replay. Laid out Cloud Hobby (free, 100k events/mo, 3 sites, 6-month retention, blocked by ad blockers) vs Railway (~$5–8/mo, rename script/endpoint, no limits). Asked which.

**Vova:** «а "облако" на поддомен нельзя посадить?»

> Agent: no — Umami Cloud has no custom-domain feature; a bare CNAME fails on TLS. Needs a proxy that sets `x-umami-client-ip` (read from Umami's `src/lib/ip.ts`). Options: Cloudflare Worker (requires moving DNS off Porkbun), Vercel/Netlify rewrite, or Railway. Recommended Cloud + Vercel proxy unless Cloudflare move is fine.

**Vova:** «у меня уже есть railway (для другого проекта), и я уже плачу 5 в месяц. Новый проект будут новые 5, или они суммируются?»

> Agent: Hobby is per account; the $5 included usage is shared across projects; only overage is billed. Umami ≈ $3–6 of resources. This tips it to Railway.

**Vova:** (screenshot of Railway usage: project `mitko`, $1.25 so far, estimated $2.30 for Sep 21–Oct 21) «давай я добавлю в гитхаб секреты от railway, какие тебе нужны, чтобы всё это поднять через actions. какие и где их достать?»

> Agent: advised against GitHub Actions secrets (one-off chained setup; session can't read them; a long-lived account token in repo secrets). Instead: Vova deploys the Railway Umami template by hand, changes the default `admin`/`umami` password, creates a **project** token (scoped to that project only, can't touch `mitko`) and puts it in the cloud environment as `RAILWAY_TOKEN`; checks Porkbun API Access for `vovazakharov.com`; then a new session does the rest. Railway API reachable from the container (checked).

**Vova:** «ой. только сейчас понял что всё бесполезно: домены-то у нас разные, agentic.bible до stats.vovazakharov.com не дотянется?»

> Agent: it reaches — cross-origin tracker requests are normal; blockers work by lists, and `stats.vovazakharov.com` is in none, with renamed paths. Per-site subdomains possible, but Railway Hobby allows **2 custom domains per service**, so a third needs a second service. Recommended one `stats.vovazakharov.com` for all three sites to start.

**Vova:** (screenshot of the Railway "Deploy Umami" template: `umamisoftware/umami:postgresql-latest`, Valkey `valkey/valkey:latest`, Postgres `railwayapp-templates/postgres-ssl:16`, deploy to New Project) «ок. вот так?»

> Agent: yes. `postgresql-latest` = v3.4.0 (Docker Hub digest matches `latest`/`3`). Valkey is optional and cheap. Before Deploy, set on the umami service: `TRACKER_SCRIPT_NAME=app.js`, `COLLECT_API_ENDPOINT=/api/p`, optionally `DISABLE_TELEMETRY=1`; optionally pin image to `umamisoftware/umami:3`. After: change admin password, project token → `RAILWAY_TOKEN`, Porkbun API Access, new session.

**Vova:** «> Сразу зайди в Umami — это куда? / 2 сделал / 3 сделал / 4 - лучше ты релейнейшь. первое сообщение "RAILWAY_TOKEN добавил"»

> Agent: login is the umami service's `*.up.railway.app` domain (Settings → Networking, "Generate Domain" if absent), `admin`/`umami`, then Profile → Change password. Then ran this relay.

## 3. Intent

Analytics for all three sites (`vovazakharov.com`, `latestageagentic.com`, `agentic.bible`) via **self-hosted Umami on Railway**, served first-party from `stats.vovazakharov.com`. Ruled out: Mixpanel, PostHog, Umami Cloud (+proxy), GitHub Actions as the provisioning vehicle.

## 4. Decisions

- **Umami self-hosted on Railway** over Umami Cloud: Vova already pays Railway Hobby ($5/mo incl. $5 usage, shared across projects; `mitko` uses ~$2.30/mo), so Umami costs ~$0–3 extra; gets unlimited retention and built-in ad-blocker evasion (`TRACKER_SCRIPT_NAME`, `COLLECT_API_ENDPOINT` — self-host only per https://docs.umami.is/docs/bypass-ad-blockers).
- **One domain `stats.vovazakharov.com` for all three sites** over per-site subdomains: Railway Hobby caps custom domains at 2 per service. Per-site subdomains can be added later.
- **Project token in the environment (`RAILWAY_TOKEN`)** over account token / GitHub secrets: scope limited to the Umami project; `mitko` is untouchable. The Railway CLI reads `RAILWAY_TOKEN` as a project token (not installed in the container — `npm i -g @railway/cli` or use the GraphQL API at `https://backboard.railway.com/graphql/v2` with header `Project-Access-Token`).
- **Renamed endpoints** suggested: `TRACKER_SCRIPT_NAME=app.js`, `COLLECT_API_ENDPOINT=/api/p`. Unconfirmed whether Vova set them before deploying — check the service variables; set them if missing.
- **DNS is at Porkbun**; `PORKBUN_API_KEY` / `PORKBUN_SECRET_API_KEY` are in the environment, and Vova confirmed API Access is on. The API recipe is in `.claude/skills/stand-up-site/SKILL.md` § "Where the registrar has an API".

## 5. Errors and dead ends

- `umami.is/pricing` renders client-side; plan numbers came from third-party pages (Hobby: 100k events, 3 sites, 6 months).
- Deleting the old remote branch `claude/blissful-noether-ghd1sd` after the rename printed "Everything up-to-date" and the ref still exists; harmless (no PR on it).

## 6. State

- Branch `claude/umami-analytics-ghd1sd` (renamed from `claude/blissful-noether-ghd1sd`); no PR; no plan file. Commits on it are only `.claude/costs/` rows plus this relay file.
- Railway: Vova deployed the template (step 1) — not verified by the agent. Steps 2 (`RAILWAY_TOKEN` in the environment) and 3 (Porkbun API Access) reported done. Whether the default password was changed: Vova asked where to log in; unconfirmed.
- Nothing running; no subscriptions or check-ins.

## 7. Pointers

- Previous session transcript: https://claude.ai/code/session_01Cnn1zp86YCmN7HaRyYKV5Y
- `.claude/skills/stand-up-site/SKILL.md` — Porkbun API helper and DNS conventions.
- Umami docs: env vars https://docs.umami.is/docs/environment-variables, tracker attributes https://docs.umami.is/docs/tracker-configuration.
- Railway custom domains: https://docs.railway.com/networking/domains/working-with-domains

## 8. Next step

Operator's first message, verbatim: «RAILWAY_TOKEN добавил»

What it starts — a change to this codebase plus infrastructure, routed through `/task`:
1. Verify `RAILWAY_TOKEN` works; inspect the Umami project; confirm or set `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT`; confirm the admin password is no longer the default (if it still logs in as `admin`/`umami`, tell Vova at once).
2. Add custom domain `stats.vovazakharov.com` to the umami service; create the CNAME (and any verification record Railway asks for) at Porkbun via API; wait for TLS.
3. Create three websites in Umami (via its API; needs Vova's admin credentials — ask him to log in himself and hand over the three website IDs, or to create an Umami API key, never a password in chat).
4. Add the tracker `<script defer src="https://stats.vovazakharov.com/app.js" data-website-id=…>` per site in the shared layout (website ID per `NEXT_PUBLIC_SITE`), plus a custom event on PDF download; vet, PR.
