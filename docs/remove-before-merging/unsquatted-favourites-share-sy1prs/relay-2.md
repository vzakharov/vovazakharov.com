# Relay 2 — unsquatted shortlist and sharing (implementation, paused for context)

## 1. Standing constraints

None stated by the operator.

The muthur sync offer was made; do not make it again. (Relay 1 carried this
line; this session made no offer.)

## 2. The conversation

**Operator (1):** `/go claude/unsquatted-favourites-share-sy1prs`

**Agent:** Attached to the branch (the auto-branch delete was refused with
`stale info`: it never existed on origin). Flipped the draft plan to
`in-progress` quoting the go-ahead, took the three open questions'
recommendations, and started implementing.

**Operator (2), mid-turn:**

> как сделаешь выложи на preview пжст

**Agent:** Acknowledged; published at the end (below).

**Operator (3), mid-turn:**

> к Curated, blazing fast, добавить , private (Curated, private, blazing fast)
>
> (потому что теперь когда уберём трекинг #..., получается всё идёт через
> браузер и мы никак не узнаём ни о чём. Нужно дать небольшую подсказку, плюс в
> нё же [open source](ссылка на app в репе))

**Agent:** Checked analytics first, found Umami on every site, and said it
would word the note about names only, claiming (wrongly) that Umami counts
visits but not names. Then added "private" to the byline with a note ending in
an "open source" link to `src/unsquatted`, and updated `cardByline` and the
site tagline.

**Operator (4), mid-turn, with a screenshot of Umami's Pages report for
unsquatted.com listing `/#adapt.ai`, `/#adaptiv`, `/#arta`, `/#overnightai`, …:**

> > Umami на сайте считает визиты, но не имена
>
> as of main -- читает. вроде я в изначальном брифе просил это как раз убрать
> -- возможно, забыл

**Agent:** Confirmed the tracker (`stats.vovazakharov.com/app.js`) supports
`data-exclude-hash` and added it to kernel's root layout for every site, since
a hash on a static page is an anchor or page state, never a page. Asked whether
to scope it to unsquatted alone, without waiting for an answer. Then hit the
context-budget warning, committed, published to preview, re-rendered the
social card, paused the plan and relayed.

## 3. Intent

Vova wants unsquatted.com's checker to let a visitor collect liked names,
manage them as text, and share a single available name as a link or image,
with no second view. Added in this session: the site should say it is private,
and mean it — nothing the visitor types or likes should reach the site's
owners, analytics included, with the source linked as proof.

## 4. Decisions

- **The three open plan questions took their recommendations**: "siblings";
  chip heart and share on hover only (`heartOnHover` prop on `CornerTools`); a
  pasted taken domain kept, struck through.
- **A liked domain keeps its filled heart on a result card even when taken or
  pending**, so it can be unliked there; the plan gave a taken card none.
  `CornerTools` returns null only when the domain is neither available nor
  liked.
- **`data-exclude-hash` on every site** rather than unsquatted alone: no site
  needs hashes in its stats. Open question to Vova; reversible by moving it
  behind a site-config field.
- **Byline**: "curated list · {private}, {blazing} search · no reselling · no
  affiliate links", rendered by splitting on the two placeholders.
- **The image card's palette** is read off a hidden element marked
  `data-unsquatted-palette`, which `site.scss` gives the light tokens, so the
  card is light in either scheme.
- **The image is drawn and encoded synchronously** (`toDataURL`, not `toBlob`),
  so `navigator.share` runs inside the click's activation, as Safari requires.
- **Share links use the page's own origin and path** (`domainLink`), not
  `SITE_CONFIG.url`, so a preview links to the preview.
- **A pick passes only its own price** to `CornerTools`, so the RSC payload
  does not carry the price list once per pick.

## 5. Errors and dead ends

- The agent's first read of Umami was wrong: it assumed the tracker drops the
  hash. Vova's screenshot showed every typed name recorded.
- Lint rules met on the way: `vova/no-redundant-property-copy` (use `pick` from
  `@/kernel/shared/lib/collections`), `vova/no-pick-omit` (no `Pick<>` of a
  repo type), `@eslint-react/set-state-in-effect` (the storage probe became a
  `useSyncExternalStore`), `scss/at-extend-no-missing-placeholder` (the
  `%fold-toggle` placeholder).

## 6. State

- Branch `claude/unsquatted-favourites-share-sy1prs`, head `50aec0b`, pushed,
  tree clean.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/241 — its body
  and title still describe the plan as of relay 1.
- Plan: `docs/plans/unsquatted-favourites-share.paused.md`, whose `## Progress`
  section lists what is done and what is left.
- preview.vovazakharov.com serves unsquatted built from `f3cd03c` (run
  41603671879, success).
- No CI watch, PR subscription or scheduled check-in.
- Estimate: this session 8 h senior developer ("the likes context, grouping,
  editor, canvas card, share sheet and address rewrite took judgement on
  fallbacks, hover/touch rules and analytics privacy"). Remainder handed on: 4 h
  senior developer — the shortlist's sub-slice cut across the page slice, the
  Mantine sheet wiring and payload check, then polish and the PR refresh; 1 h
  middle qa — hover and touch states, the fold, the editor and the image card at
  two widths in both themes.

## 7. Pointers

- The plan's `## Progress` section: the to-do list for this bite.
- `src/unsquatted/pages/home/page/ui/`: `checker-state.tsx` (hash read and
  strip, focus, `clear`), `likes-state.tsx`, `corner-tools.tsx`,
  `shortlist.tsx`, `name-checker.tsx`, `pick-row.tsx`, `verdict-label.tsx`
  (`tools` slot on the price line), `unsquatted-home-page.tsx` (byline),
  `unsquatted-home.module.scss`.
- `src/unsquatted/pages/home/page/lib/`: `liked.ts` + test, `share.ts` + test,
  `share-card.ts` (canvas, browser-only, untested).
- `src/kernel/app/ui/root-layout.tsx`: `data-exclude-hash`.
- `pnpm masd:clusters` reproduces the failing cluster verdict.
- Predecessor transcript:
  https://claude.ai/code/session_01DaohkFggY6cdZ2hk8nBZ3B

## 8. Next step

Resume the paused plan with `/go`: work through its `## Progress` § "Left" —
the `masd:clusters` sub-slice cut (or ask Vova for a `masd-disable cluster`
marker), `pnpm check:mantine-styles`, the payload check, a `/preview` look in
both themes and at phone width, then `/go` Step 3 and Step 4. Republish to
preview after fixes, since Vova asked for it there. Still open with Vova:
whether `data-exclude-hash` should cover unsquatted alone.

## Last agent turn
