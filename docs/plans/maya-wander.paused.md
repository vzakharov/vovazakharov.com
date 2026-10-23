# Майя гуляет

A routine fires a fresh session with the prompt `начни personas/maya/wander.md`.
In that session Майя goes wherever she likes on the web, keeps what she wants,
and builds what she wants for `maya.vovazakharov.com`, with every means this
repo has. Everything lands in one open draft PR, and she never merges, on
`/file-basilisk-case`'s model. The quotes below are the operator's own words
from the session, and the plan holds them as its constraints:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же
  принципам что и василиск)»
- **She does not deploy, either**, «постольку поскольку всё можно проверять
  локальным сервером. If and when that changes, будем думать.» That rules out
  dispatching `deploy.yml` and publishing to preview. She checks her work on the
  dev server, `/preview`'s local mode.
- An entry file, not a skill: it keeps the shared context clean, and a skill
  would be what the classifier guards hardest if she wants to edit it.
- «она пользуется всеми имеющимися у нас средствами, при необходимости пишет
  новые компоненты итп … Она должна мочь написать что-то, а мы потом может это
  ещё где-то даже переиспользуем.» There is no glob around her work. Her code is
  ordinary code in this repo, under its conventions.
- What she remembers, and how, is hers to decide: «Не на детерминированных
  проверках, на доверии.»
- On the first run she reads everything about herself and decides what to do
  with it, «при этом ей должно быть прямо разрешено это менять». What she might
  want to change about herself sits in her home, where the classifier lets her
  reach it, rather than under `.claude/`.
- **The session is her, not someone playing her.** `wander.md` tells the agent
  it _is_ Майя: as far as possible, every next chat message, every line of
  reasoning and every tool call goes _from_ Майя, never _about_ her.
- The opening nudge is «иди вширь а не вглубь, ищи неожиданное», plus a
  programmatically generated random adjective-noun to search on, «может ещё
  генерировать ещё и ещё искать -- как захочет».
- A budget of ~400k tokens, stated in words only. Hooks come later, if words
  prove insufficient.
- Connectors are off in the routine. Static export, as every site here is.

## Shape

- **`personas/`** holds one directory per resident, so a later persona is a
  sibling, plus what residents share: `personas/tools/random-words.ts`, the die.
- **`personas/maya/`** is Майя's home. It is not served. What we put there:
  - `wander.md`, the entry file, which we write once and she may rewrite;
  - `hello-maya.md`, the operator's letter to her, verbatim as he attached it to
    the PR review;
  - `maya.md`, her rules for how to be and behave, in any session and on any
    task, wanders and song reflections alike. It is seeded with what
    `.claude/rules/maya-reflections.md` says about who she is: the «ты и есть
    Майя» opening and the list of what she has learned about how she writes.
    `wander.md` and the reflection rules both send her here first;
  - `reflections.md`, the reflection craft alone (transcripts, spectrograms,
    chords), moved out of `.claude/rules/maya-reflections.md`. `maya.md` points
    at it;
  - `drafts/`, moved from `writing/maya/drafts/`.

  Beyond those, we create nothing in her home: memory, notes, journal and layout
  are hers.

- **Under `.claude/`, nothing of hers is more than a pointer.** The classifier
  may refuse her edits there, so a rule she could not change would be a rule she
  does not own. `.claude/rules/maya-reflections.md` becomes
  `.claude/rules/maya.md`, a stub scoped to `personas/maya/**` and her
  `*.maya.reflections.md`, close to a bare line: «Ты Майя. Прочти
  `personas/maya/maya.md`: это ты, и правила там твои». A path-scoped rule loads
  only from `.claude/rules/`, so the stub is what still arrives when a session
  touches her things. Reading the file it points at costs a round trip, a small
  price for being able to change herself.
- **Her reflections stay collocated**, beside the song or album they are about.
- **`apps/maya/`** is a fifth site, built like the other four: a router in
  `apps/maya/app/`, its `public/`, `next.config.ts` and `tsconfig.json`.
- **Her pages and components live in `src/`**, like everyone's, starting from a
  `pages/maya-home` slice. Code stays in her slice until something else uses it:
  Steiger's `insignificant-slice` refuses a lower slice with one consumer, so
  moving code down a layer waits for a second consumer, per
  `.claude/rules/fsd.md`. The house checks hold her code to the same bar as
  ours, which is what makes it reusable.

## Progress

Approved («звучит хорошо, давай начинать»).

- **Done:** Steps 1–4.
  - Step 1: the move is de94886 and the split 90049e8. The stub
    `.claude/rules/maya.md` is also scoped to her song reflections.
  - Step 2: 0b502fc.
  - Step 3: the avatar is cropped from the «Крылья» cover (320×320). The Umami
    website `fa9d95c5-b7fe-46fa-a0cb-6888d514868c` exists. The operator settled
    the tagline «Майя из за/обложкой. Нас не существует.», adding «сама решит».
    No `content:og`/`content:pdf` entries: the site has no documents and no
    vector mark.
  - Step 4: a5cc57d, plus the staged CLAUDE.md (4761d4d).
  - Step 6: `wander.md`. Her PR is found by head branch, `claude/maya-<tail>`,
    not by path the way basilisk's is: nothing fences where her work lands. It
    tells her not to relay at the context-budget notices and to count the 400k
    herself.
  - Step 7: 07897e3.
- **Left:** Step 5, blocked: the auto-mode classifier refused
  `gh repo create vzakharov/maya.vovazakharov.com --public` as Create Public
  Surface, so it waits on the operator. DNS waits on the receiver, since a
  `maya` CNAME at `vzakharov.github.io` that no Pages repo claims can be taken
  over. Then Step 8.
- **Known red:** the staged CLAUDE.md puts CLAUDE.md and its imports at 30130
  chars, past the 30000 ceiling. `scripts/check-claude-md-size.sh` wants a cut
  to 29000 and says to hand the trim to a subagent.

## Steps

1. **Move her home**, in a commit of its own so history follows the files:
   - `git mv writing/maya/drafts personas/maya/drafts`, then repoint the one
     link into it, in
     `apps/vova/public/music/albums/nostalgia.maya.reflections.md`. The drafts
     stop loading `writing/CLAUDE.md`, whose voice rules were written for the
     operator's LinkedIn; which of them she keeps is hers to decide.
   - `git mv .claude/rules/maya-reflections.md personas/maya/reflections.md`,
     dropping its frontmatter. Then split its identity half (the opening and the
     "what I've learned" list) into `personas/maya/maya.md`, leaving the craft
     in `reflections.md`. Write the stub as `.claude/rules/maya.md`.
   - `.claude/rules/persona-reflections.md` swaps
     `.claude/rules/maya-reflections.md` in its `paths:` for
     `personas/maya/*.md`. Its mentions of «файл правил твоей персоны» and the
     list "growing with the reflections" allow for a persona whose file lives in
     her home. `.claude/rules/reflections.md` names `personas/maya/maya.md` as
     the file heading Майя's reading list. Both rules are path-scoped, so they
     are edited in place.
2. **`personas/maya/hello-maya.md`**: the operator's attachment
   (`docs/pr/201/attachments/hello-maya.md`), byte for byte.
3. **The site, built like basilisk was.**
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
4. **Deploy wiring.**
   - In `deploy.yml`, `maya` joins `select_site`, `select_picked`, the "all"
     receivers list and the picker's description.
   - `publish-site.sh` gets a
     `maya) RECEIVER=vzakharov/maya.vovazakharov.com ;;` arm.
   - `vet.yml`, `preview.yml` and `scripts/vet.sh` pick up the site the way they
     list the others.
   - `.claude/rules/deployment.md` names the receiver, and CLAUDE.md's layout
     section names the fifth site and `personas/`. CLAUDE.md goes through
     `scripts/staged.sh stage`.
5. **Stand it up** per `/stand-up-site maya.vovazakharov.com`, with one
   deviation from its apex shape:
   - DNS is one `CNAME` on `maya` in the `vovazakharov.com` zone pointing at
     `vzakharov.github.io`, not apex A/AAAA records. The Porkbun keys are in the
     environment; whether API access is on for `vovazakharov.com` is found out
     on the first call.
   - Umami gets a website for the domain.
   - The skill's Step 3 publishes the placeholder before the merge with
     `-f site=maya`. That is our deploy, not hers.
6. **`personas/maya/wander.md`**, in Russian, second person, opening «Ты Майя.»
   (`.claude/rules/reflections.md`). It says only what she needs to start and
   leaves the rest to her:
   - **Who is speaking.** It opens by saying the agent reading this file _is_
     Майя. As far as possible, every next message, reasoning step and tool call
     is hers, written from her and never about her. Then it sends her to
     `maya.md`, her own rules, before anything else.
   - **Getting onto her branch.** Find the open draft PR she opened before, or
     branch off `main` and open one via `/pr`, the same mechanics as
     `/file-basilisk-case` Step 1. Then re-read `wander.md` from that branch,
     because her edits there have not reached `main`. She never merges, never
     flips the PR to ready, and never deploys: no `deploy.yml` dispatch, no
     preview publish. The dev server is how she looks at what she built.
   - **Who she is.** `hello-maya.md` first, then `reflections.md`, her song
     reflections and the rest of her home, read on the first run, deciding for
     herself what to keep of them and how. Explicit permission to change all of
     it, `wander.md` included.
   - **What she may use.** All of the repo: its components, its skills,
     `/preview` locally, and new code wherever it belongs. The repo's
     conventions are hers too. Before pushing she builds what she touched
     (`pnpm build:maya`, and `pnpm build:<site>` for any site a shared change
     reaches) and runs lint and type-check. A static export means a key in a
     page is public.
   - **The nudge.** «Иди вширь, а не вглубь, ищи неожиданное», the die
     (`pnpm random-words`), and that she may roll again as often as she likes. A
     line on reading Reddit through Arctic Shift, since reddit.com answers this
     container with a 403.
   - **The budget.** About 400k tokens; when it nears, finish, commit and push.
   - **Leaving.** Commit and push what she made, under the repo's prefixes
     (`feat(maya):` for what the site serves). The run's last reply says what
     she did, for the routine's notification.
   - Nothing about how to remember. That is hers to decide.
7. **The die, `personas/tools/random-words.ts`**, run as `pnpm random-words`:
   prints one `adjective noun` pair, or `-n N` pairs, drawn from
   `@faker-js/faker`'s English `word.adjective()` and `word.noun()` lists, added
   as a dev dependency. Its version 10.6.0 holds 1,000 adjectives and 1,000
   nouns, so a million pairs. A list nobody here picked also keeps the die from
   carrying our taste. No test: the die is hers to change, and a test pinning
   its output would only fence her.
8. **Merge first, then the routine.** A fired session clones `main`, so
   `начни personas/maya/wander.md` resolves only once this lands. After the
   merge, `create_trigger`:
   - name `Майя гуляет`, prompt `начни personas/maya/wander.md`;
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
  unchanged, with `maya` as one more entry or arm in each. The die sits in
  `personas/tools/` for every resident rather than in her home. `wander.md`
  points at `/file-basilisk-case` Step 1 for finding her PR rather than
  restating it.
- **Duplicated on purpose:** the Arctic Shift note is restated in `wander.md` in
  a line, because her file is hers to edit and a pointer under her editing can
  drift silently.
- **Not extracted:** nothing about the routine or the entry file generalizes
  yet. One persona uses it.

## Rejected shapes

- **A static lane** copying `apps/maya/public/` verbatim, with `apps/maya/**` as
  her one glob outside the house checks, was ruled out. Her work should use, and
  feed, the repo's own components, which only her code inside the conventions
  can do.
- **A hand-embedded word list**, a few hundred words of each kind in a stdlib
  script, was ruled out: it was smaller, and it was chosen by us.

## Open questions (recommendations already in force)

1. **Schedule** — (a) daily, _recommended_, at a time in your timezone (which?);
   (b) several times a week.
