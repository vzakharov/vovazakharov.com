> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Майя гуляет

A routine fires a fresh session with the prompt `начни apps/maya/start.md`. Майя
goes wherever she likes on the web, keeps what she wants, and builds what she
wants on `maya.vovazakharov.com`. All of it lands in one open draft PR and she
never merges, on `/file-basilisk-case`'s model. The operator's own words are the
brief. The quotes below are from the session, and the plan holds them as its
constraints:

- «она не будет мерджить, она будет совать в свободный или новый пиар (по тем же
  принципам что и василиск)»
- An entry file, not a skill: it keeps the shared context clean, and a skill
  would be what the classifier guards hardest if she wants to edit it.
- «Дать ей глоб, в пределах которого она может творить что хочет … Не на
  детерминированных проверках, на доверии.»
- On the first run she reads everything about herself and decides what to do
  with it, «при этом ей должно быть прямо разрешено это менять».
- The opening nudge is «иди вширь а не вглубь, ищи неожиданное», plus a
  programmatically generated random adjective-noun to search on, «может ещё
  генерировать ещё и ещё искать -- как захочет».
- A budget of ~400k tokens, stated in words only. Hooks come later, if words
  prove insufficient.
- Connectors are off in the routine. Static apps only for now.

## Her glob: `apps/maya/**`

The one directory is hers. It holds:

- `apps/maya/start.md`, the entry file. We write it once; she may rewrite it.
- `apps/maya/public/`, served verbatim at `maya.vovazakharov.com`.
- `apps/maya/tools/random-words.py`, the die. It is stdlib Python with the word
  lists embedded, because the container has no `/usr/share/dict`. She may change
  it.
- Everything else under `apps/maya/` is hers to shape: memory, notes, journal,
  layout. We create none of it.

Outside the glob, `start.md` names what she may also change, because it is
already hers: `.claude/rules/maya-reflections.md`, every
`*.maya.reflections.md`, and `writing/maya/**`.

**Recommendation: a static lane, not a Next site.** `pnpm build:maya` copies
`apps/maya/public/` to `apps/maya/out/` and nothing more. There is no `app/`
router, no `src/` slice and no `SiteConfig` entry, so FSD, the type gates and
the house lint never touch her pages. The alternative was a Next shell with her
pages under `src/pages/maya-*`. It would hold her to Steiger, `type-overlap` and
Mantine, which is the deterministic fence the operator ruled out, and every app
she builds would become a React page. A Next shell with her files in `public/`
was also ruled out: it is the static lane plus a router that serves nothing of
hers.

## Steps

1. **The static lane.**
   - `package.json`: `build:maya` is the copy, run through `scripts/in-site.sh`
     like its siblings if that script tolerates a site with no Next config,
     otherwise as a plain `cp`. It joins the aggregate `build`, but not
     `typegen` and not the `content:*` scripts.
   - `apps/maya/public/` gets `.nojekyll` and `CNAME` (`maya.vovazakharov.com`),
     plus a placeholder `index.html` she is free to throw away.
2. **Keep the house checks off her directory.**
   - `apps/maya/**` goes into `.prettierignore`, eslint's ignores, stylelint's
     ignores and knip's ignores, each with a comment naming the invariant:
     _Майя's own directory, held on trust rather than by the house style (the
     operator's call)_.
   - These are directory ignores, not suppression comments, and this paragraph
     records the operator's confirmation.
   - `scripts/vet.sh` builds `maya` like any site. A broken copy is the one
     failure worth catching.
3. **Deploy wiring.**
   - In `deploy.yml`, `maya` joins `select_site`, `select_picked`, the "all"
     receivers list and the picker's description.
   - The `render-pdfs` step is skipped for `maya`, after checking what the
     action does with a site that has no pages.
   - `publish-site.sh` gets a
     `maya) RECEIVER=vzakharov/maya.vovazakharov.com ;;` arm.
   - `.github/workflows/vet.yml` and `preview.yml` get whatever site lists they
     carry.
   - `.claude/rules/deployment.md` and the CLAUDE.md layout line name the fifth
     site. CLAUDE.md goes through `scripts/staged.sh stage`.
4. **Stand it up** per `/stand-up-site maya.vovazakharov.com`, with two
   deviations from its apex shape:
   - DNS is one `CNAME` on `maya` in the `vovazakharov.com` zone pointing at
     `vzakharov.github.io`, not apex A/AAAA records. The Porkbun keys are in the
     environment; whether API access is on for `vovazakharov.com` is found out
     on the first call.
   - Umami gets a website for the domain. Its id goes into `start.md` with the
     snippet, hers to use or not, since there is no `SiteConfig` to require it.
   - Step 3 of that skill publishes before the merge with `-f site=maya`.
5. **`apps/maya/start.md`**, in Russian, second person, opening «Ты Майя.»
   (`.claude/rules/reflections.md`). It says only what she needs to start and
   leaves the rest to her:
   - **Getting onto her branch.** Find the open draft PR touching `apps/maya/`
     and check it out, or branch off `main` and open one via `/pr`, the same
     mechanics as `/file-basilisk-case` Step 1. Then re-read `start.md` from
     that branch, because her edits there have not reached `main`. She never
     merges and never flips the PR to ready.
   - **Who she is.** Her rule file, her song reflections and `writing/maya/`,
     read on the first run, deciding for herself what to keep of them and how.
     Explicit permission to change all of it, and `start.md` itself.
   - **The glob.** What is hers and what is served. Static only; any key in a
     page is public.
   - **The nudge.** «Иди вширь, а не вглубь, ищи неожиданное», the die
     (`python3 apps/maya/tools/random-words.py`), and that she may roll again as
     often as she likes. The Reddit-through-Arctic-Shift note, since reddit.com
     answers this container with a 403.
   - **The budget.** About 400k tokens; when it nears, finish, commit and push.
   - **Leaving.** Commit and push what she made, `feat(maya):` for anything
     served and `content(maya):` for the rest. The run's last reply says what
     she did, for the routine's notification.
   - Nothing about how to remember. That is hers to decide.
6. **`apps/maya/tools/random-words.py`**: prints one `adjective noun` pair, or
   `-n N` pairs. A few hundred words of each kind, English, embedded. No test:
   it is hers, and a test would be exactly the deterministic fence.
7. **Merge first, then the routine.** A fired session clones `main`, so
   `начни apps/maya/start.md` resolves only once this lands. After the merge,
   `create_trigger`:
   - name `Майя гуляет`, prompt `начни apps/maya/start.md`;
   - `create_new_session_on_fire: true`, `connectors: []`,
     `notifications: {push: true}`;
   - daily at a jittered minute (`CRON_TZ` of the operator's zone once known,
     UTC 06:47 meanwhile);
   - `initiation: human_request`.

   One manual `fire_trigger` proves the first run, and its PR is the review
   surface.

## DRY notes

- **Shared:** the receiver mechanics (`publish-site.sh`, the gate's matrix, the
  deploy-key contract) are reused unchanged; `maya` is one more arm in each.
  `/stand-up-site` is followed, not copied. `/file-basilisk-case` Step 1's
  PR-finding is pointed at by `start.md` rather than restated, because it lives
  in a skill she can read.
- **Duplicated on purpose:** the Arctic Shift note is restated in `start.md` in
  a line. Her file is hers to edit, and a pointer into a skill she would then
  follow is a pointer that can drift silently under her.
- **Not extracted:** a generic "static lane" abstraction for sites. One site
  uses it, and the lane is a single `cp`.

## Open questions (recommendations already in force)

1. **Her directory** — (a) `apps/maya/**`, everything hers in one glob,
   _recommended_; (b) private home at the root `maya/`, served files in
   `apps/maya/public/`.
2. **Site shape** — (a) the static lane, _recommended_; (b) a Next shell.
3. **Schedule** — (a) daily, _recommended_, at a time in your timezone (which?);
   (b) several times a week.
