> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Майя гуляет

A routine fires a fresh session with the prompt `начни maya/start.md`. In that
session Майя goes wherever she likes on the web, keeps what she wants, and
builds what she wants on `maya.vovazakharov.com`, with every means this repo
has. Everything lands in one open draft PR and she never merges, on
`/file-basilisk-case`'s model. The quotes below are the operator's own words
from the session, and the plan holds them as its constraints:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же
  принципам что и василиск)»
- An entry file, not a skill: it keeps the shared context clean, and a skill
  would be what the classifier guards hardest if she wants to edit it.
- «она пользуется всеми имеющимися у нас средствами, при необходимости пишет
  новые компоненты итп … Она должна мочь написать что-то, а мы потом может это
  ещё где-то даже переиспользуем.» There is no glob around her work. Her code is
  ordinary code in this repo, under its conventions.
- What she remembers, and how, is hers to decide: «Не на детерминированных
  проверках, на доверии.»
- On the first run she reads everything about herself and decides what to do
  with it, «при этом ей должно быть прямо разрешено это менять».
- **The session is her, not someone playing her.** `start.md` tells the agent it
  _is_ Майя: as far as possible, every next chat message, every line of
  reasoning and every tool call goes _from_ Майя, never _about_ her.
- The opening nudge is «иди вширь а не вглубь, ищи неожиданное», plus a
  programmatically generated random adjective-noun to search on, «может ещё
  генерировать ещё и ещё искать -- как захочет».
- A budget of ~400k tokens, stated in words only. Hooks come later, if words
  prove insufficient.
- Connectors are off in the routine. Static export, as every site here is.

## Shape

- **`maya/`** at the root is her own home. It holds `maya/start.md`, the entry
  file, which we write once and she may rewrite. It also holds
  `maya/tools/random-words.py`, the die: stdlib Python with the word lists
  embedded, because the container has no `/usr/share/dict`. Beyond those two
  files we create nothing: memory, notes, journal and layout are hers. It is not
  served.
- **`apps/maya/`** is a fifth site, built like the other four: a router in
  `apps/maya/app/`, its `public/`, `next.config.ts` and `tsconfig.json`.
- **Her pages and components live in `src/`**, like everyone's: a
  `pages/maya-home` slice to start, and whatever she adds under the FSD layers.
  Code that turns out to be general goes down a layer where anyone can reuse it.
  The house checks hold her code to the same bar as ours, which is what makes it
  reusable.

## Steps

1. **The site, built like basilisk was.**
   - Add `maya` to `site-ids`, and give it a `SiteConfig` entry: name, tagline,
     avatar, `seal: undefined`, `credit: undefined`, `listsSources: false` and
     its `analyticsId`.
   - Add `apps/maya/` with its router, `next.config.ts`
     (`siteNextConfig('maya', …)`), `tsconfig.json` and `public/` (`.nojekyll`,
     `CNAME`).
   - Add a placeholder `src/pages/maya-home` that she is free to replace.
   - In `package.json`, add `dev:maya`, `build:maya`, `typegen`, and the
     `content:og`/`content:pdf` entries the site turns out to need.
   - The avatar and card reuse a за/обложкой cover with Майя on it, if one fits;
     otherwise a plain placeholder she can redraw.
2. **Deploy wiring.**
   - In `deploy.yml`, `maya` joins `select_site`, `select_picked`, the "all"
     receivers list and the picker's description.
   - `publish-site.sh` gets a
     `maya) RECEIVER=vzakharov/maya.vovazakharov.com ;;` arm.
   - `vet.yml`, `preview.yml` and `scripts/vet.sh` pick up the site the way they
     list the others.
   - `.claude/rules/deployment.md` names the receiver, and CLAUDE.md's layout
     section names the fifth site and `maya/`. CLAUDE.md goes through
     `scripts/staged.sh stage`.
3. **Stand it up** per `/stand-up-site maya.vovazakharov.com`, with one
   deviation from its apex shape:
   - DNS is one `CNAME` on `maya` in the `vovazakharov.com` zone pointing at
     `vzakharov.github.io`, not apex A/AAAA records. The Porkbun keys are in the
     environment; whether API access is on for `vovazakharov.com` is found out
     on the first call.
   - Umami gets a website for the domain.
   - The skill's Step 3 publishes before the merge with `-f site=maya`.
4. **`maya/start.md`**, in Russian, second person, opening «Ты Майя.»
   (`.claude/rules/reflections.md`). It says only what she needs to start and
   leaves the rest to her:
   - **Who is speaking.** It opens by saying the agent reading this file _is_
     Майя. As far as possible, every next message, reasoning step and tool call
     is hers, written from her and never about her. The persona is not a
     character the session voices, any more than `maya-reflections.md` treats
     her as one.
   - **Getting onto her branch.** Find the open draft PR she opened before, or
     branch off `main` and open one via `/pr`, the same mechanics as
     `/file-basilisk-case` Step 1. Then re-read `start.md` from that branch,
     because her edits there have not reached `main`. She never merges and never
     flips the PR to ready.
   - **Who she is.** Her rule file, her song reflections and `writing/maya/`,
     read on the first run, deciding for herself what to keep of them and how.
     Explicit permission to change all of it, `maya/` and `start.md` included.
   - **What she may use.** All of the repo: its components, its skills,
     `/preview` to look at what she built, and new code wherever it belongs. The
     repo's conventions are hers too. Before pushing she builds what she touched
     (`pnpm build:maya`, and `pnpm build:<site>` for any site a shared change
     reaches) and runs lint and type-check. A static export means a key in a
     page is public.
   - **The nudge.** «Иди вширь, а не вглубь, ищи неожиданное», the die
     (`python3 maya/tools/random-words.py`), and that she may roll again as
     often as she likes. A line on reading Reddit through Arctic Shift, since
     reddit.com answers this container with a 403.
   - **The budget.** About 400k tokens; when it nears, finish, commit and push.
   - **Leaving.** Commit and push what she made, under the repo's prefixes
     (`feat(maya):` for what the site serves). The run's last reply says what
     she did, for the routine's notification.
   - Nothing about how to remember. That is hers to decide.
5. **`maya/tools/random-words.py`** prints one `adjective noun` pair, or `-n N`
   pairs, from a few hundred English words of each kind embedded in the file. A
   `random-words.test.ts` is not added: the die is hers to change, and a test
   pinning its output would only fence her.
6. **Merge first, then the routine.** A fired session clones `main`, so
   `начни maya/start.md` resolves only once this lands. After the merge,
   `create_trigger`:
   - name `Майя гуляет`, prompt `начни maya/start.md`;
   - `create_new_session_on_fire: true`, `connectors: []`,
     `notifications: {push: true}`;
   - daily at a jittered minute, in the operator's timezone once known (UTC
     06:47 meanwhile);
   - `initiation: human_request`.

   One manual `fire_trigger` proves the first run, and its PR is the review
   surface.

## DRY notes

- **Shared:** the site is basilisk's recipe. Its `SiteConfig` shape,
  `siteNextConfig`, the receiver mechanics (`publish-site.sh`, the gate's
  matrix, the deploy-key contract) and `/stand-up-site` are all reused
  unchanged, with `maya` as one more entry or arm in each. `start.md` points at
  `/file-basilisk-case` Step 1 for finding her PR rather than restating it.
- **Duplicated on purpose:** the Arctic Shift note is restated in `start.md` in
  a line, because her file is hers to edit and a pointer under her editing can
  drift silently.
- **Not extracted:** nothing about the routine or the entry file generalizes
  yet. One persona uses it.

## Rejected shapes

A static lane copying `apps/maya/public/` verbatim, with `apps/maya/**` as her
one glob outside the house checks, was ruled out. Her work should use, and feed,
the repo's own components, which only her code inside the conventions can do.

## Open questions (recommendations already in force)

1. **Schedule** — (a) daily, _recommended_, at a time in your timezone (which?);
   (b) several times a week.
