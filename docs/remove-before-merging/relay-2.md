# Relay 2 — /music/songs, /music/all retired, former song addresses caught by the 404

## 1. Standing constraints

- «backward comp не нужен» (relay 1) — no pages at the old song addresses in the export. Refined in this session: «я точно не хочу оставлять полноценные страницы в статическом экспорте» — a client-side catch on the 404 page is wanted, export pages are not.
- «env-флаг можно оставить» — `SHOW_HIDDEN` stays.

## 2. The conversation

Earlier history: `docs/remove-before-merging/relay-1.md`.

0. **Session opened** with `/relay take claude/music-songs-route-ub8ny7`. Agent ran vet (green), swept prose for `/music/all` leftovers (none), `/polish` (empty mark `7c83b5d`), refreshed PR #146 body/title and squash proposal (`f96cfe6`).
1. **Operator:** «вопрос, насколько трудоёмко сделать что-то вроде "редиректа у клиента"… кто-то открывает старую ссылку на music/<song_name>… открывается 404… клиент… сверяет, нет ли такой песни в каталоге… если есть, редиректит… пока он выясняет, на 404 пишется "проверяем, использовали ли вы изменённую ссылку"… rationale: где-то я может что-то уже шарил, но я точно не хочу оставлять полноценные страницы в статическом экспорте»
   **Agent:** ~1 h: a custom `not-found.tsx`, client component probing `HEAD /music/songs/<slug>.md`, `location.replace`. Caveats: crawlers and link-preview bots see the 404. Offered to do it on this branch.
2. **Operator (mid-turn):** «исполнять пока не надо, только проконсультировать» — **Agent:** confirmed nothing was changed.
3. **Operator:** «да, давай в этой»
   **Agent:** Implemented `5ca65ba` (+ polish `a`-commit dropping a docstring), verified in headless Chromium against a Pages-like server, vet green except a keepalive test race (passes 3/3 alone), refreshed PR body and squash proposal (`146f037`). Asked for approval of the silent fallback (a failed probe shows the ordinary 404) per CLAUDE.md's "never silently swallow errors" rule — **unanswered**.
4. **Operator:** pasted `pnpm dev:vova` output: `/music/birds` → 500, "Page … is missing param … in generateStaticParams(), which is required with output: export".
   **Agent:** A `next dev` quirk under `output: 'export'`, pre-existing for every catch-all (`/case-studies/nope` is 500 in dev too); `dynamicParams = false` tried and reverted (no effect). Prod/static serving works. Offered (1) leave it (recommended) or (2) make `output: 'export'` production-only + `dynamicParams = false`.
5. **Operator (mid-turn):** «ну если только дев то шут с ним, но скажи как локально сбилдить и посмотреть тогда» then «а, уже»
   **Agent:** `pnpm build:vova && npx serve apps/vova/out` — verified here: `/music/breathe` → Breathe, `/music/breathe/ru` → Повелитель ветра, `/music/nope` → Nothing here.
6. **Operator:** pasted a local `pnpm build:vova` failing typecheck: `player-provider.tsx:61` — `addressLocale(usePathname())`, `string | null` not assignable to `string`; «вот это частенько у меня, это что-то что-то про typegen и тп если я помню правильно»
   **Agent:** Diagnosis (unconfirmed on his Mac): Next writes `/// <reference types="next/navigation-types/compat/navigation" />` into `next-env.d.ts` when it sees both an app and a pages dir (`node_modules/next/dist/lib/typescript/writeAppTypeDeclarations.js:49`), which types `usePathname()` as `string | null`. `next-env.d.ts` is gitignored; a stray one at the **repo root** (written by `next` run from the root, where FSD's `src/pages/` reads as a Pages Router) is swept into every app by `apps/*/tsconfig.json`'s `"../../*.d.ts"` include (which exists for `css.d.ts`). Here there is no root `next-env.d.ts`. Gave him: `ls next-env.d.ts apps/vova/next-env.d.ts && grep -l compat next-env.d.ts apps/*/next-env.d.ts`, then `rm` the one found. Offered to narrow `"../../*.d.ts"` to `"../../css.d.ts"` in all four apps' tsconfigs — **unanswered**.

Then five cache-keepalive wakes with no operator message; this relay is the last one.

## 3. Intent

Songs at `/music/songs/<slug>`, `/music/all` gone, and people following old `/music/<slug>` links still reach the song — without any page at the old address in the static export. Ruled out: export-side redirect pages; changing dev config for the dev-only 500 («шут с ним»).

## 4. Decisions

- **Probe the song's `.md` with `HEAD`** rather than shipping a slug list in the 404 bundle: zero maintenance, the file exists for every song.
- **New page slice `src/pages/not-found/`** (`NotFoundPage` server, `MovedSong` client in `ui/moved-song.tsx`); the server passes `MUSIC_ROUTE` and `collectionRoute('music')` as props, since a page slice cannot import `pages/music` sideways and the client cannot import `shared/content`'s server-only barrel (type-only `Slugged` import is fine).
- **Copy in both locales**, chosen client-side by the address's last segment (`addressLocale`); keys `notFound.{title,body,checking,home}` in `src/shared/i18n/messages/{en,ru}.json`.
- **`isServed(href, signal)` helper** exists because `@eslint-react/web-api-no-leaked-fetch` demands `signal: controller.signal` inside the effect while the house rule `vova/no-redundant-property-copy` forbids exactly that; passing the signal as an argument satisfies both.
- **Pathname read via `useSyncExternalStore`**, not `usePathname()` (a 404 served at an arbitrary URL; and avoids set-state-in-effect).

## 5. Errors and dead ends

- `dynamicParams = false` on `apps/vova/app/music/[[...slugAndLocale]]/page.tsx` does not stop the dev 500 under `output: 'export'`; reverted, not committed.
- Playwright is not installed in the repo; headless checks used `/opt/pw-browsers/chromium --headless --dump-dom --virtual-time-budget=…`.
- Vet's `keepalive` suite failed once in parallel run (`test_a_running_watcher_is_left_to_the_agent_to_stop` reads `sess.json` mid-write → JSONDecodeError); passes alone. Not this branch's.

## 6. State

- Branch `claude/music-songs-route-ub8ny7`, head before this file `1b6eccc` (cost row); last code commits `5ca65ba` (404 redirect), its polish, `146f037` (squash proposal).
- PR https://github.com/vzakharov/vovazakharov.com/pull/146 — open, draft, MERGEABLE. Body and squash comment (id 6142699722) cover all three changes.
- No plan file (planless). No CI on PRs. No subscriptions or check-ins.
- Estimate: this session 0.5 h middle developer (decommission finish) + 1.5 h middle developer (404 fallback). Remainder handed on: none sized — what is left is two operator decisions and `/finalize`.

## 7. Pointers

- `src/pages/not-found/ui/moved-song.tsx`, `src/pages/not-found/ui/not-found-page.tsx`, `apps/vova/app/not-found.tsx`.
- `apps/*/tsconfig.json` `include` — the `"../../*.d.ts"` entry the narrowing offer is about.
- Local check recipe: `pnpm build:vova && npx serve apps/vova/out`.
- This session's transcript: https://claude.ai/code/session_01EVRRqSj65sDvBmZYXzF9yA. Predecessor: https://claude.ai/code/session_019cMfo68uBV7EbXApG3AYt2.

## 8. Next step

Wait for the operator. Two questions are open, both asked in Russian in the session:

1. Approve the silent fallback in `MovedSong` (a failed `HEAD` probe shows the ordinary 404)? Recommended yes.
2. Narrow `"../../*.d.ts"` to `"../../css.d.ts"` in the four apps' tsconfigs, so a stray root `next-env.d.ts` cannot leak the compat `usePathname` typing? Also whether his `grep` found the compat line.

Then `finalize` (or `finalize and merge`) when he says so.
