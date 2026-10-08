# Relay 1 — Umami asks for a fresh login every day

## 1. Standing constraints

- «новую сессию создавать *не* надо» — this relay starts no successor; the operator will start one themselves if they come back.
- «потом не продлевай» — no further cache-keepalive extensions for the session this relay came from.

## 2. The conversation

**Operator:** «umami каждый день просит меня перелогиниться, это как-то можно изменить?»

**Agent:** Routed as row 2 (a question, no repo change). Read Umami 3.4.0's source and logged in to `stats.vovazakharov.com` as `agent`. Finding: Umami's session token never expires on its own — `createSecureToken` is called with no `expiresIn`, no Redis TTL, and the client keeps it in `localStorage` under `umami.auth` indefinitely. The server rejects it only if the password changed or the secret did (`secret() = hash(APP_SECRET || DATABASE_URL)`). Two suspects: (1) `APP_SECRET` unset/regenerated on Railway redeploys; (2) the browser wiping `localStorage`. Proposed the decisive check: after the next forced login, DevTools → Application → Local Storage → `stats.vovazakharov.com` — `umami.auth` present means the server rejected it, absent means the browser cleared it.

**Operator:** «APP_SECRET есть, на нём надпись "This variable is generated using a template variable function" (https://docs.railway.com/templates/create#template-variable-functions)»

**Agent:** Railway's docs say template variable functions run once, when the template is deployed, and the result is stored — so `APP_SECRET` is stable and suspect 1 is cleared. Main suspect is now the browser: "clear site data on close" (Chrome/Firefox/Brave), a cleaner extension, or a private window/profile. Proposed a check that needs no waiting: confirm `umami.auth` is in Local Storage, fully restart the browser, see whether it survived. Asked which browser the operator uses, to name the exact setting. If the key survives a restart and the logout still happens, the server side is back in play.

**Operator:** «зафиксируй в релее, если что потом вернусь, потом не продлевай» — then, mid-turn: «(новую сессию создавать *не* надо)»

**Agent:** This relay, without a successor.

## 3. Intent

Stop having to log in to the self-hosted Umami every day. No repo change asked for; the fix is expected in browser settings or Railway config, both outside this repo.

## 4. Decisions

- **Server-side expiry ruled out from source**, not from docs or memory: Umami 3.4.0 `src/lib/jwt.ts`, `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/lib/client.ts`, `src/lib/storage.ts`, `src/lib/crypto.ts`.
- **Railway `APP_SECRET` ruled out** on the operator's report that it comes from a template variable function, plus Railway's docs that these run once at template deploy.

## 5. Errors and dead ends

- The relay's delete of the old remote ref `claude/confident-gauss-zfw5n7` was refused with a 403 by the session's git proxy. It has no PR and its head `3000d90` is carried by the renamed branch, so it can be deleted by hand whenever.

## 6. State

- Branch `claude/umami-relogin-zfw5n7` (renamed from `claude/confident-gauss-zfw5n7`). It holds only session cost rows and this file. No PR, no plan, no CI, no subscriptions, no scheduled check-ins.
- The operator's answer is pending: which browser they use, or what the restart check showed.

## 7. Pointers

- Predecessor transcript: https://claude.ai/code/session_017okF3atQaPfhf1Uz9pCsyn
- Umami's auth code: `git clone --depth 1 https://github.com/umami-software/umami.git`, then the files in § 4.
- How the repo uses Umami: `src/shared/config/site-config.ts` (`ANALYTICS_SCRIPT_URL`, `analyticsId`) and `.claude/skills/stand-up-site/SKILL.md` § "Step 5 — Register it in Umami" (the `agent` login recipe, `UMAMI_AGENT_PASSWORD`).

## 8. Next step

Wait for the operator. When they return, they will likely report their browser or the result of the restart check. Name the exact setting or extension that clears `localStorage` for `stats.vovazakharov.com` and how to exempt the site. If `umami.auth` survived a restart and they still got logged out, go back to the server side: Railway deploy history around the logout times, whether the service's `DATABASE_URL`/`APP_SECRET` values actually change, and whether the deployed Umami version differs from 3.4.0.
